import {
  Linking,
  ScrollView,
  Text,
  View,
  Image,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { shadowStyle } from "./bankAccount";

interface ProviderPlan {
  name: string;
  price: number;
  data: string;
  features: string[];
}

interface Provider {
  name: string;
  logo: string;
  type: string;
  studentDeal?: string;
  plans: ProviderPlan[];
  location: string;
  link: string;
}

interface Section {
  heading: string;
  body: string;
}

interface ComparisonSite {
  name: string;
  icon: string;
  link: string;
  description: string;
}

interface Button {
  label: string;
  url: string;
}

interface PhonePlansGuideContent {
  icon: string;
  title: string;
  sections: Section[];
  providers: Provider[];
  comparisonSites: ComparisonSite[];
  tips: string[];
  lastUpdated: string;
  primaryButton: Button;
  secondaryButton: Button;
}

const PhonePlansGuide = (content: PhonePlansGuideContent) => {
  return (
    <ScrollView
      className="flex-1 bg-white p-4"
      contentContainerStyle={{ paddingBottom: 50 }}
    >
      {/* Header Section */}
      <View className="items-center mb-4">
        <Ionicons name={content.icon as any} size={48} color="#0f766e" />
      </View>
      <Text className="text-2xl font-bold text-black mb-4 text-center">
        {content.title}
      </Text>

      {/* Main Content Sections */}
      {content.sections.map((section, idx) => {
        // Split the body into lines for custom rendering
        const lines = section.body.split("\n");

        return (
          <View
            className="flex-column items-start bg-gray-50 p-4 mb-3 rounded-xl"
            style={shadowStyle(0.2).shadow}
            key={idx}
          >
            <View className="flex-row items-center mb-3">
              {/* Section icons */}
              {section.heading === "Why You Need a Canadian Number" && (
                <Ionicons
                  name="call"
                  size={20}
                  color="#0f766e"
                  className="mr-2"
                />
              )}
              {section.heading === "Types of Plans" && (
                <Ionicons
                  name="phone-portrait"
                  size={20}
                  color="#0f766e"
                  className="mr-2"
                />
              )}
              {section.heading === "What to Look For" && (
                <Ionicons
                  name="search"
                  size={20}
                  color="#0f766e"
                  className="mr-2"
                />
              )}
              <Text className="text-lg font-bold text-gray-800">
                {section.heading}
              </Text>
            </View>

            {/* Content rendering with proper line handling */}
            <View className="w-full">
              {lines.map((line, lineIdx) => {
                if (line.trim() === "") return null;
                const isBulletPoint = line.startsWith("- ");

                const isSubheading =
                  !isBulletPoint && line.trim().endsWith(":");

                return (
                  <View
                    key={lineIdx}
                    className={`flex-row mb-1 ${isSubheading ? "mt-3" : ""}`}
                  >
                    {isBulletPoint ? (
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color="#0f766e"
                        className="mr-1 mt-1"
                      />
                    ) : (
                      <View className="w-5" />
                    )}

                    <Text
                      className={`flex-1 text-gray-700 ${
                        isSubheading ? "font-bold" : ""
                      }`}
                    >
                      {isBulletPoint ? line.substring(2) : line}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        );
      })}

      {/* Providers Section */}
      <Text className="text-xl font-extrabold text-teal-600 mb-3 mt-10">
        Recommended Providers
      </Text>

      {/* Budget Providers */}
      <Text className="font-bold text-lg text-gray-700 mb-2">
        Budget Providers
      </Text>
      {content.providers
        .filter((provider) => provider.type === "Budget")
        .map((provider, index) => (
          <ProviderCard key={`budget-${index}`} provider={provider} />
        ))}

      {/* Best Value Plans */}
      <Text className="font-bold text-lg text-gray-700 mb-2 mt-4">
        Best Value Plans
      </Text>
      {content.providers
        .filter((provider) => provider.type === "Best")
        .map((provider, index) => (
          <ProviderCard key={`premium-${index}`} provider={provider} />
        ))}

      {/* Comparison Tools */}
      <Text className="text-xl font-extrabold text-teal-600 mb-3 mt-10">
        Comparison Tools
      </Text>
      {content.comparisonSites.map((site, index) => (
        <Pressable
          key={`site-${index}`}
          onPress={() => Linking.openURL(site.link)}
          className="flex-row items-center bg-gray-50 p-4 rounded-lg mb-3"
        >
          <Ionicons
            name={site.icon as any}
            size={24}
            color="#0f766e"
            className="mr-3"
          />
          <View className="flex-1">
            <Text className="font-semibold">{site.name}</Text>
            <Text className="text-gray-600 text-sm">{site.description}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </Pressable>
      ))}

      {/* Tips Section */}
      <Text className="text-lg font-semibold text-gray-800 mb-3 mt-6">
        Pro Tips for Students
      </Text>
      <View className="bg-teal-50 p-4 rounded-lg">
        {content.tips.map((tip, index) => (
          <View key={`tip-${index}`} className="flex-row mb-2">
            <Ionicons
              name="checkmark-circle"
              size={16}
              color="#0f766e"
              className="mr-2 mt-1"
            />
            <Text className="text-gray-700 flex-1">{tip}</Text>
          </View>
        ))}
      </View>

      {/* Last Updated Notice */}
      <Text className="text-xs text-gray-500 mt-4">
        Last updated: {new Date(content.lastUpdated).toDateString()}
      </Text>
    </ScrollView>
  );
};

// Reusable Provider Card Component
const ProviderCard = ({ provider }: { provider: Provider }) => (
  <View className="border border-gray-200 rounded-xl p-4 mb-3">
    {/* Provider Header */}
    <View className="flex-row items-center mb-3">
      <Image
        source={{ uri: provider.logo }}
        className="w-12 h-12 mr-3 rounded-md"
        resizeMode="contain"
      />
      <View className="flex-1">
        <Text className="font-bold text-lg">{provider.name}</Text>
        {provider.studentDeal && (
          <Text className="text-teal-600 text-sm">{provider.studentDeal}</Text>
        )}
      </View>
    </View>

    {/* Plans */}
    {provider.plans.map((plan, index) => (
      <View key={`plan-${index}`} className="mb-3">
        <View className="flex-row justify-between items-center mb-1">
          <Text className="font-semibold">{plan.name}</Text>
          <Text className="font-bold">${plan.price}/mo</Text>
        </View>
        <View className="flex-row flex-wrap">
          <View className="bg-gray-100 px-2 py-1 rounded-full mr-2 mb-2">
            <Text className="text-xs">{plan.data}</Text>
          </View>
          {plan.features.map((feature, idx) => (
            <View
              key={`feature-${idx}`}
              className="bg-gray-100 px-2 py-1 rounded-full mr-2 mb-2"
            >
              <Text className="text-xs">{feature}</Text>
            </View>
          ))}
        </View>
      </View>
    ))}

    {/* Location and Action */}
    <View className="flex-row justify-between items-center mt-2">
      <View className="flex-row items-center">
        <Ionicons name="location" size={16} color="#6b7280" />
        <Text className="text-gray-600 text-sm ml-1">{provider.location}</Text>
      </View>
      <Pressable
        onPress={() => Linking.openURL(provider.link)}
        className="bg-teal-600 px-3 py-1 rounded-full"
      >
        <Text className="text-white text-sm">View Plans</Text>
      </Pressable>
    </View>
  </View>
);

export default PhonePlansGuide;
