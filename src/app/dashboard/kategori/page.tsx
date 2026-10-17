"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
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

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
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
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
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
import { getErrorMessage } from "@/lib/store-catalog";
import { hasAuthSession } from "@/services/api";
import {
  createKategori,
  deleteKategori,
  listKategori,
  updateKategori,
} from "@/services/kategoriService";
import { getProfile } from "@/services/profileService";
import type { Kategori, PenggunaLogin } from "@/types";

type FormMode = "tambah" | "edit";

interface KategoriFormState {
  nama_kategori: string;
}

const EMPTY_FORM: KategoriFormState = { nama_kategori: "" };

export default function KategoriPage() {
  const router = useRouter();

  const [currentUser, setCurrentUser] = React.useState<PenggunaLogin | null>(
    null,
  );
  const [kategoriList, setKategoriList] = React.useState<Kategori[]>([]);
  const [page, setPage] = React.useState(1);
  const [lastPage, setLastPage] = React.useState(1);
  const [total, setTotal] = React.useState(0);
  const [searchQuery, setSearchQuery] = React.useState("");

  const [isLoadingUser, setIsLoadingUser] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<number | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [formError, setFormError] = React.useState<string | null>(null);

  // Sheet / form state
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [formMode, setFormMode] = React.useState<FormMode>("tambah");
  const [editTarget, setEditTarget] = React.useState<Kategori | null>(null);
  const [form, setForm] = React.useState<KategoriFormState>(EMPTY_FORM);

  // Auth
  React.useEffect(() => {
    let isCurrent = true;
    if (!hasAuthSession()) {
      router.replace("/store/akun/login");
      return;
    }
    void getProfile()
      .then((res) => {
        if (isCurrent) setCurrentUser(res.data);
      })
      .catch((err: unknown) => {
        if (isCurrent) setError(getErrorMessage(err));
      })
      .finally(() => {
        if (isCurrent) setIsLoadingUser(false);
      });
    return () => {
      isCurrent = false;
    };
  }, [router]);

  // Load data
  const loadKategori = React.useCallback(async () => {
    if (isLoadingUser || !currentUser) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await listKategori({ page });
      setKategoriList(res.data);
      setLastPage(res.meta?.last_page ?? 1);
      setTotal(res.meta?.total ?? res.data.length);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [isLoadingUser, currentUser, page]);

  React.useEffect(() => {
    void loadKategori();
  }, [loadKategori]);

  // Filtered list (client-side search since API may not support it)
  const filteredList = React.useMemo(() => {
    if (!searchQuery.trim()) return kategoriList;
    const q = searchQuery.toLowerCase();
    return kategoriList.filter((k) =>
      k.nama_kategori.toLowerCase().includes(q),
    );
  }, [kategoriList, searchQuery]);

  // Open sheet for add
  const handleTambah = () => {
    setFormMode("tambah");
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setSheetOpen(true);
  };

  // Open sheet for edit
  const handleEdit = (kategori: Kategori) => {
    setFormMode("edit");
    setEditTarget(kategori);
    setForm({ nama_kategori: kategori.nama_kategori });
    setFormError(null);
    setSheetOpen(true);
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama_kategori.trim()) {
      setFormError("Nama kategori tidak boleh kosong.");
      return;
    }
    setIsSaving(true);
    setFormError(null);
    try {
      if (formMode === "tambah") {
        const res = await createKategori({ nama_kategori: form.nama_kategori });
        setKategoriList((prev) => [res.data, ...prev]);
        setTotal((t) => t + 1);
        toast.add({
          title: "Kategori Ditambahkan",
          description: `Kategori "${form.nama_kategori}" berhasil ditambahkan.`,
          type: "success",
        });
      } else if (editTarget) {
        const res = await updateKategori(editTarget.id, {
          nama_kategori: form.nama_kategori,
        });
        setKategoriList((prev) =>
          prev.map((k) => (k.id === editTarget.id ? res.data : k)),
        );
        toast.add({
          title: "Kategori Diperbarui",
          description: `Kategori "${form.nama_kategori}" berhasil diperbarui.`,
          type: "success",
        });
      }
      setSheetOpen(false);
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      setFormError(msg);
      toast.add({
        title: "Gagal Menyimpan Kategori",
        description: msg,
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Delete
  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await deleteKategori(id);
      setKategoriList((prev) => prev.filter((k) => k.id !== id));
      setTotal((t) => Math.max(0, t - 1));
      toast.add({
        title: "Kategori Dihapus",
        description: "Kategori berhasil dihapus.",
        type: "success",
      });
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      setError(msg);
      toast.add({
        title: "Gagal Menghapus Kategori",
        description: msg,
        type: "error",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const isSuperAdmin = currentUser?.role === "superAdmin";

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Kategori" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">

              {/* Page Header */}
              <div className="px-4 lg:px-6">
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 shadow-xs md:p-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                        Kategori Produk
                      </h2>
                      <Badge variant="secondary" className="text-xs">
                        {total} kategori
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Kelola daftar kategori produk toko Alkadi.
                    </p>
                  </div>
                  {isSuperAdmin && (
                    <Button onClick={handleTambah} className="gap-2">
                      <FolderPlus className="size-4" />
                      Tambah Kategori
                    </Button>
                  )}
                </div>
              </div>

              {/* Search bar */}
              <div className="px-4 lg:px-6">
                <div className="flex items-center gap-3 rounded-xl border border-border bg-card/60 p-3 shadow-2xs">
                  <Search className="size-4 shrink-0 text-primary" />
                  <Input
                    placeholder="Cari nama kategori..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8 border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 gap-1 text-xs text-muted-foreground"
                      onClick={() => setSearchQuery("")}
                    >
                      <RotateCcw className="size-3" />
                      Reset
                    </Button>
                  )}
                </div>
              </div>

              {/* Error Alert */}
              {error ? (
                <div className="px-4 lg:px-6">
                  <Alert variant="destructive">
                    <AlertTitle>Gagal memuat kategori</AlertTitle>
                    <AlertDescription className="flex flex-wrap items-center gap-3">
                      {error}
                      <Button
                        onClick={() => void loadKategori()}
                        size="sm"
                        variant="outline"
                      >
                        Coba lagi
                      </Button>
                    </AlertDescription>
                  </Alert>
                </div>
              ) : null}

              {/* Table */}
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
                        : `${filteredList.length} kategori${searchQuery ? " (difilter)" : ""} — halaman ${page} dari ${lastPage}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    {isLoading ? (
                      <div className="flex flex-col gap-2 p-6">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Skeleton key={i} className="h-12 rounded-lg" />
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
                            onClick={() => setSearchQuery("")}
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
                              {isSuperAdmin && (
                                <TableHead className="text-center">
                                  Aksi
                                </TableHead>
                              )}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredList.map((kategori, idx) => (
                              <TableRow key={kategori.id}>
                                <TableCell className="text-muted-foreground">
                                  {(page - 1) * 20 + idx + 1}
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
                                {isSuperAdmin && (
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
                                              disabled={
                                                deletingId === kategori.id
                                              }
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
                                              akan dihapus secara permanen.
                                              Produk yang terkait kategori ini
                                              mungkin terpengaruh.
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
                                )}
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
                          disabled={page <= 1 || isLoading}
                          onClick={() =>
                            setPage((prev) => Math.max(1, prev - 1))
                          }
                          size="sm"
                          variant="outline"
                        >
                          <ChevronLeft className="size-4" />
                          Sebelumnya
                        </Button>
                        <Button
                          disabled={page >= lastPage || isLoading}
                          onClick={() =>
                            setPage((prev) => Math.min(lastPage, prev + 1))
                          }
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
        </div>
      </SidebarInset>

      {/* Form Sheet — Tambah / Edit Kategori */}
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

          <form onSubmit={(e) => void handleSubmit(e)} className="mt-6 flex flex-col gap-5">
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
                onChange={(e) =>
                  setForm({ nama_kategori: e.target.value })
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
    </SidebarProvider>
  );
}
