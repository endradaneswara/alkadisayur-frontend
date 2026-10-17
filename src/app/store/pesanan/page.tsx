"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  Calendar,
  Clock,
  ExternalLink,
  PackageCheck,
  PackageOpen,
  RefreshCw,
  ShoppingBag,
  Store,
  Truck,
} from "lucide-react";

import { StoreAccountNav } from "@/components/store-account-nav";
import { StorePageShell } from "@/components/store-page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage, formatRupiah } from "@/lib/store-catalog";
import { hasAuthSession } from "@/services/api";
import { listPesanan } from "@/services/pesananService";
import type { Pesanan, StatusPesanan } from "@/types";

const orderStatusLabels: Record<StatusPesanan, string> = {
  pending: "Menunggu Konfirmasi",
  diproses: "Sedang Diproses",
  dikirim: "Dalam Pengiriman",
  selesai: "Selesai",
  dibatalkan: "Dibatalkan",
};

const orderStatusVariants: Record<
  StatusPesanan,
  "default" | "secondary" | "outline" | "destructive"
> = {
  pending: "outline",
  diproses: "secondary",
  dikirim: "default",
  selesai: "secondary",
  dibatalkan: "destructive",
};

type StatusFilter = "semua" | StatusPesanan;

const filterOptions: { label: string; value: StatusFilter }[] = [
  { label: "Semua Pesanan", value: "semua" },
  { label: "Menunggu Konfirmasi", value: "pending" },
  { label: "Diproses", value: "diproses" },
  { label: "Dalam Pengiriman", value: "dikirim" },
  { label: "Selesai", value: "selesai" },
  { label: "Dibatalkan", value: "dibatalkan" },
];

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Pesanan[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("semua");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await listPesanan({ page });
      setOrders(response.data);
      setLastPage(response.meta?.last_page ?? 1);
      setError(null);
    } catch (loadError: unknown) {
      setError(getErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void Promise.resolve().then(() => {
      if (!hasAuthSession()) {
        router.replace("/store/akun/login");
        return;
      }
      return loadOrders();
    });
  }, [loadOrders, router]);

  // Filter pesanan sesuai tab status yang dipilih
  const filteredOrders = orders.filter((order) => {
    if (statusFilter === "semua") return true;
    return order.status === statusFilter;
  });

  return (
    <StorePageShell>
      <div className="w-full">
        {/* Navigation Tabs Header */}
        <StoreAccountNav
          title="Pesanan Saya"
          badge="Riwayat Belanja"
          description="Pantau perkembangan pesanan sayur segar, status pengiriman kurir, dan riwayat belanja lengkap Anda."
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => void loadOrders()}
              disabled={isLoading}
              className="gap-2"
            >
              <RefreshCw
                className={`size-4 ${isLoading ? "animate-spin" : ""}`}
              />
              Perbarui Data
            </Button>
          }
        />

        {/* Filter Tab Status */}
        <div className="mb-6 flex w-full overflow-x-auto pb-2 scrollbar-none">
          <div className="flex items-center gap-2">
            {filterOptions.map((opt) => {
              const count =
                opt.value === "semua"
                  ? orders.length
                  : orders.filter((o) => o.status === opt.value).length;
              const isActive = statusFilter === opt.value;

              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStatusFilter(opt.value)}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-primary/10 text-primary border border-primary/30 font-semibold"
                      : "bg-card text-muted-foreground border border-border hover:bg-muted/60 hover:text-foreground"
                  }`}
                >
                  <span>{opt.label}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] ${
                      isActive
                        ? "bg-primary text-primary-foreground font-bold"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Alert Error */}
        {error ? (
          <div
            className="mb-6 rounded-2xl border border-destructive/30 bg-destructive/5 p-5 text-sm text-destructive"
            role="alert"
          >
            <div className="flex items-center justify-between gap-4">
              <p>Gagal memuat daftar pesanan: {error}</p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => void loadOrders()}
              >
                Coba Lagi
              </Button>
            </div>
          </div>
        ) : null}

        {/* Skeleton Loading */}
        {isLoading ? (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton className="h-44 w-full rounded-2xl" key={index} />
            ))}
          </div>
        ) : null}

        {/* State Kosong (Belum ada pesanan) */}
        {!isLoading && !error && filteredOrders.length === 0 ? (
          <Card className="border border-border/80 bg-card/60 backdrop-blur-xs">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center sm:py-20">
              <div className="flex size-20 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                <PackageOpen aria-hidden="true" className="size-10" />
              </div>
              <h2 className="mt-5 font-heading text-xl font-bold text-foreground sm:text-2xl">
                {statusFilter === "semua"
                  ? "Belum Ada Riwayat Pesanan"
                  : `Tidak Ada Pesanan dengan Status "${orderStatusLabels[statusFilter as StatusPesanan]}"`}
              </h2>
              <p className="mt-2 max-w-md text-sm text-muted-foreground sm:text-base">
                {statusFilter === "semua"
                  ? "Anda belum melakukan pemesanan. Dapatkan sayuran segar pilihan dan kebutuhan dapur lengkap sekarang juga!"
                  : "Coba ganti filter status di atas untuk melihat pesanan Anda yang lain."}
              </p>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                <Button
                  nativeButton={false}
                  render={<Link href="/store/produk" />}
                  size="lg"
                  className="gap-2"
                >
                  <ShoppingBag className="size-4" />
                  Mulai Belanja Segar
                </Button>
                {statusFilter !== "semua" ? (
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setStatusFilter("semua")}
                  >
                    Tampilkan Semua Pesanan
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* Daftar Kartu Pesanan Lebar Penuh */}
        {!isLoading && filteredOrders.length > 0 ? (
          <section aria-label="Daftar pesanan" className="flex flex-col gap-4">
            {filteredOrders.map((order) => (
              <Card
                key={order.id}
                className="overflow-hidden border border-border/80 transition-all duration-200 hover:border-primary/50 hover:shadow-md"
              >
                {/* Header Kartu Pesanan */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/30 px-5 py-3.5 sm:px-6">
                  <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
                    <span className="font-mono font-bold text-foreground">
                      #{order.nomor_order}
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                      <Calendar className="size-3.5" />
                      {new Date(order.tanggal_pemesanan).toLocaleString(
                        "id-ID",
                        {
                          dateStyle: "medium",
                          timeStyle: "short",
                        },
                      )}
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                      {order.metode === "pesan_antar" ? (
                        <>
                          <Truck className="size-3.5 text-emerald-600" />
                          <span>Pesan Antar</span>
                        </>
                      ) : (
                        <>
                          <Store className="size-3.5 text-primary" />
                          <span>Ambil di Toko</span>
                        </>
                      )}
                    </span>
                  </div>

                  <Badge
                    variant={orderStatusVariants[order.status]}
                    className="text-xs font-semibold px-3 py-1"
                  >
                    {orderStatusLabels[order.status]}
                  </Badge>
                </div>

                {/* Body Kartu Pesanan */}
                <CardContent className="flex flex-col justify-between gap-6 p-5 sm:p-6 lg:flex-row lg:items-center">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <PackageCheck className="size-4 text-primary" />
                      <span className="text-sm font-semibold text-foreground">
                        {order.items?.length ?? 0} Jenis Produk
                      </span>
                    </div>

                    {/* Preview Rincian Produk Singkat */}
                    {order.items && order.items.length > 0 ? (
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        {order.items.slice(0, 3).map((item, idx) => (
                          <span
                            key={idx}
                            className="rounded-lg border border-border/80 bg-background px-2.5 py-1"
                          >
                            {item.nama_barang || item.barang?.NamaItem || "Produk"} ({item.jumlah}x)
                          </span>
                        ))}
                        {order.items.length > 3 ? (
                          <span className="rounded-lg border border-border/80 bg-background px-2.5 py-1 text-primary font-medium">
                            +{order.items.length - 3} produk lainnya
                          </span>
                        ) : null}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Detail item dapat dilihat pada halaman rincian.
                      </p>
                    )}
                  </div>

                  {/* Total & Action Button */}
                  <div className="flex items-center justify-between gap-6 border-t border-border pt-4 lg:border-t-0 lg:pt-0">
                    <div className="text-left lg:text-right">
                      <span className="text-xs text-muted-foreground">
                        Total Belanja:
                      </span>
                      <p className="font-heading text-xl font-bold text-primary sm:text-2xl">
                        {formatRupiah(order.total_harga)}
                      </p>
                    </div>

                    <Button
                      nativeButton={false}
                      render={<Link href={`/store/pesanan/${order.id}`} />}
                      className="gap-2 shrink-0"
                    >
                      <span>Lihat Rincian</span>
                      <ArrowRight className="size-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </section>
        ) : null}

        {/* Pagination */}
        {!isLoading && lastPage > 1 ? (
          <nav
            aria-label="Navigasi halaman pesanan"
            className="mt-8 flex items-center justify-between border-t border-border pt-6"
          >
            <Button
              disabled={page <= 1}
              onClick={() => setPage((current) => current - 1)}
              variant="outline"
              size="sm"
            >
              Sebelumnya
            </Button>
            <p className="text-sm text-muted-foreground">
              Halaman <span className="font-bold text-foreground">{page}</span>{" "}
              dari {lastPage}
            </p>
            <Button
              disabled={page >= lastPage}
              onClick={() => setPage((current) => current + 1)}
              variant="outline"
              size="sm"
            >
              Berikutnya
            </Button>
          </nav>
        ) : null}
      </div>
    </StorePageShell>
  );
}