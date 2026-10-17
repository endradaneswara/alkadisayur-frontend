"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Banknote,
  Check,
  ChevronLeft,
  ChevronRight,
  Compass,
  ExternalLink,
  MapPin,
  Pencil,
  Plus,
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
import { formatRupiah, getErrorMessage } from "@/lib/store-catalog";
import { hasAuthSession } from "@/services/api";
import {
  createLokasi,
  deleteLokasi,
  listLokasi,
  updateLokasi,
  type LokasiPayload,
} from "@/services/lokasiService";
import { getProfile } from "@/services/profileService";
import type { Lokasi, PenggunaLogin } from "@/types";

type FormMode = "tambah" | "edit";

interface LokasiFormState {
  nama: string;
  latitude: string;
  longitude: string;
  biaya_pengiriman: string;
  deskripsi: string;
  link_gmaps: string;
}

const EMPTY_FORM: LokasiFormState = {
  nama: "",
  latitude: "",
  longitude: "",
  biaya_pengiriman: "0",
  deskripsi: "",
  link_gmaps: "",
};

export default function LokasiManagementPage() {
  const router = useRouter();

  const [currentUser, setCurrentUser] = React.useState<PenggunaLogin | null>(null);
  const [lokasiList, setLokasiList] = React.useState<Lokasi[]>([]);
  const [page, setPage] = React.useState(1);
  const [lastPage, setLastPage] = React.useState(1);
  const [total, setTotal] = React.useState(0);

  // Filter
  const [searchQuery, setSearchQuery] = React.useState("");

  // Loading & status
  const [isLoadingUser, setIsLoadingUser] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<number | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  // Sheet / form state
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [formMode, setFormMode] = React.useState<FormMode>("tambah");
  const [editTarget, setEditTarget] = React.useState<Lokasi | null>(null);
  const [form, setForm] = React.useState<LokasiFormState>(EMPTY_FORM);

  const isSuperAdmin = currentUser?.role === "superAdmin";

  // Auth check
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

  // Load locations
  const loadLokasi = React.useCallback(async () => {
    if (isLoadingUser || !currentUser) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await listLokasi({ page });
      setLokasiList(res.data);
      setLastPage(res.meta?.last_page ?? 1);
      setTotal(res.meta?.total ?? res.data.length);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [isLoadingUser, currentUser, page]);

  React.useEffect(() => {
    void loadLokasi();
  }, [loadLokasi]);

  // Client-side filter
  const filteredLokasi = React.useMemo(() => {
    if (!searchQuery.trim()) return lokasiList;
    const q = searchQuery.toLowerCase();
    return lokasiList.filter(
      (l) =>
        l.nama.toLowerCase().includes(q) ||
        (l.deskripsi && l.deskripsi.toLowerCase().includes(q)),
    );
  }, [lokasiList, searchQuery]);

  // Open tambah sheet
  const handleOpenTambah = () => {
    setFormMode("tambah");
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setSheetOpen(true);
  };

  // Open edit sheet
  const handleOpenEdit = (lokasi: Lokasi) => {
    setFormMode("edit");
    setEditTarget(lokasi);
    setForm({
      nama: lokasi.nama,
      latitude: String(lokasi.latitude ?? ""),
      longitude: String(lokasi.longitude ?? ""),
      biaya_pengiriman: String(lokasi.biaya_pengiriman ?? 0),
      deskripsi: lokasi.deskripsi ?? "",
      link_gmaps: lokasi.link_gmaps ?? "",
    });
    setFormError(null);
    setSheetOpen(true);
  };

  // Save (tambah / edit)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama.trim()) {
      setFormError("Nama cabang/lokasi wajib diisi.");
      return;
    }

    const lat = parseFloat(form.latitude);
    const lng = parseFloat(form.longitude);
    const biaya = parseFloat(form.biaya_pengiriman);

    if (isNaN(lat)) {
      setFormError("Latitude harus berupa angka yang valid.");
      return;
    }
    if (isNaN(lng)) {
      setFormError("Longitude harus berupa angka yang valid.");
      return;
    }
    if (isNaN(biaya) || biaya < 0) {
      setFormError("Biaya pengiriman harus berupa angka minimal 0.");
      return;
    }

    setIsSaving(true);
    setFormError(null);

    const payload: LokasiPayload = {
      nama: form.nama.trim(),
      latitude: lat,
      longitude: lng,
      biaya_pengiriman: biaya,
      deskripsi: form.deskripsi.trim() || null,
      link_gmaps: form.link_gmaps.trim() || null,
    };

    try {
      if (formMode === "tambah") {
        await createLokasi(payload);
        toast.add({
          title: "Lokasi Cabang Ditambahkan",
          description: `Cabang "${payload.nama}" berhasil ditambahkan.`,
          type: "success",
        });
      } else if (editTarget) {
        await updateLokasi(editTarget.id, payload);
        toast.add({
          title: "Lokasi Cabang Diperbarui",
          description: `Cabang "${payload.nama}" berhasil diperbarui.`,
          type: "success",
        });
      }
      setSheetOpen(false);
      void loadLokasi();
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      setFormError(msg);
      toast.add({
        title: "Gagal Menyimpan Cabang",
        description: msg,
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Delete
  const handleDelete = async (lokasi: Lokasi) => {
    setDeletingId(lokasi.id);
    setError(null);
    try {
      await deleteLokasi(lokasi.id);
      toast.add({
        title: "Lokasi Cabang Dihapus",
        description: `Cabang "${lokasi.nama}" berhasil dihapus.`,
        type: "success",
      });
      void loadLokasi();
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      setError(msg);
      toast.add({
        title: "Gagal Menghapus Cabang",
        description: msg,
        type: "error",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />

        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
          {/* Header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                Manajemen Lokasi Cabang
              </h1>
              <p className="text-xs text-muted-foreground sm:text-sm">
                Kelola titik cabang toko, koordinat pengiriman, dan tarif ongkir
              </p>
            </div>

            {isSuperAdmin && (
              <Button
                onClick={handleOpenTambah}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="mr-1.5 size-4" />
                Tambah Cabang
              </Button>
            )}
          </div>

          {/* Success Alert */}
          {successMessage && (
            <Alert className="border-primary/20 bg-primary/5 text-primary">
              <Check className="size-4 text-primary" />
              <AlertTitle>Berhasil</AlertTitle>
              <AlertDescription className="text-xs sm:text-sm">
                {successMessage}
              </AlertDescription>
            </Alert>
          )}

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertTitle>Terjadi Kesalahan</AlertTitle>
              <AlertDescription className="text-xs sm:text-sm">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Table Card */}
          <Card className="border-border shadow-xs">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-base sm:text-lg">
                    Daftar Lokasi Cabang ({total})
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    {isSuperAdmin
                      ? "Anda memiliki akses penuh untuk menambah, mengedit, dan menghapus cabang"
                      : "Daftar cabang Toko Sayur Alkadi yang aktif"}
                  </CardDescription>
                </div>

                {/* Search */}
                <div className="flex items-center gap-2">
                  <div className="flex h-8 items-center gap-1.5 rounded-md border border-input bg-card px-2.5 shadow-xs">
                    <Search className="size-3.5 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Cari nama cabang..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-6 w-36 border-0 bg-transparent p-0 text-xs shadow-none focus-visible:ring-0 sm:w-48"
                    />
                  </div>

                  {searchQuery && (
                    <Button
                      onClick={() => setSearchQuery("")}
                      size="sm"
                      variant="ghost"
                      className="h-8 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <RotateCcw className="mr-1 size-3.5" />
                      Reset
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border bg-muted/40">
                      <TableHead className="w-12 text-center text-xs">No</TableHead>
                      <TableHead className="text-xs">Nama Cabang</TableHead>
                      <TableHead className="text-xs">Koordinat</TableHead>
                      <TableHead className="text-xs">Biaya Pengiriman</TableHead>
                      <TableHead className="text-xs">Deskripsi</TableHead>
                      {isSuperAdmin && (
                        <TableHead className="w-28 text-right text-xs">Aksi</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading || isLoadingUser ? (
                      Array.from({ length: 4 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell className="text-center">
                            <Skeleton className="mx-auto h-4 w-4" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-32" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-36" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-24" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-44" />
                          </TableCell>
                          {isSuperAdmin && (
                            <TableCell className="text-right">
                              <Skeleton className="ml-auto h-7 w-20" />
                            </TableCell>
                          )}
                        </TableRow>
                      ))
                    ) : filteredLokasi.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={isSuperAdmin ? 6 : 5}
                          className="py-12 text-center text-muted-foreground"
                        >
                          <div className="flex flex-col items-center justify-center gap-2">
                            <MapPin className="size-8 text-muted-foreground/40" />
                            <p className="text-sm font-medium">Tidak ada lokasi cabang ditemukan</p>
                            {searchQuery && (
                              <p className="text-xs text-muted-foreground">
                                Coba ubah kata kunci pencarian
                              </p>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredLokasi.map((lokasi, idx) => (
                        <TableRow
                          key={lokasi.id}
                          className="border-b border-border transition-colors hover:bg-muted/30"
                        >
                          <TableCell className="text-center text-xs text-muted-foreground">
                            {(page - 1) * 15 + idx + 1}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                                <MapPin className="size-3.5" />
                              </div>
                              <span className="text-xs font-semibold text-foreground sm:text-sm">
                                {lokasi.nama}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <span className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
                                <Compass className="size-3 text-muted-foreground/60" />
                                {Number(lokasi.latitude).toFixed(4)}, {Number(lokasi.longitude).toFixed(4)}
                              </span>
                              {lokasi.link_gmaps ? (
                                <a
                                  href={lokasi.link_gmaps}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                                >
                                  <ExternalLink className="size-2.5" />
                                  Buka Google Maps
                                </a>
                              ) : null}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="border-primary/20 bg-primary/5 text-xs font-medium text-primary"
                            >
                              <Banknote className="mr-1 size-3" />
                              {formatRupiah(lokasi.biaya_pengiriman)}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-xs text-xs text-muted-foreground">
                            {lokasi.deskripsi || "-"}
                          </TableCell>
                          {isSuperAdmin && (
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleOpenEdit(lokasi)}
                                  className="size-7 text-muted-foreground hover:text-foreground"
                                  aria-label={`Edit ${lokasi.nama}`}
                                >
                                  <Pencil className="size-3.5" />
                                </Button>

                                <AlertDialog>
                                  <AlertDialogTrigger
                                    render={
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="size-7 text-muted-foreground hover:text-destructive"
                                        disabled={deletingId === lokasi.id}
                                        aria-label={`Hapus ${lokasi.nama}`}
                                      />
                                    }
                                  >
                                    <Trash2 className="size-3.5" />
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Hapus Lokasi Cabang?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Apakah Anda yakin ingin menghapus cabang{" "}
                                        <strong className="text-foreground">{lokasi.nama}</strong>?
                                        Tindakan ini tidak dapat dibatalkan.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Batal</AlertDialogCancel>
                                      <AlertDialogAction
                                        variant="destructive"
                                        onClick={() => void handleDelete(lokasi)}
                                      >
                                        Hapus Cabang
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>

            {/* Pagination */}
            {lastPage > 1 && (
              <CardFooter className="flex items-center justify-between border-t border-border p-4">
                <div className="text-xs text-muted-foreground">
                  Halaman <span className="font-medium text-foreground">{page}</span> dari{" "}
                  <span className="font-medium text-foreground">{lastPage}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1 || isLoading}
                    className="h-8 px-2.5 text-xs"
                    aria-label="Halaman sebelumnya"
                  >
                    <ChevronLeft className="mr-1 size-3.5" />
                    Sebelumnya
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                    disabled={page >= lastPage || isLoading}
                    className="h-8 px-2.5 text-xs"
                    aria-label="Halaman berikutnya"
                  >
                    Selanjutnya
                    <ChevronRight className="ml-1 size-3.5" />
                  </Button>
                </div>
              </CardFooter>
            )}
          </Card>
        </div>

        {/* Sheet Tambah / Edit */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent className="w-full sm:max-w-md p-6 overflow-y-auto">
            <SheetHeader className="mb-6">
              <SheetTitle className="text-lg font-bold">
                {formMode === "tambah" ? "Tambah Cabang Baru" : "Edit Lokasi Cabang"}
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground">
                {formMode === "tambah"
                  ? "Masukkan data cabang toko Alkadi dan koordinatnya"
                  : `Perbarui data untuk cabang ${editTarget?.nama}`}
              </SheetDescription>
            </SheetHeader>

            <form onSubmit={handleSave} className="flex flex-col gap-4">
              {formError && (
                <Alert variant="destructive">
                  <AlertCircle className="size-4" />
                  <AlertDescription className="text-xs">{formError}</AlertDescription>
                </Alert>
              )}

              {/* Nama Cabang */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="nama-cabang">
                  Nama Cabang <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="nama-cabang"
                  placeholder="Contoh: Cabang Utama Kemang"
                  value={form.nama}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, nama: e.target.value }))
                  }
                  disabled={isSaving}
                />
              </div>

              {/* Koordinat */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="latitude">
                    Latitude <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    placeholder="-6.200000"
                    value={form.latitude}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, latitude: e.target.value }))
                    }
                    disabled={isSaving}
                    className="font-mono text-xs"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="longitude">
                    Longitude <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    placeholder="106.816666"
                    value={form.longitude}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, longitude: e.target.value }))
                    }
                    disabled={isSaving}
                    className="font-mono text-xs"
                  />
                </div>
              </div>

              {/* Biaya Pengiriman */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="biaya-pengiriman">
                  Biaya Pengiriman Standar (Rp) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="biaya-pengiriman"
                  type="number"
                  min="0"
                  step="1000"
                  placeholder="10000"
                  value={form.biaya_pengiriman}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, biaya_pengiriman: e.target.value }))
                  }
                  disabled={isSaving}
                />
              </div>

              {/* Deskripsi */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="deskripsi">Deskripsi / Alamat Lengkap</Label>
                <textarea
                  id="deskripsi"
                  placeholder="Keterangan alamat atau area jangkauan cabang ini..."
                  value={form.deskripsi}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setForm((f) => ({ ...f, deskripsi: e.target.value }))
                  }
                  disabled={isSaving}
                  rows={3}
                  className="w-full rounded-lg border border-input bg-card px-3 py-2 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                />
              </div>

              {/* Link Google Maps */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="link-gmaps">Link Google Maps (URL)</Label>
                <Input
                  id="link-gmaps"
                  type="url"
                  placeholder="https://maps.app.goo.gl/... atau https://goo.gl/maps/..."
                  value={form.link_gmaps}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, link_gmaps: e.target.value }))
                  }
                  disabled={isSaving}
                />
                <p className="text-[11px] text-muted-foreground">
                  Tautan Google Maps toko untuk memudahkan pembeli membuka petunjuk arah.
                </p>
              </div>

              <div className="mt-4 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSheetOpen(false)}
                  disabled={isSaving}
                  className="text-xs"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs"
                >
                  {isSaving ? "Menyimpan..." : formMode === "tambah" ? "Tambah Cabang" : "Simpan Perubahan"}
                </Button>
              </div>
            </form>
          </SheetContent>
        </Sheet>
      </SidebarInset>
    </SidebarProvider>
  );
}
