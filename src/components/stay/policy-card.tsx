import { View } from "react-native";

import { stayIcons } from "@/components/stay/icon";
import { Icon, PressableScale, Text, type IconName } from "@/components/ui";

/**
 * The lavender card: leading icon (on a darker tile, or bare), a title with up to two lines beneath, a chevron.
 * `-mx-1` is on a wrapper, not on the pressable, so the hit area matches what you see.
 */
export function PolicyCard({
  title,
  subtitle,
  icon,
  iconSize = 28,
  tile,
  onPress,
  accessibilityHint,
}: {
  title: string;
  subtitle?: string | null;
  icon: IconName;
  iconSize?: number;
  /** Put the icon on a `lavender-muted` tile (Ask), or leave it bare (Cancellation). */
  tile?: boolean;
  onPress: () => void;
  accessibilityHint?: string;
}) {
  return (
    <View className="-mx-1">
      <PressableScale
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={subtitle ? `${title}. ${subtitle}` : title}
        accessibilityHint={accessibilityHint}
        className="flex-row items-center gap-4 rounded-lg bg-lavender-soft py-3 pl-3 pr-4"
      >
        <View className={tile ? "size-13.5 items-center justify-center rounded-md bg-lavender-muted" : "size-13.5 items-center justify-center"}>
          <Icon name={icon} size={iconSize} tone="accent" />
        </View>
        <View className="flex-1">
          <Text variant="subtitle">{title}</Text>
          {subtitle ? (
            <Text variant="caption" tone="muted" numberOfLines={2} className="mt-0.5">
              {subtitle}
            </Text>
          ) : null}
        </View>
        <Icon name={stayIcons.chevronRight} size={22} tone="accent" />
      </PressableScale>
    </View>
  );
}
