"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { toast } from "@/components/ui/toast";
import { ApiError } from "@/services/apiError";
import { forgotPassword } from "@/services/passwordService";
import { updateProfile } from "@/services/profileService";
import type { PenggunaLogin } from "@/types";

interface ProfileEditSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: PenggunaLogin | null;
  onSave?: (user: PenggunaLogin) => void;
}

export function ProfileEditSheet({
  open,
  onOpenChange,
  user,
  onSave,
}: ProfileEditSheetProps) {
  const router = useRouter();
  const [formData, setFormData] = useState(() => ({
    name: user?.name ?? "",
    email: user?.email ?? "",
    no_hp: user?.no_hp ?? "",
  }));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!formData.name.trim() || !formData.email.trim()) {
      setErrorMessage("Nama dan email harus diisi.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await updateProfile({
        name: formData.name.trim(),
        email: formData.email.trim(),
        no_hp: formData.no_hp.trim() || undefined,
      });

      if (response.data) {
        onSave?.(response.data);
      }

      onOpenChange(false);
      toast.add({
        title: "Profil diperbarui",
        description: "Data profil Anda berhasil disimpan.",
        type: "success",
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Gagal menyimpan perubahan profil. Silakan coba lagi.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResetPassword() {
    const email = (formData.email || user?.email || "").trim();
    if (!email) {
      setErrorMessage("Email harus diisi untuk mengirim kode OTP reset password.");
      return;
    }

    setIsSendingOtp(true);
    setErrorMessage(null);

    try {
      await forgotPassword(email);
      toast.add({
        title: "Kode OTP dikirim",
        description: `Kode OTP reset password telah dikirim ke ${email}.`,
        type: "success",
      });
      onOpenChange(false);
      router.push(`/store/akun/forgot-password?email=${encodeURIComponent(email)}&step=otp`);
    } catch (error: unknown) {
      const apiError = error instanceof ApiError ? error : null;
      const message =
        apiError?.message ??
        (error instanceof Error ? error.message : "Gagal meminta kode OTP reset password.");
      setErrorMessage(message);
      toast.add({
        title: "Gagal meminta kode OTP",
        description: message,
        type: "error",
      });
    } finally {
      setIsSendingOtp(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Edit Profil</SheetTitle>
          <SheetDescription>
            Lakukan perubahan pada data akun Anda di sini. Klik simpan setelah selesai.
          </SheetDescription>
        </SheetHeader>

        <form className="flex flex-1 flex-col gap-6 px-4" onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="profile-name">Nama Lengkap</FieldLabel>
              <Input
                id="profile-name"
                value={formData.name}
                onChange={(event) =>
                  setFormData((previous) => ({
                    ...previous,
                    name: event.target.value,
                  }))
                }
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="profile-email">Email</FieldLabel>
              <Input
                id="profile-email"
                type="email"
                value={formData.email}
                onChange={(event) =>
                  setFormData((previous) => ({
                    ...previous,
                    email: event.target.value,
                  }))
                }
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="profile-phone">Nomor HP / WhatsApp</FieldLabel>
              <Input
                id="profile-phone"
                type="tel"
                value={formData.no_hp}
                onChange={(event) =>
                  setFormData((previous) => ({
                    ...previous,
                    no_hp: event.target.value,
                  }))
                }
                placeholder="Contoh: 08123456789"
              />
            </Field>

            {/* Bagian Keamanan / Reset Password */}
            <div className="rounded-2xl border border-border/80 bg-muted/20 p-4">
              <div className="space-y-1">
                <p className="font-semibold text-sm text-foreground">Keamanan & Password</p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Ingin mengatur ulang kata sandi? Kami akan mengirimkan 6 digit kode OTP verifikasi langsung ke email Anda.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isSendingOtp}
                onClick={handleResetPassword}
                className="mt-3 gap-2 text-xs"
              >
                <KeyRound className="size-3.5" />
                {isSendingOtp ? "Mengirim OTP..." : "Reset Password via OTP"}
              </Button>
            </div>

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
          </FieldGroup>

          <SheetFooter className="px-0">
            <SheetClose render={<Button type="button" variant="outline" />}>
              Batal
            </SheetClose>
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
