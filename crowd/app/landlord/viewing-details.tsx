// app/landlord/viewing-details.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { COLOR_SCHEME, ViewingStatus } from "@/constants";
import useBookingStore from "@/hooks/useBookingStore";

export default function ViewingDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const viewingId = params.viewingId as string;

  const {
    fetchViewingById,
    currentViewing,
    isLoading,
    error,
    updateViewingStatus,
  } = useBookingStore();

  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    if (viewingId) {
      fetchViewingById(viewingId);
    }
  }, [viewingId]);

  // Format date to display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Format time to display
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Status badge color based on status
  const getStatusColor = (status: ViewingStatus) => {
    switch (status) {
      case ViewingStatus.PENDING:
        return COLOR_SCHEME.WARNING;
      case ViewingStatus.CONFIRMED:
        return COLOR_SCHEME.PRIMARY;
      case ViewingStatus.COMPLETED:
        return COLOR_SCHEME.SUCCESS;
      case ViewingStatus.CANCELED:
        return COLOR_SCHEME.DANGER;
      case ViewingStatus.NO_SHOW:
        return COLOR_SCHEME.DARK;
      default:
        return COLOR_SCHEME.DARK;
    }
  };

  // Handle status update
  const handleStatusUpdate = async (newStatus: ViewingStatus) => {
    if (!currentViewing) return;

    try {
      setUpdateLoading(true);
      await updateViewingStatus(viewingId, newStatus);
      setUpdateLoading(false);
    } catch (error) {
      console.error("Error updating viewing status:", error);
      Alert.alert("Error", "Failed to update status. Please try again.");
      setUpdateLoading(false);
    }
  };

  // Confirm status update
  const confirmStatusUpdate = (newStatus: ViewingStatus) => {
    const statusText = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);

    Alert.alert(
      `${statusText} Viewing`,
      `Are you sure you want to mark this viewing as ${newStatus}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Confirm",
          onPress: () => handleStatusUpdate(newStatus),
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLOR_SCHEME.PRIMARY} />
        <Text style={styles.loadingText}>Loading viewing details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons
          name="alert-circle-outline"
          size={48}
          color={COLOR_SCHEME.DANGER}
        />
        <Text style={styles.errorTitle}>Error Loading Viewing</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.tryAgainButton}
          onPress={() => fetchViewingById(viewingId)}
        >
          <Text style={styles.tryAgainButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!currentViewing) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons
          name="calendar-outline"
          size={48}
          color={COLOR_SCHEME.PRIMARY}
        />
        <Text style={styles.errorTitle}>Viewing Not Found</Text>
        <Text style={styles.errorText}>
          The viewing details you're looking for could not be found.
        </Text>
        <TouchableOpacity
          style={styles.tryAgainButton}
          onPress={() => router.back()}
        >
          <Text style={styles.tryAgainButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Extract tenant and property details
  const tenant =
    typeof currentViewing.tenant === "object" ? currentViewing.tenant : null;
  const property =
    typeof currentViewing.property === "object"
      ? currentViewing.property
      : null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={COLOR_SCHEME.DARK} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Viewing Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollContainer}>
        {/* Status Card */}
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(currentViewing.status) + "20" },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(currentViewing.status) },
              ]}
            >
              {currentViewing.status.charAt(0).toUpperCase() +
                currentViewing.status.slice(1)}
            </Text>
          </View>
          <Text style={styles.dateTimeLabel}>
            {formatDate(currentViewing.scheduledDate)} at{" "}
            {formatTime(currentViewing.scheduledDate)}
          </Text>
        </View>

        {/* Property Card */}
        {property && (
          <View style={styles.propertyCard}>
            <Image
              source={{
                uri:
                  property.images.find((img) => img.isPrimary)?.url ||
                  property.images[0]?.url,
              }}
              style={styles.propertyImage}
            />
            <View style={styles.propertyInfo}>
              <Text style={styles.propertyTitle} numberOfLines={1}>
                {property.title}
              </Text>
              <Text style={styles.propertyAddress} numberOfLines={1}>
                {property.address.area}, {property.address.city}
              </Text>
              <TouchableOpacity
                style={styles.viewPropertyButton}
                onPress={() =>
                  router.push({
                    pathname: "/landlord/property-details",
                    params: { propertyId: property._id },
                  })
                }
              >
                <Text style={styles.viewPropertyText}>View Property</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Tenant Card */}
        {tenant && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tenant Information</Text>
            <View style={styles.tenantCard}>
              <View style={styles.tenantIconContainer}>
                <Ionicons
                  name="person"
                  size={30}
                  color={COLOR_SCHEME.PRIMARY}
                />
              </View>
              <View style={styles.tenantInfo}>
                <Text style={styles.tenantName}>{tenant.user.name}</Text>
                <View style={styles.contactRow}>
                  <Ionicons
                    name="mail-outline"
                    size={16}
                    color={COLOR_SCHEME.DARK}
                  />
                  <Text style={styles.contactText}>{tenant.user.email}</Text>
                </View>
                <View style={styles.contactRow}>
                  <Ionicons
                    name="call-outline"
                    size={16}
                    color={COLOR_SCHEME.DARK}
                  />
                  <Text style={styles.contactText}>{tenant.user.phone}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Notes Section */}
        {currentViewing.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Viewing Notes</Text>
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>{currentViewing.notes}</Text>
            </View>
          </View>
        )}

        {/* Feedback Section */}
        {currentViewing.feedback && currentViewing.feedback.tenant && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tenant Feedback</Text>
            <View style={styles.feedbackCard}>
              <View style={styles.ratingContainer}>
                {Array(5)
                  .fill(0)
                  .map((_, index) => (
                    <Ionicons
                      key={index}
                      name={
                        index < currentViewing.feedback!.tenant!.rating
                          ? "star"
                          : "star-outline"
                      }
                      size={18}
                      color={COLOR_SCHEME.WARNING}
                      style={styles.starIcon}
                    />
                  ))}
              </View>
              <Text style={styles.feedbackText}>
                {currentViewing.feedback.tenant.comment}
              </Text>
              <Text style={styles.feedbackDate}>
                {formatDate(currentViewing.feedback.tenant.createdAt)}
              </Text>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        {currentViewing.status === ViewingStatus.PENDING && (
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.confirmButton]}
              onPress={() => confirmStatusUpdate(ViewingStatus.CONFIRMED)}
              disabled={updateLoading}
            >
              {updateLoading ? (
                <ActivityIndicator size="small" color={COLOR_SCHEME.WHITE} />
              ) : (
                <>
                  <Ionicons
                    name="checkmark"
                    size={20}
                    color={COLOR_SCHEME.WHITE}
                  />
                  <Text style={styles.actionButtonText}>Confirm Viewing</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => confirmStatusUpdate(ViewingStatus.CANCELED)}
              disabled={updateLoading}
            >
              <Ionicons name="close" size={20} color={COLOR_SCHEME.WHITE} />
              <Text style={styles.actionButtonText}>Cancel Viewing</Text>
            </TouchableOpacity>
          </View>
        )}

        {currentViewing.status === ViewingStatus.CONFIRMED && (
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.completedButton]}
              onPress={() => confirmStatusUpdate(ViewingStatus.COMPLETED)}
              disabled={updateLoading}
            >
              <Ionicons
                name="checkmark-done"
                size={20}
                color={COLOR_SCHEME.WHITE}
              />
              <Text style={styles.actionButtonText}>Mark as Completed</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.noShowButton]}
              onPress={() => confirmStatusUpdate(ViewingStatus.NO_SHOW)}
              disabled={updateLoading}
            >
              <Ionicons
                name="person-remove"
                size={20}
                color={COLOR_SCHEME.WHITE}
              />
              <Text style={styles.actionButtonText}>Mark as No-Show</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Add some space at the bottom */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLOR_SCHEME.BACKGROUND,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: COLOR_SCHEME.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLOR_SCHEME.BORDER,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLOR_SCHEME.DARK,
  },
  backButton: {
    padding: 5,
  },
  scrollContainer: {
    flex: 1,
    padding: 20,
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: COLOR_SCHEME.WHITE,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLOR_SCHEME.DARK,
    marginTop: 20,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    color: COLOR_SCHEME.DARK,
    marginBottom: 20,
  },
  tryAgainButton: {
    backgroundColor: COLOR_SCHEME.PRIMARY,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  tryAgainButtonText: {
    color: COLOR_SCHEME.WHITE,
    fontWeight: "bold",
  },
  statusContainer: {
    alignItems: "center",
    backgroundColor: COLOR_SCHEME.WHITE,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: COLOR_SCHEME.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusBadge: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 10,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  dateTimeLabel: {
    fontSize: 16,
    color: COLOR_SCHEME.DARK,
    textAlign: "center",
  },
  propertyCard: {
    flexDirection: "row",
    backgroundColor: COLOR_SCHEME.WHITE,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 20,
    shadowColor: COLOR_SCHEME.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  propertyImage: {
    width: 120,
    height: 120,
    resizeMode: "cover",
  },
  propertyInfo: {
    flex: 1,
    padding: 15,
    justifyContent: "space-between",
  },
  propertyTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLOR_SCHEME.DARK,
    marginBottom: 5,
  },
  propertyAddress: {
    fontSize: 14,
    color: COLOR_SCHEME.DARK,
    marginBottom: 10,
  },
  viewPropertyButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLOR_SCHEME.PRIMARY,
    alignSelf: "flex-start",
  },
  viewPropertyText: {
    color: COLOR_SCHEME.PRIMARY,
    fontSize: 12,
    fontWeight: "500",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLOR_SCHEME.DARK,
    marginBottom: 10,
  },
  tenantCard: {
    flexDirection: "row",
    backgroundColor: COLOR_SCHEME.WHITE,
    borderRadius: 12,
    padding: 15,
    shadowColor: COLOR_SCHEME.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tenantIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLOR_SCHEME.LIGHT,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  tenantInfo: {
    flex: 1,
    justifyContent: "center",
  },
  tenantName: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLOR_SCHEME.DARK,
    marginBottom: 5,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  contactText: {
    fontSize: 14,
    color: COLOR_SCHEME.DARK,
    marginLeft: 5,
  },
  notesCard: {
    backgroundColor: COLOR_SCHEME.WHITE,
    borderRadius: 12,
    padding: 15,
    shadowColor: COLOR_SCHEME.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notesText: {
    fontSize: 14,
    color: COLOR_SCHEME.DARK,
    lineHeight: 20,
  },
  feedbackCard: {
    backgroundColor: COLOR_SCHEME.WHITE,
    borderRadius: 12,
    padding: 15,
    shadowColor: COLOR_SCHEME.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ratingContainer: {
    flexDirection: "row",
    marginBottom: 10,
  },
  starIcon: {
    marginRight: 5,
  },
  feedbackText: {
    fontSize: 14,
    color: COLOR_SCHEME.DARK,
    lineHeight: 20,
    marginBottom: 10,
  },
  feedbackDate: {
    fontSize: 12,
    color: COLOR_SCHEME.DARK,
    opacity: 0.7,
    textAlign: "right",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  confirmButton: {
    backgroundColor: COLOR_SCHEME.PRIMARY,
  },
  cancelButton: {
    backgroundColor: COLOR_SCHEME.DANGER,
  },
  completedButton: {
    backgroundColor: COLOR_SCHEME.SUCCESS,
  },
  noShowButton: {
    backgroundColor: COLOR_SCHEME.DARK,
  },
  actionButtonText: {
    color: COLOR_SCHEME.WHITE,
    fontWeight: "bold",
    marginLeft: 5,
  },
});
