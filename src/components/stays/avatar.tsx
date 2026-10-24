import { useUser } from "@clerk/expo";
import { Image } from "expo-image";
import { View } from "react-native";
import { styled } from "react-native-css";

import { Text } from "@/components/ui";

const StyledImage = styled(Image, { className: "style" });

/** Clerk's photo when the guest has set one, otherwise their initial on a soft yellow circle. */
export function Avatar() {
  const { user } = useUser();
  const initial = (user?.firstName ?? user?.primaryEmailAddress?.emailAddress ?? "?").charAt(0).toUpperCase();

  return (
    <View className="size-22 items-center justify-center overflow-hidden rounded-full bg-primary-soft">
      {user?.hasImage ? (
        <StyledImage source={{ uri: user.imageUrl }} contentFit="cover" className="size-full" accessibilityLabel="Your profile photo" />
      ) : (
        <Text variant="heading">{initial}</Text>
      )}
    </View>
  );
}