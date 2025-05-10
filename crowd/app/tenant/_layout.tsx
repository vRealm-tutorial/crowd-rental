import { Tabs } from "expo-router";
import { COLOR_SCHEME } from "@/constants";
import { Ionicons } from "@expo/vector-icons";

const TenantLayout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLOR_SCHEME.PRIMARY,
        tabBarInactiveTintColor: COLOR_SCHEME.DARK,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="home"
              size={size}
              color={color}
              accessibilityLabel="Home"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="saved"
        options={{
          title: "Saved",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="heart"
              size={size}
              color={color}
              accessibilityLabel="Saved"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="bookings"
        options={{
          title: "Bookings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="calendar"
              size={size}
              color={color}
              accessibilityLabel="Bookings"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="person"
              size={size}
              color={color}
              accessibilityLabel="Profile"
            />
          ),
        }}
      />
    </Tabs>
  );
};

export default TenantLayout;
