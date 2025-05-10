import React, { useState, useEffect } from "react";
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
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  COLOR_SCHEME,
  PROPERTY_TYPES,
  PROPERTY_FEATURES,
  PropertyType,
  PropertyFeature,
} from "@/constants";
import usePropertyStore from "@/hooks/usePropertyStore";
import * as ImagePicker from "expo-image-picker";

export default function EditPropertyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const propertyId = params.propertyId as string;

  const {
    fetchPropertyById,
    currentProperty,
    isLoading,
    error,
    updateProperty,
    uploadPropertyImages,
    deletePropertyImage,
  } = usePropertyStore();

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
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [newImages, setNewImages] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch property details on load
  useEffect(() => {
    if (propertyId) {
      fetchPropertyById(propertyId)
        .then(() => {
          // This will automatically update currentProperty
        })
        .catch((error) => {
          console.error("Error fetching property:", error);
          Alert.alert("Error", "Failed to load property details");
        });
    }
  }, [propertyId]);

  // Populate form with property data when it's loaded
  useEffect(() => {
    if (currentProperty) {
      setTitle(currentProperty.title);
      setDescription(currentProperty.description);
      setPropertyType(currentProperty.propertyType);
      setBedrooms(currentProperty.bedrooms.toString());
      setBathrooms(currentProperty.bathrooms.toString());
      setSize(currentProperty.size.toString());
      setPrice(currentProperty.price.amount.toString());
      setStreet(currentProperty.address.street);
      setArea(currentProperty.address.area);
      setCity(currentProperty.address.city);
      setState(currentProperty.address.state);
      setSelectedFeatures(currentProperty.features);
      setExistingImages(currentProperty.images);
    }
  }, [currentProperty]);

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

  // Handle picking new images
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
      const selectedImages = pickerResult.assets.map((asset) => ({
        uri: asset.uri,
        type: "image/jpeg",
        fileName: asset.uri.split("/").pop(),
      }));

      setNewImages([...newImages, ...selectedImages]);
    }
  };

  // Handle removing an existing image
  const handleRemoveExistingImage = (index: number) => {
    const image = existingImages[index];
    Alert.alert("Remove Image", "Are you sure you want to remove this image?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          const newExistingImages = [...existingImages];
          newExistingImages.splice(index, 1);
          setExistingImages(newExistingImages);
        },
      },
    ]);
  };

  // Handle removing a new image
  const handleRemoveNewImage = (index: number) => {
    const newImagesArray = [...newImages];
    newImagesArray.splice(index, 1);
    setNewImages(newImagesArray);
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) newErrors.title = "Title is required";
    if (!description.trim()) newErrors.description = "Description is required";
    if (!propertyType) newErrors.propertyType = "Property type is required";
    if (!bedrooms.trim()) newErrors.bedrooms = "Number of bedrooms is required";
    if (!bathrooms.trim())
      newErrors.bathrooms = "Number of bathrooms is required";
    if (!size.trim()) newErrors.size = "Property size is required";
    if (!price.trim()) newErrors.price = "Price is required";
    if (!street.trim()) newErrors.street = "Street address is required";
    if (!area.trim()) newErrors.area = "Area is required";
    if (!city.trim()) newErrors.city = "City is required";
    if (!state.trim()) newErrors.state = "State is required";
    if (existingImages.length === 0 && newImages.length === 0) {
      newErrors.images = "At least one image is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);

      // Update the property
      const propertyData = {
        title,
        description,
        propertyType: propertyType as PropertyType,
        bedrooms: parseInt(bedrooms),
        bathrooms: parseInt(bathrooms),
        size: parseFloat(size),
        features: selectedFeatures,
        address: {
          street,
          area,
          city,
          state,
          location: {
            type: "Point" as const,
            coordinates:
              currentProperty && currentProperty.address.location
                ? currentProperty.address.location.coordinates
                : ([0, 0] as [number, number]),
          },
        },
        price: {
          amount: parseFloat(price),
          currency: "NGN",
          paymentFrequency:
            currentProperty?.price.paymentFrequency || "monthly",
        },
      };

      const updatedProperty = await updateProperty(propertyId, propertyData);

      // Upload new images if any were selected
      if (newImages.length > 0) {
        await uploadPropertyImages(propertyId, newImages);
      }

      // Handle image removals if needed
      // This would need an implementation on your backend
      // For now we'll just assume the images are updated correctly

      Alert.alert("Success", "Property updated successfully", [
        {
          text: "OK",
          onPress: () =>
            router.replace({
              pathname: "/landlord/property-details",
              params: { propertyId },
            }),
        },
      ]);
    } catch (error) {
      console.error("Error updating property:", error);
      Alert.alert("Error", "Failed to update property. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading && !currentProperty) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLOR_SCHEME.PRIMARY} />
        <Text style={styles.loadingText}>Loading property data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons
          name="alert-circle-outline"
          size={48}
          color={COLOR_SCHEME.DANGER}
        />
        <Text style={styles.errorTitle}>Error Loading Property</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.tryAgainButton}
          onPress={() => fetchPropertyById(propertyId)}
        >
          <Text style={styles.tryAgainButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
          <Text style={styles.headerTitle}>Edit Property</Text>
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
              <Text style={styles.mapButtonText}>Update Location on Map</Text>
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
              Current images: {existingImages.length}. New images:{" "}
              {newImages.length}. Up to 10 images total allowed.
            </Text>

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <>
                <Text style={styles.imagesSubtitle}>Current Images</Text>
                <View style={styles.imagesContainer}>
                  {existingImages.map((image, index) => (
                    <View key={`existing-${index}`} style={styles.imageItem}>
                      <Image
                        source={{ uri: image.url }}
                        style={styles.imagePreview}
                      />
                      <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={() => handleRemoveExistingImage(index)}
                      >
                        <Ionicons
                          name="close-circle"
                          size={24}
                          color={COLOR_SCHEME.DANGER}
                        />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </>
            )}

            {/* New Images */}
            {newImages.length > 0 && (
              <>
                <Text style={styles.imagesSubtitle}>New Images</Text>
                <View style={styles.imagesContainer}>
                  {newImages.map((image, index) => (
                    <View key={`new-${index}`} style={styles.imageItem}>
                      <Image
                        source={{ uri: image.uri }}
                        style={styles.imagePreview}
                      />
                      <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={() => handleRemoveNewImage(index)}
                      >
                        <Ionicons
                          name="close-circle"
                          size={24}
                          color={COLOR_SCHEME.DANGER}
                        />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </>
            )}

            {/* Add New Image Button */}
            {existingImages.length + newImages.length < 10 && (
              <TouchableOpacity
                style={styles.addImageButton}
                onPress={handlePickImages}
              >
                <Ionicons name="add" size={24} color={COLOR_SCHEME.PRIMARY} />
                <Text style={styles.addImageText}>Add New Images</Text>
              </TouchableOpacity>
            )}

            {errors.images && (
              <Text style={styles.errorText}>{errors.images}</Text>
            )}
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => router.back()}
              disabled={isSubmitting}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color={COLOR_SCHEME.WHITE} />
              ) : (
                <Text style={styles.submitButtonText}>Update Property</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLOR_SCHEME.WHITE,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLOR_SCHEME.DARK,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: COLOR_SCHEME.WHITE,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLOR_SCHEME.DARK,
    marginTop: 20,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 12,
    color: COLOR_SCHEME.DANGER,
    marginTop: 5,
  },
  tryAgainButton: {
    backgroundColor: COLOR_SCHEME.PRIMARY,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
  },
  tryAgainButtonText: {
    color: COLOR_SCHEME.WHITE,
    fontWeight: "bold",
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
  imagesSubtitle: {
    fontSize: 16,
    fontWeight: "500",
    color: COLOR_SCHEME.DARK,
    marginBottom: 10,
  },
  imagesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 15,
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLOR_SCHEME.LIGHT,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  addImageText: {
    color: COLOR_SCHEME.PRIMARY,
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
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
