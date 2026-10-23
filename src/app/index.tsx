import { useAuth } from "@clerk/expo";
import { Redirect } from "expo-router";

// The router's anchor: lands signed-in guests on /home and everyone else on /onboarding.
// Sign-in, verification and sign-out all end up here when the session changes.
export default function Index() {
  const { isSignedIn } = useAuth();
  return <Redirect href={isSignedIn ? "/home" : "/onboarding"} />;
}