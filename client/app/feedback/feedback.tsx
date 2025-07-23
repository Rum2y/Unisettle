import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Modal,
  Linking,
} from "react-native";
import Gradient from "@/components/gradient";
import { Button } from "react-native-paper";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { DATABASEID, databases, FEEDBACKCOLLECTIONID } from "@/lib/appwrite";
import { ID } from "react-native-appwrite";
import { router } from "expo-router";

const FeedbackPage = () => {
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSubmit = async () => {
    if (!feedback.trim()) {
      Alert.alert("Error", "Please enter your feedback before submitting.");
      return;
    }

    try {
      setIsSubmitting(true);
      await databases.createDocument(
        DATABASEID,
        FEEDBACKCOLLECTIONID,
        ID.unique(),
        {
          feedback: feedback,
        }
      );
      setShowSuccessModal(true);
    } catch (error) {
      Alert.alert("Error", "Failed to submit feedback.");
      console.error("Feedback submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    setFeedback("");
    router.push("/"); // Navigate to home screen
  };

  return (
    <Gradient styleContainer={{ padding: 20 }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <View className="mb-6">
          <Text className="text-gray-600">
            We'd love to hear your thoughts, suggestions, or concerns.
          </Text>
        </View>

        {/* Feedback Form */}
        <View className="bg-white rounded-xl p-6 mb-6 shadow-sm">
          <Text className="text-teal-800 font-medium mb-2">Your Feedback</Text>
          <TextInput
            className="bg-teal-50 rounded-lg p-4 h-48 text-teal-800 border border-teal-100 mb-4"
            multiline
            placeholder="Type your feedback here..."
            placeholderTextColor="#9ca3af"
            value={feedback}
            onChangeText={setFeedback}
            textAlignVertical="top"
          />

          <Text className="text-gray-500 text-sm mb-6">
            Please be as detailed as possible. Your feedback helps us improve
            the app.
          </Text>

          <Button
            mode="contained"
            onPress={handleSubmit}
            buttonColor="#0d9488"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </Button>
        </View>

        {/* Additional Options */}
        <View className="bg-white rounded-xl p-6 shadow-sm">
          <Text className="text-teal-800 font-medium mb-4">
            Other Ways to Provide Feedback
          </Text>

          <TouchableOpacity
            className="flex-row items-center py-3 border-b border-gray-100"
            onPress={() => {
              // Implement email feedback
              Alert.alert(
                "Email Feedback",
                "Would you like to send feedback via email?",
                [
                  {
                    text: "Cancel",
                    style: "cancel",
                  },
                  {
                    text: "Send Email",
                    onPress: () => {
                      Linking.openURL("mailto:iyinade64@gmail.com");
                    },
                  },
                ]
              );
            }}
          >
            <View className="bg-teal-100 p-2 rounded-lg mr-4">
              <Ionicons name="mail" size={20} color="#0d9488" />
            </View>
            <Text className="flex-1 text-teal-800">Email Us</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleSuccessModalClose}
      >
        <View className="flex-1 justify-center items-center bg-black/50 p-6">
          <View className="bg-white rounded-xl p-6 w-full max-w-md">
            <View className="items-center mb-4">
              <View className="bg-teal-100 p-4 rounded-full">
                <Ionicons name="checkmark-circle" size={48} color="#0d9488" />
              </View>
            </View>

            <Text className="text-2xl font-bold text-teal-800 text-center mb-2">
              Thank You!
            </Text>
            <Text className="text-gray-600 text-center mb-6">
              Your feedback has been submitted successfully.
            </Text>

            <Button
              mode="contained"
              onPress={handleSuccessModalClose}
              buttonColor="#0d9488"
              contentStyle={{ paddingVertical: 8 }}
            >
              Return Home
            </Button>
          </View>
        </View>
      </Modal>
    </Gradient>
  );
};

export default FeedbackPage;
