// app/landlord/add-property.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  COLOR_SCHEME,
  PROPERTY_TYPES,
  PROPERTY_FEATURES,
  PropertyType,
  PropertyFeature,
} from "@/constants";
import usePropertyStore from "@/hooks/usePropertyStore";
import * as ImagePicker from "expo-image-picker";

export default function AddPropertyScreen() {
  const router = useRouter();
  const { isLoading, createProperty, uploadPropertyImages } =
    usePropertyStore();

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [propertyType, setPropertyType] = useState<PropertyType | null>(null);
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [size, setSize] = useState("");
  const [price, setPrice] = useState("");
  const [street, setStreet] = useState("");
  const [area, setArea] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [selectedFeatures, setSelectedFeatures] = useState<PropertyFeature[]>(
    []
  );
  const [images, setImages] = useState<any[]>([]);

  // Form validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Handle selecting property type
  const handleSelectPropertyType = (type: PropertyType) => {
    setPropertyType(type);
    // Clear the error when a selection is made
    if (errors.propertyType) {
      setErrors({ ...errors, propertyType: "" });
    }
  };

  // Handle toggling features
  const handleToggleFeature = (feature: PropertyFeature) => {
    if (selectedFeatures.includes(feature)) {
      setSelectedFeatures(selectedFeatures.filter((f) => f !== feature));
    } else {
      setSelectedFeatures([...selectedFeatures, feature]);
    }
  };

  // Handle picking images
  const handlePickImages = async () => {
    let permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        "Permission Required",
        "You need to grant permission to access your photos."
      );
      return;
    }

    let pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
    });

    if (!pickerResult.canceled) {
      const remainingSlots = 10 - images.length;
      const selected = pickerResult.assets.slice(0, remainingSlots);

      const newImages = selected.map((asset) => ({
        uri: asset.uri,
        type: asset.type ?? "image/jpeg",
        fileName: asset.fileName ?? asset.uri.split("/").pop(),
      }));

      setImages((prev) => [...prev, ...newImages]);

      // Clear the error when images are added
      if (errors.images) {
        setErrors({ ...errors, images: "" });
      }
    }
  };

  // Handle removing an image
  const handleRemoveImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) newErrors.title = "Title is required";
    if (!description.trim()) newErrors.description = "Description is required";
    if (!propertyType) newErrors.propertyType = "Property type is required";
    if (!bedrooms.trim() || isNaN(Number(bedrooms)) || Number(bedrooms) <= 0)
      newErrors.bedrooms = "Enter a valid number of bedrooms";
    if (!bathrooms.trim() || isNaN(Number(bathrooms)) || Number(bathrooms) <= 0)
      newErrors.bathrooms = "Enter a valid number of bathrooms";

    if (!size.trim() || isNaN(Number(size)) || Number(size) <= 0)
      newErrors.size = "Enter a valid size";
    if (!price.trim() || isNaN(Number(price)) || Number(price) <= 0)
      newErrors.price = "Enter a valid price";
    if (!street.trim()) newErrors.street = "Street address is required";
    if (!area.trim()) newErrors.area = "Area is required";
    if (!city.trim()) newErrors.city = "City is required";
    if (!state.trim()) newErrors.state = "State is required";
    if (images.length === 0)
      newErrors.images = "At least one image is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      // Scroll to the first error
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    try {
      // Create the property
      const propertyData = {
        title,
        description,
        propertyType: propertyType as PropertyType,
        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms),
        size: Number(size),
        features: selectedFeatures,
        address: {
          street,
          area,
          city,
          state,
          location: {
            type: "Point" as const,
            coordinates: [0, 0] as [number, number], // This would normally come from a map selector
          },
        },
        price: {
          amount: Number(price),
          currency: "NGN",
          paymentFrequency: "monthly",
        },
      };

      for (const k of [
        "bedrooms",
        "bathrooms",
        "size",
        "price.amount",
      ] as const) {
        // @ts-ignore – simple runtime guard
        if (isNaN(propertyData[k])) throw new Error("Invalid numeric field");
      }

      const newProperty = await createProperty(propertyData);

      // Upload images if any were selected
      if (images.length > 0) {
        await uploadPropertyImages(newProperty._id, images);
      }

      // Navigate back to properties list
      Alert.alert("Success", "Property added successfully", [
        {
          text: "OK",
          onPress: () => router.replace("/landlord"),
        },
      ]);
    } catch (error) {
      console.error("Error creating property:", error);
      Alert.alert("Error", "Failed to create property. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={COLOR_SCHEME.DARK} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add New Property</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Basic Information</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Property Title*</Text>
              <TextInput
                style={[styles.input, errors.title && styles.inputError]}
                placeholder="e.g. Spacious 3-Bedroom Apartment in Lekki"
                value={title}
                onChangeText={(text) => {
                  setTitle(text);
                  if (errors.title) setErrors({ ...errors, title: "" });
                }}
              />
              {errors.title && (
                <Text style={styles.errorText}>{errors.title}</Text>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Description*</Text>
              <TextInput
                style={[
                  styles.textArea,
                  errors.description && styles.inputError,
                ]}
                placeholder="Describe your property in detail..."
                // app/landlord/add-property.tsx (continuing)
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={description}
                onChangeText={(text) => {
                  setDescription(text);
                  if (errors.description)
                    setErrors({ ...errors, description: "" });
                }}
              />
              {errors.description && (
                <Text style={styles.errorText}>{errors.description}</Text>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Property Type*</Text>
              <View style={styles.propertyTypesContainer}>
                {PROPERTY_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.propertyTypeButton,
                      propertyType === type.value &&
                        styles.propertyTypeButtonActive,
                    ]}
                    onPress={() => handleSelectPropertyType(type.value)}
                  >
                    <Text
                      style={[
                        styles.propertyTypeText,
                        propertyType === type.value &&
                          styles.propertyTypeTextActive,
                      ]}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.propertyType && (
                <Text style={styles.errorText}>{errors.propertyType}</Text>
              )}
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.label}>Bedrooms*</Text>
                <TextInput
                  style={[styles.input, errors.bedrooms && styles.inputError]}
                  placeholder="e.g. 3"
                  keyboardType="numeric"
                  value={bedrooms}
                  onChangeText={(text) => {
                    setBedrooms(text);
                    if (errors.bedrooms) setErrors({ ...errors, bedrooms: "" });
                  }}
                />
                {errors.bedrooms && (
                  <Text style={styles.errorText}>{errors.bedrooms}</Text>
                )}
              </View>

              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.label}>Bathrooms*</Text>
                <TextInput
                  style={[styles.input, errors.bathrooms && styles.inputError]}
                  placeholder="e.g. 2"
                  keyboardType="numeric"
                  value={bathrooms}
                  onChangeText={(text) => {
                    setBathrooms(text);
                    if (errors.bathrooms)
                      setErrors({ ...errors, bathrooms: "" });
                  }}
                />
                {errors.bathrooms && (
                  <Text style={styles.errorText}>{errors.bathrooms}</Text>
                )}
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.label}>Size (m²)*</Text>
                <TextInput
                  style={[styles.input, errors.size && styles.inputError]}
                  placeholder="e.g. 120"
                  keyboardType="numeric"
                  value={size}
                  onChangeText={(text) => {
                    setSize(text);
                    if (errors.size) setErrors({ ...errors, size: "" });
                  }}
                />
                {errors.size && (
                  <Text style={styles.errorText}>{errors.size}</Text>
                )}
              </View>

              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.label}>Monthly Rent (₦)*</Text>
                <TextInput
                  style={[styles.input, errors.price && styles.inputError]}
                  placeholder="e.g. 250000"
                  keyboardType="numeric"
                  value={price}
                  onChangeText={(text) => {
                    setPrice(text);
                    if (errors.price) setErrors({ ...errors, price: "" });
                  }}
                />
                {errors.price && (
                  <Text style={styles.errorText}>{errors.price}</Text>
                )}
              </View>
            </View>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Location</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Street Address*</Text>
              <TextInput
                style={[styles.input, errors.street && styles.inputError]}
                placeholder="e.g. 123 Main Street"
                value={street}
                onChangeText={(text) => {
                  setStreet(text);
                  if (errors.street) setErrors({ ...errors, street: "" });
                }}
              />
              {errors.street && (
                <Text style={styles.errorText}>{errors.street}</Text>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Area/Neighborhood*</Text>
              <TextInput
                style={[styles.input, errors.area && styles.inputError]}
                placeholder="e.g. Lekki Phase 1"
                value={area}
                onChangeText={(text) => {
                  setArea(text);
                  if (errors.area) setErrors({ ...errors, area: "" });
                }}
              />
              {errors.area && (
                <Text style={styles.errorText}>{errors.area}</Text>
              )}
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.label}>City*</Text>
                <TextInput
                  style={[styles.input, errors.city && styles.inputError]}
                  placeholder="e.g. Lagos"
                  value={city}
                  onChangeText={(text) => {
                    setCity(text);
                    if (errors.city) setErrors({ ...errors, city: "" });
                  }}
                />
                {errors.city && (
                  <Text style={styles.errorText}>{errors.city}</Text>
                )}
              </View>

              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.label}>State*</Text>
                <TextInput
                  style={[styles.input, errors.state && styles.inputError]}
                  placeholder="e.g. Lagos"
                  value={state}
                  onChangeText={(text) => {
                    setState(text);
                    if (errors.state) setErrors({ ...errors, state: "" });
                  }}
                />
                {errors.state && (
                  <Text style={styles.errorText}>{errors.state}</Text>
                )}
              </View>
            </View>

            <TouchableOpacity style={styles.mapButton}>
              <Ionicons name="location" size={20} color={COLOR_SCHEME.WHITE} />
              <Text style={styles.mapButtonText}>Select Location on Map</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Features</Text>
            <Text style={styles.featuresHelp}>
              Select all applicable features for your property.
            </Text>

            <View style={styles.featuresContainer}>
              {PROPERTY_FEATURES.map((feature) => (
                <TouchableOpacity
                  key={feature.value}
                  style={[
                    styles.featureButton,
                    selectedFeatures.includes(feature.value) &&
                      styles.featureButtonActive,
                  ]}
                  onPress={() => handleToggleFeature(feature.value)}
                >
                  <Text
                    style={[
                      styles.featureText,
                      selectedFeatures.includes(feature.value) &&
                        styles.featureTextActive,
                    ]}
                  >
                    {feature.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Images</Text>
            <Text style={styles.imagesHelp}>
              Add at least one image of your property. Up to 10 images allowed.
            </Text>

            <View style={styles.imagesContainer}>
              {images.map((image, index) => (
                <View key={index} style={styles.imageItem}>
                  <Image
                    source={{ uri: image.uri }}
                    style={styles.imagePreview}
                  />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => handleRemoveImage(index)}
                  >
                    <Ionicons
                      name="close-circle"
                      size={24}
                      color={COLOR_SCHEME.DANGER}
                    />
                  </TouchableOpacity>
                </View>
              ))}

              {images.length < 10 && (
                <TouchableOpacity
                  style={styles.addImageButton}
                  onPress={handlePickImages}
                >
                  <Ionicons name="add" size={40} color={COLOR_SCHEME.PRIMARY} />
                  <Text style={styles.addImageText}>Add Image</Text>
                </TouchableOpacity>
              )}
            </View>
            {errors.images && (
              <Text style={styles.errorText}>{errors.images}</Text>
            )}
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => router.back()}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={COLOR_SCHEME.WHITE} />
              ) : (
                <Text style={styles.submitButtonText}>Add Property</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLOR_SCHEME.BACKGROUND,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: COLOR_SCHEME.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLOR_SCHEME.BORDER,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLOR_SCHEME.DARK,
  },
  scrollContent: {
    padding: 20,
  },
  formSection: {
    backgroundColor: COLOR_SCHEME.WHITE,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: COLOR_SCHEME.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLOR_SCHEME.DARK,
    marginBottom: 15,
  },
  formGroup: {
    marginBottom: 15,
  },
  formRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLOR_SCHEME.DARK,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: COLOR_SCHEME.BORDER,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: COLOR_SCHEME.DARK,
  },
  inputError: {
    borderColor: COLOR_SCHEME.DANGER,
  },
  textArea: {
    borderWidth: 1,
    borderColor: COLOR_SCHEME.BORDER,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: COLOR_SCHEME.DARK,
    height: 100,
  },
  errorText: {
    color: COLOR_SCHEME.DANGER,
    fontSize: 12,
    marginTop: 5,
  },
  propertyTypesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  propertyTypeButton: {
    borderWidth: 1,
    borderColor: COLOR_SCHEME.BORDER,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginRight: 10,
    marginBottom: 10,
  },
  propertyTypeButtonActive: {
    backgroundColor: COLOR_SCHEME.PRIMARY,
    borderColor: COLOR_SCHEME.PRIMARY,
  },
  propertyTypeText: {
    color: COLOR_SCHEME.DARK,
    fontSize: 14,
  },
  propertyTypeTextActive: {
    color: COLOR_SCHEME.WHITE,
    fontWeight: "bold",
  },
  mapButton: {
    backgroundColor: COLOR_SCHEME.PRIMARY,
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  mapButtonText: {
    color: COLOR_SCHEME.WHITE,
    fontWeight: "bold",
    fontSize: 14,
    marginLeft: 8,
  },
  featuresHelp: {
    fontSize: 14,
    color: COLOR_SCHEME.DARK,
    opacity: 0.7,
    marginBottom: 15,
  },
  featuresContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  featureButton: {
    borderWidth: 1,
    borderColor: COLOR_SCHEME.BORDER,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 10,
    marginBottom: 10,
  },
  featureButtonActive: {
    backgroundColor: COLOR_SCHEME.PRIMARY,
    borderColor: COLOR_SCHEME.PRIMARY,
  },
  featureText: {
    color: COLOR_SCHEME.DARK,
    fontSize: 14,
  },
  featureTextActive: {
    color: COLOR_SCHEME.WHITE,
  },
  imagesHelp: {
    fontSize: 14,
    color: COLOR_SCHEME.DARK,
    opacity: 0.7,
    marginBottom: 15,
  },
  imagesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  imageItem: {
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: "hidden",
    marginRight: 10,
    marginBottom: 10,
    position: "relative",
  },
  imagePreview: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  removeImageButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 12,
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: COLOR_SCHEME.BORDER,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    marginBottom: 10,
  },
  addImageText: {
    color: COLOR_SCHEME.PRIMARY,
    fontSize: 12,
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: COLOR_SCHEME.LIGHT,
    borderRadius: 8,
    paddingVertical: 15,
    marginRight: 10,
    alignItems: "center",
  },
  cancelButtonText: {
    color: COLOR_SCHEME.DARK,
    fontWeight: "bold",
  },
  submitButton: {
    flex: 2,
    backgroundColor: COLOR_SCHEME.PRIMARY,
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: "center",
  },
  submitButtonText: {
    color: COLOR_SCHEME.WHITE,
    fontWeight: "bold",
  },
});
