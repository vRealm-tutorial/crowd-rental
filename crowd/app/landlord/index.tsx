// app/landlord/index.tsx
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
import { COLOR_SCHEME } from "@/constants";
import usePropertyStore, { Property } from "@/hooks/usePropertyStore";
import PropertyCard from "@/components/property/PropertyCard";

export default function LandlordPropertiesScreen() {
  const router = useRouter();
  const { properties, fetchProperties, isLoading, error } = usePropertyStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      await fetchProperties();
    } catch (error) {
      console.error("Error fetching properties:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProperties();
    setRefreshing(false);
  };

  const handlePropertyPress = (property: Property) => {
    router.push({
      pathname: "/landlord/property-details",
      params: { propertyId: property._id },
    });
  };

  const renderPropertyItem = ({ item }: { item: Property }) => (
    <PropertyCard
      property={item}
      onPress={() => handlePropertyPress(item)}
      horizontal={true}
      style={styles.propertyCard}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Properties</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons
            name="options-outline"
            size={24}
            color={COLOR_SCHEME.DARK}
          />
        </TouchableOpacity>
      </View>

      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLOR_SCHEME.PRIMARY} />
          <Text style={styles.loadingText}>Loading your properties...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={60} color={COLOR_SCHEME.DANGER} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadProperties}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : properties.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="home-outline"
            size={80}
            color={COLOR_SCHEME.PRIMARY}
          />
          <Text style={styles.emptyTitle}>No Properties Listed</Text>
          <Text style={styles.emptyText}>
            You haven't listed any properties yet. Start by adding your first
            property.
          </Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push("/landlord/add-property")}
          >
            <Ionicons name="add" size={20} color={COLOR_SCHEME.WHITE} />
            <Text style={styles.addButtonText}>Add New Property</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{properties.length}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {properties.filter((p) => p.status === "available").length}
              </Text>
              <Text style={styles.statLabel}>Available</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {properties.filter((p) => p.status === "rented").length}
              </Text>
              <Text style={styles.statLabel}>Rented</Text>
            </View>
          </View>

          <FlatList
            data={properties}
            renderItem={renderPropertyItem}
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
        </>
      )}

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => router.push("/landlord/add-property")}
      >
        <Ionicons name="add" size={30} color={COLOR_SCHEME.WHITE} />
      </TouchableOpacity>
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
    justifyContent: "space-between",
    alignItems: "center",
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
  filterButton: {
    padding: 5,
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
    marginBottom: 20,
    fontSize: 16,
    color: COLOR_SCHEME.DARK,
    textAlign: "center",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: COLOR_SCHEME.PRIMARY,
    borderRadius: 8,
  },
  addButtonText: {
    marginLeft: 8,
    color: COLOR_SCHEME.WHITE,
    fontWeight: "bold",
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: "row",
    padding: 15,
    backgroundColor: COLOR_SCHEME.WHITE,
    marginHorizontal: 15,
    marginTop: 15,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: COLOR_SCHEME.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLOR_SCHEME.PRIMARY,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLOR_SCHEME.DARK,
  },
  listContainer: {
    padding: 15,
  },
  propertyCard: {
    marginBottom: 15,
  },
  floatingButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLOR_SCHEME.PRIMARY,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: COLOR_SCHEME.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
