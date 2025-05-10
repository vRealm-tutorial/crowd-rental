import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Dimensions,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { StackNavigationProp } from "@react-navigation/stack";
import { COLOR_SCHEME } from "../../constants";
import usePropertyStore, { Property } from "../../hooks/usePropertyStore";
import locationService from "../../services/location";
import PropertyCard from "../property/PropertyCard";
import CustomButton from "../ui/CustomButton";

const { width, height } = Dimensions.get("window");
const CARD_WIDTH = width * 0.9;
const CARD_HEIGHT = 230;

type TenantStackParamList = {
  HomeMain: undefined;
  PropertyMap: undefined;
  PropertyDetails: { propertyId: string; propertyTitle?: string };
  BookViewing: { propertyId: string };
  SearchFilters: undefined;
};

type HomeScreenProps = {
  navigation: StackNavigationProp<TenantStackParamList, "HomeMain">;
};

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const {
    nearbyProperties,
    isLoading,
    error,
    fetchNearbyProperties,
    saveProperty,
    removeSavedProperty,
    savedProperties,
    fetchSavedProperties,
  } = usePropertyStore();

  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Animated values for map interaction
  const mapAnimation = useRef(new Animated.Value(0)).current;
  const mapRef = useRef<MapView | null>(null);

  // References for the FlatList and its scroll position
  const flatListRef = useRef<FlatList | null>(null);
  const scrollIndex = useRef(0);

  useEffect(() => {
    // Get user's location and fetch nearby properties
    const initializeLocation = async () => {
      try {
        const location = await locationService.getCurrentLocation();
        setUserLocation({
          latitude: location.latitude,
          longitude: location.longitude,
        });

        // Fetch nearby properties using the location
        await fetchNearbyProperties({
          latitude: location.latitude,
          longitude: location.longitude,
        });

        // Also fetch saved properties to know which ones are saved
        await fetchSavedProperties();
      } catch (error) {
        console.error("Error initializing location:", error);
      }
    };

    initializeLocation();
  }, []);

  // Handle when a property marker is selected on the map
  const onMarkerSelected = (index: number) => {
    if (flatListRef.current) {
      flatListRef.current.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0.5,
      });
    }
  };

  // Handle when the map region changes
  const onRegionChangeComplete = () => {
    if (mapRef.current) {
      // Could fetch properties in the new region
    }
  };

  // Handle property card press
  const handlePropertyPress = (property: Property) => {
    navigation.navigate("PropertyDetails", {
      propertyId: property._id,
      propertyTitle: property.title,
    });
  };

  // Handle save/unsave property
  const handleToggleSaveProperty = async (property: Property) => {
    const isSaved = savedProperties.some((p) => p._id === property._id);
    try {
      if (isSaved) {
        await removeSavedProperty(property._id);
      } else {
        await saveProperty(property._id);
      }
    } catch (error) {
      console.error("Error toggling property save status:", error);
    }
  };

  // Check if a property is saved
  const isPropertySaved = (propertyId: string) => {
    return savedProperties.some((property) => property._id === propertyId);
  };

  // Calculate distance between user and property
  const calculateDistance = (property: Property) => {
    if (!userLocation || !property.address.location.coordinates) return null;

    return locationService.calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      property.address.location.coordinates[1], // latitude
      property.address.location.coordinates[0] // longitude
    );
  };

  // Check if property is within 30min drive
  const isPropertyNearby = (distance: number) => {
    // Using 40km/h average speed in Nigerian cities
    const timeInMinutes = (distance / 40) * 60;
    return timeInMinutes <= 30;
  };

  // Render a property marker on the map
  const renderMarker = (property: Property, index: number) => {
    return (
      <Marker
        key={property._id}
        coordinate={{
          latitude: property.address.location.coordinates[1],
          longitude: property.address.location.coordinates[0],
        }}
        title={property.title}
        description={`₦${property.price.amount}`}
        onPress={() => onMarkerSelected(index)}
      >
        <View style={styles.markerContainer}>
          <View style={styles.marker}>
            <Text style={styles.markerText}>
              ₦{(property.price.amount / 1000).toFixed(0)}K
            </Text>
          </View>
          <View style={styles.markerTriangle} />
        </View>
      </Marker>
    );
  };

  // Render a property card in the list
  const renderPropertyCard = ({
    item,
    index,
  }: {
    item: Property;
    index: number;
  }) => {
    const distance = calculateDistance(item);
    const isNearby = distance ? isPropertyNearby(distance) : true;

    return (
      <PropertyCard
        property={item}
        onPress={() => handlePropertyPress(item)}
        onSave={() => handleToggleSaveProperty(item)}
        isSaved={isPropertySaved(item._id)}
        style={styles.propertyCard}
        showDistance={!!distance}
        distance={distance || undefined}
        isNearby={isNearby}
      />
    );
  };

  // Render the card for the map view
  const renderPropertyCardOnMap = ({
    item,
    index,
  }: {
    item: Property;
    index: number;
  }) => {
    const distance = calculateDistance(item);
    const isNearby = distance ? isPropertyNearby(distance) : true;

    return (
      <View style={styles.cardContainer}>
        <PropertyCard
          property={item}
          onPress={() => handlePropertyPress(item)}
          onSave={() => handleToggleSaveProperty(item)}
          isSaved={isPropertySaved(item._id)}
          showDistance={!!distance}
          distance={distance || undefined}
          isNearby={isNearby}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Find Your Home</Text>
        <TouchableOpacity
          style={styles.notificationButton}
          // onPress={() => navigation.navigate('Notifications')}
        >
          <Ionicons
            name="notifications-outline"
            size={24}
            color={COLOR_SCHEME.DARK}
          />
          <View style={styles.notificationBadge} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons
            name="search"
            size={20}
            color={COLOR_SCHEME.DARK}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for location, area or property"
            placeholderTextColor={COLOR_SCHEME.DARK + "80"}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => navigation.navigate("SearchFilters")}
        >
          <Ionicons
            name="options-outline"
            size={24}
            color={COLOR_SCHEME.PRIMARY}
          />
        </TouchableOpacity>
      </View>

      {/* View Mode Toggle */}
      <View style={styles.viewToggleContainer}>
        <TouchableOpacity
          style={[
            styles.viewToggleButton,
            viewMode === "list" && styles.activeViewToggleButton,
          ]}
          onPress={() => setViewMode("list")}
        >
          <Ionicons
            name="list"
            size={18}
            color={viewMode === "list" ? COLOR_SCHEME.WHITE : COLOR_SCHEME.DARK}
          />
          <Text
            style={[
              styles.viewToggleText,
              viewMode === "list" && styles.activeViewToggleText,
            ]}
          >
            List
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.viewToggleButton,
            viewMode === "map" && styles.activeViewToggleButton,
          ]}
          onPress={() => setViewMode("map")}
        >
          <Ionicons
            name="map"
            size={18}
            color={viewMode === "map" ? COLOR_SCHEME.WHITE : COLOR_SCHEME.DARK}
          />
          <Text
            style={[
              styles.viewToggleText,
              viewMode === "map" && styles.activeViewToggleText,
            ]}
          >
            Map
          </Text>
        </TouchableOpacity>
      </View>

      {/* Loading State */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLOR_SCHEME.PRIMARY} />
          <Text style={styles.loadingText}>Finding nearby properties...</Text>
        </View>
      )}

      {/* Error State */}
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={48}
            color={COLOR_SCHEME.DANGER}
          />
          <Text style={styles.errorText}>{error}</Text>
          <CustomButton
            title="Try Again"
            onPress={() => {
              if (userLocation) {
                fetchNearbyProperties(userLocation);
              }
            }}
            size="small"
            style={styles.retryButton}
          />
        </View>
      )}

      {/* Empty State */}
      {!isLoading && !error && nearbyProperties.length === 0 && (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="home-outline"
            size={64}
            color={COLOR_SCHEME.PRIMARY}
          />
          <Text style={styles.emptyTitle}>No Properties Found</Text>
          <Text style={styles.emptyText}>
            We couldn't find any properties near your location. Try adjusting
            your search filters or location.
          </Text>
          <CustomButton
            title="Adjust Filters"
            onPress={() => navigation.navigate("SearchFilters")}
            size="small"
            style={styles.adjustButton}
          />
        </View>
      )}

      {/* List View */}
      {viewMode === "list" &&
        !isLoading &&
        !error &&
        nearbyProperties.length > 0 && (
          <FlatList
            data={nearbyProperties}
            renderItem={renderPropertyCard}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}

      {/* Map View */}
      {viewMode === "map" &&
        !isLoading &&
        !error &&
        nearbyProperties.length > 0 &&
        userLocation && (
          <View style={styles.mapContainer}>
            <MapView
              ref={mapRef}
              style={styles.map}
              provider={PROVIDER_GOOGLE}
              initialRegion={{
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
                latitudeDelta: 0.04,
                longitudeDelta: 0.04,
              }}
              onRegionChangeComplete={onRegionChangeComplete}
              showsUserLocation
              showsMyLocationButton
            >
              {nearbyProperties.map((property, index) =>
                renderMarker(property, index)
              )}
            </MapView>

            <Animated.FlatList
              ref={flatListRef}
              data={nearbyProperties}
              renderItem={renderPropertyCardOnMap}
              keyExtractor={(item) => item._id}
              horizontal
              pagingEnabled
              scrollEventThrottle={1}
              showsHorizontalScrollIndicator={false}
              snapToInterval={CARD_WIDTH + 20}
              snapToAlignment="center"
              contentContainerStyle={styles.mapCardList}
              onScroll={Animated.event(
                [
                  {
                    nativeEvent: {
                      contentOffset: {
                        x: mapAnimation,
                      },
                    },
                  },
                ],
                { useNativeDriver: true }
              )}
              onMomentumScrollEnd={(event) => {
                const index = Math.floor(
                  event.nativeEvent.contentOffset.x / (CARD_WIDTH + 20)
                );
                scrollIndex.current = index;

                // Center the map on the selected property
                if (
                  mapRef.current &&
                  nearbyProperties[index] &&
                  nearbyProperties[index].address.location.coordinates
                ) {
                  mapRef.current.animateToRegion(
                    {
                      latitude:
                        nearbyProperties[index].address.location.coordinates[1],
                      longitude:
                        nearbyProperties[index].address.location.coordinates[0],
                      latitudeDelta: 0.04,
                      longitudeDelta: 0.04,
                    },
                    350
                  );
                }
              }}
            />
          </View>
        )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLOR_SCHEME.BACKGROUND,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLOR_SCHEME.DARK,
  },
  notificationButton: {
    padding: 5,
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: 5,
    right: 5,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLOR_SCHEME.DANGER,
  },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingBottom: 15,
    alignItems: "center",
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLOR_SCHEME.WHITE,
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 45,
    shadowColor: COLOR_SCHEME.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLOR_SCHEME.DARK,
  },
  filterButton: {
    backgroundColor: COLOR_SCHEME.WHITE,
    width: 45,
    height: 45,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
    shadowColor: COLOR_SCHEME.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  viewToggleContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  viewToggleButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: COLOR_SCHEME.WHITE,
  },
  activeViewToggleButton: {
    backgroundColor: COLOR_SCHEME.PRIMARY,
  },
  viewToggleText: {
    marginLeft: 5,
    fontSize: 14,
    color: COLOR_SCHEME.DARK,
  },
  activeViewToggleText: {
    color: COLOR_SCHEME.WHITE,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
    paddingHorizontal: 40,
  },
  errorText: {
    marginTop: 10,
    marginBottom: 20,
    fontSize: 16,
    color: COLOR_SCHEME.DARK,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    marginTop: 20,
    fontSize: 20,
    fontWeight: "bold",
    color: COLOR_SCHEME.DARK,
  },
  emptyText: {
    marginTop: 10,
    marginBottom: 20,
    fontSize: 16,
    color: COLOR_SCHEME.DARK,
    textAlign: "center",
  },
  adjustButton: {
    marginTop: 10,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: "center",
  },
  propertyCard: {
    marginBottom: 16,
  },
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  markerContainer: {
    alignItems: "center",
  },
  marker: {
    backgroundColor: COLOR_SCHEME.PRIMARY,
    padding: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLOR_SCHEME.WHITE,
  },
  markerText: {
    color: COLOR_SCHEME.WHITE,
    fontSize: 12,
    fontWeight: "bold",
  },
  markerTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 10,
    borderStyle: "solid",
    backgroundColor: "transparent",
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: COLOR_SCHEME.PRIMARY,
    marginTop: -1,
  },
  mapCardList: {
    position: "absolute",
    bottom: 20,
    paddingHorizontal: (width - CARD_WIDTH) / 2,
  },
  cardContainer: {
    width: CARD_WIDTH,
    marginHorizontal: 10,
  },
});

export default HomeScreen;
