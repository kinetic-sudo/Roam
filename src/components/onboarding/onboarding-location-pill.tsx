import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { View } from "react-native";

export function LocationPill({ label }: { label: string }) {
  return (
    <View className="h-10 flex-row items-center gap-2 self-start rounded-full border border-scrim-border bg-scrim px-4">
      <Icon name="marker" size={18} className="text-inverse" />
      <Text variant="label" className="text-inverse">
        {label}
      </Text>
    </View>
  );
}