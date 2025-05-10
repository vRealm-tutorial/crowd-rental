import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { StackNavigationProp } from "@react-navigation/stack";
import { COLOR_SCHEME, UserRoles } from "../constants";
import { useRouter } from "expo-router";

const RoleSelectionScreen = () => {
  const router = useRouter();

  const [selectedRole, setSelectedRole] = useState<UserRoles | null>(null);

  const handleContinue = () => {
    if (selectedRole) {
      router.push({
        pathname: "/register",
        params: { role: selectedRole },
      });
    }
  };

  // Role card component for each role option
  interface RoleCardProps {
    title: string;
    description: string;
    iconName: keyof typeof Ionicons.glyphMap;
    role: UserRoles;
  }

  const RoleCard: React.FC<RoleCardProps> = ({
    title,
    description,
    iconName,
    role,
  }) => (
    <TouchableOpacity
      style={[
        styles.roleCard,
        selectedRole === role && styles.selectedRoleCard,
      ]}
      onPress={() => setSelectedRole(role)}
    >
      <View style={styles.iconContainer}>
        <Ionicons name={iconName} size={28} color={COLOR_SCHEME.PRIMARY} />
      </View>
      <View style={styles.roleInfo}>
        <Text
          style={[
            styles.roleTitle,
            selectedRole === role && styles.selectedRoleTitle,
          ]}
        >
          {title}
        </Text>
        <Text
          style={[
            styles.roleDescription,
            selectedRole === role && styles.selectedRoleDescription,
          ]}
        >
          {description}
        </Text>
      </View>
      <View style={styles.checkmark}>
        {selectedRole === role && (
          <Ionicons
            name="checkmark-circle"
            size={24}
            color={COLOR_SCHEME.WHITE}
          />
        )}
      </View>
    </TouchableOpacity>
  );

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
        <Text style={styles.headerTitle}>Choose Your Role</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.subtitle}>
          Select the role that best describes how you will use this app.
        </Text>

        <View style={styles.roleCardsContainer}>
          <RoleCard
            title="Tenant"
            description="I'm looking for a property to rent"
            iconName="search"
            role={UserRoles.TENANT}
          />

          <RoleCard
            title="Landlord"
            description="I want to list my property for rent"
            iconName="home"
            role={UserRoles.LANDLORD}
          />

          <RoleCard
            title="Agent"
            description="I help connect tenants with landlords"
            iconName="people"
            role={UserRoles.AGENT}
          />
        </View>

        <View style={styles.infoContainer}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={COLOR_SCHEME.INFO}
          />
          <Text style={styles.infoText}>
            Don't worry, you can switch your role later in settings if needed.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedRole && styles.disabledButton,
          ]}
          onPress={handleContinue}
          disabled={!selectedRole}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
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
  contentContainer: {
    padding: 20,
  },
  subtitle: {
    fontSize: 16,
    color: COLOR_SCHEME.DARK,
    marginBottom: 25,
    textAlign: "center",
  },
  roleCardsContainer: {
    marginBottom: 20,
  },
  roleCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: COLOR_SCHEME.LIGHT,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLOR_SCHEME.BORDER,
  },
  selectedRoleCard: {
    backgroundColor: COLOR_SCHEME.PRIMARY,
    borderColor: COLOR_SCHEME.PRIMARY,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLOR_SCHEME.WHITE,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  roleInfo: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLOR_SCHEME.DARK,
    marginBottom: 5,
  },
  selectedRoleTitle: {
    color: COLOR_SCHEME.WHITE,
  },
  roleDescription: {
    fontSize: 14,
    color: COLOR_SCHEME.DARK,
    opacity: 0.8,
  },
  selectedRoleDescription: {
    color: COLOR_SCHEME.WHITE,
    opacity: 0.9,
  },
  checkmark: {
    width: 24,
    height: 24,
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLOR_SCHEME.LIGHT,
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  infoText: {
    marginLeft: 10,
    fontSize: 14,
    color: COLOR_SCHEME.DARK,
    flex: 1,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLOR_SCHEME.BORDER,
    paddingBottom: Platform.OS === "ios" ? 20 : 30,
  },
  continueButton: {
    backgroundColor: COLOR_SCHEME.PRIMARY,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: COLOR_SCHEME.BORDER,
  },
  continueButtonText: {
    color: COLOR_SCHEME.WHITE,
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default RoleSelectionScreen;
