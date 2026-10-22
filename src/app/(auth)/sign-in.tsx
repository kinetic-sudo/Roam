import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { Link, useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Stub until Clerk is wired in.
export default function SignIn() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <View className="flex-1 bg-surface px-6" style={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }}>
      <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Back" hitSlop={12} className="size-10 justify-center">
        <Icon name="arrowLeft" size={24} className="text-ink" />
      </Pressable>
      <Text variant="heading" className="mt-6 text-ink">
        Sign in
      </Text>
      <Text variant="body" tone="muted" className="mt-3">
        Sign-in with Clerk is coming next.
      </Text>
      <Link href="/sign-up" className="mt-6">
        <Text variant="body" className="text-ink">
          New to roam? Create an account
        </Text>
      </Link>
    </View>
  );
}