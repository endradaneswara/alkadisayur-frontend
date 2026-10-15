import { LoginForm } from "@/components/login-form"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          href="/store"
          className="self-center font-heading text-xl font-bold tracking-tight text-primary"
        >
          ALKADI
        </Link>
        <LoginForm />
      </div>
    </div>
  )
}
