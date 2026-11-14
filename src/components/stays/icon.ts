import type { IconName } from "@/components/ui";

// Restored: used by Home (category chips, prompt bar, cards). The new Search screen has its own icons in
// src/components/search/icons.ts. The two files must stay separate.
// { ios: SF Symbol, android: Material Symbol, web: Material Symbol }
export const stayIcons = {
  sparkles: { ios: "sparkles", android: "auto_awesome", web: "auto_awesome" },
  arrowUpRight: {
    ios: "arrow.up.right",
    android: "north_east",
    web: "north_east",
  },
  search: { ios: "magnifyingglass", android: "search", web: "search" },
  star: { ios: "star.fill", android: "star", web: "star" },
  marker: { ios: "mappin", android: "location_on", web: "location_on" },
  chevronRight: {
    ios: "chevron.right",
    android: "chevron_right",
    web: "chevron_right",
  },
  chevronLeft: {
    ios: "chevron.left",
    android: "chevron_left",
    web: "chevron_left",
  },
  // Stay details. Check each SF name draws in the simulator; substitute and mark any that do not.
  share: { ios: "square.and.arrow.up", android: "share", web: "share" },
  chat: { ios: "bubble.left", android: "chat_bubble_outline", web: "chat_bubble_outline" },
  policy: { ios: "doc.text", android: "description", web: "description" },
  rosette: { ios: "rosette", android: "workspace_premium", web: "workspace_premium" },
  // Chip glyphs (filled where SF has them).
  homeFill: { ios: "house.fill", android: "home", web: "home" },
  cabin: { ios: "tree.fill", android: "cabin", web: "cabin" },
  beach: { ios: "water.waves", android: "waves", web: "waves" },
  city: { ios: "building.2.fill", android: "apartment", web: "apartment" },
  // No palm tree in SF Symbols or Material: marked substitute.
  villa: { ios: "beach.umbrella.fill", android: "villa", web: "villa" },
  calendar: {
    ios: "calendar",
    android: "calendar_today",
    web: "calendar_today",
  },
} as const satisfies Record<string, IconName>;
