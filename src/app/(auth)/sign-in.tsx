import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { TextInput, View } from "react-native";

import { AuthScreen } from "@/components/auth/auth-screen";
import { AuthFooter } from "@/components/auth/footer";
import { FormError } from "@/components/auth/form-error";
import { authIcons } from "@/components/auth/icons";
import { LabeledField } from "@/components/auth/labeled-field";
import { OrDivider } from "@/components/auth/or-divider";
import { SocialButtons } from "@/components/auth/social-buttons";
import { Button, Icon } from "@/components/ui";
import { errorMessage, signIn } from "@/lib/auth/mock";
import { useEnterApp } from "@/lib/auth/use-enter-app";
import { firstError, validateSignIn } from "@/lib/auth/validate";

type Field = "email" | "password";

export default function SignIn() {
  const router = useRouter();
  const enterApp = useEnterApp();
  const passwordRef = useRef<TextInput>(null);

  const [values, setValues] = useState({ email: "", password: "" });
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
    const found = validateSignIn(values);
    if (Object.keys(found).length) {
      setErrors(found);
      setFormError(firstError(found, ["email", "password"]));
      return;
    }
    setSubmitting(true);
    try {
      await signIn({ email: values.email.trim().toLowerCase(), password: values.password });
      enterApp();
    } catch (e) {
      setFormError(errorMessage(e));
      setSubmitting(false);
    }
  };

  return (
    <AuthScreen
      title={"Welcome\nback"}
      body="Sign in to see your saved stays and pick up where you left off."
      footer={<AuthFooter prompt="New to roam?" action="Create an account" onPress={() => router.replace("/sign-up")} />}
    >
      <View className="gap-3.5">
        <LabeledField
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
          placeholder="Your password"
          secure
          value={values.password}
          onChangeText={set("password")}
          invalid={!!errors.password}
          editable={!submitting}
          autoCapitalize="none"
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="done"
          onSubmitEditing={submit}
        />
      </View>

      <View className="mt-6 gap-3">
        <FormError message={formError} onDismiss={() => setFormError(null)} />
        <Button title="Sign in" loading={submitting} trailingIcon={<Icon name={authIcons.arrowRight} />} onPress={submit} />
      </View>

      <OrDivider />
      <SocialButtons disabled={submitting} onSuccess={enterApp} onError={setFormError} />
    </AuthScreen>
  );
}