"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";
import {
  ArrowRight,
  Leaf,
  Minus,
  Plus,
  ShoppingCart,
  Tag,
  Trash2,
} from "lucide-react";

import { StoreEmptyState } from "@/components/store-empty-state";
import { StoreErrorBanner } from "@/components/store-error-banner";
import { StorePageShell } from "@/components/store-page-shell";
import { ConfirmDialogHost } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { useCart } from "@/hooks/useCart";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";
import { formatRupiah } from "@/lib/store-catalog";

export default function CartPage() {
  const router = useRouter();
  const {
    cart,
    items,
    isLoading,
    error,
    updateItem,
    removeItem,
    clear,
    refetch,
  } = useCart();
  const confirmDialog = useConfirmDialog();
  const isUpdating = confirmDialog.isPending;
  const isMounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );

  async function changeQuantity(itemId: number, quantity: number): Promise<void> {
    if (quantity < 1) return;

    const success = await updateItem(itemId, quantity);

    if (!success) {
      toast.add({
        title: "Keranjang tidak dapat diperbarui",
        type: "error",
      });
    }
  }

  function removeItemWithConfirm(itemId: number): void {
    void confirmDialog.confirm(
      {
        title: "Hapus produk dari keranjang?",
        description: "Produk akan dihapus dari keranjang belanja Anda.",
        confirmLabel: "Hapus",
      },
      async () => {
        const success = await removeItem(itemId);

        if (success) {
          toast.add({ title: "Produk dihapus dari keranjang", type: "success" });
        } else {
          toast.add({
            title: "Produk tidak dapat dihapus",
            type: "error",
          });
        }
      },
    );
  }

  function emptyCartWithConfirm(): void {
    void confirmDialog.confirm(
      {
        title: "Kosongkan seluruh isi keranjang?",
        description: "Semua produk dalam keranjang akan dihapus.",
        confirmLabel: "Kosongkan",
      },
      async () => {
        const success = await clear();

        if (success) {
          toast.add({ title: "Keranjang dikosongkan", type: "success" });
        } else {
          toast.add({
            title: "Keranjang tidak dapat dikosongkan",
            type: "error",
          });
        }
      },
    );
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
          <span className="font-medium text-foreground">Keranjang</span>
        </nav>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="mt-1 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Keranjang
            </h1>
          </div>
          {cart && cart.items.length > 0 && (
            <span className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground">
              <ShoppingCart className="size-4 text-primary" />
              {cart.total_item} produk dalam keranjang
            </span>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <StoreErrorBanner className="mb-6" error={error} onRetry={refetch} />
      )}

      {/* Loading Skeleton */}
      {isMounted && isLoading && (
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
      {isMounted && !isLoading && !error && items.length === 0 && (
        <StoreEmptyState
          action={{ label: "Mulai Belanja", onClick: () => router.push("/store/produk") }}
          icon={ShoppingCart}
          title="Keranjang Masih Kosong"
        />
      )}

      {/* Konten Keranjang */}
      {isMounted && !isLoading && !error && cart && items.length > 0 && (
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

            {items.map((item) => (
              <div
                key={item.id}
                className={`group relative flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-5 transition-all duration-200 hover:border-primary/50 hover:shadow-sm sm:flex-nowrap ${
                  isUpdating ? "opacity-60" : ""
                }`}
              >
                {/* Gambar produk placeholder */}
                <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:size-20">
                  <Leaf className="size-8 opacity-60" />
                </div>

                {/* Info Produk */}
                <div className="min-w-0 flex-1">
                  <span className="block font-heading font-semibold text-foreground sm:text-lg">
                    {item.nama_barang ?? "Produk Alkadi"}
                  </span>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {formatRupiah(item.harga)} / satuan
                  </p>
                </div>

                {/* Kontrol Kuantitas */}
                <div className="flex items-center gap-2 sm:w-32 sm:justify-center">
                  <button
                    aria-label={`Kurangi jumlah ${item.nama_barang ?? "produk"}`}
                    disabled={isUpdating || item.jumlah <= 1}
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
                    disabled={isUpdating}
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
                  disabled={isUpdating}
                  onClick={() => removeItemWithConfirm(item.id)}
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
                disabled={isUpdating}
                onClick={emptyCartWithConfirm}
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
                  {items.map((item) => (
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
                  disabled={isUpdating}
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
                  Lanjut Belanja
                </Button>
              </div>
            </div>

            {/* Badge aman belanja */}
            <div className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-xs text-primary">
              <Leaf className="size-5 shrink-0 text-primary" />
              <span>
                Semua produk dipilih langsung dari kebun mitra petani lokal kami setiap hari.
              </span>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialogHost dialog={confirmDialog} />
    </StorePageShell>
  );
}
