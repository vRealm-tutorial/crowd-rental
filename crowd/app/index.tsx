// // App.tsx
// import React, { useEffect, useState } from "react";
// import { NavigationContainer } from "@react-navigation/native";
// import { createStackNavigator } from "@react-navigation/stack";
// import { StatusBar } from "expo-status-bar";
// import { StyleSheet, Text, View } from "react-native";
// import { SafeAreaProvider } from "react-native-safe-area-context";
// import * as SplashScreen from "expo-splash-screen";
// import { useFonts } from "expo-font";
// import useAuthStore from "@/hooks/useAuthStore";
// import { UserRoles } from "@/constants";

// // Import navigators (these would be created in separate files)
// // We're just defining placeholders for now
// const AuthStack = createStackNavigator();
// const TenantStack = createStackNavigator();
// const LandlordStack = createStackNavigator();
// const AgentStack = createStackNavigator();
// const RootStack = createStackNavigator();

// // Placeholder screens (you would create these in separate files)
// const SplashScreenComponent = () => (
//   <View style={styles.container}>
//     <Text>Loading...</Text>
//   </View>
// );

// const WelcomeScreen = () => (
//   <View style={styles.container}>
//     <Text>Welcome Screen</Text>
//   </View>
// );

// const LoginScreen = () => (
//   <View style={styles.container}>
//     <Text>Login Screen</Text>
//   </View>
// );

// const RegisterScreen = () => (
//   <View style={styles.container}>
//     <Text>Register Screen</Text>
//   </View>
// );

// const TenantHomeScreen = () => (
//   <View style={styles.container}>
//     <Text>Tenant Home</Text>
//   </View>
// );

// const LandlordHomeScreen = () => (
//   <View style={styles.container}>
//     <Text>Landlord Home</Text>
//   </View>
// );

// const AgentHomeScreen = () => (
//   <View style={styles.container}>
//     <Text>Agent Home</Text>
//   </View>
// );

// // Auth Navigator
// const AuthNavigator = () => (
//   <AuthStack.Navigator>
//     <AuthStack.Screen
//       name="Welcome"
//       component={WelcomeScreen}
//       options={{ headerShown: false }}
//     />
//     <AuthStack.Screen
//       name="Login"
//       component={LoginScreen}
//       options={{ headerShown: false }}
//     />
//     <AuthStack.Screen
//       name="Register"
//       component={RegisterScreen}
//       options={{ headerShown: false }}
//     />
//   </AuthStack.Navigator>
// );

// // Tenant Navigator
// const TenantNavigator = () => (
//   <TenantStack.Navigator>
//     <TenantStack.Screen name="Home" component={TenantHomeScreen} />
//   </TenantStack.Navigator>
// );

// // Landlord Navigator
// const LandlordNavigator = () => (
//   <LandlordStack.Navigator>
//     <LandlordStack.Screen name="Home" component={LandlordHomeScreen} />
//   </LandlordStack.Navigator>
// );

// // Agent Navigator
// const AgentNavigator = () => (
//   <AgentStack.Navigator>
//     <AgentStack.Screen name="Home" component={AgentHomeScreen} />
//   </AgentStack.Navigator>
// );

// // Keep splash screen visible while we determine authentication state
// SplashScreen.preventAutoHideAsync();

// export default function App() {
//   const [appIsReady, setAppIsReady] = useState(false);
//   const { isAuthenticated, user, getUserProfile } = useAuthStore();

//   // Load fonts if needed
//   const [fontsLoaded] = useFonts({
//     // Add custom fonts here if needed
//     // 'CustomFont-Regular': require('./assets/fonts/CustomFont-Regular.ttf'),
//   });

//   useEffect(() => {
//     async function prepare() {
//       try {
//         // Pre-load resources or make API calls if needed
//         if (isAuthenticated) {
//           await getUserProfile();
//         }

//         // Artificial delay for splash screen if needed
//         // await new Promise(resolve => setTimeout(resolve, 1000));
//       } catch (e) {
//         console.warn(e);
//       } finally {
//         // Tell the app it's ready to render
//         setAppIsReady(true);
//       }
//     }

//     prepare();
//   }, [isAuthenticated, getUserProfile]);

//   useEffect(() => {
//     // When fonts are loaded and other resources are ready, hide splash screen
//     if (appIsReady && fontsLoaded) {
//       SplashScreen.hideAsync();
//     }
//   }, [appIsReady, fontsLoaded]);

//   if (!appIsReady || !fontsLoaded) {
//     return null;
//   }

//   // Determine which navigator to render based on authentication state
//   const getNavigator = () => {
//     if (!isAuthenticated) {
//       return <AuthNavigator />;
//     }

//     // Choose navigator based on user role
//     switch (user?.role) {
//       case UserRoles.TENANT:
//         return <TenantNavigator />;
//       case UserRoles.LANDLORD:
//         return <LandlordNavigator />;
//       case UserRoles.AGENT:
//         return <AgentNavigator />;
//       default:
//         return <AuthNavigator />;
//     }
//   };

//   return (
//     <SafeAreaProvider>
//       <StatusBar style="auto" />
//       <NavigationContainer>
//         {/* <RootStack.Navigator screenOptions={{ headerShown: false }}>
//           <RootStack.Screen name="Main">
//             {() => getNavigator()}
//           </RootStack.Screen>
//         </RootStack.Navigator> */}
//         {!isAuthenticated ? (
//           <AuthNavigator />
//         ) : (
//           <>
//             {user?.role === UserRoles.TENANT && <TenantNavigator />}
//             {user?.role === UserRoles.LANDLORD && <LandlordNavigator />}
//             {user?.role === UserRoles.AGENT && <AgentNavigator />}
//             {!user?.role && <AuthNavigator />}
//           </>
//         )}
//       </NavigationContainer>
//     </SafeAreaProvider>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//     alignItems: "center",
//     justifyContent: "center",
//   },
// });

// app/index.tsx (your welcome screen)
import { Link } from "expo-router";
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
import { COLOR_SCHEME } from "@/constants";

const { width, height } = Dimensions.get("window");

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.headerContainer}>
        <Image
          source={require("../assets/images/icon.png")}
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
        <Link href="/login" asChild>
          <TouchableOpacity style={styles.buttonPrimary}>
            <Text style={styles.buttonPrimaryText}>Log In</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/role-selection" asChild>
          <TouchableOpacity style={styles.buttonSecondary}>
            <Text style={styles.buttonSecondaryText}>Create Account</Text>
          </TouchableOpacity>
        </Link>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </SafeAreaView>
  );
}

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
