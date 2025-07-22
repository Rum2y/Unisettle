import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "../context/auth-context";
import { Ionicons } from "@expo/vector-icons";
import Gradient from "@/components/gradient";
import { Button } from "react-native-paper";
import { useState, useEffect } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const PaymentPlan = () => {
  const { user, isSubscribed, proUser } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState("monthly");
  const [buttonText, setButtonText] = useState("Start 60-Day Free Trial");
  const [isTrialing, setIsTrialing] = useState(true);

  useEffect(() => {
    const checkTrialStatus = async () => {
      if (isSubscribed && user) {
        const documents = await proUser(user);
        if (documents.length > 0) {
          const trialEnd = documents[0].data.freeTrialEnd;
          const isTrialActive = trialEnd
            ? new Date(trialEnd).getTime() > Date.now()
            : false;
          setIsTrialing(isTrialActive);
          if (isTrialActive) {
            setButtonText("Start 60-Day Free Trial");
          } else {
            setButtonText("Subscribe Now");
          }
        }
      }
    };
    checkTrialStatus();
  }, [user]);
  const handleSubscribe = () => {
    Alert.alert(
      "Start Free Trial",
      "Your 60-day free trial will begin immediately. After 60 days, your subscription will automatically renew at $14.99/month until canceled.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Start Free Trial",
          onPress: () => {
            router.replace("/checkout");
          },
        },
      ]
    );
  };

  return (
    <Gradient styleContainer={{ padding: 20 }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Back button */}

        {/* Header */}
        <View className="items-center mb-8">
          <View className="w-20 h-20 bg-teal-100 rounded-full items-center justify-center mb-4 border-4 border-teal-200">
            <MaterialCommunityIcons name="crown" size={32} color="#0d9488" />
          </View>
          <Text className="text-2xl font-bold text-teal-800">
            Business Creator Plan
          </Text>
          <Text className="text-gray-600 mt-2 text-center">
            Subscribe to add and manage multiple businesses
          </Text>
        </View>

        {/* Plan Selection */}
        <View className="bg-white rounded-xl p-6 mb-6 shadow-sm">
          <Text className="text-lg font-bold text-teal-800 mb-4">
            Choose Your Plan
          </Text>

          {/* Monthly Plan */}
          <TouchableOpacity
            className={`flex-row items-center justify-between p-4 mb-3 rounded-lg border-2 ${
              selectedPlan === "monthly"
                ? "border-teal-500 bg-teal-50"
                : "border-gray-200"
            }`}
            onPress={() => setSelectedPlan("monthly")}
          >
            <View>
              <Text className="font-bold text-teal-800">Monthly</Text>
              <Text className="text-gray-600">Flexible subscription</Text>
            </View>
            <View className="items-end">
              <Text className="font-bold text-teal-800">$9.99</Text>
              <Text className="text-gray-600">per month</Text>
            </View>
          </TouchableOpacity>

          {/* Annual Plan (optional) */}
          <TouchableOpacity
            className={`flex-row items-center justify-between p-4 rounded-lg border-2 ${
              selectedPlan === "annual"
                ? "border-teal-500 bg-teal-50"
                : "border-gray-200"
            }`}
            onPress={() => setSelectedPlan("annual")}
            disabled={true}
          >
            <View>
              <Text className="font-bold text-teal-800">Annual</Text>
              <Text className="text-gray-600">Save 20%</Text>
            </View>
            <View className="items-end">
              <Text className="font-bold text-teal-800">$95.90</Text>
              <Text className="text-gray-600">$7.99/month</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Free Trial Banner */}
        {isTrialing && (
          <View className="bg-teal-100 rounded-xl p-4 mb-6 flex-row items-center">
            <Ionicons name="gift" size={24} color="#0d9488" className="mr-3" />
            <View>
              <Text className="font-bold text-teal-800">60-Day Free Trial</Text>
              <Text className="text-teal-600">
                Try all features risk-free for 60 days
              </Text>
            </View>
          </View>
        )}

        {/* Features List */}
        <View className="bg-white rounded-xl p-6 mb-6 shadow-sm">
          <Text className="text-lg font-bold text-teal-800 mb-4">
            What's Included
          </Text>

          <View className="flex-row items-start mb-3">
            <Ionicons
              name="checkmark-circle"
              size={20}
              color="#0d9488"
              className="mr-3 mt-1"
            />
            <Text className="flex-1 text-teal-800">
              Add unlimited businesses to your profile
            </Text>
          </View>

          <View className="flex-row items-start mb-3">
            <Ionicons
              name="checkmark-circle"
              size={20}
              color="#0d9488"
              className="mr-3 mt-1"
            />
            <Text className="flex-1 text-teal-800">
              Manage business information, hours, and services
            </Text>
          </View>

          <View className="flex-row items-start mb-3">
            <Ionicons
              name="checkmark-circle"
              size={20}
              color="#0d9488"
              className="mr-3 mt-1"
            />
            <Text className="flex-1 text-teal-800">
              Get featured in business listings
            </Text>
          </View>

          <View className="flex-row items-start">
            <Ionicons
              name="checkmark-circle"
              size={20}
              color="#0d9488"
              className="mr-3 mt-1"
            />
            <Text className="flex-1 text-teal-800">
              Priority customer support
            </Text>
          </View>
        </View>

        {/* Subscription Terms */}
        <View className="mb-8">
          <Text className="text-gray-500 text-xs text-center">
            {isTrialing
              ? " Your subscription will automatically renew at the end of the free trial period unless canceled. Cancel anytime before the trial ends to avoid charges."
              : "Your subscription will automatically renew at the end of the billing period unless canceled."}
          </Text>
        </View>

        {/* Subscribe Button */}
        <Button
          mode="contained"
          onPress={handleSubscribe}
          buttonColor="#0d9488"
          contentStyle={{ paddingVertical: 12 }}
          labelStyle={{ fontSize: 16 }}
        >
          {buttonText}
        </Button>

        {/* Additional Links */}
        {/* <View className="flex-row justify-center space-x-4">
          <TouchableOpacity>
            <Text className="text-teal-600">Terms of Service</Text>
          </TouchableOpacity>
          <Text className="text-gray-400">•</Text>
          <TouchableOpacity>
            <Text className="text-teal-600">Privacy Policy</Text>
          </TouchableOpacity>
        </View> */}
      </ScrollView>
    </Gradient>
  );
};

export default PaymentPlan;
