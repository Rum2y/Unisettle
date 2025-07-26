import { View, Text, ScrollView, Alert } from "react-native";
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
  const [cancelSubscription, setCancelSubscription] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [nextBillingDate, setNextBillingDate] = useState<string>("");
  const [showPaymentMethod, setShowPaymentMethod] = useState<string>("");
  const [customerId, setCustomerId] = useState<string>("");
  const [isReactivating, setIsReactivating] = useState<boolean>(false);

  useEffect(() => {
    if (!user) return;
    if (isBusinessSubscribed) setBusinessPlan(true);

    // Fetch default payment method details
    const fetchCardDetails = async () => {
      try {
        const responseCard = await functions.createExecution(
          process.env.EXPO_PUBLIC_APPWRITE_FUNCTION_ID!,
          JSON.stringify({
            email: user?.email,
          }),
          false,
          "/getDefaultPayment"
        );

        const result = JSON.parse(responseCard.responseBody || "{}");
        const cardDetails = {
          last4: result.defaultPaymentMethod?.card.last4,
        };
        setShowPaymentMethod(cardDetails.last4 || "");
      } catch (error) {
        setShowPaymentMethod("");
      }
    };
    fetchCardDetails();

    const fetchSubscription = async () => {
      try {
        const response = await databases.listDocuments(
          DATABASEID,
          BUSINESS_SUBSCRIPTIONS_COLLECTION_ID,
          [Query.equal("userId", user.$id)]
        );

        if (response.documents.length > 0) {
          const subscription = response.documents[0];
          setCustomerId(subscription.customerId || "");
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

  const plan = {
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
  };

  const getPlanDetails = () => {
    return [
      {
        header: "Plan",
        value: "Business Plan",
      },
      { header: "Billing", value: "Monthly" },
      {
        header: "Next Billing Date",
        value: businessPlan
          ? cancelSubscription
            ? "Cancelled"
            : nextBillingDate || "Loading..."
          : "Not subscribed",
      },
      { header: "Payment Method", value: `•••• ${showPaymentMethod}` },
    ];
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

  //Reactivate subscription if user is subscribed and has cancelled
  const reactivateSubscription = async () => {
    if (!user || !isBusinessSubscribed) return;
    if (isBusinessSubscribed && cancelSubscription) {
      try {
        setIsReactivating(true);
        await functions.createExecution(
          process.env.EXPO_PUBLIC_APPWRITE_FUNCTION_ID!,
          JSON.stringify({
            customerId: customerId,
          }),
          false,
          "/updateSubscription"
        );
        setCancelSubscription(false);
        Alert.alert(
          "Subscription Reactivated",
          "Your subscription has been reactivated. Enjoy your premium features!"
        );
      } catch (error) {
        console.error("Error reactivating subscription:", error);
      } finally {
        setIsReactivating(false);
      }
    }
  };

  return (
    <Gradient styleContainer={{ padding: 20 }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="items-center mb-2">
          <View className="w-20 h-20 bg-teal-100 rounded-full items-center justify-center mb-4 border-4 border-teal-200">
            <MaterialCommunityIcons name="crown" size={32} color="#0d9488" />
          </View>
        </View>

        {/* Plan Card */}
        <View className="w-full p-6 rounded-2xl mb-8 bg-white border border-teal-200 shadow-sm">
          {/* Plan Header */}
          <View className="flex-row items-center mb-4">
            <View className="bg-teal-50 p-3 rounded-xl mr-4 shadow-sm">
              <Ionicons name={plan.icon} size={24} color="#0d9488" />
            </View>
            <View>
              <Text className="text-xl font-bold text-teal-900">
                {plan.name}
              </Text>
              <Text className="text-3xl font-extrabold text-teal-800 mt-1">
                {plan.price}
                <Text className="text-base font-medium text-gray-500">
                  /{plan.period}
                </Text>
              </Text>
            </View>
          </View>

          {/* Divider */}
          <View className="h-px bg-gray-100 my-4" />

          {/* Features List */}
          <View className="mb-5">
            <Text className="text-sm font-medium text-gray-500 mb-3">
              FEATURES
            </Text>
            {plan.features.map((feature, index) => (
              <View key={index} className="flex-row items-center mb-3">
                <View className="bg-teal-100 p-1 rounded-full mr-3">
                  <Ionicons name="checkmark" size={14} color="#0d9488" />
                </View>
                <Text className="text-sm font-medium text-teal-900">
                  {feature}
                </Text>
              </View>
            ))}
          </View>

          {/* Subscription Badge */}
          {plan.currentPlan && (
            <View className="flex-row justify-between items-center bg-teal-50 rounded-lg px-4 py-3 border border-teal-100">
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={18} color="#0d9488" />
                <Text className="text-sm font-medium text-teal-800 ml-2">
                  Active Subscription
                </Text>
              </View>
              <Text
                className={`text-xs font-medium  ${
                  cancelSubscription
                    ? "bg-red-400 text-white"
                    : "bg-teal-100 text-teal-600"
                } rounded-full px-2 py-1`}
              >
                {cancelSubscription ? "Cancelled" : "Auto-renewing"}
              </Text>
            </View>
          )}
        </View>

        {/* Current Plan Details */}
        <View className="bg-white rounded-xl p-6 mb-6 shadow-sm">
          <Text className="text-lg font-bold text-teal-800 mb-4">
            Subscription Details
          </Text>

          {getPlanDetails().map((detail) => (
            <View key={detail.header} className="flex-row justify-between mb-3">
              <Text className="text-gray-600">{detail.header}</Text>
              <Text className="text-teal-800 font-medium">{detail.value}</Text>
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View className="space-y-3">
          <Button
            mode="outlined"
            onPress={() =>
              router.push("/manageSubscriptions/updatePaymentMethod")
            }
            textColor="#0d9488"
            style={{ borderColor: "#0d9488", marginBottom: 10 }}
          >
            Update Payment Method
          </Button>

          {businessPlan && !cancelSubscription ? (
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
              mode="contained"
              onPress={
                cancelSubscription ? reactivateSubscription : handleSubscribe
              }
              buttonColor="#0d9488"
              style={{ borderColor: "#0d9488" }}
            >
              {cancelSubscription
                ? `${
                    isReactivating
                      ? "Reactivating..."
                      : "Reactivate Subscription"
                  }`
                : "Subscribe"}
            </Button>
          )}
        </View>
      </ScrollView>
    </Gradient>
  );
};

export default ManageSubscriptions;
