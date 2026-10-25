import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import { TabList, TabSlot, TabTrigger, Tabs, type TabTriggerSlotProps } from "expo-router/ui";
import type { ReactNode } from "react";
import { View } from "react-native";
import { styled } from "react-native-css";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Icon, PressableScale, Text, type IconName } from "@/components/ui";
import { cn } from "@/lib/cn";
import { tapSelection } from "@/lib/haptics";
import { css, press } from "@/theme";

// Custom floating tab bar built on Expo Router's headless tabs (expo-router/ui).
// NativeTabs can't draw the design's floating capsule or the yellow circle behind the selected tab.

const AnimatedView = styled(Animated.View, { className: "style" });
const StyledGlass = styled(GlassView, { className: "style" });

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

/** One tab: the yellow circle fades in behind the selected tab (opacity, 150 ms). */
function TabButton({ label, icon, selectedIcon, isFocused, href: _href, style: _style, onPress, ...props }: TabButtonProps) {
  return (
    <PressableScale
      {...props}
      onPress={(e) => {
        if (!isFocused) tapSelection(); // same frame as the tab changing
        onPress?.(e);
      }}
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: !!isFocused }}
      className="size-18 items-center justify-center"
    >
      <AnimatedView
        className="absolute inset-0 rounded-full bg-primary"
        style={{
          opacity: isFocused ? 1 : 0,
          transitionProperty: "opacity",
          transitionDuration: press.colorDurationCss,
          transitionTimingFunction: css.easeOut,
        }}
      />
      <Icon name={isFocused && selectedIcon ? selectedIcon : icon} size={26} />
      <Text variant="footnote" className="mt-0.5">
        {label}
      </Text>
    </PressableScale>
  );
}

/** The floating capsule. Real Liquid Glass on iOS 26, a translucent bar elsewhere. */
function FloatingBar({ children }: { children?: ReactNode }) {
  const insets = useSafeAreaInsets();
  const row = "h-20 flex-row items-center justify-around rounded-full px-3";

  return (
    <View pointerEvents="box-none" className="absolute inset-x-0 bottom-0 px-4" style={{ paddingBottom: Math.max(insets.bottom, 12) }}>
      {isLiquidGlassAvailable() ? (
        <StyledGlass className={row}>{children}</StyledGlass>
      ) : (
        <View className={cn(row, "border border-border bg-glass shadow-overlay")}>{children}</View>
      )}
    </View>
  );
}

export default function AppLayout() {
  return (
    // activityEnabled keeps each tab's state (category, typed search) when you switch away and back.
    <Tabs activityEnabled style={{ flex: 1 }}>
      <TabSlot />
      <TabList asChild>
        <FloatingBar>
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
        </FloatingBar>
      </TabList>
    </Tabs>
  );
}