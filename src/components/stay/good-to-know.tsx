import { View } from "react-native";

import { tagIcons } from "@/components/search/icons";
import { stayIcons } from "@/components/stays/icon";
import { Icon, PressableScale, Text, type IconName } from "@/components/ui";
import { houseRuleParts, type HouseRuleKey } from "@/lib/stay-details";
import type { HouseRules } from "@/lib/stays";

/** Every rule uses the same glyph whether it is allowed or not: the text says which. */
const RULE_ICON: Record<Exclude<HouseRuleKey, "extra">, IconName> = {
  checkIn: stayIcons.clock,
  checkOut: stayIcons.clock,
  quiet: stayIcons.moon,
  pets: tagIcons.pets,
  smoking: stayIcons.smoking,
  parties: stayIcons.party,
};

/**
 * The stay's key house rules, shown directly: check-in, checkout, quiet hours (when set), pets, smoking, parties.
 * Each line is the Policies sheet's own text. The host's additional rules are not listed: when there are any, a
 * "Show all rules" link opens the sheet. The divider under the section is part of it.
 */
export function GoodToKnow({ rules, onShowAll }: { rules: HouseRules; onShowAll: () => void }) {
  const parts = houseRuleParts(rules);
  const rows = parts.filter((p): p is { key: Exclude<HouseRuleKey, "extra">; text: string } => p.key !== "extra");
  const hasMore = parts.some((p) => p.key === "extra");
  if (rows.length === 0) return null;

  return (
    <>
      <View className="mt-5 gap-3">
        <Text variant="title">Good to know</Text>
        <View className="gap-2.5">
          {rows.map((r) => (
            <View key={r.key} className="flex-row items-center gap-3">
              <Icon name={RULE_ICON[r.key]} size={20} tone="ink" />
              <Text variant="body" className="flex-1">
                {r.text}
              </Text>
            </View>
          ))}
        </View>
        {hasMore ? (
          <View className="self-start">
            <PressableScale onPress={onShowAll} hitSlop={8} accessibilityRole="link" accessibilityLabel="Show all rules">
              <Text variant="link" tone="accent">
                Show all rules
              </Text>
            </PressableScale>
          </View>
        ) : null}
      </View>
      <View className="mt-5 h-px bg-border" />
    </>
  );
}
