import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, TextInput, View } from "react-native";
import Animated, { FadeInDown, ReduceMotion } from "react-native-reanimated";

import { stayIcons } from "@/components/stays/icons";
import { PropertyCard } from "@/components/stays/property-card";
import { SearchPrompt } from "@/components/stays/search-prompt";
import { Button, Icon, Text } from "@/components/ui";
import { tapImpact } from "@/lib/haptics";
import { parseQuery } from "@/lib/search/parse";
import { describeQuery, searchProperties } from "@/lib/search/search";
import { easeOut, stagger } from "@/theme";

// One builder per row index, at module scope. Index is capped so a long list doesn't wait seconds.
const MAX_STAGGER_INDEX = 6;
const ROW_IN = Array.from({ length: MAX_STAGGER_INDEX + 1 }, (_, i) =>
  FadeInDown.duration(250).easing(easeOut).delay(i * stagger).reduceMotion(ReduceMotion.System),
);

export default function Search() {
  const router = useRouter();
  const { q } = useLocalSearchParams<{ q?: string }>();
  const query = (q ?? "").trim();

  const [text, setText] = useState(query);
  const inputRef = useRef<TextInput>(null);

  // Home (or a deep link) can change `q` while this tab is already mounted.
  useEffect(() => {
    setText(query);
  }, [query]);

  // Opened without a query: put the cursor in the bar.
  useFocusEffect(
    useCallback(() => {
      if (query) return;
      const id = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(id);
    }, [query]),
  );

  const parsed = useMemo(() => parseQuery(query), [query]);
  const results = useMemo(() => searchProperties(parsed), [parsed]);

  const submit = (value: string) => {
    tapImpact();
    router.setParams({ q: value.trim() });
  };

  const clear = () => {
    setText("");
    router.setParams({ q: "" });
  };

  const constraints = describeQuery(parsed);

  return (
    <ScrollView
      className="flex-1 bg-surface"
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      contentContainerClassName="px-5 pb-32 pt-2"
    >
      <SearchPrompt ref={inputRef} value={text} onChangeText={setText} onSubmit={submit} />

      {results.length > 0 ? (
        <>
          <Text variant="caption" tone="muted" className="mt-4">
            {results.length} {results.length === 1 ? "stay" : "stays"}
          </Text>
          <View className="mt-4 gap-5">
            {results.map((p, i) => (
              // Keyed by query: every new search remounts the rows, so the stagger replays.
              <Animated.View key={`${query}|${p.id}`} entering={ROW_IN[Math.min(i, MAX_STAGGER_INDEX)]}>
                <PropertyCard property={p} />
              </Animated.View>
            ))}
          </View>
        </>
      ) : (
        <View className="mt-16 items-center gap-3 px-4">
          <Icon name={stayIcons.search} size={36} />
          <Text variant="title" className="text-center">
            No stays match
          </Text>
          {constraints.length > 0 ? (
            <Text tone="muted" className="text-center">
              We looked for: {constraints.join(" · ")}
            </Text>
          ) : null}
          <View className="mt-3 self-stretch">
            <Button title="Clear search" variant="secondary" onPress={clear} />
          </View>
        </View>
      )}
    </ScrollView>
  );
}