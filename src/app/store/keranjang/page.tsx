"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  Leaf,
  Minus,
  Plus,
  ShoppingBag,
  ShoppingCart,
  Tag,
  Trash2,
} from "lucide-react";

import { StorePageShell } from "@/components/store-page-shell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { formatRupiah, getErrorMessage } from "@/lib/store-catalog";
import { hasAuthSession } from "@/services/api";
import {
  clearKeranjang,
  getKeranjang,
  removeItemKeranjang,
  updateItemKeranjang,
} from "@/services/keranjangService";
import type { Keranjang } from "@/types";

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Keranjang | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadCart = useCallback(async (): Promise<void> => {
    try {
      const response = await getKeranjang();
      setCart(response.data);
      setError(null);
    } catch (loadError: unknown) {
      setError(getErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(() => {
      if (!hasAuthSession()) {
        router.replace("/store/akun/login");
        return;
      }
      return loadCart();
    });
  }, [loadCart, router]);

  async function changeQuantity(itemId: number, quantity: number): Promise<void> {
    setIsUpdating(itemId);
    try {
      await updateItemKeranjang(itemId, quantity);
      await loadCart();
    } catch (updateError: unknown) {
      toast.add({
        title: "Keranjang tidak dapat diperbarui",
        description: getErrorMessage(updateError),
        type: "error",
      });
    } finally {
      setIsUpdating(null);
    }
  }

  async function removeItem(itemId: number): Promise<void> {
    setIsUpdating(itemId);
    try {
      await removeItemKeranjang(itemId);
      await loadCart();
      toast.add({
        title: "Produk dihapus dari keranjang",
        type: "success",
      });
    } catch (removeError: unknown) {
      toast.add({
        title: "Produk tidak dapat dihapus",
        description: getErrorMessage(removeError),
        type: "error",
      });
    } finally {
      setIsUpdating(null);
    }
  }

  async function emptyCart(): Promise<void> {
    if (!window.confirm("Kosongkan seluruh isi keranjang?")) return;
    setIsUpdating(-1);
    try {
      await clearKeranjang();
      await loadCart();
      toast.add({
        title: "Keranjang dikosongkan",
        type: "success",
      });
    } catch (clearError: unknown) {
      toast.add({
        title: "Keranjang tidak dapat dikosongkan",
        description: getErrorMessage(clearError),
        type: "error",
      });
    } finally {
      setIsUpdating(null);
    }
  }

  return (
    <StorePageShell>
      {/* Page Header */}
      <div className="mb-8">
        <nav className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/store" className="hover:text-primary transition-colors">
            Beranda
          </Link>
          <span>/</span>
          <span className="font-medium text-foreground">Keranjang Belanja</span>
        </nav>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Belanja Anda
            </span>
            <h1 className="mt-1 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Keranjang Belanja
            </h1>
          </div>
          {cart && cart.items.length > 0 && (
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground">
              <ShoppingCart className="size-4 text-primary" />
              {cart.total_item} produk dalam keranjang
            </span>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-destructive/30 bg-destructive/5 px-5 py-4 text-sm text-destructive" role="alert">
          <p>Keranjang gagal dimuat: {error}</p>
          <Button onClick={() => void loadCart()} size="sm" variant="outline">
            Coba Lagi
          </Button>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid items-start gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-4">
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-72 rounded-2xl" />
        </div>
      )}

      {/* Keranjang Kosong */}
      {!isLoading && !error && cart?.items.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-border bg-card py-20 text-center">
          <div className="flex size-20 items-center justify-center rounded-3xl bg-primary/10 text-primary">
            <ShoppingCart className="size-10" />
          </div>
          <h2 className="mt-5 font-heading text-2xl font-bold text-foreground">
            Keranjang Masih Kosong
          </h2>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Temukan sayuran segar, buah pilihan, dan kebutuhan dapur terbaik di toko kami.
          </p>
          <Button
            className="mt-7 gap-2"
            nativeButton={false}
            render={<Link href="/store/produk" />}
            size="lg"
          >
            <ShoppingBag className="size-4" />
            Mulai Belanja
          </Button>
        </div>
      )}

      {/* Konten Keranjang */}
      {!isLoading && !error && cart && cart.items.length > 0 && (
        <div className="grid items-start gap-8 lg:grid-cols-[1fr_380px]">
          {/* Kolom Kiri: Daftar Produk */}
          <section aria-label="Produk dalam keranjang" className="flex flex-col gap-4">
            {/* Header baris */}
            <div className="hidden items-center justify-between border-b border-border pb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:flex">
              <span className="flex-1">Produk</span>
              <span className="w-32 text-center">Jumlah</span>
              <span className="w-28 text-right">Subtotal</span>
              <span className="w-10" />
            </div>

            {cart.items.map((item) => (
              <div
                key={item.id}
                className={`group relative flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-5 transition-all duration-200 hover:border-primary/50 hover:shadow-sm sm:flex-nowrap ${
                  isUpdating === item.id ? "opacity-60" : ""
                }`}
              >
                {/* Gambar produk placeholder */}
                <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:size-20">
                  <Leaf className="size-8 opacity-60" />
                </div>

                {/* Info Produk */}
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/store/produk/${item.barang_id}`}
                    className="block font-heading font-semibold text-foreground hover:text-primary transition-colors sm:text-lg"
                  >
                    {item.nama_barang ?? "Produk Alkadi"}
                  </Link>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {formatRupiah(item.harga)} / satuan
                  </p>
                </div>

                {/* Kontrol Kuantitas */}
                <div className="flex items-center gap-2 sm:w-32 sm:justify-center">
                  <button
                    aria-label={`Kurangi jumlah ${item.nama_barang ?? "produk"}`}
                    disabled={isUpdating !== null || item.jumlah <= 1}
                    onClick={() => void changeQuantity(item.id, item.jumlah - 1)}
                    className="flex size-9 items-center justify-center rounded-xl border border-border bg-background transition-all hover:border-primary hover:bg-primary/5 hover:text-primary disabled:opacity-40"
                    type="button"
                  >
                    <Minus className="size-4" />
                  </button>
                  <span className="min-w-8 text-center text-sm font-bold text-foreground">
                    {item.jumlah}
                  </span>
                  <button
                    aria-label={`Tambah jumlah ${item.nama_barang ?? "produk"}`}
                    disabled={isUpdating !== null}
                    onClick={() => void changeQuantity(item.id, item.jumlah + 1)}
                    className="flex size-9 items-center justify-center rounded-xl border border-border bg-background transition-all hover:border-primary hover:bg-primary/5 hover:text-primary disabled:opacity-40"
                    type="button"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>

                {/* Subtotal */}
                <p className="w-28 text-right font-heading font-bold text-foreground sm:text-lg">
                  {formatRupiah(item.subtotal)}
                </p>

                {/* Hapus */}
                <button
                  aria-label={`Hapus ${item.nama_barang ?? "produk"} dari keranjang`}
                  disabled={isUpdating !== null}
                  onClick={() => void removeItem(item.id)}
                  className="ml-auto flex size-9 items-center justify-center rounded-xl text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive disabled:opacity-40 sm:ml-0"
                  type="button"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}

            {/* Kosongkan keranjang */}
            <div className="flex justify-end pt-2">
              <button
                disabled={isUpdating !== null}
                onClick={() => void emptyCart()}
                className="text-xs text-muted-foreground underline-offset-2 hover:text-destructive hover:underline disabled:opacity-40 transition-colors"
                type="button"
              >
                Kosongkan semua
              </button>
            </div>
          </section>

          {/* Kolom Kanan: Ringkasan Belanja */}
          <div className="flex flex-col gap-4 lg:sticky lg:top-24">
            {/* Kartu Ringkasan */}
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
              {/* Header */}
              <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-6 py-4">
                <Tag className="size-4 text-primary" />
                <h2 className="font-heading text-base font-bold text-foreground">
                  Ringkasan Belanja
                </h2>
              </div>

              <div className="space-y-4 p-6">
                {/* Rincian item */}
                <div className="space-y-2 text-sm">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex justify-between gap-3 text-muted-foreground">
                      <span className="min-w-0 truncate">
                        {item.nama_barang} × {item.jumlah}
                      </span>
                      <span className="shrink-0 font-medium text-foreground">
                        {formatRupiah(item.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Subtotal ({cart.total_item} produk)</span>
                    <span className="font-medium text-foreground">
                      {formatRupiah(cart.total_harga)}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-sm text-muted-foreground">
                    <span>Biaya pengiriman</span>
                    <span className="text-xs italic">Dihitung saat checkout</span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-border pt-4">
                  <span className="font-heading text-base font-bold text-foreground">
                    Total Sementara
                  </span>
                  <span className="font-heading text-xl font-extrabold text-primary">
                    {formatRupiah(cart.total_harga)}
                  </span>
                </div>

                <p className="rounded-xl border border-border bg-muted/20 px-3 py-2 text-[11px] text-muted-foreground">
                  Biaya pengiriman akan dihitung setelah Anda memilih metode penerimaan pesanan pada halaman checkout.
                </p>

                <Button
                  className="w-full gap-2 py-3 text-base font-semibold"
                  disabled={isUpdating !== null}
                  nativeButton={false}
                  render={<Link href="/store/checkout" />}
                  size="lg"
                >
                  Lanjut ke Checkout
                  <ArrowRight className="size-4" />
                </Button>

                <Button
                  className="w-full"
                  nativeButton={false}
                  render={<Link href="/store/produk" />}
                  variant="ghost"
                  size="sm"
                >
                  ← Lanjut Belanja
                </Button>
              </div>
            </div>

            {/* Badge aman belanja */}
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-xs text-emerald-700">
              <Leaf className="size-5 shrink-0 text-emerald-500" />
              <span>
                Semua produk dipilih langsung dari kebun mitra petani lokal kami setiap hari.
              </span>
            </div>
          </div>
        </div>
      )}
    </StorePageShell>
  );
}