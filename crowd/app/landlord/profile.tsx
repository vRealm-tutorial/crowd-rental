// app/landlord/profile.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { COLOR_SCHEME } from "@/constants";
import useAuthStore from "@/hooks/useAuthStore";

export default function LandlordProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const toggleNotifications = () => {
    setNotifications((previousState) => !previousState);
  };

  const toggleDarkMode = () => {
    setDarkMode((previousState) => !previousState);
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        onPress: () => {
          logout();
          // Navigation will be handled by _layout.tsx
        },
        style: "destructive",
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity>
          <Ionicons
            name="settings-outline"
            size={24}
            color={COLOR_SCHEME.DARK}
          />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileCard}>
          <Image
            source={{
              uri: user?.profileImage || "https://via.placeholder.com/100",
            }}
            style={styles.profileImage}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {user?.name || "Landlord Name"}
            </Text>
            <Text style={styles.profileEmail}>
              {user?.email || "email@example.com"}
            </Text>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>5</Text>
            <Text style={styles.statLabel}>Properties</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>8</Text>
            <Text style={styles.statLabel}>Tenants</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>₦2.5M</Text>
            <Text style={styles.statLabel}>Income</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Ionicons
                name="person-outline"
                size={20}
                color={COLOR_SCHEME.PRIMARY}
              />
            </View>
            <Text style={styles.menuItemText}>Personal Information</Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={COLOR_SCHEME.DARK}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Ionicons
                name="card-outline"
                size={20}
                color={COLOR_SCHEME.PRIMARY}
              />
            </View>
            <Text style={styles.menuItemText}>Bank Details</Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={COLOR_SCHEME.DARK}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color={COLOR_SCHEME.PRIMARY}
              />
            </View>
            <Text style={styles.menuItemText}>Security</Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={COLOR_SCHEME.DARK}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          <View style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Ionicons
                name="notifications-outline"
                size={20}
                color={COLOR_SCHEME.PRIMARY}
              />
            </View>
            <Text style={styles.menuItemText}>Notifications</Text>
            <Switch
              trackColor={{
                false: COLOR_SCHEME.BORDER,
                true: COLOR_SCHEME.PRIMARY + "80",
              }}
              thumbColor={
                notifications ? COLOR_SCHEME.PRIMARY : COLOR_SCHEME.LIGHT
              }
              onValueChange={toggleNotifications}
              value={notifications}
            />
          </View>

          <View style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Ionicons
                name="moon-outline"
                size={20}
                color={COLOR_SCHEME.PRIMARY}
              />
            </View>
            <Text style={styles.menuItemText}>Dark Mode</Text>
            <Switch
              trackColor={{
                false: COLOR_SCHEME.BORDER,
                true: COLOR_SCHEME.PRIMARY + "80",
              }}
              thumbColor={darkMode ? COLOR_SCHEME.PRIMARY : COLOR_SCHEME.LIGHT}
              onValueChange={toggleDarkMode}
              value={darkMode}
            />
          </View>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Ionicons
                name="language-outline"
                size={20}
                color={COLOR_SCHEME.PRIMARY}
              />
            </View>
            <Text style={styles.menuItemText}>Language</Text>
            <View style={styles.menuItemValue}>
              <Text style={styles.menuItemValueText}>English</Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={COLOR_SCHEME.DARK}
              />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Ionicons
                name="help-circle-outline"
                size={20}
                color={COLOR_SCHEME.PRIMARY}
              />
            </View>
            <Text style={styles.menuItemText}>Help Center</Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={COLOR_SCHEME.DARK}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Ionicons
                name="chatbox-outline"
                size={20}
                color={COLOR_SCHEME.PRIMARY}
              />
            </View>
            <Text style={styles.menuItemText}>Contact Support</Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={COLOR_SCHEME.DARK}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Ionicons
                name="star-outline"
                size={20}
                color={COLOR_SCHEME.PRIMARY}
              />
            </View>
            <Text style={styles.menuItemText}>Rate the App</Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={COLOR_SCHEME.DARK}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons
            name="log-out-outline"
            size={20}
            color={COLOR_SCHEME.DANGER}
          />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Version 1.0.0</Text>
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
  scrollContent: {
    padding: 20,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
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
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 15,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLOR_SCHEME.DARK,
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: 14,
    color: COLOR_SCHEME.DARK,
    opacity: 0.7,
  },
  editButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLOR_SCHEME.PRIMARY,
  },
  editButtonText: {
    color: COLOR_SCHEME.PRIMARY,
    fontWeight: "500",
  },
  statsCard: {
    flexDirection: "row",
    backgroundColor: COLOR_SCHEME.WHITE,
    borderRadius: 12,
    padding: 15,
    shadowColor: COLOR_SCHEME.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    padding: 10,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLOR_SCHEME.BORDER,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLOR_SCHEME.PRIMARY,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: COLOR_SCHEME.DARK,
  },
  section: {
    backgroundColor: COLOR_SCHEME.WHITE,
    borderRadius: 12,
    padding: 15,
    shadowColor: COLOR_SCHEME.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLOR_SCHEME.DARK,
    marginBottom: 10,
    marginLeft: 5,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLOR_SCHEME.BORDER,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLOR_SCHEME.LIGHT,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  menuItemText: {
    flex: 1,
    fontSize: 14,
    color: COLOR_SCHEME.DARK,
  },
  menuItemValue: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuItemValueText: {
    fontSize: 14,
    color: COLOR_SCHEME.DARK,
    opacity: 0.7,
    marginRight: 5,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLOR_SCHEME.WHITE,
    borderRadius: 12,
    padding: 15,
    shadowColor: COLOR_SCHEME.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  logoutText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "500",
    color: COLOR_SCHEME.DANGER,
  },
  versionText: {
    textAlign: "center",
    fontSize: 12,
    color: COLOR_SCHEME.DARK,
    opacity: 0.5,
    marginBottom: 20,
  },
});
