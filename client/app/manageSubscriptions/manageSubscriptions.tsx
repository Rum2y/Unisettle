import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { router } from "expo-router";
import { useAuth } from "../context/auth-context";
import { Ionicons } from "@expo/vector-icons";
import Gradient from "@/components/gradient";
import { Button } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import {
  BUSINESS_SUBSCRIPTIONS_COLLECTION_ID,
  DATABASEID,
  databases,
  functions,
} from "@/lib/appwrite";
import { Query } from "react-native-appwrite";

const ManageSubscriptions = () => {
  const { user, isBusinessSubscribed } = useAuth();
  const [businessPlan, setBusinessPlan] = useState<boolean>(false);
  const [premiumPlan, setPremiumPlan] = useState<boolean>(false);
  const [cancelSubscription, setCancelSubscription] = useState<boolean>(false);
  const [sub, setSub] = useState<boolean[]>([true, false]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [nextBillingDate, setNextBillingDate] = useState<string>("");
  const [selectedPlanId, setSelectedPlanId] = useState<string>("business");

  useEffect(() => {
    if (!user) return;
    if (isBusinessSubscribed) setBusinessPlan(true);

    const fetchSubscription = async () => {
      try {
        const response = await databases.listDocuments(
          DATABASEID,
          BUSINESS_SUBSCRIPTIONS_COLLECTION_ID,
          [Query.equal("userId", user.$id)]
        );

        if (response.documents.length > 0) {
          const subscription = response.documents[0];
          if (subscription.nextBillingDate) {
            const date = new Date(subscription.nextBillingDate);
            setNextBillingDate(
              date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            );
          }

          if (
            (subscription.status === "active" ||
              subscription.status === "trialing") &&
            subscription.cancellationRequested === true
          ) {
            setCancelSubscription(true);
          } else if (
            subscription.status === "active" ||
            subscription.status === "trialing"
          ) {
            setBusinessPlan(true);
          }
        }
      } catch (error) {
        console.error("Error fetching subscription:", error);
        Alert.alert("Error", "Failed to fetch subscription details.");
      }
    };
    fetchSubscription();
  }, [isBusinessSubscribed]);

  const plans = [
    {
      id: "business",
      name: "Business Plan",
      icon: "business" as React.ComponentProps<typeof Ionicons>["name"],
      price: "$9.99",
      period: "month",
      features: [
        "Manage your businesses",
        "Business analytics",
        "Priority support",
      ],
      currentPlan: businessPlan,
    },
    {
      id: "premium",
      name: "Premium Plan",
      icon: "rocket" as React.ComponentProps<typeof Ionicons>["name"],
      price: "$4.99",
      period: "lifetime",
      features: ["Ad Free Experience", "AI feature (coming soon)"],
      currentPlan: premiumPlan,
    },
  ];

  const getPlanDetails = (planId: string) => {
    const isSubscribed = planId === "business" ? businessPlan : premiumPlan;
    const isCancelled = planId === "business" ? cancelSubscription : false;

    return [
      {
        header: "Plan",
        value: `${planId === "business" ? "Business" : "Premium"} Plan`,
      },
      { header: "Billing", value: "Monthly" },
      {
        header: "Next Billing Date",
        value: isSubscribed
          ? isCancelled
            ? "Cancelled"
            : nextBillingDate || "Loading..."
          : "Not subscribed",
      },
      { header: "Payment Method", value: "•••• 4242" },
    ];
  };

  // Handle plan selection
  const handlePlanPress = (index: number) => {
    setSub(new Array(plans.length).fill(false));
    setSub((prev) => {
      const newSub = [...prev];
      newSub[index] = true;
      return newSub;
    });
    setSelectedPlanId(plans[index].id);
  };

  // Handle subscription action
  const handleSubscribe = () => {
    router.replace("/paymentPlans/paymentplan");
  };

  // Handle cancel subscription
  const handleCancelSubscription = async () => {
    try {
      setIsLoading(true);
      if (!user) return;
      const findSubscription = await databases.listDocuments(
        DATABASEID,
        BUSINESS_SUBSCRIPTIONS_COLLECTION_ID,
        [Query.equal("userId", user?.$id)]
      );

      if (findSubscription.documents.length === 0) {
        Alert.alert("No active subscription found.");
        return;
      }
      const response = await functions.createExecution(
        process.env.EXPO_PUBLIC_APPWRITE_FUNCTION_ID!,
        JSON.stringify({
          subscriptionId: findSubscription.documents[0].subscriptionId,
          docId: findSubscription.documents[0].$id,
        }),
        false,
        "/cancelSubscription"
      );

      const result = JSON.parse(response.responseBody);
      const { error } = result;

      if (error) {
        Alert.alert("Error", error);
        return;
      }
      Alert.alert(
        "Success",
        "Your subscription has been canceled. You will lose access to premium features at the end of your billing period."
      );
      setCancelSubscription(true);
    } catch (error) {
      console.error("Error canceling subscription:", error);
      Alert.alert("Error", "Failed to cancel subscription. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Check if the selected plan is subscribed
  const isPlanSubscribed = () => {
    return selectedPlanId === "business" ? businessPlan : premiumPlan;
  };

  return (
    <Gradient styleContainer={{ padding: 20 }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="items-center mb-8">
          <View className="w-20 h-20 bg-teal-100 rounded-full items-center justify-center mb-4 border-4 border-teal-200">
            <MaterialCommunityIcons name="crown" size={32} color="#0d9488" />
          </View>
          <Text className="text-2xl font-bold text-teal-800">
            Manage Subscription
          </Text>
        </View>

        {/* Plans Grid */}
        <View className="flex-row flex-wrap justify-between mb-6">
          {plans.map((plan, index) => (
            <TouchableOpacity
              key={plan.id}
              className={`w-[49%] p-2 rounded-xl mb-4 ${
                sub[index]
                  ? "border-2 border-teal-500 bg-teal-50"
                  : "bg-white border-2 border-gray-200"
              }`}
              onPress={() => handlePlanPress(index)}
            >
              <View className="flex-row items-center mb-3">
                <View className="bg-teal-100 p-2 rounded-lg mr-3">
                  <Ionicons name={plan.icon} size={20} color="#0d9488" />
                </View>
                <Text className="font-bold text-teal-800">{plan.name}</Text>
              </View>

              <Text className="text-2xl font-bold text-teal-800 mb-1">
                {plan.price}
                <Text className="text-base font-normal text-gray-600">
                  /{plan.period}
                </Text>
              </Text>

              <View className="mt-3">
                {plan.features.map((feature, index) => (
                  <View key={index} className="flex-row items-start mb-2">
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color="#0d9488"
                      style={{ marginTop: 2, marginRight: 6 }}
                    />
                    <Text className="text-xs text-teal-800">{feature}</Text>
                  </View>
                ))}
              </View>

              {plan.currentPlan && (
                <View className="mt-3 bg-teal-500 rounded-full py-1 px-3 self-start">
                  <Text className="text-xs text-white">Subscribed</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Current Plan Details */}
        <View className="bg-white rounded-xl p-6 mb-6 shadow-sm">
          <Text className="text-lg font-bold text-teal-800 mb-4">
            Subscription Details
          </Text>

          {getPlanDetails(selectedPlanId).map((detail) => (
            <View key={detail.header} className="flex-row justify-between mb-3">
              <Text className="text-gray-600">{detail.header}</Text>
              <Text className="text-teal-800 font-medium">{detail.value}</Text>
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View className="space-y-3">
          <Button
            mode="contained"
            onPress={() =>
              router.push("/manageSubscriptions/updatePaymentMethod")
            }
            buttonColor="#0d9488"
            style={{ borderColor: "#0d9488", marginBottom: 10 }}
          >
            Update Payment Method
          </Button>

          {isPlanSubscribed() ? (
            <Button
              mode="text"
              onPress={() => {
                Alert.alert(
                  "Cancel Subscription",
                  "Are you sure you want to cancel? You'll lose access to premium features at the end of your billing period.",
                  [
                    { text: "Go Back", style: "cancel" },
                    {
                      text: "Cancel Subscription",
                      style: "destructive",
                      onPress: handleCancelSubscription,
                    },
                  ]
                );
              }}
              textColor="#ef4444"
            >
              {isLoading ? "Canceling..." : "Cancel Subscription"}
            </Button>
          ) : (
            <Button
              mode="outlined"
              onPress={handleSubscribe}
              textColor="#0d9488"
              style={{ borderColor: "#0d9488" }}
            >
              Subscribe
            </Button>
          )}
        </View>
      </ScrollView>
    </Gradient>
  );
};

export default ManageSubscriptions;
