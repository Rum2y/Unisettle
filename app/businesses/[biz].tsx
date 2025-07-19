// AddBusiness.tsx
import { Alert } from "react-native";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import { useLocalSearchParams } from "expo-router";
import { useAuth } from "../context/auth-context";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import getImages from "../managebusiness/filePreview";
import {
  BUSINESSESCOLLECTIONID,
  BUSINESSIMAGESBUCKETID,
  DATABASEID,
  databases,
  storage,
} from "@/lib/appwrite";
import mime from "mime";
import { ID } from "react-native-appwrite";
import AddBusinessForm from "../managebusiness/businessForm";

export const categories = [
  "Barber",
  "Hairdresser",
  "Makeup Artist",
  "Nails",
  "Tailor",
  "Photography",
  "Braider",
];

export const pickImage = async (
  images: { id?: string; uri: string }[],
  setImages: React.Dispatch<
    React.SetStateAction<{ id?: string; uri: string }[]>
  >
): Promise<void> => {
  if (images.length >= 3) {
    Alert.alert("Maximum 3 images allowed");
    return;
  }

  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") {
    Alert.alert(
      "Permission required",
      "We need access to your photos to upload images."
    );
    return;
  }

  let result: ImagePicker.ImagePickerResult =
    await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [5, 4],
      quality: 0.7,
    });

  if (!result.canceled && result.assets) {
    setImages([...images, { uri: result.assets[0].uri }]);
  }
};

const AddBusiness = () => {
  const { biz } = useLocalSearchParams<{ biz: string }>();
  const [businessName, setBusinessName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [contactIG, setContactIG] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [isStudentOwned, setIsStudentOwned] = useState(false);
  const [images, setImages] = useState<{ id?: string; uri: string }[]>([]);
  const [selectedCity, setSelectedCity] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mode, setMode] = useState("add");

  const { user } = useAuth();

  useEffect(() => {
    if (biz !== "addBusiness") setMode("edit");
  }, [user]);

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const uploadImage = async (uri: string) => {
    const fileName = uri.split("/").pop() || "business_image.jpg";
    const mimeType = mime.getType(uri) || "image/jpeg";

    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);

      if (!fileInfo.exists || !fileInfo.size) {
        throw new Error("Image file does not exist or size is unavailable");
      }

      const response = await storage.createFile(
        BUSINESSIMAGESBUCKETID,
        ID.unique(),
        {
          uri: uri,
          type: mimeType,
          name: fileName,
          size: fileInfo.size,
        }
      );

      return response.$id; // Return the Appwrite file ID
    } catch (error) {
      console.error("Error uploading image to Appwrite:", error);
      return null;
    }
  };

  if (biz !== "addBusiness") {
    useEffect(() => {
      const fetchBusinessDetails = async () => {
        try {
          const document = await databases.getDocument(
            DATABASEID,
            BUSINESSESCOLLECTIONID,
            biz
          );

          if (document) {
            setBusinessName(document.name || "");
            setSelectedCategory(document.category || "");
            setDescription(document.description || "");
            setLocation(document.location || "");
            setContactIG(document.instagram || "");
            setContactPhone(document.phoneNumber || "");
            setIsStudentOwned(document.studentOwned || false);
            setImages(document.images || []);
            setSelectedCity(document.city || "");

            // Fetch images and convert to preview URLs
            const previewUrls = await getImages(document || [], false);
            setImages(previewUrls.filter(Boolean));
          }
        } catch (error) {
          console.error("Error fetching business details:", error);
        }
      };

      fetchBusinessDetails();
    }, [biz]);
  }

  const handleSubmit = async () => {
    if (
      !businessName ||
      !selectedCategory ||
      !description ||
      !location ||
      !contactPhone ||
      images.length === 0
    ) {
      Alert.alert(
        "Required fields missing",
        "Please fill in all required fields."
      );
      return;
    }

    if (!user) {
      Alert.alert("Authentication required", "Please log in to submit.");
      return;
    }
    try {
      setIsSubmitting(true);
      const uploadedFileIds = [];

      for (const imageUri of images) {
        if (imageUri.id) {
          uploadedFileIds.push(imageUri.id);
        } else {
          const fileId = await uploadImage(imageUri.uri);
          if (fileId) uploadedFileIds.push(fileId);
        }
      }

      const dataSent = {
        name: businessName,
        category: selectedCategory,
        description: description,
        location: location,
        instagram: contactIG === "" ? "N/A" : contactIG,
        phoneNumber: contactPhone,
        studentOwned: isStudentOwned ? true : false,
        images: uploadedFileIds,
        userID: user.$id,
        city: selectedCity,
      };
      if (biz === "addBusiness") {
        await databases.createDocument(
          DATABASEID,
          BUSINESSESCOLLECTIONID,
          ID.unique(),
          dataSent
        );
      } else {
        await databases.updateDocument(
          DATABASEID,
          BUSINESSESCOLLECTIONID,
          biz,
          dataSent
        );
      }
    } catch (error) {
      console.error("Error submitting business:", error);
    } finally {
      setIsSubmitting(false);
      Alert.alert("Success", "Your business has been submitted for review!");
      // Reset form
      setBusinessName("");
      setSelectedCategory("");
      setDescription("");
      setLocation("");
      setContactIG("");
      setContactPhone("");
      setIsStudentOwned(false);
      setImages([]);
      setSelectedCity("Enter your city");
      router.push("/(tabs)/business");
    }
  };

  const handlePickImage = async () => {
    await pickImage(images, setImages);
  };

  return (
    <AddBusinessForm
      mode={mode}
      businessName={businessName}
      setBusinessName={setBusinessName}
      selectedCategory={selectedCategory}
      setSelectedCategory={setSelectedCategory}
      description={description}
      setDescription={setDescription}
      location={location}
      setLocation={setLocation}
      contactIG={contactIG}
      setContactIG={setContactIG}
      contactPhone={contactPhone}
      setContactPhone={setContactPhone}
      isStudentOwned={isStudentOwned}
      setIsStudentOwned={setIsStudentOwned}
      selectedCity={selectedCity}
      setSelectedCity={setSelectedCity}
      images={images}
      pickImage={handlePickImage}
      removeImage={removeImage}
      handleSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      categories={categories}
    />
  );
};

export default AddBusiness;
