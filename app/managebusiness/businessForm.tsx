// AddBusinessForm.tsx
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
} from "react-native";
import { Button } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import RNPickerSelect from "react-native-picker-select";
import albertaCities from "@/albertaCities";
import { useState } from "react";

const AddBusinessForm = ({
  mode,
  businessName,
  setBusinessName,
  selectedCategory,
  setSelectedCategory,
  description,
  setDescription,
  location,
  setLocation,
  contactIG,
  setContactIG,
  contactPhone,
  setContactPhone,
  isStudentOwned,
  setIsStudentOwned,
  selectedCity,
  setSelectedCity,
  images,
  pickImage,
  removeImage,
  handleSubmit,
  isSubmitting,
  categories,
}: {
  mode: string;
  businessName: string;
  setBusinessName: (text: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  description: string;
  setDescription: (text: string) => void;
  location: string;
  setLocation: (text: string) => void;
  contactIG: string;
  setContactIG: (text: string) => void;
  contactPhone: string;
  setContactPhone: (text: string) => void;
  isStudentOwned: boolean;
  setIsStudentOwned: (value: boolean) => void;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  images: { id?: string; uri: string }[];
  pickImage: () => Promise<void>;
  removeImage: (index: number) => void;
  handleSubmit: () => Promise<void>;
  isSubmitting: boolean;
  categories: string[];
}) => {
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView className="flex-1 bg-gray-50 p-4">
        <View className="mb-6">
          <Text className="text-2xl font-bold text-teal-800 ">
            {mode === "edit" ? "Edit Your Business" : "Add Your Business"}
          </Text>
          <Text className="text-sm text-gray-500">
            Fields with <Text className="text-red-500">*</Text> are required
          </Text>
        </View>
        {/* Business Name */}
        <View className="mb-5">
          <Text className="font-bold text-teal-700 mb-1">
            Business Name<Text className="text-red-500">*</Text>
          </Text>
          <TextInput
            placeholder="Hair by Mide"
            value={businessName}
            onChangeText={setBusinessName}
            className="bg-white p-3 rounded-lg border border-gray-200"
            placeholderTextColor="#9ca3af"
          />
        </View>
        {/* Category Selection */}
        <View className="mb-5">
          <Text className="font-bold text-teal-700 mb-1">
            Category<Text className="text-red-500">*</Text>
          </Text>
          <View className="flex-row flex-wrap">
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                onPress={() => setSelectedCategory(category)}
                className={`mr-2 mb-2 px-4 py-2 rounded-full ${
                  selectedCategory === category
                    ? "bg-teal-600"
                    : "bg-white border border-teal-600"
                }`}
              >
                <Text
                  className={`text-sm ${
                    selectedCategory === category
                      ? "text-white"
                      : "text-teal-600"
                  }`}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        {/* Description */}
        <View className="mb-5">
          <Text className="font-bold text-teal-700 mb-1">
            Description<Text className="text-red-500">*</Text>
          </Text>
          <TextInput
            placeholder="I do hair..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            className="bg-white p-3 rounded-lg border border-gray-200 h-32"
            textAlignVertical="top"
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Location */}
        <View className="mb-5">
          <Text className="font-bold text-teal-700 mb-1">
            Location<Text className="text-red-500">*</Text>
          </Text>
          <TextInput
            placeholder="Address or landmark"
            value={location}
            onChangeText={setLocation}
            className="bg-white p-3 rounded-lg border border-gray-200 mb-2"
            placeholderTextColor="#9ca3af"
          />

          {/* City Dropdown - Now completely independent */}
          <Text className="text-sm text-gray-500 mb-1">
            Select Alberta city<Text className="text-red-500">*</Text>
          </Text>
          <View className="relative">
            <TouchableOpacity
              onPress={() => setShowCityDropdown(!showCityDropdown)}
              className="bg-white p-3 rounded-lg border border-gray-200 flex-row justify-between items-center"
            >
              <Text className="text-gray-700">
                {selectedCity || "Choose a city"}
              </Text>
              <Ionicons
                name={showCityDropdown ? "chevron-up" : "chevron-down"}
                size={16}
                color="#4b5563"
              />
            </TouchableOpacity>

            {showCityDropdown && (
              <View className="absolute top-12 left-0 right-0 bg-white border border-gray-200 rounded-lg z-10 max-h-60">
                <ScrollView>
                  {albertaCities.map((city) => (
                    <TouchableOpacity
                      key={city.value}
                      onPress={() => {
                        setSelectedCity(city.value);
                        setShowCityDropdown(false);
                      }}
                      className="p-3 border-b border-gray-100"
                    >
                      <Text className="text-gray-700">{city.label}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        </View>
        {/*Image Upload */}
        <View className="mb-5">
          <Text className="font-bold text-teal-700 mb-1">
            Images<Text className="text-red-500">*</Text>
          </Text>
          <Text className="text-xs text-gray-500 mb-2">Add up to 3 images</Text>
          <View className="flex-row flex-wrap">
            {images.map((image, index) => (
              <View key={index} className="relative mr-2 mb-2">
                <Image
                  source={{ uri: image.uri }}
                  className="w-20 h-20 rounded-lg"
                />
                <TouchableOpacity
                  onPress={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 rounded-full w-5 h-5 items-center justify-center"
                >
                  <Ionicons name="close" size={16} color="white" />
                </TouchableOpacity>
              </View>
            ))}
            {images.length < 3 && (
              <TouchableOpacity
                onPress={pickImage}
                className="w-20 h-20 border-2 border-dashed border-teal-300 rounded-lg items-center justify-center"
              >
                <Text className="text-teal-500 text-2xl">+</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        {/* Contact Information */}
        <View className="mb-5">
          <Text className="font-bold text-teal-700 mb-1">Contact Info</Text>

          <View className="mb-3">
            <Text className="text-sm text-gray-500 mb-1">Instagram</Text>
            <TextInput
              placeholder="@hairbymide"
              value={contactIG}
              onChangeText={setContactIG}
              className="bg-white p-3 rounded-lg border border-gray-200"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View>
            <Text className="text-sm text-gray-500 mb-1">
              Phone<Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              placeholder="+1 123-456-7890"
              value={contactPhone}
              onChangeText={setContactPhone}
              className="bg-white p-3 rounded-lg border border-gray-200"
              placeholderTextColor="#9ca3af"
              keyboardType="phone-pad"
            />
          </View>
        </View>
        {/* Student Owned Toggle */}
        <View className="mb-6 flex-row items-center">
          <TouchableOpacity
            onPress={() => setIsStudentOwned(!isStudentOwned)}
            className={`w-5 h-5 rounded-md mr-2 border-2 ${
              isStudentOwned ? "bg-teal-600 border-teal-600" : "border-gray-400"
            } items-center justify-center`}
          >
            {isStudentOwned && (
              <Ionicons name="checkmark" size={14} color="white" />
            )}
          </TouchableOpacity>
          <Text className="text-sm text-gray-700">Student-owned business</Text>
        </View>
        {/* Submit Button */}
        <Button
          mode="contained"
          onPress={handleSubmit}
          buttonColor="teal"
          loading={isSubmitting}
          disabled={isSubmitting}
          className="rounded-lg py-2"
          style={{ marginBottom: 50 }}
        >
          {mode === "edit" ? "Update Business" : "Save Business"}
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AddBusinessForm;
