import {
  View,
  Text,
  ScrollView,
  Pressable,
  Linking,
  StyleSheet,
} from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

interface Step {
  icon: string;
  step: string;
  description: string;
}

interface BankOption {
  name: string;
  location: string;
  distance: string;
  features: string;
  website: string;
}

interface Button {
  label: string;
  url: string;
}

interface BankAccountProps {
  icon: string;
  title: string;
  steps?: Step[];
  bankOptions?: BankOption[];
  tips?: string[];
  primaryButton: Button;
  secondaryButton: Button;
}

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

const BankAccount: React.FC<BankAccountProps> = (content) => {
  const router = useRouter();
  return (
    <ScrollView className="flex-1 bg-white p-4">
      {/* Header */}
      <View className="items-center mb-4">
        <Ionicons name={content.icon as any} size={48} color="#0f766e" />
      </View>
      <Text className="text-2xl font-bold text-black mb-4 text-center">
        {content.title}
      </Text>

      {/* Introduction */}
      <Text className="text-base text-gray-700 mb-6">
        As an international student, setting up a bank account is essential for
        managing your finances in Canada. Here's a step-by-step guide to make it
        easy, plus local bank options near the University of Alberta.
      </Text>

      {/* Steps Section */}
      <Text className="text-lg font-semibold mb-3 text-gray-800">
        Steps to Open a Bank Account
      </Text>
      {content.steps?.map((step: Step, index: number) => (
        <View
          key={index}
          className="flex-row items-start bg-gray-50 p-4 mb-3 rounded-xl"
          style={shadowStyle(0.1).shadow}
        >
          <Ionicons
            name={step.icon as any}
            size={24}
            color="#0f766e"
            className="mr-3"
          />
          <View className="flex-1">
            <Text className="text-base font-semibold text-gray-800">
              {step.step}
            </Text>
            <Text className="text-sm text-gray-600">{step.description}</Text>
          </View>
        </View>
      ))}

      {/* Bank Options Section */}
      <Text className="text-lg font-semibold mb-3 text-gray-800 mt-6">
        Recommended Banks Near U of A
      </Text>
      <View className="flex-row flex-wrap justify-between mb-6">
        {content.bankOptions?.map((bank: BankOption, index: number) => (
          <Pressable
            key={index}
            onPress={() => Linking.openURL(bank.website)}
            className="w-[47%] bg-white rounded-2xl p-4 mb-4 border border-gray-100"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.07,
              shadowRadius: 6,
              elevation: 4,
            }}
          >
            <Text className="text-lg font-semibold text-teal-700 mb-1">
              {bank.name}
            </Text>
            <Text className="text-sm text-gray-700">{bank.location}</Text>
            <Text className="text-sm text-gray-500">{bank.distance}</Text>
            <Text className="text-sm text-gray-600 mt-2">{bank.features}</Text>
          </Pressable>
        ))}
      </View>

      {/* Tips Section */}
      <View className="p-2">
        <Text className="text-lg font-semibold mb-3 text-gray-800">
          Tips for International Students
        </Text>
        {content.tips?.map((tip: string, index: number) => (
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

      {/* Related Resources */}
      <Text className="text-lg font-semibold mb-3 text-gray-800 mt-6">
        Related Resources
      </Text>
      <View className="flex-row flex-wrap justify-between">
        <Pressable
          onPress={() => router.push("/guides/sin")}
          className="w-[47%] bg-teal-600 rounded-xl p-4 mb-4 items-center"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 5,
            elevation: 3,
          }}
        >
          <Ionicons name="card" size={24} color="white" />
          <Text className="text-white text-center font-medium mt-2 text-sm">
            Apply for SIN
          </Text>
        </Pressable>
        <Pressable
          onPress={() => router.push("/guides/saving-money")}
          className="w-[47%] bg-teal-600 rounded-xl p-4 mb-4 items-center"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 5,
            elevation: 3,
          }}
        >
          <Ionicons name="cash" size={24} color="white" />
          <Text className="text-white text-center font-medium mt-2 text-sm">
            Saving Money
          </Text>
        </Pressable>
      </View>

      {/* Primary and Secondary Buttons */}
      <Pressable
        onPress={() => Linking.openURL(content.primaryButton.url)}
        className="bg-teal-600 py-3 rounded-xl items-center mb-4"
      >
        <Text className="text-white font-semibold">
          {content.primaryButton.label}
        </Text>
      </Pressable>

      <Pressable
        onPress={() => Linking.openURL(content.secondaryButton.url)}
        className="bg-gray-100 py-3 rounded-xl items-center"
      >
        <Text className="text-teal-700 font-semibold">
          {content.secondaryButton.label}
        </Text>
      </Pressable>
    </ScrollView>
  );
};

export default BankAccount;
