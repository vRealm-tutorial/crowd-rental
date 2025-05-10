// app/landlord/income.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { COLOR_SCHEME } from "@/constants";

// In a real app, you would have an income or payments store
// This is a simplified example with mock data
const mockData = {
  totalIncome: 2500000, // in Naira
  pendingAmount: 150000,
  monthlyBreakdown: [
    { month: "January", amount: 200000 },
    { month: "February", amount: 200000 },
    { month: "March", amount: 210000 },
    { month: "April", amount: 210000 },
    { month: "May", amount: 220000 },
    { month: "June", amount: 220000 },
    { month: "July", amount: 240000 },
    { month: "August", amount: 240000 },
    { month: "September", amount: 250000 },
    { month: "October", amount: 250000 },
    { month: "November", amount: 250000 },
    { month: "December", amount: 0 },
  ],
  recentTransactions: [
    {
      id: "1",
      date: "2023-10-25",
      amount: 250000,
      property: "Lekki Phase 1 Apartment",
      status: "completed",
    },
    {
      id: "2",
      date: "2023-09-26",
      amount: 250000,
      property: "Lekki Phase 1 Apartment",
      status: "completed",
    },
    {
      id: "3",
      date: "2023-08-27",
      amount: 240000,
      property: "Lekki Phase 1 Apartment",
      status: "completed",
    },
    {
      id: "4",
      date: "2023-11-01",
      amount: 150000,
      property: "Ikeja GRA Duplex",
      status: "pending",
    },
  ],
};

export default function LandlordIncomeScreen() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(mockData);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Format currency
  const formatCurrency = (amount: number) => {
    return `₦${amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Income</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons
            name="calendar-outline"
            size={24}
            color={COLOR_SCHEME.DARK}
          />
          <Text style={styles.filterButtonText}>{selectedYear}</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLOR_SCHEME.PRIMARY} />
          <Text style={styles.loadingText}>Loading income data...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Income summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Total Income</Text>
            <Text style={styles.summaryAmount}>
              {formatCurrency(data.totalIncome)}
            </Text>
            <View style={styles.summaryDetails}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryItemLabel}>Received</Text>
                <Text style={styles.summaryItemValue}>
                  {formatCurrency(data.totalIncome - data.pendingAmount)}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryItemLabel}>Pending</Text>
                <Text style={styles.summaryItemValue}>
                  {formatCurrency(data.pendingAmount)}
                </Text>
              </View>
            </View>
          </View>

          {/* Monthly breakdown */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Monthly Breakdown</Text>
            <View style={styles.monthlyChart}>
              {data.monthlyBreakdown.map((item, index) => (
                <View key={index} style={styles.monthItem}>
                  <View
                    style={[
                      styles.monthBar,
                      {
                        height: `${(item.amount / 250000) * 100}%`,
                        backgroundColor:
                          item.amount > 0
                            ? COLOR_SCHEME.PRIMARY
                            : COLOR_SCHEME.LIGHT,
                      },
                    ]}
                  />
                  // Continuing from app/landlord/income.tsx
                  <Text style={styles.monthLabel}>
                    {item.month.slice(0, 3)}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Recent transactions */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Transactions</Text>
              <TouchableOpacity style={styles.viewAllButton}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>

            {data.recentTransactions.map((transaction) => (
              <View key={transaction.id} style={styles.transactionCard}>
                <View style={styles.transactionHeader}>
                  <Text style={styles.transactionDate}>
                    {formatDate(transaction.date)}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          transaction.status === "completed"
                            ? COLOR_SCHEME.SUCCESS + "20"
                            : COLOR_SCHEME.WARNING + "20",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        {
                          color:
                            transaction.status === "completed"
                              ? COLOR_SCHEME.SUCCESS
                              : COLOR_SCHEME.WARNING,
                        },
                      ]}
                    >
                      {transaction.status.charAt(0).toUpperCase() +
                        transaction.status.slice(1)}
                    </Text>
                  </View>
                </View>

                <View style={styles.transactionContent}>
                  <View>
                    <Text style={styles.propertyName}>
                      {transaction.property}
                    </Text>
                    <Text style={styles.transactionType}>Rent Payment</Text>
                  </View>
                  <Text style={styles.transactionAmount}>
                    {formatCurrency(transaction.amount)}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Withdrawal section */}
          <View style={styles.withdrawSection}>
            <View style={styles.balanceContainer}>
              <Text style={styles.balanceLabel}>Available Balance</Text>
              <Text style={styles.balanceAmount}>
                {formatCurrency(data.totalIncome - data.pendingAmount)}
              </Text>
            </View>
            <TouchableOpacity style={styles.withdrawButton}>
              <Ionicons
                name="cash-outline"
                size={18}
                color={COLOR_SCHEME.WHITE}
              />
              <Text style={styles.withdrawButtonText}>Withdraw Funds</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLOR_SCHEME.LIGHT,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  filterButtonText: {
    marginLeft: 5,
    color: COLOR_SCHEME.DARK,
    fontWeight: "500",
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
  scrollContent: {
    padding: 20,
  },
  summaryCard: {
    backgroundColor: COLOR_SCHEME.WHITE,
    borderRadius: 12,
    padding: 20,
    shadowColor: COLOR_SCHEME.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    color: COLOR_SCHEME.DARK,
    marginBottom: 5,
  },
  summaryAmount: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLOR_SCHEME.DARK,
    marginBottom: 15,
  },
  summaryDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryItem: {
    flex: 1,
  },
  summaryItemLabel: {
    fontSize: 14,
    color: COLOR_SCHEME.DARK,
    opacity: 0.7,
    marginBottom: 5,
  },
  summaryItemValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLOR_SCHEME.DARK,
  },
  sectionContainer: {
    backgroundColor: COLOR_SCHEME.WHITE,
    borderRadius: 12,
    padding: 20,
    shadowColor: COLOR_SCHEME.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLOR_SCHEME.DARK,
    marginBottom: 15,
  },
  viewAllButton: {
    paddingVertical: 5,
  },
  viewAllText: {
    color: COLOR_SCHEME.PRIMARY,
    fontWeight: "500",
  },
  monthlyChart: {
    flexDirection: "row",
    height: 200,
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingTop: 20,
  },
  monthItem: {
    flex: 1,
    alignItems: "center",
    height: "100%",
    justifyContent: "flex-end",
  },
  monthBar: {
    width: 12,
    minHeight: 5,
    borderRadius: 6,
    marginBottom: 8,
  },
  monthLabel: {
    fontSize: 10,
    color: COLOR_SCHEME.DARK,
  },
  transactionCard: {
    borderWidth: 1,
    borderColor: COLOR_SCHEME.BORDER,
    borderRadius: 8,
    marginBottom: 10,
    overflow: "hidden",
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    backgroundColor: COLOR_SCHEME.LIGHT,
    borderBottomWidth: 1,
    borderBottomColor: COLOR_SCHEME.BORDER,
  },
  transactionDate: {
    fontSize: 12,
    color: COLOR_SCHEME.DARK,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "500",
  },
  transactionContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
  },
  propertyName: {
    fontSize: 14,
    fontWeight: "500",
    color: COLOR_SCHEME.DARK,
    marginBottom: 4,
  },
  transactionType: {
    fontSize: 12,
    color: COLOR_SCHEME.DARK,
    opacity: 0.7,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLOR_SCHEME.DARK,
  },
  withdrawSection: {
    backgroundColor: COLOR_SCHEME.WHITE,
    borderRadius: 12,
    padding: 20,
    shadowColor: COLOR_SCHEME.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  balanceContainer: {
    marginBottom: 15,
  },
  balanceLabel: {
    fontSize: 14,
    color: COLOR_SCHEME.DARK,
    opacity: 0.7,
    marginBottom: 5,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLOR_SCHEME.DARK,
  },
  withdrawButton: {
    backgroundColor: COLOR_SCHEME.PRIMARY,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  withdrawButtonText: {
    color: COLOR_SCHEME.WHITE,
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
});
