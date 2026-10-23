import { useClerk, useUser } from "@clerk/expo";
import { useState } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, Text } from "@/components/ui";
import { clerkMessage } from "@/lib/auth/clerk-error";

// Stub landing screen until the real home exists. Only reachable with a session.
export default function Home() {
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const { signOut } = useClerk();
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut(); // the route guard then sends the guest back to onboarding
    } catch (e) {
      setError(clerkMessage(e));
      setSigningOut(false);
    }
  };

  return (
    <View className="flex-1 bg-surface px-6" style={{ paddingTop: insets.top + 24, paddingBottom: insets.bottom + 16 }}>
      <Text variant="heading">{user?.firstName ? `Hi, ${user.firstName}` : "You’re signed in"}</Text>
      {user?.primaryEmailAddress ? (
        <Text tone="muted" className="mt-3">
          {user.primaryEmailAddress.emailAddress}
        </Text>
      ) : null}
      {error ? (
        <Text tone="muted" className="mt-3">
          {error}
        </Text>
      ) : null}
      <View className="mt-6">
        <Button title="Sign out" variant="secondary" loading={signingOut} onPress={onSignOut} />
      </View>
    </View>
  );
}