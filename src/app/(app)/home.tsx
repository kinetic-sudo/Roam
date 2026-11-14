import { useUser } from "@clerk/expo";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import Animated, { FadeIn, FadeOut, LayoutAnimationConfig, LinearTransition, ReduceMotion } from "react-native-reanimated";

import { CategoryChips, type Category } from "@/components/home/category-chips";
import { SearchPrompt, SUGGESTION } from "@/components/stay/search-prompt";
import { Avatar } from "@/components/stays/avatar";
import { stayIcons } from "@/components/stays/icon";
import { PropertyCard, PropertyCardSkeleton } from "@/components/stays/property-card";
import { Button, Icon, PressableScale, Text } from "@/components/ui";
import { useHomeStays } from "@/hooks/use-home-stays";
import { tapImpact } from "@/lib/haptics";
import { easeInOut } from "@/theme";

// Layout-animation builders live at module scope: rebuilding them in render costs every re-render.
const CARD_IN = FadeIn.duration(200).reduceMotion(ReduceMotion.System);
const CARD_OUT = FadeOut.duration(150).reduceMotion(ReduceMotion.System);
const CARD_REFLOW = LinearTransition.duration(250).easing(easeInOut).reduceMotion(ReduceMotion.System);

export default function Home() {
  const router = useRouter();
  const { user } = useUser();
  const [category, setCategory] = useState<Category>("all");
  const [prompt, setPrompt] = useState("");

  const { stays, status, retry } = useHomeStays();
  const visible = useMemo(
    () => (category === "all" ? stays : stays.filter((s) => s.type === category)),
    [stays, category],
  );

  const send = (q: string) => {
    tapImpact(); // same frame as the navigation starting
    router.navigate({ pathname: "/search", params: { q } });
  };

  return (
    // First child is the ScrollView, so the native tab bar's insets apply automatically.
    <ScrollView
      className="flex-1 bg-surface"
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      contentContainerClassName="px-5 pb-32 pt-2"
    >
      <View className="flex-row items-center justify-between">
       <Text variant="hero">Roam</Text>
        <Avatar />
      </View>

      <Text variant="title" tone="muted" className="mt-3">
        {user?.firstName ? `Hey, ${user.firstName} 👋` : "Hey there 👋"}
      </Text>

      <View className="mt-1 flex-row items-center gap-4">
                <Text variant="headline" className="flex-1">
          {"Find your\nnext stay"}
        </Text>
        <PressableScale
          onPress={() => router.navigate({ pathname: "/search", params: { q: "" } })}
          accessibilityRole="button"
          accessibilityLabel="Search stays"
          className="h-22 w-16 items-center justify-center rounded-xl bg-surface-muted corner-squircle"
        >
          <Icon name={stayIcons.search} size={26} />
        </PressableScale>
      </View>

      <View className="mt-5">
        <SearchPrompt value={prompt} onChangeText={setPrompt} onSubmit={send} fallback={SUGGESTION} />
      </View>

      <View className="mt-5">
        <CategoryChips value={category} onChange={setCategory} />
      </View>

      {status === "loading" ? (
        <View className="mt-7 gap-5">
          <PropertyCardSkeleton />
          <PropertyCardSkeleton />
          <PropertyCardSkeleton />
        </View>
      ) : status === "error" ? (
        <View className="mt-10 items-center gap-4">
          <Text variant="body" tone="muted" className="text-center">
            {"We couldn't load stays. Check your connection and try again."}
          </Text>
          <Button title="Try again" variant="secondary" size="sm" onPress={retry} />
        </View>
      ) : visible.length === 0 ? (
        <Text variant="body" tone="muted" className="mt-10 text-center">
          No stays here yet.
        </Text>
      ) : (
        // skipEntering: the first render shows the cards at once; only category changes animate.
        <LayoutAnimationConfig skipEntering>
          <View className="mt-7 gap-5">
            {visible.map((s) => (
              <Animated.View key={s._id} entering={CARD_IN} exiting={CARD_OUT} layout={CARD_REFLOW}>
                <PropertyCard stay={s} />
              </Animated.View>
            ))}
          </View>
        </LayoutAnimationConfig>
      )}
    </ScrollView>
  );
}