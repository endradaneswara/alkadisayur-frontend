
"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  Folder,
  FolderPlus,
  Pencil,
  RotateCcw,
  Search,
  Trash2,
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { usePagination } from "@/hooks/usePagination";
import { queryKeys } from "@/lib/query-keys";
import { getErrorMessage } from "@/lib/store-catalog";
import {
  createKategori,
  deleteKategori,
  listKategori,
  updateKategori,
} from "@/services/kategoriService";
import type { Kategori } from "@/types";

import { AccessGuard } from "@/components/access-guard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/toast";

type FormMode = "tambah" | "edit";

interface KategoriFormState {
  nama_kategori: string;
}

const EMPTY_FORM: KategoriFormState = {
  nama_kategori: "",
};

const PAGE_SIZE = 20;

export default function KategoriPage() {
  return (
    <AccessGuard
      roles={["superAdmin"]}
      message="Halaman pengelolaan kategori hanya dapat diakses oleh Super Admin."
    >
      <KategoriContent />
    </AccessGuard>
  );
}

function KategoriContent() {
  const { currentUser, isLoading: isLoadingUser } = useAuth();
  const queryClient = useQueryClient();
  const pagination = usePagination();
  const { page, lastPage } = pagination;

  const [searchQuery, setSearchQuery] = React.useState("");

  const [listError, setListError] = React.useState<string | null>(null);
  const [formError, setFormError] = React.useState<string | null>(null);

  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [formMode, setFormMode] = React.useState<FormMode>("tambah");
  const [editTarget, setEditTarget] = React.useState<Kategori | null>(null);
  const [form, setForm] = React.useState<KategoriFormState>(EMPTY_FORM);

  const isSuperAdmin = currentUser?.role === "superAdmin";

  const kategoriQuery = useQuery({
    queryKey: queryKeys.kategori.list({ page }),
    queryFn: async () => {
      const response = await listKategori({ page });
      return response;
    },
    enabled: !isLoadingUser && isSuperAdmin,
  });

  React.useEffect(() => {
    if (kategoriQuery.data) {
      pagination.setMeta(kategoriQuery.data.meta);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kategoriQuery.data]);

  const total = kategoriQuery.data?.meta?.total ?? kategoriQuery.data?.data.length ?? 0;
  const kategoriList = kategoriQuery.data?.data ?? [];
  const isLoading = kategoriQuery.isLoading;
  const error = listError ?? (kategoriQuery.error instanceof Error
    ? getErrorMessage(kategoriQuery.error)
    : null);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const namaKategori = form.nama_kategori.trim();

      if (formMode === "tambah") {
        return createKategori({ nama_kategori: namaKategori });
      }

      if (!editTarget) {
        throw new Error("Kategori tidak ditemukan.");
      }

      return updateKategori(editTarget.id, { nama_kategori: namaKategori });
    },
    onSuccess: async (_result) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.kategori.all });
      await queryClient.invalidateQueries({ queryKey: queryKeys.barang.all });

      const namaKategori = form.nama_kategori.trim();

      toast.add({
        title: formMode === "tambah" ? "Kategori Ditambahkan" : "Kategori Diperbarui",
        description: `Kategori "${namaKategori}" berhasil ${formMode === "tambah" ? "ditambahkan" : "diperbarui"}.`,
        type: "success",
      });

      setSheetOpen(false);
      setForm(EMPTY_FORM);
    },
    onError: (saveError: Error) => {
      setFormError(saveError.message);
      toast.add({
        title: "Gagal Menyimpan Kategori",
        description: saveError.message,
        type: "error",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await deleteKategori(id);
      return id;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.kategori.all });
      await queryClient.invalidateQueries({ queryKey: queryKeys.barang.all });

      toast.add({
        title: "Kategori Dihapus",
        description: "Kategori berhasil dihapus.",
        type: "success",
      });

      // Jika kategori terakhir di halaman dihapus, kembali satu halaman.
      if (kategoriList.length === 1 && page > 1) {
        pagination.goToPreviousPage();
      }
    },
    onError: (deleteError: Error) => {
      setListError(deleteError.message);
      toast.add({
        title: "Gagal Menghapus Kategori",
        description: deleteError.message,
        type: "error",
      });
    },
  });

  const isSaving = saveMutation.isPending;  const deletingId = deleteMutation.isPending
    ? (deleteMutation.variables ?? null)
    : null;

  const handleResetSearch = () => {
    setSearchQuery("");
  };

  const handleTambah = () => {
    setFormMode("tambah");
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setSheetOpen(true);
  };

  const handleEdit = (kategori: Kategori) => {
    setFormMode("edit");
    setEditTarget(kategori);
    setForm({ nama_kategori: kategori.nama_kategori });
    setFormError(null);
    setSheetOpen(true);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isSuperAdmin) {
      setFormError("Hanya Super Admin yang dapat mengelola kategori.");
      return;
    }

    if (!form.nama_kategori.trim()) {
      setFormError("Nama kategori tidak boleh kosong.");
      return;
    }

    setFormError(null);
    void saveMutation.mutateAsync();
  };

  const handleDelete = (id: number) => {
    if (!isSuperAdmin) {
      setListError("Hanya Super Admin yang dapat menghapus kategori.");
      return;
    }

    void deleteMutation.mutateAsync(id);
  };

  const filteredList = React.useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase("id-ID");

    if (!query) return kategoriList;

    return kategoriList.filter((kategori) =>
      kategori.nama_kategori.toLocaleLowerCase("id-ID").includes(query),
    );
  }, [kategoriList, searchQuery]);

  if (isLoadingUser) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* Page Header */}
          <div className="px-4 lg:px-6">
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 shadow-xs md:p-6">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                    Kategori Produk
                  </h1>
                  <Badge variant="secondary" className="text-xs">
                    {total} kategori
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Kelola daftar kategori produk toko Alkadi.
                </p>
              </div>

              <Button onClick={handleTambah} className="gap-2">
                <FolderPlus className="size-4" />
                Tambah Kategori
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="px-4 lg:px-6">
            <div className="flex items-center gap-3 rounded-xl border border-border bg-card/60 p-3 shadow-2xs">
              <Search className="size-4 shrink-0 text-primary" />
              <Input
                placeholder="Cari nama kategori..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="h-8 border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
              />

              {searchQuery && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1 text-xs text-muted-foreground"
                  onClick={handleResetSearch}
                >
                  <RotateCcw className="size-3" />
                  Reset
                </Button>
              )}
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="px-4 lg:px-6">
              <Alert variant="destructive">
                <AlertTitle>Gagal memuat kategori</AlertTitle>
                <AlertDescription className="flex flex-wrap items-center gap-3">
                  {error}
                  <Button
                    onClick={() => void kategoriQuery.refetch()}
                    size="sm"
                    variant="outline"
                    disabled={isLoading}
                  >
                    Coba lagi
                  </Button>
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Category Table */}
          <div className="px-4 lg:px-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Folder className="size-5 text-primary" />
                  Daftar Kategori
                </CardTitle>
                <CardDescription>
                  {isLoading
                    ? "Memuat data..."
                    : `${filteredList.length} kategori${
                        searchQuery ? " (difilter)" : ""
                      } — halaman ${page} dari ${lastPage}`}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-0">
                {isLoading ? (
                  <div className="flex flex-col gap-2 p-6">
                    {Array.from({ length: 5 }, (_, index) => (
                      <Skeleton key={index} className="h-12 rounded-lg" />
                    ))}
                  </div>
                ) : filteredList.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                    <Folder className="size-12 text-muted-foreground/40" />

                    <div>
                      <p className="font-medium text-foreground">
                        {searchQuery
                          ? "Tidak ada kategori yang cocok"
                          : "Belum ada kategori"}
                      </p>
                      <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                        {searchQuery
                          ? `Tidak ditemukan hasil untuk "${searchQuery}".`
                          : "Mulai tambahkan kategori untuk mengorganisasi produk."}
                      </p>
                    </div>

                    {searchQuery && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleResetSearch}
                      >
                        Reset Pencarian
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-16">No.</TableHead>
                          <TableHead>Nama Kategori</TableHead>
                          <TableHead className="hidden md:table-cell">
                            Dibuat
                          </TableHead>
                          <TableHead className="text-center">
                            Aksi
                          </TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {filteredList.map((kategori, index) => (
                          <TableRow key={kategori.id}>
                            <TableCell className="text-muted-foreground">
                              {(page - 1) * PAGE_SIZE + index + 1}
                            </TableCell>

                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-primary/10 text-primary">
                                  <Folder className="size-4" />
                                </div>
                                <span className="font-medium text-foreground">
                                  {kategori.nama_kategori}
                                </span>
                              </div>
                            </TableCell>

                            <TableCell className="hidden text-xs text-muted-foreground md:table-cell">
                              {kategori.created_at
                                ? new Date(
                                    kategori.created_at,
                                  ).toLocaleDateString("id-ID", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })
                                : "-"}
                            </TableCell>

                            <TableCell>
                              <div className="flex items-center justify-center gap-1">
                                <Button
                                  onClick={() => handleEdit(kategori)}
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 gap-1 text-xs"
                                  aria-label={`Edit kategori ${kategori.nama_kategori}`}
                                >
                                  <Pencil className="size-3.5" />
                                  Edit
                                </Button>

                                <AlertDialog>
                                  <AlertDialogTrigger
                                    render={
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 gap-1 text-xs text-muted-foreground hover:text-destructive"
                                        disabled={deletingId === kategori.id}
                                        aria-label={`Hapus kategori ${kategori.nama_kategori}`}
                                      />
                                    }
                                  >
                                    <Trash2 className="size-3.5" />
                                    {deletingId === kategori.id
                                      ? "Menghapus..."
                                      : "Hapus"}
                                  </AlertDialogTrigger>

                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Hapus kategori?
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Kategori{" "}
                                        <strong>
                                          {kategori.nama_kategori}
                                        </strong>{" "}
                                        akan dihapus secara permanen. Produk
                                        yang terkait kategori ini mungkin
                                        terpengaruh.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>

                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Batal
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() =>
                                          void handleDelete(kategori.id)
                                        }
                                        variant="destructive"
                                      >
                                        Hapus
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>

              {lastPage > 1 && (
                <CardFooter className="flex items-center justify-between border-t border-border px-6 py-4">
                  <p className="text-xs text-muted-foreground">
                    Halaman {page} dari {lastPage}
                  </p>

                  <div className="flex items-center gap-2">
                    <Button
                      disabled={!pagination.canGoPrevious || isLoading}
                      onClick={pagination.goToPreviousPage}
                      size="sm"
                      variant="outline"
                    >
                      <ChevronLeft className="size-4" />
                      Sebelumnya
                    </Button>

                    <Button
                      disabled={!pagination.canGoNext || isLoading}
                      onClick={pagination.goToNextPage}
                      size="sm"
                      variant="outline"
                    >
                      Berikutnya
                      <ChevronRight className="size-4" />
                    </Button>
                  </div>
                </CardFooter>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Sheet Tambah / Edit Kategori */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full overflow-y-auto p-6 pb-12 sm:max-w-md sm:p-8">
          <SheetHeader className="border-b border-border pb-5 pr-8">
            <SheetTitle className="flex items-center gap-2 text-lg font-bold">
              <Folder className="size-5 text-primary" />
              {formMode === "tambah" ? "Tambah Kategori" : "Edit Kategori"}
            </SheetTitle>

            <SheetDescription>
              {formMode === "tambah"
                ? "Isi nama kategori baru untuk produk toko Alkadi."
                : `Ubah nama kategori "${editTarget?.nama_kategori ?? ""}".`}
            </SheetDescription>
          </SheetHeader>

          <form
            onSubmit={(event) => void handleSubmit(event)}
            className="mt-6 flex flex-col gap-5"
          >
            {formError && (
              <Alert variant="destructive">
                <AlertTitle>Gagal menyimpan</AlertTitle>
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col gap-2">
              <Label htmlFor="nama-kategori">
                Nama Kategori <span className="text-destructive">*</span>
              </Label>

              <Input
                id="nama-kategori"
                placeholder="Contoh: Sayuran Hijau"
                value={form.nama_kategori}
                onChange={(event) =>
                  setForm({ nama_kategori: event.target.value })
                }
                disabled={isSaving}
                autoFocus
              />

              <p className="text-xs text-muted-foreground">
                Nama kategori akan ditampilkan pada halaman produk untuk
                pelanggan.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={isSaving}
                className="flex-1"
              >
                {isSaving
                  ? "Menyimpan..."
                  : formMode === "tambah"
                    ? "Simpan Kategori"
                    : "Perbarui Kategori"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => setSheetOpen(false)}
                disabled={isSaving}
              >
                Batal
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
