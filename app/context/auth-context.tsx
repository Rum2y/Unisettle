import { createContext, useState, useEffect, useContext } from "react";
import { ID, Models } from "react-native-appwrite";
import { account } from "@/lib/appwrite";

type AuthContextType = {
  user: Models.User<Models.Preferences> | null;
  isLoading: boolean;
  unverifiedUser: Models.User<Models.Preferences> | null;

  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
  completeVerification: (userId: string, secret: string) => Promise<void>;
  resendVerification: () => Promise<void>;
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

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [unverifiedUser, setUnverifiedUser] =
    useState<Models.User<Models.Preferences> | null>(null);

  useEffect(() => {
    init();
  }, []);

  async function init() {
    try {
      const loggedIn = await account.get();
      if (loggedIn.emailVerification) {
        setUser(loggedIn);
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
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function signOut() {
    setIsLoading(true);
    try {
      await account.deleteSession("current");
      setUser(null);
      setUnverifiedUser(null);
    } finally {
      setIsLoading(false);
    }
  }

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
        resendVerification,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
