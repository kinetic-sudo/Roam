import { Wordmark } from "@/components/brand/wordmark";
import { GoogleMark } from "@/components/onboarding/onboarding-google-mark";
import { LocationPill } from "@/components/onboarding/onboarding-location-pill";
import { CURVE_HEIGHT, SheetCurve } from "@/components/onboarding/onboarding-sheet-curve";
import { PageDots } from "@/components/onboarding/onboardingb-page-dots";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { onboardingSlides as SLIDES } from "@/lib/onboarding/slides";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Pressable, ScrollView, View, useWindowDimensions, type NativeScrollEvent, type NativeSyntheticEvent } from "react-native";
import { styled } from "react-native-css"; // adjust to the project's `styled` import
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const StyledImage = styled(Image, { className: "style" });
const StyledGlass = styled(GlassView, { className: "style" });

const FADE_IN = FadeIn.duration(250); // motion.base
const FADE_OUT = FadeOut.duration(150);

function SkipPill({ onPress }: { onPress: () => void }) {
  const label = (
    <Text variant="buttonSecondary" className="text-ink">
      Skip
    </Text>
  );
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel="Skip onboarding" hitSlop={8}>
      {isLiquidGlassAvailable() ? (
        <StyledGlass className="h-10 items-center justify-center overflow-hidden rounded-full px-4">{label}</StyledGlass>
      ) : (
        <View className="h-10 items-center justify-center rounded-full bg-glass px-4">{label}</View>
      )}
    </Pressable>
  );
}

export default function Onboarding() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [sheetHeight, setSheetHeight] = useState(360);
  const slide = SLIDES[index];

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(e.nativeEvent.contentOffset.x / width);
    setIndex(Math.min(Math.max(next, 0), SLIDES.length - 1));
  };

  return (
    <View className="flex-1 bg-surface">
      <StatusBar style="dark" />

      {/* Photos: one full-screen page per slide, with its location pill */}
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        contentInsetAdjustmentBehavior="never"
        onMomentumScrollEnd={onMomentumEnd}
        className="absolute inset-0"
        style={{ width, height }}
      >
        {SLIDES.map((s) => (
          <View key={s.id} style={{ width, height }}>
            <StyledImage source={{ uri: s.imageUrl }} contentFit="cover" transition={200} className="absolute inset-0" accessibilityLabel={s.location} />
            <View className="absolute left-6" style={{ bottom: sheetHeight + 20 }}>
              <LocationPill label={s.location} />
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Fixed header */}
      <View className="absolute inset-x-0 top-0 flex-row items-center justify-between px-6" style={{ paddingTop: insets.top + 16 }}>
        <Wordmark />
        <SkipPill onPress={() => router.push("/sign-in")} />
      </View>

      {/* Fixed bottom sheet */}
      <View className="absolute inset-x-0 bottom-0" onLayout={(e) => setSheetHeight(e.nativeEvent.layout.height)}>
        <SheetCurve />
        <View className="absolute inset-x-0 bottom-0 bg-surface" style={{ top: CURVE_HEIGHT - 1 }} />
        <View className="px-6 pt-7" style={{ paddingBottom: Math.max(insets.bottom, 24) }}>
          <View className="px-1.5">
            <PageDots count={SLIDES.length} index={index} />
            <Animated.View key={slide.id} entering={FADE_IN} exiting={FADE_OUT}>
              <Text variant="hero" className="mt-6 text-ink">
                {slide.title}
              </Text>
              <Text variant="lead" tone="muted" className="mt-3">
                {slide.body}
              </Text>
            </Animated.View>
          </View>
          <View className="mt-4 gap-3">
          <Button
  title="Get started"
  trailingIcon={
    <View className="absolute right-6">
      <Icon name={{ ios: "arrow.right", android: "arrow_forward", web: "arrow_forward" }} size={20} />
    </View>
  }
  onPress={() => router.push("/sign-up")}
/>
<Button
  variant="secondary"
  title="Continue with Google"
  icon={<GoogleMark />}
  onPress={() => router.push("/sign-in")}
/>
          </View>
        </View>
      </View>
    </View>
  );
}