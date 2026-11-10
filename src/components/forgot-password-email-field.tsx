import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

interface ForgotPasswordEmailFieldProps {
  email: string;
  error?: string;
  onEmailChange: (email: string) => void;
}

export function ForgotPasswordEmailField({
  email,
  error,
  onEmailChange,
}: ForgotPasswordEmailFieldProps) {
  return (
    <Field>
      <FieldLabel htmlFor="forgot-email">Email</FieldLabel>
      <Input
        id="forgot-email"
        type="email"
        value={email}
        onChange={(event) => onEmailChange(event.target.value)}
        placeholder="m@example.com"
        required
        autoComplete="email"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? "forgot-email-error" : undefined}
      />
      {error ? (
        <p
          id="forgot-email-error"
          role="alert"
          className="mt-1 text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}
    </Field>
  );
}
