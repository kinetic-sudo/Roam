import { router } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  FlatList,
  Pressable,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ViewToken,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { OnboardingPrimaryCta } from "@/components/onboarding/onboarding-primary-cta";
import { OnboardingProgress } from "@/components/onboarding/onboarding-progress";
import { OnboardingSlidePage } from "@/components/onboarding/onboarding-slide-page";
import { Button, Icon, Text } from "@/components/ui";
import { onboardingSlides } from "@/lib/onboarding/slides";

const iconArrow = { ios: "arrow.right", android: "arrow_forward", web: "arrow_forward" } as const;

function goToSignUp(provider?: "google") {
  if (provider === "google") {
    router.push({ pathname: "/sign-up", params: { provider: "google" } });
    return;
  }
  router.push("/sign-up");
}

export default function OnboardingScreen() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<(typeof onboardingSlides)[number]>>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const imageHeight = Math.round(height * 0.52);
  const slide = onboardingSlides[activeIndex]!;

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const index = viewableItems[0]?.index;
      if (index != null) {
        setActiveIndex(index);
      }
    },
    [],
  );

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 60 }).current;

  const onMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveIndex(index);
  };

  return (
    <View className="flex-1 bg-surface">
      <View style={{ height: imageHeight }} className="relative">
        <FlatList
          ref={listRef}
          data={onboardingSlides}
          keyExtractor={(item) => item.location}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          onMomentumScrollEnd={onMomentumScrollEnd}
          renderItem={({ item }) => (
            <OnboardingSlidePage slide={item} width={width} imageHeight={imageHeight} />
          )}
        />

        <View
          pointerEvents="box-none"
          className="absolute inset-x-0 top-0 flex-row items-center justify-between px-5"
          style={{ paddingTop: insets.top + 8 }}
        >
          <Text variant="brand">roam</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Skip onboarding"
            onPress={() => goToSignUp()}
            className="rounded-full bg-glass px-4 py-2 active:opacity-70"
          >
            <Text variant="label" tone="muted">
              Skip
            </Text>
          </Pressable>
        </View>
      </View>

      <View className="-mt-6 flex-1 rounded-t-xl bg-surface px-5 pt-8 shadow-overlay corner-squircle">
        <OnboardingProgress count={onboardingSlides.length} activeIndex={activeIndex} className="mb-8" />

        <View className="gap-3">
          <Text variant="hero">{slide.title}</Text>
          <Text variant="lead" tone="muted">
            {slide.body}
          </Text>
        </View>

        <View className="mt-auto gap-3 pb-2" style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
          <OnboardingPrimaryCta title="Get started" onPress={() => goToSignUp()} />
          <Button
            title="Continue with Google"
            variant="secondary"
            icon={
              // Placeholder until the Google "G" logo asset is in assets/.
              <Text variant="subtitle" tone="accent">
                G
              </Text>
            }
            onPress={() => goToSignUp("google")}
          />
        </View>
      </View>
    </View>
  );
}
