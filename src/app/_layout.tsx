import "../global.css";

import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { View } from "react-native";

import { Icon } from "@/components/ui";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

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