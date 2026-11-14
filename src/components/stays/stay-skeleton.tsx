import { View } from "react-native";

/** Loading layout: the photo block and three bars (title, place, amenities). Same footprint as the loaded page. */
export function StaySkeleton() {
  return (
    <View accessible accessibilityLabel="Loading stay" className="flex-1 bg-surface">
      <View className="h-87 bg-surface-muted" />
      <View className="-mt-2 rounded-t-sm bg-surface px-5 pt-5">
        <View className="h-8 w-4/5 rounded-full bg-surface-muted" />
        <View className="mt-4 h-5 w-3/5 rounded-full bg-surface-muted" />
        <View className="mt-6 h-16 w-full rounded-lg bg-surface-muted" />
      </View>
    </View>
  );
}
