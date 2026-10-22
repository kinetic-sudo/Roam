import { Link, useLocalSearchParams } from "expo-router";
import { View } from "react-native";

import { Button, Text } from "@/components/ui";

export default function SignUpScreen() {
  const { provider } = useLocalSearchParams<{ provider?: string }>();

  return (
    <View className="flex-1 gap-6 bg-surface px-5 pt-6">
      <View className="gap-3">
        <Text variant="headline">Create your account</Text>
        <Text tone="muted">
          {provider === "google"
            ? "Google sign-up will connect here once Clerk is wired up."
            : "Email and password sign-up will live here. You reached this screen from onboarding."}
        </Text>
      </View>

      <Button title="Continue" disabled />

      <Link href="/sign-in" asChild>
        <Text variant="label" tone="accent" className="text-center">
          Already have an account? Sign in
        </Text>
      </Link>
    </View>
  );
}
