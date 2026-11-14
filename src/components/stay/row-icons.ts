import type { IconName } from "@/components/ui";

export const rowIcons = {
  heart: { ios: "heart", android: "favorite", web: "favorite" },
  heartFill: { ios: "heart.fill", android: "favorite", web: "favorite" },
  chevronLeft: {
    ios: "chevron.left",
    android: "arrow_back",
    web: "arrow_back",
  },
  chevronDown: {
    ios: "chevron.down",
    android: "expand_more",
    web: "expand_more",
  },
  chevronUp: { ios: "chevron.up", android: "expand_less", web: "expand_less" },
  close: { ios: "xmark", android: "close", web: "close" },
  check: { ios: "checkmark", android: "check", web: "check" },
  pin: {
    ios: "mappin.and.ellipse",
    android: "location_on",
    web: "location_on",
  },
} as const satisfies Record<string, IconName>;
