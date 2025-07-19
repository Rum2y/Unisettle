import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "./context/auth-context";
import "./global.css";

export default function RootLayout() {
  return (
    <AuthProvider>
      {/* Background View under the status bar */}

      <StatusBar style="dark" translucent />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="guides/[id]"
          options={{
            title: "Guide Details",
            headerTitleAlign: "center",
            headerBackTitle: "Back",
            headerStyle: { backgroundColor: "teal" },
            headerTintColor: "white",
          }}
        />
        <Stack.Screen
          name="guides/grocery"
          options={{
            title: "Grocery Guide",
            headerTitleAlign: "center",
            headerBackTitle: "Back",
            headerStyle: { backgroundColor: "teal" },
            headerTintColor: "white",
          }}
        />
        <Stack.Screen
          name="authentication/auth"
          options={{
            title: "Authentication",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="authentication/forgotPassword"
          options={{
            title: "Authentication",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="checklist/checklist"
          options={{
            title: "Checklist",
            headerStyle: { backgroundColor: "#E0F7FA" },
            headerBackTitle: "Back",
            headerTintColor: "#005965",
            headerTitleStyle: {
              fontWeight: "bold",

              fontSize: 20,
            },
          }}
        />
        <Stack.Screen
          name="guides/housing"
          options={{
            title: "Find Housing",
            headerStyle: { backgroundColor: "#E0F7FA" },
            headerBackTitle: "Back",
            headerTintColor: "black",
          }}
        />
        <Stack.Screen
          name="businesses/[biz]"
          options={{
            title: "Add Business",
            headerStyle: { backgroundColor: "teal" },
            headerBackTitle: "Back",
            headerTintColor: "white",
          }}
        />
        <Stack.Screen
          name="profile/profile"
          options={{
            title: "Profile",
            headerStyle: { backgroundColor: "#E0F7FA" },
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 20,
            },
            headerBackTitle: "Back",
            headerTintColor: "#005965",
          }}
        />
        <Stack.Screen
          name="managebusiness/manageBusiness"
          options={{
            title: "Manage Business",
            headerStyle: { backgroundColor: "#E0F7FA" },
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 20,
            },
            headerBackTitle: "Back",
            headerTintColor: "#005965",
          }}
        />
        <Stack.Screen
          name="managebusiness/savedBusiness"
          options={{
            title: "Saved Businesses",
            headerStyle: { backgroundColor: "#E0F7FA" },
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 20,
            },
            headerBackTitle: "Back",
            headerTintColor: "#005965",
          }}
        />
        <Stack.Screen
          name="feedback/feedback"
          options={{
            title: "Send Feedback",
            headerStyle: { backgroundColor: "#E0F7FA" },
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 20,
            },
            headerBackTitle: "Back",
            headerTintColor: "#005965",
          }}
        />
      </Stack>
    </AuthProvider>
  );
}
