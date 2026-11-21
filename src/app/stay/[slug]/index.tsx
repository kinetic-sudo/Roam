import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Alert, ScrollView, Share, View, type NativeScrollEvent, type NativeSyntheticEvent } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AmenityRow } from "@/components/stay/amenity-row";
import { FactsRow } from "@/components/stay/facts-row";
import { GoodToKnow } from "@/components/stay/good-to-know";
import { HostRow } from "@/components/stay/host-row";
import { PhotoButton } from "@/components/stay/photo-button";
import { PhotoGallery } from "@/components/stay/photo-gallery";
import { PolicyCard } from "@/components/stay/policy-card";
import { PRICE_BAR_HEIGHT, PriceBar } from "@/components/stay/price-bar";
import { RatingBox } from "@/components/stay/rating-box";
import { StaySkeleton } from "@/components/stay/stay-skeleton";
import { stayIcons } from "@/components/stays/icon";
import { PinIcon } from "@/components/stays/pin-icon";
import { rowIcons } from "@/components/stays/row-icons";
import { Button, Text } from "@/components/ui";
import { useStay } from "@/hooks/use-stay";
import { track } from "@/lib/analytics";
import { useFavorite } from "@/lib/favorites";
import { tapImpact, tapSelection } from "@/lib/haptics";
import { stayFacts } from "@/lib/stay-details";
import { placeLabel } from "@/lib/stays";

/** The page scrolls past the photo (340 pt) under the status bar: switch the status bar to dark a little before. */
const PHOTO_SCROLL = 300;

export default function StayDetails() {
  const params = useLocalSearchParams<{ slug: string }>();
  const slug = (Array.isArray(params.slug) ? params.slug[0] : params.slug) ?? "";
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { stay, status, retry } = useStay(slug);
  const [saved, toggleSaved] = useFavorite(stay?._id ?? "");
  const [pastPhoto, setPastPhoto] = useState(false);

  const type = stay?.type;
  useEffect(() => {
    if (type) track({ name: "stay_viewed", props: { slug, type } });
  }, [slug, type]);

  // Opened from a link there may be nothing to go back to: land on Home.
  const back = () => (router.canGoBack() ? router.back() : router.replace("/home"));

  const backButton = (
    <View className="absolute left-5" style={{ top: insets.top + 4 }}>
      <PhotoButton name={rowIcons.chevronLeft} label="Back" onPress={back} />
    </View>
  );

  if (status === "loading") {
    return (
      <View className="flex-1 bg-surface">
        <StatusBar style="light" />
        <StaySkeleton />
        {backButton}
      </View>
    );
  }

  if (status === "error" || !stay) {
    const failed = status === "error";
    return (
      <View className="flex-1 bg-surface">
        <StatusBar style="dark" />
        <View className="flex-1 items-center justify-center gap-4 px-8">
          <Text variant="body" tone="muted" className="text-center">
            {failed
              ? "We couldn't load this stay. Check your connection and try again."
              : "This stay isn't available anymore."}
          </Text>
          <Button
            title={failed ? "Try again" : "Back"}
            variant="secondary"
            size="sm"
            onPress={failed ? retry : back}
          />
        </View>
        {backButton}
      </View>
    );
  }

  const place = placeLabel(stay);
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => setPastPhoto(e.nativeEvent.contentOffset.y > PHOTO_SCROLL);

  // The cancellation card opens the Policies sheet at the cancellation policy.
  const openCancellation = () => {
    track({ name: "stay_policies_opened", props: { slug, from: "cancellation" } });
    router.push({ pathname: "/stay/[slug]/policies", params: { slug, section: "cancellation" } });
  };

  // "Show all rules" (Good to know) opens the Policies sheet at the top, where the host's additional rules are.
  const showAllRules = () => {
    track({ name: "stay_policies_opened", props: { slug, from: "good_to_know" } });
    router.push({ pathname: "/stay/[slug]/policies", params: { slug } });
  };

  // "Ask about this stay" opens the full-screen chat (stay_ask_opened fires there).
  const openAsk = () => router.push({ pathname: "/stay/[slug]/ask", params: { slug } });

  const share = () => {
    track({ name: "stay_shared", props: { slug } });
    Share.share({ message: `${stay.title} in ${place}, $${stay.pricePerNight} a night on Roam` }).catch(() => {});
  };

  const book = () => {
    tapImpact();
    track({ name: "stay_book_tapped", props: { slug } });
    Alert.alert("Booking opens soon", "You can't book stays in Roam yet.", [{ text: "OK" }]);
  };

  return (
    <View className="flex-1 bg-surface">
      <StatusBar style={pastPhoto ? "dark" : "light"} />

      <ScrollView
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={onScroll}
        contentContainerStyle={{ paddingBottom: PRICE_BAR_HEIGHT + insets.bottom }}
      >
        <PhotoGallery photos={stay.photos} title={stay.title} place={place} />

        <View className="-mt-6 rounded-t-xl bg-surface px-5 pt-6 corner-squircle">
          <View className="flex-row items-start gap-4">
            <Text variant="stayTitle" numberOfLines={3} className="flex-1">
              {stay.title}
            </Text>
            <RatingBox rating={stay.rating} reviewCount={stay.reviewCount} />
          </View>

          <View className="mt-3 flex-row items-center gap-2">
            <PinIcon size={22} className="text-ink" />
            <Text variant="body">{place}</Text>
          </View>

          <FactsRow facts={stayFacts(stay)} />

          <AmenityRow stay={stay} />

          <GoodToKnow rules={stay.houseRules} onShowAll={showAllRules} />

          <View className="mt-2 gap-3">
            <PolicyCard
              tile
              icon={stayIcons.chat}
              title="Ask about this stay"
              subtitle="Cancellation, house rules, pets, check-in and more."
              accessibilityHint="Opens a chat about this stay's policies"
              onPress={openAsk}
            />
            {stay.cancellationPolicy ? (
              <PolicyCard
                icon={stayIcons.policy}
                iconSize={30}
                title={stay.cancellationPolicy.title}
                subtitle={stay.cancellationPolicy.summary}
                accessibilityHint="Opens the cancellation policy"
                onPress={openCancellation}
              />
            ) : null}
          </View>

          {stay.host ? (
            <>
              <View className="mt-4" />
              <HostRow
                host={stay.host}
                onPress={() => {
                  track({ name: "stay_host_opened", props: { slug } });
                  router.push({ pathname: "/stay/[slug]/host", params: { slug } });
                }}
              />
            </>
          ) : null}

          {stay.summary ? (
            <View className="mt-7 pb-4">
              <Text variant="title">About this stay</Text>
              <Text variant="body" tone="muted" className="mt-2">
                {stay.summary}
              </Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

      {/* Pinned over the page while it scrolls */}
      <View className="absolute left-5 right-5 flex-row justify-between" style={{ top: insets.top + 4 }} pointerEvents="box-none">
        <PhotoButton name={rowIcons.chevronLeft} label="Back" onPress={back} />
        <View className="flex-row gap-2.5">
          <PhotoButton name={stayIcons.share} label="Share this stay" onPress={share} />
          <PhotoButton
            name={saved ? rowIcons.heartFill : rowIcons.heart}
            label={saved ? "Remove from saved" : "Save this stay"}
            tone={saved ? "danger" : undefined}
            selected={saved}
            onPress={() => {
              tapSelection();
              toggleSaved();
            }}
          />
        </View>
      </View>

      <PriceBar stay={stay} onBook={book} />
    </View>
  );
}
