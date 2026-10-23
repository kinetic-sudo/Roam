import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import type { ReactNode } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Wordmark } from "@/components/brand/wordmark";
import { Icon, Text } from "@/components/ui";

import { authIcons } from "./icons";

type Props = {
  /** Use \n for the explicit line break from the design. */
  title: string;
  body: string;
  children: ReactNode;
  footer: ReactNode;
};

/** Shared shell: back button + wordmark, headline, body, then the form; footer sits at the bottom. */
export function AuthScreen({ title, body, children, footer }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-surface">
      <StatusBar style="dark" />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="grow justify-between px-6"
        contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 16 }}
      >
        <View>
          <View className="h-12 flex-row items-center justify-between">
             <Pressable
             onPress={() => (router.canGoBack() ? router.back() : router.replace("/onboarding"))}
             accessibilityRole="button"
             accessibilityLabel="Back"
             className="-ml-1 size-12 items-center justify-center rounded-full border border-border bg-surface active:opacity-70"
           >
             <Icon name={authIcons.arrowLeft} size={22} />
           </Pressable>
         
            <Wordmark size="md" />
          </View>

          <Text variant="headline" className="mt-8">
            {title}
          </Text>
          <Text tone="muted" className="mt-3 max-w-70">
            {body}
          </Text>

          <View className="mt-6">{children}</View>
        </View>
        {footer}
      </ScrollView>
    </View>
  );
}