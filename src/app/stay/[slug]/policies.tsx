import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";

import { PolicyBody } from "@/components/stay/policy-body";
import { Text } from "@/components/ui";
import { useStay } from "@/hooks/use-stay";
import { houseRuleLines, sortPolicies } from "@/lib/stay-details";

/**
 * The stay's house rules, its cancellation policy, then Roam's other policies, each with its full body.
 * `?section=cancellation` opens it scrolled to the cancellation section (the measured onLayout y).
 */
export default function PoliciesSheet() {
  const params = useLocalSearchParams<{ slug: string; section?: string }>();
  const slug = (Array.isArray(params.slug) ? params.slug[0] : params.slug) ?? "";
  const section = Array.isArray(params.section) ? params.section[0] : params.section;
  const { stay, status } = useStay(slug);

  const scrollRef = useRef<ScrollView>(null);
  const [cancellationY, setCancellationY] = useState<number | null>(null);

  useEffect(() => {
    if (section === "cancellation" && cancellationY !== null) {
      scrollRef.current?.scrollTo({ y: cancellationY, animated: false });
    }
  }, [section, cancellationY]);

  if (!stay) {
    return (
      <View className="flex-1 items-center justify-center bg-surface px-5">
        {status === "loading" ? (
          <ActivityIndicator className="text-ink" />
        ) : (
          <Text variant="body" tone="muted" className="text-center">
            {"We couldn't load the policies."}
          </Text>
        )}
      </View>
    );
  }

  const rules = houseRuleLines(stay.houseRules);
  const others = sortPolicies(stay.policies);

  return (
    <ScrollView
      ref={scrollRef}
      className="flex-1 bg-surface"
      contentInsetAdjustmentBehavior="never"
      contentContainerClassName="px-5 pb-10 pt-6"
    >
      <Text variant="heading">Policies</Text>

      <View className="mt-6">
        <Text variant="title" className="mb-3">
          House rules
        </Text>
        <View className="gap-2">
          {rules.map((line, i) => (
            <Text key={`${i}-${line}`} variant="body">
              {line}
            </Text>
          ))}
        </View>
      </View>

      {stay.cancellationPolicy ? (
        <View className="mt-6" onLayout={(e) => setCancellationY(e.nativeEvent.layout.y)}>
          <Text variant="title" className="mb-3">
            {stay.cancellationPolicy.title}
          </Text>
          <PolicyBody body={stay.cancellationPolicy.body} />
        </View>
      ) : null}

      {others.map((policy) => (
        <View key={policy._id} className="mt-6">
          <Text variant="title" className="mb-3">
            {policy.title}
          </Text>
          <PolicyBody body={policy.body} />
        </View>
      ))}

      <Text variant="footnote" tone="subtle" className="mt-8">
        {"These are Roam's policies and this stay's own rules, shown as written. Questions? Contact Roam support."}
      </Text>
    </ScrollView>
  );
}
