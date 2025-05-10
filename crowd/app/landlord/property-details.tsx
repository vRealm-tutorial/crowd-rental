// app/landlord/property-details.tsx
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  FlatList,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { COLOR_SCHEME } from "@/constants";
import usePropertyStore from "@/hooks/usePropertyStore";

const { width } = Dimensions.get("window");

export default function PropertyDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const propertyId = params.propertyId as string;

  const {
    fetchPropertyById,
    currentProperty,
    isLoading,
    error,
    deleteProperty,
  } = usePropertyStore();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const flatListRef = useRef<FlatList | null>(null);

  useEffect(() => {
    if (propertyId) {
      fetchPropertyById(propertyId);
    }
  }, [propertyId]);

  // Format price with Nigerian Naira symbol
  const formatPrice = (price: number) => {
    return `₦${price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  };

  // Format payment frequency
  const formatFrequency = (frequency: string) => {
    switch (frequency) {
      case "monthly":
        return "/month";
      case "quarterly":
        return "/quarter";
      case "biannually":
        return "/6 months";
      case "yearly":
        return "/year";
      default:
        return "";
    }
  };

  // Handle property deletion
  const handleDeleteProperty = () => {
    Alert.alert(
      "Delete Property",
      "Are you sure you want to delete this property? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setIsDeleting(true);
              await deleteProperty(propertyId);
              router.replace("/landlord");
            } catch (error) {
              console.error("Error deleting property:", error);
              Alert.alert(
                "Error",
                "Failed to delete property. Please try again."
              );
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  // Handle property editing
  const handleEditProperty = () => {
    router.push({
      pathname: "/landlord/edit-property",
      params: { propertyId },
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLOR_SCHEME.PRIMARY} />
        <Text style={styles.loadingText}>Loading property details...</Text>
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

  if (!currentProperty) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="home-outline" size={48} color={COLOR_SCHEME.PRIMARY} />
        <Text style={styles.errorTitle}>Property Not Found</Text>
        <Text style={styles.errorText}>
          The property you're looking for could not be found.
        </Text>
        <TouchableOpacity
          style={styles.tryAgainButton}
          onPress={() => router.back()}
        >
          <Text style={styles.tryAgainButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={COLOR_SCHEME.DARK} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Property Details</Text>
        <TouchableOpacity onPress={() => {}} style={styles.actionButton}>
          <Ionicons
            name="ellipsis-vertical"
            size={24}
            color={COLOR_SCHEME.DARK}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {/* Property Images */}
        <View style={styles.imageCarouselContainer}>
          <FlatList
            ref={flatListRef}
            data={currentProperty.images}
            renderItem={({ item }) => (
              <Image source={{ uri: item.url }} style={styles.propertyImage} />
            )}
            keyExtractor={(item, index) => `image-${index}`}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(
                event.nativeEvent.contentOffset.x / width
              );
              setCurrentImageIndex(index);
            }}
          />

          {/* Pagination dots */}
          <View style={styles.paginationDotsContainer}>
            {currentProperty.images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  index === currentImageIndex && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>

          {currentProperty.verified && (
            <View style={styles.verifiedBadge}>
              <Ionicons
                name="checkmark-circle"
                size={16}
                color={COLOR_SCHEME.WHITE}
              />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          )}

          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>
              {currentProperty.status.charAt(0).toUpperCase() +
                currentProperty.status.slice(1)}
            </Text>
          </View>
        </View>

        {/* Property Details */}
        <View style={styles.detailsContainer}>
          {/* Price and Title */}
          <View style={styles.headerSection}>
            <Text style={styles.price}>
              {formatPrice(currentProperty.price.amount)}
              <Text style={styles.frequency}>
                {formatFrequency(currentProperty.price.paymentFrequency)}
              </Text>
            </Text>
            <Text style={styles.title}>{currentProperty.title}</Text>

            <View style={styles.locationRow}>
              <Ionicons
                name="location-outline"
                size={16}
                color={COLOR_SCHEME.DARK}
              />
              <Text style={styles.location}>
                {currentProperty.address.area}, {currentProperty.address.city},{" "}
                {currentProperty.address.state}
              </Text>
            </View>
          </View>

          {/* Property Attributes */}
          <View style={styles.attributesContainer}>
            <View style={styles.attributeItem}>
              <Ionicons
                name="bed-outline"
                size={24}
                color={COLOR_SCHEME.PRIMARY}
              />
              <Text style={styles.attributeValue}>
                {currentProperty.bedrooms}
              </Text>
              <Text style={styles.attributeLabel}>Bedrooms</Text>
            </View>

            <View style={styles.attributeItem}>
              <Ionicons
                name="water-outline"
                size={24}
                color={COLOR_SCHEME.PRIMARY}
              />
              <Text style={styles.attributeValue}>
                {currentProperty.bathrooms}
              </Text>
              <Text style={styles.attributeLabel}>Bathrooms</Text>
            </View>

            <View style={styles.attributeItem}>
              <Ionicons
                name="resize-outline"
                size={24}
                color={COLOR_SCHEME.PRIMARY}
              />
              <Text style={styles.attributeValue}>{currentProperty.size}</Text>
              <Text style={styles.attributeLabel}>Sq. m</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>
              {currentProperty.description}
            </Text>
          </View>

          {/* Features */}
          <View style={styles.featuresContainer}>
            <Text style={styles.sectionTitle}>Features</Text>
            <View style={styles.featuresList}>
              {currentProperty.features.map((feature, index) => (
                <View key={index} style={styles.featureBadge}>
                  <Text style={styles.featureText}>
                    {feature
                      .replace(/_/g, " ")
                      .split(" ")
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1)
                      )
                      .join(" ")}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Location Details */}
          <View style={styles.locationContainer}>
            <Text style={styles.sectionTitle}>Location</Text>
            <Text style={styles.address}>
              {currentProperty.address.street}, {currentProperty.address.area},{" "}
              {currentProperty.address.city}, {currentProperty.address.state}
            </Text>
          </View>

          {/* Statistics */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons
                name="eye-outline"
                size={20}
                color={COLOR_SCHEME.PRIMARY}
              />
              <Text style={styles.statText}>
                {currentProperty.viewCount || 0} Views
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons
                name="heart-outline"
                size={20}
                color={COLOR_SCHEME.PRIMARY}
              />
              <Text style={styles.statText}>
                {currentProperty.saveCount || 0} Saves
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons
                name="calendar-outline"
                size={20}
                color={COLOR_SCHEME.PRIMARY}
              />
              <Text style={styles.statText}>
                {new Date(currentProperty.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.deleteBtn]}
          onPress={handleDeleteProperty}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <ActivityIndicator size="small" color={COLOR_SCHEME.WHITE} />
          ) : (
            <>
              <Ionicons
                name="trash-outline"
                size={20}
                color={COLOR_SCHEME.WHITE}
              />
              <Text style={styles.actionBtnText}>Delete</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.editBtn]}
          onPress={handleEditProperty}
        >
          <Ionicons
            name="create-outline"
            size={20}
            color={COLOR_SCHEME.WHITE}
          />
          <Text style={styles.actionBtnText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.viewingsBtn]}
          onPress={() =>
            router.push({
              pathname: "/landlord/property-viewings",
              params: { propertyId },
            })
          }
        >
          <Ionicons
            name="calendar-outline"
            size={20}
            color={COLOR_SCHEME.WHITE}
          />
          <Text style={styles.actionBtnText}>Viewings</Text>
        </TouchableOpacity>
      </View>
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: COLOR_SCHEME.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLOR_SCHEME.BORDER,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLOR_SCHEME.DARK,
  },
  backButton: {
    padding: 5,
  },
  actionButton: {
    padding: 5,
  },
  scrollContainer: {
    flex: 1,
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
    fontSize: 16,
    textAlign: "center",
    color: COLOR_SCHEME.DARK,
    marginBottom: 20,
  },
  tryAgainButton: {
    backgroundColor: COLOR_SCHEME.PRIMARY,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  tryAgainButtonText: {
    color: COLOR_SCHEME.WHITE,
    fontWeight: "bold",
  },
  imageCarouselContainer: {
    position: "relative",
    height: 250,
  },
  propertyImage: {
    width,
    height: 250,
    resizeMode: "cover",
  },
  paginationDotsContainer: {
    position: "absolute",
    bottom: 20,
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLOR_SCHEME.WHITE + "80",
    marginHorizontal: 3,
  },
  paginationDotActive: {
    backgroundColor: COLOR_SCHEME.WHITE,
    width: 12,
  },
  verifiedBadge: {
    position: "absolute",
    top: 20,
    left: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLOR_SCHEME.SUCCESS,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  verifiedText: {
    color: COLOR_SCHEME.WHITE,
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 5,
  },
  statusBadge: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: COLOR_SCHEME.PRIMARY,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  statusText: {
    color: COLOR_SCHEME.WHITE,
    fontSize: 12,
    fontWeight: "bold",
  },
  detailsContainer: {
    padding: 20,
  },
  headerSection: {
    marginBottom: 20,
  },
  price: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLOR_SCHEME.DARK,
    marginBottom: 8,
  },
  frequency: {
    fontSize: 16,
    fontWeight: "normal",
    color: COLOR_SCHEME.DARK,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLOR_SCHEME.DARK,
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  location: {
    fontSize: 14,
    color: COLOR_SCHEME.DARK,
    marginLeft: 5,
  },
  attributesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: COLOR_SCHEME.LIGHT,
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  attributeItem: {
    alignItems: "center",
    flex: 1,
  },
  attributeValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLOR_SCHEME.DARK,
    marginTop: 5,
  },
  attributeLabel: {
    fontSize: 12,
    color: COLOR_SCHEME.DARK,
    marginTop: 2,
  },
  descriptionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLOR_SCHEME.DARK,
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: COLOR_SCHEME.DARK,
    lineHeight: 22,
  },
  featuresContainer: {
    marginBottom: 20,
  },
  featuresList: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  featureBadge: {
    backgroundColor: COLOR_SCHEME.LIGHT,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  featureText: {
    fontSize: 12,
    color: COLOR_SCHEME.DARK,
  },
  locationContainer: {
    marginBottom: 20,
  },
  address: {
    fontSize: 14,
    color: COLOR_SCHEME.DARK,
  },
  statsContainer: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: COLOR_SCHEME.BORDER,
    paddingTop: 15,
    marginTop: 10,
  },
  statItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  statText: {
    fontSize: 12,
    color: COLOR_SCHEME.DARK,
    marginLeft: 5,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    padding: 15,
    backgroundColor: COLOR_SCHEME.WHITE,
    borderTopWidth: 1,
    borderTopColor: COLOR_SCHEME.BORDER,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  deleteBtn: {
    backgroundColor: COLOR_SCHEME.DANGER,
  },
  editBtn: {
    backgroundColor: COLOR_SCHEME.PRIMARY,
  },
  viewingsBtn: {
    backgroundColor: COLOR_SCHEME.SUCCESS,
  },
  actionBtnText: {
    color: COLOR_SCHEME.WHITE,
    fontWeight: "bold",
    marginLeft: 5,
  },
});
