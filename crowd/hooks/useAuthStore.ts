import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../services/api";
import { UserRoles } from "../constants";

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  profileImage?: string;
}

export interface UserProfile {
  user: User;
  [key: string]: any; // Additional profile fields based on role
}

interface LoginCredentials {
  email?: string;
  phone?: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: string;
}

interface OtpData {
  userId?: string;
  otp: string;
  verificationType?: "email" | "phone" | "both";
}

interface AuthState {
  token: string | null;
  user: User | null;
  userProfile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  verificationId: string | null;

  // Actions
  register: (userData: RegisterData) => Promise<any>;
  verifyOTP: (data: OtpData) => Promise<any>;
  login: (credentials: LoginCredentials) => Promise<any>;
  getUserProfile: () => Promise<UserProfile | null>;
  updateUserDetails: (userData: Partial<User>) => Promise<any>;
  updatePassword: (passwordData: {
    currentPassword: string;
    newPassword: string;
  }) => Promise<any>;
  forgotPassword: (data: { email?: string; phone?: string }) => Promise<any>;
  resetPassword: (resetToken: string, newPassword: string) => Promise<any>;
  resendOTP: (data: {
    userId?: string;
    verificationType?: "email" | "phone" | "both";
  }) => Promise<any>;
  logout: () => void;
  clearError: () => void;
  refreshToken: () => Promise<boolean>;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      userProfile: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      verificationId: null,

      // Register a new user
      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.post("/auth/register", userData);
          set({
            verificationId: response.data.data.userId,
            isLoading: false,
          });
          return response.data;
        } catch (error: any) {
          set({
            error: error.response?.data?.error || "Registration failed",
            isLoading: false,
          });
          throw error;
        }
      },

      // Verify OTP
      verifyOTP: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.post("/auth/verify-otp", {
            userId: get().verificationId || data.userId,
            otp: data.otp,
            verificationType: data.verificationType,
          });

          set({
            token: response.data.token,
            user: response.data.user,
            isAuthenticated: true,
            isLoading: false,
            verificationId: null,
          });

          // Set token in API client
          apiClient.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${response.data.token}`;

          return response.data;
        } catch (error: any) {
          set({
            error: error.response?.data?.error || "OTP verification failed",
            isLoading: false,
          });
          throw error;
        }
      },

      // Login a user
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.post("/auth/login", credentials);
          set({
            token: response.data.token,
            user: response.data.user,
            isAuthenticated: true,
            isLoading: false,
          });

          // Set token in API client
          apiClient.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${response.data.token}`;

          // Fetch user profile
          get().getUserProfile();

          return response.data;
        } catch (error: any) {
          set({
            error: error.response?.data?.error || "Login failed",
            isLoading: false,
          });
          throw error;
        }
      },

      refreshToken: async () => {
        if (!get().token) return false;

        try {
          const response = await apiClient.post("/auth/refresh-token");
          set({
            token: response.data.token,
            isAuthenticated: true,
          });

          // Update token in API client
          apiClient.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${response.data.token}`;
          return true;
        } catch (error) {
          // If refresh fails, log user out
          get().logout();
          return false;
        }
      },

      // Get user profile data
      getUserProfile: async () => {
        if (!get().isAuthenticated) return null;

        set({ isLoading: true });
        try {
          const response = await apiClient.get("/auth/me");
          set({
            userProfile: response.data.data,
            isLoading: false,
          });
          return response.data.data;
        } catch (error: any) {
          set({
            error:
              error.response?.data?.error || "Failed to fetch user profile",
            isLoading: false,
          });
          throw error;
        }
      },

      // Update user details
      updateUserDetails: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.put("/auth/me", userData);

          if (get().user) {
            set({
              user: { ...get().user, ...response.data.data },
              isLoading: false,
            });
          }

          // Refresh profile
          get().getUserProfile();

          return response.data;
        } catch (error: any) {
          set({
            error: error.response?.data?.error || "Update failed",
            isLoading: false,
          });
          throw error;
        }
      },

      // Update password
      updatePassword: async (passwordData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.put(
            "/auth/update-password",
            passwordData
          );
          set({ isLoading: false });
          return response.data;
        } catch (error: any) {
          set({
            error: error.response?.data?.error || "Password update failed",
            isLoading: false,
          });
          throw error;
        }
      },

      // Forgot password
      forgotPassword: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.post("/auth/forgot-password", data);
          set({ isLoading: false });
          return response.data;
        } catch (error: any) {
          set({
            error: error.response?.data?.error || "Request failed",
            isLoading: false,
          });
          throw error;
        }
      },

      // Reset password
      resetPassword: async (resetToken, newPassword) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.put(
            `/auth/reset-password/${resetToken}`,
            {
              password: newPassword,
            }
          );
          set({ isLoading: false });
          return response.data;
        } catch (error: any) {
          set({
            error: error.response?.data?.error || "Password reset failed",
            isLoading: false,
          });
          throw error;
        }
      },

      // Resend OTP
      resendOTP: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.post("/auth/resend-otp", {
            userId: get().verificationId || data.userId,
            verificationType: data.verificationType,
          });
          set({ isLoading: false });
          return response.data;
        } catch (error: any) {
          set({
            error: error.response?.data?.error || "Failed to resend OTP",
            isLoading: false,
          });
          throw error;
        }
      },

      // Logout
      logout: () => {
        // Remove token from API client
        // delete apiClient.defaults.headers.common["Authorization"];
        apiClient.defaults.headers.common["Authorization"] = undefined;

        set({
          token: null,
          user: null,
          userProfile: null,
          isAuthenticated: false,
          verificationId: null,
          error: null,
        });
      },

      // Clear errors
      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
