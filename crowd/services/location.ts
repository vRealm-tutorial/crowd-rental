import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Coordinates {
  latitude: number;
  longitude: number;
  timestamp?: number;
}

export interface LocationAddress {
  city: string;
  country: string;
  district: string;
  isoCountryCode: string;
  name: string;
  postalCode: string;
  region: string;
  street: string;
  subregion: string;
  timezone: string;
}

class LocationService {
  private locationPermission: Location.PermissionStatus | null = null;
  private lastKnownLocation: Coordinates | null = null;
  private readonly LOCATION_CACHE_KEY = "user_location_cache";
  private readonly LOCATION_CACHE_EXPIRY = 30 * 60 * 1000; // 30 minutes

  // Request location permissions
  async requestLocationPermission(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      this.locationPermission = status;
      return status === "granted";
    } catch (error) {
      console.error("Error requesting location permission:", error);
      return false;
    }
  }

  // Check if location permission is granted
  async hasLocationPermission(): Promise<boolean> {
    if (this.locationPermission) {
      return this.locationPermission === "granted";
    }

    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      this.locationPermission = status;
      return status === "granted";
    } catch (error) {
      console.error("Error checking location permission:", error);
      return false;
    }
  }

  // Get the user's current location
  async getCurrentLocation(forceRefresh = false): Promise<Coordinates> {
    // Check if we have permission
    const hasPermission = await this.hasLocationPermission();
    if (!hasPermission) {
      throw new Error("Location permission not granted");
    }

    // Try to get cached location first if not forcing refresh
    if (!forceRefresh) {
      const cachedLocation = await this.getCachedLocation();
      if (cachedLocation) {
        this.lastKnownLocation = cachedLocation;
        return cachedLocation;
      }
    }

    try {
      // Get current location with high accuracy
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      this.lastKnownLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: new Date().getTime(),
      };

      // Cache the location
      await this.cacheLocation(this.lastKnownLocation);

      return this.lastKnownLocation;
    } catch (error) {
      console.error("Error getting current location:", error);
      throw error;
    }
  }

  // Cache the user's location
  async cacheLocation(location: Coordinates): Promise<void> {
    try {
      await AsyncStorage.setItem(
        this.LOCATION_CACHE_KEY,
        JSON.stringify(location)
      );
    } catch (error) {
      console.error("Error caching location:", error);
    }
  }

  // Get cached location
  async getCachedLocation(): Promise<Coordinates | null> {
    try {
      const cachedLocationString = await AsyncStorage.getItem(
        this.LOCATION_CACHE_KEY
      );
      if (!cachedLocationString) return null;

      const cachedLocation = JSON.parse(cachedLocationString) as Coordinates;
      const now = new Date().getTime();

      // Check if cached location is still valid
      if (
        cachedLocation.timestamp &&
        now - cachedLocation.timestamp < this.LOCATION_CACHE_EXPIRY
      ) {
        return cachedLocation;
      }

      return null;
    } catch (error) {
      console.error("Error getting cached location:", error);
      return null;
    }
  }

  // Get address from coordinates (reverse geocoding)
  async getAddressFromCoordinates(
    latitude: number,
    longitude: number
  ): Promise<LocationAddress | null> {
    try {
      const addresses = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (addresses && addresses.length > 0) {
        return addresses[0] as LocationAddress;
      }

      return null;
    } catch (error) {
      console.error("Error getting address from coordinates:", error);
      throw error;
    }
  }

  // Get coordinates from address (forward geocoding)
  async getCoordinatesFromAddress(
    address: string
  ): Promise<Coordinates | null> {
    try {
      const locations = await Location.geocodeAsync(address);

      if (locations && locations.length > 0) {
        return {
          latitude: locations[0].latitude,
          longitude: locations[0].longitude,
        };
      }

      return null;
    } catch (error) {
      console.error("Error getting coordinates from address:", error);
      throw error;
    }
  }

  // Calculate distance between two coordinates in kilometers
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    // Earth's radius in kilometers
    const earthRadius = 6371;

    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return earthRadius * c;
  }

  // Calculate estimated travel time by car in minutes
  calculateTravelTime(distanceKm: number): number {
    // Average speed in Nigerian cities: assume 40 km/h
    const avgSpeed = 40;

    // Convert to time in minutes: (distance / speed) * 60
    return (distanceKm / avgSpeed) * 60;
  }

  // Convert degrees to radians
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

export default new LocationService();
