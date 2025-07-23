import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  View,
} from "react-native";
import { Button, Text, TextInput, useTheme } from "react-native-paper";
import { useAuth } from "../context/auth-context";

const AuthScreen = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const params = useLocalSearchParams<{ id: string }>();
  const initialMode = params.id === "signup" ? "signup" : "signin";
  const theme = useTheme();
  const router = useRouter();

  const { signIn, signUp, resendVerification, unverifiedUser } = useAuth();

  useEffect(() => {
    setIsSignUp(initialMode === "signup");
  }, [initialMode]);

  const handleResendVerification = async () => {
    try {
      setIsResending(true);
      await resendVerification();
      Alert.alert("Success", "Verification email resent successfully!");
    } catch (err) {
      console.error(err);
      Alert.alert(
        "Error",
        "Failed to resend verification email. Please try again."
      );
    } finally {
      setIsResending(false);
    }
  };

  const handleAuth = async () => {
    if (!email || !password || (isSignUp && !confirmPassword)) {
      setError("Please fill in all fields");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setError(null);

    if (isSignUp) {
      try {
        await signUp(email, password, name);
        setIsSignUp(false);
        setEmail("");
        setName("");
        setPassword("");
        setConfirmPassword("");
        setShowSuccessModal(true);
      } catch (err: any) {
        if (err?.message?.includes("already exists")) {
          setError("An account with this email already exists.");
        } else {
          setError("Sign Up failed. Please try again.");
        }
      }
    } else {
      try {
        await signIn(email, password);
        if (!unverifiedUser) router.replace("/(tabs)");
        else
          setError(
            "Please verify your email before signing in. If you’ve already verified, please try again in a moment."
          );
      } catch (err: any) {
        if (err?.message?.includes("verify")) {
          setError("Please verify your email before signing in.");
        } else {
          setError("Sign In failed. Please check your credentials.");
        }
      }
    }
  };

  const handleSwitch = () => {
    setIsSignUp(!isSignUp);
    setError(null);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  const handleSkip = () => {
    router.replace("/(tabs)");
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView
        className="flex-1 px-6 pt-10"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
      >
        <View className="items-center mb-8">
          <Image
            source={require("../../assets/images/logo_1.png")}
            style={{ width: 240, height: 240, resizeMode: "contain" }}
          />
        </View>

        <Text
          className="text-3xl font-extrabold  mb-6 "
          style={{ textAlign: "center", fontWeight: "600", color: "#005965" }}
        >
          {isSignUp ? "Create Account" : "Welcome Back"}
        </Text>

        {isSignUp && (
          <TextInput
            label="Name"
            mode="outlined"
            value={name}
            style={{ marginBottom: 12 }}
            outlineColor="#0d9488"
            activeOutlineColor="#0d9488"
            theme={{
              roundness: 10,
              colors: { onSurfaceVariant: "rgba(0, 0, 0, 0.3)" },
            }}
            placeholder="Enter your name"
            placeholderTextColor="rgba(0, 0, 0, 0.3)"
            onChangeText={setName}
          />
        )}

        <TextInput
          label="Email"
          mode="outlined"
          value={email}
          style={{ marginBottom: 12 }}
          outlineColor="#0d9488"
          activeOutlineColor="#0d9488"
          placeholder="Enter your email"
          placeholderTextColor="rgba(0, 0, 0, 0.3)"
          keyboardType="email-address"
          theme={{
            roundness: 10,
            colors: { onSurfaceVariant: "rgba(0, 0, 0, 0.3)" },
          }}
          onChangeText={setEmail}
        />

        <TextInput
          label="Password"
          mode="outlined"
          value={password}
          style={{ marginBottom: isSignUp ? 12 : 0 }}
          outlineColor="#0d9488"
          activeOutlineColor="#0d9488"
          placeholder="Enter your password"
          placeholderTextColor="rgba(0, 0, 0, 0.3)"
          theme={{
            roundness: 10,
            colors: { onSurfaceVariant: "rgba(0, 0, 0, 0.3)" },
          }}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          right={
            <TextInput.Icon
              color="#0d9488"
              icon={showPassword ? "eye-off" : "eye"}
              onPress={() => setShowPassword(!showPassword)}
            />
          }
        />

        {isSignUp && (
          <TextInput
            label="Confirm Password"
            mode="outlined"
            value={confirmPassword}
            style={{ marginBottom: 20 }}
            outlineColor="#0d9488"
            activeOutlineColor="#0d9488"
            theme={{
              roundness: 10,
              colors: { onSurfaceVariant: "rgba(0, 0, 0, 0.3)" },
            }}
            placeholder="Confirm your password"
            placeholderTextColor="rgba(0, 0, 0, 0.3)"
            onChangeText={setConfirmPassword}
            secureTextEntry={!showPassword}
            right={
              <TextInput.Icon
                color="#0d9488"
                icon={showPassword ? "eye-off" : "eye"}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
          />
        )}

        {error && (
          <Text style={{ color: theme.colors.error, marginBottom: 10 }}>
            {error}
          </Text>
        )}
        {!isSignUp && (
          <View>
            <Button
              mode="text"
              textColor="#0d9488"
              compact
              contentStyle={{ marginBottom: 10 }}
              labelStyle={{ fontSize: 12 }}
              style={{ alignSelf: "flex-end" }}
              onPress={() => router.push("/authentication/forgotPassword")}
              rippleColor={"transparent"}
            >
              Forgot Password?
            </Button>
          </View>
        )}

        <Button
          mode="contained"
          buttonColor="#0d9488"
          contentStyle={{ paddingVertical: 10 }}
          style={{ borderRadius: 17 }}
          labelStyle={{ fontSize: 18, fontWeight: "bold" }}
          onPress={handleAuth}
        >
          {isSignUp ? "Sign Up" : "Sign In"}
        </Button>

        <View className="flex-row justify-center items-center mt-6">
          <Text className="text-base mr-1">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}
          </Text>
          <Button mode="text" textColor="#0d9488" onPress={handleSwitch}>
            {isSignUp ? "Sign In" : "Sign Up"}
          </Button>
        </View>

        {/* Skip for now button */}
        <Button
          mode="text"
          textColor={theme.colors.onSurfaceDisabled}
          style={{ padding: 0, alignSelf: "center" }}
          onPress={handleSkip}
          compact
        >
          Skip for now
        </Button>
      </ScrollView>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleSuccessModalClose}
      >
        <View className="flex-1 justify-center items-center bg-black/50 p-6">
          <View className="bg-white rounded-xl p-6 w-full max-w-md ">
            <View className="items-center mb-4">
              <View className="bg-teal-100 p-4 rounded-full">
                <Ionicons name="checkmark-circle" size={48} color="#0d9488" />
              </View>
            </View>

            {/* Centered text block */}
            <View className="items-center justify-center mb-4 w-full">
              <Text className="text-2xl font-bold text-teal-800 text-center mb-2">
                Account Created!
              </Text>
              <Text className="text-gray-600 text-center w-full">
                Check your email for a verification link to complete your
                registration. Check your spam folder if you don't see it.
              </Text>
            </View>

            <Button
              mode="contained"
              onPress={handleResendVerification}
              buttonColor="#0d9488"
              loading={isResending}
              disabled={isResending}
              style={{ marginBottom: 12 }}
            >
              {isResending ? "Sending..." : "Resend Verification"}
            </Button>

            <Button
              mode="outlined"
              onPress={handleSuccessModalClose}
              textColor="#0d9488"
              style={{ borderColor: "#0d9488" }}
            >
              Close
            </Button>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default AuthScreen;
