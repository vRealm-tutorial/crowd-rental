import { Tabs } from "expo-router";
import { COLOR_SCHEME } from "@/constants";
import { Ionicons } from "@expo/vector-icons";

const LandlordLayout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLOR_SCHEME.PRIMARY,
        tabBarInactiveTintColor: COLOR_SCHEME.DARK,
        headerShown: false,
        tabBarStyle: {
          elevation: 5,
          shadowOpacity: 0.1,
          shadowRadius: 4,
          shadowColor: COLOR_SCHEME.BLACK,
          shadowOffset: { width: 0, height: -3 },
          borderTopColor: COLOR_SCHEME.BORDER,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
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
        name="add-property"
        options={{
          title: "Add",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="viewings"
        options={{
          title: "Viewings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="income"
        options={{
          title: "Income",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cash" size={size} color={color} />
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

export default LandlordLayout;
