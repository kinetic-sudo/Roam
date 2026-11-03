import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, TextInput, View } from "react-native";
import Animated, { FadeInDown, LayoutAnimationConfig, ReduceMotion } from "react-native-reanimated";

import { searchIcons } from "@/components/search/icons";
import { ResultCard, ResultCardSkeleton } from "@/components/search/result-card";
import { SearchBar } from "@/components/search/search-bar";
import { SearchChips } from "@/components/search/search-chips";
import { SortMenu } from "@/components/search/sort-menu";
import { Button, Icon, PressableScale, Text } from "@/components/ui";
import { usePlaces, useSearchStays } from "@/hooks/use-search-stays";
import { tapImpact } from "@/lib/haptics";
import { parseSearchQuery, type ParsedQuery } from "@/lib/search/parse";
import { chipsFor, isChipOn, searchKey, toggleChip, type SearchChip, type SortOption } from "@/lib/search/query";
import { easeOut, stagger } from "@/theme";

// One builder per row index, at module scope. Capped so a long list doesn't wait seconds.
const MAX_STAGGER_INDEX = 6;
const ROW_IN = Array.from({ length: MAX_STAGGER_INDEX + 1 }, (_, i) =>
  FadeInDown.duration(250).easing(easeOut).delay(i * stagger).reduceMotion(ReduceMotion.System),
);

const cap = (s: string) => s.replace(/\b\w/g, (c) => c.toUpperCase());

export default function Search() {
  const router = useRouter();
  const { q } = useLocalSearchParams<{ q?: string }>();
  const submitted = (q ?? "").trim();

  // The sentence, parsed once the real place names are known.
  const places = usePlaces();
  const base = useMemo(() => parseSearchQuery(submitted, places ?? []), [submitted, places]);
  const baseKey = searchKey(base, "best");

  // Chip toggles are local and reset whenever the query changes (they are tied to the base they were made on).
  const [toggled, setToggled] = useState<{ baseKey: string; query: ParsedQuery } | null>(null);
  const current = toggled && toggled.baseKey === baseKey ? toggled.query : base;
  const [sort, setSort] = useState<SortOption>("best");

  const [text, setText] = useState(submitted);
  const inputRef = useRef<TextInput>(null);

  // Home (or a deep link) can change `q` while this tab is already mounted.
  useEffect(() => {
    setText(submitted);
  }, [submitted]);

  // Opened with nothing typed: put the cursor in the bar. It then shows every stay by rating.
  useFocusEffect(
    useCallback(() => {
      if (submitted) return;
      const id = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(id);
    }, [submitted]),
  );

  const { stays, total, hasResult, status, retry, requestKey } = useSearchStays(current, sort, places !== null);

  const submit = (value: string) => {
    tapImpact();
    router.setParams({ q: value });
  };
  const onToggle = (chip: SearchChip) => setToggled({ baseKey, query: toggleChip(current, chip) });
  const clear = () => {
    setText("");
    router.setParams({ q: "" });
  };

  const showSkeleton = !hasResult && status !== "error";
  const showEmpty = hasResult && status !== "error" && total === 0;
  const constraintBadges = [
    ...(base.place ? [cap(base.place)] : []),
    ...chipsFor(base).filter((c) => !c.suggested && isChipOn(current, c)).map((c) => c.label),
  ];

  return (
    <ScrollView
      className="flex-1 bg-surface"
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      contentContainerClassName="px-4 pb-28 pt-2"
    >
      <View className="flex-row items-center gap-3">
        <PressableScale
          // Search is a tab: this switches to Home instead of popping history.
          onPress={() => router.navigate("/home")}
          accessibilityRole="button"
          accessibilityLabel="Back to Home"
          className="size-13 items-center justify-center rounded-full bg-surface-muted"
        >
          <Icon name={searchIcons.chevronLeft} size={22} />
        </PressableScale>
        <SearchBar ref={inputRef} value={text} onChangeText={setText} onSubmit={submit} />
      </View>

      <SearchChips base={base} current={current} onToggle={onToggle} />

      {hasResult && !showEmpty ? (
        <View className="mt-5 flex-row items-center justify-between">
          <Text variant="lead" accessibilityLiveRegion="polite">
            {total} {total === 1 ? "stay" : "stays"}
          </Text>
          <SortMenu value={sort} onChange={setSort} />
        </View>
      ) : null}

      {status === "error" ? (
        <View className="mt-6 items-center gap-3">
          <Text tone="muted" className="text-center">
            We couldn’t load stays right now.
          </Text>
          <Button title="Try again" variant="secondary" size="sm" onPress={retry} />
        </View>
      ) : null}

      {showSkeleton ? (
        <View className="mt-5 gap-4">
          {[0, 1, 2].map((i) => (
            <ResultCardSkeleton key={i} />
          ))}
        </View>
      ) : null}

      {showEmpty ? (
        <View className="mt-16 items-center gap-3 px-4">
          <Icon name={searchIcons.search} size={36} />
          <Text variant="title" className="text-center">
            No stays match that yet
          </Text>
          {constraintBadges.length > 0 ? (
            <View className="flex-row flex-wrap justify-center gap-2">
              {constraintBadges.map((b) => (
                <View key={b} className="h-8 items-center justify-center rounded-full bg-surface-muted px-3">
                  <Text variant="footnote">{b}</Text>
                </View>
              ))}
            </View>
          ) : null}
          <View className="mt-3 self-stretch">
            <Button title="Clear search" variant="secondary" onPress={clear} />
          </View>
        </View>
      ) : null}

      {hasResult && total > 0 ? (
        // skipEntering: the first paint (cached or not) appears at once; later results stagger in.
        <LayoutAnimationConfig skipEntering>
          <View className="mt-4 gap-4">
            {stays.map((stay, i) => (
              // Keyed by the request: every new query, toggle or sort remounts the rows, so the stagger replays.
              <Animated.View key={`${requestKey}|${stay._id}`} entering={ROW_IN[Math.min(i, MAX_STAGGER_INDEX)]}>
                <ResultCard stay={stay} parsed={current} />
              </Animated.View>
            ))}
          </View>
        </LayoutAnimationConfig>
      ) : null}
    </ScrollView>
  );
}