"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import { StoreFooter } from "@/components/store-footer";
import { StoreNavbar } from "@/components/store-navbar";
import { StoreProductCard } from "@/components/store-product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/lib/store-catalog";
import { listBarang } from "@/services/barangService";
import {
  listBarangByKategori,
  listKategori,
} from "@/services/kategoriService";
import type { BarangCustomer, Kategori } from "@/types";

interface PaginationState {
  currentPage: number;
  lastPage: number;
  total: number;
}

const emptyPagination: PaginationState = {
  currentPage: 1,
  lastPage: 1,
  total: 0,
};

export default function StoreProductsPage() {
  const [products, setProducts] = useState<BarangCustomer[]>([]);
  const [categories, setCategories] = useState<Kategori[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState(emptyPagination);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;

    void listKategori({ page: 1 })
      .then((response) => {
        if (isCurrent) {
          setCategories(response.data);
        }
      })
      .catch((loadError: unknown) => {
        if (isCurrent) {
          setCategoryError(getErrorMessage(loadError));
        }
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  useEffect(() => {
    let isCurrent = true;

    void Promise.resolve().then(() => {
      if (!isCurrent) {
        return;
      }

      setIsLoading(true);
      setError(null);

      const request =
        selectedCategory === null
          ? listBarang({ page: pagination.currentPage })
          : listBarangByKategori(selectedCategory, {
              page: pagination.currentPage,
            });

      return request
        .then((response) => {
          if (isCurrent) {
            setProducts(response.data);
            setPagination({
              currentPage: response.meta.current_page,
              lastPage: response.meta.last_page,
              total: response.meta.total,
            });
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
    });

    return () => {
      isCurrent = false;
    };
  }, [pagination.currentPage, selectedCategory]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLocaleLowerCase("id-ID");

    if (!normalizedSearch) {
      return products;
    }

    return products.filter((product) =>
      [
        product.NamaItem,
        product.Merek,
        product.nama_kategori,
        product.Keterangan,
      ]
        .filter(Boolean)
        .some((value) =>
          value?.toLocaleLowerCase("id-ID").includes(normalizedSearch),
        ),
    );
  }, [products, searchTerm]);

  const paginationItems = useMemo(() => {
    const pages = new Set([
      1,
      pagination.lastPage,
      pagination.currentPage - 1,
      pagination.currentPage,
      pagination.currentPage + 1,
    ]);
    const visiblePages = [...pages]
      .filter((page) => page >= 1 && page <= pagination.lastPage)
      .sort((first, second) => first - second);

    return visiblePages.reduce<Array<number | "ellipsis">>((items, page, index) => {
      const previousPage = visiblePages[index - 1];

      if (previousPage && page - previousPage > 1) {
        items.push("ellipsis");
      }

      items.push(page);
      return items;
    }, []);
  }, [pagination.currentPage, pagination.lastPage]);

  function selectCategory(categoryId: number | null): void {
    setSelectedCategory(categoryId);
    setPagination(emptyPagination);
  }

  function selectPage(page: number): void {
    setPagination((current) => ({
      ...current,
      currentPage: Math.max(1, Math.min(page, current.lastPage)),
    }));
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <StoreNavbar />
      <main className="mx-auto max-w-[1536px] px-4 py-8 sm:px-6 sm:py-10 lg:px-10 xl:px-12">
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
          <span aria-current="page" className="font-medium text-foreground">
            Produk
          </span>
        </nav>

        <section aria-labelledby="products-title">
          <div className="mb-7 max-w-3xl">
            <p className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">
              Segar untuk setiap hidangan
            </p>
            <h1
              className="mt-2 font-heading text-3xl font-semibold tracking-tight sm:text-4xl"
              id="products-title"
            >
              Semua produk
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">
              Pilih aneka sayur segar dan kebutuhan dapur berkualitas langsung dari katalog Alkadi.
            </p>
          </div>

          <div className="mb-8 flex flex-col items-stretch justify-between gap-3 rounded-2xl border border-border/80 bg-card p-3 shadow-xs sm:flex-row sm:items-center sm:p-4">
            <div className="flex flex-1 items-center gap-3">
              <label className="relative min-w-0 flex-1">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  aria-label="Cari produk"
                  className="h-10 w-full rounded-xl border-border/80 bg-background pl-10 text-sm placeholder:text-muted-foreground sm:text-base"
                  onChange={(event) => {
                    setSearchTerm(event.target.value);
                    selectPage(1);
                  }}
                  placeholder="Cari produk atau kategori..."
                  type="search"
                  value={searchTerm}
                />
              </label>

              <div className="w-44 shrink-0 sm:w-56">
                <Select
                  items={[
                    { label: "Semua kategori", value: "all" },
                    ...categories.map((category) => ({
                      label: category.nama_kategori,
                      value: String(category.id),
                    })),
                  ]}
                  value={
                    selectedCategory === null
                      ? "all"
                      : String(selectedCategory)
                  }
                  onValueChange={(value) => {
                    selectCategory(
                      !value || value === "all" ? null : Number(value)
                    );
                  }}
                >
                  <SelectTrigger
                    aria-label="Filter kategori"
                    className="h-10 w-full rounded-xl border-border/80 bg-background"
                  >
                    <SelectValue placeholder="Semua kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Kategori produk</SelectLabel>
                      <SelectItem value="all">Semua kategori</SelectItem>
                      {categories.map((category) => (
                        <SelectItem
                          key={category.id}
                          value={String(category.id)}
                        >
                          {category.nama_kategori}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {categoryError ? (
            <p className="mb-4 text-sm text-destructive" role="alert">
              Filter kategori belum dapat dimuat: {categoryError}
            </p>
          ) : null}

          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p aria-live="polite" className="text-sm text-muted-foreground">
              {isLoading
                ? "Memuat produk..."
                : `${filteredProducts.length} produk pada halaman ini`}
            </p>
            {selectedCategory !== null ? (
              <Button
                nativeButton={false}
                render={<Link href="/store/kategori" />}
                size="sm"
                variant="ghost"
              >
                Jelajahi semua kategori
                <ArrowRight aria-hidden="true" data-icon="inline-end" />
              </Button>
            ) : null}
          </div>

          {error ? (
            <p
              className="mb-6 rounded-xl border border-destructive/30 bg-card px-4 py-3 text-sm text-destructive"
              role="alert"
            >
              Produk belum dapat dimuat: {error}
            </p>
          ) : null}

          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {isLoading
              ? Array.from({ length: 12 }, (_, index) => (
                  <div
                    className="overflow-hidden rounded-2xl border border-border bg-card p-3 sm:p-4"
                    key={`product-skeleton-${index}`}
                  >
                    <Skeleton className="aspect-[4/3] w-full rounded-xl" />
                    <Skeleton className="mt-3 h-4 w-1/3" />
                    <Skeleton className="mt-2 h-5 w-3/4" />
                    <Skeleton className="mt-4 h-9 w-full rounded-xl" />
                  </div>
                ))
              : filteredProducts.map((product) => (
                  <StoreProductCard key={product.id} product={product} />
                ))}
            {!isLoading && !error && filteredProducts.length === 0 ? (
              <div className="col-span-full rounded-2xl border border-dashed border-border bg-card px-5 py-12 text-center">
                <h2 className="font-heading text-lg font-semibold">
                  Produk tidak ditemukan
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Coba kata kunci lain atau pilih kategori yang berbeda.
                </p>
              </div>
            ) : null}
          </div>

          {!isLoading && !error && pagination.lastPage > 1 ? (
            <div className="mt-8 flex flex-col items-center gap-3">
              <Pagination aria-label="Navigasi halaman produk">
                <PaginationContent className="flex-wrap">
                  <PaginationItem>
                    <PaginationPrevious
                      aria-label="Halaman sebelumnya"
                      aria-disabled={pagination.currentPage <= 1}
                      className={
                        pagination.currentPage <= 1
                          ? "pointer-events-none opacity-50"
                          : undefined
                      }
                      href="#products-title"
                      onClick={(event) => {
                        event.preventDefault();
                        selectPage(pagination.currentPage - 1);
                      }}
                      text="Sebelumnya"
                    />
                  </PaginationItem>
                  {paginationItems.map((item, index) => (
                    <PaginationItem key={`${item}-${index}`}>
                      {item === "ellipsis" ? (
                        <PaginationEllipsis />
                      ) : (
                        <PaginationLink
                          aria-label={`Halaman ${item}`}
                          href="#products-title"
                          isActive={item === pagination.currentPage}
                          onClick={(event) => {
                            event.preventDefault();
                            selectPage(item);
                          }}
                        >
                          {item}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      aria-label="Halaman berikutnya"
                      aria-disabled={
                        pagination.currentPage >= pagination.lastPage
                      }
                      className={
                        pagination.currentPage >= pagination.lastPage
                          ? "pointer-events-none opacity-50"
                          : undefined
                      }
                      href="#products-title"
                      onClick={(event) => {
                        event.preventDefault();
                        selectPage(pagination.currentPage + 1);
                      }}
                      text="Berikutnya"
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
              <p className="text-sm text-muted-foreground">
                Halaman {pagination.currentPage} dari {pagination.lastPage}
              </p>
            </div>
          ) : null}
        </section>
      </main>
      <StoreFooter />
    </div>
  );
}