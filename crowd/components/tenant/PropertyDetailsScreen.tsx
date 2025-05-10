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
  Platform,
  Animated,
  Share,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { COLOR_SCHEME } from "../../constants";
import usePropertyStore from "../../hooks/usePropertyStore";
import useBookingStore from "../../hooks/useBookingStore";
import CustomButton from "../ui/CustomButton";
import CustomModal from "../ui/CustomModal";

const { width, height } = Dimensions.get("window");

// Define the navigation params for the tenant stack
type TenantStackParamList = {
  HomeMain: undefined;
  PropertyDetails: { propertyId: string; propertyTitle?: string };
  BookViewing: { propertyId: string };
};

// Define props type for the component
type PropertyDetailsScreenProps = {
  navigation: StackNavigationProp<TenantStackParamList, "PropertyDetails">;
  route: RouteProp<TenantStackParamList, "PropertyDetails">;
};

const PropertyDetailsScreen: React.FC<PropertyDetailsScreenProps> = ({
  navigation,
  route,
}) => {
  const { propertyId } = route.params;

  const {
    fetchPropertyById,
    currentProperty,
    isLoading,
    error,
    saveProperty,
    removeSavedProperty,
    savedProperties,
    fetchSavedProperties,
  } = usePropertyStore();

  const { checkSubscriptionStatus } = useBookingStore();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(false);

  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch the property details
        await fetchPropertyById(propertyId);

        // Fetch saved properties to determine if this one is saved
        await fetchSavedProperties();
      } catch (error) {
        console.error("Error fetching property details:", error);
      }
    };

    fetchData();
  }, [propertyId]);

  useEffect(() => {
    // Check if the property is saved
    if (savedProperties.length > 0 && currentProperty) {
      const propertyIsSaved = savedProperties.some(
        (p) => p._id === currentProperty._id
      );
      setIsSaved(propertyIsSaved);
    }
  }, [savedProperties, currentProperty]);

  // Handle save/unsave property
  const handleToggleSave = async () => {
    if (!currentProperty) return;

    try {
      if (isSaved) {
        await removeSavedProperty(currentProperty._id);
        setIsSaved(false);
      } else {
        await saveProperty(currentProperty._id);
        setIsSaved(true);
      }
    } catch (error) {
      console.error("Error toggling save status:", error);
    }
  };

  // Handle share property
  const handleShare = async () => {
    if (!currentProperty) return;

    try {
      await Share.share({
        message: `Check out this property: ${currentProperty.title} in ${currentProperty.address.area}, ${currentProperty.address.city}. Price: ₦${currentProperty.price.amount}`,
        title: "Share Property",
      });
    } catch (error) {
      console.error("Error sharing property:", error);
    }
  };

  // Handle book viewing
  const handleBookViewing = async () => {
    if (!currentProperty) return;

    setIsCheckingSubscription(true);

    try {
      // Check if user has an active subscription
      const subscription = await checkSubscriptionStatus();
      setSubscriptionData(subscription);

      if (!subscription.isActive || subscription.viewingsRemaining <= 0) {
        // Show subscription modal if no active subscription or no viewings left
        setShowSubscriptionModal(true);
      } else {
        // Navigate to booking screen if subscription is active and has viewings left
        navigation.navigate("BookViewing", { propertyId: currentProperty._id });
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
    } finally {
      setIsCheckingSubscription(false);
    }
  };

  // Handle purchase subscription
  const handlePurchaseSubscription = () => {
    setShowSubscriptionModal(false);
    // Navigate to subscription screen
    // navigation.navigate('Subscription');
  };

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

  // Render the image pagination dots
  const renderPaginationDots = () => {
    if (!currentProperty || !currentProperty.images) return null;

    return (
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
    );
  };

  // Render feature badges
  const renderFeatures = () => {
    if (!currentProperty || !currentProperty.features) return null;

    return (
      <View style={styles.featuresContainer}>
        <Text style={styles.sectionTitle}>Features</Text>
        <View style={styles.featuresList}>
          {currentProperty.features.map((feature, index) => (
            <View key={index} style={styles.featureBadge}>
              <Text style={styles.featureText}>
                {feature
                  .replace("_", " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
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
        <CustomButton
          title="Try Again"
          onPress={() => fetchPropertyById(propertyId)}
          style={styles.tryAgainButton}
          size="small"
        />
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
        <CustomButton
          title="Go Back"
          onPress={() => navigation.goBack()}
          style={styles.tryAgainButton}
          size="small"
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Property Images Carousel */}
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
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false }
            )}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(
                event.nativeEvent.contentOffset.x / width
              );
              setCurrentImageIndex(index);
            }}
          />

          {renderPaginationDots()}

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLOR_SCHEME.WHITE} />
          </TouchableOpacity>

          <View style={styles.imageActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleToggleSave}
            >
              <Ionicons
                name={isSaved ? "heart" : "heart-outline"}
                size={24}
                color={isSaved ? COLOR_SCHEME.DANGER : COLOR_SCHEME.WHITE}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
              <Ionicons
                name="share-social-outline"
                size={24}
                color={COLOR_SCHEME.WHITE}
              />
            </TouchableOpacity>
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
          {renderFeatures()}

          {/* Map */}
          <View style={styles.mapContainer}>
            <Text style={styles.sectionTitle}>Location</Text>
            <MapView
              style={styles.map}
              provider={PROVIDER_GOOGLE}
              initialRegion={{
                latitude: currentProperty.address.location.coordinates[1],
                longitude: currentProperty.address.location.coordinates[0],
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              zoomEnabled={false}
              scrollEnabled={false}
            >
              <Marker
                coordinate={{
                  latitude: currentProperty.address.location.coordinates[1],
                  longitude: currentProperty.address.location.coordinates[0],
                }}
                title={currentProperty.title}
              />
            </MapView>
            <Text style={styles.address}>
              {currentProperty.address.fullAddress}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.agentInfo}>
          <Ionicons
            name="person-circle-outline"
            size={40}
            color={COLOR_SCHEME.PRIMARY}
          />
          <View style={styles.agentDetails}>
            <Text style={styles.agentName}>
              {currentProperty.agent ? "Contact Agent" : "Contact Landlord"}
            </Text>
            <TouchableOpacity style={styles.callButton}>
              <Ionicons
                name="call-outline"
                size={14}
                color={COLOR_SCHEME.PRIMARY}
              />
              <Text style={styles.callText}>Call</Text>
            </TouchableOpacity>
          </View>
        </View>

        <CustomButton
          title="Book Viewing"
          onPress={handleBookViewing}
          style={styles.bookButton}
          loading={isCheckingSubscription}
        />
      </View>

      {/* Subscription Required Modal */}
      <CustomModal
        visible={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        title="Subscription Required"
        headerIcon="alert-circle"
        headerIconColor={COLOR_SCHEME.WARNING}
        footerButtons={[
          {
            text: "Cancel",
            onPress: () => setShowSubscriptionModal(false),
            type: "secondary",
          },
          {
            text: "Subscribe Now",
            onPress: handlePurchaseSubscription,
            type: "primary",
          },
        ]}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalText}>
            You need an active subscription with available viewings to book a
            property viewing.
          </Text>
          <Text style={styles.subscriptionDetails}>
            {subscriptionData?.isActive
              ? `You have used all your viewings for this subscription period. Purchase additional viewings or wait until your subscription renews.`
              : `Subscribe to our service to book property viewings. A subscription gives you ${5} viewings per month.`}
          </Text>
        </View>
      </CustomModal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLOR_SCHEME.WHITE,
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
    marginTop: 10,
  },
  imageCarouselContainer: {
    position: "relative",
    height: height * 0.35,
  },
  propertyImage: {
    width,
    height: height * 0.35,
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
  backButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 20 : 40,
    left: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  imageActions: {
    position: "absolute",
    top: Platform.OS === "ios" ? 20 : 40,
    right: 20,
    flexDirection: "row",
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  verifiedBadge: {
    position: "absolute",
    bottom: 20,
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
  mapContainer: {
    marginBottom: 40,
  },
  map: {
    height: 200,
    borderRadius: 12,
    marginBottom: 10,
  },
  address: {
    fontSize: 14,
    color: COLOR_SCHEME.DARK,
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: COLOR_SCHEME.BORDER,
    backgroundColor: COLOR_SCHEME.WHITE,
  },
  agentInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  agentDetails: {
    marginLeft: 10,
  },
  agentName: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLOR_SCHEME.DARK,
    marginBottom: 2,
  },
  callButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  callText: {
    fontSize: 12,
    color: COLOR_SCHEME.PRIMARY,
    marginLeft: 5,
    fontWeight: "500",
  },
  bookButton: {
    flex: 1,
    maxWidth: 150,
  },
  modalContent: {
    paddingVertical: 10,
  },
  modalText: {
    fontSize: 16,
    color: COLOR_SCHEME.DARK,
    marginBottom: 15,
    textAlign: "center",
  },
  subscriptionDetails: {
    fontSize: 14,
    color: COLOR_SCHEME.DARK,
    lineHeight: 20,
  },
});

export default PropertyDetailsScreen;
