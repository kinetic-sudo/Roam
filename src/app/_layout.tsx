import "../global.css";

import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

import { fontAssets, headerFontFamily } from "@/theme/font";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts(fontAssets);

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  // Hold the splash screen until fonts are ready (or failed: fall back to system).
  if (!loaded && !error) {
    return null;
  }

  return (
    <Stack
      screenOptions={{ headerTitleStyle: { fontFamily: headerFontFamily } }}
    />
  );
}