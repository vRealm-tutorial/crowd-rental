import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Keyboard,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { COLOR_SCHEME } from "../constants";
import useAuthStore from "../hooks/useAuthStore";
import useForm from "../hooks/useForm";
import { otpSchema } from "../utils/validationSchemas";
import { useLocalSearchParams, useRouter } from "expo-router";

// Define the form values interface based on the Zod schema
interface OTPFormValues {
  otp: string;
  verificationType?: "email" | "phone" | "both";
}

const OTPVerificationScreen = () => {
  const router = useRouter();

  // Get verification type from route params (email, phone, or both)
  const params = useLocalSearchParams();
  const verificationType =
    params.verificationType as OTPFormValues["verificationType"];

  // Get auth store functions
  const { verifyOTP, resendOTP, isLoading, error, clearError } = useAuthStore();

  // OTP input state
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const otpInputs = useRef<Array<TextInput | null>>([]);

  // Initialize form with useForm hook and Zod schema
  const { values, errors, setFieldValue, handleSubmit } =
    useForm<OTPFormValues>({
      initialValues: {
        otp: "",
        verificationType,
      },
      schema: otpSchema,
      onSubmit: handleVerify,
    });

  // Timer for resend button
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Clear any auth store errors when component mounts
  useEffect(() => {
    clearError();
    startResendTimer();
  }, []);

  // Show error alert if verification fails
  useEffect(() => {
    if (error) {
      Alert.alert("Verification Failed", error);
    }
  }, [error]);

  // Timer for resend button
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (timer > 0 && !canResend) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0 && !canResend) {
      setCanResend(true);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer, canResend]);

  // Start resend timer
  const startResendTimer = () => {
    setTimer(60);
    setCanResend(false);
  };

  // Handle OTP input change
  const handleOtpChange = (value: string, index: number) => {
    // Only allow digits
    if (value && !/^\d+$/.test(value)) return;

    const newOtpDigits = [...otpDigits];
    newOtpDigits[index] = value;
    setOtpDigits(newOtpDigits);

    // Combine all digits to form the complete OTP
    const completeOtp = newOtpDigits.join("");
    setFieldValue("otp", completeOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpInputs.current[index + 1]?.focus();
    }
  };

  // Handle key press for backspace
  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  // Handle OTP verification
  async function handleVerify(formValues: OTPFormValues) {
    // Check if all OTP fields are filled
    if (formValues.otp.length !== 6) {
      Alert.alert("Incomplete OTP", "Please enter the complete 6-digit code.");
      return;
    }

    try {
      await verifyOTP({
        otp: formValues.otp,
        verificationType: formValues.verificationType,
      });
      // Navigation will be handled automatically in App.tsx once the user is authenticated
    } catch (err) {
      // Error is handled by the useEffect above
      console.log("OTP verification error:", err);
    }
  }

  // Handle resend OTP
  const handleResend = async () => {
    try {
      await resendOTP({ verificationType });
      startResendTimer();
      Alert.alert("OTP Resent", "A new verification code has been sent.");
    } catch (err) {
      Alert.alert(
        "Resend Failed",
        error || "Failed to resend OTP. Please try again."
      );
    }
  };

  // Render verification message based on type
  const renderVerificationMessage = () => {
    if (verificationType === "email") {
      return "We have sent a verification code to your email address.";
    } else if (verificationType === "phone") {
      return "We have sent a verification code to your phone number.";
    } else {
      return "We have sent a verification code to your email and phone number.";
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={COLOR_SCHEME.DARK} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verify Your Account</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons
            name="shield-checkmark"
            size={70}
            color={COLOR_SCHEME.PRIMARY}
          />
        </View>

        <Text style={styles.title}>OTP Verification</Text>
        <Text style={styles.message}>{renderVerificationMessage()}</Text>

        <View style={styles.otpContainer}>
          {otpDigits.map((digit, index) => (
            <TextInput
              key={index}
              ref={(input) => {
                otpInputs.current[index] = input;
              }}
              style={styles.otpInput}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              autoCapitalize="none"
              selectionColor={COLOR_SCHEME.PRIMARY}
              accessible={true}
              accessibilityLabel={`OTP digit ${index + 1} of 6`}
              accessibilityHint="Enter a single digit"
              importantForAccessibility="yes"
            />
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.verifyButton,
            otpDigits.some((digit) => digit.trim() === "") &&
              styles.disabledButton,
          ]}
          onPress={() => handleSubmit()}
          disabled={isLoading || otpDigits.some((digit) => digit.trim() === "")}
        >
          {isLoading ? (
            <ActivityIndicator color={COLOR_SCHEME.WHITE} />
          ) : (
            <Text style={styles.verifyButtonText}>Verify</Text>
          )}
        </TouchableOpacity>

        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn't receive the code? </Text>
          {canResend ? (
            <TouchableOpacity onPress={handleResend} disabled={isLoading}>
              <Text style={styles.resendButtonText}>Resend OTP</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.timerText}>{`Resend in ${timer}s`}</Text>
          )}
        </View>
      </View>
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
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLOR_SCHEME.LIGHT,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLOR_SCHEME.DARK,
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: COLOR_SCHEME.DARK,
    textAlign: "center",
    marginBottom: 30,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    marginBottom: 30,
  },
  otpInput: {
    width: 45,
    height: 50,
    borderWidth: 1,
    borderColor: COLOR_SCHEME.BORDER,
    borderRadius: 8,
    fontSize: 20,
    textAlign: "center",
    color: COLOR_SCHEME.DARK,
  },
  verifyButton: {
    backgroundColor: COLOR_SCHEME.PRIMARY,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: "center",
    width: "80%",
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: COLOR_SCHEME.BORDER,
  },
  verifyButtonText: {
    color: COLOR_SCHEME.WHITE,
    fontSize: 16,
    fontWeight: "bold",
  },
  resendContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  resendText: {
    fontSize: 14,
    color: COLOR_SCHEME.DARK,
  },
  resendButtonText: {
    fontSize: 14,
    color: COLOR_SCHEME.PRIMARY,
    fontWeight: "bold",
  },
  timerText: {
    fontSize: 14,
    color: COLOR_SCHEME.SECONDARY,
  },
});

export default OTPVerificationScreen;
