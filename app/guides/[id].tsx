import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import { Linking, Pressable, ScrollView, Text, View } from "react-native";
import PhonePlansGuide from "@/app/guides/phonePlans";
import BankAccount from "./bankAccount";
import { fetchGuideById } from "@/lib/appwrite";

export default function InfoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await fetchGuideById(id);
        setContent(data);
      } catch (error) {
        console.error("Error fetching guide:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!content) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Content not found.</Text>
      </View>
    );
  }

  if (content.layout === "bank") {
    return <BankAccount {...content} />;
  }

  if (content.layout === "phone") {
    return <PhonePlansGuide {...content} />;
  }

  if (content.layout === "default" || !content.layout) {
    return (
      <ScrollView className="flex-1 bg-white p-4">
        <View className="items-center mb-4">
          <Ionicons name={content.icon as any} size={48} color="#0f766e" />
        </View>

        <Text className="text-2xl font-bold text-black mb-4 text-center">
          {content.title}
        </Text>

        {content.sections?.map((section: any, idx: number) => {
          // Split the body into lines
          const lines = section.body.split("\n");

          return (
            <View className="mb-6" key={idx}>
              <Text className="text-lg font-semibold text-gray-800 mb-3">
                {section.heading}
              </Text>

              {/* Render each line with custom bullet styling */}
              <View className="space-y-1">
                {lines.map((line: string, lineIdx: number) => {
                  // Skip empty lines
                  if (line.trim() === "") return null;

                  // Check if this is a bullet point
                  const isBulletPoint = line.startsWith("- ");

                  return (
                    <View key={lineIdx} className="flex-row items-start">
                      {isBulletPoint ? (
                        <>
                          <Ionicons
                            name="checkmark-circle"
                            size={16}
                            color="#0f766e"
                            style={{ marginRight: 8, marginTop: 3 }}
                          />
                          <Text className="text-gray-700 flex-1">
                            {line.substring(2)}
                          </Text>
                        </>
                      ) : (
                        <Text className="text-gray-700">{line}</Text>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })}

        {content.primaryButton && (
          <Pressable
            onPress={() => Linking.openURL(content.primaryButton.url)}
            className="bg-teal-600 py-3 rounded-xl items-center mb-4"
          >
            <Text className="text-white font-semibold">
              {content.primaryButton.label}
            </Text>
          </Pressable>
        )}

        {content.secondaryButton && (
          <Pressable
            onPress={() => Linking.openURL(content.secondaryButton.url)}
            className="bg-gray-100 py-3 rounded-xl items-center"
          >
            <Text className="text-teal-700 font-semibold">
              {content.secondaryButton.label}
            </Text>
          </Pressable>
        )}
      </ScrollView>
    );
  }
}
