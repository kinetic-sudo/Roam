import { Alert } from "@/components/ui";

/** The first validation or server error, shown above the primary button. */
export function FormError({ message, onDismiss }: { message: string | null; onDismiss?: () => void }) {
  if (!message) return null;
  return <Alert tone="danger" message={message} onDismiss={onDismiss} />;
}