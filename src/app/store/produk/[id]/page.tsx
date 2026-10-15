"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, ImagePlus, Plus } from "lucide-react";
import { StoreFooter } from "@/components/store-footer";
import { StoreNavbar } from "@/components/store-navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  formatRupiah,
  getErrorMessage,
  getProductImageUrl,
} from "@/lib/store-catalog";
import { hasAuthSession } from "@/services/api";
import { getBarang } from "@/services/barangService";
import { addItemKeranjang } from "@/services/keranjangService";
import type { BarangCustomer } from "@/types";

export default function StoreProductPage() {
  const params = useParams<{ id: string }>();
  const productId = Number(params.id);
  const isValidProductId = Number.isInteger(productId) && productId > 0;
  const router = useRouter();
  const [product, setProduct] = useState<BarangCustomer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackIsError, setFeedbackIsError] = useState(false);

  useEffect(() => {
    if (!isValidProductId) {
      return;
    }

    let isCurrent = true;

    void getBarang<BarangCustomer>(productId)
      .then((response) => {
        if (isCurrent) {
          setProduct(response.data);
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
  }, [isValidProductId, productId]);

  async function handleAddToCart(): Promise<void> {
    if (!product) {
      return;
    }

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
    } catch (addError: unknown) {
      setFeedback(getErrorMessage(addError));
      setFeedbackIsError(true);
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <StoreNavbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <nav
          aria-label="Breadcrumb"
          className="mb-6 text-sm text-muted-foreground"
        >
          <Link className="hover:text-primary" href="/store">
            Beranda
          </Link>
          <span aria-hidden="true" className="px-2">
            /
          </span>
          <Link className="hover:text-primary" href="/store/produk">
            Produk
          </Link>
          {product ? (
            <>
              <span aria-hidden="true" className="px-2">
                /
              </span>
              <span aria-current="page" className="font-medium text-foreground">
                {product.NamaItem}
              </span>
            </>
          ) : null}
        </nav>

        <Button
          className="mb-6"
          nativeButton={false}
          render={<Link href="/store/produk" />}
          variant="ghost"
        >
          <ArrowLeft aria-hidden="true" data-icon="inline-start" />
          Kembali ke produk
        </Button>

        {!isValidProductId ? (
          <p
            className="rounded-xl border border-destructive/30 bg-card px-4 py-3 text-sm text-destructive"
            role="alert"
          >
            Produk yang diminta tidak valid.
          </p>
        ) : null}
        {error ? (
          <p
            className="rounded-xl border border-destructive/30 bg-card px-4 py-3 text-sm text-destructive"
            role="alert"
          >
            Produk belum dapat dimuat: {error}
          </p>
        ) : null}

        {isLoading && isValidProductId ? (
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
            <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
            <div className="flex flex-col gap-4 py-2">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="mt-4 h-24 w-full" />
              <Skeleton className="mt-4 h-11 w-full" />
            </div>
          </div>
        ) : null}

        {!isLoading && !error && product ? (
          <section
            aria-labelledby="product-title"
            className="grid items-start gap-6 lg:grid-cols-2 lg:gap-12"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-secondary">
              {product.Foto && !imageFailed ? (
                <Image
                  alt={product.NamaItem}
                  className="object-cover"
                  fill
                  onError={() => setImageFailed(true)}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  src={getProductImageUrl(product.Foto)}
                  unoptimized
                />
              ) : (
                <div
                  aria-label={`Foto ${product.NamaItem} belum tersedia`}
                  className="flex h-full flex-col items-center justify-center gap-3 text-primary"
                  role="img"
                >
                  <ImagePlus aria-hidden="true" className="size-10" />
                  <span className="text-sm font-medium">
                    Foto produk belum tersedia
                  </span>
                </div>
              )}
            </div>

            <Card className="border-border p-5 sm:p-8">
              <CardContent className="flex flex-col gap-5 p-0">
                {product.nama_kategori ? (
                  <Link
                    className="w-fit text-sm font-medium text-primary hover:underline"
                    href={`/store/kategori/${product.kategori_id}`}
                  >
                    {product.nama_kategori}
                  </Link>
                ) : null}
                <div className="flex flex-wrap items-center gap-3">
                  <h1
                    className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl"
                    id="product-title"
                  >
                    {product.NamaItem}
                  </h1>
                  <Badge variant={product.Status === "tersedia" ? "secondary" : "outline"}>
                    {product.Status === "tersedia" ? "Tersedia" : "Stok habis"}
                  </Badge>
                </div>
                {product.Merek ? (
                  <p className="text-sm text-muted-foreground">
                    Merek: {product.Merek}
                  </p>
                ) : null}
                <p className="font-heading text-2xl font-semibold text-primary">
                  {formatRupiah(product.HargaJual)}
                </p>
                <div className="border-t border-border pt-5">
                  <h2 className="font-semibold">Deskripsi produk</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {product.Keterangan || "Belum ada deskripsi untuk produk ini."}
                  </p>
                </div>
                <Button
                  className="h-11 w-full sm:w-fit"
                  disabled={product.Status !== "tersedia" || isAdding}
                  onClick={() => void handleAddToCart()}
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
                        ? "text-sm text-destructive"
                        : "text-sm text-primary"
                    }
                    role={feedbackIsError ? "alert" : "status"}
                  >
                    {feedback}
                  </p>
                ) : null}
              </CardContent>
            </Card>
          </section>
        ) : null}
      </main>
      <StoreFooter />
    </div>
  );
}