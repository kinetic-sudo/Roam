// Pure client-side validation. Returns a field -> message map (empty when valid).
export type Errors<K extends string> = Partial<Record<K, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateSignUp(v: {
  name: string;
  email: string;
  password: string;
}) {
  const e: Errors<"name" | "email" | "password"> = {};
  if (!v.name.trim()) e.name = "Enter your full name.";
  if (!EMAIL.test(v.email.trim())) e.email = "Enter a valid email address.";
  if (v.password.length < 8)
    e.password = "Password must be at least 8 characters.";
  return e;
}

export function validateSignIn(v: { email: string; password: string }) {
  const e: Errors<"email" | "password"> = {};
  if (!EMAIL.test(v.email.trim())) e.email = "Enter a valid email address.";
  if (!v.password) e.password = "Enter your password.";
  return e;
}

export function validateCode(code: string) {
  const e: Errors<"code"> = {};
  if (!/^\d{6}$/.test(code)) e.code = "Enter the 6-digit code.";
  return e;
}

/** First message in field order, for the single alert above the button. */
export function firstError(
  errors: Record<string, string | undefined>,
  order: string[],
): string | null {
  for (const k of order) if (errors[k]) return errors[k] as string;
  return null;
}
