import Gradient from "@/components/gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { Button } from "react-native-paper";

export default function GuideScreen() {
  const router = useRouter();
  const guideSections = [
    {
      title: "Essentials for Arrival",
      items: [
        { label: "Apply for SIN", icon: "card", route: "sin" },
        { label: "Get Alberta ID", icon: "id-card", route: "alberta-id" },
        {
          label: "Get Alberta Health Card",
          icon: "id-card",
          route: "alberta-health-card",
        },
        { label: "Open Bank Account", icon: "wallet", route: "bank-account" },
        { label: "Get Phone Plan", icon: "call", route: "phone-plans" },
        { label: "Buy Groceries", icon: "cart", route: "grocery" },
      ],
    },
    {
      title: "Tips for Life in Canada",
      items: [
        { label: "Surviving Winter", icon: "snow", route: "surviving-winter" },
        { label: "Saving Money", icon: "cash", route: "saving-money" },
      ],
    },
    {
      title: "Optional Tips",
      items: [
        {
          label: "Public Library Card",
          icon: "book",
          route: "public-library-card",
        },
      ],
    },
  ];

  return (
    <Gradient styleContainer={{ paddingHorizontal: 16 }}>
      <Text className="text-xl font-bold my-5 text-[#005965]">
        Getting Settled
      </Text>

      {guideSections.map((section, idx) => (
        <View key={idx} className="">
          <Text className="text-lg font-semibold mb-3 text-gray-800">
            {section.title}
          </Text>

          <View className="flex-row flex-wrap justify-between mb-6">
            {section.items.map((item, index) => (
              <Pressable
                key={index}
                onPress={() => router.push(`/guides/${item.route}`)}
                className="w-[47%] h-32 bg-accent rounded-xl items-center justify-center mb-4"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.15,
                  shadowRadius: 5,
                  elevation: 3,
                }}
              >
                <Ionicons name={item.icon as any} size={36} color="white" />
                <Text className="text-white text-center font-medium mt-2 text-sm">
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      ))}

      {/* Feedback Button Section */}
      <View className="mt-4 mb-8">
        <Text className="text-gray-600 text-center mb-3">
          Have tips to share about living in Canada?
        </Text>
        <Button
          mode="outlined"
          onPress={() => router.push("/feedback/feedback")}
          textColor="#0d9488"
          style={{ borderColor: "#0d9488" }}
          icon={() => <Ionicons name="bulb" size={20} color="#0d9488" />}
        >
          Share Your Suggestions
        </Button>
      </View>
    </Gradient>
  );
}
