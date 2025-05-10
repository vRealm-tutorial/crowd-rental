import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Property } from "../../hooks/usePropertyStore";
import { COLOR_SCHEME } from "../../constants";

const { width } = Dimensions.get("window");

interface PropertyCardProps {
  property: Property;
  onPress?: () => void;
  onSave?: () => void;
  isSaved?: boolean;
  style?: StyleProp<ViewStyle>;
  showDistance?: boolean;
  distance?: number; // in km
  isNearby?: boolean; // within 30min drive
  horizontal?: boolean;
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onPress,
  onSave,
  isSaved = false,
  style,
  showDistance = false,
  distance,
  isNearby = true,
  horizontal = false,
}) => {
  const navigation = useNavigation();

  // Find primary image or use first image
  const propertyImage =
    property.images?.find((img) => img.isPrimary)?.url ||
    property.images?.[0]?.url ||
    "https://via.placeholder.com/300x200";

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

  // Calculate estimated travel time in minutes
  const getTravelTime = (distanceKm: number) => {
    // Assuming average speed of 40 km/h in Nigerian cities
    const timeInMinutes = Math.round((distanceKm / 40) * 60);
    return `${timeInMinutes} min`;
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      // Default navigation
      // navigation.navigate('PropertyDetails' as never, { propertyId: property._id } as never);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        horizontal ? styles.horizontalContainer : styles.verticalContainer,
        style,
      ]}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <View
        style={[
          styles.imageContainer,
          horizontal && styles.horizontalImageContainer,
        ]}
      >
        <Image source={{ uri: propertyImage }} style={styles.image} />

        {property.verified && (
          <View style={styles.verifiedBadge}>
            <Ionicons
              name="checkmark-circle"
              size={16}
              color={COLOR_SCHEME.WHITE}
            />
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.saveButton}
          onPress={onSave}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <Ionicons
            name={isSaved ? "heart" : "heart-outline"}
            size={24}
            color={isSaved ? COLOR_SCHEME.DANGER : COLOR_SCHEME.WHITE}
          />
        </TouchableOpacity>
      </View>

      <View
        style={[
          styles.detailsContainer,
          horizontal && styles.horizontalDetailsContainer,
        ]}
      >
        <View style={styles.priceRow}>
          <Text style={styles.price}>
            {formatPrice(property.price.amount)}
            <Text style={styles.frequency}>
              {formatFrequency(property.price.paymentFrequency)}
            </Text>
          </Text>

          {showDistance && distance !== undefined && (
            <View
              style={[
                styles.distanceBadge,
                !isNearby && styles.distanceBadgeFar,
              ]}
            >
              <Ionicons
                name="time-outline"
                size={12}
                color={isNearby ? COLOR_SCHEME.SUCCESS : COLOR_SCHEME.WARNING}
              />
              <Text
                style={[
                  styles.distanceText,
                  !isNearby && styles.distanceTextFar,
                ]}
              >
                {getTravelTime(distance)}
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
          {property.title}
        </Text>

        <View style={styles.locationRow}>
          <Ionicons
            name="location-outline"
            size={14}
            color={COLOR_SCHEME.DARK}
          />
          <Text style={styles.location} numberOfLines={1} ellipsizeMode="tail">
            {property.address.area}, {property.address.city}
          </Text>
        </View>

        <View style={styles.featuresRow}>
          <View style={styles.featureItem}>
            <Ionicons name="bed-outline" size={16} color={COLOR_SCHEME.DARK} />
            <Text style={styles.featureText}>{property.bedrooms} Beds</Text>
          </View>

          <View style={styles.featureItem}>
            <Ionicons
              name="water-outline"
              size={16}
              color={COLOR_SCHEME.DARK}
            />
            <Text style={styles.featureText}>{property.bathrooms} Baths</Text>
          </View>

          <View style={styles.featureItem}>
            <Ionicons
              name="resize-outline"
              size={16}
              color={COLOR_SCHEME.DARK}
            />
            <Text style={styles.featureText}>{property.size} m²</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLOR_SCHEME.WHITE,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: COLOR_SCHEME.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  verticalContainer: {
    width: width * 0.9,
  },
  horizontalContainer: {
    flexDirection: "row",
    width: width * 0.9,
    height: 120,
  },
  imageContainer: {
    position: "relative",
  },
  horizontalImageContainer: {
    width: 120,
  },
  image: {
    width: "100%",
    height: 160,
    resizeMode: "cover",
  },
  verifiedBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: COLOR_SCHEME.SUCCESS,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  verifiedText: {
    color: COLOR_SCHEME.WHITE,
    fontSize: 10,
    marginLeft: 2,
    fontWeight: "bold",
  },
  saveButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  detailsContainer: {
    padding: 12,
  },
  horizontalDetailsContainer: {
    flex: 1,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  price: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLOR_SCHEME.DARK,
  },
  frequency: {
    fontSize: 14,
    color: COLOR_SCHEME.DARK,
    fontWeight: "normal",
  },
  distanceBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(16, 185, 129, 0.1)", // Light green for nearby
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  distanceBadgeFar: {
    backgroundColor: "rgba(245, 158, 11, 0.1)", // Light amber for far
  },
  distanceText: {
    fontSize: 10,
    color: COLOR_SCHEME.SUCCESS,
    marginLeft: 2,
    fontWeight: "500",
  },
  distanceTextFar: {
    color: COLOR_SCHEME.WARNING,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLOR_SCHEME.DARK,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  location: {
    fontSize: 14,
    color: COLOR_SCHEME.DARK,
    marginLeft: 4,
    flex: 1,
  },
  featuresRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  featureText: {
    fontSize: 12,
    color: COLOR_SCHEME.DARK,
    marginLeft: 4,
  },
});

export default PropertyCard;
