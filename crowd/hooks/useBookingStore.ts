import { create } from "zustand";
import apiClient from "../services/api";
import { UserRoles, ViewingStatus } from "../constants";

// Types
export interface Viewing {
  _id: string;
  property:
    | string
    | {
        _id: string;
        title: string;
        address: {
          fullAddress: string;
          area: string;
          city: string;
        };
        images: Array<{
          url: string;
          isPrimary: boolean;
        }>;
        [key: string]: any;
      };
  tenant:
    | string
    | {
        _id: string;
        user: {
          name: string;
          phone: string;
          email: string;
        };
      };
  agent:
    | string
    | null
    | {
        _id: string;
        user: {
          name: string;
          phone: string;
          email: string;
        };
      };
  landlord:
    | string
    | {
        _id: string;
        user: {
          name: string;
          phone: string;
          email: string;
        };
      };
  scheduledDate: string;
  status: ViewingStatus;
  isFarDistance: boolean;
  additionalFee: number;
  cancellationTime?: string;
  feedback?: {
    tenant?: {
      rating: number;
      comment: string;
      createdAt: string;
    };
    agent?: {
      rating: number;
      comment: string;
      createdAt: string;
    };
  };
  notes?: string;
  transaction?: string;
  createdAt: string;
}

export interface BookingData {
  scheduledDate: Date;
  notes?: string;
  [key: string]: any;
}

export interface FeedbackData {
  rating: number;
  comment: string;
}

export interface SubscriptionData {
  isActive: boolean;
  startDate: string;
  endDate: string;
  baseViewings: number;
  extraViewingsPurchased: number;
  viewingsRemaining: number;
  transactionId?: string;
}

interface BookingState {
  viewings: Viewing[];
  currentViewing: Viewing | null;
  upcomingViewings: Viewing[];
  pastViewings: Viewing[];
  selectedDate: Date;
  isLoading: boolean;
  error: string | null;

  // Actions
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  setSelectedDate: (date: Date) => void;
  fetchTenantViewings: () => Promise<Viewing[]>;
  fetchLandlordViewings: (propertyId?: string) => Promise<Viewing[]>;
  fetchAgentViewings: (propertyId?: string) => Promise<Viewing[]>;
  fetchViewingById: (viewingId: string) => Promise<Viewing>;
  bookViewing: (
    propertyId: string,
    bookingData: BookingData
  ) => Promise<Viewing>;
  updateViewing: (
    viewingId: string,
    updatedData: Partial<BookingData>
  ) => Promise<Viewing>;
  cancelViewing: (viewingId: string) => Promise<any>;
  submitViewingFeedback: (
    viewingId: string,
    feedback: FeedbackData
  ) => Promise<Viewing>;
  updateViewingStatus: (
    viewingId: string,
    status: ViewingStatus,
    notes?: string
  ) => Promise<Viewing>;
  checkSubscriptionStatus: () => Promise<SubscriptionData>;
  purchaseSubscription: () => Promise<any>;
}

const useBookingStore = create<BookingState>((set, get) => ({
  viewings: [],
  currentViewing: null,
  upcomingViewings: [],
  pastViewings: [],
  selectedDate: new Date(),
  isLoading: false,
  error: null,

  // Set loading state
  setLoading: (isLoading) => set({ isLoading }),

  // Set error
  setError: (error) => set({ error }),

  // Clear error
  clearError: () => set({ error: null }),

  // Set selected date for booking
  setSelectedDate: (date) => set({ selectedDate: date }),

  // Get tenant viewings
  fetchTenantViewings: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await apiClient.get("/tenant/viewings");

      // Separate viewings into upcoming and past
      const now = new Date();
      const upcoming: Viewing[] = [];
      const past: Viewing[] = [];

      response.data.data.forEach((viewing: Viewing) => {
        const viewingDate = new Date(viewing.scheduledDate);
        if (
          viewingDate > now ||
          viewing.status === ViewingStatus.PENDING ||
          viewing.status === ViewingStatus.CONFIRMED
        ) {
          upcoming.push(viewing);
        } else {
          past.push(viewing);
        }
      });

      set({
        viewings: response.data.data,
        upcomingViewings: upcoming,
        pastViewings: past,
        isLoading: false,
      });

      return response.data.data;
    } catch (error: any) {
      set({
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to fetch viewings",
        isLoading: false,
      });
      throw error;
    }
  },

  // Get landlord viewings
  fetchLandlordViewings: async (propertyId = undefined) => {
    set({ isLoading: true, error: null });

    try {
      let url = "/landlord/viewings";
      if (propertyId) {
        url = `/properties/${propertyId}/viewings`;
      }

      const response = await apiClient.get(url);

      // Separate viewings into upcoming and past
      const now = new Date();
      const upcoming: Viewing[] = [];
      const past: Viewing[] = [];

      response.data.data.forEach((viewing: Viewing) => {
        const viewingDate = new Date(viewing.scheduledDate);
        if (
          viewingDate > now ||
          viewing.status === ViewingStatus.PENDING ||
          viewing.status === ViewingStatus.CONFIRMED
        ) {
          upcoming.push(viewing);
        } else {
          past.push(viewing);
        }
      });

      set({
        viewings: response.data.data,
        upcomingViewings: upcoming,
        pastViewings: past,
        isLoading: false,
      });

      return response.data.data;
    } catch (error: any) {
      set({
        error: error.response?.data?.error || "Failed to fetch viewings",
        isLoading: false,
      });
      throw error;
    }
  },

  // Get agent viewings
  fetchAgentViewings: async (propertyId = undefined) => {
    set({ isLoading: true, error: null });

    try {
      let url = "/agent/viewings";
      if (propertyId) {
        url = `/properties/${propertyId}/viewings`;
      }

      const response = await apiClient.get(url);

      // Separate viewings into upcoming and past
      const now = new Date();
      const upcoming: Viewing[] = [];
      const past: Viewing[] = [];

      response.data.data.forEach((viewing: Viewing) => {
        const viewingDate = new Date(viewing.scheduledDate);
        if (
          viewingDate > now ||
          viewing.status === ViewingStatus.PENDING ||
          viewing.status === ViewingStatus.CONFIRMED
        ) {
          upcoming.push(viewing);
        } else {
          past.push(viewing);
        }
      });

      set({
        viewings: response.data.data,
        upcomingViewings: upcoming,
        pastViewings: past,
        isLoading: false,
      });

      return response.data.data;
    } catch (error: any) {
      set({
        error: error.response?.data?.error || "Failed to fetch viewings",
        isLoading: false,
      });
      throw error;
    }
  },

  // Get viewing details
  fetchViewingById: async (viewingId) => {
    set({ isLoading: true, error: null });

    try {
      const response = await apiClient.get(`/tenant/viewings/${viewingId}`);

      set({
        currentViewing: response.data.data,
        isLoading: false,
      });

      return response.data.data;
    } catch (error: any) {
      set({
        error: error.response?.data?.error || "Failed to fetch viewing details",
        isLoading: false,
      });
      throw error;
    }
  },

  // Book a viewing (tenant)
  bookViewing: async (propertyId, bookingData) => {
    set({ isLoading: true, error: null });

    try {
      const response = await apiClient.post("/tenant/viewings", {
        propertyId,
        ...bookingData,
        scheduledDate: bookingData.scheduledDate || get().selectedDate,
      });

      set((state) => ({
        viewings: [response.data.data, ...state.viewings],
        upcomingViewings: [response.data.data, ...state.upcomingViewings],
        currentViewing: response.data.data,
        isLoading: false,
      }));

      return response.data.data;
    } catch (error: any) {
      set({
        error: error.response?.data?.error || "Failed to book viewing",
        isLoading: false,
      });
      throw error;
    }
  },

  // Update a viewing (reschedule)
  updateViewing: async (viewingId, updatedData) => {
    set({ isLoading: true, error: null });

    try {
      const response = await apiClient.put(
        `/tenant/viewings/${viewingId}`,
        updatedData
      );

      // Update the viewing in all lists
      const updateViewingInList = (list: Viewing[]) => {
        return list.map((viewing) =>
          viewing._id === viewingId ? response.data.data : viewing
        );
      };

      set((state) => ({
        viewings: updateViewingInList(state.viewings),
        upcomingViewings: updateViewingInList(state.upcomingViewings),
        pastViewings: updateViewingInList(state.pastViewings),
        currentViewing: response.data.data,
        isLoading: false,
      }));

      return response.data.data;
    } catch (error: any) {
      set({
        error: error.response?.data?.error || "Failed to update viewing",
        isLoading: false,
      });
      throw error;
    }
  },

  // Cancel a viewing
  cancelViewing: async (viewingId) => {
    set({ isLoading: true, error: null });

    try {
      const response = await apiClient.delete(`/tenant/viewings/${viewingId}`);

      // Update the viewing status in all lists
      const updateViewingStatus = (list: Viewing[]) => {
        return list.map((viewing) =>
          viewing._id === viewingId
            ? { ...viewing, status: ViewingStatus.CANCELED }
            : viewing
        );
      };

      set((state) => ({
        viewings: updateViewingStatus(state.viewings),
        upcomingViewings: updateViewingStatus(state.upcomingViewings),
        pastViewings: updateViewingStatus(state.pastViewings),
        currentViewing:
          state.currentViewing?._id === viewingId
            ? { ...state.currentViewing, status: ViewingStatus.CANCELED }
            : state.currentViewing,
        isLoading: false,
      }));

      return response.data;
    } catch (error: any) {
      set({
        error: error.response?.data?.error || "Failed to cancel viewing",
        isLoading: false,
      });
      throw error;
    }
  },

  // Submit viewing feedback
  submitViewingFeedback: async (viewingId, feedback) => {
    set({ isLoading: true, error: null });

    try {
      const response = await apiClient.post(
        `/tenant/viewings/${viewingId}/feedback`,
        feedback
      );

      // Update the viewing in all lists
      const updateViewingInList = (list: Viewing[]) => {
        return list.map((viewing) =>
          viewing._id === viewingId ? response.data.data : viewing
        );
      };

      set((state) => ({
        viewings: updateViewingInList(state.viewings),
        upcomingViewings: updateViewingInList(state.upcomingViewings),
        pastViewings: updateViewingInList(state.pastViewings),
        currentViewing: response.data.data,
        isLoading: false,
      }));

      return response.data.data;
    } catch (error: any) {
      set({
        error: error.response?.data?.error || "Failed to submit feedback",
        isLoading: false,
      });
      throw error;
    }
  },

  // Agent/Landlord update viewing status
  updateViewingStatus: async (viewingId, status, notes = undefined) => {
    set({ isLoading: true, error: null });

    try {
      // Choose the right endpoint based on user role
      // This could be enhanced to dynamically determine the endpoint based on the user's role
      const role = /* get().currentUser?.role */ "agent" as UserRoles;
      const endpoint =
        role === "landlord"
          ? `/landlord/viewings`
          : role === "tenant"
          ? `/tenant/viewings`
          : `/agent/viewings`;

      const response = await apiClient.put(`${endpoint}/${viewingId}`, {
        status,
        notes,
      });

      // Update the viewing in all lists
      const updateViewingInList = (list: Viewing[]) => {
        return list.map((viewing) =>
          viewing._id === viewingId ? response.data.data : viewing
        );
      };

      set((state) => ({
        viewings: updateViewingInList(state.viewings),
        upcomingViewings: updateViewingInList(state.upcomingViewings),
        pastViewings: updateViewingInList(state.pastViewings),
        currentViewing: response.data.data,
        isLoading: false,
      }));

      return response.data.data;
    } catch (error: any) {
      set({
        error:
          error.response?.data?.error ||
          `Failed to update viewing to ${status}`,
        isLoading: false,
      });
      throw error;
    }
  },

  // Check tenant subscription status
  checkSubscriptionStatus: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await apiClient.get("/tenant/subscription");

      set({ isLoading: false });

      return response.data.data;
    } catch (error: any) {
      set({
        error:
          error.response?.data?.error || "Failed to check subscription status",
        isLoading: false,
      });
      throw error;
    }
  },

  // Purchase subscription (tenant)
  purchaseSubscription: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await apiClient.post("/tenant/subscription");

      set({ isLoading: false });

      return response.data.data;
    } catch (error: any) {
      set({
        error: error.response?.data?.error || "Failed to purchase subscription",
        isLoading: false,
      });
      throw error;
    }
  },
}));

export default useBookingStore;
