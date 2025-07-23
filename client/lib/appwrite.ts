import {
  Client,
  Databases,
  Account,
  Storage,
  Functions,
} from "react-native-appwrite";

const client = new Client();
client
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!)
  .setPlatform("com.rumzy.unisettle");

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const functions = new Functions(client);

export const DATABASEID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
export const GUIDESCOLLECTIONID =
  process.env.EXPO_PUBLIC_APPWRITE_GUIDES_COLLECTION_ID!;
export const CHECKLISTCOLLECTIONID =
  process.env.EXPO_PUBLIC_APPWRITE_CHECKLIST_COLLECTION_ID!;
export const GROCERYCOLLECTIONID =
  process.env.EXPO_PUBLIC_APPWRITE_GROCERY_STORES_COLLECTION_ID!;
export const STOREREVIEWSCOLLECTIONID =
  process.env.EXPO_PUBLIC_APPWRITE_STORE_REVIEWS_COLLECTION_ID!;
export const BUSINESSESCOLLECTIONID =
  process.env.EXPO_PUBLIC_APPWRITE_STORE_BUSINESSES_COLLECTION_ID!;
export const BUSINESSREVIEWSCOLLECTIONID =
  process.env.EXPO_PUBLIC_APPWRITE_BUSINESS_REVIEWS_COLLECTION_ID!;
export const BOOKMARKSCOLLECTIONID =
  process.env.EXPO_PUBLIC_APPWRITE_BOOKMARKS_COLLECTION_ID!;
export const BUSINESSIMAGESBUCKETID =
  process.env.EXPO_PUBLIC_APPWRITE_BUSINESS_IMAGES_BUCKET_ID!;
export const FEEDBACKCOLLECTIONID =
  process.env.EXPO_PUBLIC_APPWRITE_FEEDBACK_COLLECTION_ID!;
export const BUSINESS_SUBSCRIPTIONS_COLLECTION_ID =
  process.env.EXPO_PUBLIC_APPWRITE_BUSINESS_SUBSCRIPTIONS_COLLECTION_ID!;
