import { createCloudAccount } from "@/db/mutations/backup.mutations";
import { useDb } from "@/hooks/useDb";
import {
  isSignedIn as checkIsSignedIn,
  signInWithGoogle,
  signOutFromGoogle,
} from "@/services/googleAuthService";
import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "sonner-native";

type AuthContextValue = {
  isSignedIn: boolean;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  const db = useDb();

  const refreshSignInState = async () => {
    const signedIn = await checkIsSignedIn();
    setIsSignedIn(signedIn);
  };

  const signIn = async () => {
    setLoading(true);
    try {
      const result = await signInWithGoogle();

      if (result.success && result.user?.email) {
        await createCloudAccount({
          db,
          data: {
            id: "gdrive",
            provider: "google_drive",
            accountEmail: result.user?.email!,
            connectedAt: new Date(),
          },
        });
        setIsSignedIn(true);
        toast.success(`Connected to Google Drive as ${result.user?.email}`);
      } else {
        console.log("Failed", result.reason);
        await refreshSignInState();
      }
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const result = await signOutFromGoogle();

      if (result.success) {
        console.log("Signed out");
        setIsSignedIn(false);
      } else {
        await refreshSignInState();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadSignInState = async () => {
      try {
        const signedIn = await checkIsSignedIn();

        if (isMounted) {
          setIsSignedIn(signedIn);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadSignInState();

    return () => {
      isMounted = false;
    };
  }, []);

  const value = {
    isSignedIn,
    loading,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
