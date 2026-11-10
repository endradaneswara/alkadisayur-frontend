"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MapPin, Pencil, Phone, Plus, Trash2, User } from "lucide-react";

import { ConfirmDialogHost } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";
import { queryKeys } from "@/lib/query-keys";
import {
  createAlamat,
  deleteAlamat,
  listAlamat,
  updateAlamat,
  type AlamatPayload,
} from "@/services/alamatService";
import type { Alamat } from "@/types";

const emptyAddress: AlamatPayload = {
  nama_alamat: "",
  nama_penerima: "",
  no_hp: "",
  alamat_lengkap: "",
};

const addressFields = [
  { key: "nama_alamat", label: "Nama / Label Alamat", placeholder: "Rumah, Kantor, Kos" },
  { key: "nama_penerima", label: "Nama Penerima", placeholder: "Nama lengkap penerima" },
  { key: "no_hp", label: "Nomor Telepon / WhatsApp", placeholder: "0812xxxxxxxx" },
] as const;

export function ProfileAddressManager() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<AlamatPayload>(emptyAddress);
  const queryClient = useQueryClient();
  const confirmDialog = useConfirmDialog();

  const addressesQuery = useQuery({
    queryKey: queryKeys.alamat.list({ page: 1 }),
    queryFn: async () => (await listAlamat({ page: 1 })).data,
  });
  const addresses = addressesQuery.data ?? [];

  const saveMutation = useMutation({
    mutationFn: () =>
      editingId === null ? createAlamat(form) : updateAlamat(editingId, form),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.alamat.all });
      toast.add({
        title: editingId === null ? "Alamat ditambahkan" : "Alamat diperbarui",
        description: "Informasi alamat berhasil disimpan.",
        type: "success",
      });
      setIsSheetOpen(false);
    },
    onError: (error: Error) => {
      toast.add({
        title: "Alamat tidak dapat disimpan",
        description: error.message,
        type: "error",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteAlamat(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.alamat.all });
      toast.add({
        title: "Alamat dihapus",
        description: "Alamat berhasil dihapus dari akun Anda.",
        type: "success",
      });
    },
    onError: (error: Error) => {
      toast.add({
        title: "Alamat tidak dapat dihapus",
        description: error.message,
        type: "error",
      });
    },
  });

  function addAddress(): void {
    setEditingId(null);
    setForm(emptyAddress);
    setIsSheetOpen(true);
  }

  function editAddress(address: Alamat): void {
    setEditingId(address.id);
    setForm({
      nama_alamat: address.nama_alamat,
      nama_penerima: address.nama_penerima,
      no_hp: address.no_hp,
      alamat_lengkap: address.alamat_lengkap,
    });
    setIsSheetOpen(true);
  }

  function handleDelete(address: Alamat): void {
    void confirmDialog.confirm(
      {
        title: `Hapus alamat "${address.nama_alamat}"?`,
        description: "Alamat akan dihapus permanen dari akun Anda.",
        confirmLabel: "Hapus",
      },
      async () => {
        await deleteMutation.mutateAsync(address.id);
      },
    );
  }

  return (
    <>
      <Card className="border border-border/80 shadow-xs">
        <CardHeader>
          <div className="flex flex-col gap-1">
            <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-foreground">
              <MapPin className="size-5 text-primary" aria-hidden="true" />
              Alamat Pengiriman
            </h2>
            <p className="text-sm text-muted-foreground">
              Alamat yang dipakai saat Anda memilih pengiriman pesanan.
            </p>
          </div>
        </CardHeader>

        <CardContent>
          {addressesQuery.isLoading ? (
            <div className="grid gap-3 md:grid-cols-2">
              <Skeleton className="h-40 rounded-xl" />
              <Skeleton className="h-40 rounded-xl" />
            </div>
          ) : addressesQuery.isError ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-muted/20 p-4">
              <p className="text-sm text-muted-foreground">
                Alamat belum dapat dimuat.
              </p>
              <Button
                onClick={() => void addressesQuery.refetch()}
                size="sm"
                type="button"
                variant="outline"
              >
                Coba lagi
              </Button>
            </div>
          ) : addresses.length ? (
            <div className="flex flex-col gap-4">
              <ul className="grid gap-3 md:grid-cols-2">
                {addresses.map((address) => (
                  <li
                    key={address.id}
                    className="flex flex-col rounded-xl border border-border/80 bg-muted/20 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-heading text-base font-bold text-foreground">
                          {address.nama_alamat}
                        </p>
                        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                          <User className="size-3.5 shrink-0" aria-hidden="true" />
                          <span className="truncate">{address.nama_penerima}</span>
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <Button
                          aria-label={`Edit alamat ${address.nama_alamat}`}
                          onClick={() => editAddress(address)}
                          size="icon-sm"
                          type="button"
                          variant="ghost"
                        >
                          <Pencil className="size-4" aria-hidden="true" />
                        </Button>
                        <Button
                          aria-label={`Hapus alamat ${address.nama_alamat}`}
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(address)}
                          size="icon-sm"
                          type="button"
                          variant="ghost"
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                        </Button>
                      </div>
                    </div>
                    <p className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Phone className="size-3.5 shrink-0" aria-hidden="true" />
                      {address.no_hp}
                    </p>
                    <p className="mt-3 border-t border-border pt-3 text-sm leading-relaxed text-muted-foreground">
                      {address.alamat_lengkap}
                    </p>
                  </li>
                ))}
              </ul>
              <div>
                <Button onClick={addAddress} className="gap-2" type="button">
                  <Plus className="size-4" aria-hidden="true" />
                  Tambah alamat
                </Button>
              </div>
            </div>
          ) : (
            <button
              className="flex w-full flex-col items-center gap-2 rounded-xl border border-dashed border-border/80 p-8 text-center transition-colors hover:border-primary/50 hover:bg-muted/20 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              onClick={addAddress}
              type="button"
            >
              <span className="flex size-11 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <MapPin className="size-5" aria-hidden="true" />
              </span>
              <span className="font-semibold text-foreground">
                Belum ada alamat pengiriman
              </span>
              <span className="text-sm text-muted-foreground">
                Ketuk di sini untuk menambahkan alamat pertama Anda.
              </span>
            </button>
          )}
        </CardContent>
      </Card>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>
              {editingId === null ? "Tambah alamat" : "Edit alamat"}
            </SheetTitle>
            <SheetDescription>
              Simpan alamat pengiriman yang dapat dipilih saat checkout.
            </SheetDescription>
          </SheetHeader>

          <form
            className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 pb-4"
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              void saveMutation.mutateAsync();
            }}
          >
            <FieldGroup>
              {addressFields.map(({ key, label, placeholder }) => (
                <Field key={key}>
                  <FieldLabel htmlFor={`address-${key}`}>{label}</FieldLabel>
                  <Input
                    id={`address-${key}`}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        [key]: event.target.value,
                      }))
                    }
                    placeholder={placeholder}
                    required
                    type={key === "no_hp" ? "tel" : "text"}
                    value={form[key]}
                  />
                </Field>
              ))}
              <Field>
                <FieldLabel htmlFor="address-alamat_lengkap">
                  Alamat Lengkap
                </FieldLabel>
                <Textarea
                  id="address-alamat_lengkap"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      alamat_lengkap: event.target.value,
                    }))
                  }
                  placeholder="Jalan, nomor rumah, RT/RW, kelurahan, kecamatan, patokan"
                  required
                  rows={3}
                  value={form.alamat_lengkap}
                />
              </Field>
            </FieldGroup>

            <SheetFooter className="px-0">
              <SheetClose
                render={<Button type="button" variant="outline" />}
              >
                Batal
              </SheetClose>
              <Button disabled={saveMutation.isPending} type="submit">
                {saveMutation.isPending ? "Menyimpan..." : "Simpan alamat"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <ConfirmDialogHost dialog={confirmDialog} />
    </>
  );
}