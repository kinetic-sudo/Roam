import { useSSO } from "@clerk/expo";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import { ActivityIndicator, Platform, Pressable, View } from "react-native";

import { GoogleMark } from "@/components/onboarding/onboarding-google-mark";
import { Icon, Text } from "@/components/ui";
import { clerkMessage } from "@/lib/auth/clerk-error";

import { authIcons } from "./icons";

// Lets the in-app browser hand control back to the app when the provider redirects.
WebBrowser.maybeCompleteAuthSession();

type Provider = "google" | "apple";
const strategies = { google: "oauth_google", apple: "oauth_apple" } as const;

type Props = {
  disabled?: boolean;
  onError: (message: string) => void;
};

function Row({ title, mark, loading, disabled, onPress }: { title: string; mark: React.ReactNode; loading: boolean; disabled: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled, busy: loading }}
      // Titles are left-aligned at the same x, as in the design, so this is not <Button>.
      className={`h-12 flex-row items-center rounded-full border border-border bg-surface pl-18 ${disabled ? "opacity-40" : "active:opacity-70"}`}
    >
      <View className="w-9 items-start">{loading ? <ActivityIndicator className="text-ink" /> : mark}</View>
      <Text variant="buttonSecondary" className="ml-7">
        {title}
      </Text>
    </Pressable>
  );
}

export function SocialButtons({ disabled, onError }: Props) {
  const { startSSOFlow } = useSSO();
  const [busy, setBusy] = useState<Provider | null>(null);

  const run = async (provider: Provider) => {
    if (busy) return;
    setBusy(provider);
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: strategies[provider],
        redirectUrl: AuthSession.makeRedirectUri(),
      });
      // No session id means the guest closed the browser: stay put, no error.
      // With a session, the route guard moves them to /home on its own.
      if (createdSessionId && setActive) await setActive({ session: createdSessionId });
    } catch (e) {
      onError(clerkMessage(e));
    } finally {
      setBusy(null);
    }
  };

  const locked = !!disabled || !!busy;

  return (
    <View className="mt-3 gap-4">
      <Row title="Continue with Google" mark={<GoogleMark />} loading={busy === "google"} disabled={locked} onPress={() => run("google")} />
      {Platform.OS === "ios" ? (
        <Row
          title="Continue with Apple"
          mark={<Icon name={authIcons.apple} size={22} />}
          loading={busy === "apple"}
          disabled={locked}
          onPress={() => run("apple")}
        />
      ) : null}
    </View>
  );
}