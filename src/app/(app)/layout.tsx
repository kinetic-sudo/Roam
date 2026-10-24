import { DefaultTheme, ThemeProvider } from "expo-router/react-navigation";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useUnstableNativeVariable } from "nativewind";

// The platform's real tab bar (Liquid Glass on iOS 26, Material 3 on Android).
// Switching tabs is native and never animated by us: it happens 100+ times a day.
export default function AppLayout() {
  // Selected tint comes from the token, never a hex.
  const ink = useUnstableNativeVariable("--color-ink");

  return (
    <ThemeProvider value={DefaultTheme}>
      <NativeTabs tintColor={ink as string | undefined}>
        <NativeTabs.Trigger name="home">
          <NativeTabs.Trigger.Icon sf={{ default: "house", selected: "house.fill" }} md="home" />
          <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>

        {/* A plain tab (no role="search"): the design keeps search inside Home's prompt bar. */}
        <NativeTabs.Trigger name="search">
          <NativeTabs.Trigger.Icon sf="magnifyingglass" md="search" />
          <NativeTabs.Trigger.Label>Search</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="trips">
          <NativeTabs.Trigger.Icon sf="calendar" md="calendar_today" />
          <NativeTabs.Trigger.Label>Trips</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="profile">
          <NativeTabs.Trigger.Icon sf={{ default: "person", selected: "person.fill" }} md="person" />
          <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      </NativeTabs>
    </ThemeProvider>
  );
}