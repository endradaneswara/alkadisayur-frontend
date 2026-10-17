"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  MapPin,
  Package,
  PackageCheck,
  ShoppingBag,
  Store,
  Truck,
} from "lucide-react";

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
  pending: "Menunggu Konfirmasi",
  diproses: "Sedang Diproses",
  dikirim: "Dalam Pengiriman",
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
        description: "Status pesanan berhasil diperbarui menjadi dibatalkan.",
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
      setOrder({ ...order, pembayaran: response.data });
      toast.add({
        title: "Pembayaran disimpan",
        description: `Metode ${paymentMethod} berhasil disimpan.`,
        type: "success",
      });
    } catch (paymentError: unknown) {
      toast.add({
        title: "Pembayaran gagal disimpan",
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
      <div className="w-full">
        {/* Breadcrumb & Back */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
            <Link className="hover:text-primary transition-colors" href="/store">
              Beranda
            </Link>
            <span aria-hidden="true" className="px-2">
              /
            </span>
            <Link className="hover:text-primary transition-colors" href="/store/pesanan">
              Pesanan Saya
            </Link>
            <span aria-hidden="true" className="px-2">
              /
            </span>
            <span aria-current="page" className="font-medium text-foreground">
              {order ? `#${order.nomor_order}` : "Detail Pesanan"}
            </span>
          </nav>

          <Button
            nativeButton={false}
            render={<Link href="/store/pesanan" />}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <ArrowLeft className="size-4" />
            Kembali ke Daftar Pesanan
          </Button>
        </div>

        {/* Error state */}
        {!isValidId || error ? (
          <div
            className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive"
            role="alert"
          >
            <p className="font-semibold">
              Pesanan tidak dapat dimuat: {isValidId ? error : "Nomor pesanan tidak valid."}
            </p>
          </div>
        ) : null}

        {/* Loading state */}
        {isLoading && isValidId ? (
          <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
            <Skeleton className="h-96 rounded-2xl" />
            <Skeleton className="h-80 rounded-2xl" />
          </div>
        ) : null}

        {/* Main Content */}
        {!isLoading && order ? (
          <div className="flex flex-col gap-8">
            {/* Order Header Banner */}
            <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                    Detail Pesanan
                  </span>
                  <div className="mt-1 flex flex-wrap items-center gap-3">
                    <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                      #{order.nomor_order}
                    </h1>
                    <Badge
                      variant={statusVariants[order.status]}
                      className="text-xs font-semibold px-3 py-1"
                    >
                      {statusLabels[order.status]}
                    </Badge>
                  </div>
                  <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground sm:text-sm">
                    <Calendar className="size-4 text-primary" />
                    Dipesan pada{" "}
                    {new Date(order.tanggal_pemesanan).toLocaleString("id-ID", {
                      dateStyle: "full",
                      timeStyle: "short",
                    })}
                  </p>
                </div>

                {canCancel ? (
                  <Button
                    disabled={isCancelling}
                    onClick={() => void handleCancel()}
                    variant="destructive"
                    size="sm"
                  >
                    {isCancelling ? "Membatalkan..." : "Batalkan Pesanan"}
                  </Button>
                ) : null}
              </div>
            </div>

            {/* 2 Kolom Layout Lebar */}
            <div className="grid items-start gap-8 lg:grid-cols-[1fr_400px]">
              {/* Kolom Kiri: Rincian Produk & Catatan */}
              <div className="flex flex-col gap-6">
                <Card className="border border-border/80">
                  <CardHeader className="border-b border-border bg-muted/20 pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <ShoppingBag className="size-5 text-primary" />
                      Produk yang Dipesan
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="divide-y divide-border p-0">
                    {order.items?.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-4 p-5 transition-colors hover:bg-muted/10"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold">
                            {item.jumlah}x
                          </div>
                          <div>
                            <p className="font-semibold text-foreground text-sm sm:text-base">
                              {item.nama_barang}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              Harga Satuan: {formatRupiah(item.harga)}
                            </p>
                          </div>
                        </div>
                        <p className="font-heading font-bold text-foreground text-sm sm:text-base">
                          {formatRupiah(item.subtotal)}
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Catatan Tambahan */}
                {order.catatan ? (
                  <Card className="border border-border/80">
                    <CardHeader className="border-b border-border bg-muted/20 pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <FileText className="size-4 text-primary" />
                        Catatan Pesanan
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5 text-sm text-muted-foreground">
                      {order.catatan}
                    </CardContent>
                  </Card>
                ) : null}

                {/* Ajakan Beri Ulasan jika Selesai */}
                {order.status === "selesai" ? (
                  <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-6">
                    <div>
                      <h3 className="font-heading text-lg font-bold">
                        Bagaimana Pengalaman Belanja Anda?
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Bantu kami menjaga kualitas sayur segar dengan memberikan ulasan toko.
                      </p>
                    </div>
                    <Button
                      nativeButton={false}
                      render={<Link href="/store/akun/ulasan" />}
                      className="gap-2"
                    >
                      <PackageCheck className="size-4" />
                      Tulis Ulasan Toko
                    </Button>
                  </div>
                ) : null}
              </div>

              {/* Kolom Kanan: Ringkasan Biaya, Pengiriman & Pembayaran */}
              <div className="flex flex-col gap-6">
                {/* Ringkasan Pembayaran */}
                <Card className="border border-border/80 shadow-xs">
                  <CardHeader className="border-b border-border bg-muted/20 pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <CreditCard className="size-4 text-primary" />
                      Ringkasan Pembayaran
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 p-5 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal Produk</span>
                      <span className="font-medium text-foreground">
                        {formatRupiah(
                          Number(order.total_harga) - Number(order.biaya_pengiriman),
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Biaya Pengiriman</span>
                      <span className="font-medium text-foreground">
                        {Number(order.biaya_pengiriman) > 0
                          ? formatRupiah(order.biaya_pengiriman)
                          : "Gratis"}
                      </span>
                    </div>
                    <div className="border-t border-border pt-3 flex justify-between font-heading font-bold text-base sm:text-lg text-primary">
                      <span>Total Tagihan</span>
                      <span>{formatRupiah(order.total_harga)}</span>
                    </div>

                    <div className="mt-4 border-t border-border pt-4">
                      {order.pembayaran ? (
                        <div className="space-y-1.5 rounded-xl border border-border bg-muted/30 p-3.5 text-xs">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Metode:</span>
                            <span className="font-bold">{order.pembayaran.metode_pembayaran}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Status:</span>
                            <span className="font-bold capitalize text-emerald-600">
                              {order.pembayaran.status}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">No. Transaksi:</span>
                            <span className="font-mono text-muted-foreground">
                              {order.pembayaran.transaksi_id}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <p className="text-xs text-muted-foreground">
                            Pilih dan simpan metode pembayaran untuk pesanan ini:
                          </p>
                          {order.status !== "dibatalkan" ? (
                            <>
                              <Select
                                items={[
                                  { label: "Bayar di Tempat (COD)", value: "COD" },
                                  { label: "Transfer Bank", value: "Transfer" },
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
                                    <SelectItem value="COD">Bayar di Tempat (COD)</SelectItem>
                                    <SelectItem value="Transfer">Transfer Bank</SelectItem>
                                    <SelectItem value="QRIS">QRIS</SelectItem>
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                              <Button
                                className="w-full"
                                disabled={isCreatingPayment}
                                onClick={() => void handleCreatePayment()}
                                type="button"
                              >
                                {isCreatingPayment
                                  ? "Menyimpan..."
                                  : "Konfirmasi Pembayaran"}
                              </Button>
                            </>
                          ) : null}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Info Pengiriman / Pengambilan Toko */}
                <Card className="border border-border/80 shadow-xs">
                  <CardHeader className="border-b border-border bg-muted/20 pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      {order.metode === "pesan_antar" ? (
                        <>
                          <Truck className="size-4 text-primary" />
                          Alamat Pengiriman
                        </>
                      ) : (
                        <>
                          <Store className="size-4 text-primary" />
                          Lokasi Pengambilan Toko
                        </>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 text-sm">
                    {order.metode === "pesan_antar" ? (
                      order.alamat ? (
                        <div className="space-y-1">
                          <p className="font-bold text-foreground">
                            {order.alamat.nama_alamat}
                          </p>
                          <p className="text-xs font-semibold text-foreground">
                            {order.alamat.nama_penerima} ({order.alamat.no_hp})
                          </p>
                          <p className="text-xs leading-relaxed text-muted-foreground pt-1">
                            {order.alamat.alamat_lengkap}
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          Alamat tidak tersedia.
                        </p>
                      )
                    ) : order.lokasi_toko ? (
                      <div className="space-y-1">
                        <p className="font-bold text-foreground">
                          {order.lokasi_toko.nama}
                        </p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {order.lokasi_toko.deskripsi || "Silakan ambil pesanan di gerai cabang toko Alkadi."}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Lokasi toko tidak tersedia.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </StorePageShell>
  );
}