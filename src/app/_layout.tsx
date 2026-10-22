import "../global.css";

import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { View } from "react-native";

import { Icon } from "@/components/ui";

SplashScreen.preventAutoHideAsync();

console.log("RN AssetRegistry:", require("react-native").AssetRegistry);

export default function RootLayout() {
  const [loaded, error] = useFonts({
    "PlusJakartaSans-Regular": require("../../assets/fonts/PlusJakartaSans-Regular.ttf"),
    "PlusJakartaSans-Medium": require("../../assets/fonts/PlusJakartaSans-Medium.ttf"),
    "PlusJakartaSans-SemiBold": require("../../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
    "PlusJakartaSans-Bold": require("../../assets/fonts/PlusJakartaSans-Bold.ttf"),
    "PlusJakartaSans-ExtraBold": require("../../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
  });

  console.log("registry:", require("@react-native/assets-registry/registry"));

  useEffect(() => {
    console.log("fonts loaded:", loaded, "error:", error);
    if (loaded || error) SplashScreen.hideAsync();
  }, [loaded, error]);

  if (!loaded && !error) return null;

  const iconSettings = { ios: "gearshape", android: "settings", web: "settings" } as const;

  return (
    <Stack screenOptions={{ headerShown: false }}>
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