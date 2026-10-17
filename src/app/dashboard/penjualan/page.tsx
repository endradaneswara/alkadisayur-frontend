"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BanknoteIcon,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  MapPin,
  PackageOpen,
  RotateCcw,
  ShoppingBag,
  ShoppingCart,
  TrendingUp,
  Truck,
} from "lucide-react";

import { AppSidebar } from "@/components/app-sidebar";
import { ChartPenjualan } from "@/components/chart-area-interactive";
import { SiteHeader } from "@/components/site-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
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
import { formatRupiah, getErrorMessage } from "@/lib/store-catalog";
import { hasAuthSession } from "@/services/api";
import { getDashboard } from "@/services/dashboardService";
import { listLokasi } from "@/services/lokasiService";
import {
  getRingkasanPenjualanAdmin,
  getRingkasanPenjualanSuperAdmin,
  listPenjualanAdmin,
  listPenjualanSuperAdmin,
} from "@/services/penjualanService";
import { getProfile } from "@/services/profileService";
import type {
  Dashboard,
  Lokasi,
  PenggunaLogin,
  Penjualan,
  RentangGrafik,
  RingkasanPenjualan,
} from "@/types";

export default function PenjualanPage() {
  const router = useRouter();

  const [currentUser, setCurrentUser] = React.useState<PenggunaLogin | null>(
    null,
  );
  const [dashboard, setDashboard] = React.useState<Dashboard | null>(null);
  const [ringkasan, setRingkasan] = React.useState<RingkasanPenjualan | null>(
    null,
  );
  const [penjualanList, setPenjualanList] = React.useState<Penjualan[]>([]);
  const [lokasiList, setLokasiList] = React.useState<Lokasi[]>([]);

  const [selectedLokasiId, setSelectedLokasiId] = React.useState<number | null>(
    null,
  );
  const [rentang, setRentang] = React.useState<RentangGrafik>("7h");
  const [page, setPage] = React.useState(1);
  const [lastPage, setLastPage] = React.useState(1);

  const [tanggalMulai, setTanggalMulai] = React.useState("");
  const [tanggalSelesai, setTanggalSelesai] = React.useState("");

  const [isLoadingUser, setIsLoadingUser] = React.useState(true);
  const [isLoadingDashboard, setIsLoadingDashboard] = React.useState(true);
  const [isLoadingTable, setIsLoadingTable] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [selectedPenjualan, setSelectedPenjualan] =
    React.useState<Penjualan | null>(null);

  const isSuperAdmin = currentUser?.role === "superAdmin";
  const isAdmin = currentUser?.role === "admin";

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
          setSelectedLokasiId(res.data.lokasi_id);
        }
      })
      .catch((err: unknown) => {
        if (!isCurrent) return;
        setError(getErrorMessage(err));
      })
      .finally(() => {
        if (isCurrent) setIsLoadingUser(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [router]);

  React.useEffect(() => {
    if (!isSuperAdmin) return;
    let isCurrent = true;

    void listLokasi({ page: 1 })
      .then((res) => {
        if (isCurrent) {
          setLokasiList(res.data);
        }
      })
      .catch(() => {
        // Silently continue if cabang list fails to load
      });

    return () => {
      isCurrent = false;
    };
  }, [isSuperAdmin]);

  const loadData = React.useCallback(async () => {
    if (isLoadingUser || !currentUser) return;

    setIsLoadingDashboard(true);
    setIsLoadingTable(true);
    setError(null);

    const filterParams = {
      page,
      lokasi_id: isSuperAdmin ? selectedLokasiId : undefined,
      tanggal_mulai: tanggalMulai || undefined,
      tanggal_selesai: tanggalSelesai || undefined,
    };

    try {
      const dashboardPromise = getDashboard(
        rentang,
        isSuperAdmin ? selectedLokasiId : undefined,
      );

      const summaryPromise = isSuperAdmin
        ? getRingkasanPenjualanSuperAdmin(filterParams)
        : getRingkasanPenjualanAdmin(filterParams);

      const listPromise = isSuperAdmin
        ? listPenjualanSuperAdmin(filterParams)
        : listPenjualanAdmin(filterParams);

      const [dashRes, sumRes, listRes] = await Promise.all([
        dashboardPromise,
        summaryPromise,
        listPromise,
      ]);

      setDashboard(dashRes.data);
      setRingkasan(sumRes.data);
      setPenjualanList(listRes.data);
      setLastPage(listRes.meta?.last_page || 1);
    } catch (loadError: unknown) {
      setError(getErrorMessage(loadError));
    } finally {
      setIsLoadingDashboard(false);
      setIsLoadingTable(false);
    }
  }, [
    isLoadingUser,
    currentUser,
    isSuperAdmin,
    selectedLokasiId,
    rentang,
    page,
    tanggalMulai,
    tanggalSelesai,
  ]);

  React.useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleResetFilter = () => {
    setTanggalMulai("");
    setTanggalSelesai("");
    if (isSuperAdmin) {
      setSelectedLokasiId(null);
    }
    setPage(1);
  };

  const totalPendapatan = Number(
    ringkasan?.total_pendapatan ?? dashboard?.ringkasan.total_penjualan ?? 0,
  );
  const totalTransaksi = Number(
    ringkasan?.total_transaksi ?? dashboard?.pesanan.selesai ?? 0,
  );
  const totalPengiriman = Number(ringkasan?.total_pengiriman ?? 0);
  const aov = totalTransaksi > 0 ? totalPendapatan / totalTransaksi : 0;

  const currentCabangName = React.useMemo(() => {
    if (isSuperAdmin) {
      if (!selectedLokasiId) return "Semua Cabang (Global)";
      const found = lokasiList.find((l) => l.id === selectedLokasiId);
      return found ? found.nama : `Cabang #${selectedLokasiId}`;
    }
    if (isAdmin) {
      return (
        currentUser?.lokasi?.nama ||
        (currentUser?.lokasi_id
          ? `Cabang #${currentUser.lokasi_id}`
          : "Cabang Belum Ditugaskan")
      );
    }
    return "Semua Cabang";
  }, [isSuperAdmin, isAdmin, selectedLokasiId, lokasiList, currentUser]);

  const kartuStatistik = [
    {
      judul: "Total Pendapatan",
      nilai: formatRupiah(totalPendapatan),
      ikon: <BanknoteIcon className="size-5" />,
      footerUtama: "Akumulasi pesanan selesai",
      footerKeterangan: "Termasuk total belanja + ongkir",
      badge: `${totalTransaksi} transaksi selesai`,
    },
    {
      judul: "Total Transaksi Selesai",
      nilai: String(totalTransaksi),
      ikon: <ShoppingCart className="size-5" />,
      footerUtama: "Pesanan berhasil dipenuhi",
      footerKeterangan: "Pesan antar & ambil di toko",
      badge: `Status: Selesai`,
    },
    {
      judul: "Biaya Pengiriman",
      nilai: formatRupiah(totalPengiriman),
      ikon: <Truck className="size-5" />,
      footerUtama: "Total pendapatan logistik",
      footerKeterangan: "Dari pesanan metode kirim antar",
    },
    {
      judul: "Rata-rata Transaksi (AOV)",
      nilai: formatRupiah(aov),
      ikon: <ShoppingBag className="size-5" />,
      footerUtama: "Nilai rata-rata per order",
      footerKeterangan: "Ukuran keranjang pelanggan",
    },
  ];

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
        <SiteHeader title="Penjualan" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {/* Header and Controls */}
              <div className="flex flex-col gap-4 px-4 lg:px-6">
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 shadow-xs md:p-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                        Dashboard Penjualan
                      </h2>
                      <Badge
                        variant={isSuperAdmin ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {isSuperAdmin ? "Super Admin" : "Admin"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Menampilkan ringkasan pendapatan dan daftar transaksi
                      pesanan selesai untuk{" "}
                      <span className="font-semibold text-foreground">
                        {currentCabangName}
                      </span>
                      .
                    </p>
                  </div>

                  {/* Branch selector for Super Admin or Badge for Admin */}
                  <div className="flex flex-wrap items-center gap-3">
                    {isSuperAdmin ? (
                      <div className="flex items-center gap-2">
                        <Building2 className="size-4 text-muted-foreground" />
                        <Select
                          value={
                            selectedLokasiId ? String(selectedLokasiId) : "all"
                          }
                          onValueChange={(val) => {
                            setSelectedLokasiId(
                              val === "all" ? null : Number(val),
                            );
                            setPage(1);
                          }}
                        >
                          <SelectTrigger className="w-[230px] font-medium">
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
                    ) : (
                      <div className="flex items-center gap-2 rounded-xl border border-border bg-secondary/50 px-3.5 py-2 text-sm font-medium text-foreground">
                        <Building2 className="size-4 text-primary" />
                        <span>{currentCabangName}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Date range filter card */}
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card/60 p-3 shadow-2xs">
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <Filter className="size-4 text-primary" />
                    <span className="font-medium text-foreground">
                      Filter Tanggal:
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs">Dari</span>
                      <Input
                        type="date"
                        value={tanggalMulai}
                        onChange={(e) => {
                          setTanggalMulai(e.target.value);
                          setPage(1);
                        }}
                        className="h-8 w-36 text-xs"
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs">Sampai</span>
                      <Input
                        type="date"
                        value={tanggalSelesai}
                        onChange={(e) => {
                          setTanggalSelesai(e.target.value);
                          setPage(1);
                        }}
                        className="h-8 w-36 text-xs"
                      />
                    </div>
                  </div>

                  {(tanggalMulai ||
                    tanggalSelesai ||
                    (isSuperAdmin && selectedLokasiId !== null)) && (
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
                    <AlertTitle>Data penjualan gagal dimuat</AlertTitle>
                    <AlertDescription className="flex flex-wrap items-center gap-3">
                      {error}
                      <Button
                        onClick={() => void loadData()}
                        size="sm"
                        variant="outline"
                      >
                        Coba lagi
                      </Button>
                    </AlertDescription>
                  </Alert>
                </div>
              ) : null}

              {/* Metric Cards - Identical to Dashboard SectionCards */}
              {isLoadingDashboard && !dashboard ? (
                <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
                  {Array.from({ length: 4 }, (_, index) => (
                    <Skeleton className="h-36 rounded-xl" key={index} />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
                  {kartuStatistik.map((item) => (
                    <Card key={item.judul} className="@container/card">
                      <CardHeader>
                        <CardDescription>{item.judul}</CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                          {item.nilai}
                        </CardTitle>
                        {item.badge ? (
                          <CardAction>
                            <Badge variant="outline">
                              <TrendingUp className="size-3" />
                              {item.badge}
                            </Badge>
                          </CardAction>
                        ) : null}
                      </CardHeader>
                      <CardFooter className="flex-col items-start gap-1.5 text-sm">
                        <div className="line-clamp-1 flex gap-2 font-medium">
                          {item.footerUtama}
                        </div>
                        <div className="text-muted-foreground">
                          {item.footerKeterangan}
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}

              {/* Interactive Sales Chart */}
              <div className="px-4 lg:px-6">
                <ChartPenjualan
                  data={dashboard?.grafik_penjualan ?? []}
                  rentang={rentang}
                  onRentangChange={setRentang}
                  isLoading={isLoadingDashboard && !dashboard}
                />
              </div>

              {/* Per-Branch Sales Performance Grid (Special for Super Admin) */}
              {isSuperAdmin &&
              dashboard?.penjualan_per_cabang &&
              dashboard.penjualan_per_cabang.length > 0 ? (
                <div className="px-4 lg:px-6">
                  <Card>
                    <CardHeader>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Building2 className="size-5 text-primary" />
                            Ringkasan Penjualan Masing-Masing Cabang
                          </CardTitle>
                          <CardDescription>
                            Perbandingan akumulasi omset dan total pesanan
                            selesai di setiap cabang toko Alkadi.
                          </CardDescription>
                        </div>
                        {selectedLokasiId !== null && (
                          <Button
                            onClick={() => {
                              setSelectedLokasiId(null);
                              setPage(1);
                            }}
                            size="sm"
                            variant="outline"
                          >
                            Tampilkan Semua Cabang
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {dashboard.penjualan_per_cabang.map((cabang) => {
                          const isSelected = selectedLokasiId === cabang.id;
                          return (
                            <div
                              key={cabang.id}
                              className={`flex flex-col justify-between rounded-xl border p-4 transition-all ${
                                isSelected
                                  ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                                  : "border-border bg-card hover:border-primary/50 hover:bg-muted/30"
                              }`}
                            >
                              <div>
                                <div className="flex items-center justify-between gap-2">
                                  <h4 className="font-heading font-semibold text-foreground">
                                    {cabang.nama}
                                  </h4>
                                  {isSelected && (
                                    <Badge
                                      variant="default"
                                      className="text-[10px]"
                                    >
                                      Dipilih
                                    </Badge>
                                  )}
                                </div>
                                <p className="mt-2 text-2xl font-bold tabular-nums text-primary">
                                  {formatRupiah(cabang.total_penjualan)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {cabang.total_pesanan} transaksi selesai
                                </p>
                              </div>

                              <div className="mt-4 pt-2">
                                <Button
                                  onClick={() => {
                                    setSelectedLokasiId(cabang.id);
                                    setPage(1);
                                  }}
                                  size="sm"
                                  variant={isSelected ? "secondary" : "outline"}
                                  className="w-full text-xs"
                                >
                                  {isSelected
                                    ? "Cabang Aktif"
                                    : "Filter Cabang Ini"}
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : null}

              {/* Sales Transactions Table */}
              <div className="px-4 lg:px-6">
                <Card>
                  <CardHeader>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <CardTitle>Daftar Transaksi Penjualan</CardTitle>
                        <CardDescription>
                          Transaksi pesanan selesai pada {currentCabangName},
                          halaman {page} dari {lastPage}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {isLoadingTable ? (
                      <div className="flex flex-col gap-2 p-6">
                        {Array.from({ length: 5 }, (_, index) => (
                          <Skeleton className="h-12 rounded-lg" key={index} />
                        ))}
                      </div>
                    ) : penjualanList.length === 0 ? (
                      <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-muted-foreground">
                        <PackageOpen className="size-10 text-muted-foreground/60" />
                        <p className="font-medium text-foreground">
                          Belum ada transaksi penjualan selesai
                        </p>
                        <p className="max-w-md text-xs">
                          {isSuperAdmin && selectedLokasiId
                            ? "Tidak ada transaksi selesai pada cabang dan filter yang dipilih."
                            : "Transaksi pesanan akan tercatat di sini setelah status pesanan berubah menjadi selesai."}
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>No. Order</TableHead>
                              <TableHead>Pelanggan</TableHead>
                              <TableHead>Cabang / Lokasi</TableHead>
                              <TableHead>Metode</TableHead>
                              <TableHead>Tanggal Selesai</TableHead>
                              <TableHead className="text-right">
                                Nilai Barang
                              </TableHead>
                              <TableHead className="text-right">
                                Ongkir
                              </TableHead>
                              <TableHead className="text-right">
                                Total Pendapatan
                              </TableHead>
                              <TableHead className="text-center">Aksi</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {penjualanList.map((item) => (
                              <TableRow key={item.id}>
                                <TableCell className="font-mono text-xs font-semibold text-primary">
                                  {item.nomor_order}
                                </TableCell>
                                <TableCell>
                                  <div className="font-medium text-foreground">
                                    {item.pelanggan?.nama || "Pelanggan Umum"}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {item.pelanggan?.email || "-"}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1.5 text-xs text-foreground">
                                    <Building2 className="size-3.5 text-primary" />
                                    <span>
                                      {item.lokasi_toko?.nama || "Pusat"}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      item.metode === "pesan_antar"
                                        ? "default"
                                        : "outline"
                                    }
                                    className="capitalize text-[11px]"
                                  >
                                    {item.metode === "pesan_antar"
                                      ? "Pesan Antar"
                                      : "Ambil di Toko"}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground">
                                  {new Date(
                                    item.tanggal_pemesanan,
                                  ).toLocaleDateString("id-ID", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </TableCell>
                                <TableCell className="text-right tabular-nums text-xs">
                                  {formatRupiah(item.total_harga)}
                                </TableCell>
                                <TableCell className="text-right tabular-nums text-xs text-muted-foreground">
                                  {formatRupiah(item.biaya_pengiriman)}
                                </TableCell>
                                <TableCell className="text-right font-semibold tabular-nums text-sm text-foreground">
                                  {formatRupiah(item.total_pendapatan)}
                                </TableCell>
                                <TableCell className="text-center">
                                  <Button
                                    onClick={() => setSelectedPenjualan(item)}
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 gap-1 text-xs"
                                  >
                                    <Eye className="size-3.5" />
                                    <span>Detail</span>
                                  </Button>
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
                          disabled={page <= 1 || isLoadingTable}
                          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                          size="sm"
                          variant="outline"
                        >
                          <ChevronLeft className="size-4" />
                          Sebelumnya
                        </Button>
                        <Button
                          disabled={page >= lastPage || isLoadingTable}
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

              {/* Order Item Details Sheet */}
              <Sheet
                open={selectedPenjualan !== null}
                onOpenChange={(open) => {
                  if (!open) setSelectedPenjualan(null);
                }}
              >
                <SheetContent className="w-full overflow-y-auto p-6 pb-12 sm:p-8 sm:pb-14 md:p-10 md:pb-16 data-[side=right]:w-full data-[side=right]:sm:max-w-xl data-[side=right]:md:max-w-2xl sm:max-w-xl md:max-w-2xl">
                  <SheetHeader className="p-0 pb-5 pr-8 border-b border-border">
                    <SheetTitle className="flex items-center gap-2 text-xl font-bold">
                      <CheckCircle2 className="size-5 text-primary" />
                      Detail Transaksi Penjualan
                    </SheetTitle>
                    <SheetDescription className="font-mono text-xs font-medium text-primary">
                      Order ID: {selectedPenjualan?.nomor_order}
                    </SheetDescription>
                  </SheetHeader>

                  {selectedPenjualan && (
                    <div className="mt-6 flex flex-col gap-6 text-sm">
                      {/* Customer & Branch + Shipping Address in 2-col grid */}
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="rounded-xl border border-border bg-muted/40 p-4">
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Informasi Pembeli & Toko
                          </h4>
                          <div className="mt-2 space-y-1">
                            <p className="font-semibold text-foreground">
                              {selectedPenjualan.pelanggan?.nama ||
                                "Pelanggan Umum"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {selectedPenjualan.pelanggan?.email || "-"}
                            </p>
                            <div className="mt-2 flex items-center gap-1.5 text-xs text-foreground">
                              <Building2 className="size-3.5 text-primary" />
                              <span>
                                Cabang:{" "}
                                {selectedPenjualan.lokasi_toko?.nama ||
                                  "Pusat"}
                              </span>
                            </div>
                            <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                              <span>Metode:</span>
                              <Badge
                                variant={
                                  selectedPenjualan.metode === "pesan_antar"
                                    ? "default"
                                    : "outline"
                                }
                                className="text-[10px]"
                              >
                                {selectedPenjualan.metode === "pesan_antar"
                                  ? "Pesan Antar"
                                  : "Ambil di Toko"}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {selectedPenjualan.metode === "pesan_antar" &&
                        selectedPenjualan.alamat ? (
                          <div className="rounded-xl border border-border bg-muted/40 p-4">
                            <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              <MapPin className="size-3.5 text-primary" />
                              Alamat Pengiriman
                            </h4>
                            <p className="mt-2 font-medium text-foreground">
                              {selectedPenjualan.alamat.nama_penerima} (
                              {selectedPenjualan.alamat.no_hp})
                            </p>
                            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                              {selectedPenjualan.alamat.alamat_lengkap}
                            </p>
                          </div>
                        ) : (
                          <div className="flex flex-col justify-center rounded-xl border border-dashed border-border p-4 text-xs text-muted-foreground">
                            <p className="font-medium text-foreground">
                              Pengambilan di Toko
                            </p>
                            <p className="mt-1">
                              Pesanan diambil langsung di gerai cabang{" "}
                              {selectedPenjualan.lokasi_toko?.nama || "Pusat"}.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Items Purchased */}
                      <div>
                        <div className="mb-2.5 flex items-center justify-between">
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Item yang Dibeli
                          </h4>
                          {selectedPenjualan.items &&
                            selectedPenjualan.items.length > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {selectedPenjualan.items.length} item
                              </Badge>
                            )}
                        </div>
                        <div className="divide-y divide-border rounded-xl border border-border">
                          {selectedPenjualan.items &&
                          selectedPenjualan.items.length > 0 ? (
                            selectedPenjualan.items.map((it) => (
                              <div
                                key={it.id}
                                className="flex items-center justify-between p-3.5 transition-colors hover:bg-muted/20"
                              >
                                <div className="space-y-0.5">
                                  <p className="font-medium text-foreground">
                                    {it.nama_barang ||
                                      it.barang?.NamaItem ||
                                      "Produk"}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {it.jumlah} unit × {formatRupiah(it.harga)}
                                  </p>
                                </div>
                                <p className="font-semibold tabular-nums text-foreground">
                                  {formatRupiah(it.subtotal)}
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

                      {/* Total Breakdown */}
                      <div className="space-y-2 rounded-xl border border-border bg-muted/30 p-4 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Subtotal Produk
                          </span>
                          <span className="font-medium tabular-nums text-foreground">
                            {formatRupiah(selectedPenjualan.total_harga)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Biaya Pengiriman
                          </span>
                          <span className="font-medium tabular-nums text-foreground">
                            {formatRupiah(selectedPenjualan.biaya_pengiriman)}
                          </span>
                        </div>
                        <div className="flex justify-between border-t border-border pt-2 text-base font-bold">
                          <span className="text-foreground">
                            Total Pendapatan
                          </span>
                          <span className="tabular-nums text-primary">
                            {formatRupiah(selectedPenjualan.total_pendapatan)}
                          </span>
                        </div>
                      </div>
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
