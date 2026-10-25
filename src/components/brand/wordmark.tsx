import { Text } from "@/components/ui/text";

// PLACEHOLDER: replace with the real roam wordmark asset.
// md = onboarding and auth header, xl = Home header.
export function Wordmark({ size = "md" }: { size?: "md" | "xl" }) {
  return (
    <Text variant={size === "xl" ? "wordmarkXl" : "wordmark"} className="text-ink">
      roam
    </Text>
  );
}