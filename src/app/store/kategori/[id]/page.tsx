"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { StoreFooter } from "@/components/store-footer";
import { StoreNavbar } from "@/components/store-navbar";
import { StoreProductCard } from "@/components/store-product-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/lib/store-catalog";
import { getKategori, listBarangByKategori } from "@/services/kategoriService";
import type { BarangCustomer, Kategori } from "@/types";

export default function StoreCategoryPage() {
  const params = useParams<{ id: string }>();
  const categoryId = Number(params.id);
  const isValidCategoryId = Number.isInteger(categoryId) && categoryId > 0;
  const [category, setCategory] = useState<Kategori | null>(null);
  const [products, setProducts] = useState<BarangCustomer[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
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
          <Link className="hover:text-primary" href="/store/kategori">
            Kategori
          </Link>
          {category ? (
            <>
              <span aria-hidden="true" className="px-2">
                /
              </span>
              <span aria-current="page" className="font-medium text-foreground">
                {category.nama_kategori}
              </span>
            </>
          ) : null}
        </nav>

        <section aria-labelledby="category-products-title">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">
                Kategori produk
              </p>
              <h1
                className="mt-3 font-heading text-3xl font-semibold tracking-tight sm:text-4xl"
                id="category-products-title"
              >
                {category?.nama_kategori ?? "Produk kategori"}
              </h1>
              <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
                Pilihan produk segar untuk kebutuhan Anda.
              </p>
            </div>
            <Button
              nativeButton={false}
              render={<Link href="/store/produk" />}
              variant="outline"
            >
              <ArrowLeft aria-hidden="true" data-icon="inline-start" />
              Semua produk
            </Button>
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

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
            {isLoading && isValidCategoryId
              ? Array.from({ length: 8 }, (_, index) => (
                  <div
                    className="overflow-hidden rounded-xl border border-border bg-card p-4"
                    key={`category-product-skeleton-${index}`}
                  >
                    <Skeleton className="aspect-[4/3] w-full" />
                    <Skeleton className="mt-4 h-4 w-1/3" />
                    <Skeleton className="mt-3 h-5 w-3/4" />
                    <Skeleton className="mt-6 h-10 w-full" />
                  </div>
                ))
              : products.map((product) => (
                  <StoreProductCard key={product.id} product={product} />
                ))}
            {!isLoading && !error && isValidCategoryId && products.length === 0 ? (
              <div className="col-span-full rounded-2xl border border-dashed border-border bg-card px-5 py-12 text-center">
                <h2 className="font-heading text-lg font-semibold">
                  Belum ada produk tersedia
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Coba lihat kategori lain atau kembali lagi nanti.
                </p>
              </div>
            ) : null}
          </div>

          {!isLoading && !error && lastPage > 1 ? (
            <nav
              aria-label="Navigasi halaman produk kategori"
              className="mt-8 flex items-center justify-between gap-3"
            >
              <Button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((page) => page - 1)}
                variant="outline"
              >
                <ArrowLeft aria-hidden="true" data-icon="inline-start" />
                Sebelumnya
              </Button>
              <p className="text-sm text-muted-foreground">
                Halaman {currentPage} dari {lastPage}
              </p>
              <Button
                disabled={currentPage >= lastPage}
                onClick={() => setCurrentPage((page) => page + 1)}
                variant="outline"
              >
                Berikutnya
                <ArrowRight aria-hidden="true" data-icon="inline-end" />
              </Button>
            </nav>
          ) : null}
        </section>
      </main>
      <StoreFooter />
    </div>
  );
}