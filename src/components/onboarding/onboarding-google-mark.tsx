import { Text } from "@/components/ui/text";
import { View } from "react-native";

// PLACEHOLDER: replace with the real Google "G" asset in assets/images/.
export function GoogleMark() {
  return (
    <View className="size-[22px] items-center justify-center">
      <Text variant="buttonSecondary" className="font-jakarta-bold">
        G
      </Text>
    </View>
  );
}