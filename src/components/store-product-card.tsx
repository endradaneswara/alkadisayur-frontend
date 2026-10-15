"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ImagePlus, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { hasAuthSession } from "@/services/api";
import { addItemKeranjang } from "@/services/keranjangService";
import { getErrorMessage, getProductImageUrl, formatRupiah } from "@/lib/store-catalog";
import type { BarangCustomer } from "@/types";

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
    <Card className="store-product-card flex h-full flex-col overflow-hidden border-border py-0">
      <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
        {product.Foto && !imageFailed ? (
          <Image
            alt={product.NamaItem}
            className="object-cover"
            fill
            onError={() => setImageFailed(true)}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            src={getProductImageUrl(product.Foto)}
            unoptimized
          />
        ) : (
          <div
            aria-label={`Foto ${product.NamaItem} belum tersedia`}
            className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center text-primary"
            role="img"
          >
            <ImagePlus aria-hidden="true" className="size-8" />
            <span className="text-xs font-medium">
              Foto produk belum tersedia
            </span>
          </div>
        )}
        <Badge
          className="absolute top-2 left-2"
          variant={isAvailable ? "secondary" : "outline"}
        >
          {isAvailable ? "Tersedia" : "Stok habis"}
        </Badge>
      </div>

      <CardHeader className="gap-1.5 px-3 pt-3 sm:px-4">
        {product.nama_kategori ? (
          <p className="truncate text-xs font-medium text-muted-foreground">
            {product.nama_kategori}
          </p>
        ) : null}
        <CardTitle className="line-clamp-2 min-h-10 text-sm leading-5 sm:text-base">
          <Link
            className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            href={`/store/produk/${product.id}`}
          >
            {product.NamaItem}
          </Link>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-1.5 px-3 sm:px-4">
        {product.Merek ? (
          <p className="truncate text-xs text-muted-foreground sm:text-sm">
            {product.Merek}
          </p>
        ) : null}
        {product.Keterangan ? (
          <p className="line-clamp-2 text-xs leading-4 text-muted-foreground sm:text-sm sm:leading-5">
            {product.Keterangan}
          </p>
        ) : null}
        <p className="mt-auto pt-2 font-heading text-base font-semibold text-primary sm:text-lg">
          {formatRupiah(product.HargaJual)}
        </p>
      </CardContent>

      <CardFooter className="flex-col items-stretch gap-2 border-t border-border p-3">
        <Button
          className="h-9 w-full text-xs sm:text-sm"
          disabled={!isAvailable || isAdding}
          onClick={() => void handleAddToCart()}
          type="button"
        >
          {isAdding ? (
            "Menambahkan..."
          ) : (
            <>
              <Plus aria-hidden="true" data-icon="inline-start" />
              Tambah ke keranjang
            </>
          )}
        </Button>
        {feedback ? (
          <p
            aria-live="polite"
            className={
              feedbackIsError
                ? "text-xs leading-5 text-destructive"
                : "text-xs leading-5 text-primary"
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
