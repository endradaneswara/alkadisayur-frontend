"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ImagePlus, Package, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { hasAuthSession } from "@/services/api";
import { addItemKeranjang } from "@/services/keranjangService";
import { getErrorMessage, getProductImageUrl, formatRupiah } from "@/lib/store-catalog";
import type { BarangCustomer } from "@/types";

function formatCategory(name?: string | null): string {
  if (!name) return "Umum";
  return name.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export function StoreProductCard({ product }: { product: BarangCustomer }) {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackIsError, setFeedbackIsError] = useState(false);
  const isAvailable = product.Status === "tersedia";

  async function handleAddToCart(): Promise<void> {
    if (!hasAuthSession()) {
      router.push("/store/akun/login");
      return;
    }

    setIsAdding(true);
    setFeedback(null);
    setFeedbackIsError(false);

    try {
      await addItemKeranjang(product.id, 1);
      setFeedback(`${product.NamaItem} berhasil ditambahkan ke keranjang.`);
    } catch (error: unknown) {
      setFeedback(getErrorMessage(error));
      setFeedbackIsError(true);
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <Card className="group store-product-card flex h-full flex-col overflow-hidden rounded-2xl border border-border/80 bg-card py-0 shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
      {/* 1. Gambar Produk dengan Badge Status & Stok */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-secondary/50">
        {product.Foto && !imageFailed ? (
          <Image
            alt={product.NamaItem}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            fill
            onError={() => setImageFailed(true)}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            src={getProductImageUrl(product.Foto)}
            unoptimized
          />
        ) : (
          <div
            aria-label={`Foto ${product.NamaItem} belum tersedia`}
            className="flex h-full flex-col items-center justify-center gap-2 bg-gradient-to-b from-muted/30 to-muted/80 px-4 text-center text-muted-foreground"
            role="img"
          >
            <ImagePlus aria-hidden="true" className="size-8 text-primary/40" />
            <span className="text-[11px] font-medium text-muted-foreground">
              Foto belum tersedia
            </span>
          </div>
        )}

        {/* 2. Status Badge */}
        <div className="absolute top-2.5 left-2.5 z-10">
          <Badge
            className={`border-none px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider shadow-xs backdrop-blur-xs sm:text-[11px] ${
              isAvailable
                ? "bg-emerald-600/90 text-white hover:bg-emerald-600"
                : "bg-destructive/90 text-white hover:bg-destructive"
            }`}
          >
            {isAvailable ? "Tersedia" : "Stok Habis"}
          </Badge>
        </div>

        {/* 3. Stok Badge (Top Right) */}
        {product.Stok !== undefined && product.Stok !== null ? (
          <div className="absolute top-2.5 right-2.5 z-10">
            <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/85 px-2 py-0.5 text-[10px] font-medium text-foreground shadow-xs backdrop-blur-xs sm:text-[11px]">
              <Package className="size-3 text-primary" />
              <span>{product.Stok}</span>
            </span>
          </div>
        ) : null}
      </div>

      {/* Konten Card: Kategori, Nama Produk, Stok, dan Harga SAJA */}
      <CardContent className="flex flex-1 flex-col gap-2 p-3 sm:p-4">
        {/* 4. Kategori & Stok Counter */}
        <div className="flex items-center justify-between gap-1.5">
          <span className="inline-block max-w-[65%] truncate rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-primary uppercase sm:text-[11px]">
            {formatCategory(product.nama_kategori)}
          </span>
          <span className="shrink-0 text-[11px] text-muted-foreground">
            Stok: <strong className="text-foreground">{product.Stok ?? (isAvailable ? "Tersedia" : 0)}</strong>
          </span>
        </div>

        {/* 5. Nama Produk */}
        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-primary sm:text-base">
          <Link
            className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            href={`/store/produk/${product.id}`}
          >
            {product.NamaItem}
          </Link>
        </h3>

        {/* 6. Harga Produk SAJA */}
        <div className="mt-auto pt-2">
          <p className="font-heading text-base font-bold tracking-tight text-primary sm:text-lg">
            {formatRupiah(product.HargaJual)}
          </p>
        </div>
      </CardContent>

      {/* Aksi Tambah ke Keranjang */}
      <CardFooter className="flex-col items-stretch gap-1.5 border-t border-border/80 p-2.5 sm:p-3">
        <Button
          className="h-9 w-full gap-1.5 rounded-xl text-xs font-medium sm:text-sm"
          disabled={!isAvailable || isAdding}
          onClick={() => void handleAddToCart()}
          type="button"
        >
          {isAdding ? (
            "Menambahkan..."
          ) : (
            <>
              <Plus aria-hidden="true" className="size-4" />
              Tambah ke keranjang
            </>
          )}
        </Button>
        {feedback ? (
          <p
            aria-live="polite"
            className={
              feedbackIsError
                ? "text-center text-xs leading-4 text-destructive"
                : "text-center text-xs leading-4 text-primary"
            }
            role={feedbackIsError ? "alert" : "status"}
          >
            {feedback}
          </p>
        ) : null}
      </CardFooter>
    </Card>
  );
}
