import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, Text, View, Image, ScrollView } from "react-native";
import { useAuth } from "../context/auth-context";
import { Button } from "react-native-paper";
import Gradient from "@/components/gradient";

export default function Index() {
  const sections: {
    name: string;
    id: number;
    icon: React.ComponentProps<typeof Ionicons>["name"];
    routes: string;
    color: string;
  }[] = [
    {
      name: "My Checklist",
      id: 1,
      icon: "checkmark-circle",
      routes: "/checklist/checklist",
      color: "#0d9488", // teal-600
    },
    {
      name: "Tips & Help",
      id: 4,
      icon: "bulb",
      routes: "/guide",
      color: "#0d9488", // amber-600
    },
  ];

  const suggestedArticles = [
    {
      title: "How to Get Your SIN",
      route: "/guides/sin",
      icon: "card" as React.ComponentProps<typeof Ionicons>["name"],
    },
    {
      title: "Applying for Alberta ID",
      route: "/guides/alberta-id",
      icon: "id-card" as React.ComponentProps<typeof Ionicons>["name"],
    },
    {
      title: "Best Places to Buy Groceries",
      route: "/guides/grocery",
      icon: "cart" as React.ComponentProps<typeof Ionicons>["name"],
    },
    {
      title: "Opening a Bank Account",
      route: "/guides/bank-account",
      icon: "cash" as React.ComponentProps<typeof Ionicons>["name"],
    },
  ];

  const { user } = useAuth();

  return (
    <Gradient
      styleContainer={{
        flexGrow: 1,
      }}
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View className="w-full items-center px-6">
          <Image
            source={require("../../assets/images/logo_1.png")}
            style={{
              width: 160,
              height: 160,
              resizeMode: "contain",
              marginBottom: 12,
            }}
          />
          <Text className="text-3xl font-bold text-teal-800 text-center">
            Welcome {user?.name || "to Alberta!"}
          </Text>
          <Text className="text-base text-gray-600 mt-2 text-center">
            Your Canadian journey starts here
          </Text>
        </View>

        {/* Main Features */}
        <View className="w-full px-6 mt-8">
          <Text className="text-xl font-bold text-teal-800 mb-4">
            Quick Access
          </Text>
          <View className="flex-row justify-between">
            {sections.map((section) => (
              <Pressable
                key={section.id}
                onPress={() => router.push(section.routes as any)}
                className="w-[48%] aspect-square rounded-2xl items-center justify-center"
                style={{
                  backgroundColor: section.color,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 6,
                  elevation: 4,
                }}
              >
                <View className="bg-white/20 p-4 rounded-full mb-3">
                  <Ionicons name={section.icon} size={32} color="white" />
                </View>
                <Text className="text-lg font-semibold text-white text-center">
                  {section.name}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Suggested Articles Section */}
        <View className="w-full px-6 mt-10">
          <Text className="text-xl font-bold text-teal-800 mb-4">
            Getting Started
          </Text>
          {suggestedArticles.map((item, index) => (
            <Pressable
              key={index}
              onPress={() => router.push(item.route as any)}
              className="bg-white rounded-lg py-4 px-5 mb-3 flex-row items-center justify-between"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 3,
                elevation: 2,
                borderLeftWidth: 4,
                borderLeftColor: "#0d9488",
              }}
            >
              <View className="flex-row items-center">
                <Ionicons
                  name={item.icon}
                  size={20}
                  color="#0d9488"
                  style={{ marginRight: 12 }}
                />
                <Text className="text-gray-800 text-base font-medium">
                  {item.title}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
            </Pressable>
          ))}
        </View>

        {/* Footer */}
        <View className="mt-12 items-center px-6">
          <Button
            mode="text"
            textColor="#0d9488"
            onPress={() => {
              if (!user) router.push("/authentication/auth");
              else router.push("/feedback/feedback");
            }}
            labelStyle={{ fontSize: 16 }}
          >
            {user ? "Send Feedback" : "Sign In"}
          </Button>
          <Text className="text-sm text-gray-500 mt-4 text-center">
            Built with ❤️ to help international students thrive in Alberta 🇨🇦
          </Text>
        </View>
      </ScrollView>
    </Gradient>
  );
}
