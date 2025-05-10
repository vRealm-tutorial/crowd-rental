import { create } from "zustand";
import apiClient from "../services/api";
import locationService from "../services/location";
import { PropertyType, PropertyFeature } from "../constants";

// Types
export interface PropertyAddress {
  street: string;
  area: string;
  city: string;
  state: string;
  fullAddress?: string;
  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
}

export interface PropertyImage {
  _id?: string;
  url: string;
  caption?: string;
  isPrimary: boolean;
}

export interface Property {
  _id: string;
  title: string;
  description: string;
  landlord: string;
  agent?: string;
  propertyType: PropertyType;
  bedrooms: number;
  bathrooms: number;
  size: number;
  features: PropertyFeature[];
  address: PropertyAddress;
  price: {
    amount: number;
    currency: string;
    paymentFrequency: string;
  };
  images: PropertyImage[];
  availabilityDate: string;
  status: "available" | "booked" | "rented" | "hidden" | "pending_approval";
  viewings?: string[];
  verified: boolean;
  lastUpdated: string;
  saveCount: number;
  viewCount: number;
  createdAt: string;
}

export interface PropertyFilters {
  priceMin?: number | null;
  priceMax?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  propertyType?: PropertyType | null;
  features?: PropertyFeature[];
  location?: string | null;
  distance?: number;
}

export interface Pagination {
  page: number;
  limit: number;
  totalPages: number;
  totalCount: number;
}

export interface PropertyImageUpload {
  uri: string;
  type?: string;
  fileName?: string;
}

interface PropertyState {
  properties: Property[];
  nearbyProperties: Property[];
  savedProperties: Property[];
  currentProperty: Property | null;
  isLoading: boolean;
  error: string | null;
  filters: PropertyFilters;
  pagination: Pagination;

  // Actions
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  setFilters: (filters: Partial<PropertyFilters>) => void;
  resetFilters: () => void;
  fetchProperties: () => Promise<any>;
  fetchNearbyProperties: (
    coords?: { latitude: number; longitude: number } | null
  ) => Promise<any>;
  fetchPropertyById: (propertyId: string) => Promise<Property>;
  createProperty: (propertyData: Partial<Property>) => Promise<Property>;
  updateProperty: (
    propertyId: string,
    propertyData: Partial<Property>
  ) => Promise<Property>;
  deleteProperty: (propertyId: string) => Promise<{ success: boolean }>;
  uploadPropertyImages: (
    propertyId: string,
    imageFiles: PropertyImageUpload[]
  ) => Promise<any>;
  deletePropertyImage: (
    propertyId: string,
    imageId: string
  ) => Promise<{ success: boolean }>;
  fetchSavedProperties: () => Promise<Property[]>;
  saveProperty: (propertyId: string) => Promise<any>;
  removeSavedProperty: (propertyId: string) => Promise<{ success: boolean }>;
  loadMoreProperties: () => Promise<any | null>;
  loadMoreNearbyProperties: () => Promise<any | null>;
  resetPagination: () => void;
}

const usePropertyStore = create<PropertyState>((set, get) => ({
  properties: [],
  nearbyProperties: [],
  savedProperties: [],
  currentProperty: null,
  isLoading: false,
  error: null,
  filters: {
    priceMin: null,
    priceMax: null,
    bedrooms: null,
    bathrooms: null,
    propertyType: null,
    features: [],
    location: null,
    distance: 30, // Default to 30 minutes
  },
  pagination: {
    page: 1,
    limit: 10,
    totalPages: 1,
    totalCount: 0,
  },

  // Set loading state
  setLoading: (isLoading) => set({ isLoading }),

  // Set error
  setError: (error) => set({ error }),

  // Clear error
  clearError: () => set({ error: null }),

  // Set filters
  setFilters: (filters) =>
    set({
      filters: { ...get().filters, ...filters },
      // Reset pagination when filters change
      pagination: { ...get().pagination, page: 1 },
    }),

  // Reset filters
  resetFilters: () =>
    set({
      filters: {
        priceMin: null,
        priceMax: null,
        bedrooms: null,
        bathrooms: null,
        propertyType: null,
        features: [],
        location: null,
        distance: 30,
      },
      pagination: { ...get().pagination, page: 1 },
    }),

  // Fetch properties with optional filters
  fetchProperties: async () => {
    const { filters, pagination } = get();

    set({ isLoading: true, error: null });

    try {
      // Build query parameters
      const params: Record<string, any> = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      };

      // Remove null or undefined values
      Object.keys(params).forEach(
        (key) =>
          (params[key] === null || params[key] === undefined) &&
          delete params[key]
      );

      // Convert features array to comma-separated string if it exists
      if (params.features && params.features.length > 0) {
        params.features = params.features.join(",");
      }

      const response = await apiClient.get("/properties", { params });

      set({
        properties: response.data.data,
        pagination: {
          page: response.data.page,
          limit: response.data.limit,
          totalPages: response.data.totalPages,
          totalCount: response.data.totalCount,
        },
        isLoading: false,
      });

      return response.data;
    } catch (error: any) {
      set({
        error: error.response?.data?.error || "Failed to fetch properties",
        isLoading: false,
      });
      throw error;
    }
  },

  // Fetch nearby properties based on user's current location
  fetchNearbyProperties: async (coords = null) => {
    set({ isLoading: true, error: null });

    try {
      // If coordinates not provided, try to get current location
      let coordinates = coords;
      if (!coordinates) {
        try {
          const location = await locationService.getCurrentLocation();
          coordinates = {
            latitude: location.latitude,
            longitude: location.longitude,
          };
        } catch (locationError) {
          set({
            error:
              "Failed to get your location. Please enable location services.",
            isLoading: false,
          });
          throw locationError;
        }
      }

      const response = await apiClient.get("/properties/nearby", {
        params: {
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          maxDistance: get().filters.distance,
          page: get().pagination.page,
          limit: get().pagination.limit,
        },
      });

      set({
        nearbyProperties: response.data.data,
        pagination: {
          page: response.data.page,
          limit: response.data.limit,
          totalPages: response.data.totalPages,
          totalCount: response.data.totalCount,
        },
        isLoading: false,
      });

      return response.data;
    } catch (error: any) {
      set({
        error:
          error.response?.data?.error || "Failed to fetch nearby properties",
        isLoading: false,
      });
      throw error;
    }
  },

  // Fetch a single property by ID
  fetchPropertyById: async (propertyId) => {
    set({ isLoading: true, error: null });

    try {
      const response = await apiClient.get(`/properties/${propertyId}`);

      set({
        currentProperty: response.data.data,
        isLoading: false,
      });

      return response.data.data;
    } catch (error: any) {
      set({
        error:
          error.response?.data?.error || "Failed to fetch property details",
        isLoading: false,
      });
      throw error;
    }
  },

  // Create a new property (for landlords)
  createProperty: async (propertyData) => {
    set({ isLoading: true, error: null });

    try {
      const response = await apiClient.post("/properties", propertyData);

      // Add the new property to the list
      set((state) => ({
        properties: [response.data.data, ...state.properties],
        currentProperty: response.data.data,
        isLoading: false,
      }));

      return response.data.data;
    } catch (error: any) {
      set({
        error: error.response?.data?.error || "Failed to create property",
        isLoading: false,
      });
      throw error;
    }
  },

  // Update an existing property
  updateProperty: async (propertyId, propertyData) => {
    set({ isLoading: true, error: null });

    try {
      const response = await apiClient.put(
        `/properties/${propertyId}`,
        propertyData
      );

      // Update the property in the list
      set((state) => ({
        properties: state.properties.map((property) =>
          property._id === propertyId ? response.data.data : property
        ),
        nearbyProperties: state.nearbyProperties.map((property) =>
          property._id === propertyId ? response.data.data : property
        ),
        currentProperty: response.data.data,
        isLoading: false,
      }));

      return response.data.data;
    } catch (error: any) {
      set({
        error: error.response?.data?.error || "Failed to update property",
        isLoading: false,
      });
      throw error;
    }
  },

  // Delete a property
  deleteProperty: async (propertyId) => {
    set({ isLoading: true, error: null });

    try {
      await apiClient.delete(`/properties/${propertyId}`);

      // Remove the property from the list
      set((state) => ({
        properties: state.properties.filter(
          (property) => property._id !== propertyId
        ),
        nearbyProperties: state.nearbyProperties.filter(
          (property) => property._id !== propertyId
        ),
        currentProperty: null,
        isLoading: false,
      }));

      return { success: true };
    } catch (error: any) {
      set({
        error: error.response?.data?.error || "Failed to delete property",
        isLoading: false,
      });
      throw error;
    }
  },

  // Upload property images
  uploadPropertyImages: async (propertyId, imageFiles) => {
    set({ isLoading: true, error: null });

    try {
      const formData = new FormData();

      // Append each image to form data
      imageFiles.forEach((file, index) => {
        formData.append("images", {
          uri: file.uri,
          type: file.type || "image/jpeg",
          name: file.fileName || `image_${index}.jpg`,
        } as any);
      });

      const response = await apiClient.post(
        `/properties/${propertyId}/images`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Update the current property with new images
      set((state) => ({
        currentProperty: state.currentProperty
          ? {
              ...state.currentProperty,
              images: response.data.data.images,
            }
          : null,
        isLoading: false,
      }));

      return response.data.data;
    } catch (error: any) {
      set({
        error: error.response?.data?.error || "Failed to upload images",
        isLoading: false,
      });
      throw error;
    }
  },

  // Delete a property image
  deletePropertyImage: async (propertyId, imageId) => {
    set({ isLoading: true, error: null });

    try {
      await apiClient.delete(`/properties/${propertyId}/images/${imageId}`);

      // Update the current property by removing the deleted image
      set((state) => ({
        currentProperty: state.currentProperty
          ? {
              ...state.currentProperty,
              images: state.currentProperty.images.filter(
                (image) => image._id !== imageId
              ),
            }
          : null,
        isLoading: false,
      }));

      return { success: true };
    } catch (error: any) {
      set({
        error: error.response?.data?.error || "Failed to delete image",
        isLoading: false,
      });
      throw error;
    }
  },

  // Fetch saved properties for tenant
  fetchSavedProperties: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await apiClient.get("/tenant/saved-properties");

      set({
        savedProperties: response.data.data,
        isLoading: false,
      });

      return response.data.data;
    } catch (error: any) {
      set({
        error:
          error.response?.data?.error || "Failed to fetch saved properties",
        isLoading: false,
      });
      throw error;
    }
  },

  // Save a property for tenant
  saveProperty: async (propertyId) => {
    set({ isLoading: true, error: null });

    try {
      const response = await apiClient.post(
        `/tenant/saved-properties/${propertyId}`
      );

      // Add the property to saved properties
      set((state) => ({
        savedProperties: [...state.savedProperties, response.data.data],
        isLoading: false,
      }));

      return response.data.data;
    } catch (error: any) {
      set({
        error: error.response?.data?.error || "Failed to save property",
        isLoading: false,
      });
      throw error;
    }
  },

  // Remove a saved property for tenant
  removeSavedProperty: async (propertyId) => {
    set({ isLoading: true, error: null });

    try {
      await apiClient.delete(`/tenant/saved-properties/${propertyId}`);

      // Remove the property from saved properties
      set((state) => ({
        savedProperties: state.savedProperties.filter(
          (property) => property._id !== propertyId
        ),
        isLoading: false,
      }));

      return { success: true };
    } catch (error: any) {
      set({
        error: error.response?.data?.error || "Failed to remove saved property",
        isLoading: false,
      });
      throw error;
    }
  },

  // Load more properties (pagination)
  loadMoreProperties: async () => {
    const { pagination, fetchProperties } = get();

    // Check if there are more pages to load
    if (pagination.page < pagination.totalPages) {
      // Increment page number
      set((state) => ({
        pagination: {
          ...state.pagination,
          page: state.pagination.page + 1,
        },
      }));

      // Fetch the next page of properties
      const response = await fetchProperties();

      // Append new properties to existing list
      set((state) => ({
        properties: [...state.properties, ...response.data],
      }));

      return response;
    }

    return null;
  },

  // Load more nearby properties (pagination)
  loadMoreNearbyProperties: async () => {
    const { pagination, fetchNearbyProperties } = get();

    // Check if there are more pages to load
    if (pagination.page < pagination.totalPages) {
      // Increment page number
      set((state) => ({
        pagination: {
          ...state.pagination,
          page: state.pagination.page + 1,
        },
      }));

      // Fetch the next page of nearby properties
      const response = await fetchNearbyProperties();

      // Append new properties to existing list
      set((state) => ({
        nearbyProperties: [...state.nearbyProperties, ...response.data],
      }));

      return response;
    }

    return null;
  },

  // Reset pagination
  resetPagination: () =>
    set({
      pagination: {
        page: 1,
        limit: 10,
        totalPages: 1,
        totalCount: 0,
      },
    }),
}));

export default usePropertyStore;
