"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { cn } from "cn"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast";
import { googleUrl, login as loginUser } from "@/services/authService"
import { ApiError } from "@/services/apiError"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleRedirecting, setIsGoogleRedirecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!login.trim() || !password) {
      const message = "Email atau username dan password harus diisi.";
      setFieldErrors({
        ...(login.trim() ? {} : { login: ["Email atau username wajib diisi."] }),
        ...(password ? {} : { password: ["Password wajib diisi."] }),
      });
      setErrorMessage(message);
      toast.add({ title: "Login gagal", description: message, type: "error" });
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setFieldErrors({});

    try {
      await loginUser({ login: login.trim(), password });
      toast.add({
        title: "Login berhasil",
        description: "Selamat datang kembali.",
        type: "success",
      });
      router.push("/store");
    } catch (error: unknown) {
      const apiError = error instanceof ApiError ? error : null;
      const message =
        apiError?.message ??
        "Gagal masuk. Silakan cek kembali data login Anda.";
      setFieldErrors(apiError?.errors ?? {});
      setErrorMessage(message);
      toast.add({ title: "Login gagal", description: message, type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleGoogleLogin(): void {
    setIsGoogleRedirecting(true);
    window.location.assign(googleUrl());
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Selamat Datang</CardTitle>
          <CardDescription>
            Login ke akun anda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} noValidate>
            <FieldGroup>
              <Field>
                <Button
                  variant="outline"
                  type="button"
                  disabled={isGoogleRedirecting}
                  onClick={handleGoogleLogin}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  {isGoogleRedirecting ? "Mengarahkan..." : "Login dengan Google"}
                </Button>
              </Field>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Atau lanjutkan dengan
              </FieldSeparator>
              <Field>
                <FieldLabel htmlFor="login">Email atau username</FieldLabel>
                <Input
                  id="login"
                  type="text"
                  value={login}
                  onChange={(event) => setLogin(event.target.value)}
                  placeholder="email atau username"
                  required
                  autoComplete="username"
                  aria-invalid={Boolean(fieldErrors.login)}
                />
                {fieldErrors.login?.[0] ? (
                  <p className="mt-1 text-sm text-destructive">
                    {fieldErrors.login[0]}
                  </p>
                ) : null}
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Link
                    href="/store/akun/forgot-password"
                    className="ml-auto text-sm underline-offset-4 hover:underline"
                  >
                    Lupa password anda?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  autoComplete="current-password"
                  aria-invalid={Boolean(fieldErrors.password)}
                />
                {fieldErrors.password?.[0] ? (
                  <p className="mt-1 text-sm text-destructive">
                    {fieldErrors.password[0]}
                  </p>
                ) : null}
              </Field>
              {errorMessage ? (
                <Field>
                  <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                    {errorMessage}
                  </p>
                </Field>
              ) : null}
              <Field>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Memproses..." : "Login"}
                </Button>
                <FieldDescription className="text-center">
                  Tidak memiliki akun? <a href="signup/">Sign up</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        Dengan mengklik lanjutkan, Anda setuju dengan <a href="#">Syarat Layanan</a>{" "}
        dan <a href="#">Kebijakan Privasi</a> kami.
      </FieldDescription>
    </div>
  )
}
