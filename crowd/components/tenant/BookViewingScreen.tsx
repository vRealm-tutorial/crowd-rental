import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { COLOR_SCHEME } from "../../constants";
import DateTimePicker from "@react-native-community/datetimepicker";
import usePropertyStore from "../../hooks/usePropertyStore";
import useBookingStore from "../../hooks/useBookingStore";
import useForm from "../../hooks/useForm";
import { z } from "zod";
import CustomButton from "../ui/CustomButton";
import CustomInput from "../ui/CustomInput";

// Define the navigation params for the tenant stack
type TenantStackParamList = {
  PropertyDetails: { propertyId: string };
  BookViewing: { propertyId: string };
  ViewingConfirmation: { viewingId: string };
};

// Define props type for the component
type BookViewingScreenProps = {
  navigation: StackNavigationProp<TenantStackParamList, "BookViewing">;
  route: RouteProp<TenantStackParamList, "BookViewing">;
};

// Define booking form values interface
interface BookingFormValues {
  notes?: string;
  date: Date;
  time: Date;
}

// Create a custom Zod schema for the booking form
const bookingFormSchema = z.object({
  notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
  date: z.date().refine(
    (date) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date >= today;
    },
    { message: "Date must be today or in the future" }
  ),
  time: z.date().refine(
    (time) => {
      const hours = time.getHours();
      return hours >= 9 && hours <= 18;
    },
    { message: "Time must be between 9 AM and 6 PM" }
  ),
});

const BookViewingScreen: React.FC<BookViewingScreenProps> = ({
  navigation,
  route,
}) => {
  const { propertyId } = route.params;

  const {
    fetchPropertyById,
    currentProperty,
    isLoading: propertyLoading,
  } = usePropertyStore();
  const { bookViewing, isLoading: bookingLoading } = useBookingStore();

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Get today's date and reset hours
  const today = new Date();

  // Get tomorrow's date for the default selection
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  // Default time (10 AM)
  const defaultTime = new Date();
  defaultTime.setHours(10, 0, 0, 0);

  // Initialize form with useForm hook and Zod schema
  const { values, errors, handleChange, setFieldValue, handleSubmit } =
    useForm<BookingFormValues>({
      initialValues: {
        notes: "",
        date: tomorrow,
        time: defaultTime,
      },
      schema: bookingFormSchema,
      onSubmit: handleBookViewing,
    });

  useEffect(() => {
    // Fetch property details if not already loaded
    if (!currentProperty || currentProperty._id !== propertyId) {
      fetchPropertyById(propertyId);
    }
  }, [propertyId]);

  // Combine date and time into a single Date object
  const getCombinedDateTime = () => {
    const dateTime = new Date(values.date);
    dateTime.setHours(values.time.getHours(), values.time.getMinutes(), 0, 0);
    return dateTime;
  };

  // Handle date change
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);

    if (selectedDate) {
      setFieldValue("date", selectedDate);
    }
  };

  // Handle time change
  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);

    if (selectedTime) {
      setFieldValue("time", selectedTime);

      // Check if time is within working hours (9 AM - 6 PM)
      const hours = selectedTime.getHours();
      if (hours < 9 || hours > 18) {
        Alert.alert(
          "Outside Working Hours",
          "Please select a time between 9 AM and 6 PM for property viewings."
        );
      }
    }
  };

  // Handle booking submission
  async function handleBookViewing(formValues: BookingFormValues) {
    if (!currentProperty) return;

    try {
      // Combine date and time
      const scheduledDate = getCombinedDateTime();

      // Book the viewing
      const response = await bookViewing(currentProperty._id, {
        scheduledDate,
        notes: formValues.notes,
      });

      // Navigate to confirmation screen
      navigation.replace("ViewingConfirmation", { viewingId: response._id });
    } catch (error: any) {
      Alert.alert(
        "Booking Failed",
        error.message || "Failed to book viewing. Please try again later."
      );
    }
  }

  // Format date to display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Format time to display
  const formatTime = (time: Date) => {
    return time.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (propertyLoading || !currentProperty) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLOR_SCHEME.PRIMARY} />
        <Text style={styles.loadingText}>Loading property details...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLOR_SCHEME.DARK} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Schedule Viewing</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.scrollView}>
          {/* Property Summary */}
          <View style={styles.propertySummary}>
            <Image
              source={{
                uri:
                  currentProperty.images[0]?.url ||
                  "https://via.placeholder.com/100",
              }}
              style={styles.propertyImage}
            />
            <View style={styles.propertyInfo}>
              <Text style={styles.propertyTitle} numberOfLines={1}>
                {currentProperty.title}
              </Text>
              <Text style={styles.propertyLocation} numberOfLines={1}>
                {currentProperty.address.area}, {currentProperty.address.city}
              </Text>
              <Text style={styles.propertyPrice}>
                ₦{currentProperty.price.amount.toLocaleString()}
                <Text style={styles.propertyFrequency}>
                  {currentProperty.price.paymentFrequency === "monthly"
                    ? "/month"
                    : currentProperty.price.paymentFrequency === "yearly"
                    ? "/year"
                    : `/${currentProperty.price.paymentFrequency}`}
                </Text>
              </Text>
            </View>
          </View>

          {/* Date and Time Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Date and Time</Text>

            <TouchableOpacity
              style={styles.dateTimeSelector}
              onPress={() => setShowDatePicker(true)}
            >
              <View style={styles.iconContainer}>
                <Ionicons
                  name="calendar-outline"
                  size={24}
                  color={COLOR_SCHEME.PRIMARY}
                />
              </View>
              <View style={styles.selectorContent}>
                <Text style={styles.selectorLabel}>Date</Text>
                <Text style={styles.selectorValue}>
                  {formatDate(values.date)}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={COLOR_SCHEME.DARK}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dateTimeSelector}
              onPress={() => setShowTimePicker(true)}
            >
              <View style={styles.iconContainer}>
                <Ionicons
                  name="time-outline"
                  size={24}
                  color={COLOR_SCHEME.PRIMARY}
                />
              </View>
              <View style={styles.selectorContent}>
                <Text style={styles.selectorLabel}>Time</Text>
                <Text style={styles.selectorValue}>
                  {formatTime(values.time)}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={COLOR_SCHEME.DARK}
              />
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={values.date}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={handleDateChange}
                minimumDate={today}
              />
            )}

            {showTimePicker && (
              <DateTimePicker
                value={values.time}
                mode="time"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={handleTimeChange}
                minuteInterval={15}
              />
            )}
          </View>

          {/* Additional Notes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Notes</Text>
            <CustomInput
              label="Notes for the agent (optional)"
              placeholder="E.g., I'm interested in the property layout, nearby amenities, etc."
              value={values.notes}
              onChangeText={(text) => handleChange("notes", text)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              style={styles.notesInput}
              error={errors.notes}
            />
          </View>

          {/* Viewing Policies */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Viewing Policies</Text>
            <View style={styles.policyItem}>
              <Ionicons
                name="time-outline"
                size={20}
                color={COLOR_SCHEME.PRIMARY}
              />
              <Text style={styles.policyText}>
                Please arrive on time. Agents wait up to 15 minutes past the
                scheduled time.
              </Text>
            </View>
            <View style={styles.policyItem}>
              <Ionicons
                name="calendar-outline"
                size={20}
                color={COLOR_SCHEME.PRIMARY}
              />
              <Text style={styles.policyText}>
                Cancellations should be made at least 24 hours in advance to not
                count against your monthly viewing quota.
              </Text>
            </View>
            <View style={styles.policyItem}>
              <Ionicons
                name="card-outline"
                size={20}
                color={COLOR_SCHEME.PRIMARY}
              />
              <Text style={styles.policyText}>
                Your subscription includes 5 viewings per month. Additional
                viewings cost ₦1,000 each.
              </Text>
            </View>
          </View>

          {/* Spacing for the fixed bottom button */}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Book Viewing Button */}
        <View style={styles.footer}>
          <CustomButton
            title="Confirm Booking"
            onPress={() => handleSubmit()}
            fullWidth
            loading={bookingLoading}
          />
        </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLOR_SCHEME.WHITE,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLOR_SCHEME.DARK,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  propertySummary: {
    flexDirection: "row",
    backgroundColor: COLOR_SCHEME.LIGHT,
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  propertyImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  propertyInfo: {
    flex: 1,
    marginLeft: 15,
    justifyContent: "center",
  },
  propertyTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLOR_SCHEME.DARK,
    marginBottom: 5,
  },
  propertyLocation: {
    fontSize: 14,
    color: COLOR_SCHEME.DARK,
    marginBottom: 5,
  },
  propertyPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLOR_SCHEME.PRIMARY,
  },
  propertyFrequency: {
    fontSize: 14,
    fontWeight: "normal",
    color: COLOR_SCHEME.DARK,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLOR_SCHEME.DARK,
    marginBottom: 15,
  },
  dateTimeSelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLOR_SCHEME.WHITE,
    borderWidth: 1,
    borderColor: COLOR_SCHEME.BORDER,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLOR_SCHEME.LIGHT,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  selectorContent: {
    flex: 1,
  },
  selectorLabel: {
    fontSize: 14,
    color: COLOR_SCHEME.DARK,
    marginBottom: 5,
  },
  selectorValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLOR_SCHEME.DARK,
  },
  notesInput: {
    height: 100,
    textAlignVertical: "top",
    padding: 10,
  },
  policyItem: {
    flexDirection: "row",
    marginBottom: 15,
  },
  policyText: {
    fontSize: 14,
    color: COLOR_SCHEME.DARK,
    flex: 1,
    marginLeft: 10,
    lineHeight: 20,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLOR_SCHEME.WHITE,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: COLOR_SCHEME.BORDER,
    ...Platform.select({
      ios: {
        shadowColor: COLOR_SCHEME.BLACK,
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
      },
      android: {
        elevation: 5,
      },
    }),
  },
});

export default BookViewingScreen;
