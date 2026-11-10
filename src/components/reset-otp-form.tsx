"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "@/components/ui/toast";
import { ApiError } from "@/services/apiError";
import { verifyResetOtp } from "@/services/passwordService";

interface ResetOtpFormProps {
  email: string;
  onValid: (otp: string) => void;
  onBack: () => void;
}

export function ResetOtpForm({ email, onValid, onBack }: ResetOtpFormProps) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!/^\d{6}$/.test(otp)) {
      setError("Masukkan kode OTP 6 digit.");
      return;
    }
    setIsSubmitting(true);
    try {
      await verifyResetOtp(email, otp);
      onValid(otp);
    } catch (cause: unknown) {
      const message = cause instanceof ApiError ? cause.message : "Kode OTP tidak valid atau sudah kedaluwarsa.";
      setError(message);
      toast.add({ title: "Verifikasi OTP gagal", description: message, type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="reset-otp">Kode OTP</FieldLabel>
          <InputOTP id="reset-otp" className="w-full" containerClassName="w-full" maxLength={6} pattern="^[0-9]+$" inputMode="numeric" autoComplete="one-time-code" value={otp} onChange={setOtp} aria-invalid={Boolean(error)}>
            <InputOTPGroup className="w-full gap-2">
              {Array.from({ length: 6 }, (_, index) => (
                <InputOTPSlot
                  key={index}
                  index={index}
                  className="h-14 w-full flex-1 rounded-xl border border-input text-xl font-semibold sm:h-16 sm:text-2xl"
                />
              ))}
            </InputOTPGroup>
          </InputOTP>
          {error ? <p className="mt-1 text-sm text-destructive" role="alert">{error}</p> : <FieldDescription>Masukkan 6 digit kode yang dikirim ke email Anda.</FieldDescription>}
        </Field>
        <Field>
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Memverifikasi..." : "Verifikasi kode OTP"}</Button>
          <FieldDescription className="text-center"></FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
