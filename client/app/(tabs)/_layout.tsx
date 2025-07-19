import { Ionicons } from "@expo/vector-icons";
import { router, Tabs } from "expo-router";
import React from "react";
import { TouchableOpacity } from "react-native";

const _layout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "teal",
        headerStyle: {
          backgroundColor: "#E0F7FA",
          shadowColor: "transparent",
        },
        headerTintColor: "#005965",

        headerTitleAlign: "center",
        headerTitleStyle: {
          fontWeight: "bold",
          textAlignVertical: "center",
          fontSize: 20,
        },
        headerRight: () => (
          <TouchableOpacity
            onPress={() => router.push("/profile/profile")}
            style={{ marginRight: 20 }}
          >
            <Ionicons name="person-circle-outline" size={30} color="#005965" />
          </TouchableOpacity>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: "Home",
          title: "Welcome",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="business"
        options={{
          title: "Find Business",
          tabBarLabel: "Business",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="business" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="guide"
        options={{
          title: "Tips & Guide",
          tabBarLabel: "Guide",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
};

export default _layout;
