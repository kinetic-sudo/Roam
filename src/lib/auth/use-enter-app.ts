import { useRouter } from "expo-router";

/** Clears the auth stack, then lands on /home so Back can't return to the forms. */
export function useEnterApp() {
  const router = useRouter();
  return () => {
    if (router.canDismiss()) router.dismissAll();
    router.replace("/home");
  };
}