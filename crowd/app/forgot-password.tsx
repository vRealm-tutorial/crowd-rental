// app/forgot-password.tsx
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { COLOR_SCHEME } from "@/constants";
import useAuthStore from "@/hooks/useAuthStore";
import useForm from "@/hooks/useForm";
import { forgotPasswordSchema } from "@/utils/validationSchemas";

// Define the form values interface
interface ForgotPasswordFormValues {
  email: string;
}

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { forgotPassword, isLoading, error, clearError } = useAuthStore();

  // Initialize form with useForm hook and Zod schema
  const { values, errors, handleChange, handleSubmit, setFieldValue } =
    useForm<ForgotPasswordFormValues>({
      initialValues: {
        email: "",
      },
      schema: forgotPasswordSchema,
      onSubmit: handleResetPassword,
    });

  // Handle reset password request
  async function handleResetPassword(formValues: ForgotPasswordFormValues) {
    try {
      await forgotPassword({ email: formValues.email });

      Alert.alert(
        "Password Reset Sent",
        `Reset instructions have been sent to your email. Please check your inbox.`,
        [
          {
            text: "OK",
            onPress: () => router.push("/login"),
          },
        ]
      );
    } catch (err) {
      // Error is handled globally by useAuthStore
      console.log("Reset password error:", err);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
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
          <Text style={styles.headerTitle}>Forgot Password</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="lock-open" size={70} color={COLOR_SCHEME.PRIMARY} />
          </View>

          <Text style={styles.title}>Reset Your Password</Text>
          <Text style={styles.description}>
            Enter your email address and we'll send you instructions to reset
            your password.
          </Text>

          {/* <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                values.identifierType === "email" && styles.activeToggle,
              ]}
              onPress={() => setFieldValue("identifierType", "email")}
            >
              <Text
                style={[
                  styles.toggleText,
                  values.identifierType === "email" && styles.activeToggleText,
                ]}
              >
                Email
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toggleButton,
                values.identifierType === "phone" && styles.activeToggle,
              ]}
              onPress={() => setFieldValue("identifierType", "phone")}
            >
              <Text
                style={[
                  styles.toggleText,
                  values.identifierType === "phone" && styles.activeToggleText,
                ]}
              >
                Phone
              </Text>
            </TouchableOpacity>
          </View> */}

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <View
              style={[styles.inputWrapper, errors.email && styles.inputError]}
            >
              <TextInput
                style={styles.input}
                placeholder="Enter your email address"
                value={values.email}
                onChangeText={(text) => handleChange("email", text)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}

          <TouchableOpacity
            style={[styles.resetButton, !values.email && styles.disabledButton]}
            onPress={() => handleSubmit()}
            disabled={isLoading || !values.email}
          >
            {isLoading ? (
              <ActivityIndicator color={COLOR_SCHEME.WHITE} />
            ) : (
              <Text style={styles.resetButtonText}>Reset Password</Text>
            )}
          </TouchableOpacity>

          <View style={styles.backToLoginContainer}>
            <Text style={styles.backToLoginText}>Remember your password?</Text>
            <TouchableOpacity onPress={() => router.push("/login")}>
              <Text style={styles.backToLoginLink}>Back to Login</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.helpContainer}>
            <TouchableOpacity style={styles.helpButton}>
              <Ionicons
                name="help-circle-outline"
                size={20}
                color={COLOR_SCHEME.PRIMARY}
              />
              <Text style={styles.helpText}>Need help?</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

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
  content: {
    flexGrow: 1,
    padding: 20,
    alignItems: "center",
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLOR_SCHEME.LIGHT,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLOR_SCHEME.DARK,
    marginBottom: 10,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: COLOR_SCHEME.DARK,
    textAlign: "center",
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: COLOR_SCHEME.LIGHT,
    borderRadius: 8,
    marginBottom: 25,
    padding: 4,
    width: "100%",
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
    marginBottom: 25,
    width: "100%",
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
  errorText: {
    fontSize: 12,
    color: COLOR_SCHEME.DANGER,
    marginTop: 5,
  },
  resetButton: {
    backgroundColor: COLOR_SCHEME.PRIMARY,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: COLOR_SCHEME.BORDER,
  },
  resetButtonText: {
    color: COLOR_SCHEME.WHITE,
    fontSize: 16,
    fontWeight: "bold",
  },
  backToLoginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  backToLoginText: {
    fontSize: 14,
    color: COLOR_SCHEME.DARK,
    marginRight: 5,
  },
  backToLoginLink: {
    fontSize: 14,
    color: COLOR_SCHEME.PRIMARY,
    fontWeight: "bold",
  },
  helpContainer: {
    marginTop: 20,
  },
  helpButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  helpText: {
    fontSize: 14,
    color: COLOR_SCHEME.PRIMARY,
    marginLeft: 5,
  },
});
