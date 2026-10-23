import type { IconName } from "@/components/ui";

export const authIcons = {
  person: { ios: "person", android: "person", web: "person" },
  mail: { ios: "envelope", android: "mail", web: "mail" },
  lock: { ios: "lock", android: "lock", web: "lock" },
  eye: { ios: "eye", android: "visibility", web: "visibility" },
  eyeOff: { ios: "eye.slash", android: "visibility_off", web: "visibility_off" },
  arrowLeft: { ios: "chevron.left", android: "arrow_back", web: "arrow_back" },
  arrowRight: { ios: "arrow.right", android: "arrow_forward", web: "arrow_forward" },
  // Material has no Apple logo; phone_iphone is a placeholder (the button is iOS-only).
  apple: { ios: "apple.logo", android: "phone_iphone", web: "phone_iphone" },
} as const satisfies Record<string, IconName>;