import { useSignUp } from "@clerk/expo";
import { Redirect, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";

import { AuthFooter } from "@/components/auth/auth-footer";
import { AuthScreen } from "@/components/auth/auth-screen";
import { CodeInput } from "@/components/auth/code-input";
import { FormError } from "@/components/auth/form-error";
import { Alert, Button } from "@/components/ui";
import { clerkMessage } from "@/lib/auth/clerk-error";
import { firstError, validateCode } from "@/lib/auth/validate";

const RESEND_SECONDS = 30;

export default function Verify() {
  const { email } = useLocalSearchParams<{ email?: string }>();
  const { signUp } = useSignUp();

  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [seconds, setSeconds] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (seconds <= 0) return;
    const id = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [seconds]);

  // Arrived without an email (e.g. a deep link): start over.
  if (!email) return <Redirect href="/sign-up" />;

  const submit = async (digits: string) => {
    if (submitting) return;
    const found = validateCode(digits);
    if (found.code) {
      setError(firstError(found, ["code"]));
      return;
    }

    setSubmitting(true);
    setNotice(null);
    try {
      const verified = await signUp.verifications.verifyEmailCode({ code: digits });
      if (verified.error) {
        setError(clerkMessage(verified.error));
        setSubmitting(false);
        return;
      }
      if (signUp.status !== "complete") {
        setError("We couldn’t finish creating your account. Please start again.");
        setSubmitting(false);
        return;
      }

      // Turns the finished sign-up into the active (and saved) session.
      // The route guard then moves the guest to /home; no manual navigation needed.
      const finalized = await signUp.finalize();
      if (finalized.error) {
        setError(clerkMessage(finalized.error));
        setSubmitting(false);
      }
    } catch (e) {
      setError(clerkMessage(e));
      setSubmitting(false);
    }
  };

  const onChange = (digits: string) => {
    setCode(digits);
    setError(null);
    if (digits.length === 6) submit(digits); // auto-submit on the 6th digit
  };

  const resend = async () => {
    if (seconds > 0 || resending) return;
    setResending(true);
    try {
      const sent = await signUp.verifications.sendEmailCode();
      if (sent.error) {
        setError(clerkMessage(sent.error));
        return;
      }
      setCode("");
      setError(null);
      setNotice(`We sent a new code to ${email}.`);
      setSeconds(RESEND_SECONDS);
    } catch (e) {
      setError(clerkMessage(e));
    } finally {
      setResending(false);
    }
  };

  const countdown = `Resend in 0:${String(seconds).padStart(2, "0")}`;

  return (
    <AuthScreen
      title={"Check your\nemail"}
      body={`We sent a 6-digit code to ${email}. Enter it below to finish creating your account.`}
      footer={
        <AuthFooter
          prompt="Didn't get a code?"
          action={seconds > 0 ? countdown : "Resend"}
          disabled={seconds > 0 || resending}
          onPress={resend}
        />
      }
    >
      <CodeInput value={code} onChangeText={onChange} invalid={!!error} editable={!submitting} />

      <View className="mt-6 gap-3">
        {notice ? <Alert message={notice} onDismiss={() => setNotice(null)} /> : null}
        <FormError message={error} onDismiss={() => setError(null)} />
        <Button title="Verify" loading={submitting} onPress={() => submit(code)} />
      </View>
    </AuthScreen>
  );
}