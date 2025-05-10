import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { StackNavigationProp } from "@react-navigation/stack";
import { COLOR_SCHEME } from "../constants";

const { width, height } = Dimensions.get("window");

// Define the navigation params for the auth stack
type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  RoleSelection: undefined;
};

// Define props type for the component
type WelcomeScreenProps = {
  navigation: StackNavigationProp<AuthStackParamList, "Welcome">;
};

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.headerContainer}>
        <Image
          source={require("../assets/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Housing Rental App</Text>
        <Text style={styles.subtitle}>Find Your Perfect Home in Nigeria</Text>
      </View>

      <View style={styles.featuresContainer}>
        <View style={styles.featureRow}>
          <Ionicons name="search" size={24} color={COLOR_SCHEME.PRIMARY} />
          <Text style={styles.featureText}>
            Discover nearby properties for rent
          </Text>
        </View>

        <View style={styles.featureRow}>
          <Ionicons name="calendar" size={24} color={COLOR_SCHEME.PRIMARY} />
          <Text style={styles.featureText}>Book viewings with ease</Text>
        </View>

        <View style={styles.featureRow}>
          <Ionicons name="home" size={24} color={COLOR_SCHEME.PRIMARY} />
          <Text style={styles.featureText}>
            List your property with just a few taps
          </Text>
        </View>
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.buttonPrimary}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.buttonPrimaryText}>Log In</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buttonSecondary}
          onPress={() => navigation.navigate("RoleSelection")}
        >
          <Text style={styles.buttonSecondaryText}>Create Account</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLOR_SCHEME.WHITE,
  },
  headerContainer: {
    alignItems: "center",
    paddingTop: height * 0.05,
    paddingBottom: height * 0.05,
  },
  logo: {
    width: width * 0.4,
    height: width * 0.4,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLOR_SCHEME.PRIMARY,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: COLOR_SCHEME.DARK,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  featuresContainer: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 20,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: COLOR_SCHEME.LIGHT,
    padding: 15,
    borderRadius: 10,
  },
  featureText: {
    marginLeft: 15,
    fontSize: 16,
    color: COLOR_SCHEME.DARK,
    flex: 1,
  },
  buttonsContainer: {
    paddingHorizontal: 30,
    paddingBottom: 20,
  },
  buttonPrimary: {
    backgroundColor: COLOR_SCHEME.PRIMARY,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
  },
  buttonPrimaryText: {
    color: COLOR_SCHEME.WHITE,
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonSecondary: {
    backgroundColor: COLOR_SCHEME.WHITE,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLOR_SCHEME.PRIMARY,
  },
  buttonSecondaryText: {
    color: COLOR_SCHEME.PRIMARY,
    fontSize: 16,
    fontWeight: "bold",
  },
  footer: {
    paddingHorizontal: 30,
    paddingBottom: Platform.OS === "ios" ? 20 : 30,
    alignItems: "center",
  },
  footerText: {
    color: COLOR_SCHEME.DARK,
    fontSize: 12,
    textAlign: "center",
  },
});

export default WelcomeScreen;
