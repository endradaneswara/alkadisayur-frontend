"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { MapPin, Pencil, Plus, Trash2 } from "lucide-react";

import { StorePageShell } from "@/components/store-page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { getErrorMessage } from "@/lib/store-catalog";
import { hasAuthSession } from "@/services/api";
import {
  createAlamat,
  deleteAlamat,
  listAlamat,
  updateAlamat,
  type AlamatPayload,
} from "@/services/alamatService";
import type { Alamat } from "@/types";

const emptyForm: AlamatPayload = {
  nama_alamat: "",
  nama_penerima: "",
  no_hp: "",
  alamat_lengkap: "",
};

export default function AddressesPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Alamat[]>([]);
  const [formData, setFormData] = useState<AlamatPayload>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAddresses = useCallback(async (): Promise<void> => {
    try {
      const response = await listAlamat({ page: 1 });
      setAddresses(response.data);
      setError(null);
    } catch (loadError: unknown) {
      setError(getErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(() => {
      if (!hasAuthSession()) {
        router.replace("/store/akun/login");
        return;
      }
      return loadAddresses();
    });
  }, [loadAddresses, router]);

  function startEdit(address: Alamat): void {
    setEditingId(address.id);
    setFormData({
      nama_alamat: address.nama_alamat,
      nama_penerima: address.nama_penerima,
      no_hp: address.no_hp,
      alamat_lengkap: address.alamat_lengkap,
    });
    setError(null);
  }

  function resetForm(): void {
    setEditingId(null);
    setFormData(emptyForm);
    setError(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      if (editingId === null) {
        await createAlamat(formData);
      } else {
        await updateAlamat(editingId, formData);
      }
      await loadAddresses();
      toast.add({
        title: editingId === null ? "Alamat ditambahkan" : "Alamat diperbarui",
        description: "Informasi alamat berhasil disimpan.",
        type: "success",
      });
      resetForm();
    } catch (saveError: unknown) {
      const message = getErrorMessage(saveError);
      setError(message);
      toast.add({
        title: "Alamat tidak dapat disimpan",
        description: message,
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(address: Alamat): Promise<void> {
    if (!window.confirm(`Hapus alamat "${address.nama_alamat}"?`)) {
      return;
    }
    try {
      await deleteAlamat(address.id);
      await loadAddresses();
      if (editingId === address.id) {
        resetForm();
      }
      toast.add({
        title: "Alamat dihapus",
        description: "Alamat berhasil dihapus dari akun Anda.",
        type: "success",
      });
    } catch (deleteError: unknown) {
      toast.add({
        title: "Alamat tidak dapat dihapus",
        description: getErrorMessage(deleteError),
        type: "error",
      });
    }
  }

  function updateField(field: keyof AlamatPayload, value: string): void {
    setFormData((current) => ({ ...current, [field]: value }));
  }

  return (
    <StorePageShell>
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Akun saya
          </p>
          <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight">
            Alamat tersimpan
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Simpan alamat agar checkout pesan antar lebih mudah.
          </p>
        </header>

        {error ? (
          <p className="rounded-xl border border-destructive/30 bg-card px-4 py-3 text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <div className="grid items-start gap-6 lg:grid-cols-[1fr_360px]">
          <section aria-label="Alamat yang tersimpan" className="flex flex-col gap-3">
            {isLoading ? (
              Array.from({ length: 2 }, (_, index) => (
                <Skeleton className="h-36 rounded-xl" key={index} />
              ))
            ) : addresses.length ? (
              addresses.map((address) => (
                <Card key={address.id}>
                  <CardContent className="flex items-start justify-between gap-4 p-5">
                    <div className="flex min-w-0 gap-3">
                      <MapPin aria-hidden="true" className="mt-1 size-4 shrink-0 text-primary" />
                      <div className="min-w-0">
                        <h2 className="font-semibold">{address.nama_alamat}</h2>
                        <p className="mt-1 text-sm">{address.nama_penerima}</p>
                        <p className="text-sm text-muted-foreground">{address.no_hp}</p>
                        <p className="mt-2 text-sm leading-5 text-muted-foreground">
                          {address.alamat_lengkap}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button aria-label={`Edit alamat ${address.nama_alamat}`} onClick={() => startEdit(address)} size="icon" variant="ghost">
                        <Pencil aria-hidden="true" />
                      </Button>
                      <Button aria-label={`Hapus alamat ${address.nama_alamat}`} onClick={() => void handleDelete(address)} size="icon" variant="ghost">
                        <Trash2 aria-hidden="true" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="py-10 text-center text-sm text-muted-foreground">
                  Belum ada alamat tersimpan. Tambahkan alamat di formulir.
                </CardContent>
              </Card>
            )}
          </section>

          <Card>
            <CardHeader>
              <CardTitle>{editingId === null ? "Tambah alamat" : "Edit alamat"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="address-label">Nama alamat</FieldLabel>
                    <Input id="address-label" maxLength={100} onChange={(event) => updateField("nama_alamat", event.target.value)} required value={formData.nama_alamat} placeholder="Rumah, kantor, ..." />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="address-recipient">Nama penerima</FieldLabel>
                    <Input id="address-recipient" maxLength={100} onChange={(event) => updateField("nama_penerima", event.target.value)} required value={formData.nama_penerima} />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="address-phone">Nomor HP</FieldLabel>
                    <Input id="address-phone" autoComplete="tel" maxLength={20} onChange={(event) => updateField("no_hp", event.target.value)} required type="tel" value={formData.no_hp} />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="address-full">Alamat lengkap</FieldLabel>
                    <textarea
                      className="min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                      id="address-full"
                      onChange={(event) => updateField("alamat_lengkap", event.target.value)}
                      required
                      value={formData.alamat_lengkap}
                    />
                  </Field>
                  <div className="flex flex-wrap gap-2">
                    <Button disabled={isSaving} type="submit">
                      {isSaving ? "Menyimpan..." : editingId === null ? "Simpan alamat" : "Simpan perubahan"}
                      {editingId === null ? <Plus aria-hidden="true" data-icon="inline-start" /> : null}
                    </Button>
                    {editingId !== null ? (
                      <Button onClick={resetForm} type="button" variant="outline">
                        Batal
                      </Button>
                    ) : null}
                  </div>
                </FieldGroup>
              </form>
            </CardContent>
          </Card>
        </div>

        <Link className="text-sm text-primary hover:underline" href="/store/akun/profile">
          Kembali ke profil
        </Link>
      </div>
    </StorePageShell>
  );
}
