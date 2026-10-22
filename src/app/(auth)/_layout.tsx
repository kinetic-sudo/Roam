import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerShadowVisible: false,
        headerBackTitle: "Back",
        contentStyle: { backgroundColor: "white" },
      }}
    >
      <Stack.Screen name="sign-up" options={{ title: "Sign up" }} />
      <Stack.Screen name="sign-in" options={{ title: "Sign in" }} />
    </Stack>
  );
}
