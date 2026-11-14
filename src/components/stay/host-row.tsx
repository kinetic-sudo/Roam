import { View } from "react-native";

import { Avatar } from "@/components/stay/avatar";
import { stayIcons } from "@/components/stay/icon";
import { Icon, PressableScale, Text } from "@/components/ui";
import { cn } from "@/lib/cn";
import { firstName } from "@/lib/stay-details";
import type { StayHost } from "@/lib/stays";

/** "Hosted by Maya", with a Superhost line. Opens the Host sheet. */
export function HostRow({ host, onPress }: { host: StayHost; onPress: () => void }) {
  const first = firstName(host.name);
  return (
    <View className="-mx-1">
      <PressableScale
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`Hosted by ${first}${host.isSuperhost ? ", Superhost" : ""}`}
        accessibilityHint="Opens the host's details"
        className="flex-row items-center gap-4 py-2"
      >
        <Avatar size="md" name={host.name} uri={host.photoUrl} className="border-2 border-surface shadow-raised" />
        <View className="flex-1">
          <Text variant="subtitle">Hosted by {first}</Text>
          {host.isSuperhost ? <SuperhostLine className="mt-0.5" /> : null}
        </View>
        <Icon name={stayIcons.chevronRight} size={22} />
      </PressableScale>
    </View>
  );
}

/** Rosette + "Superhost". Shared by the host row and the host sheet. */
export function SuperhostLine({ className }: { className?: string }) {
  return (
    <View className={cn("flex-row items-center gap-1.5", className)}>
      <Icon name={stayIcons.rosette} size={16} tone="subtle" />
      <Text variant="label" tone="subtle">
        Superhost
      </Text>
    </View>
  );
}
