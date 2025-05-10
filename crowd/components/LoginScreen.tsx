import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";

import { COLOR_SCHEME } from "../constants";
import useAuthStore from "../hooks/useAuthStore";
import useForm from "../hooks/useForm";
import { loginSchema } from "../utils/validationSchemas";
import { useRouter } from "expo-router";

// Define the form values interface based on the Zod schema
interface LoginFormValues {
  identifier: string;
  password: string;
  loginMethod: "email" | "phone";
}

const LoginScreen = () => {
  const router = useRouter();

  // Get auth store functions
  const { login, isLoading, error, clearError } = useAuthStore();

  // Initialize form with useForm hook and Zod schema
  const { values, errors, handleChange, handleSubmit, setFieldValue } =
    useForm<LoginFormValues>({
      initialValues: {
        identifier: "",
        password: "",
        loginMethod: "email",
      },
      schema: loginSchema,
      onSubmit: handleLogin,
    });

  const modifyHandleSubmit = () => {
    if (values.loginMethod === "phone") {
      // For phone login, don't validate password
      if (values.identifier.trim()) {
        handleLogin({
          identifier: values.identifier,
          password: "",
          loginMethod: "phone",
        });
      } else {
        // Show error for empty phone
        Alert.alert("Error", "Please enter your phone number");
      }
    } else {
      // For email login, use normal validation
      handleSubmit();
    }
  };

  // Password visibility toggle
  const [passwordVisible, setPasswordVisible] = useState(false);

  // Clear any auth store errors when component mounts
  useEffect(() => {
    clearError();
  }, []);

  // Show error alert if login fails
  useEffect(() => {
    if (error) {
      Alert.alert("Login Failed", error);
    }
  }, [error]);

  // Toggle login method between email and phone
  const toggleLoginMethod = () => {
    const newMethod = values.loginMethod === "email" ? "phone" : "email";
    setFieldValue("loginMethod", newMethod);
    setFieldValue("identifier", "");
  };

  // Handle login submission
  async function handleLogin(formValues: LoginFormValues) {
    console.log("handleLogin called with:", formValues);

    try {
      // Prepare login params based on method
      // const loginParams = {
      //   password: formValues.password,
      // };

      if (formValues.loginMethod === "email") {
        // (loginParams as any).email = formValues.identifier;
        console.log("Using email login flow");
        // Email login requires password
        await login({
          email: formValues.identifier,
          password: formValues.password,
        });
        // Navigation will be handled by the protected route logic
      } else {
        // (loginParams as any).phone = formValues.identifier;
        console.log("Using phone login flow");

        // Phone login goes directly to OTP verification
        // You might need to call a different API endpoint here to request OTP
        console.log(formValues);
        await requestPhoneOTP(formValues.identifier);

        console.log(
          "OTP requested successfully, navigating to verification screen"
        );

        // Navigate to OTP verification screen
        // setTimeout(() => {
        router.push({
          pathname: "/otp-verification",
          params: { verificationType: "phone" },
        });
        // }, 100);
      }

      // await login(loginParams);
      // Navigation is handled automatically in the App.tsx component
    } catch (err) {
      // Error is handled by the useEffect above
      console.log("Login error:", err);
      // Make sure to show any errors that occur
      Alert.alert(
        "Error",
        err instanceof Error ? err?.message : "An error occurred during login"
      );
    }
  }

  // Add a function to request phone OTP
  const requestPhoneOTP = async (phoneNumber: string) => {
    // This would call your backend API to send an OTP to the phone number
    // Implementation depends on your API
    try {
      // await authApi.requestPhoneOTP(phoneNumber);
      console.log("Sending OTP to phone number:", phoneNumber);

      setTimeout(() => {
        console.log("OTP sent: 123456"); // Demo OTP code
      }, 1000);

      // No need to throw error for demo
      return { success: true };
    } catch (error) {
      console.error("Error sending OTP:", error);
      throw error;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <StatusBar style="dark" />

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={COLOR_SCHEME.DARK} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Login to Your Account</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.contentContainer}>
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                values.loginMethod === "email" && styles.activeToggle,
              ]}
              onPress={() => setFieldValue("loginMethod", "email")}
            >
              <Text
                style={[
                  styles.toggleText,
                  values.loginMethod === "email" && styles.activeToggleText,
                ]}
              >
                Email
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toggleButton,
                values.loginMethod === "phone" && styles.activeToggle,
              ]}
              onPress={() => setFieldValue("loginMethod", "phone")}
            >
              <Text
                style={[
                  styles.toggleText,
                  values.loginMethod === "phone" && styles.activeToggleText,
                ]}
              >
                Phone
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>
              {values.loginMethod === "email"
                ? "Email Address"
                : "Phone Number"}
            </Text>
            <View
              style={[
                styles.inputWrapper,
                errors.identifier && styles.inputError,
              ]}
            >
              <TextInput
                style={styles.input}
                placeholder={
                  values.loginMethod === "email"
                    ? "Enter your email address"
                    : "Enter your phone number"
                }
                value={values.identifier}
                onChangeText={(text) => handleChange("identifier", text)}
                keyboardType={
                  values.loginMethod === "email" ? "email-address" : "phone-pad"
                }
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            {errors.identifier && (
              <Text style={styles.errorText}>{errors.identifier}</Text>
            )}
          </View>

          {values.loginMethod === "email" && (
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <View
                style={[
                  styles.inputWrapper,
                  errors.password && styles.inputError,
                ]}
              >
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  value={values.password}
                  onChangeText={(text) => handleChange("password", text)}
                  secureTextEntry={!passwordVisible}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setPasswordVisible(!passwordVisible)}
                >
                  <Ionicons
                    name={passwordVisible ? "eye-off" : "eye"}
                    size={22}
                    color={COLOR_SCHEME.DARK}
                  />
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
            </View>
          )}

          {values.loginMethod === "email" && (
            <TouchableOpacity
              style={styles.forgotPasswordButton}
              onPress={() => router.push("/forgot-password")}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.loginButton}
            // onPress={() => handleSubmit()}
            onPress={() => modifyHandleSubmit()}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={COLOR_SCHEME.WHITE} />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => router.push("/role-selection")}>
              <Text style={styles.registerLink}>Register</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLOR_SCHEME.DARK,
  },
  contentContainer: {
    padding: 20,
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: COLOR_SCHEME.LIGHT,
    borderRadius: 8,
    marginBottom: 25,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 6,
  },
  activeToggle: {
    backgroundColor: COLOR_SCHEME.WHITE,
    shadowColor: COLOR_SCHEME.DARK,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: "500",
    color: COLOR_SCHEME.DARK,
  },
  activeToggleText: {
    color: COLOR_SCHEME.PRIMARY,
    fontWeight: "bold",
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLOR_SCHEME.DARK,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLOR_SCHEME.BORDER,
    borderRadius: 8,
    paddingHorizontal: 15,
    height: 50,
  },
  inputError: {
    borderColor: COLOR_SCHEME.DANGER,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: COLOR_SCHEME.DARK,
  },
  passwordToggle: {
    padding: 10,
  },
  errorText: {
    fontSize: 12,
    color: COLOR_SCHEME.DANGER,
    marginTop: 5,
  },
  forgotPasswordButton: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: COLOR_SCHEME.PRIMARY,
    fontWeight: "500",
  },
  loginButton: {
    backgroundColor: COLOR_SCHEME.PRIMARY,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  loginButtonText: {
    color: COLOR_SCHEME.WHITE,
    fontSize: 16,
    fontWeight: "bold",
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  registerText: {
    fontSize: 14,
    color: COLOR_SCHEME.DARK,
    marginRight: 5,
  },
  registerLink: {
    fontSize: 14,
    color: COLOR_SCHEME.PRIMARY,
    fontWeight: "bold",
  },
});

export default LoginScreen;
