import { databases } from "@/lib/appwrite";
import { ID } from "react-native-appwrite";
import {
  BUSINESS_LOGGED_EVENTS_COLLECTION_ID,
  DATABASEID,
} from "@/lib/appwrite";

export default async function logBusinessEvent(
  businessId: string,
  type: "view" | "call" | "instagram",
  userId?: string
) {
  try {
    await databases.createDocument(
      DATABASEID,
      BUSINESS_LOGGED_EVENTS_COLLECTION_ID,
      ID.unique(),
      {
        businessId,
        type,
        userId: userId || null,
        timeStamp: new Date().toISOString(),
        month: new Date().toISOString().slice(0, 7), // YYYY-MM format
      }
    );
  } catch (err) {
    console.error("Failed to log event:", err);
  }
}
