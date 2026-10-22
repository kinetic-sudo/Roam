import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { View } from "react-native";

export function LocationPill({ label }: { label: string }) {
  return (
    <View className="h-10 flex-row items-center gap-2 self-start rounded-full border border-scrim-border bg-scrim px-4">
<Icon name={{ ios: "mappin", android: "location_on", web: "location_on" }} tone="inverse" size={18} />
<Text variant="label" tone="inverse">{label}</Text>
    </View>
  );
}