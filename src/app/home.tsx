import { useRouter } from "expo-router";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, Text } from "@/components/ui";

// Stub landing screen until the real home exists.
export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-surface px-6" style={{ paddingTop: insets.top + 24, paddingBottom: insets.bottom + 16 }}>
      <Text variant="heading">You&rsquo;re signed in</Text>
      <Text tone="muted" className="mt-3">
        Auth is mocked until Clerk is set up.
      </Text>
      <View className="mt-6">
        <Button title="Sign out" variant="secondary" onPress={() => router.replace("/sign-in")} />
      </View>
    </View>
  );
}