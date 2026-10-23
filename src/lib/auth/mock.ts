// Mocked auth. Same shape as Clerk's flow: Clerk replaces these functions, not the screens.
// Test values: taken@example.com (email in use), 424242 (the only valid code), wrong-password.

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

const DELAY_MS = 800;
const wait = () =>
  new Promise<void>((resolve) => setTimeout(resolve, DELAY_MS));

export const TEST_CODE = "424242";

export async function signUp(input: {
  name: string;
  email: string;
  password: string;
}): Promise<void> {
  await wait();
  if (input.email === "taken@example.com")
    throw new AuthError("That email is already in use.");
}

export async function verifyEmail(input: {
  email: string;
  code: string;
}): Promise<void> {
  await wait();
  if (input.code !== TEST_CODE)
    throw new AuthError(
      "That code isn't right. Check your email and try again.",
    );
}

export async function resendCode(_input: { email: string }): Promise<void> {
  await wait();
}

export async function signIn(input: {
  email: string;
  password: string;
}): Promise<void> {
  await wait();
  if (input.password === "wrong-password")
    throw new AuthError("Email or password is incorrect.");
}

export async function signInWithProvider(
  _provider: "google" | "apple",
): Promise<void> {
  await wait();
}

export function errorMessage(e: unknown): string {
  return e instanceof AuthError
    ? e.message
    : "Something went wrong. Please try again.";
}
