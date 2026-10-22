import { Link } from "expo-router";
import { View } from "react-native";

import { Button, Text } from "@/components/ui";

export default function SignInScreen() {
  return (
    <View className="flex-1 gap-6 bg-surface px-5 pt-6">
      <View className="gap-3">
        <Text variant="headline">Welcome back</Text>
        <Text tone="muted">Sign-in with email, Google, or Apple will connect here once Clerk is wired up.</Text>
      </View>

      <Button title="Sign in" disabled />

      <Link href="/sign-up" asChild>
        <Text variant="label" tone="accent" className="text-center">
          New to Roam? Create an account
        </Text>
      </Link>
    </View>
  );
}
