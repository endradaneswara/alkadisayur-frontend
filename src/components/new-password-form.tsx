"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { ApiError } from "@/services/apiError";
import { resetPassword } from "@/services/passwordService";

interface NewPasswordFormProps {
  email: string;
  otp: string;
}

export function NewPasswordForm({ email, otp }: NewPasswordFormProps) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});
    setErrorMessage(null);
    if (password !== passwordConfirmation) {
      const message = "Konfirmasi password tidak sesuai.";
      setFieldErrors({ password_confirmation: [message] });
      setErrorMessage(message);
      toast.add({ title: "Reset password gagal", description: message, type: "error" });
      return;
    }
    setIsSubmitting(true);
    try {
      await resetPassword({ email, otp, password, password_confirmation: passwordConfirmation });
      toast.add({ title: "Password berhasil diperbarui", description: "Silakan login dengan password baru Anda.", type: "success" });
      router.push("/store/akun/login");
    } catch (cause: unknown) {
      const apiError = cause instanceof ApiError ? cause : null;
      const message = apiError?.message ?? "Reset password gagal. Silakan coba lagi.";
      setFieldErrors(apiError?.errors ?? {});
      setErrorMessage(message);
      toast.add({ title: "Reset password gagal", description: message, type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  }


  return (
    <form onSubmit={handleSubmit} noValidate>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="reset-password">Password baru</FieldLabel>
          <div className="relative">
            <Input id="reset-password" type={showPassword ? "text" : "password"} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} required className="pr-10" aria-invalid={Boolean(fieldErrors.password)} />
            <button type="button" className="absolute top-1/2 right-1 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"} aria-pressed={showPassword}>
              {showPassword ? <EyeOff aria-hidden="true" className="size-4" /> : <Eye aria-hidden="true" className="size-4" />}
            </button>
          </div>
          {fieldErrors.password?.[0] ? <p className="mt-1 text-sm text-destructive" role="alert">{fieldErrors.password[0]}</p> : <FieldDescription>Gunakan minimal 8 karakter.</FieldDescription>}
        </Field>
        <Field>
          <FieldLabel htmlFor="reset-password-confirmation">Konfirmasi password baru</FieldLabel>
          <div className="relative">
            <Input id="reset-password-confirmation" type={showPasswordConfirmation ? "text" : "password"} autoComplete="new-password" value={passwordConfirmation} onChange={(event) => setPasswordConfirmation(event.target.value)} required className="pr-10" aria-invalid={Boolean(fieldErrors.password_confirmation)} />
            <button type="button" className="absolute top-1/2 right-1 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring" onClick={() => setShowPasswordConfirmation((visible) => !visible)} aria-label={showPasswordConfirmation ? "Sembunyikan konfirmasi password" : "Tampilkan konfirmasi password"} aria-pressed={showPasswordConfirmation}>
              {showPasswordConfirmation ? <EyeOff aria-hidden="true" className="size-4" /> : <Eye aria-hidden="true" className="size-4" />}
            </button>
          </div>
          {fieldErrors.password_confirmation?.[0] ? <p className="mt-1 text-sm text-destructive" role="alert">{fieldErrors.password_confirmation[0]}</p> : null}
        </Field>
        {errorMessage ? (
          <Field>
            <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">{errorMessage}</p>
          </Field>
        ) : null}
        <Field>
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Memproses..." : "Simpan password baru"}</Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
