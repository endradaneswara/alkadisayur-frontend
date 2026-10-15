"use client";

import { useState } from "react";

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
  const [formData, setFormData] = useState(() => ({
    name: user?.name ?? "",
    email: user?.email ?? "",
    no_hp: user?.no_hp ?? "",
  }));
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Edit profil</SheetTitle>
          <SheetDescription>
            Lakukan perubahan pada profil Anda di sini. Klik simpan setelah selesai.
          </SheetDescription>
        </SheetHeader>

        <form className="flex flex-1 flex-col gap-6 px-4" onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="profile-name">Nama</FieldLabel>
              <Input
                id="profile-name"
                value={formData.name}
                onChange={(event) =>
                  setFormData((previous) => ({
                    ...previous,
                    name: event.target.value,
                  }))
                }
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
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="profile-phone">Nomor HP</FieldLabel>
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
              />
            </Field>

            {errorMessage ? (
              <Field>
                <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                  {errorMessage}
                </p>
              </Field>
            ) : null}
          </FieldGroup>

          <SheetFooter className="px-0">
            <SheetClose render={<Button type="button" variant="outline" />}>
              Tutup
            </SheetClose>
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? "Menyimpan..." : "Simpan perubahan"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
