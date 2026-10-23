/** Turns a Clerk error (or anything thrown) into a guest-facing message. */
export function clerkMessage(error: unknown): string {
  const e = error as {
    longMessage?: string;
    message?: string;
    errors?: { longMessage?: string; message?: string }[];
  } | null;
  return (
    e?.errors?.[0]?.longMessage ??
    e?.longMessage ??
    e?.errors?.[0]?.message ??
    e?.message ??
    "Something went wrong. Please try again."
  );
}
