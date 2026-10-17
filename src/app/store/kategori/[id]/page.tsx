"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Sparkles, Sprout } from "lucide-react";
import { StoreFooter } from "@/components/store-footer";
import { StoreNavbar } from "@/components/store-navbar";
import { StoreProductCard } from "@/components/store-product-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/lib/store-catalog";
import { getKategori, listBarangByKategori } from "@/services/kategoriService";
import type { BarangCustomer, Kategori } from "@/types";

function formatCategory(name?: string | null): string {
  if (!name) return "Produk Kategori";
  return name.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function StoreCategoryPage() {
  const params = useParams<{ id: string }>();
  const categoryId = Number(params.id);
  const isValidCategoryId = Number.isInteger(categoryId) && categoryId > 0;
  const [category, setCategory] = useState<Kategori | null>(null);
  const [products, setProducts] = useState<BarangCustomer[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isValidCategoryId) {
      return;
    }

    let isCurrent = true;

    void Promise.all([
      getKategori(categoryId),
      listBarangByKategori(categoryId, { page: currentPage }),
    ])
      .then(([categoryResponse, productResponse]) => {
        if (isCurrent) {
          setCategory(categoryResponse.data);
          setProducts(productResponse.data);
          setCurrentPage(productResponse.meta.current_page);
          setLastPage(productResponse.meta.last_page);
          setTotalItems(productResponse.meta.total);
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
  }, [categoryId, currentPage, isValidCategoryId]);

  const formattedCategoryTitle = formatCategory(category?.nama_kategori);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <StoreNavbar />
      <main className="mx-auto max-w-[1536px] px-4 py-8 sm:px-6 sm:py-10 lg:px-10 xl:px-12">
        {/* Breadcrumb */}
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
          <Link className="hover:text-primary" href="/store/kategori">
            Kategori
          </Link>
          {category ? (
            <>
              <span aria-hidden="true" className="px-2">
                /
              </span>
              <span aria-current="page" className="font-medium text-foreground">
                {formattedCategoryTitle}
              </span>
            </>
          ) : null}
        </nav>

        <section aria-labelledby="category-products-title">
          {/* Header Kategori Banner */}
          <div className="mb-8 flex flex-col items-start justify-between gap-4 rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/10 via-emerald-500/5 to-background p-6 shadow-xs sm:flex-row sm:items-center sm:p-8">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                <Sparkles className="size-3.5" />
                Katalog Kategori
              </span>
              <h1
                className="mt-2 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
                id="category-products-title"
              >
                {isLoading && !category ? "Memuat Kategori..." : formattedCategoryTitle}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                Pilihan produk segar dan berkualitas terbaik dalam kategori ini.
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <Button
                className="gap-2 rounded-xl text-xs sm:text-sm"
                nativeButton={false}
                render={<Link href="/store/kategori" />}
                variant="outline"
              >
                <ArrowLeft aria-hidden="true" className="size-4" />
                Semua Kategori
              </Button>
            </div>
          </div>

          <div className="mb-5 flex items-center justify-between">
            <p aria-live="polite" className="text-sm text-muted-foreground">
              {isLoading
                ? "Memuat produk..."
                : `${products.length} produk ditampilkan${totalItems > 0 ? ` (dari ${totalItems} total)` : ""}`}
            </p>
          </div>

          {!isValidCategoryId ? (
            <p
              className="rounded-xl border border-destructive/30 bg-card px-4 py-3 text-sm text-destructive"
              role="alert"
            >
              Kategori yang diminta tidak valid.
            </p>
          ) : null}
          {error ? (
            <p
              className="mb-6 rounded-xl border border-destructive/30 bg-card px-4 py-3 text-sm text-destructive"
              role="alert"
            >
              Produk kategori belum dapat dimuat: {error}
            </p>
          ) : null}

          {/* Grid Produk Kategori */}
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {isLoading && isValidCategoryId
              ? Array.from({ length: 12 }, (_, index) => (
                  <div
                    className="overflow-hidden rounded-2xl border border-border bg-card p-3 sm:p-4"
                    key={`category-product-skeleton-${index}`}
                  >
                    <Skeleton className="aspect-[4/3] w-full rounded-xl" />
                    <Skeleton className="mt-3 h-4 w-1/3" />
                    <Skeleton className="mt-2 h-5 w-3/4" />
                    <Skeleton className="mt-4 h-9 w-full rounded-xl" />
                  </div>
                ))
              : products.map((product) => (
                  <StoreProductCard key={product.id} product={product} />
                ))}
            {!isLoading && !error && isValidCategoryId && products.length === 0 ? (
              <div className="col-span-full rounded-2xl border border-dashed border-border bg-card px-5 py-12 text-center">
                <Sprout className="mx-auto size-12 text-muted-foreground/60" />
                <h2 className="mt-3 font-heading text-lg font-semibold text-foreground">
                  Belum ada produk pada kategori ini
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Coba jelajahi kategori lain atau kembali ke beranda.
                </p>
                <div className="mt-5">
                  <Button
                    nativeButton={false}
                    render={<Link href="/store/kategori" />}
                    size="sm"
                    variant="outline"
                  >
                    Lihat Kategori Lain
                  </Button>
                </div>
              </div>
            ) : null}
          </div>

          {!isLoading && !error && lastPage > 1 ? (
            <nav
              aria-label="Navigasi halaman produk kategori"
              className="mt-8 flex items-center justify-between gap-3"
            >
              <Button
                className="gap-1.5 rounded-xl text-xs sm:text-sm"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((page) => page - 1)}
                variant="outline"
              >
                <ArrowLeft aria-hidden="true" className="size-4" />
                Sebelumnya
              </Button>
              <p className="text-sm text-muted-foreground">
                Halaman {currentPage} dari {lastPage}
              </p>
              <Button
                className="gap-1.5 rounded-xl text-xs sm:text-sm"
                disabled={currentPage >= lastPage}
                onClick={() => setCurrentPage((page) => page + 1)}
                variant="outline"
              >
                Berikutnya
                <ArrowRight aria-hidden="true" className="size-4" />
              </Button>
            </nav>
          ) : null}
        </section>
      </main>
      <StoreFooter />
    </div>
  );
}