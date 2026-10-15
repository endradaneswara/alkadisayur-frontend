"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { ApiError } from "@/services/apiError";
import { resetPassword } from "@/services/passwordService";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(() => searchParams.get("email") ?? "");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!/^\d{6}$/.test(otp)) {
      const message = "Masukkan kode OTP 6 digit.";
      setFieldErrors({ otp: ["Masukkan kode OTP 6 digit."] });
      setErrorMessage(message);
      toast.add({ title: "Reset password gagal", description: message, type: "error" });
      return;
    }

    if (password !== passwordConfirmation) {
      const message = "Konfirmasi password tidak sesuai.";
      setFieldErrors({
        password_confirmation: [message],
      });
      setErrorMessage(message);
      toast.add({ title: "Reset password gagal", description: message, type: "error" });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await resetPassword({
        email: email.trim(),
        otp,
        password,
        password_confirmation: passwordConfirmation,
      });
      const message = response.message || "Password berhasil diperbarui.";
      setSuccessMessage(message);
      toast.add({
        title: "Password berhasil diperbarui",
        description: "Silakan login dengan password baru Anda.",
        type: "success",
      });
    } catch (error: unknown) {
      let message: string;

      if (error instanceof ApiError) {
        setFieldErrors(error.errors ?? {});
        message = error.message;
      } else {
        message =
          error instanceof Error
            ? error.message
            : "Reset password gagal. Silakan coba lagi.";
      }
      setErrorMessage(message);
      toast.add({
        title: "Reset password gagal",
        description: message,
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Reset password</CardTitle>
        <CardDescription>
          Masukkan kode OTP yang dikirim ke email Anda dan buat password baru.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {successMessage ? (
          <FieldGroup>
            <Field>
              <p className="rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-sm text-foreground">
                {successMessage}
              </p>
            </Field>
            <Field>
              <Button nativeButton={false} render={<Link href="/store/akun/login" />}>
                Kembali ke login
              </Button>
            </Field>
          </FieldGroup>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <FieldGroup>
              <Field data-invalid={Boolean(fieldErrors.email)}>
                <FieldLabel htmlFor="reset-email">Email</FieldLabel>
                <Input
                  id="reset-email"
                  type="email"
                  autoComplete="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  aria-invalid={Boolean(fieldErrors.email)}
                />
                {fieldErrors.email?.[0] ? (
                  <p className="text-sm text-destructive">
                    {fieldErrors.email[0]}
                  </p>
                ) : null}
              </Field>
              <Field data-invalid={Boolean(fieldErrors.otp)}>
                <FieldLabel htmlFor="reset-otp">Kode OTP</FieldLabel>
                <InputOTP
                  id="reset-otp"
                  maxLength={6}
                  pattern="^[0-9]+$"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={otp}
                  onChange={setOtp}
                  aria-invalid={Boolean(fieldErrors.otp)}
                >
                  <InputOTPGroup>
                    {Array.from({ length: 6 }, (_, index) => (
                      <InputOTPSlot key={index} index={index} />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
                {fieldErrors.otp?.[0] ? (
                  <p className="text-sm text-destructive">
                    {fieldErrors.otp[0]}
                  </p>
                ) : (
                  <FieldDescription>
                    Masukkan 6 digit kode yang dikirim ke email Anda.
                  </FieldDescription>
                )}
              </Field>
              <Field data-invalid={Boolean(fieldErrors.password)}>
                <FieldLabel htmlFor="reset-password">Password baru</FieldLabel>
                <Input
                  id="reset-password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  aria-invalid={Boolean(fieldErrors.password)}
                />
                {fieldErrors.password?.[0] ? (
                  <p className="text-sm text-destructive">
                    {fieldErrors.password[0]}
                  </p>
                ) : (
                  <FieldDescription>
                    Gunakan minimal 8 karakter.
                  </FieldDescription>
                )}
              </Field>
              <Field data-invalid={Boolean(fieldErrors.password_confirmation)}>
                <FieldLabel htmlFor="reset-password-confirmation">
                  Konfirmasi password baru
                </FieldLabel>
                <Input
                  id="reset-password-confirmation"
                  type="password"
                  autoComplete="new-password"
                  value={passwordConfirmation}
                  onChange={(event) =>
                    setPasswordConfirmation(event.target.value)
                  }
                  required
                  aria-invalid={Boolean(fieldErrors.password_confirmation)}
                />
                {fieldErrors.password_confirmation?.[0] ? (
                  <p className="text-sm text-destructive">
                    {fieldErrors.password_confirmation[0]}
                  </p>
                ) : null}
              </Field>
              {errorMessage ? (
                <Field>
                  <p
                    className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
                    role="alert"
                  >
                    {errorMessage}
                  </p>
                </Field>
              ) : null}
              <Field>
                <Button disabled={isSubmitting} type="submit">
                  {isSubmitting ? "Memproses..." : "Simpan password baru"}
                </Button>
                <FieldDescription className="text-center">
                  <Link href="/store/akun/forgot-password">
                    Minta kode OTP baru
                  </Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          className="self-center font-heading text-xl font-bold tracking-tight text-primary"
          href="/store"
        >
          ALKADI
        </Link>
        <Suspense fallback={<Card className="h-72" />}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </main>
  );
}