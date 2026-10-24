import "../global.css";

import { ClerkProvider, useAuth } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { View } from "react-native";

import { Icon } from "@/components/ui";

SplashScreen.preventAutoHideAsync();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
if (!publishableKey) {
  throw new Error("Add EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY to your .env file (see .env.example).");
}

const iconSettings = { ios: "gearshape", android: "settings", web: "settings" } as const;

/** Waits for Clerk to restore the saved session, then gates routes on it. */
function Routes() {
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (isLoaded) SplashScreen.hideAsync();
  }, [isLoaded]);

  // Keep the splash screen up until the saved session has been checked.
  if (!isLoaded) return null;

  const signedIn = !!isSignedIn;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* index decides where to go: /home when signed in, /onboarding otherwise */}
      <Stack.Screen name="index" />

      {/* Signed-out only. Unreachable once there is a session. */}
      <Stack.Protected guard={!signedIn}>
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(auth)" />
      </Stack.Protected>

      {/* Signed-in only. Deep links here while signed out fall back to index. */}
      <Stack.Protected guard={signedIn}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>

      <Stack.Screen
        name="design-system"
        options={{
          headerShown: true,
          title: "Design system",
          headerRight: () => (
            <View className="mr-1 size-10 items-center justify-center rounded-full bg-info">
              <Icon name={iconSettings} tone="inverse" size={22} />
            </View>
          ),
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  // If your layout also loads other fonts (e.g. Outfit for the wordmark), keep those entries here.
  const [fontsLoaded, fontError] = useFonts({
    "PlusJakartaSans-Regular": require("../../assets/fonts/PlusJakartaSans-Regular.ttf"),
    "PlusJakartaSans-Medium": require("../../assets/fonts/PlusJakartaSans-Medium.ttf"),
    "PlusJakartaSans-SemiBold": require("../../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
    "PlusJakartaSans-Bold": require("../../assets/fonts/PlusJakartaSans-Bold.ttf"),
    "PlusJakartaSans-ExtraBold": require("../../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
  });

  if (!fontsLoaded && !fontError) return null;

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <Routes />
    </ClerkProvider>
  );
}