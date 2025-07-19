import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Modal,
} from "react-native";
import React, { useState } from "react";
import { Button } from "react-native-paper";
import { useRouter } from "expo-router";
import Gradient from "@/components/gradient";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/auth-context";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const router = useRouter();
  // const { sendPasswordResetEmail } = useAuth();

  const handleSubmit = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    try {
      setIsSubmitting(true);
      // await sendPasswordResetEmail(email);
      setShowSuccessModal(true);
    } catch (error) {
      Alert.alert(
        "Error",
        "Failed to send password reset email. Please try again."
      );
      console.error("Password recovery error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    router.replace("/authentication/auth");
  };

  return (
    <Gradient styleContainer={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          className="flex-1 px-5"
        >
          {/* Header */}
          <View className="mb-8">
            <Text className="text-[#005965] text-3xl font-bold mb-2">
              Reset Password
            </Text>
            <Text className="text-teal-700">
              Enter your email to receive a password reset link
            </Text>
          </View>

          {/* Form */}
          <View className="bg-white p-6 rounded-xl mb-6 shadow">
            <Text className="text-teal-700 font-medium mb-4">
              Email Address
            </Text>

            <TextInput
              className="bg-teal-50 border border-teal-100 text-teal-700 p-4 rounded-lg mb-6"
              placeholder="Enter your email"
              placeholderTextColor="#9ca3af"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={isSubmitting}
              disabled={isSubmitting}
              className="rounded-lg bg-teal-700"
              buttonColor="#0d9488"
              labelStyle={{ fontSize: 16, paddingVertical: 6 }}
            >
              {isSubmitting ? "Sending..." : "Send Reset Link"}
            </Button>
          </View>

          {/* Footer */}
          <View className="flex-row justify-center">
            <Text className="text-gray-300 mr-1">Remember your password?</Text>
            <TouchableOpacity
              onPress={() => router.replace("/authentication/auth")}
            >
              <Text className="text-teal-700 font-medium">Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={handleSuccessModalClose}
      >
        <View className="flex-1 justify-center items-center bg-black/50 px-6">
          <View className="bg-white rounded-xl p-6 w-full max-w-md">
            <View className="items-center mb-4">
              <View className="bg-teal-100 p-4 rounded-full">
                <Ionicons name="checkmark-circle" size={48} color="#0d9488" />
              </View>
            </View>

            <Text className="text-2xl font-bold text-teal-700 text-center mb-2">
              Email Sent!
            </Text>
            <Text className="text-gray-600 text-center mb-6">
              We've sent password reset instructions to your email address.
            </Text>

            <Button
              mode="contained"
              onPress={handleSuccessModalClose}
              className="rounded-lg bg-teal-700"
              labelStyle={{ paddingVertical: 6 }}
            >
              Return to Sign In
            </Button>
          </View>
        </View>
      </Modal>
    </Gradient>
  );
};

export default ForgotPassword;
