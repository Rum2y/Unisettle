import { View, Text, Alert, ActivityIndicator } from "react-native";
import { Button } from "react-native-paper";
import { useState, useEffect } from "react";
import { functions } from "@/lib/appwrite";
import { useStripe, CardField } from "@stripe/stripe-react-native";
import { useAuth } from "../context/auth-context";
import { router } from "expo-router";
import Gradient from "@/components/gradient";

type PaymentMethod = {
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
};

const UpdatePaymentMethod = () => {
  const [loading, setLoading] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [fetchCardDetails, setFetchCardDetails] = useState<boolean>(true);
  const [currentPaymentMethod, setCurrentPaymentMethod] =
    useState<PaymentMethod | null>(null);
  const { confirmSetupIntent } = useStripe();

  const { user } = useAuth();

  useEffect(() => {
    // Fetch current payment method details
    const fetchCurrentPaymentMethod = async () => {
      if (!user) return;

      try {
        setFetchCardDetails(true);
        const response = await functions.createExecution(
          process.env.EXPO_PUBLIC_APPWRITE_FUNCTION_ID!,
          JSON.stringify({
            email: user?.email,
          }),
          false,
          "/getDefaultPayment"
        );

        const result = JSON.parse(response.responseBody || "{}");
        const cardDetails = {
          brand: result.defaultPaymentMethod?.card.brand,
          last4: result.defaultPaymentMethod?.card.last4,
          exp_month: result.defaultPaymentMethod?.card.exp_month,
          exp_year: result.defaultPaymentMethod?.card.exp_year,
        };
        setCurrentPaymentMethod(cardDetails);
      } catch (error) {
        console.error("Error fetching current payment method:", error);
      } finally {
        setFetchCardDetails(false);
      }
    };

    fetchCurrentPaymentMethod();
  }, [user]);

  // Function to handle payment method change
  const handlePaymentMethodChange = async () => {
    if (!user) return;
    if (!cardComplete) {
      Alert.alert("Error", "Please enter a valid card.");
      return;
    }

    try {
      setLoading(true);

      const response = await functions.createExecution(
        process.env.EXPO_PUBLIC_APPWRITE_FUNCTION_ID!,
        JSON.stringify({
          userId: user?.$id,
          email: user?.email,
          name: user?.name,
        }),
        false,
        "/createSetupIntent"
      );

      const setupResponse = JSON.parse(response.responseBody || "{}");
      const { clientSecret, error, customerId } = setupResponse;

      if (error || !clientSecret) {
        Alert.alert("Error", error || "Failed to create SetupIntent");
        return;
      }

      const { setupIntent, error: confirmError } = await confirmSetupIntent(
        clientSecret,
        {
          paymentMethodType: "Card",
          paymentMethodData: {
            billingDetails: {
              email: user.email,
              name: user.name,
            },
          },
        }
      );

      if (confirmError || setupIntent?.status !== "Succeeded") {
        Alert.alert(
          "Error",
          confirmError?.message || "Failed to confirm SetupIntent"
        );
        return;
      }

      const paymentMethodId = setupIntent.paymentMethod;

      await functions.createExecution(
        process.env.EXPO_PUBLIC_APPWRITE_FUNCTION_ID!,
        JSON.stringify({
          customerId,
          paymentMethodId: paymentMethodId?.id,
          use: "updatePaymentMethod",
        }),
        false,
        "/createSubscription"
      );

      Alert.alert("Success", "Payment method updated and set as default!");
      router.replace("/manageSubscriptions/manageSubscriptions");
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
    <Gradient styleContainer={{ flex: 1, padding: 20 }}>
      {fetchCardDetails ? (
        <ActivityIndicator size="large" color="teal" />
      ) : (
        <View className="bg-white rounded-xl p-6 shadow-sm">
          <Text className="text-2xl font-bold text-teal-800 mb-6 text-center">
            Your Card Details
          </Text>

          {currentPaymentMethod && currentPaymentMethod.brand ? (
            <View className="bg-teal-50 rounded-lg p-4 mb-6 border border-teal-100">
              <Text className="text-base font-semibold text-teal-800 mb-2">
                Current Card:
              </Text>
              <View className="ml-2">
                <Text className="text-sm text-teal-900 mb-1">
                  {currentPaymentMethod.brand.toUpperCase()} ••••{" "}
                  {currentPaymentMethod.last4}
                </Text>
                <Text className="text-sm text-teal-900">
                  Exp: {currentPaymentMethod.exp_month}/
                  {currentPaymentMethod.exp_year}
                </Text>
              </View>
            </View>
          ) : (
            <Text className="text-gray-500 mb-6 text-center">
              No payment method found. Please add a new card.
            </Text>
          )}

          <Text className="text-base font-semibold text-teal-800 mb-3">
            {currentPaymentMethod ? "New Card Details:" : "Card Details:"}
          </Text>

          <CardField
            postalCodeEnabled={false}
            placeholders={{
              number: "4242 4242 4242 4242",
              expiration: "MM/YY",
              cvc: "CVC",
              postalCode: "Postal Code",
            }}
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
            onCardChange={(cardDetails) =>
              setCardComplete(cardDetails.complete)
            }
          />

          <Button
            mode="contained"
            onPress={handlePaymentMethodChange}
            disabled={loading || !cardComplete}
            loading={loading}
            className="rounded-lg py-2"
            labelStyle={{ fontSize: 16, fontWeight: "600", color: "white" }}
            buttonColor="#0d9488"
          >
            {loading ? "Processing..." : "Update Payment Method"}
          </Button>
        </View>
      )}
    </Gradient>
  );
};

export default UpdatePaymentMethod;
