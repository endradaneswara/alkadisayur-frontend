import { Vegan } from "lucide-react"
import { LoginForm } from "@/components/login-form"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          href="/store"
          aria-label="Alkadi Sayur, beranda"
          className="flex items-center gap-2 self-center rounded-lg font-heading text-xl font-bold tracking-tight text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          <Vegan aria-hidden="true" className="size-6" />
          <span>Alkadi</span>
        </Link>
        <LoginForm />
      </div>
    </div>
  )
}
