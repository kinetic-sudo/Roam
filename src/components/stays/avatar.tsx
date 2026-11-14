import { useUser } from "@clerk/expo";
import { Image } from "expo-image";
import { View } from "react-native";
import { styled } from "react-native-css";

import { Text } from "@/components/ui";
import { cn } from "@/lib/cn";
import { imageUrl } from "@/lib/sanity";

const StyledImage = styled(Image, { className: "style" });

const sizes = {
  md: { box: "size-16", text: "title" }, // 64: the host row
  lg: { box: "size-22", text: "heading" }, // 88: Home, the host sheet
} as const;

type Props = {
  size?: keyof typeof sizes;
  /** A person other than the signed-in guest (a host). Leave out for the guest's own avatar. */
  name?: string;
  /** That person's photo (a Sanity image URL), if they have one. */
  uri?: string | null;
  className?: string;
};

/**
 * With no `name`: Clerk's photo for the signed-in guest, otherwise their initial on a soft yellow circle.
 * With a `name`: that person's photo through `imageUrl(uri, 200)`, otherwise their initial.
 */
export function Avatar({ size = "lg", name, uri, className }: Props) {
  const { user } = useUser();
  const own = name === undefined;

  const photo = own ? (user?.hasImage ? user.imageUrl : null) : uri ? imageUrl(uri, 200) : null;
  const initial = (own ? (user?.firstName ?? user?.primaryEmailAddress?.emailAddress ?? "?") : name.trim() || "?")
    .charAt(0)
    .toUpperCase();

  return (
    <View
      className={cn(
        sizes[size].box,
        "items-center justify-center overflow-hidden rounded-full bg-primary-soft",
        className,
      )}
    >
      {photo ? (
        <StyledImage
          source={{ uri: photo }}
          contentFit="cover"
          className="size-full"
          accessibilityLabel={own ? "Your profile photo" : `${name}'s photo`}
        />
      ) : (
        <Text variant={sizes[size].text}>{initial}</Text>
      )}
    </View>
  );
}
