import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator, ScrollView, View } from "react-native";

import { Avatar } from "@/components/stays/avatar";
import { SuperhostLine } from "@/components/stay/host-row";
import { Text } from "@/components/ui";
import { useStay } from "@/hooks/use-stay";
import { hostFacts } from "@/lib/stay-details";

/** The host: avatar, name, Superhost line, bio, then hosting since / response time / languages (missing ones left out). */
export default function HostSheet() {
  const params = useLocalSearchParams<{ slug: string }>();
  const slug = (Array.isArray(params.slug) ? params.slug[0] : params.slug) ?? "";
  const { stay, status } = useStay(slug);
  const host = stay?.host;

  if (!host) {
    return (
      <View className="flex-1 items-center justify-center bg-surface px-5">
        {status === "loading" ? (
          <ActivityIndicator className="text-ink" />
        ) : (
          <Text variant="body" tone="muted" className="text-center">
            {"We couldn't load the host."}
          </Text>
        )}
      </View>
    );
  }

  const { bio, lines } = hostFacts(host);

  return (
    <ScrollView className="flex-1 bg-surface" contentInsetAdjustmentBehavior="never" contentContainerClassName="gap-4 px-5 pb-8 pt-6">
      <View className="flex-row items-center gap-4">
        <Avatar size="lg" name={host.name} uri={host.photoUrl} />
        <View className="flex-1">
          <Text variant="title">{host.name}</Text>
          {host.isSuperhost ? <SuperhostLine className="mt-1" /> : null}
        </View>
      </View>

      {bio ? <Text variant="body">{bio}</Text> : null}

      {lines.length > 0 ? (
        <View className="gap-1.5">
          {lines.map((line) => (
            <Text key={line} variant="label" tone="muted">
              {line}
            </Text>
          ))}
        </View>
      ) : null}
    </ScrollView>
  );
}
