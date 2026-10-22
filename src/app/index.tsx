import { Redirect } from "expo-router";

/** Signed-out entry: onboarding first. Signed-in guard replaces this when auth ships. */
export default function Index() {
  return <Redirect href="/onboarding" />;
}
