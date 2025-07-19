import React from "react";
import { Modal, TouchableOpacity, View, Text } from "react-native";
import { Button } from "react-native-paper";
import { router } from "expo-router";

type AuthModalProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  signInText?: string;
  signUpText?: string;
  closeText?: string;
};

const AuthModal = ({
  visible,
  onClose,
  title = "Authentication Required",
  description = "You need to sign in or create an account to access this feature.",
  signInText = "Sign In",
  signUpText = "Sign Up",
  closeText = "Not Now",
}: AuthModalProps) => {
  const handleSignIn = () => {
    onClose();
    router.push("/authentication/auth");
  };

  const handleSignUp = () => {
    onClose();
    router.push("/authentication/auth?id=signup");
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50 p-4">
        <View className="bg-white rounded-2xl p-6 w-full max-w-md shadow-sm shadow-neutral-200">
          {/* Header */}
          <View className="items-center mb-4">
            <Text className="text-2xl font-bold text-teal-700 mb-1">
              {title}
            </Text>
            <View className="w-12 h-1 bg-teal-500 rounded-full" />
          </View>

          {/* Description */}
          <Text className="text-gray-700 text-center mb-6 px-2">
            {description}
          </Text>

          <View className="gap-4">
            {/* Sign In Button */}
            <Button
              onPress={handleSignIn}
              mode="outlined"
              textColor="teal"
              compact
              style={{ borderColor: "teal", borderWidth: 1, borderRadius: 15 }}
            >
              {signInText}
            </Button>

            {/* Sign Up Button */}
            <Button
              onPress={handleSignUp}
              mode="contained"
              buttonColor="teal"
              textColor="white"
              style={{ borderRadius: 15 }}
              compact
            >
              {signUpText}
            </Button>
          </View>

          {/* Close Button */}
          <TouchableOpacity
            onPress={onClose}
            className="mt-4 py-2 rounded-lg items-center"
            activeOpacity={0.8}
          >
            <Text className="text-gray-500 font-medium">{closeText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default AuthModal;
