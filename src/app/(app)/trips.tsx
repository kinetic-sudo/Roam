import { ScrollView } from "react-native";

import { stayIcons } from "@/components/stays/icons";
import { Icon, Text } from "@/components/ui";

// Placeholder until trips exist.
export default function Trips() {
  return (
    <ScrollView
      className="flex-1 bg-surface"
      contentInsetAdjustmentBehavior="automatic"
      contentContainerClassName="grow items-center justify-center gap-2 px-5 pb-32"
    >
      <Icon name={stayIcons.calendar} size={40} />
      <Text variant="title" className="mt-2">
        No trips yet
      </Text>
      <Text tone="muted" className="text-center">
        Stays you book will show up here.
      </Text>
    </ScrollView>
  );
}