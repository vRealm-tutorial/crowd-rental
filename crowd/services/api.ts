import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@/constants";

// Define response structure
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}

// Add retry property to InternalAxiosRequestConfig
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 15000, // 15 seconds
});

// Add request interceptor
apiClient.interceptors.request.use(
  // async (config: AxiosRequestConfig): Promise<AxiosRequestConfig> => {
  async (
    config: InternalAxiosRequestConfig
  ): Promise<InternalAxiosRequestConfig> => {
    // Try to get token from AsyncStorage
    try {
      const authStorage = await AsyncStorage.getItem("auth-storage");
      if (authStorage) {
        const { state } = JSON.parse(authStorage);
        if (state && state.token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${state.token}`;
        }
      }
    } catch (error) {
      console.error("Error accessing auth storage:", error);
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Add response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;
    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Handle token expiration (401 Unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Clear authentication (user will need to login again)
      try {
        // Remove token from request headers
        delete apiClient.defaults.headers.common["Authorization"];

        // Get auth store
        const authStorage = await AsyncStorage.getItem("auth-storage");
        if (authStorage) {
          const auth = JSON.parse(authStorage);
          // Only clear token and authentication status
          auth.state = {
            ...auth.state,
            token: null,
            isAuthenticated: false,
          };
          await AsyncStorage.setItem("auth-storage", JSON.stringify(auth));
        }
      } catch (storageError) {
        console.error("Error updating auth storage:", storageError);
      }
    }

    // Handle network errors
    if (!error.response) {
      // Check if the error is a network error
      return Promise.reject({
        response: {
          data: {
            error: "Network error. Please check your internet connection.",
          },
        },
      });
    }

    return Promise.reject(error);
  }
);

export default apiClient;
