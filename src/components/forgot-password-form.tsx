"use client";

import { useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "cn";

import { ForgotPasswordEmailField } from "@/components/forgot-password-email-field";
import { NewPasswordForm } from "@/components/new-password-form";
import { ResetOtpForm } from "@/components/reset-otp-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup } from "@/components/ui/field";
import { toast } from "@/components/ui/toast";
import { ApiError } from "@/services/apiError";
import { forgotPassword } from "@/services/passwordService";

type ResetStep = "email" | "otp" | "password";

const stepContent: Record<ResetStep, { title: string; description: string }> = {
  email: {
    title: "Lupa password?",
    description:
      "Masukkan email akun Anda. Kami akan mengirimkan kode OTP untuk mengatur ulang password.",
  },
  otp: {
    title: "Masukkan kode OTP",
    description:
      "Kami telah mengirimkan kode OTP 6 digit ke email Anda. Masukkan kode tersebut untuk melanjutkan.",
  },
  password: {
    title: "Buat password baru",
    description:
      "Kode OTP terverifikasi. Buat password baru untuk akun Anda.",
  },
};

interface ForgotPasswordFormProps extends React.ComponentProps<"div"> {
  initialEmail?: string;
  initialStep?: ResetStep;
}

export function ForgotPasswordForm({
  className,
  initialEmail = "",
  initialStep = "email",
  ...props
}: ForgotPasswordFormProps) {
  const [step, setStep] = useState<ResetStep>(initialStep);
  const [email, setEmail] = useState(initialEmail);
  const [verifiedOtp, setVerifiedOtp] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      await forgotPassword(email.trim());
      toast.add({
        title: "Permintaan dikirim",
        description:
          "Jika email terdaftar, kode OTP untuk reset password akan dikirim.",
        type: "success",
      });
      setStep("otp");
    } catch (error: unknown) {
      const apiError = error instanceof ApiError ? error : null;
      const message =
        apiError?.message ??
        "Permintaan reset password gagal. Silakan coba lagi.";
      setFieldErrors(apiError?.errors ?? {});
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

  const content = stepContent[step];

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border border-border shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{content.title}</CardTitle>
          <CardDescription>{content.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {step === "email" ? (
            <form onSubmit={handleSubmit} noValidate>
              <FieldGroup>
                <ForgotPasswordEmailField
                  email={email}
                  error={fieldErrors.email?.[0]}
                  onEmailChange={setEmail}
                />
                {errorMessage ? (
                  <Field>
                    <p
                      role="alert"
                      className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
                    >
                      {errorMessage}
                    </p>
                  </Field>
                ) : null}
                <Field>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Mengirim..." : "Kirim kode OTP"}
                  </Button>
                  <p className="text-center text-sm text-muted-foreground">
                    Ingat password Anda?{" "}
                    <Link href="/store/akun/login">Kembali ke login</Link>
                  </p>
                </Field>
              </FieldGroup>
            </form>
          ) : null}
          {step === "otp" ? (
            <ResetOtpForm
              email={email.trim()}
              onValid={(otp) => {
                setVerifiedOtp(otp);
                setStep("password");
              }}
              onBack={() => setStep("email")}
            />
          ) : null}
          {step === "password" ? (
            <NewPasswordForm
              email={email.trim()}
              otp={verifiedOtp}
            />
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
