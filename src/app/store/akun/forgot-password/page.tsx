"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { ApiError } from "@/services/apiError";
import { forgotPassword } from "@/services/passwordService";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRequestSent, setIsRequestSent] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await forgotPassword(email.trim());
      setIsRequestSent(true);
      toast.add({
        title: "Permintaan dikirim",
        description:
          "Jika email terdaftar, kode OTP untuk reset password akan dikirim.",
        type: "success",
      });
    } catch (error: unknown) {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Permintaan reset password gagal. Silakan coba lagi.";
      setErrorMessage(message);
      toast.add({
        title: "Permintaan gagal",
        description: message,
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function continueToReset(): void {
    router.push(
      `/store/akun/reset-password?email=${encodeURIComponent(email.trim())}`,
    );
  }

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          className="self-center font-heading text-xl font-bold tracking-tight text-primary"
          href="/store"
        >
          ALKADI
        </Link>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Lupa password?</CardTitle>
            <CardDescription>
              Masukkan email akun Anda. Kami akan mengirimkan kode OTP untuk
              mengatur ulang password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isRequestSent ? (
              <FieldGroup>
                <Field>
                  <p className="rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-sm text-foreground">
                    Jika email terdaftar, kode OTP reset password akan dikirim.
                    Periksa kotak masuk email Anda.
                  </p>
                </Field>
                <Field>
                  <Button onClick={continueToReset} type="button">
                    Masukkan kode OTP
                  </Button>
                </Field>
              </FieldGroup>
            ) : (
              <form onSubmit={handleSubmit}>
                <FieldGroup>
                  <Field data-invalid={Boolean(errorMessage)}>
                    <FieldLabel htmlFor="forgot-email">Email</FieldLabel>
                    <Input
                      id="forgot-email"
                      type="email"
                      autoComplete="email"
                      placeholder="nama@email.com"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                      aria-invalid={Boolean(errorMessage)}
                    />
                  </Field>
                  {errorMessage ? (
                    <Field>
                      <p className="text-sm text-destructive" role="alert">
                        {errorMessage}
                      </p>
                    </Field>
                  ) : null}
                  <Field>
                    <Button
                      disabled={isSubmitting}
                      type="submit"
                    >
                      {isSubmitting ? "Mengirim..." : "Kirim kode OTP"}
                    </Button>
                    <FieldDescription className="text-center">
                      Ingat password Anda?{" "}
                      <Link href="/store/akun/login">Kembali ke login</Link>
                    </FieldDescription>
                  </Field>
                </FieldGroup>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}