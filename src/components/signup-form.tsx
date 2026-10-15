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
import { googleUrl, register as registerUser } from "@/services/authService";

export function SignupForm({
  ...props
}: React.ComponentProps<typeof Card>) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleRedirecting, setIsGoogleRedirecting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});
    setErrorMessage(null);

    if (password !== passwordConfirmation) {
      const message = "Konfirmasi password tidak sesuai.";
      setFieldErrors({
        password_confirmation: [message],
      });
      setErrorMessage(message);
      toast.add({ title: "Registrasi gagal", description: message, type: "error" });
      return;
    }

    setIsSubmitting(true);

    try {
      await registerUser({
        name: name.trim(),
        email: email.trim(),
        password,
        password_confirmation: passwordConfirmation,
      });
      toast.add({
        title: "Registrasi berhasil",
        description: "Akun Alkadi Anda berhasil dibuat.",
        type: "success",
      });
      router.replace("/store");
    } catch (error: unknown) {
      let message: string;

      if (error instanceof ApiError) {
        setFieldErrors(error.errors ?? {});
        message = error.message;
      } else {
        message =
          error instanceof Error
            ? error.message
            : "Registrasi gagal. Silakan coba lagi.";
      }
      setErrorMessage(message);
      toast.add({
        title: "Registrasi gagal",
        description: message,
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleGoogleRegister(): void {
    setIsGoogleRedirecting(true);
    window.location.assign(googleUrl());
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/store"
        className="self-center font-heading text-xl font-bold tracking-tight text-primary"
      >
        ALKADI
      </Link>
      <Card {...props}>
        <CardHeader>
          <CardTitle>Register akun</CardTitle>
          <CardDescription>
            Masukan informasi anda untuk membuat akun.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} noValidate>
            <FieldGroup>
              <Field data-invalid={Boolean(fieldErrors.name)}>
                <FieldLabel htmlFor="name">Username</FieldLabel>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoComplete="name"
                  required
                  aria-invalid={Boolean(fieldErrors.name)}
                />
                {fieldErrors.name?.[0] ? (
                  <p className="text-sm text-destructive">{fieldErrors.name[0]}</p>
                ) : null}
              </Field>
              <Field data-invalid={Boolean(fieldErrors.email)}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  required
                  aria-invalid={Boolean(fieldErrors.email)}
                />
                {fieldErrors.email?.[0] ? (
                  <p className="text-sm text-destructive">{fieldErrors.email[0]}</p>
                ) : (
                  <FieldDescription>
                    Kami akan menggunakan ini untuk menghubungi Anda.
                    Kami tidak akan membagikan email Anda kepada pihak lain mana pun.
                  </FieldDescription>
                )}
              </Field>
              <Field data-invalid={Boolean(fieldErrors.password)}>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="new-password"
                  required
                  aria-invalid={Boolean(fieldErrors.password)}
                />
                {fieldErrors.password?.[0] ? (
                  <p className="text-sm text-destructive">{fieldErrors.password[0]}</p>
                ) : (
                  <FieldDescription>
                    Harus memiliki setidaknya 8 karakter.
                  </FieldDescription>
                )}
              </Field>
              <Field data-invalid={Boolean(fieldErrors.password_confirmation)}>
                <FieldLabel htmlFor="confirm-password">
                  Konfirmasi password
                </FieldLabel>
                <Input
                  id="confirm-password"
                  type="password"
                  value={passwordConfirmation}
                  onChange={(event) =>
                    setPasswordConfirmation(event.target.value)
                  }
                  autoComplete="new-password"
                  required
                  aria-invalid={Boolean(fieldErrors.password_confirmation)}
                />
                {fieldErrors.password_confirmation?.[0] ? (
                  <p className="text-sm text-destructive">
                    {fieldErrors.password_confirmation[0]}
                  </p>
                ) : (
                  <FieldDescription>Mohon konfirmasi password</FieldDescription>
                )}
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
                  {isSubmitting ? "Memproses..." : "Buat akun"}
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  disabled={isGoogleRedirecting}
                  onClick={handleGoogleRegister}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  {isGoogleRedirecting
                    ? "Mengarahkan..."
                    : "Register dengan Google"}
                </Button>
                <FieldDescription className="px-6 text-center">
                  Sudah memiliki akun?{" "}
                  <Link href="/store/akun/login">Login</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
