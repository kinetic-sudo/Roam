import { ScrollView, View } from "react-native";

import { Button } from "@/components/button";
import { Text } from "@/components/text";

// Class strings are literal so Tailwind can detect them.
const swatches = [
  { name: "primary", hex: "#FFC629", cls: "bg-primary" },
  { name: "secondary", hex: "#C9B4FF", cls: "bg-secondary" },
  { name: "foreground", hex: "#0B0B1A", cls: "bg-foreground" },
  { name: "muted-foreground", hex: "#6B7280", cls: "bg-muted-foreground" },
  { name: "surface", hex: "#FFFFFF", cls: "bg-surface" },
  { name: "background", hex: "#F4F5F7", cls: "bg-background" },
  { name: "border", hex: "#E5E7EB", cls: "bg-border" },
  { name: "success-soft", hex: "est.", cls: "bg-success-soft" },
  { name: "danger-soft", hex: "est.", cls: "bg-danger-soft" },
  { name: "info-soft", hex: "est.", cls: "bg-info-soft" },
] as const;

const radii = [
  { name: "sm 8", cls: "rounded-sm" },
  { name: "md 12", cls: "rounded-md" },
  { name: "lg 16", cls: "rounded-lg" },
  { name: "xl 24", cls: "rounded-xl" },
  { name: "full", cls: "rounded-full" },
] as const;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="gap-4 rounded-xl bg-surface p-6">
      <Text variant="heading">
        {title}
      </Text>
      {children}
    </View>
  );
}

export default function Index() {
  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="gap-4 p-4"
      contentInsetAdjustmentBehavior="automatic"
    >
      <Section title="Brand">
        <Text variant="display">roam</Text>
        <Text tone="muted">Find unforgettable stays for every kind of trip.</Text>
      </Section>

      <Section title="Colors">
        <View className="flex-row flex-wrap gap-4">
          {swatches.map((s) => (
            <View key={s.name} className="w-24 gap-1">
              <View className={`h-12 rounded-md border border-border ${s.cls}`} />
              <Text variant="caption">
                {s.name}
              </Text>
              <Text variant="caption">
                {s.hex}
              </Text>
            </View>
          ))}
        </View>
      </Section>

      <Section title="Typography">
        <Text variant="display">Find your next stay</Text>
        <Text variant="heading">Modern Cabin with Hot Tub</Text>
        <Text variant="body">
          From mountain cabins to oceanfront villas, roam helps you find
          unforgettable stays for every kind of trip.
        </Text>
        <Text variant="caption">Lake Arrowhead, CA</Text>
        <Text variant="button">Book this stay</Text>
      </Section>

      <Section title="Buttons">
        <Button title="Book this stay" />
        <Button title="Continue with Google" variant="secondary" />
        <Button title="Loading" loading />
        <Button title="Disabled" disabled />
      </Section>

      <Section title="Radii">
        <View className="flex-row flex-wrap gap-4">
          {radii.map((r) => (
            <View key={r.name} className="items-center gap-1">
              <View className={`size-16 bg-secondary ${r.cls}`} />
              <Text variant="caption">{r.name}</Text>
            </View>
          ))}
        </View>
      </Section>
    </ScrollView>
  );
}