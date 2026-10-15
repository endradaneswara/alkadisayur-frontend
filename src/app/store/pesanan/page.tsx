"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ArrowRight, PackageOpen } from "lucide-react";

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
  pending: "Menunggu konfirmasi",
  diproses: "Sedang diproses",
  dikirim: "Dalam pengiriman",
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

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Pesanan[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await listPesanan({ page });
      setOrders(response.data);
      setLastPage(response.meta.last_page);
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

  return (
    <StorePageShell>
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Riwayat belanja
          </p>
          <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight">
            Pesanan saya
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Lihat status dan detail pesanan Alkadi Anda.
          </p>
        </header>

        {error ? (
          <div className="rounded-xl border border-destructive/30 bg-card px-4 py-3 text-sm text-destructive" role="alert">
            Pesanan belum dapat dimuat: {error}
            <Button className="ml-3" onClick={() => void loadOrders()} size="sm" variant="outline">
              Coba lagi
            </Button>
          </div>
        ) : null}

        {isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton className="h-32 rounded-xl" key={index} />
            ))}
          </div>
        ) : null}

        {!isLoading && !error && orders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-14 text-center">
              <PackageOpen aria-hidden="true" className="size-12 text-muted-foreground" />
              <div>
                <h2 className="font-heading text-xl font-semibold">
                  Belum ada pesanan
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Pesanan yang Anda buat akan ditampilkan di sini.
                </p>
              </div>
              <Button nativeButton={false} render={<Link href="/store/produk" />}>
                Jelajahi produk
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {!isLoading && orders.length > 0 ? (
          <section aria-label="Daftar pesanan" className="flex flex-col gap-3">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="font-semibold">{order.nomor_order}</h2>
                      <Badge variant={orderStatusVariants[order.status]}>
                        {orderStatusLabels[order.status]}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {new Date(order.tanggal_pemesanan).toLocaleString("id-ID", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {order.items?.length ?? 0} jenis produk ·{" "}
                      {order.metode === "pesan_antar" ? "Pesan antar" : "Ambil di toko"}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-semibold">{formatRupiah(order.total_harga)}</p>
                    <Button
                      nativeButton={false}
                      render={<Link href={`/store/pesanan/${order.id}`} />}
                      variant="outline"
                    >
                      Detail
                      <ArrowRight aria-hidden="true" data-icon="inline-end" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </section>
        ) : null}

        {!isLoading && lastPage > 1 ? (
          <nav aria-label="Navigasi halaman pesanan" className="flex items-center justify-between">
            <Button disabled={page <= 1} onClick={() => setPage((current) => current - 1)} variant="outline">
              Sebelumnya
            </Button>
            <p className="text-sm text-muted-foreground">
              Halaman {page} dari {lastPage}
            </p>
            <Button disabled={page >= lastPage} onClick={() => setPage((current) => current + 1)} variant="outline">
              Berikutnya
            </Button>
          </nav>
        ) : null}
      </div>
    </StorePageShell>
  );
}