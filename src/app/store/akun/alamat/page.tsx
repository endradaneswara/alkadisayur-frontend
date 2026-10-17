"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  Building2,
  Check,
  Edit2,
  Home,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Trash2,
  User,
} from "lucide-react";

import { StoreAccountNav } from "@/components/store-account-nav";
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
    window.scrollTo({ top: 0, behavior: "smooth" });
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
      <div className="w-full">
        {/* Navigation Tabs Header */}
        <StoreAccountNav
          title="Daftar Alamat"
          badge="Buku Alamat"
          description="Simpan dan atur alamat tujuan pengiriman pesanan sayur segar untuk kemudahan belanja Anda."
          action={
            editingId !== null ? (
              <Button onClick={resetForm} variant="outline" size="sm">
                + Tambah Alamat Baru
              </Button>
            ) : null
          }
        />

        {error ? (
          <div
            className="mb-6 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
            role="alert"
          >
            {error}
          </div>
        ) : null}

        {/* 2 Kolom Layout Lebar */}
        <div className="grid items-start gap-8 lg:grid-cols-[1fr_420px]">
          {/* Kolom Kiri: Daftar Kartu Alamat */}
          <section aria-label="Alamat yang tersimpan" className="flex flex-col gap-4">
            <div className="flex items-center justify-between pb-1">
              <h2 className="font-heading text-lg font-bold text-foreground">
                Alamat Tersimpan ({addresses.length})
              </h2>
            </div>

            {isLoading ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <Skeleton className="h-44 rounded-2xl" />
                <Skeleton className="h-44 rounded-2xl" />
              </div>
            ) : addresses.length ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {addresses.map((address) => (
                  <Card
                    key={address.id}
                    className={`relative flex flex-col justify-between border transition-all duration-200 hover:border-primary/60 hover:shadow-md ${
                      editingId === address.id
                        ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                        : "border-border/80"
                    }`}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <MapPin className="size-4" />
                          </span>
                          <h3 className="font-heading font-bold text-base text-foreground">
                            {address.nama_alamat}
                          </h3>
                        </div>

                        <div className="flex items-center gap-1">
                          <Button
                            aria-label={`Edit alamat ${address.nama_alamat}`}
                            onClick={() => startEdit(address)}
                            size="icon"
                            variant="ghost"
                            className="size-8"
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            aria-label={`Hapus alamat ${address.nama_alamat}`}
                            onClick={() => void handleDelete(address)}
                            size="icon"
                            variant="ghost"
                            className="size-8 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2 font-medium text-foreground">
                          <User className="size-3.5 text-primary" />
                          <span>{address.nama_penerima}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="size-3.5 text-primary" />
                          <span>{address.no_hp}</span>
                        </div>
                        <p className="mt-2 text-xs leading-relaxed text-muted-foreground line-clamp-3 pt-1 border-t border-border">
                          {address.alamat_lengkap}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border border-border/80 bg-card/60">
                <CardContent className="flex flex-col items-center justify-center py-14 text-center">
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <MapPin className="size-7" />
                  </div>
                  <h3 className="mt-4 font-heading text-lg font-bold">
                    Belum Ada Alamat Tersimpan
                  </h3>
                  <p className="mt-1 max-w-sm text-xs text-muted-foreground sm:text-sm">
                    Gunakan formulir di sebelah kanan untuk menambahkan alamat pengiriman pertama Anda.
                  </p>
                </CardContent>
              </Card>
            )}
          </section>

          {/* Kolom Kanan: Formulir Tambah/Edit Alamat */}
          <Card className="border border-border/80 shadow-xs lg:sticky lg:top-24">
            <CardHeader className="border-b border-border bg-muted/20 pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                {editingId === null ? (
                  <>
                    <Plus className="size-4 text-primary" />
                    Tambah Alamat Baru
                  </>
                ) : (
                  <>
                    <Edit2 className="size-4 text-primary" />
                    Edit Alamat
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit}>
                <FieldGroup className="space-y-4">
                  <Field>
                    <FieldLabel htmlFor="address-label">Nama / Label Alamat</FieldLabel>
                    <Input
                      id="address-label"
                      maxLength={100}
                      onChange={(event) => updateField("nama_alamat", event.target.value)}
                      required
                      value={formData.nama_alamat}
                      placeholder="Contoh: Rumah, Kantor, Kos, dll"
                      className="mt-1 text-sm"
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="address-recipient">Nama Penerima</FieldLabel>
                    <Input
                      id="address-recipient"
                      maxLength={100}
                      onChange={(event) => updateField("nama_penerima", event.target.value)}
                      required
                      value={formData.nama_penerima}
                      placeholder="Nama lengkap penerima pesanan"
                      className="mt-1 text-sm"
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="address-phone">Nomor Telepon / WhatsApp</FieldLabel>
                    <Input
                      id="address-phone"
                      autoComplete="tel"
                      maxLength={20}
                      onChange={(event) => updateField("no_hp", event.target.value)}
                      required
                      type="tel"
                      value={formData.no_hp}
                      placeholder="0812xxxxxxxx"
                      className="mt-1 text-sm font-mono"
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="address-full">Alamat Lengkap</FieldLabel>
                    <textarea
                      className="mt-1 min-h-[100px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring"
                      id="address-full"
                      onChange={(event) => updateField("alamat_lengkap", event.target.value)}
                      required
                      value={formData.alamat_lengkap}
                      placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan, patokan lokasi..."
                    />
                  </Field>

                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <Button disabled={isSaving} type="submit" className="flex-1">
                      {isSaving
                        ? "Menyimpan..."
                        : editingId === null
                        ? "Simpan Alamat"
                        : "Simpan Perubahan"}
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
      </div>
    </StorePageShell>
  );
}
