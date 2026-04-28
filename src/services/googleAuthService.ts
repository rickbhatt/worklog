import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";

const WEB_CLIENT_ID =
  "592813484824-uet1a8336674780a9i1eirlo9rrk9qi8.apps.googleusercontent.com";

export function configureGoogleSignIn() {
  GoogleSignin.configure({
    webClientId: WEB_CLIENT_ID,
    scopes: ["https://www.googleapis.com/auth/drive.appdata"],
    offlineAccess: true,
  });
}

export async function signInWithGoogle() {
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const userInfo = await GoogleSignin.signIn();
    return { success: true, user: userInfo.data?.user };
  } catch (error: any) {
    console.log("🚀 Google Sign-In Error:", JSON.stringify(error));
    console.log("🚀 Error code:", error.code);
    console.log("🚀 Error message:", error.message);
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      return { success: false, reason: "cancelled" };
    } else if (error.code === statusCodes.IN_PROGRESS) {
      return { success: false, reason: "in_progress" };
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      return { success: false, reason: "play_services_unavailable" };
    }
    return { success: false, reason: "unknown", error };
  }
}

export async function signOutFromGoogle() {
  try {
    await GoogleSignin.signOut();
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}

export async function getAccessToken(): Promise<string | null> {
  try {
    const tokens = await GoogleSignin.getTokens();
    return tokens.accessToken;
  } catch {
    return null;
  }
}

export async function isSignedIn(): Promise<boolean> {
  const currentUser = GoogleSignin.getCurrentUser();
  return currentUser !== null;
}
