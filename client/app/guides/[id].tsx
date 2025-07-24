import PhonePlansGuide from "@/app/guides/phonePlans";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { databases } from "@/lib/appwrite";
import { DATABASEID, GUIDESCOLLECTIONID } from "@/lib/appwrite";
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import DriversLicence from "./driversLicence";
import BankAccount from "./bankAccount";

export const shadowStyle = (opacity: number) => {
  return StyleSheet.create({
    shadow: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: opacity,
      shadowRadius: 4,
      elevation: 2,
    },
  });
};

export default function InfoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    // Function to safely parse JSON strings
    function safeParse(jsonString: string | null | undefined) {
      if (!jsonString) return undefined;
      try {
        return JSON.parse(jsonString);
      } catch {
        return undefined;
      }
    }

    // Fetch the guide document from Appwrite
    const fetchData = async () => {
      try {
        setLoading(true);

        const document = await databases.getDocument(
          DATABASEID,
          GUIDESCOLLECTIONID,
          id
        );

        const data = {
          ...document,
          sections: safeParse(document.sections) ?? [],
          steps: safeParse(document.steps) ?? [],
          bankOptions: safeParse(document.bankOptions) ?? [],
          primaryButton: safeParse(document.primaryButton) ?? null,
          secondaryButton: safeParse(document.secondaryButton) ?? null,
          providers: safeParse(document.providers) ?? [],
          comparisonSites: safeParse(document.comparisonSites) ?? [],
        };
        setContent(data);
      } catch (error) {
        console.error("Failed to fetch guide:", error);
        return null;
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

  if (content.layout === "drivers") {
    return <DriversLicence {...content} />;
  }
  return (
    <ScrollView className="flex-1 bg-white p-4" style={{ paddingBottom: 40 }}>
      {/* Header */}
      <View className="items-center mb-4">
        <Ionicons name={content.icon as any} size={48} color="#0f766e" />
      </View>
      <Text className="text-2xl font-bold text-black mb-4 text-center">
        {content.title}
      </Text>

      {/* Introduction */}
      {content.introduction && (
        <Text className="text-base text-gray-700 mb-6">
          {content.introduction}
        </Text>
      )}

      {/* Steps Section - Optional */}
      {content.steps && (
        <>
          <Text className="text-lg font-semibold mb-3 text-gray-800">
            Steps to Get Started
          </Text>
          {content.steps.map((step: any, index: number) => (
            <View
              key={index}
              className="flex-row items-start bg-gray-50 p-4 mb-3 rounded-xl"
              style={shadowStyle(0.1).shadow}
            >
              {step.icon && (
                <Ionicons
                  name={step.icon as any}
                  size={24}
                  color="#0f766e"
                  className="mr-3"
                />
              )}
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-800">
                  {step.step || step.heading}
                </Text>
                <Text className="text-sm text-gray-600">
                  {step.description || step.body}
                </Text>
              </View>
            </View>
          ))}
        </>
      )}

      {/* Tips Section - Optional */}
      {content.tips && (
        <View className="p-2">
          <Text className="text-lg font-semibold mb-3 text-gray-800">
            Helpful Tips
          </Text>
          {content.tips.map((tip: string, index: number) => (
            <View key={index} className="flex-row items-center mb-2">
              <Ionicons
                name="checkmark-circle"
                size={20}
                color="#0f766e"
                className="mr-2"
              />
              <Text className="text-sm text-gray-600">{tip}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Regular Sections - Fallback */}
      {content.sections?.map((section: any, idx: number) => {
        // Skip if already rendered as steps or tips
        if (section.heading === "Steps" || section.heading === "Tips")
          return null;

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

      {/* Related Resources - Optional */}
      {content.relatedResources && (
        <>
          <Text className="text-lg font-semibold mb-3 text-gray-800 mt-6">
            Related Resources
          </Text>
          <View className="flex-row flex-wrap justify-between">
            {content.relatedResources.map((resource: any, index: number) => (
              <Pressable
                key={index}
                onPress={() =>
                  resource.url.startsWith("/")
                    ? router.push(resource.url)
                    : Linking.openURL(resource.url)
                }
                className="w-[47%] bg-teal-600 rounded-xl p-4 mb-4 items-center"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.15,
                  shadowRadius: 5,
                  elevation: 3,
                }}
              >
                {resource.icon && (
                  <Ionicons
                    name={resource.icon as any}
                    size={24}
                    color="white"
                  />
                )}
                <Text className="text-white text-center font-medium mt-2 text-sm">
                  {resource.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </>
      )}

      {/* Primary and Secondary Buttons */}
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
      {content.primaryButton.label2 && (
        <Pressable
          onPress={() => Linking.openURL(content.primaryButton.url2)}
          className="bg-teal-600 py-3 rounded-xl items-center mb-10"
        >
          <Text className="text-white font-semibold">
            {content.primaryButton.label2}
          </Text>
        </Pressable>
      )}

      {content.secondaryButton && (
        <Pressable
          onPress={() => Linking.openURL(content.secondaryButton.url)}
          className="bg-gray-100 py-3 rounded-xl items-center mb-10"
        >
          <Text className="text-teal-700 font-semibold">
            {content.secondaryButton.label}
          </Text>
        </Pressable>
      )}
    </ScrollView>
  );
}
