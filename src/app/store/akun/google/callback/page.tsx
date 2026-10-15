"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { toast } from "@/components/ui/toast";
import { clearAuthSession, setAuthSession } from "@/services/api";
import { getProfile } from "@/services/profileService";

export default function GoogleAuthCallbackPage() {
  const router = useRouter();
  const hasHandledCallback = useRef(false);

  useEffect(() => {
    if (hasHandledCallback.current) {
      return;
    }

    hasHandledCallback.current = true;
    const callbackParams = new URLSearchParams(window.location.search);
    const status = callbackParams.get("status");

    if (status !== "success") {
      clearAuthSession();
      toast.add({
        title: "Autentikasi Google gagal",
        description: "Silakan coba login kembali.",
        type: "error",
      });
      window.setTimeout(() => router.replace("/store"), 1500);
      return;
    }

    window.history.replaceState(null, "", window.location.pathname);
    void getProfile()
      .then(() => {
        setAuthSession();
        toast.add({
          title: "Autentikasi Google berhasil",
          description: "Anda akan diarahkan ke Alkadi.",
          type: "success",
        });
      })
      .catch((error: unknown) => {
        clearAuthSession();
        console.error("Gagal memverifikasi sesi Google.", error);
        toast.add({
          title: "Autentikasi Google gagal",
          description: "Sesi tidak dapat diverifikasi. Silakan coba login kembali.",
          type: "error",
        });
      })
      .finally(() => {
        window.setTimeout(() => router.replace("/store"), 1500);
      });
  }, [router]);

  return (
    <main className="flex min-h-svh items-center justify-center bg-muted p-6">
      <p className="text-sm text-muted-foreground">
        Menyelesaikan login dengan Google...
      </p>
    </main>
  );
}
