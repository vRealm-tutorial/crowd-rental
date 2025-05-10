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
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { COLOR_SCHEME, UserRoles } from "../constants";
import useAuthStore from "../hooks/useAuthStore";
import useForm from "../hooks/useForm";
import { registerSchema } from "../utils/validationSchemas";
import { useLocalSearchParams, useRouter } from "expo-router";

// Define the navigation params for the auth stack
type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: { role: UserRoles };
  RoleSelection: undefined;
  OTPVerification: { verificationType: "email" | "phone" | "both" };
};

// Define props type for the component
type RegisterScreenProps = {
  navigation: StackNavigationProp<AuthStackParamList, "Register">;
  route: RouteProp<AuthStackParamList, "Register">;
};

// Define the form values interface based on the Zod schema
interface RegisterFormValues {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: UserRoles;
}

const RegisterScreen = () => {
  const router = useRouter();

  // Get role from navigation params or default to tenant
  const { role } = useLocalSearchParams();
  const rawRole = Array.isArray(role) ? role[0] : role;
  const selectedRole =
    UserRoles[rawRole as keyof typeof UserRoles] ?? UserRoles.TENANT;

  // Get auth store functions
  const {
    register: registerUser,
    isLoading,
    error,
    clearError,
  } = useAuthStore();

  // Initialize form with useForm hook and Zod schema
  const { values, errors, handleChange, handleSubmit, setFieldValues } =
    useForm<RegisterFormValues>({
      initialValues: {
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        role: selectedRole,
      },
      schema: registerSchema,
      onSubmit: handleRegister,
    });

  // Password visibility toggle
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  // Set role in form values when it changes
  useEffect(() => {
    setFieldValues({ role: selectedRole });
  }, [selectedRole]);

  // Clear any auth store errors when component mounts
  useEffect(() => {
    clearError();
  }, []);

  // Show error alert if registration fails
  useEffect(() => {
    if (error) {
      Alert.alert("Registration Failed", error),
        [{ text: "OK", onPress: clearError }];
    }
  }, [error]);

  // Handle registration submission
  async function handleRegister(formValues: RegisterFormValues) {
    try {
      await registerUser({
        name: formValues.name,
        email: formValues.email,
        phone: formValues.phone,
        password: formValues.password,
        role: formValues.role,
      });

      // Navigate to OTP verification
      router.push({
        pathname: "/otp-verification",
        params: { verificationType: "both" },
      });
    } catch (err) {
      // Error is handled by the useEffect above
      console.log("Registration error:", err);
    }
  }

  // Render form input with label and error
  const renderInput = ({
    label,
    field,
    placeholder,
    keyboardType = "default",
    secureTextEntry = false,
    togglePasswordVisibility = null,
    passwordVisible = false,
  }: {
    label: string;
    field: keyof RegisterFormValues;
    placeholder: string;
    keyboardType?: "default" | "email-address" | "phone-pad";
    secureTextEntry?: boolean;
    togglePasswordVisibility?: (() => void) | null;
    passwordVisible?: boolean;
  }) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={[styles.inputWrapper, errors[field] && styles.inputError]}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          value={values[field] as string}
          onChangeText={(text) => handleChange(field, text)}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry && !passwordVisible}
          autoCapitalize={field === "name" ? "words" : "none"}
          autoCorrect={false}
        />
        {togglePasswordVisibility && (
          <TouchableOpacity
            style={styles.passwordToggle}
            onPress={togglePasswordVisibility}
          >
            <Ionicons
              name={passwordVisible ? "eye-off" : "eye"}
              size={22}
              color={COLOR_SCHEME.DARK}
            />
          </TouchableOpacity>
        )}
      </View>
      {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={COLOR_SCHEME.DARK} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Your Account</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.contentContainer}>
          <View style={styles.roleContainer}>
            <Text style={styles.roleText}>
              Registering as:
              <Text style={styles.roleHighlight}>
                {" "}
                {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
              </Text>
            </Text>
          </View>

          {renderInput({
            label: "Full Name",
            field: "name",
            placeholder: "Enter your full name",
          })}

          {renderInput({
            label: "Email Address",
            field: "email",
            placeholder: "Enter your email address",
            keyboardType: "email-address",
          })}

          {renderInput({
            label: "Phone Number",
            field: "phone",
            placeholder: "Enter your Nigerian phone number",
            keyboardType: "phone-pad",
          })}

          {renderInput({
            label: "Password",
            field: "password",
            placeholder: "Create a password (min. 6 characters)",
            secureTextEntry: true,
            togglePasswordVisibility: () =>
              setPasswordVisible(!passwordVisible),
            passwordVisible,
          })}

          {renderInput({
            label: "Confirm Password",
            field: "confirmPassword",
            placeholder: "Confirm your password",
            secureTextEntry: true,
            togglePasswordVisibility: () =>
              setConfirmPasswordVisible(!confirmPasswordVisible),
            passwordVisible: confirmPasswordVisible,
          })}

          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              By registering, you agree to our{" "}
              <Text style={styles.termsLink}>Terms of Service</Text> and{" "}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </View>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => handleSubmit()}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={COLOR_SCHEME.WHITE} />
            ) : (
              <Text style={styles.registerButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.push("/login")}>
              <Text style={styles.loginLink}>Login</Text>
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
    paddingBottom: Platform.OS === "ios" ? 20 : 40,
  },
  roleContainer: {
    backgroundColor: COLOR_SCHEME.LIGHT,
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  roleText: {
    fontSize: 16,
    color: COLOR_SCHEME.DARK,
  },
  roleHighlight: {
    fontWeight: "bold",
    color: COLOR_SCHEME.PRIMARY,
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
  termsContainer: {
    marginBottom: 20,
  },
  termsText: {
    fontSize: 14,
    color: COLOR_SCHEME.DARK,
    textAlign: "center",
  },
  termsLink: {
    color: COLOR_SCHEME.PRIMARY,
    fontWeight: "bold",
  },
  registerButton: {
    backgroundColor: COLOR_SCHEME.PRIMARY,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  registerButtonText: {
    color: COLOR_SCHEME.WHITE,
    fontSize: 16,
    fontWeight: "bold",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  loginText: {
    fontSize: 14,
    color: COLOR_SCHEME.DARK,
    marginRight: 5,
  },
  loginLink: {
    fontSize: 14,
    color: COLOR_SCHEME.PRIMARY,
    fontWeight: "bold",
  },
});

export default RegisterScreen;
