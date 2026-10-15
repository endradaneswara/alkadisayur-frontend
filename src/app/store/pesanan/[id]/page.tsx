"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, MapPin, PackageCheck, Store } from "lucide-react";

import { StorePageShell } from "@/components/store-page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { formatRupiah, getErrorMessage } from "@/lib/store-catalog";
import { hasAuthSession } from "@/services/api";
import { createPembayaran } from "@/services/pembayaranService";
import { cancelPesanan, getPesanan } from "@/services/pesananService";
import type { MetodePembayaran, Pesanan, StatusPesanan } from "@/types";

const statusLabels: Record<StatusPesanan, string> = {
  pending: "Menunggu konfirmasi",
  diproses: "Sedang diproses",
  dikirim: "Dalam pengiriman",
  selesai: "Selesai",
  dibatalkan: "Dibatalkan",
};

const statusVariants: Record<
  StatusPesanan,
  "default" | "secondary" | "outline" | "destructive"
> = {
  pending: "outline",
  diproses: "secondary",
  dikirim: "default",
  selesai: "secondary",
  dibatalkan: "destructive",
};

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const orderId = Number(params.id);
  const isValidId = Number.isInteger(orderId) && orderId > 0;
  const router = useRouter();
  const [order, setOrder] = useState<Pesanan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<MetodePembayaran>("COD");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasAuthSession()) {
      router.replace("/store/akun/login");
      return;
    }
    if (!isValidId) {
      return;
    }

    let isCurrent = true;
    void Promise.resolve()
      .then(() => getPesanan(orderId))
      .then((response) => {
        if (isCurrent) {
          setOrder(response.data);
          setError(null);
        }
      })
      .catch((loadError: unknown) => {
        if (isCurrent) {
          setError(getErrorMessage(loadError));
        }
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [isValidId, orderId, router]);

  async function handleCancel(): Promise<void> {
    if (!order || !window.confirm("Batalkan pesanan ini?")) {
      return;
    }
    setIsCancelling(true);
    try {
      const response = await cancelPesanan(order.id);
      setOrder(response.data);
      toast.add({
        title: "Pesanan dibatalkan",
        description: "Status pesanan Anda telah diperbarui.",
        type: "success",
      });
    } catch (cancelError: unknown) {
      toast.add({
        title: "Pesanan tidak dapat dibatalkan",
        description: getErrorMessage(cancelError),
        type: "error",
      });
    } finally {
      setIsCancelling(false);
    }
  }

  async function handleCreatePayment(): Promise<void> {
    if (!order) {
      return;
    }
    setIsCreatingPayment(true);
    try {
      const response = await createPembayaran({
        pesanan_id: order.id,
        metode_pembayaran: paymentMethod,
      });
      setOrder((current) =>
        current ? { ...current, pembayaran: response.data } : current,
      );
      toast.add({
        title: "Metode pembayaran tersimpan",
        description: "Status pembayaran menunggu konfirmasi pihak toko.",
        type: "success",
      });
    } catch (paymentError: unknown) {
      toast.add({
        title: "Pembayaran tidak dapat dicatat",
        description: getErrorMessage(paymentError),
        type: "error",
      });
    } finally {
      setIsCreatingPayment(false);
    }
  }

  const canCancel = order?.status === "pending" || order?.status === "diproses";

  return (
    <StorePageShell>
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <Button
          className="w-fit"
          nativeButton={false}
          render={<Link href="/store/pesanan" />}
          variant="ghost"
        >
          <ArrowLeft aria-hidden="true" data-icon="inline-start" />
          Kembali ke pesanan
        </Button>

        {!isValidId || error ? (
          <p className="rounded-xl border border-destructive/30 bg-card px-4 py-3 text-sm text-destructive" role="alert">
            Pesanan tidak dapat dimuat: {isValidId ? error : "Nomor pesanan tidak valid."}
          </p>
        ) : null}

        {isLoading && isValidId ? <Skeleton className="h-96 rounded-xl" /> : null}

        {!isLoading && order ? (
          <>
            <header className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                  Detail pesanan
                </p>
                <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight">
                  {order.nomor_order}
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  {new Date(order.tanggal_pemesanan).toLocaleString("id-ID", {
                    dateStyle: "full",
                    timeStyle: "short",
                  })}
                </p>
              </div>
              <Badge variant={statusVariants[order.status]}>{statusLabels[order.status]}</Badge>
            </header>

            <Card>
              <CardHeader>
                <CardTitle>Produk pesanan</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col divide-y">
                {order.items?.map((item) => (
                  <div className="flex justify-between gap-4 py-3 first:pt-0 last:pb-0" key={item.id}>
                    <div>
                      <p className="font-medium">{item.nama_barang}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.jumlah} × {formatRupiah(item.harga)}
                      </p>
                    </div>
                    <p className="font-medium">{formatRupiah(item.subtotal)}</p>
                  </div>
                ))}
                <div className="flex justify-between pt-4 text-sm">
                  <span>Subtotal produk</span>
                  <span>{formatRupiah(Number(order.total_harga) - Number(order.biaya_pengiriman))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Biaya pengiriman</span>
                  <span>{formatRupiah(order.biaya_pengiriman)}</span>
                </div>
                <div className="flex justify-between border-t pt-4 font-semibold">
                  <span>Total pesanan</span>
                  <span>{formatRupiah(order.total_harga)}</span>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {order.metode === "pesan_antar"
                      ? "Alamat pengiriman"
                      : "Lokasi pengambilan"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex gap-3 text-sm">
                  {order.metode === "pesan_antar" ? (
                    <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
                  ) : (
                    <Store aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
                  )}
                  <div>
                    <p className="font-medium">
                      {order.metode === "pesan_antar"
                        ? order.alamat?.nama_alamat ?? "Alamat tidak tersedia"
                        : order.lokasi_toko?.nama ?? "Lokasi tidak tersedia"}
                    </p>
                    {order.metode === "pesan_antar" && order.alamat ? (
                      <>
                        <p className="mt-1">{order.alamat.nama_penerima}</p>
                        <p className="text-muted-foreground">{order.alamat.no_hp}</p>
                        <p className="mt-1 text-muted-foreground">{order.alamat.alamat_lengkap}</p>
                      </>
                    ) : null}
                    {order.metode === "ambil_ditoko" && order.lokasi_toko?.deskripsi ? (
                      <p className="mt-1 text-muted-foreground">{order.lokasi_toko.deskripsi}</p>
                    ) : null}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pembayaran</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2 text-sm">
                  {order.pembayaran ? (
                    <>
                      <p>
                        Metode: <span className="font-medium">{order.pembayaran.metode_pembayaran}</span>
                      </p>
                      <p>
                        Status: <span className="font-medium capitalize">{order.pembayaran.status}</span>
                      </p>
                      <p>
                        Nomor transaksi: <span className="font-medium">{order.pembayaran.transaksi_id}</span>
                      </p>
                      <p className="text-xs leading-5 text-muted-foreground">
                        Status pembayaran diperbarui oleh pihak toko. Integrasi pembayaran otomatis belum tersedia.
                      </p>
                    </>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <p className="text-muted-foreground">
                        Metode pembayaran pesanan ini belum dicatat.
                      </p>
                      {order.status !== "dibatalkan" ? (
                        <>
                          <Select
                            items={[
                              { label: "Bayar di tempat (COD)", value: "COD" },
                              { label: "Transfer", value: "Transfer" },
                              { label: "QRIS", value: "QRIS" },
                            ]}
                            onValueChange={(value) => {
                              if (value === "COD" || value === "Transfer" || value === "QRIS") {
                                setPaymentMethod(value);
                              }
                            }}
                            value={paymentMethod}
                          >
                            <SelectTrigger aria-label="Pilih metode pembayaran">
                              <SelectValue placeholder="Pilih metode pembayaran" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectItem value="COD">Bayar di tempat (COD)</SelectItem>
                                <SelectItem value="Transfer">Transfer</SelectItem>
                                <SelectItem value="QRIS">QRIS</SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          <Button
                            disabled={isCreatingPayment}
                            onClick={() => void handleCreatePayment()}
                            type="button"
                          >
                            {isCreatingPayment ? "Menyimpan..." : "Simpan metode pembayaran"}
                          </Button>
                        </>
                      ) : null}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {order.catatan ? (
              <Card>
                <CardHeader>
                  <CardTitle>Catatan</CardTitle>
                </CardHeader>
                <CardContent className="text-sm">{order.catatan}</CardContent>
              </Card>
            ) : null}

            {canCancel ? (
              <div>
                <Button disabled={isCancelling} onClick={() => void handleCancel()} variant="destructive">
                  {isCancelling ? "Membatalkan..." : "Batalkan pesanan"}
                </Button>
              </div>
            ) : null}

            {order.status === "selesai" ? (
              <Card>
                <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
                  <div>
                    <h2 className="font-semibold">Bagaimana pengalaman Anda?</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Bagikan ulasan Anda untuk membantu pelanggan lain.
                    </p>
                  </div>
                  <Button nativeButton={false} render={<Link href="/store/akun/ulasan" />} variant="outline">
                    <PackageCheck aria-hidden="true" data-icon="inline-start" />
                    Beri ulasan
                  </Button>
                </CardContent>
              </Card>
            ) : null}
          </>
        ) : null}
      </div>
    </StorePageShell>
  );
}