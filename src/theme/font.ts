import {
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_700Bold,
} from "@expo-google-fonts/plus-jakarta-sans";

/**
 * Font files to load at runtime (useFonts works in Expo Go and on web).
 * Keys are the family names referenced by --font-brand* in src/global.css —
 * keep the two in sync.
 */
export const fontAssets = {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_700Bold,
};

/** For native chrome that cannot take className (e.g. stack header title). */
export const headerFontFamily = "PlusJakartaSans_700Bold";
