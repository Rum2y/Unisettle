import Gradient from "@/components/gradient";
import { account } from "@/lib/appwrite";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Button } from "react-native-paper";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const router = useRouter();

  // Handle form submission
  const handleSubmit = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }
    try {
      setIsSubmitting(true);
      await account.createRecovery(
        email,
        "https://forgotpassword-beta.vercel.app/"
      );
      setShowSuccessModal(true);
    } catch (error) {
      Alert.alert(
        "Error",
        "Failed to send password reset email. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Close modal and navigate to sign in
  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    router.replace("/authentication/auth");
  };

  return (
    <Gradient styleContainer={{ flex: 1 }}>
      <SafeAreaView className="flex-1">
        {/* Added SafeAreaView */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ flexGrow: 1, marginTop: 20 }}
            className="flex-1 px-5"
          >
            {/* Header */}
            <View className="mb-8">
              <Text className="text-[#005965] text-3xl font-bold mb-2 text-center">
                Reset Password
              </Text>
              <Text className="text-teal-700 text-center">
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
                className="rounded-lg"
                buttonColor="#0d9488"
                labelStyle={{ fontSize: 16, paddingVertical: 6 }}
              >
                {isSubmitting ? "Sending..." : "Send Reset Link"}
              </Button>
            </View>

            {/* Footer */}
            <View className="flex-row justify-center">
              <Text className="text-gray-700 mr-1">
                Remember your password?
              </Text>
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
                buttonColor="#0d9488"
                className="rounded-lg "
                labelStyle={{ paddingVertical: 6 }}
              >
                Return to Sign In
              </Button>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </Gradient>
  );
};

export default ForgotPassword;
