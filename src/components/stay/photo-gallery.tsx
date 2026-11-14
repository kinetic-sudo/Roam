import { Image } from "expo-image";
import { useState } from "react";
import { FlatList, useWindowDimensions, View, type NativeScrollEvent, type NativeSyntheticEvent } from "react-native";
import { styled } from "react-native-css";

import { stayIcons } from "@/components/stays/icon";
import { Icon, Text } from "@/components/ui";
import { imageUrl } from "@/lib/sanity";
import type { StayPhoto } from "@/lib/stays";

const StyledImage = styled(Image, { className: "style" });

type Photo = { url: string; alt: string };

/** Full-width paging gallery with an "n / total" counter. Native paging scroll: the counter swaps with no animation. */
export function PhotoGallery({ photos, title, place }: { photos: StayPhoto[]; title: string; place: string }) {
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);

  const items: Photo[] = photos.flatMap((p, i) =>
    p.asset?.url ? [{ url: p.asset.url, alt: p.alt || `${title}, ${place}. Photo ${i + 1}` }] : [],
  );

  const onEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(e.nativeEvent.contentOffset.x / width);
    setIndex(Math.min(Math.max(next, 0), items.length - 1));
  };

  return (
    <View className="h-87 bg-surface-muted">
      {items.length === 0 ? (
        // 14 seeded stays have no photo yet.
        <View className="flex-1 items-center justify-center">
          <Icon name={stayIcons.homeFill} size={48} tone="subtle" />
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(p) => p.url}
            getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
            onMomentumScrollEnd={onEnd}
            renderItem={({ item }) => (
              <StyledImage
                source={{ uri: imageUrl(item.url, 1200) }}
                contentFit="cover"
                transition={200}
                style={{ width }}
                className="h-full"
                accessibilityLabel={item.alt}
              />
            )}
          />
          <View
            accessible
            accessibilityLabel={`Photo ${index + 1} of ${items.length}`}
            className="absolute bottom-3 right-3 h-8.5 justify-center rounded-full bg-ink/80 px-3.5"
          >
            <Text variant="subtitle" tone="inverse">
              {index + 1} / {items.length}
            </Text>
          </View>
        </>
      )}
    </View>
  );
}
