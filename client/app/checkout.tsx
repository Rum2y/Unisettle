import { View, Text, Alert, ScrollView } from "react-native";
import { Button } from "react-native-paper";
import { CardField, useStripe } from "@stripe/stripe-react-native";
import { useAuth } from "./context/auth-context";
import { useState, useEffect } from "react";
import { functions } from "@/lib/appwrite";
import Gradient from "@/components/gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const Checkout = () => {
  const { user, isSubscribed, proUser, setIsSubscribed } = useAuth();
  const [cardDetails, setCardDetails] = useState<any>(null);
  const { confirmPayment, createPaymentMethod, confirmSetupIntent } =
    useStripe();
  const [loading, setLoading] = useState(false);
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

  const handlePayment = async () => {
    if (!user) {
      Alert.alert("Error", "You must be logged in to subscribe.");
      return;
    }
    if (!cardDetails?.complete) {
      Alert.alert("Error", "Please complete your card details.");
      return;
    }

    try {
      setLoading(true);

      // 1. Create a PaymentMethod
      const { paymentMethod, error: createMethodError } =
        await createPaymentMethod({
          paymentMethodType: "Card",
          paymentMethodData: {
            billingDetails: {
              email: user?.email || "",
              name: user?.name || "Guest User",
            },
          },
        });

      if (createMethodError || !paymentMethod?.id) {
        Alert.alert(
          "Error",
          createMethodError?.message || "Failed to create payment method"
        );
        return;
      }

      // 2. Create a SetupIntent to save the payment method for future use
      const setupIntent = await functions.createExecution(
        "687d42c500256eda27f8",
        JSON.stringify({
          userId: user?.$id,
          email: user?.email,
          paymentMethodId: paymentMethod.id,
          name: user?.name || "Guest User",
        }),
        false,
        "/createSetupIntent"
      );

      // Check if the SetupIntent was created successfully
      const setupResponse = JSON.parse(setupIntent.responseBody || "{}");
      const {
        clientSecret: setupClientSecret,
        error: setupError,
        customerId,
      } = setupResponse;

      if (setupError || !setupClientSecret) {
        Alert.alert("Error", setupError || "Failed to create SetupIntent");
        return;
      }

      // 3. Confirm the SetupIntent to finalize saving the payment method
      const { setupIntent: confirmedSetupIntent, error: confirmError } =
        await confirmSetupIntent(setupClientSecret, {
          paymentMethodType: "Card",
        });

      if (confirmError) {
        Alert.alert("Error", confirmError.message);
        return;
      }

      if (confirmedSetupIntent?.status !== "Succeeded") {
        Alert.alert("Error", "Failed to confirm SetupIntent");
        return;
      }

      // 4. Call Appwrite Function to handle subscription logic
      const response = await functions.createExecution(
        "687d42c500256eda27f8",
        JSON.stringify({
          trial: 60,
          customerId,
          paymentMethodId: paymentMethod.id,
        }),
        false,
        "/createSubscription"
      );

      // 5. Parse the response body from Appwrite function
      const parsed = JSON.parse(response.responseBody || "{}");
      const { clientSecret, error: backendError, message } = parsed;

      if (backendError) {
        Alert.alert("Error", backendError || "Failed to create subscription");
        console.error("Backend error:", backendError);
        return;
      }

      // 6. Confirm the payment with Stripe
      if (clientSecret) {
        // Proceed to confirm payment
        const { error, paymentIntent } = await confirmPayment(clientSecret);

        if (error) {
          Alert.alert("Payment Error", error.message);
        } else if (paymentIntent) {
          Alert.alert("Success", "Subscription created!");
        }
      } else {
        // No immediate payment needed (free trial)
        Alert.alert(
          "Success",
          message || "Trial started – no payment required yet."
        );
      }

      // Navigate to a success page or update UI
      setIsSubscribed(true); // Update subscription status
      router.replace("/businesses/addBusiness");
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Unknown error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Gradient styleContainer={{ padding: 20 }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Back button */}

        {/* Header */}
        <View className="items-center mb-8">
          <View className="w-20 h-20 bg-teal-100 rounded-full items-center justify-center mb-4 border-4 border-teal-200">
            <Ionicons name="card" size={32} color="#0d9488" />
          </View>
          <Text className="text-2xl font-bold text-teal-800">
            Payment Details
          </Text>
          <Text className="text-gray-600 mt-2 text-center">
            Secure payment processing powered by Stripe
          </Text>
        </View>

        {/* Order Summary */}
        <View className="bg-white rounded-xl p-6 mb-6 shadow-sm">
          <Text className="text-lg font-bold text-teal-800 mb-4">
            Order Summary
          </Text>

          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600">Plan:</Text>
            <Text className="font-medium text-teal-800">
              Business Creator (Monthly)
            </Text>
          </View>

          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600">Price:</Text>
            <Text className="font-medium text-teal-800">$14.99/month</Text>
          </View>

          {isTrialing && (
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600">Trial Period:</Text>
              <Text className="font-medium text-teal-800">60 days free</Text>
            </View>
          )}

          <View className="border-t border-gray-200 my-3"></View>

          <View className="flex-row justify-between">
            <Text className="text-gray-600">Today's Charge:</Text>
            <Text className="font-bold text-teal-800">$0.00</Text>
          </View>
        </View>

        {/* Payment Form */}
        <View className="bg-white rounded-xl p-6 mb-6 shadow-sm">
          <Text className="text-lg font-bold text-teal-800 mb-4">
            Payment Method
          </Text>

          <CardField
            postalCodeEnabled={true}
            placeholders={{
              number: "4242 4242 4242 4242",
              expiration: "MM/YY",
              cvc: "CVC",
              postalCode: "Postal Code",
            }}
            onCardChange={setCardDetails}
            cardStyle={{
              backgroundColor: "#FFFFFF",
              textColor: "#0d9488",
              borderColor: "#0d9488",
              borderWidth: 1,
              borderRadius: 8,
              fontSize: 16,
              placeholderColor: "#9ca3af",
            }}
            style={{
              width: "100%",
              height: 50,
              marginVertical: 10,
            }}
          />

          <Text className="text-xs text-gray-500 mt-2">
            Your card will be saved for future payments after the trial period.
          </Text>
        </View>

        {/* Security Info */}
        <View className="flex-row items-center mb-8">
          <Ionicons
            name="lock-closed"
            size={20}
            color="#0d9488"
            className="mr-2"
          />
          <Text className="text-xs text-gray-500">
            Payments are secure and encrypted. We never store your card details.
          </Text>
        </View>

        {/* Subscribe Button */}
        <Button
          mode="contained"
          onPress={handlePayment}
          loading={loading}
          disabled={loading || !cardDetails?.complete}
          buttonColor="#0d9488"
          contentStyle={{ paddingVertical: 12 }}
          labelStyle={{ fontSize: 16, fontWeight: "600" }}
        >
          {loading ? "Processing..." : buttonText}
        </Button>

        {/* Terms */}
        <Text className="text-xs text-gray-500 text-center mb-4">
          By subscribing, you agree to our Terms of Service and Privacy Policy.
          {isTrialing && (
            <Text>
              Your subscription will automatically renew after the trial period
              at $14.99/month unless canceled.
            </Text>
          )}
        </Text>
      </ScrollView>
    </Gradient>
  );
};

export default Checkout;
