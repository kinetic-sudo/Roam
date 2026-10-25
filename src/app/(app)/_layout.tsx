import { BlurView } from "expo-blur";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import { TabList, TabSlot, TabTrigger, Tabs, type TabTriggerSlotProps } from "expo-router/ui";
import type { ReactNode } from "react";
import { Platform, View } from "react-native";
import { styled } from "react-native-css";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Icon, PressableScale, Text, type IconName } from "@/components/ui";
import { cn } from "@/lib/cn";
import { tapSelection } from "@/lib/haptics";
import { css, press } from "@/theme";

// Floating glass tab bar (expo-router/ui headless tabs), styled after the iOS 26 Liquid Glass bar.
//   iOS 26+  : real Liquid Glass (GlassView)
//   iOS < 26 : a blurred, frosted capsule (BlurView)
//   Android  : a translucent capsule
// Needs: npx expo install expo-blur, then a native rebuild.

const AnimatedView = styled(Animated.View, { className: "style" });
const StyledGlass = styled(GlassView, { className: "style" });
const StyledBlur = styled(BlurView, { className: "style" });

const icons = {
  home: { ios: "house", android: "home", web: "home" },
  homeFill: { ios: "house.fill", android: "home", web: "home" },
  search: { ios: "magnifyingglass", android: "search", web: "search" },
  trips: { ios: "calendar", android: "calendar_today", web: "calendar_today" },
  profile: { ios: "person", android: "person", web: "person" },
  profileFill: { ios: "person.fill", android: "person", web: "person" },
} as const satisfies Record<string, IconName>;

type TabButtonProps = TabTriggerSlotProps & {
  label: string;
  icon: IconName;
  /** Filled glyph shown while selected (when there is one). */
  selectedIcon?: IconName;
};

/** One tab. The selected one gets a soft grey capsule that fades in (opacity, 150 ms). */
function TabButton({ label, icon, selectedIcon, isFocused, href: _href, style: _style, onPress, ...props }: TabButtonProps) {
  return (
    <View className="flex-1">
      <PressableScale
        {...props}
        onPress={(e) => {
          if (!isFocused) tapSelection(); // same frame as the tab changing
          onPress?.(e);
        }}
        accessibilityRole="tab"
        accessibilityLabel={label}
        accessibilityState={{ selected: !!isFocused }}
        className="h-14 items-center justify-center"
      >
        {/* Selection highlight: ink at 10% opacity, so it reads as a darker patch of the glass. */}
        <AnimatedView
          className="absolute inset-0 rounded-full bg-ink"
          style={{
            opacity: isFocused ? 0.1 : 0,
            transitionProperty: "opacity",
            transitionDuration: press.colorDurationCss,
            transitionTimingFunction: css.easeOut,
          }}
        />
        <Icon name={isFocused && selectedIcon ? selectedIcon : icon} size={24} />
        <Text variant="footnote" className="mt-0.5">
          {label}
        </Text>
      </PressableScale>
    </View>
  );
}

/** The capsule: glass material + position. */
function GlassBar({ children }: { children?: ReactNode }) {
  const insets = useSafeAreaInsets();
  const capsule = "h-16 flex-row items-center rounded-full px-1.5 overflow-hidden border border-glass";

  let bar: ReactNode;
  if (isLiquidGlassAvailable()) {
    bar = <StyledGlass className={capsule}>{children}</StyledGlass>;
  } else if (Platform.OS === "ios") {
    bar = (
      <StyledBlur intensity={70} tint="systemThinMaterialLight" className={capsule}>
        {children}
      </StyledBlur>
    );
  } else {
    bar = <View className={cn(capsule, "bg-glass")}>{children}</View>;
  }

  return (
    <View pointerEvents="box-none" className="absolute inset-x-0 bottom-0 px-3" style={{ paddingBottom: Math.max(insets.bottom - 10, 12) }}>
      {bar}
    </View>
  );
}

export default function AppLayout() {
  return (
    // activityEnabled keeps each tab's state (category, typed search) when you switch away and back.
    <Tabs activityEnabled style={{ flex: 1 }}>
      <TabSlot />
      <TabList asChild>
        <GlassBar>
          <TabTrigger name="home" href="/home" asChild>
            <TabButton label="Home" icon={icons.home} selectedIcon={icons.homeFill} />
          </TabTrigger>
          <TabTrigger name="search" href="/search" asChild>
            <TabButton label="Search" icon={icons.search} />
          </TabTrigger>
          <TabTrigger name="trips" href="/trips" asChild>
            <TabButton label="Trips" icon={icons.trips} />
          </TabTrigger>
          <TabTrigger name="profile" href="/profile" asChild>
            <TabButton label="Profile" icon={icons.profile} selectedIcon={icons.profileFill} />
          </TabTrigger>
        </GlassBar>
      </TabList>
    </Tabs>
  );
}