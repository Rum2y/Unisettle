import { View, Text, TouchableOpacity, Alert, Switch } from "react-native";
import { router } from "expo-router";
import { useAuth } from "../context/auth-context";
import { Ionicons } from "@expo/vector-icons";
import Gradient from "@/components/gradient";
import { Button } from "react-native-paper";
import Constants from "expo-constants";
import { MaterialIcons } from "@expo/vector-icons";

const Profile = () => {
  const { user, signOut } = useAuth();

  const appVersion = Constants.expoConfig?.version || "1.0.0";

  const handleSignOut = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: () => {
            signOut();
            router.replace("/authentication/auth");
          },
        },
      ],
      { cancelable: false }
    );
  };

  const handleSignIn = () => {
    router.push("/../authentication/auth" as any);
  };

  const options = [
    {
      text: "Manage My Businesses",
      icon: "business" as React.ComponentProps<typeof Ionicons>["name"],
      route: "/managebusiness/manageBusiness",
    },
    {
      text: "Bookmarks",
      icon: "bookmark" as React.ComponentProps<typeof Ionicons>["name"],
      route: "/managebusiness/savedBusiness",
    },
    {
      text: "Manage Subscriptions",
      icon: "card" as React.ComponentProps<typeof Ionicons>["name"],
      route: "/manageSubscriptions/manageSubscriptions",
    },
  ];

  return (
    <Gradient styleContainer={{ padding: 20 }}>
      {/* Profile Header */}
      <View className="items-center mb-8">
        <View className="w-32 h-32 bg-teal-100 rounded-full items-center justify-center mb-4 border-4 border-teal-200">
          {user ? (
            <Text className="text-4xl font-bold text-teal-600">
              {user.name.charAt(0).toUpperCase()}
            </Text>
          ) : (
            <Ionicons name="person" size={48} color="#0d9488" />
          )}
        </View>

        {user ? (
          <>
            <Text className="text-2xl font-bold text-teal-800">
              {user.name}
            </Text>
            <Text className="text-gray-600">{user.email}</Text>
          </>
        ) : (
          <Text className="text-2xl font-bold text-teal-800">Guest User</Text>
        )}
      </View>

      {/* Main Options Card */}
      <View className="bg-white rounded-xl p-6 mb-6 shadow-sm">
        {user ? (
          <>
            {options.map((option) => (
              <TouchableOpacity
                key={option.text}
                className="flex-row items-center py-4 border-b border-gray-100"
                onPress={() => router.push(option.route as any)}
              >
                <View className="bg-teal-100 p-2 rounded-lg mr-4">
                  <Ionicons name={option.icon} size={20} color="#0d9488" />
                </View>
                <Text className="text-teal-800 font-medium flex-1">
                  {option.text}
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>
            ))}
          </>
        ) : (
          <TouchableOpacity
            className="flex-row items-center py-4"
            onPress={handleSignIn}
          >
            <View className="bg-teal-100 p-2 rounded-lg mr-4">
              <Ionicons name="log-in" size={20} color="#0d9488" />
            </View>
            <Text className="flex-1 text-teal-800 font-medium">
              Sign In to Access Features
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
        )}

        {/* Location Preference */}
        <View className="flex-row items-center justify-between py-4 border-b border-gray-100">
          <View className="flex-row items-center">
            <View className="bg-teal-100 p-2 rounded-lg mr-4">
              <MaterialIcons name="location-on" size={20} color="#0d9488" />
            </View>
            <Text className="text-teal-800 font-medium">Location</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/")} // You can add a location selection screen later
            className="flex-row items-center"
            disabled={true} // Makes it non-interactive for now
          >
            <Text className="text-gray-400 mr-2">Alberta</Text>
            <Ionicons name="chevron-forward" size={20} color="#e5e7eb" />
          </TouchableOpacity>
        </View>

        {/* Dark Mode Toggle */}
        {/* <View className="flex-row items-center justify-between py-4 border-b border-gray-100">
          <View className="flex-row items-center">
            <View className="bg-teal-100 p-2 rounded-lg mr-4">
              <Ionicons name="moon" size={20} color="#0d9488" />
            </View>
            <Text className="text-teal-800 font-medium">Dark Mode</Text>
          </View>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: "#e5e7eb", true: "#0d9488" }}
            thumbColor={darkMode ? "#f8fafc" : "#f8fafc"}
          />
        </View> */}

        {/* Feedback Option */}
        <TouchableOpacity
          className="flex-row items-center py-4"
          onPress={() => router.push("/feedback/feedback")}
        >
          <View className="bg-teal-100 p-2 rounded-lg mr-4">
            <Ionicons name="chatbubble-ellipses" size={20} color="#0d9488" />
          </View>
          <Text className="flex-1 text-teal-800 font-medium">
            Send Feedback
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      {/* Authentication Buttons */}
      {user ? (
        <Button
          mode="outlined"
          onPress={handleSignOut}
          textColor="#0d9488"
          style={{ borderColor: "#0d9488" }}
          className="mt-4"
        >
          Sign Out
        </Button>
      ) : (
        <View className="flex-row justify-center gap-4">
          <Button
            mode="outlined"
            onPress={handleSignIn}
            textColor="#0d9488"
            style={{ borderColor: "#0d9488" }}
          >
            Sign In
          </Button>
          <Button
            mode="contained"
            onPress={() => router.push("/authentication/auth?id=signup")}
            buttonColor="#0d9488"
          >
            Sign Up
          </Button>
        </View>
      )}
      {/* App Version */}
      <Text className="text-gray-500 text-xs text-center mt-10 ">
        Version {appVersion}
      </Text>
    </Gradient>
  );
};

export default Profile;
