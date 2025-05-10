import { Tabs } from "expo-router";
import { COLOR_SCHEME } from "@/constants";
import { Ionicons } from "@expo/vector-icons";

const AgentLayout = () => {
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
          title: "Properties",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: "Viewings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="clients"
        options={{
          title: "Clients",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
};

export default AgentLayout;
