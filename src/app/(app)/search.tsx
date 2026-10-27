import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, TextInput, View } from "react-native";
import Animated, { FadeInDown, LinearTransition, ReduceMotion } from "react-native-reanimated";

import { highlightTags } from "@/components/stays/amenities";
import { stayIcons } from "@/components/stays/icons";
import { PropertyRow } from "@/components/stays/property-row";
import { QueryChips } from "@/components/stays/query-chips";
import { rowIcons } from "@/components/stays/row-icons";
import { SearchField } from "@/components/stays/search-feilds";
import { SortControl } from "@/components/stays/sort-control";
import { Button, Icon, PressableScale, Text } from "@/components/ui";
import { tapImpact } from "@/lib/haptics";
import { parseQuery } from "@/lib/search/parse";
import { describeQuery, queryChips, searchProperties, sortProperties, type SortKey } from "@/lib/search/search";
import { easeInOut, easeOut, stagger } from "@/theme";

// One builder per row index, at module scope. Index is capped so a long list doesn't wait seconds.
const MAX_STAGGER_INDEX = 6;
const ROW_IN = Array.from({ length: MAX_STAGGER_INDEX + 1 }, (_, i) =>
  FadeInDown.duration(250).easing(easeOut).delay(i * stagger).reduceMotion(ReduceMotion.System),
);
// When the sort order changes, rows glide to their new place.
const ROW_REFLOW = LinearTransition.duration(250).easing(easeInOut).reduceMotion(ReduceMotion.System);

export default function Search() {
  const router = useRouter();
  const { q } = useLocalSearchParams<{ q?: string }>();
  const query = (q ?? "").trim();

  const [text, setText] = useState(query);
  const [sort, setSort] = useState<SortKey>("best");
  const inputRef = useRef<TextInput>(null);

  // Home (or a deep link) can change `q` while this tab is already mounted.
  useEffect(() => {
    setText(query);
  }, [query]);

  // Opened without a query: put the cursor in the field.
  useFocusEffect(
    useCallback(() => {
      if (query) return;
      const id = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(id);
    }, [query]),
  );

  const parsed = useMemo(() => parseQuery(query), [query]);
  const results = useMemo(() => sortProperties(searchProperties(parsed), sort), [parsed, sort]);
  const chips = useMemo(() => queryChips(parsed), [parsed]);

  const submit = (value: string) => {
    tapImpact();
    router.setParams({ q: value.trim() });
  };

  const clear = () => {
    setText("");
    router.setParams({ q: "" });
    inputRef.current?.focus();
  };

  const constraints = describeQuery(parsed);

  return (
    <ScrollView
      className="flex-1 bg-surface"
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      contentContainerClassName="px-5 pb-28 pt-2"
    >
      <View className="flex-row items-center gap-3">
        <PressableScale
          onPress={() => router.navigate("/home")}
          accessibilityRole="button"
          accessibilityLabel="Back to Home"
          className="size-13 items-center justify-center rounded-full bg-surface-muted"
        >
          <Icon name={rowIcons.chevronLeft} size={22} />
        </PressableScale>
        <SearchField ref={inputRef} value={text} onChangeText={setText} onSubmit={submit} onClear={clear} />
      </View>

      <QueryChips chips={chips} />

      {results.length > 0 ? (
        <>
          <SortControl count={results.length} value={sort} onChange={setSort} />
          <View className="mt-5 gap-6">
            {results.map((p, i) => (
              // Keyed by query: every new search remounts the rows, so the stagger replays.
              // Re-sorting keeps the keys, so the rows move instead.
              <Animated.View key={`${query}|${p.id}`} entering={ROW_IN[Math.min(i, MAX_STAGGER_INDEX)]} layout={ROW_REFLOW}>
                <PropertyRow property={p} tags={highlightTags(p, parsed)} />
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