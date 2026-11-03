import type { IconName } from "@/components/ui";
import type { TagKey } from "@/lib/search/query";

// { ios: SF Symbol, android: Material Symbol, web: Material Symbol }.
// Not every SF name has been drawn on a device: if one shows blank, swap it here.
export const searchIcons = {
  search: { ios: "magnifyingglass", android: "search", web: "search" },
  filters: { ios: "slider.horizontal.3", android: "tune", web: "tune" },
  chevronLeft: {
    ios: "chevron.left",
    android: "chevron_left",
    web: "chevron_left",
  },
  chevronDown: {
    ios: "chevron.down",
    android: "expand_more",
    web: "expand_more",
  },
  heart: { ios: "heart", android: "favorite", web: "favorite" },
  heartFill: { ios: "heart.fill", android: "favorite", web: "favorite" },
  marker: { ios: "mappin", android: "location_on", web: "location_on" },
  home: { ios: "house", android: "home", web: "home" },
} as const satisfies Record<string, IconName>;

// The design shows a Wi-Fi glyph on "Pool" and a mountain on "Ocean View": both look like mistakes,
// so the tags use the real glyphs.
export const tagIcons: Record<TagKey, IconName> = {
  hotTub: { ios: "bathtub", android: "hot_tub", web: "hot_tub" },
  pool: { ios: "figure.pool.swim", android: "pool", web: "pool" },
  sauna: { ios: "humidity.fill", android: "sauna", web: "sauna" },
  fireplace: { ios: "fireplace.fill", android: "fireplace", web: "fireplace" },
  firePit: {
    ios: "flame.fill",
    android: "local_fire_department",
    web: "local_fire_department",
  },
  oceanView: { ios: "water.waves", android: "waves", web: "waves" },
  lakeView: { ios: "water.waves", android: "waves", web: "waves" },
  mountainView: {
    ios: "mountain.2.fill",
    android: "landscape",
    web: "landscape",
  },
  beachAccess: {
    ios: "beach.umbrella",
    android: "beach_access",
    web: "beach_access",
  },
  pets: { ios: "pawprint.fill", android: "pets", web: "pets" },
  workspace: { ios: "desktopcomputer", android: "desk", web: "desk" },
  wifi: { ios: "wifi", android: "wifi", web: "wifi" },
  kitchen: { ios: "fork.knife", android: "kitchen", web: "kitchen" },
  ac: { ios: "snowflake", android: "ac_unit", web: "ac_unit" },
  parking: { ios: "car.fill", android: "local_parking", web: "local_parking" },
  washer: {
    ios: "washer.fill",
    android: "local_laundry_service",
    web: "local_laundry_service",
  },
  bbq: { ios: "flame", android: "outdoor_grill", web: "outdoor_grill" },
  evCharger: { ios: "bolt.car.fill", android: "ev_station", web: "ev_station" },
};
