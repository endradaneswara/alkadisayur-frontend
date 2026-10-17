"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileSpreadsheet,
  Filter,
  ImageOff,
  PackagePlus,
  Pencil,
  RotateCcw,
  Search,
  ShoppingBasket,
  Trash2,
  Upload,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  createBarang,
  deleteBarang,
  listBarang,
  updateBarang,
  type BarangPayload,
} from "@/services/barangService";
import {
  confirmImportBarang,
  downloadTemplateBarang,
  exportBarang,
  previewImportBarang,
  type ImportPreviewResult,
} from "@/services/dataService";
import { listKategori } from "@/services/kategoriService";
import { getProfile } from "@/services/profileService";
import type { Barang, Kategori, PenggunaLogin, StatusBarang } from "@/types";

interface BarangFilterParams {
  page?: number;
  kategori_id?: number;
  status?: StatusBarang;
  search?: string;
}

type FormMode = "tambah" | "edit" | "detail";

interface BarangFormState {
  kategori_id: string;
  KodeItem: string;
  Barcode: string;
  SKU: string;
  NamaItem: string;
  Merek: string;
  Stok: string;
  Rak: string;
  TipeItem: string;
  HargaBeli: string;
  HargaJual: string;
  Keterangan: string;
  Status: StatusBarang;
}

const EMPTY_FORM: BarangFormState = {
  kategori_id: "",
  KodeItem: "",
  Barcode: "",
  SKU: "",
  NamaItem: "",
  Merek: "",
  Stok: "",
  Rak: "",
  TipeItem: "",
  HargaBeli: "",
  HargaJual: "",
  Keterangan: "",
  Status: "tersedia",
};

function barangToForm(b: Barang): BarangFormState {
  return {
    kategori_id: String(b.kategori_id),
    KodeItem: b.KodeItem,
    Barcode: b.Barcode,
    SKU: b.SKU,
    NamaItem: b.NamaItem,
    Merek: b.Merek ?? "",
    Stok: String(b.Stok),
    Rak: b.Rak ?? "",
    TipeItem: b.TipeItem ?? "",
    HargaBeli: String(b.HargaBeli),
    HargaJual: String(b.HargaJual),
    Keterangan: b.Keterangan ?? "",
    Status: b.Status,
  };
}

function StatusBadge({ status }: { status: StatusBarang }) {
  return (
    <Badge
      variant={status === "tersedia" ? "default" : "outline"}
      className="text-[11px]"
    >
      {status === "tersedia" ? "Tersedia" : "Tidak Tersedia"}
    </Badge>
  );
}

export default function ProdukPage() {
  const router = useRouter();

  const [currentUser, setCurrentUser] = React.useState<PenggunaLogin | null>(
    null,
  );
  const [barangList, setBarangList] = React.useState<Barang[]>([]);
  const [kategoriList, setKategoriList] = React.useState<Kategori[]>([]);

  const [page, setPage] = React.useState(1);
  const [lastPage, setLastPage] = React.useState(1);
  const [total, setTotal] = React.useState(0);

  const [filterKategori, setFilterKategori] = React.useState<string>("semua");
  const [filterStatus, setFilterStatus] = React.useState<
    StatusBarang | "semua"
  >("semua");
  const [searchQuery, setSearchQuery] = React.useState("");

  const [isLoadingUser, setIsLoadingUser] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<number | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [formError, setFormError] = React.useState<string | null>(null);

  // Sheet state
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [formMode, setFormMode] = React.useState<FormMode>("tambah");
  const [editTarget, setEditTarget] = React.useState<Barang | null>(null);
  const [form, setForm] = React.useState<BarangFormState>(EMPTY_FORM);
  const [fotoFile, setFotoFile] = React.useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = React.useState<string | null>(null);

  // Import & Export state
  const [isExporting, setIsExporting] = React.useState(false);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = React.useState(false);
  const [importSheetOpen, setImportSheetOpen] = React.useState(false);
  const [importFile, setImportFile] = React.useState<File | null>(null);
  const [isPreviewing, setIsPreviewing] = React.useState(false);
  const [isImporting, setIsImporting] = React.useState(false);
  const [previewResult, setPreviewResult] = React.useState<ImportPreviewResult | null>(null);
  const [importError, setImportError] = React.useState<string | null>(null);

  // Auth
  React.useEffect(() => {
    let isCurrent = true;
    if (!hasAuthSession()) {
      router.replace("/store/akun/login");
      return;
    }
    void getProfile()
      .then((res) => {
        if (!isCurrent) return;
        setCurrentUser(res.data);
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

  // Load kategori
  React.useEffect(() => {
    if (isLoadingUser || !currentUser) return;
    void listKategori({ page: 1 })
      .then((res) => setKategoriList(res.data))
      .catch(() => undefined);
  }, [isLoadingUser, currentUser]);

  // Load produk
  const loadBarang = React.useCallback(async () => {
    if (isLoadingUser || !currentUser) return;
    setIsLoading(true);
    setError(null);
    try {
      const params: BarangFilterParams = { page };
      if (filterKategori !== "semua") params.kategori_id = Number(filterKategori);
      if (filterStatus !== "semua") params.status = filterStatus;
      if (searchQuery) params.search = searchQuery;

      const res = await listBarang<Barang>(params);
      setBarangList(res.data);
      setLastPage(res.meta?.last_page ?? 1);
      setTotal(res.meta?.total ?? res.data.length);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [isLoadingUser, currentUser, page, filterKategori, filterStatus, searchQuery]);

  React.useEffect(() => {
    void loadBarang();
  }, [loadBarang]);

  const handleResetFilter = () => {
    setFilterKategori("semua");
    setFilterStatus("semua");
    setSearchQuery("");
    setPage(1);
  };

  const hasActiveFilter =
    filterKategori !== "semua" ||
    filterStatus !== "semua" ||
    searchQuery !== "";

  // Open sheet
  const openSheet = (mode: FormMode, barang?: Barang) => {
    setFormMode(mode);
    setEditTarget(barang ?? null);
    setForm(barang ? barangToForm(barang) : EMPTY_FORM);
    setFotoFile(null);
    setFotoPreview(barang?.Foto ?? null);
    setFormError(null);
    setSheetOpen(true);
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFotoFile(file);
    setFotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.NamaItem.trim()) {
      setFormError("Nama produk tidak boleh kosong.");
      return;
    }
    if (!form.kategori_id) {
      setFormError("Pilih kategori produk.");
      return;
    }
    if (!form.HargaJual || Number(form.HargaJual) <= 0) {
      setFormError("Harga jual harus lebih dari 0.");
      return;
    }
    setIsSaving(true);
    setFormError(null);

    try {
      let payload: BarangPayload | FormData;

      if (fotoFile) {
        const fd = new FormData();
        fd.append("kategori_id", form.kategori_id);
        fd.append("KodeItem", form.KodeItem);
        fd.append("Barcode", form.Barcode);
        fd.append("SKU", form.SKU);
        fd.append("NamaItem", form.NamaItem);
        fd.append("Merek", form.Merek);
        fd.append("Stok", form.Stok || "0");
        fd.append("Rak", form.Rak);
        fd.append("TipeItem", form.TipeItem);
        fd.append("HargaBeli", form.HargaBeli || "0");
        fd.append("HargaJual", form.HargaJual);
        fd.append("Keterangan", form.Keterangan);
        fd.append("Status", form.Status);
        fd.append("Foto", fotoFile);
        payload = fd;
      } else {
        payload = {
          kategori_id: Number(form.kategori_id),
          KodeItem: form.KodeItem,
          Barcode: form.Barcode,
          SKU: form.SKU,
          NamaItem: form.NamaItem,
          Merek: form.Merek || null,
          Stok: Number(form.Stok) || 0,
          Rak: form.Rak || null,
          TipeItem: form.TipeItem || null,
          HargaBeli: Number(form.HargaBeli) || 0,
          HargaJual: Number(form.HargaJual),
          Keterangan: form.Keterangan || null,
          Status: form.Status,
        };
      }

      if (formMode === "tambah") {
        const res = await createBarang(payload);
        setBarangList((prev) => [res.data, ...prev]);
        setTotal((t) => t + 1);
        toast.add({
          title: "Produk Berhasil Ditambahkan",
          description: `Produk "${form.NamaItem}" berhasil disimpan ke katalog.`,
          type: "success",
        });
      } else if (editTarget) {
        const res = await updateBarang(editTarget.id, payload);
        setBarangList((prev) =>
          prev.map((b) => (b.id === editTarget.id ? res.data : b)),
        );
        toast.add({
          title: "Produk Berhasil Diperbarui",
          description: `Produk "${form.NamaItem}" berhasil diperbarui.`,
          type: "success",
        });
      }
      setSheetOpen(false);
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      setFormError(msg);
      toast.add({
        title: "Gagal Menyimpan",
        description: msg,
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await deleteBarang(id);
      setBarangList((prev) => prev.filter((b) => b.id !== id));
      setTotal((t) => Math.max(0, t - 1));
      toast.add({
        title: "Produk Dihapus",
        description: "Produk berhasil dihapus dari katalog.",
        type: "success",
      });
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      setError(msg);
      toast.add({
        title: "Gagal Menghapus Produk",
        description: msg,
        type: "error",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      const blob = await exportBarang();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `export-barang-${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.add({
        title: "Export Berhasil",
        description: "File data produk Excel (.xlsx) berhasil diunduh.",
        type: "success",
      });
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      toast.add({
        title: "Gagal Export Data",
        description: msg,
        type: "error",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadTemplate = async () => {
    setIsDownloadingTemplate(true);
    try {
      const blob = await downloadTemplateBarang();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "template-import-barang.xlsx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.add({
        title: "Template Diunduh",
        description: "Template import produk (.xlsx) berhasil diunduh.",
        type: "info",
      });
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      toast.add({
        title: "Gagal Mengunduh Template",
        description: msg,
        type: "error",
      });
    } finally {
      setIsDownloadingTemplate(false);
    }
  };

  const handlePreviewImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile) {
      setImportError("Pilih file spreadsheet (.xlsx, .xls, .csv) terlebih dahulu.");
      return;
    }
    setIsPreviewing(true);
    setImportError(null);
    setPreviewResult(null);
    try {
      const res = await previewImportBarang(importFile);
      setPreviewResult(res.data);
      if (res.data.valid) {
        toast.add({
          title: "Pratinjau Berhasil",
          description: `Ditemukan ${res.data.created} produk baru dan ${res.data.updated} produk diperbarui.`,
          type: "info",
        });
      } else {
        toast.add({
          title: "Validasi Gagal",
          description: "Terdapat data tidak valid pada file Excel. Periksa daftar error.",
          type: "error",
        });
      }
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      setImportError(msg);
      toast.add({
        title: "Gagal Memproses File",
        description: msg,
        type: "error",
      });
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!importFile || !previewResult?.preview_hash) return;
    setIsImporting(true);
    setImportError(null);
    try {
      const res = await confirmImportBarang(importFile, previewResult.preview_hash);
      toast.add({
        title: "Import Berhasil",
        description: `Data produk berhasil disinkronkan (${res.data.created} produk baru, ${res.data.updated} diperbarui).`,
        type: "success",
      });
      setImportSheetOpen(false);
      setImportFile(null);
      setPreviewResult(null);
      void loadBarang();
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      setImportError(msg);
      toast.add({
        title: "Gagal Menyinkronkan Data",
        description: msg,
        type: "error",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const isSuperAdmin = currentUser?.role === "superAdmin";
  const isReadWrite = currentUser?.role === "admin" || isSuperAdmin;

  const setFormField = (field: keyof BarangFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

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
        <SiteHeader title="Produk" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">

              {/* Page Header */}
              <div className="px-4 lg:px-6">
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 shadow-xs md:p-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                        Manajemen Produk
                      </h2>
                      <Badge variant="secondary" className="text-xs">
                        {total} produk
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Kelola katalog produk sayuran toko Alkadi.
                    </p>
                  </div>
                  {isReadWrite && (
                    <div className="flex flex-wrap items-center gap-2">
                      {isSuperAdmin && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleExportExcel}
                            disabled={isExporting}
                            className="h-9 gap-1.5 text-xs"
                          >
                            <Download className="size-3.5" />
                            {isExporting ? "Mengunduh..." : "Export Excel"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setImportFile(null);
                              setPreviewResult(null);
                              setImportError(null);
                              setImportSheetOpen(true);
                            }}
                            className="h-9 gap-1.5 text-xs"
                          >
                            <Upload className="size-3.5" />
                            Import Excel
                          </Button>
                        </>
                      )}
                      <Button onClick={() => openSheet("tambah")} className="h-9 gap-2 text-xs">
                        <PackagePlus className="size-4" />
                        Tambah Produk
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Filter Bar */}
              <div className="px-4 lg:px-6">
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card/60 p-3 shadow-2xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <Filter className="size-4 shrink-0 text-primary" />
                    <span className="text-sm font-medium text-foreground">
                      Filter:
                    </span>

                    {/* Search */}
                    <div className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1">
                      <Search className="size-3.5 text-muted-foreground" />
                      <Input
                        placeholder="Cari nama / kode..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setPage(1);
                        }}
                        className="h-6 w-36 border-0 bg-transparent p-0 text-xs shadow-none focus-visible:ring-0"
                      />
                    </div>

                    {/* Kategori filter */}
                    <Select
                      value={filterKategori}
                      onValueChange={(v) => {
                        setFilterKategori(v ?? "semua");
                        setPage(1);
                      }}
                    >
                      <SelectTrigger className="h-8 w-44 text-xs">
                        <SelectValue placeholder="Semua Kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="semua">Semua Kategori</SelectItem>
                        {kategoriList.map((k) => (
                          <SelectItem key={k.id} value={String(k.id)}>
                            {k.nama_kategori}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Status filter */}
                    <Select
                      value={filterStatus}
                      onValueChange={(v) => {
                        setFilterStatus((v ?? "semua") as StatusBarang | "semua");
                        setPage(1);
                      }}
                    >
                      <SelectTrigger className="h-8 w-36 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="semua">Semua Status</SelectItem>
                        <SelectItem value="tersedia">Tersedia</SelectItem>
                        <SelectItem value="tidak_tersedia">
                          Tidak Tersedia
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {hasActiveFilter && (
                    <Button
                      onClick={handleResetFilter}
                      size="sm"
                      variant="ghost"
                      className="h-8 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <RotateCcw className="mr-1 size-3.5" />
                      Reset Filter
                    </Button>
                  )}
                </div>
              </div>

              {/* Error Alert */}
              {error ? (
                <div className="px-4 lg:px-6">
                  <Alert variant="destructive">
                    <AlertTitle>Gagal memuat produk</AlertTitle>
                    <AlertDescription className="flex flex-wrap items-center gap-3">
                      {error}
                      <Button
                        onClick={() => void loadBarang()}
                        size="sm"
                        variant="outline"
                      >
                        Coba lagi
                      </Button>
                    </AlertDescription>
                  </Alert>
                </div>
              ) : null}

              {/* Product Table */}
              <div className="px-4 lg:px-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingBasket className="size-5 text-primary" />
                      Daftar Produk
                    </CardTitle>
                    <CardDescription>
                      {isLoading
                        ? "Memuat data..."
                        : `${total} produk ditemukan — halaman ${page} dari ${lastPage}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    {isLoading ? (
                      <div className="flex flex-col gap-2 p-6">
                        {Array.from({ length: 6 }, (_, i) => (
                          <Skeleton key={i} className="h-14 rounded-lg" />
                        ))}
                      </div>
                    ) : barangList.length === 0 ? (
                      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                        <ShoppingBasket className="size-12 text-muted-foreground/40" />
                        <div>
                          <p className="font-medium text-foreground">
                            {hasActiveFilter
                              ? "Tidak ada produk yang cocok"
                              : "Belum ada produk"}
                          </p>
                          <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                            {hasActiveFilter
                              ? "Coba ubah atau reset filter yang aktif."
                              : "Mulai tambahkan produk ke katalog toko."}
                          </p>
                        </div>
                        {hasActiveFilter && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleResetFilter}
                          >
                            Reset Filter
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Produk</TableHead>
                              <TableHead>Kode / SKU</TableHead>
                              <TableHead>Kategori</TableHead>
                              <TableHead className="text-right">Stok</TableHead>
                              <TableHead className="text-right">
                                Harga Jual
                              </TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-center">Aksi</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {barangList.map((barang) => (
                              <TableRow key={barang.id}>
                                <TableCell>
                                  <div className="flex items-center gap-3">
                                    {/* Product thumbnail */}
                                    <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/50">
                                      {barang.Foto ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                          src={barang.Foto}
                                          alt={barang.NamaItem}
                                          className="size-10 object-cover"
                                        />
                                      ) : (
                                        <ImageOff className="size-4 text-muted-foreground/50" />
                                      )}
                                    </div>
                                    <div>
                                      <p className="font-medium text-foreground">
                                        {barang.NamaItem}
                                      </p>
                                      {barang.Merek && (
                                        <p className="text-xs text-muted-foreground">
                                          {barang.Merek}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="font-mono text-xs text-foreground">
                                    {barang.KodeItem}
                                  </div>
                                  <div className="font-mono text-xs text-muted-foreground">
                                    {barang.SKU}
                                  </div>
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground">
                                  {barang.nama_kategori ?? "-"}
                                </TableCell>
                                <TableCell className="text-right tabular-nums">
                                  <span
                                    className={`font-medium ${
                                      barang.Stok === 0
                                        ? "text-destructive"
                                        : barang.Stok <= 10
                                          ? "text-amber-600 dark:text-amber-400"
                                          : "text-foreground"
                                    }`}
                                  >
                                    {barang.Stok}
                                  </span>
                                  {barang.Stok <= 10 && barang.Stok > 0 && (
                                    <p className="text-[10px] text-amber-600 dark:text-amber-400">
                                      Stok Menipis
                                    </p>
                                  )}
                                  {barang.Stok === 0 && (
                                    <p className="text-[10px] text-destructive">
                                      Habis
                                    </p>
                                  )}
                                </TableCell>
                                <TableCell className="text-right tabular-nums font-semibold text-foreground">
                                  {formatRupiah(barang.HargaJual)}
                                </TableCell>
                                <TableCell>
                                  <StatusBadge status={barang.Status} />
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center justify-center gap-1">
                                    <Button
                                      onClick={() =>
                                        openSheet("detail", barang)
                                      }
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 gap-1 text-xs"
                                      aria-label={`Lihat detail ${barang.NamaItem}`}
                                    >
                                      <Eye className="size-3.5" />
                                      Detail
                                    </Button>
                                    {isReadWrite && (
                                      <>
                                        <Button
                                          onClick={() =>
                                            openSheet("edit", barang)
                                          }
                                          variant="ghost"
                                          size="sm"
                                          className="h-8 gap-1 text-xs"
                                          aria-label={`Edit ${barang.NamaItem}`}
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
                                                  deletingId === barang.id
                                                }
                                                aria-label={`Hapus ${barang.NamaItem}`}
                                              />
                                            }
                                          >
                                            <Trash2 className="size-3.5" />
                                            {deletingId === barang.id
                                              ? "..."
                                              : "Hapus"}
                                          </AlertDialogTrigger>
                                          <AlertDialogContent>
                                            <AlertDialogHeader>
                                              <AlertDialogTitle>
                                                Hapus produk?
                                              </AlertDialogTitle>
                                              <AlertDialogDescription>
                                                Produk{" "}
                                                <strong>
                                                  {barang.NamaItem}
                                                </strong>{" "}
                                                akan dihapus secara permanen.
                                                Tindakan ini tidak dapat
                                                dibatalkan.
                                              </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                              <AlertDialogCancel>
                                                Batal
                                              </AlertDialogCancel>
                                              <AlertDialogAction
                                                onClick={() =>
                                                  void handleDelete(barang.id)
                                                }
                                                variant="destructive"
                                              >
                                                Hapus Produk
                                              </AlertDialogAction>
                                            </AlertDialogFooter>
                                          </AlertDialogContent>
                                        </AlertDialog>
                                      </>
                                    )}
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

      {/* Product Detail / Form Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full overflow-y-auto p-6 pb-16 sm:max-w-xl sm:p-8 data-[side=right]:w-full data-[side=right]:sm:max-w-xl">
          <SheetHeader className="border-b border-border pb-5 pr-8">
            <SheetTitle className="flex items-center gap-2 text-lg font-bold">
              <ShoppingBasket className="size-5 text-primary" />
              {formMode === "tambah"
                ? "Tambah Produk"
                : formMode === "edit"
                  ? "Edit Produk"
                  : "Detail Produk"}
            </SheetTitle>
            <SheetDescription>
              {formMode === "detail"
                ? `Detail lengkap produk ${editTarget?.NamaItem ?? ""}`
                : formMode === "edit"
                  ? `Perbarui informasi produk ${editTarget?.NamaItem ?? ""}`
                  : "Isi informasi produk baru untuk ditambahkan ke katalog."}
            </SheetDescription>
          </SheetHeader>

          {formMode === "detail" && editTarget ? (
            /* ── Detail View ── */
            <div className="mt-6 flex flex-col gap-5 text-sm">
              {/* Product photo */}
              <div className="flex justify-center">
                {editTarget.Foto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={editTarget.Foto}
                    alt={editTarget.NamaItem}
                    className="h-40 w-40 rounded-xl border border-border object-cover"
                  />
                ) : (
                  <div className="flex h-40 w-40 items-center justify-center rounded-xl border border-border bg-muted/50 text-muted-foreground">
                    <ImageOff className="size-10" />
                  </div>
                )}
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Nama Produk", value: editTarget.NamaItem },
                  { label: "Merek", value: editTarget.Merek ?? "-" },
                  { label: "Kategori", value: editTarget.nama_kategori ?? "-" },
                  { label: "Tipe Item", value: editTarget.TipeItem ?? "-" },
                  { label: "Kode Item", value: editTarget.KodeItem },
                  { label: "Barcode", value: editTarget.Barcode },
                  { label: "SKU", value: editTarget.SKU },
                  { label: "Rak", value: editTarget.Rak ?? "-" },
                  {
                    label: "Stok",
                    value: (
                      <span
                        className={
                          editTarget.Stok === 0
                            ? "text-destructive font-semibold"
                            : editTarget.Stok <= 10
                              ? "text-amber-600 font-semibold"
                              : "font-semibold"
                        }
                      >
                        {editTarget.Stok} unit
                        {editTarget.Stok <= 10 && editTarget.Stok > 0
                          ? " (Menipis)"
                          : editTarget.Stok === 0
                            ? " (Habis)"
                            : ""}
                      </span>
                    ),
                  },
                  { label: "Status", value: <StatusBadge status={editTarget.Status} /> },
                  {
                    label: "Harga Beli",
                    value: formatRupiah(editTarget.HargaBeli),
                  },
                  {
                    label: "Harga Jual",
                    value: (
                      <span className="font-semibold text-primary">
                        {formatRupiah(editTarget.HargaJual)}
                      </span>
                    ),
                  },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="rounded-xl border border-border bg-muted/30 p-3"
                  >
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <div className="mt-0.5 font-medium text-foreground">
                      {value}
                    </div>
                  </div>
                ))}
              </div>

              {editTarget.Keterangan && (
                <div className="rounded-xl border border-border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Keterangan</p>
                  <p className="mt-1 text-sm text-foreground">
                    {editTarget.Keterangan}
                  </p>
                </div>
              )}

              {isReadWrite && (
                <Button
                  onClick={() => {
                    setFormMode("edit");
                    setForm(barangToForm(editTarget));
                    setFotoPreview(editTarget.Foto ?? null);
                    setFotoFile(null);
                    setFormError(null);
                  }}
                  variant="outline"
                  className="w-full gap-2"
                >
                  <Pencil className="size-4" />
                  Edit Produk Ini
                </Button>
              )}
            </div>
          ) : (
            /* ── Tambah / Edit Form ── */
            <form
              onSubmit={(e) => void handleSubmit(e)}
              className="mt-6 flex flex-col gap-5"
            >
              {formError && (
                <Alert variant="destructive">
                  <AlertTitle>Gagal menyimpan</AlertTitle>
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              )}

              {/* Foto */}
              <div className="flex flex-col gap-2">
                <Label>Foto Produk</Label>
                <div className="flex items-center gap-4">
                  <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/50">
                    {fotoPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={fotoPreview}
                        alt="Preview"
                        className="size-20 object-cover"
                      />
                    ) : (
                      <ImageOff className="size-8 text-muted-foreground/40" />
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label
                      htmlFor="foto-upload"
                      className="cursor-pointer rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-foreground hover:bg-muted/50"
                    >
                      {fotoPreview ? "Ganti Foto" : "Unggah Foto"}
                    </Label>
                    <input
                      id="foto-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFotoChange}
                    />
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG, atau WebP. Maks. 2MB.
                    </p>
                  </div>
                </div>
              </div>

              {/* Nama & Kategori */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2 sm:col-span-2">
                  <Label htmlFor="nama-item">
                    Nama Produk <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="nama-item"
                    placeholder="Contoh: Bayam Organik"
                    value={form.NamaItem}
                    onChange={(e) => setFormField("NamaItem", e.target.value)}
                    disabled={isSaving}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="kategori">
                    Kategori <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={form.kategori_id}
                    onValueChange={(v) => setFormField("kategori_id", v ?? "")}
                    disabled={isSaving}
                  >
                    <SelectTrigger id="kategori">
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      {kategoriList.map((k) => (
                        <SelectItem key={k.id} value={String(k.id)}>
                          {k.nama_kategori}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="merek">Merek</Label>
                  <Input
                    id="merek"
                    placeholder="Contoh: Kebun Segar"
                    value={form.Merek}
                    onChange={(e) => setFormField("Merek", e.target.value)}
                    disabled={isSaving}
                  />
                </div>
              </div>

              {/* Kode, Barcode, SKU, Rak */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="kode-item">Kode Item</Label>
                  <Input
                    id="kode-item"
                    placeholder="BYM-001"
                    value={form.KodeItem}
                    onChange={(e) => setFormField("KodeItem", e.target.value)}
                    disabled={isSaving}
                    className="font-mono text-sm"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="barcode">Barcode</Label>
                  <Input
                    id="barcode"
                    placeholder="8991234567890"
                    value={form.Barcode}
                    onChange={(e) => setFormField("Barcode", e.target.value)}
                    disabled={isSaving}
                    className="font-mono text-sm"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    placeholder="ALK-BYM-001"
                    value={form.SKU}
                    onChange={(e) => setFormField("SKU", e.target.value)}
                    disabled={isSaving}
                    className="font-mono text-sm"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="rak">Rak</Label>
                  <Input
                    id="rak"
                    placeholder="A1"
                    value={form.Rak}
                    onChange={(e) => setFormField("Rak", e.target.value)}
                    disabled={isSaving}
                  />
                </div>
              </div>

              {/* Tipe Item */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="tipe-item">Tipe Item</Label>
                <Input
                  id="tipe-item"
                  placeholder="Contoh: Sayuran, Buah, Rempah"
                  value={form.TipeItem}
                  onChange={(e) => setFormField("TipeItem", e.target.value)}
                  disabled={isSaving}
                />
              </div>

              {/* Stok & Harga */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="stok">Stok</Label>
                  <Input
                    id="stok"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={form.Stok}
                    onChange={(e) => setFormField("Stok", e.target.value)}
                    disabled={isSaving}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="harga-beli">Harga Beli (Rp)</Label>
                  <Input
                    id="harga-beli"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={form.HargaBeli}
                    onChange={(e) => setFormField("HargaBeli", e.target.value)}
                    disabled={isSaving}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="harga-jual">
                    Harga Jual (Rp) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="harga-jual"
                    type="number"
                    min="1"
                    placeholder="0"
                    value={form.HargaJual}
                    onChange={(e) => setFormField("HargaJual", e.target.value)}
                    disabled={isSaving}
                  />
                </div>
              </div>

              {/* Status */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={form.Status}
                  onValueChange={(v) =>
                    setFormField("Status", (v ?? "tersedia") as StatusBarang)
                  }
                  disabled={isSaving}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tersedia">Tersedia</SelectItem>
                    <SelectItem value="tidak_tersedia">
                      Tidak Tersedia
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Keterangan */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="keterangan">Keterangan</Label>
                <textarea
                  id="keterangan"
                  rows={3}
                  placeholder="Deskripsi singkat produk..."
                  value={form.Keterangan}
                  onChange={(e) => setFormField("Keterangan", e.target.value)}
                  disabled={isSaving}
                  className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                />
              </div>

              <div className="flex gap-3 pt-1">
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1"
                >
                  {isSaving
                    ? "Menyimpan..."
                    : formMode === "tambah"
                      ? "Simpan Produk"
                      : "Perbarui Produk"}
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
          )}
        </SheetContent>
      </Sheet>

      {/* Sheet Import Excel */}
      <Sheet open={importSheetOpen} onOpenChange={setImportSheetOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-6">
          <SheetHeader className="mb-6">
            <div className="flex items-center gap-2 text-primary">
              <FileSpreadsheet className="size-5" />
              <SheetTitle className="text-lg font-bold">Import Data Produk Excel</SheetTitle>
            </div>
            <SheetDescription className="text-xs text-muted-foreground">
              Unggah file spreadsheet (.xlsx, .xls, .csv) untuk menambah atau memperbarui data produk secara massal.
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-col gap-5">
            {/* Download Template Banner */}
            <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 p-3.5">
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-primary">Belum memiliki format file?</p>
                <p className="text-[11px] text-muted-foreground">
                  Gunakan template resmi untuk format kolom yang valid.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDownloadTemplate}
                disabled={isDownloadingTemplate}
                className="shrink-0 h-8 text-xs border-primary/30 text-primary hover:bg-primary/10 gap-1.5"
              >
                <Download className="size-3.5" />
                {isDownloadingTemplate ? "Mengunduh..." : "Unduh Template"}
              </Button>
            </div>

            {/* Error banner */}
            {importError && (
              <Alert variant="destructive">
                <AlertDescription className="text-xs">{importError}</AlertDescription>
              </Alert>
            )}

            {/* Step 1: File selection */}
            <form onSubmit={handlePreviewImport} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="excel-file">Pilih File Spreadsheet</Label>
                <div className="rounded-xl border border-dashed border-border bg-card p-4 text-center">
                  <Input
                    id="excel-file"
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={(e) => {
                      const file = e.target.files?.[0] ?? null;
                      setImportFile(file);
                      setPreviewResult(null);
                      setImportError(null);
                    }}
                    disabled={isPreviewing || isImporting}
                    className="cursor-pointer text-xs"
                  />
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    Format yang didukung: Microsoft Excel (.xlsx, .xls) atau CSV (.csv)
                  </p>
                </div>
              </div>

              {!previewResult?.valid && (
                <Button
                  type="submit"
                  disabled={!importFile || isPreviewing || isImporting}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs h-9"
                >
                  {isPreviewing ? "Memeriksa data file..." : "Pratinjau Data Excel"}
                </Button>
              )}
            </form>

            {/* Step 2: Preview summary */}
            {previewResult && (
              <div className="flex flex-col gap-4 rounded-xl border border-border bg-muted/20 p-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-foreground">Hasil Pratinjau</h4>
                  <Badge variant={previewResult.valid ? "default" : "destructive"} className="text-[10px]">
                    {previewResult.valid ? "File Valid" : "Terdapat Kesalahan"}
                  </Badge>
                </div>

                {/* Counts */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-2.5">
                    <div className="text-lg font-bold text-primary">+{previewResult.created}</div>
                    <div className="text-[10px] text-muted-foreground font-medium">Produk Baru</div>
                  </div>
                  <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/30 p-2.5">
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{previewResult.updated}</div>
                    <div className="text-[10px] text-muted-foreground font-medium">Diperbarui</div>
                  </div>
                  <div className="rounded-lg border border-border bg-card p-2.5">
                    <div className="text-lg font-bold text-muted-foreground">{previewResult.unchanged}</div>
                    <div className="text-[10px] text-muted-foreground font-medium">Tidak Berubah</div>
                  </div>
                </div>

                {/* Stock Changes list */}
                {previewResult.stock_changes && previewResult.stock_changes.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-medium text-foreground">
                      Perubahan Stok ({previewResult.stock_changes.length} produk):
                    </span>
                    <div className="max-h-36 overflow-y-auto rounded-lg border border-border bg-card p-2 text-xs divide-y divide-border">
                      {previewResult.stock_changes.map((sc, i) => (
                        <div key={i} className="flex items-center justify-between py-1 px-1">
                          <span className="truncate max-w-[180px] font-medium">{sc.NamaItem}</span>
                          <span className="text-muted-foreground font-mono text-[11px]">
                            {sc.from} → <strong className="text-primary">{sc.to}</strong>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Error items list */}
                {previewResult.errors && previewResult.errors.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-medium text-destructive">
                      Daftar Kesalahan ({previewResult.errors.length}):
                    </span>
                    <div className="max-h-40 overflow-y-auto rounded-lg border border-destructive/20 bg-destructive/5 p-2 text-xs divide-y divide-destructive/10">
                      {previewResult.errors.map((err, i) => (
                        <div key={i} className="py-1 px-1 text-[11px] text-destructive">
                          <span className="font-semibold">Baris {err.row}</span> ({err.field}): {err.message}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Confirm import button */}
                {previewResult.valid && (
                  <div className="mt-2 flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setPreviewResult(null)}
                      disabled={isImporting}
                      className="flex-1 text-xs"
                    >
                      Batal
                    </Button>
                    <Button
                      type="button"
                      onClick={() => void handleConfirmImport()}
                      disabled={isImporting}
                      className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 text-xs"
                    >
                      {isImporting ? "Menyinkronkan..." : "Konfirmasi & Sinkronkan"}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </SidebarProvider>
  );
}
