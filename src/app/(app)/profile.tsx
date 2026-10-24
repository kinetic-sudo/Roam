import { useClerk, useUser } from "@clerk/expo";
import { useState } from "react";
import { ScrollView, View } from "react-native";

import { Avatar } from "@/components/stays/avatar";
import { Button, Text } from "@/components/ui";
import { clerkMessage } from "@/lib/auth/clerk-error";

export default function Profile() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut(); // the route guard then returns the guest to onboarding
    } catch (e) {
      setError(clerkMessage(e));
      setSigningOut(false);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-surface"
      contentInsetAdjustmentBehavior="automatic"
      contentContainerClassName="px-5 pb-8 pt-2"
    >
      <View className="items-center gap-1 pt-6">
        <Avatar />
        <Text variant="heading" className="mt-3">
          {user?.fullName ?? user?.firstName ?? "Your profile"}
        </Text>
        {user?.primaryEmailAddress ? (
          <Text tone="muted">{user.primaryEmailAddress.emailAddress}</Text>
        ) : null}
      </View>

      <View className="mt-10 gap-3">
        {error ? (
          <Text tone="muted" className="text-center">
            {error}
          </Text>
        ) : null}
        <Button title="Sign out" variant="secondary" loading={signingOut} onPress={onSignOut} />
      </View>
    </ScrollView>
  );
}