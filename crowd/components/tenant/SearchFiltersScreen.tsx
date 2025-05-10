import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StackNavigationProp } from "@react-navigation/stack";
import Slider from "@react-native-community/slider";
import {
  COLOR_SCHEME,
  PROPERTY_TYPES,
  PROPERTY_FEATURES,
  PropertyType,
  PropertyFeature,
} from "../../constants";
import usePropertyStore, {
  PropertyFilters,
} from "../../hooks/usePropertyStore";
import useForm from "../../hooks/useForm";
import { searchFiltersSchema } from "../../utils/validationSchemas";
import CustomButton from "../ui/CustomButton";
import CustomInput from "../ui/CustomInput";

// Define the navigation params for the tenant stack
type TenantStackParamList = {
  HomeMain: undefined;
  SearchFilters: undefined;
};

// Define props type for the component
type SearchFiltersScreenProps = {
  navigation: StackNavigationProp<TenantStackParamList, "SearchFilters">;
};

const SearchFiltersScreen: React.FC<SearchFiltersScreenProps> = ({
  navigation,
}) => {
  const { filters, setFilters, resetFilters, fetchProperties, isLoading } =
    usePropertyStore();

  // Initialize form with useForm hook and Zod schema
  const {
    values,
    handleChange,
    handleSubmit,
    resetForm,
    setFieldValue,
    setFieldValues,
  } = useForm<PropertyFilters>({
    initialValues: {
      ...filters,
    },
    schema: searchFiltersSchema,
    onSubmit: handleApplyFilters,
  });

  // Selected features state
  const [selectedFeatures, setSelectedFeatures] = useState<PropertyFeature[]>(
    filters.features || []
  );

  // Selected property type state
  const [selectedPropertyType, setSelectedPropertyType] =
    useState<PropertyType | null>(filters.propertyType || null);

  // Update form with current filters when they change
  useEffect(() => {
    setFieldValues({
      ...filters,
    });
    setSelectedFeatures(filters.features || []);
    setSelectedPropertyType(filters.propertyType || null);
  }, [filters]);

  // Handle applying filters
  async function handleApplyFilters(formValues: PropertyFilters) {
    // Add selected features to filters
    const updatedFilters = {
      ...formValues,
      features: selectedFeatures,
      propertyType: selectedPropertyType,
    };

    // Update filters in store
    setFilters(updatedFilters);

    // Fetch properties with new filters
    await fetchProperties();

    // Navigate back
    navigation.goBack();
  }

  // Handle resetting filters
  const handleResetFilters = () => {
    resetFilters();
    resetForm();
    setSelectedFeatures([]);
    setSelectedPropertyType(null);
  };

  // Toggle property type selection
  const togglePropertyType = (type: PropertyType) => {
    if (selectedPropertyType === type) {
      setSelectedPropertyType(null);
    } else {
      setSelectedPropertyType(type);
    }
  };

  // Toggle feature selection
  const toggleFeature = (feature: PropertyFeature) => {
    if (selectedFeatures.includes(feature)) {
      setSelectedFeatures(selectedFeatures.filter((f) => f !== feature));
    } else {
      setSelectedFeatures([...selectedFeatures, feature]);
    }
  };

  // Format price to display
  const formatPrice = (price: number | null) => {
    if (price === null) return "₦0";
    return `₦${price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={24} color={COLOR_SCHEME.DARK} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search Filters</Text>
        <TouchableOpacity
          style={styles.resetButton}
          onPress={handleResetFilters}
        >
          <Text style={styles.resetButtonText}>Reset</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Price Range */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Range</Text>

          <View style={styles.priceLabels}>
            <Text style={styles.priceLabel}>
              Min: {formatPrice(values.priceMin as number)}
            </Text>
            <Text style={styles.priceLabel}>
              Max: {formatPrice(values.priceMax as number)}
            </Text>
          </View>

          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={5000000}
              step={100000}
              value={values.priceMin || 0}
              onValueChange={(value) => setFieldValue("priceMin", value)}
              minimumTrackTintColor={COLOR_SCHEME.PRIMARY}
              maximumTrackTintColor={COLOR_SCHEME.BORDER}
              thumbTintColor={COLOR_SCHEME.PRIMARY}
            />

            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={20000000}
              step={500000}
              value={values.priceMax || 20000000}
              onValueChange={(value) => setFieldValue("priceMax", value)}
              minimumTrackTintColor={COLOR_SCHEME.PRIMARY}
              maximumTrackTintColor={COLOR_SCHEME.BORDER}
              thumbTintColor={COLOR_SCHEME.PRIMARY}
            />
          </View>
        </View>

        {/* Bedrooms and Bathrooms */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bedrooms & Bathrooms</Text>

          <View style={styles.roomsContainer}>
            <View style={styles.roomSection}>
              <Text style={styles.roomLabel}>Bedrooms</Text>
              <View style={styles.roomButtonsContainer}>
                {[0, 1, 2, 3, 4, "5+"].map((num) => (
                  <TouchableOpacity
                    key={`bed-${num}`}
                    style={[
                      styles.roomButton,
                      values.bedrooms === (num === "5+" ? 5 : Number(num)) &&
                        styles.roomButtonActive,
                    ]}
                    onPress={() =>
                      setFieldValue("bedrooms", num === "5+" ? 5 : Number(num))
                    }
                  >
                    <Text
                      style={[
                        styles.roomButtonText,
                        values.bedrooms === (num === "5+" ? 5 : Number(num)) &&
                          styles.roomButtonTextActive,
                      ]}
                    >
                      {num}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.roomSection}>
              <Text style={styles.roomLabel}>Bathrooms</Text>
              <View style={styles.roomButtonsContainer}>
                {[0, 1, 2, 3, 4, "5+"].map((num) => (
                  <TouchableOpacity
                    key={`bath-${num}`}
                    style={[
                      styles.roomButton,
                      values.bathrooms === (num === "5+" ? 5 : Number(num)) &&
                        styles.roomButtonActive,
                    ]}
                    onPress={() =>
                      setFieldValue("bathrooms", num === "5+" ? 5 : Number(num))
                    }
                  >
                    <Text
                      style={[
                        styles.roomButtonText,
                        values.bathrooms === (num === "5+" ? 5 : Number(num)) &&
                          styles.roomButtonTextActive,
                      ]}
                    >
                      {num}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Property Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Property Type</Text>

          <View style={styles.propertyTypesContainer}>
            {PROPERTY_TYPES.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.propertyTypeButton,
                  selectedPropertyType === type.value &&
                    styles.propertyTypeButtonActive,
                ]}
                onPress={() => togglePropertyType(type.value)}
              >
                <Text
                  style={[
                    styles.propertyTypeText,
                    selectedPropertyType === type.value &&
                      styles.propertyTypeTextActive,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>

          <View style={styles.featuresContainer}>
            {PROPERTY_FEATURES.map((feature) => (
              <TouchableOpacity
                key={feature.value}
                style={[
                  styles.featureButton,
                  selectedFeatures.includes(feature.value) &&
                    styles.featureButtonActive,
                ]}
                onPress={() => toggleFeature(feature.value)}
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

        {/* Distance */}
        <View style={styles.section}>
          <View style={styles.distanceHeaderRow}>
            <Text style={styles.sectionTitle}>Distance from your location</Text>
            <Text style={styles.distanceValue}>{values.distance} min</Text>
          </View>

          <Slider
            style={styles.slider}
            minimumValue={5}
            maximumValue={60}
            step={5}
            value={values.distance || 30}
            onValueChange={(value) => setFieldValue("distance", value)}
            minimumTrackTintColor={COLOR_SCHEME.PRIMARY}
            maximumTrackTintColor={COLOR_SCHEME.BORDER}
            thumbTintColor={COLOR_SCHEME.PRIMARY}
          />

          <View style={styles.distanceLabels}>
            <Text style={styles.distanceLabel}>5 min</Text>
            <Text style={styles.distanceLabel}>60 min</Text>
          </View>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>

          <CustomInput
            label="Search for area or city"
            placeholder="e.g. Lekki, Ikeja, etc."
            leftIcon="location-outline"
            value={values.location || ""}
            onChangeText={(text) => setFieldValue("location", text)}
          />
        </View>

        {/* Spacing at the bottom */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Apply Filters Button */}
      <View style={styles.footer}>
        <CustomButton
          title="Apply Filters"
          onPress={() => handleSubmit()}
          fullWidth
          loading={isLoading}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLOR_SCHEME.WHITE,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLOR_SCHEME.BORDER,
  },
  closeButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLOR_SCHEME.DARK,
  },
  resetButton: {
    padding: 5,
  },
  resetButtonText: {
    fontSize: 14,
    color: COLOR_SCHEME.PRIMARY,
    fontWeight: "500",
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLOR_SCHEME.DARK,
    marginBottom: 15,
  },
  priceLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  priceLabel: {
    fontSize: 14,
    color: COLOR_SCHEME.DARK,
  },
  sliderContainer: {
    marginTop: 5,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  roomsContainer: {
    marginBottom: 10,
  },
  roomSection: {
    marginBottom: 15,
  },
  roomLabel: {
    fontSize: 14,
    color: COLOR_SCHEME.DARK,
    marginBottom: 10,
  },
  roomButtonsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  roomButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: COLOR_SCHEME.BORDER,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    marginBottom: 10,
  },
  roomButtonActive: {
    backgroundColor: COLOR_SCHEME.PRIMARY,
    borderColor: COLOR_SCHEME.PRIMARY,
  },
  roomButtonText: {
    fontSize: 14,
    color: COLOR_SCHEME.DARK,
  },
  roomButtonTextActive: {
    color: COLOR_SCHEME.WHITE,
  },
  propertyTypesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  propertyTypeButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLOR_SCHEME.BORDER,
    marginRight: 10,
    marginBottom: 10,
  },
  propertyTypeButtonActive: {
    backgroundColor: COLOR_SCHEME.PRIMARY,
    borderColor: COLOR_SCHEME.PRIMARY,
  },
  propertyTypeText: {
    fontSize: 14,
    color: COLOR_SCHEME.DARK,
  },
  propertyTypeTextActive: {
    color: COLOR_SCHEME.WHITE,
  },
  featuresContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  featureButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLOR_SCHEME.BORDER,
    marginRight: 10,
    marginBottom: 10,
  },
  featureButtonActive: {
    backgroundColor: COLOR_SCHEME.PRIMARY,
    borderColor: COLOR_SCHEME.PRIMARY,
  },
  featureText: {
    fontSize: 14,
    color: COLOR_SCHEME.DARK,
  },
  featureTextActive: {
    color: COLOR_SCHEME.WHITE,
  },
  distanceHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  distanceValue: {
    fontSize: 14,
    color: COLOR_SCHEME.PRIMARY,
    fontWeight: "bold",
  },
  distanceLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
  distanceLabel: {
    fontSize: 12,
    color: COLOR_SCHEME.DARK,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLOR_SCHEME.WHITE,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: COLOR_SCHEME.BORDER,
    ...Platform.select({
      ios: {
        shadowColor: COLOR_SCHEME.BLACK,
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
      },
      android: {
        elevation: 5,
      },
    }),
  },
});

export default SearchFiltersScreen;
