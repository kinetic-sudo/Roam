import { useLocalSearchParams } from "expo-router";
import { useState, type ReactNode } from "react";
import { ScrollView, View } from "react-native";

import {
  Alert,
  Badge,
  Button,
  Chip,
  Icon,
  IconButton,
  SegmentedControl,
  Stepper,
  Text,
  TextField,
  Toggle,
  type IconName,
  type TextVariant,
} from "@/components/ui";
// Design system preview. Replace with the real home screen when it exists.
// `?y=<offset>` opens it scrolled (a screenshot aid).

// Class strings are literal so Tailwind can detect them.
const palette = [
  { name: "primary", label: "Primary Yellow", cls: "bg-primary" },
  { name: "lavender", label: "Lavender", cls: "bg-lavender" },
  { name: "ink", label: "Text Primary", cls: "bg-ink" },
  { name: "ink-muted", label: "Text Secondary", cls: "bg-ink-muted" },
  { name: "surface", label: "Surface White", cls: "bg-surface" },
  { name: "surface-muted", label: "Surface Gray", cls: "bg-surface-muted" },
  { name: "border", label: "Border Gray", cls: "bg-border" },
  { name: "glass", label: "Glass Blur", cls: "bg-glass" },
] as const;

const estimated = [
  { name: "ink-subtle", cls: "bg-ink-subtle" },
  { name: "lavender-soft", cls: "bg-lavender-soft" },
  { name: "accent", cls: "bg-accent" },
  { name: "primary-soft", cls: "bg-primary-soft" },
  { name: "success", cls: "bg-success" },
  { name: "success-soft", cls: "bg-success-soft" },
  { name: "danger", cls: "bg-danger" },
  { name: "danger-soft", cls: "bg-danger-soft" },
  { name: "promo-soft", cls: "bg-promo-soft" },
  { name: "info", cls: "bg-info" },
  { name: "info-soft", cls: "bg-info-soft" },
] as const;

const ramp: { variant: TextVariant; sample: string }[] = [
  { variant: "display", sample: "Find your next stay" },
  { variant: "heading", sample: "Modern Cabin with Hot Tub" },
  { variant: "title", sample: "Modern Cabin with Hot Tub" },
  { variant: "subtitle", sample: "Free cancellation" },
  { variant: "body", sample: "From mountain cabins to oceanfront villas, roam helps you find unforgettable stays." },
  { variant: "label", sample: "Pet Friendly" },
  { variant: "button", sample: "Book this stay" },
  { variant: "buttonSecondary", sample: "Continue with Google" },
  { variant: "caption", sample: "Lake Arrowhead, CA" },
  { variant: "footnote", sample: "Search · Trips · Profile" },
];

const radii = [
  { name: "sm", cls: "rounded-sm" },
  { name: "md", cls: "rounded-md" },
  { name: "lg", cls: "rounded-lg" },
  { name: "xl", cls: "rounded-xl" },
  { name: "full", cls: "rounded-full" },
] as const;

const shadows = [
  { name: "card", cls: "shadow-card" },
  { name: "raised", cls: "shadow-raised" },
  { name: "overlay", cls: "shadow-overlay" },
] as const;

const symbols: { label: string; name: IconName }[] = [
  { label: "home", name: { ios: "house", android: "home", web: "home" } },
  { label: "search", name: { ios: "magnifyingglass", android: "search", web: "search" } },
  { label: "heart", name: { ios: "heart", android: "favorite", web: "favorite" } },
  { label: "calendar", name: { ios: "calendar", android: "calendar_month", web: "calendar_month" } },
  { label: "person", name: { ios: "person", android: "person", web: "person" } },
  { label: "settings", name: { ios: "gearshape", android: "settings", web: "settings" } },
  { label: "pin", name: { ios: "mappin", android: "location_on", web: "location_on" } },
  { label: "filters", name: { ios: "slider.horizontal.3", android: "tune", web: "tune" } },
];

const iconHome: IconName = { ios: "house", android: "home", web: "home" };
const iconTent: IconName = { ios: "tent", android: "cabin", web: "cabin" };
const iconWaves: IconName = { ios: "water.waves", android: "waves", web: "waves" };
const iconCity: IconName = { ios: "building.2", android: "apartment", web: "apartment" };
const iconUmbrella: IconName = { ios: "beach.umbrella", android: "beach_access", web: "beach_access" };
const iconPerson: IconName = { ios: "person", android: "person", web: "person" };
const iconLock: IconName = { ios: "lock", android: "lock", web: "lock" };
const iconSearch: IconName = { ios: "magnifyingglass", android: "search", web: "search" };
const iconFilters: IconName = { ios: "slider.horizontal.3", android: "tune", web: "tune" };
const iconArrow: IconName = { ios: "arrow.right", android: "arrow_forward", web: "arrow_forward" };
const iconStar: IconName = { ios: "star.fill", android: "star", web: "star" };
const iconHeart: IconName = { ios: "heart", android: "favorite", web: "favorite" };
const iconShare: IconName = { ios: "square.and.arrow.up", android: "share", web: "share" };
const iconBookmark: IconName = { ios: "bookmark", android: "bookmark", web: "bookmark" };
const iconList: IconName = { ios: "list.bullet", android: "list", web: "list" };
const iconMap: IconName = { ios: "map", android: "map", web: "map" };

function Section({ number, title, children }: { number: string; title: string; children: ReactNode }) {
  return (
    <View className="gap-5 rounded-xl bg-surface p-6 corner-squircle">
      <Text variant="title">
        {number}. {title}
      </Text>
      {children}
    </View>
  );
}

function chunk<T>(items: readonly T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    rows.push(items.slice(i, i + size));
  }
  return rows;
}

function SwatchGrid({ swatches }: { swatches: readonly { label: string; cls: string }[] }) {
  return (
    <View className="gap-6">
      {chunk(swatches, 3).map((row, rowIndex) => (
        <View key={rowIndex} className="flex-row gap-4">
          {row.map((s) => (
            <View key={s.label} className="flex-1 gap-2">
              <View className={`h-14 rounded-lg border border-border corner-squircle ${s.cls}`} />
              <Text variant="footnote" className="text-center">
                {s.label}
              </Text>
            </View>
          ))}
          {row.length < 3
            ? Array.from({ length: 3 - row.length }, (_, padIndex) => (
                <View key={`pad-${rowIndex}-${padIndex}`} className="flex-1" />
              ))
            : null}
        </View>
      ))}
    </View>
  );
}

function Swatch({ name, cls }: { name: string; cls: string }) {
  return (
    <View className="flex-1 gap-2">
      <View className={`h-14 rounded-md border border-border corner-squircle ${cls}`} />
      <Text variant="footnote" className="text-center">
        {name}
      </Text>
    </View>
  );
}

export default function Index() {
  const { y } = useLocalSearchParams<{ y?: string }>();
  const [rowOne, setRowOne] = useState("Cabins");
  const [rowTwo, setRowTwo] = useState("All Stays");
  const [view, setView] = useState<"list" | "map">("list");
  const [petFriendly, setPetFriendly] = useState(true);
  const [guests, setGuests] = useState(2);
  const [showSuccess, setShowSuccess] = useState(true);
  const [showError, setShowError] = useState(true);

  return (
    <ScrollView
      className="flex-1 bg-surface-muted"
      contentContainerClassName="gap-6 px-5 pb-8 pt-2"
      contentInsetAdjustmentBehavior="automatic"
      contentOffset={{ x: 0, y: Number(y) || 0 }}
    >
      <Section number="01" title="Brand">
        {/* Placeholder: the real wordmark asset is not in assets/ yet. */}
        <Text variant="brand">roam</Text>
        <Text tone="muted">Find unforgettable stays for every kind of trip.</Text>
      </Section>

      <Section number="02" title="Color palette">
        <SwatchGrid swatches={palette} />
        <Text variant="caption" tone="muted">
          Estimated from the image (not in the palette):
        </Text>
        <View className="gap-6">
          {chunk(estimated, 3).map((row, rowIndex) => (
            <View key={rowIndex} className="flex-row gap-4">
              {row.map((s) => (
                <Swatch key={s.name} {...s} />
              ))}
              {row.length < 3
                ? Array.from({ length: 3 - row.length }, (_, padIndex) => (
                    <View key={`est-pad-${rowIndex}-${padIndex}`} className="flex-1" />
                  ))
                : null}
            </View>
          ))}
        </View>
      </Section>

      <Section number="03" title="Typography">
        {ramp.map((r) => (
          <View key={r.variant} className="gap-1">
            <Text variant="footnote" tone="subtle">
              {r.variant}
            </Text>
            <Text variant={r.variant}>{r.sample}</Text>
          </View>
        ))}
      </Section>

      <Section number="04" title="Buttons">
        <Button title="Book this stay" trailingIcon={<Icon name={iconArrow} />} />
        <Button
          title="Continue with Google"
          variant="secondary"
          // Placeholder: the Google "G" logo asset is not in assets/ yet.
          icon={<Text variant="subtitle">G</Text>}
        />
        <Button title="Small" size="sm" />
        <Button title="Loading" loading />
        <Button title="Disabled" disabled />
        <View className="flex-row gap-4">
          <IconButton name={iconHeart} accessibilityLabel="Save" />
          <IconButton name={iconShare} accessibilityLabel="Share" />
          <IconButton name={iconSearch} accessibilityLabel="Search" />
          <IconButton name={iconBookmark} accessibilityLabel="Bookmark" />
        </View>
        <View className="flex-row items-center gap-4 rounded-lg bg-ink p-4 corner-squircle">
          <IconButton variant="surface" size="sm" name={iconHeart} accessibilityLabel="Save" />
          <IconButton variant="ghost" size="sm" tone="inverse" name={iconShare} accessibilityLabel="Share" />
          <Text variant="caption" tone="inverse">
            surface + ghost
          </Text>
        </View>
      </Section>

      <Section number="05" title="Input fields">
        <TextField
          icon={<Icon name={iconSearch} />}
          placeholder="Cabins in California"
          accessory={<IconButton variant="ghost" size="sm" name={iconFilters} accessibilityLabel="Filters" />}
        />
        <TextField icon={<Icon name={iconPerson} />} placeholder="Enter your name" />
        {/* Tap to see the focused state (lavender border + soft fill). */}
        <TextField icon={<Icon name={iconPerson} />} defaultValue="Joanna Smith" />
        <TextField icon={<Icon name={iconLock} />} placeholder="Password" secure defaultValue="password1" />
      </Section>

      <Section number="06" title="Filter chips">
        <View className="flex-row flex-wrap gap-3">
          {["Cabins", "Under $300", "Pet Friendly", "Quiet"].map((label) => (
            <Chip key={label} label={label} selected={rowOne === label} onPress={() => setRowOne(label)} />
          ))}
        </View>
        <View className="flex-row flex-wrap gap-3">
          {[
            { label: "All Stays", icon: iconHome },
            { label: "Cabins", icon: iconTent },
            { label: "Beach", icon: iconWaves },
            { label: "City", icon: iconCity },
            { label: "Villas", icon: iconUmbrella },
          ].map(({ label, icon }) => (
            <Chip
              key={label}
              size="sm"
              tone="primary"
              label={label}
              icon={<Icon name={icon} size={20} />}
              selected={rowTwo === label}
              onPress={() => setRowTwo(label)}
            />
          ))}
        </View>
      </Section>

      <Section number="15" title="Tags / badges">
        <View className="flex-row flex-wrap gap-3">
          <Badge label="Guest favorite" tone="primary" icon={<Icon name={iconStar} size={16} />} />
          <Badge label="New" tone="success" />
          <Badge label="20% off" tone="promo" />
          <Badge label="Superhost" tone="info" />
        </View>
      </Section>

      <Section number="14" title="Status / alerts">
        {showSuccess ? (
          <Alert message="Account created successfully" onDismiss={() => setShowSuccess(false)} />
        ) : null}
        {showError ? (
          <Alert
            tone="danger"
            message="Something went wrong. Please try again."
            onDismiss={() => setShowError(false)}
          />
        ) : null}
        {!showSuccess && !showError ? (
          <Button
            title="Show alerts again"
            variant="secondary"
            size="sm"
            onPress={() => {
              setShowSuccess(true);
              setShowError(true);
            }}
          />
        ) : null}
      </Section>

      <Section number="12" title="Segmented control">
        <SegmentedControl
          value={view}
          onChange={setView}
          options={[
            { value: "list", label: "List", icon: iconList },
            { value: "map", label: "Map", icon: iconMap },
          ]}
        />
      </Section>

      <Section number="13" title="Toggles / stepper">
        <View className="flex-row items-center justify-between">
          <Text>Pet friendly</Text>
          <Toggle accessibilityLabel="Pet friendly" value={petFriendly} onValueChange={setPetFriendly} />
        </View>
        <View className="flex-row items-center justify-between">
          <Text>Guests</Text>
          <Stepper accessibilityLabel="Guests" value={guests} onChange={setGuests} min={1} max={8} />
        </View>
      </Section>

      <Section number="11" title="Iconography">
        <View className="flex-row flex-wrap gap-4">
          {symbols.map((s) => (
            <View key={s.label} className="w-20 items-center gap-1">
              <Icon name={s.name} />
              <Text variant="footnote">{s.label}</Text>
            </View>
          ))}
        </View>
      </Section>

      <Section number="--" title="Radius & shadow">
        <View className="flex-row flex-wrap gap-4">
          {radii.map((r) => (
            <View key={r.name} className="items-center gap-1">
              <View className={`size-16 bg-lavender corner-squircle ${r.cls}`} />
              <Text variant="footnote">{r.name}</Text>
            </View>
          ))}
        </View>
        <View className="flex-row flex-wrap gap-6 rounded-lg bg-surface-muted p-5 corner-squircle">
          {shadows.map((s) => (
            <View key={s.name} className="items-center gap-2">
              <View className={`size-16 rounded-lg bg-surface corner-squircle ${s.cls}`} />
              <Text variant="footnote">{s.name}</Text>
            </View>
          ))}
        </View>
      </Section>
    </ScrollView>
  );
}
