import { Pressable, View } from "react-native";

import { Text } from "@/components/ui";

type Props = {
  prompt: string;
  action: string;
  onPress: () => void;
  /** Dims the action and drops the underline (e.g. the resend countdown). */
  disabled?: boolean;
};

export function AuthFooter({ prompt, action, onPress, disabled }: Props) {
  return (
    <View className="mt-10 flex-row items-center justify-center gap-2">
      <Text variant="label" tone="muted">
        {prompt}
      </Text>
      <Pressable onPress={onPress} disabled={disabled} hitSlop={8} accessibilityRole="link" accessibilityLabel={action}>
        {disabled ? (
          <Text variant="label" tone="muted">
            {action}
          </Text>
        ) : (
          <Text variant="link">{action}</Text>
        )}
      </Pressable>
    </View>
  );
}