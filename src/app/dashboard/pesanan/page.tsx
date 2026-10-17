"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Filter,
  MapPin,
  PackageOpen,
  RotateCcw,
  ShoppingCart,
  Truck,
  XCircle,
} from "lucide-react";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { listLokasi } from "@/services/lokasiService";
import {
  listAdminPesanan,
  updateAdminPesananStatus,
} from "@/services/pesananService";
import { getProfile } from "@/services/profileService";
import type {
  Lokasi,
  MetodePesanan,
  PenggunaLogin,
  Pesanan,
  StatusPesanan,
} from "@/types";

interface PesananFilterParams {
  page?: number;
  status?: StatusPesanan;
  lokasi_id?: number;
  metode?: MetodePesanan;
  search?: string;
}

const STATUS_OPTIONS: { value: StatusPesanan | "semua"; label: string }[] = [
  { value: "semua", label: "Semua Status" },
  { value: "pending", label: "Menunggu" },
  { value: "diproses", label: "Diproses" },
  { value: "dikirim", label: "Dikirim" },
  { value: "selesai", label: "Selesai" },
  { value: "dibatalkan", label: "Dibatalkan" },
];

const STATUS_FLOW: StatusPesanan[] = [
  "pending",
  "diproses",
  "dikirim",
  "selesai",
];

function getNextStatus(current: StatusPesanan): StatusPesanan | null {
  const idx = STATUS_FLOW.indexOf(current);
  if (idx === -1 || idx === STATUS_FLOW.length - 1) return null;
  return STATUS_FLOW[idx + 1];
}

function getStatusBadgeVariant(
  status: StatusPesanan,
): "default" | "secondary" | "outline" | "destructive" {
  switch (status) {
    case "selesai":
      return "default";
    case "dikirim":
      return "secondary";
    case "diproses":
      return "outline";
    case "dibatalkan":
      return "destructive";
    default:
      return "outline";
  }
}

function getStatusLabel(status: StatusPesanan): string {
  switch (status) {
    case "pending":
      return "Menunggu";
    case "diproses":
      return "Diproses";
    case "dikirim":
      return "Dikirim";
    case "selesai":
      return "Selesai";
    case "dibatalkan":
      return "Dibatalkan";
  }
}

function getStatusIcon(status: StatusPesanan) {
  switch (status) {
    case "selesai":
      return <CheckCircle2 className="size-3.5 text-primary" />;
    case "dikirim":
      return <Truck className="size-3.5 text-blue-500" />;
    case "diproses":
      return <Clock className="size-3.5 text-amber-500" />;
    case "dibatalkan":
      return <XCircle className="size-3.5 text-destructive" />;
    default:
      return <AlertCircle className="size-3.5 text-muted-foreground" />;
  }
}

function getMetodeLabel(metode: MetodePesanan): string {
  return metode === "pesan_antar" ? "Pesan Antar" : "Ambil di Toko";
}

export default function PesananPage() {
  const router = useRouter();

  const [currentUser, setCurrentUser] = React.useState<PenggunaLogin | null>(
    null,
  );
  const [pesananList, setPesananList] = React.useState<Pesanan[]>([]);
  const [lokasiList, setLokasiList] = React.useState<Lokasi[]>([]);

  const [page, setPage] = React.useState(1);
  const [lastPage, setLastPage] = React.useState(1);
  const [totalPesanan, setTotalPesanan] = React.useState(0);

  const [filterStatus, setFilterStatus] = React.useState<
    StatusPesanan | "semua"
  >("semua");
  const [filterLokasi, setFilterLokasi] = React.useState<number | null>(null);
  const [filterMetode, setFilterMetode] = React.useState<
    MetodePesanan | "semua"
  >("semua");
  const [searchQuery, setSearchQuery] = React.useState("");

  const [isLoadingUser, setIsLoadingUser] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [updatingId, setUpdatingId] = React.useState<number | null>(null);

  const [selectedPesanan, setSelectedPesanan] = React.useState<Pesanan | null>(
    null,
  );

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
        if (res.data.role === "admin" && res.data.lokasi_id) {
          setFilterLokasi(res.data.lokasi_id);
        }
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

  React.useEffect(() => {
    if (!currentUser || currentUser.role !== "superAdmin") return;
    let isCurrent = true;
    void listLokasi({ page: 1 })
      .then((res) => {
        if (isCurrent) setLokasiList(res.data);
      })
      .catch(() => undefined);
    return () => {
      isCurrent = false;
    };
  }, [currentUser]);

  const loadPesanan = React.useCallback(async () => {
    if (isLoadingUser || !currentUser) return;
    setIsLoading(true);
    setError(null);
    try {
      const params: PesananFilterParams = { page };
      if (filterStatus !== "semua") params.status = filterStatus;
      if (currentUser.role === "superAdmin" && filterLokasi !== null)
        params.lokasi_id = filterLokasi;
      if (filterMetode !== "semua") params.metode = filterMetode;
      if (searchQuery) params.search = searchQuery;

      const res = await listAdminPesanan(params);
      setPesananList(res.data);
      setLastPage(res.meta?.last_page ?? 1);
      setTotalPesanan(res.meta?.total ?? res.data.length);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [
    isLoadingUser,
    currentUser,
    page,
    filterStatus,
    filterLokasi,
    filterMetode,
    searchQuery,
  ]);

  React.useEffect(() => {
    void loadPesanan();
  }, [loadPesanan]);

  const handleResetFilter = () => {
    setFilterStatus("semua");
    setFilterMetode("semua");
    setSearchQuery("");
    if (currentUser?.role === "superAdmin") setFilterLokasi(null);
    setPage(1);
  };

  const handleUpdateStatus = async (
    pesananId: number,
    newStatus: StatusPesanan,
  ) => {
    setUpdatingId(pesananId);
    try {
      const res = await updateAdminPesananStatus(pesananId, newStatus);
      setPesananList((prev) =>
        prev.map((p) => (p.id === pesananId ? res.data : p)),
      );
      if (selectedPesanan?.id === pesananId) {
        setSelectedPesanan(res.data);
      }
      toast.add({
        title: "Status Pesanan Diperbarui",
        description: `Pesanan #${res.data.nomor_order} berhasil diubah menjadi ${getStatusLabel(newStatus)}.`,
        type: "success",
      });
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      setError(msg);
      toast.add({
        title: "Gagal Mengubah Status",
        description: msg,
        type: "error",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const isSuperAdmin = currentUser?.role === "superAdmin";
  const hasActiveFilter =
    filterStatus !== "semua" ||
    filterMetode !== "semua" ||
    searchQuery !== "" ||
    (isSuperAdmin && filterLokasi !== null);

  const currentCabangName = React.useMemo(() => {
    if (isSuperAdmin) {
      if (!filterLokasi) return "Semua Cabang";
      const found = lokasiList.find((l) => l.id === filterLokasi);
      return found ? found.nama : `Cabang #${filterLokasi}`;
    }
    return (
      currentUser?.lokasi?.nama ??
      (currentUser?.lokasi_id
        ? `Cabang #${currentUser.lokasi_id}`
        : "Cabang Belum Ditugaskan")
    );
  }, [isSuperAdmin, filterLokasi, lokasiList, currentUser]);

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
        <SiteHeader title="Pesanan" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">

              {/* Header */}
              <div className="px-4 lg:px-6">
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 shadow-xs md:p-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                        Manajemen Pesanan
                      </h2>
                      <Badge
                        variant={isSuperAdmin ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {isSuperAdmin ? "Super Admin" : "Admin"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Kelola dan perbarui status pesanan untuk{" "}
                      <span className="font-semibold text-foreground">
                        {currentCabangName}
                      </span>
                      .
                    </p>
                  </div>

                  {isSuperAdmin && (
                    <div className="flex items-center gap-2">
                      <Building2 className="size-4 text-muted-foreground" />
                      <Select
                        value={filterLokasi ? String(filterLokasi) : "all"}
                        onValueChange={(val) => {
                          setFilterLokasi(val === "all" ? null : Number(val));
                          setPage(1);
                        }}
                      >
                        <SelectTrigger className="w-[220px] font-medium">
                          <SelectValue placeholder="Pilih Cabang" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">
                            🌐 Semua Cabang (Global)
                          </SelectItem>
                          {lokasiList.map((lokasi) => (
                            <SelectItem
                              key={lokasi.id}
                              value={String(lokasi.id)}
                            >
                              🏪 {lokasi.nama}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>

              {/* Filter Bar */}
              <div className="px-4 lg:px-6">
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card/60 p-3 shadow-2xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <Filter className="size-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">
                      Filter:
                    </span>

                    {/* Search */}
                    <Input
                      placeholder="Cari no. order / nama..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setPage(1);
                      }}
                      className="h-8 w-44 text-xs"
                    />

                    {/* Status filter */}
                    <Select
                      value={filterStatus}
                      onValueChange={(val) => {
                        setFilterStatus(val as StatusPesanan | "semua");
                        setPage(1);
                      }}
                    >
                      <SelectTrigger className="h-8 w-36 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Metode filter */}
                    <Select
                      value={filterMetode}
                      onValueChange={(val) => {
                        setFilterMetode(val as MetodePesanan | "semua");
                        setPage(1);
                      }}
                    >
                      <SelectTrigger className="h-8 w-36 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="semua">Semua Metode</SelectItem>
                        <SelectItem value="pesan_antar">Pesan Antar</SelectItem>
                        <SelectItem value="ambil_ditoko">
                          Ambil di Toko
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

              {/* Error */}
              {error ? (
                <div className="px-4 lg:px-6">
                  <Alert variant="destructive">
                    <AlertTitle>Data pesanan gagal dimuat</AlertTitle>
                    <AlertDescription className="flex flex-wrap items-center gap-3">
                      {error}
                      <Button
                        onClick={() => void loadPesanan()}
                        size="sm"
                        variant="outline"
                      >
                        Coba lagi
                      </Button>
                    </AlertDescription>
                  </Alert>
                </div>
              ) : null}

              {/* Pesanan Table */}
              <div className="px-4 lg:px-6">
                <Card>
                  <CardHeader>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <ShoppingCart className="size-5 text-primary" />
                          Daftar Pesanan
                        </CardTitle>
                        <CardDescription>
                          {isLoading
                            ? "Memuat data..."
                            : `${totalPesanan} pesanan ditemukan — halaman ${page} dari ${lastPage}`}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {isLoading ? (
                      <div className="flex flex-col gap-2 p-6">
                        {Array.from({ length: 6 }, (_, i) => (
                          <Skeleton key={i} className="h-12 rounded-lg" />
                        ))}
                      </div>
                    ) : pesananList.length === 0 ? (
                      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center text-muted-foreground">
                        <PackageOpen className="size-12 text-muted-foreground/40" />
                        <div>
                          <p className="font-medium text-foreground">
                            Tidak ada pesanan ditemukan
                          </p>
                          <p className="mt-1 max-w-xs text-xs">
                            {hasActiveFilter
                              ? "Coba ubah atau reset filter yang aktif."
                              : "Belum ada pesanan masuk saat ini."}
                          </p>
                        </div>
                        {hasActiveFilter && (
                          <Button
                            onClick={handleResetFilter}
                            size="sm"
                            variant="outline"
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
                              <TableHead>No. Order</TableHead>
                              <TableHead>Pelanggan</TableHead>
                              {isSuperAdmin && (
                                <TableHead>Cabang</TableHead>
                              )}
                              <TableHead>Metode</TableHead>
                              <TableHead>Tanggal</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">
                                Total
                              </TableHead>
                              <TableHead className="text-center">
                                Aksi
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {pesananList.map((pesanan) => {
                              const nextStatus = getNextStatus(pesanan.status);
                              return (
                                <TableRow key={pesanan.id}>
                                  <TableCell className="font-mono text-xs font-semibold text-primary">
                                    {pesanan.nomor_order}
                                  </TableCell>
                                  <TableCell>
                                    <div className="font-medium text-foreground">
                                      {pesanan.pelanggan?.nama ??
                                        "Pelanggan Umum"}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {pesanan.pelanggan?.email ?? "-"}
                                    </div>
                                  </TableCell>
                                  {isSuperAdmin && (
                                    <TableCell>
                                      <div className="flex items-center gap-1.5 text-xs text-foreground">
                                        <Building2 className="size-3.5 text-primary" />
                                        {pesanan.lokasi_toko?.nama ?? "Pusat"}
                                      </div>
                                    </TableCell>
                                  )}
                                  <TableCell>
                                    <Badge
                                      variant={
                                        pesanan.metode === "pesan_antar"
                                          ? "default"
                                          : "outline"
                                      }
                                      className="text-[11px]"
                                    >
                                      {getMetodeLabel(pesanan.metode)}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-xs text-muted-foreground">
                                    {new Date(
                                      pesanan.tanggal_pemesanan,
                                    ).toLocaleDateString("id-ID", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    })}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-1.5">
                                      {getStatusIcon(pesanan.status)}
                                      <Badge
                                        variant={getStatusBadgeVariant(
                                          pesanan.status,
                                        )}
                                        className="text-[11px]"
                                      >
                                        {getStatusLabel(pesanan.status)}
                                      </Badge>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-right font-semibold tabular-nums text-sm text-foreground">
                                    {formatRupiah(
                                      Number(pesanan.total_harga) +
                                        Number(pesanan.biaya_pengiriman),
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center justify-center gap-1">
                                      <Button
                                        onClick={() =>
                                          setSelectedPesanan(pesanan)
                                        }
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 gap-1 text-xs"
                                      >
                                        <Eye className="size-3.5" />
                                        Detail
                                      </Button>
                                      {nextStatus &&
                                        pesanan.status !== "dibatalkan" && (
                                          <Button
                                            onClick={() =>
                                              void handleUpdateStatus(
                                                pesanan.id,
                                                nextStatus,
                                              )
                                            }
                                            disabled={
                                              updatingId === pesanan.id
                                            }
                                            size="sm"
                                            variant="outline"
                                            className="h-8 text-xs"
                                          >
                                            {updatingId === pesanan.id
                                              ? "..."
                                              : `→ ${getStatusLabel(nextStatus)}`}
                                          </Button>
                                        )}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
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

              {/* Detail Sheet */}
              <Sheet
                open={selectedPesanan !== null}
                onOpenChange={(open) => {
                  if (!open) setSelectedPesanan(null);
                }}
              >
                <SheetContent className="w-full overflow-y-auto p-6 pb-12 sm:p-8 sm:pb-14 md:p-10 md:pb-16 data-[side=right]:w-full data-[side=right]:sm:max-w-xl data-[side=right]:md:max-w-2xl sm:max-w-xl md:max-w-2xl">
                  <SheetHeader className="p-0 pb-5 pr-8 border-b border-border">
                    <SheetTitle className="flex items-center gap-2 text-xl font-bold">
                      <ShoppingCart className="size-5 text-primary" />
                      Detail Pesanan
                    </SheetTitle>
                    <SheetDescription className="font-mono text-xs font-medium text-primary">
                      Order ID: {selectedPesanan?.nomor_order}
                    </SheetDescription>
                  </SheetHeader>

                  {selectedPesanan && (
                    <div className="mt-6 flex flex-col gap-6 text-sm">

                      {/* Status Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-muted/30 p-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(selectedPesanan.status)}
                          <span className="font-medium text-foreground">
                            Status:{" "}
                          </span>
                          <Badge
                            variant={getStatusBadgeVariant(
                              selectedPesanan.status,
                            )}
                          >
                            {getStatusLabel(selectedPesanan.status)}
                          </Badge>
                        </div>
                        {getNextStatus(selectedPesanan.status) &&
                          selectedPesanan.status !== "dibatalkan" && (
                            <Button
                              onClick={() =>
                                void handleUpdateStatus(
                                  selectedPesanan.id,
                                  getNextStatus(selectedPesanan.status)!,
                                )
                              }
                              disabled={updatingId === selectedPesanan.id}
                              size="sm"
                              variant="default"
                              className="gap-1.5"
                            >
                              {updatingId === selectedPesanan.id
                                ? "Memperbarui..."
                                : `Ubah ke ${getStatusLabel(getNextStatus(selectedPesanan.status)!)}`}
                            </Button>
                          )}
                      </div>

                      {/* Customer & Branch */}
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="rounded-xl border border-border bg-muted/40 p-4">
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Informasi Pembeli & Toko
                          </h4>
                          <div className="mt-2 space-y-1">
                            <p className="font-semibold text-foreground">
                              {selectedPesanan.pelanggan?.nama ??
                                "Pelanggan Umum"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {selectedPesanan.pelanggan?.email ?? "-"}
                            </p>
                            <div className="mt-2 flex items-center gap-1.5 text-xs text-foreground">
                              <Building2 className="size-3.5 text-primary" />
                              Cabang:{" "}
                              {selectedPesanan.lokasi_toko?.nama ?? "Pusat"}
                            </div>
                            <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                              <span>Metode:</span>
                              <Badge
                                variant={
                                  selectedPesanan.metode === "pesan_antar"
                                    ? "default"
                                    : "outline"
                                }
                                className="text-[10px]"
                              >
                                {getMetodeLabel(selectedPesanan.metode)}
                              </Badge>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                              Tanggal:{" "}
                              {new Date(
                                selectedPesanan.tanggal_pemesanan,
                              ).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>

                        {/* Shipping Address */}
                        {selectedPesanan.metode === "pesan_antar" &&
                        selectedPesanan.alamat ? (
                          <div className="rounded-xl border border-border bg-muted/40 p-4">
                            <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              <MapPin className="size-3.5 text-primary" />
                              Alamat Pengiriman
                            </h4>
                            <p className="mt-2 font-medium text-foreground">
                              {selectedPesanan.alamat.nama_penerima} (
                              {selectedPesanan.alamat.no_hp})
                            </p>
                            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                              {selectedPesanan.alamat.alamat_lengkap}
                            </p>
                          </div>
                        ) : (
                          <div className="flex flex-col justify-center rounded-xl border border-dashed border-border p-4 text-xs text-muted-foreground">
                            <p className="font-medium text-foreground">
                              Pengambilan di Toko
                            </p>
                            <p className="mt-1">
                              Pesanan diambil langsung di gerai cabang{" "}
                              {selectedPesanan.lokasi_toko?.nama ?? "Pusat"}.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Items */}
                      <div>
                        <div className="mb-2.5 flex items-center justify-between">
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Item yang Dipesan
                          </h4>
                          {selectedPesanan.items &&
                            selectedPesanan.items.length > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {selectedPesanan.items.length} item
                              </Badge>
                            )}
                        </div>
                        <div className="divide-y divide-border rounded-xl border border-border">
                          {selectedPesanan.items &&
                          selectedPesanan.items.length > 0 ? (
                            selectedPesanan.items.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center justify-between p-3.5 transition-colors hover:bg-muted/20"
                              >
                                <div className="space-y-0.5">
                                  <p className="font-medium text-foreground">
                                    {item.nama_barang ||
                                      item.barang?.NamaItem ||
                                      "Produk"}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {item.jumlah} unit ×{" "}
                                    {formatRupiah(item.harga)}
                                  </p>
                                </div>
                                <p className="font-semibold tabular-nums text-foreground">
                                  {formatRupiah(item.subtotal)}
                                </p>
                              </div>
                            ))
                          ) : (
                            <p className="p-4 text-xs text-muted-foreground">
                              Data item tidak tersedia.
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Catatan */}
                      {selectedPesanan.catatan && (
                        <div className="rounded-xl border border-border bg-amber-50/50 p-4 dark:bg-amber-950/20">
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                            Catatan Pelanggan
                          </h4>
                          <p className="mt-2 text-xs text-foreground">
                            {selectedPesanan.catatan}
                          </p>
                        </div>
                      )}

                      {/* Total Breakdown */}
                      <div className="space-y-2 rounded-xl border border-border bg-muted/30 p-4 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Subtotal Produk
                          </span>
                          <span className="font-medium tabular-nums text-foreground">
                            {formatRupiah(selectedPesanan.total_harga)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Biaya Pengiriman
                          </span>
                          <span className="font-medium tabular-nums text-foreground">
                            {formatRupiah(selectedPesanan.biaya_pengiriman)}
                          </span>
                        </div>
                        <div className="flex justify-between border-t border-border pt-2 text-base font-bold">
                          <span className="text-foreground">Total Bayar</span>
                          <span className="tabular-nums text-primary">
                            {formatRupiah(
                              Number(selectedPesanan.total_harga) +
                                Number(selectedPesanan.biaya_pengiriman),
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Pembayaran */}
                      {selectedPesanan.pembayaran && (
                        <div className="space-y-2 rounded-xl border border-border p-4 text-xs">
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Info Pembayaran
                          </h4>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Metode
                            </span>
                            <span className="font-medium text-foreground">
                              {selectedPesanan.pembayaran.metode_pembayaran}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Status Bayar
                            </span>
                            <Badge
                              variant={
                                selectedPesanan.pembayaran.status === "berhasil"
                                  ? "default"
                                  : selectedPesanan.pembayaran.status === "gagal"
                                    ? "destructive"
                                    : "outline"
                              }
                              className="text-[10px]"
                            >
                              {selectedPesanan.pembayaran.status}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Transaksi ID
                            </span>
                            <span className="font-mono font-medium text-foreground">
                              {selectedPesanan.pembayaran.transaksi_id}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </SheetContent>
              </Sheet>

            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
