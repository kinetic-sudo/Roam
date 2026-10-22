import "../global.css";

import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { View } from "react-native";

import { Icon } from "@/components/ui";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Runtime loading keeps Expo Go working. Once the app moves to a development
  // build, switch to the expo-font config plugin (embeds the fonts at build time).
  // Keys must match --font-jakarta* in src/global.css.
  const [loaded, error] = useFonts({
    "PlusJakartaSans-Regular": require("@/assets/fonts/PlusJakartaSans-Regular.ttf"),
    "PlusJakartaSans-Medium": require("@/assets/fonts/PlusJakartaSans-Medium.ttf"),
    "PlusJakartaSans-SemiBold": require("@/assets/fonts/PlusJakartaSans-SemiBold.ttf"),
    "PlusJakartaSans-Bold": require("@/assets/fonts/PlusJakartaSans-Bold.ttf"),
  });

  useEffect(() => {
    console.log("fonts loaded:", loaded, "error:", error);
    if (loaded || error) SplashScreen.hideAsync();
  }, [loaded, error]);

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  // Hold the splash screen until fonts are ready (or failed: fall back to system).
  if (!loaded && !error) {
    return null;
  }

  const iconSettings = { ios: "gearshape", android: "settings", web: "settings" } as const;

  return (
    <Stack screenOptions={{ headerShown: false }} 
    >
      <Stack.Screen
        name="index"
        options={{
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
