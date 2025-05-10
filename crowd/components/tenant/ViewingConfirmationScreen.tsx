import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Share,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { COLOR_SCHEME } from "../../constants";
import useBookingStore from "../../hooks/useBookingStore";
import CustomButton from "../ui/CustomButton";

// Define the navigation params for the tenant stack
type TenantStackParamList = {
  ViewingConfirmation: { viewingId: string };
  ViewingDetails: { viewingId: string };
  HomeMain: undefined;
};

// Define props type for the component
type ViewingConfirmationScreenProps = {
  navigation: StackNavigationProp<TenantStackParamList, "ViewingConfirmation">;
  route: RouteProp<TenantStackParamList, "ViewingConfirmation">;
};

const ViewingConfirmationScreen: React.FC<ViewingConfirmationScreenProps> = ({
  navigation,
  route,
}) => {
  const { viewingId } = route.params;

  const { fetchViewingById, currentViewing, isLoading } = useBookingStore();

  // Load the viewing details
  useEffect(() => {
    if (viewingId) {
      fetchViewingById(viewingId);
    }
  }, [viewingId]);

  // Format date and time
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    const formattedDate = date.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const formattedTime = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    return { date: formattedDate, time: formattedTime };
  };

  // Handle share viewing details
  const handleShare = async () => {
    if (!currentViewing) return;

    const property =
      typeof currentViewing.property === "object"
        ? currentViewing.property
        : null;
    if (!property) return;

    const formattedDateTime = formatDate(currentViewing.scheduledDate);

    try {
      await Share.share({
        message: `I've scheduled a viewing for ${property.title} in ${property.address.area}, ${property.address.city} on ${formattedDateTime.date} at ${formattedDateTime.time}.`,
        title: "Property Viewing Details",
      });
    } catch (error) {
      console.error("Error sharing viewing details:", error);
    }
  };

  // Navigate to home screen
  const goToHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: "HomeMain" }],
    });
  };

  // Navigate to viewing details
  const goToViewingDetails = () => {
    navigation.replace("ViewingDetails", { viewingId });
  };

  if (isLoading || !currentViewing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLOR_SCHEME.PRIMARY} />
        <Text style={styles.loadingText}>Loading booking details...</Text>
      </View>
    );
  }

  // Extract property information
  const property =
    typeof currentViewing.property === "object"
      ? currentViewing.property
      : null;
  const formattedDateTime = formatDate(currentViewing.scheduledDate);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.successContainer}>
          <View style={styles.successIconContainer}>
            <Ionicons name="checkmark" size={60} color={COLOR_SCHEME.WHITE} />
          </View>
          <Text style={styles.successTitle}>Booking Confirmed!</Text>
          <Text style={styles.successText}>
            Your property viewing has been successfully scheduled.
          </Text>
        </View>

        {property && (
          <View style={styles.propertyCard}>
            <Image
              source={{
                uri:
                  property.images[0]?.url ||
                  "https://via.placeholder.com/300x200",
              }}
              style={styles.propertyImage}
            />
            <View style={styles.propertyDetails}>
              <Text style={styles.propertyTitle}>{property.title}</Text>
              <View style={styles.locationRow}>
                <Ionicons
                  name="location-outline"
                  size={16}
                  color={COLOR_SCHEME.DARK}
                />
                <Text style={styles.locationText}>
                  {property.address.area}, {property.address.city}
                </Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.detailsContainer}>
          <Text style={styles.sectionTitle}>Viewing Details</Text>

          <View style={styles.detailItem}>
            <View style={styles.iconContainer}>
              <Ionicons
                name="calendar"
                size={24}
                color={COLOR_SCHEME.PRIMARY}
              />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>{formattedDateTime.date}</Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <View style={styles.iconContainer}>
              <Ionicons name="time" size={24} color={COLOR_SCHEME.PRIMARY} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Time</Text>
              <Text style={styles.detailValue}>{formattedDateTime.time}</Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <View style={styles.iconContainer}>
              <Ionicons name="person" size={24} color={COLOR_SCHEME.PRIMARY} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Contact</Text>
              <Text style={styles.detailValue}>
                {currentViewing.agent
                  ? "Agent will contact you"
                  : "Landlord will contact you"}
              </Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <View style={styles.iconContainer}>
              <Ionicons
                name="information-circle"
                size={24}
                color={COLOR_SCHEME.PRIMARY}
              />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Status</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>
                  {currentViewing.status.charAt(0).toUpperCase() +
                    currentViewing.status.slice(1)}
                </Text>
              </View>
            </View>
          </View>

          {currentViewing.notes && (
            <View style={styles.notesContainer}>
              <Text style={styles.notesLabel}>Your Notes:</Text>
              <Text style={styles.notesText}>{currentViewing.notes}</Text>
            </View>
          )}
        </View>

        <View style={styles.remindersContainer}>
          <Text style={styles.sectionTitle}>Reminders</Text>

          <View style={styles.reminderItem}>
            <Ionicons
              name="time-outline"
              size={20}
              color={COLOR_SCHEME.PRIMARY}
            />
            <Text style={styles.reminderText}>
              Please arrive on time. The agent will wait for up to 15 minutes
              past the scheduled time.
            </Text>
          </View>

          <View style={styles.reminderItem}>
            <Ionicons
              name="alert-circle-outline"
              size={20}
              color={COLOR_SCHEME.PRIMARY}
            />
            <Text style={styles.reminderText}>
              If you need to cancel, please do so at least 24 hours in advance
              to avoid it counting toward your monthly viewing quota.
            </Text>
          </View>

          <View style={styles.reminderItem}>
            <Ionicons
              name="document-text-outline"
              size={20}
              color={COLOR_SCHEME.PRIMARY}
            />
            <Text style={styles.reminderText}>
              Bring identification and be prepared to discuss your rental
              requirements.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <CustomButton
          title="Share Details"
          onPress={handleShare}
          icon="share-social-outline"
          type="outline"
          style={styles.shareButton}
        />

        <View style={styles.footerButtons}>
          <CustomButton
            title="View Details"
            onPress={goToViewingDetails}
            type="secondary"
            style={styles.footerButton}
          />

          <CustomButton
            title="Go to Home"
            onPress={goToHome}
            style={styles.footerButton}
          />
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLOR_SCHEME.DARK,
  },
  scrollView: {
    flex: 1,
  },
  successContainer: {
    alignItems: "center",
    padding: 20,
    backgroundColor: COLOR_SCHEME.WHITE,
  },
  successIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLOR_SCHEME.SUCCESS,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLOR_SCHEME.DARK,
    marginBottom: 10,
  },
  successText: {
    fontSize: 16,
    textAlign: "center",
    color: COLOR_SCHEME.DARK,
    marginBottom: 20,
  },
  propertyCard: {
    margin: 20,
    backgroundColor: COLOR_SCHEME.WHITE,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: COLOR_SCHEME.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  propertyImage: {
    width: "100%",
    height: 150,
    resizeMode: "cover",
  },
  propertyDetails: {
    padding: 15,
  },
  propertyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLOR_SCHEME.DARK,
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    fontSize: 14,
    color: COLOR_SCHEME.DARK,
    marginLeft: 5,
  },
  detailsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLOR_SCHEME.DARK,
    marginBottom: 15,
  },
  detailItem: {
    flexDirection: "row",
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
  detailContent: {
    flex: 1,
    justifyContent: "center",
  },
  detailLabel: {
    fontSize: 14,
    color: COLOR_SCHEME.DARK,
    marginBottom: 5,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLOR_SCHEME.DARK,
  },
  statusBadge: {
    backgroundColor: COLOR_SCHEME.PRIMARY + "20",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    alignSelf: "flex-start",
  },
  statusText: {
    fontSize: 14,
    fontWeight: "500",
    color: COLOR_SCHEME.PRIMARY,
  },
  notesContainer: {
    marginTop: 10,
    backgroundColor: COLOR_SCHEME.LIGHT,
    padding: 15,
    borderRadius: 10,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLOR_SCHEME.DARK,
    marginBottom: 5,
  },
  notesText: {
    fontSize: 14,
    color: COLOR_SCHEME.DARK,
    lineHeight: 20,
  },
  remindersContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100, // Extra padding for footer buttons
  },
  reminderItem: {
    flexDirection: "row",
    marginBottom: 15,
    alignItems: "flex-start",
  },
  reminderText: {
    fontSize: 14,
    color: COLOR_SCHEME.DARK,
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLOR_SCHEME.WHITE,
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: Platform.OS === "ios" ? 25 : 15,
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
  shareButton: {
    marginBottom: 15,
  },
  footerButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerButton: {
    flex: 1,
    marginHorizontal: 5,
  },
});

export default ViewingConfirmationScreen;
