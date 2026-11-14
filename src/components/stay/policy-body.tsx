import { Text as RNText, View } from "react-native";

import { Text } from "@/components/ui";
import type { PolicyBlock } from "@/lib/stays";

/** Plain text of any block, however odd: spans' text, or a nested `children` walk. Unknown block types end up here. */
function plainText(block: unknown): string {
  if (!block || typeof block !== "object") return "";
  const b = block as { text?: unknown; children?: unknown };
  if (typeof b.text === "string") return b.text;
  if (Array.isArray(b.children)) return b.children.map(plainText).join("");
  return "";
}

function Spans({ block }: { block: PolicyBlock }) {
  return (
    <>
      {(block.children ?? []).map((span, i) =>
        span.marks?.includes("strong") ? (
          <RNText key={span._key ?? i} className="font-jakarta-semibold">
            {span.text}
          </RNText>
        ) : (
          span.text
        ),
      )}
    </>
  );
}

/**
 * A small Portable Text renderer for exactly what the schema allows: normal paragraphs, h3, bullet lists and
 * strong. Anything else renders as its plain text. No dependency; the words are shown as written.
 */
export function PolicyBody({ body }: { body?: PolicyBlock[] | null }) {
  if (!body?.length) return null;
  return (
    <View>
      {body.map((block, i) => {
        const key = block._key ?? String(i);
        const isText = block._type === "block" && Array.isArray(block.children);

        if (!isText) {
          const text = plainText(block);
          return text ? (
            <Text key={key} variant="body" className="mb-3">
              {text}
            </Text>
          ) : null;
        }
        if (block.listItem === "bullet") {
          return (
            <View key={key} className="mb-2 flex-row pl-4">
              <Text variant="body">{"•  "}</Text>
              <Text variant="body" className="flex-1">
                <Spans block={block} />
              </Text>
            </View>
          );
        }
        if (block.style === "h3") {
          return (
            <Text key={key} variant="subtitle" className="mb-1 mt-2">
              <Spans block={block} />
            </Text>
          );
        }
        return (
          <Text key={key} variant="body" className="mb-3">
            <Spans block={block} />
          </Text>
        );
      })}
    </View>
  );
}
