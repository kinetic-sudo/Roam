import { useSignUp } from "@clerk/expo";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { TextInput, View } from "react-native";

import { AuthScreen } from "@/components/auth/auth-screen";
import { AuthFooter } from "@/components/auth/footer";
import { FormError } from "@/components/auth/form-error";
import { authIcons } from "@/components/auth/icons";
import { LabeledField } from "@/components/auth/Labeled-field";
import { OrDivider } from "@/components/auth/Or-divider";
import { SocialButtons } from "@/components/auth/Social-button";
import { Button, Icon } from "@/components/ui";
import { clerkMessage } from "@/lib/auth/clerk-error";
import { firstError, validateSignUp } from "@/lib/auth/validate";

type Field = "name" | "email" | "password";

export default function SignUp() {
  const router = useRouter();
  const { signUp } = useSignUp();
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const [values, setValues] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const set = (field: Field) => (text: string) => {
    setValues((v) => ({ ...v, [field]: text }));
    setErrors((e) => ({ ...e, [field]: undefined }));
    setFormError(null);
  };

  const submit = async () => {
    if (submitting) return;
    const found = validateSignUp(values);
    if (Object.keys(found).length) {
      setErrors(found);
      setFormError(firstError(found, ["name", "email", "password"]));
      return;
    }

    setSubmitting(true);
    try {
      const emailAddress = values.email.trim().toLowerCase();
      const [firstName, ...rest] = values.name.trim().split(/\s+/);
      const lastName = rest.join(" ");

      // 1. Create the sign-up attempt.
      const created = await signUp.password({
        emailAddress,
        password: values.password,
        firstName,
        lastName: lastName || undefined,
      });
      if (created.error) {
        setFormError(clerkMessage(created.error));
        return;
      }

      // 2. Email the 6-digit code, then move to the verify screen.
      const sent = await signUp.verifications.sendEmailCode();
      if (sent.error) {
        setFormError(clerkMessage(sent.error));
        return;
      }
      router.push({ pathname: "/verify", params: { email: emailAddress } });
    } catch (e) {
      setFormError(clerkMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthScreen
      title={"Create\nyour account"}
      body="Join roam to save your stays, get personalized recommendations and access them across all your devices."
      footer={<AuthFooter prompt="Already have an account?" action="Sign in" onPress={() => router.replace("/sign-in")} />}
    >
      <View className="gap-3.5">
        <LabeledField
          label="Full name"
          icon={authIcons.person}
          placeholder="e.g. Adrian Hajdin"
          value={values.name}
          onChangeText={set("name")}
          invalid={!!errors.name}
          editable={!submitting}
          autoCapitalize="words"
          autoComplete="name"
          textContentType="name"
          returnKeyType="next"
          onSubmitEditing={() => emailRef.current?.focus()}
        />
        <LabeledField
          ref={emailRef}
          label="Email address"
          icon={authIcons.mail}
          placeholder="you@example.com"
          value={values.email}
          onChangeText={set("email")}
          invalid={!!errors.email}
          editable={!submitting}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
        />
        <LabeledField
          ref={passwordRef}
          label="Password"
          icon={authIcons.lock}
          placeholder="At least 8 characters"
          secure
          value={values.password}
          onChangeText={set("password")}
          invalid={!!errors.password}
          editable={!submitting}
          autoCapitalize="none"
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="done"
          onSubmitEditing={submit}
        />
      </View>

      <View className="mt-6 gap-3">
        <FormError message={formError} onDismiss={() => setFormError(null)} />
        <Button title="Create account" loading={submitting} trailingIcon={<Icon name={authIcons.arrowRight} />} onPress={submit} />
      </View>

      <OrDivider />
      <SocialButtons disabled={submitting} onError={setFormError} />
    </AuthScreen>
  );
}