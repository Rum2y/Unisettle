import {
  account,
  DATABASEID,
  BUSINESS_SUBSCRIPTIONS_COLLECTION_ID,
  databases,
} from "@/lib/appwrite";
import { createContext, useContext, useEffect, useState } from "react";
import { ID, Models, Query } from "react-native-appwrite";

type AuthContextType = {
  user: Models.User<Models.Preferences> | null;
  isLoading: boolean;
  unverifiedUser: Models.User<Models.Preferences> | null;
  isBusinessSubscribed: boolean;
  setisBusinessSubscribed: (value: boolean) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
  completeVerification: (userId: string, secret: string) => Promise<void>;
  resendVerification: () => Promise<void>;
  businessPlanUser: (
    user: Models.User<Models.Preferences>
  ) => Promise<Models.Document[]>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(
    null
  );
  const [isBusinessSubscribed, setisBusinessSubscribed] =
    useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [unverifiedUser, setUnverifiedUser] =
    useState<Models.User<Models.Preferences> | null>(null);

  useEffect(() => {
    init();
  }, []);

  // Initialize the authentication context
  async function init() {
    try {
      const loggedIn = await account.get();
      if (loggedIn.emailVerification) {
        setUser(loggedIn);
        await businessPlanUser(loggedIn);
      } else {
        // If user exists but isn't verified, log them out
        await account.deleteSession("current");
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  // Sign in the user with email and password
  async function signIn(email: string, password: string) {
    setIsLoading(true);
    try {
      // First delete any existing session
      try {
        await account.deleteSession("current");
      } catch (error) {
        // Ignore if no session exists
      }
      // Create new session
      await account.createEmailPasswordSession(email, password);
      const loggedInUser = await account.get();

      // Check if email is verified
      if (!loggedInUser.emailVerification) {
        // Store unverified user and log them out
        setUnverifiedUser(loggedInUser);
        await account.deleteSession("current");
      } else {
        setUser(loggedInUser);
        setUnverifiedUser(null);
        await businessPlanUser(loggedInUser);
      }
    } finally {
      setIsLoading(false);
    }
  }

  // Sign out the current user
  async function signOut() {
    setIsLoading(true);
    try {
      await account.deleteSession("current");
      setUser(null);
      setUnverifiedUser(null);
      setisBusinessSubscribed(false);
    } finally {
      setIsLoading(false);
    }
  }

  // Sign up a new user
  async function signUp(email: string, password: string, name?: string) {
    setIsLoading(true);
    try {
      await account.create(ID.unique(), email, password, name);
      await account.createEmailPasswordSession(email, password);
      await account.createVerification(
        "https://verify-three-liart.vercel.app/verify.html"
      );
      const newUser = await account.get();
      setUnverifiedUser(newUser);
    } finally {
      setIsLoading(false);
    }
  }

  // Complete verification for unverified users
  async function completeVerification(userId: string, secret: string) {
    setIsLoading(true);
    try {
      await account.updateVerification(userId, secret);

      // After verification, get the updated user
      const verifiedUser = await account.get();
      setUser(verifiedUser);
      setUnverifiedUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  // Resend verification email for unverified users
  async function resendVerification() {
    if (!unverifiedUser?.email) {
      throw new Error("No unverified user found");
    }

    setIsLoading(true);
    try {
      await account.createVerification(
        "https://verify-three-liart.vercel.app/verify.html"
      );
    } finally {
      setIsLoading(false);
    }
  }

  // Check if the user has a business plan subscription
  async function businessPlanUser(user: Models.User<Models.Preferences>) {
    setIsLoading(true);
    try {
      const response = await databases.listDocuments(
        DATABASEID,
        BUSINESS_SUBSCRIPTIONS_COLLECTION_ID,
        [Query.equal("userId", user.$id)]
      );

      if (response.documents.length === 0) {
        return []; // No subscription found
      }

      const subscription = response.documents[0];
      const currentDate = new Date();

      // Check Stripe subscription status (active, trialing)
      const isActive =
        subscription.status === "active" || subscription.status === "trialing";

      // Check if subscription hasn't expired
      const isNotExpired = subscription.freeTrialEnd
        ? new Date(subscription.freeTrialEnd) > currentDate
        : true;

      setisBusinessSubscribed(isActive && isNotExpired);
      return response.documents;
    } catch (error) {
      console.error("Error checking subscription status:", error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        unverifiedUser,
        signIn,
        signUp,
        signOut,
        completeVerification,
        businessPlanUser,
        isBusinessSubscribed,
        setisBusinessSubscribed,
        resendVerification,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
