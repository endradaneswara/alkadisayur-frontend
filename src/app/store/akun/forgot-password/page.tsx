"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Vegan } from "lucide-react";
import Link from "next/link";

import { ForgotPasswordForm } from "@/components/forgot-password-form";

function ForgotPasswordContent() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") ?? "";
  const stepParam = searchParams.get("step");
  const initialStep = stepParam === "otp" && emailParam ? "otp" : "email";

  return (
    <ForgotPasswordForm
      initialEmail={emailParam}
      initialStep={initialStep}
    />
  );
}

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          href="/store"
          aria-label="Alkadi Sayur, beranda"
          className="flex items-center gap-2 self-center rounded-lg font-heading text-xl font-bold tracking-tight text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          <Vegan aria-hidden="true" className="size-6" />
          <span>Alkadi</span>
        </Link>
        <Suspense fallback={null}>
          <ForgotPasswordContent />
        </Suspense>
      </div>
    </main>
  );
}
