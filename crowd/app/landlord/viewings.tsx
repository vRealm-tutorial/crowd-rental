// app/landlord/viewings.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { COLOR_SCHEME, ViewingStatus } from "@/constants";
import useBookingStore, { Viewing } from "@/hooks/useBookingStore";

export default function LandlordViewingsScreen() {
  const router = useRouter();
  const {
    fetchLandlordViewings,
    upcomingViewings,
    pastViewings,
    isLoading,
    error,
  } = useBookingStore();

  const [activeTab, setActiveTab] = useState("upcoming");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadViewings();
  }, []);

  const loadViewings = async () => {
    try {
      await fetchLandlordViewings();
    } catch (error) {
      console.error("Error fetching viewings:", error);
      // Assuming useBookingStore has a setError function
      // setError(error instanceof Error ? error.message : "Failed to load viewings");
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadViewings();
    setRefreshing(false);
  };

  const handleViewingPress = (viewing: Viewing) => {
    router.push({
      pathname: "/landlord/viewing-details",
      params: { viewingId: viewing._id },
    });
  };

  const getStatusBadgeColor = (status: ViewingStatus) => {
    switch (status) {
      case ViewingStatus.PENDING:
        return { bg: COLOR_SCHEME.WARNING + "20", text: COLOR_SCHEME.WARNING };
      case ViewingStatus.CONFIRMED:
        return { bg: COLOR_SCHEME.PRIMARY + "20", text: COLOR_SCHEME.PRIMARY };
      case ViewingStatus.COMPLETED:
        return { bg: COLOR_SCHEME.SUCCESS + "20", text: COLOR_SCHEME.SUCCESS };
      case ViewingStatus.CANCELED:
        return { bg: COLOR_SCHEME.DANGER + "20", text: COLOR_SCHEME.DANGER };
      case ViewingStatus.NO_SHOW:
        return { bg: COLOR_SCHEME.DARK + "20", text: COLOR_SCHEME.DARK };
      default:
        return { bg: COLOR_SCHEME.LIGHT, text: COLOR_SCHEME.DARK };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleConfirmViewing = async (viewing: Viewing) => {
    try {
      // Call your store function to update the viewing status
      // await updateViewingStatus(viewing._id, ViewingStatus.CONFIRMED);
      // Refresh the list after confirmation
      await loadViewings();
    } catch (error) {
      console.error("Error confirming viewing:", error);
    }
  };

  const renderViewingItem = ({ item }: { item: Viewing }) => {
    const property = typeof item.property === "object" ? item.property : null;
    const tenant = typeof item.tenant === "object" ? item.tenant : null;
    const statusColors = getStatusBadgeColor(item.status);

    return (
      <TouchableOpacity
        style={styles.viewingCard}
        onPress={() => handleViewingPress(item)}
      >
        <View style={styles.viewingCardHeader}>
          <Text style={styles.viewingDate}>
            {formatDate(item.scheduledDate)}
          </Text>
          <View
            style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}
          >
            <Text style={[styles.statusText, { color: statusColors.text }]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.viewingDetails}>
          <View style={styles.detailRow}>
            <Ionicons
              name="time-outline"
              size={16}
              color={COLOR_SCHEME.PRIMARY}
            />
            <Text style={styles.detailText}>
              {formatTime(item.scheduledDate)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons
              name="home-outline"
              size={16}
              color={COLOR_SCHEME.PRIMARY}
            />
            <Text style={styles.detailText} numberOfLines={1}>
              {property ? property.title : "Property details unavailable"}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons
              name="person-outline"
              size={16}
              color={COLOR_SCHEME.PRIMARY}
            />
            <Text style={styles.detailText}>
              {tenant ? tenant.user.name : "Tenant details unavailable"}
            </Text>
          </View>
        </View>

        <View style={styles.viewingCardFooter}>
          {item.status === ViewingStatus.PENDING && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleConfirmViewing(item)}
            >
              <Ionicons
                name="checkmark-circle"
                size={16}
                color={COLOR_SCHEME.SUCCESS}
              />
              <Text
                style={[
                  styles.actionButtonText,
                  { color: COLOR_SCHEME.SUCCESS },
                ]}
              >
                Confirm
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => handleViewingPress(item)}>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={COLOR_SCHEME.DARK}
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const viewingsToDisplay =
    activeTab === "upcoming" ? upcomingViewings : pastViewings;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Property Viewings</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "upcoming" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("upcoming")}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeTab === "upcoming" && styles.activeTabText,
            ]}
          >
            Upcoming
          </Text>
          {upcomingViewings.length > 0 && (
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>{upcomingViewings.length}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === "past" && styles.activeTab]}
          onPress={() => setActiveTab("past")}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeTab === "past" && styles.activeTabText,
            ]}
          >
            Past
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLOR_SCHEME.PRIMARY} />
          <Text style={styles.loadingText}>Loading viewings...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={60} color={COLOR_SCHEME.DANGER} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadViewings}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : viewingsToDisplay.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="calendar-outline"
            size={80}
            color={COLOR_SCHEME.PRIMARY}
          />
          <Text style={styles.emptyTitle}>No {activeTab} viewings</Text>
          <Text style={styles.emptyText}>
            {activeTab === "upcoming"
              ? "You don't have any upcoming property viewings scheduled."
              : "You don't have any past property viewings."}
          </Text>
        </View>
      ) : (
        <FlatList
          data={viewingsToDisplay}
          renderItem={renderViewingItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLOR_SCHEME.PRIMARY]}
              tintColor={COLOR_SCHEME.PRIMARY}
            />
          }
          ListFooterComponent={<View style={{ height: 20 }} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLOR_SCHEME.BACKGROUND,
  },
  header: {
    padding: 20,
    backgroundColor: COLOR_SCHEME.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLOR_SCHEME.BORDER,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLOR_SCHEME.DARK,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: COLOR_SCHEME.WHITE,
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLOR_SCHEME.BORDER,
  },
  tabButton: {
    marginRight: 20,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: COLOR_SCHEME.PRIMARY,
  },
  tabButtonText: {
    fontSize: 16,
    color: COLOR_SCHEME.DARK,
  },
  activeTabText: {
    fontWeight: "bold",
    color: COLOR_SCHEME.PRIMARY,
  },
  badgeContainer: {
    backgroundColor: COLOR_SCHEME.PRIMARY,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 5,
  },
  badgeText: {
    color: COLOR_SCHEME.WHITE,
    fontSize: 12,
    fontWeight: "bold",
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    marginBottom: 20,
    fontSize: 16,
    color: COLOR_SCHEME.DARK,
    textAlign: "center",
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: COLOR_SCHEME.PRIMARY,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLOR_SCHEME.WHITE,
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyTitle: {
    marginTop: 20,
    fontSize: 20,
    fontWeight: "bold",
    color: COLOR_SCHEME.DARK,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: COLOR_SCHEME.DARK,
    textAlign: "center",
  },
  listContainer: {
    padding: 15,
  },
  viewingCard: {
    backgroundColor: COLOR_SCHEME.WHITE,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: COLOR_SCHEME.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  viewingCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLOR_SCHEME.BORDER,
  },
  viewingDate: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLOR_SCHEME.DARK,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  viewingDetails: {
    padding: 15,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: COLOR_SCHEME.DARK,
  },
  viewingCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: COLOR_SCHEME.BORDER,
    backgroundColor: COLOR_SCHEME.LIGHT,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButtonText: {
    marginLeft: 5,
    fontSize: 14,
    fontWeight: "500",
  },
});
