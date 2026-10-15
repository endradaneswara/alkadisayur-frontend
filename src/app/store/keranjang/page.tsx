"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";

import { StorePageShell } from "@/components/store-page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
        title: "Produk dihapus",
        description: "Produk berhasil dihapus dari keranjang.",
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
    if (!window.confirm("Kosongkan seluruh isi keranjang?")) {
      return;
    }

    setIsUpdating(-1);
    try {
      await clearKeranjang();
      await loadCart();
      toast.add({
        title: "Keranjang dikosongkan",
        description: "Semua produk telah dihapus dari keranjang.",
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
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Belanja Anda
          </p>
          <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight">
            Keranjang
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Periksa jumlah dan produk sebelum melanjutkan ke checkout.
          </p>
        </header>

        {error ? (
          <div
            className="rounded-xl border border-destructive/30 bg-card px-4 py-3 text-sm text-destructive"
            role="alert"
          >
            Keranjang gagal dimuat: {error}
            <Button className="ml-3" onClick={() => void loadCart()} size="sm" variant="outline">
              Coba lagi
            </Button>
          </div>
        ) : null}

        {isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton className="h-28 w-full rounded-xl" key={index} />
            ))}
          </div>
        ) : null}

        {!isLoading && !error && cart?.items.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-14 text-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-muted text-primary">
                <ShoppingCart aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-heading text-xl font-semibold">
                  Keranjang masih kosong
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Jelajahi produk Alkadi dan tambahkan kebutuhan Anda.
                </p>
              </div>
              <Button nativeButton={false} render={<Link href="/store/produk" />}>
                Mulai belanja
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {!isLoading && !error && cart && cart.items.length > 0 ? (
          <div className="grid items-start gap-6 lg:grid-cols-[1fr_320px]">
            <section aria-label="Produk dalam keranjang" className="flex flex-col gap-3">
              {cart.items.map((item) => (
                <Card key={item.id}>
                  <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5">
                    <div className="min-w-0 flex-1">
                      <Link
                        className="font-semibold hover:text-primary"
                        href={`/store/produk/${item.barang_id}`}
                      >
                        {item.nama_barang ?? "Produk Alkadi"}
                      </Link>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {formatRupiah(item.harga)} / item
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        aria-label={`Kurangi jumlah ${item.nama_barang ?? "produk"}`}
                        disabled={isUpdating !== null || item.jumlah <= 1}
                        onClick={() => void changeQuantity(item.id, item.jumlah - 1)}
                        size="icon"
                        variant="outline"
                      >
                        <Minus aria-hidden="true" />
                      </Button>
                      <span aria-label={`Jumlah ${item.jumlah}`} className="min-w-8 text-center font-medium">
                        {item.jumlah}
                      </span>
                      <Button
                        aria-label={`Tambah jumlah ${item.nama_barang ?? "produk"}`}
                        disabled={isUpdating !== null}
                        onClick={() => void changeQuantity(item.id, item.jumlah + 1)}
                        size="icon"
                        variant="outline"
                      >
                        <Plus aria-hidden="true" />
                      </Button>
                    </div>
                    <p className="w-28 text-right font-semibold">
                      {formatRupiah(item.subtotal)}
                    </p>
                    <Button
                      aria-label={`Hapus ${item.nama_barang ?? "produk"}`}
                      disabled={isUpdating !== null}
                      onClick={() => void removeItem(item.id)}
                      size="icon"
                      variant="ghost"
                    >
                      <Trash2 aria-hidden="true" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </section>

            <Card>
              <CardHeader>
                <CardTitle>Ringkasan belanja</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Jumlah produk ({cart.total_item})
                  </span>
                  <span>{formatRupiah(cart.total_harga)}</span>
                </div>
                <div className="flex justify-between border-t pt-4 font-semibold">
                  <span>Total sementara</span>
                  <span>{formatRupiah(cart.total_harga)}</span>
                </div>
                <p className="text-xs leading-5 text-muted-foreground">
                  Biaya pengiriman akan dihitung setelah Anda memilih metode
                  penerimaan pesanan.
                </p>
                <Button
                  className="w-full"
                  disabled={isUpdating !== null}
                  nativeButton={false}
                  render={<Link href="/store/checkout" />}
                >
                  Lanjut ke checkout
                </Button>
                <Button
                  disabled={isUpdating !== null}
                  onClick={() => void emptyCart()}
                  variant="outline"
                >
                  Kosongkan keranjang
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </StorePageShell>
  );
}