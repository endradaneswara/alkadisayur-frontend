"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Search,
  ShoppingBag,
} from "lucide-react";
import { StoreFooter } from "@/components/store-footer";
import { StoreNavbar } from "@/components/store-navbar";
import { StoreProductCard } from "@/components/store-product-card";
import { ProductCardSkeleton } from "@/components/store-product-card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { StoreEmptyState } from "@/components/store-empty-state";
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
import { useDebounce } from "@/hooks/useDebounce";
import { queryKeys } from "@/lib/query-keys";
import { getErrorMessage } from "@/lib/store-catalog";
import { listBarang } from "@/services/barangService";
import {
  listBarangByKategori,
  listKategori,
} from "@/services/kategoriService";
import type { BarangCustomer } from "@/types";

function formatCategoryTitle(name?: string | null): string {
  if (!name) return "Umum";
  return name
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function similarityScore(value: string, term: string): number {
  const normalizedValue = value.toLocaleLowerCase("id-ID");

  if (normalizedValue.includes(term)) return 1;

  const matchingCharacters = [...term].filter((char) =>
    normalizedValue.includes(char),
  ).length;

  return matchingCharacters / Math.max(term.length, normalizedValue.length);
}

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function StoreProductsContent() {
  const searchParams = useSearchParams();
  const kategoriParam =
    searchParams.get("kategori") ?? searchParams.get("kategori_id");
  const initialCategory = kategoriParam ? Number(kategoriParam) : null;
  const [selectedCategory, setSelectedCategory] = useState<number | null>(
    initialCategory && !isNaN(initialCategory) ? initialCategory : null,
  );

  const heroImages = [
    { src: "/alkadi3.webp", alt: "Belanja kebutuhan segar Alkadi" },
    { src: "/alkadi4.webp", alt: "Pilihan produk segar Alkadi" },
    { src: "/alkadi5.webp", alt: "Kesegaran produk Alkadi" },
  ];
  const [heroSlide, setHeroSlide] = useState(0);
  const [isHeroHovered, setIsHeroHovered] = useState(false);
  const previousHeroSlide =
    (heroSlide - 1 + heroImages.length) % heroImages.length;
  const nextHeroSlide = (heroSlide + 1) % heroImages.length;

  useEffect(() => {
    if (isHeroHovered) return;

    const interval = window.setInterval(() => {
      setHeroSlide((current) => (current + 1) % heroImages.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [heroImages.length, isHeroHovered]);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(searchTerm, 400);

  // Categories list query
  const categoriesQuery = useQuery({
    queryKey: queryKeys.kategori.list({ page: 1 }),
    queryFn: async () => {
      const response = await listKategori({ page: 1 });
      return response.data;
    },
  });


  const queryPage = debouncedSearch ? 1 : page;
  const productsQuery = useQuery({
    queryKey:
      selectedCategory === null
        ? queryKeys.barang.list({ page: queryPage, search: debouncedSearch })
        : queryKeys.kategori.barang(selectedCategory, { page: queryPage }),
    queryFn: async () => {
      const response =
        selectedCategory === null
          ? await listBarang<BarangCustomer>({
              page: queryPage,
              search: debouncedSearch || undefined,
            })
          : await listBarangByKategori(selectedCategory, { page: queryPage });

      return response;
    },
  });

  const categories = categoriesQuery.data ?? [];
  const rawProducts = productsQuery.data?.data ?? [];
  const pagination = productsQuery.data?.meta;
  const isLoading = productsQuery.isLoading;

  const error =
    productsQuery.error instanceof Error
      ? getErrorMessage(productsQuery.error)
      : null;
  const categoryError =
    categoriesQuery.error instanceof Error
      ? getErrorMessage(categoriesQuery.error)
      : null;

  const lastPage = pagination?.last_page ?? 1;
  const filteredProducts = rawProducts;

  const suggestedCategories = useMemo(() => {
    const term = debouncedSearch.trim().toLocaleLowerCase("id-ID");

    if (!term) return [];

    const scored = categories
      .map((category) => ({
        category,
        score: similarityScore(category.nama_kategori, term),
      }))
      .filter((entry) => entry.score > 0.3);

    scored.sort((first, second) => second.score - first.score);

    return scored.slice(0, 5).map((entry) => entry.category);
  }, [categories, debouncedSearch]);

  const paginationItems = useMemo(() => {
    const pages = new Set([1, lastPage, page - 1, page, page + 1]);
    const visiblePages = [...pages]
      .filter((p) => p >= 1 && p <= lastPage)
      .sort((first, second) => first - second);

    return visiblePages.reduce<Array<number | "ellipsis">>(
      (items, p, index) => {
        const previousPage = visiblePages[index - 1];

        if (previousPage && p - previousPage > 1) {
          items.push("ellipsis");
        }

        items.push(p);
        return items;
      },
      [],
    );
  }, [page, lastPage]);

  function selectCategory(categoryId: number | null): void {
    setSelectedCategory(categoryId);
    setPage(1);
    scrollToId("katalog-produk");
  }

  function selectPage(target: number): void {
    setPage(Math.max(1, Math.min(target, lastPage)));
    scrollToId("katalog-produk");
  }

  function resetAllFilters(): void {
    setSelectedCategory(null);
    setSearchTerm("");
    setSearchInput("");
    setPage(1);
  }

  function submitSearch(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setSearchTerm(searchInput.trim());
    setPage(1);
    scrollToId("katalog-produk");
  }

  const selectedCategoryObj = categories.find((c) => c.id === selectedCategory);
  const isFiltering = selectedCategory !== null || debouncedSearch.trim() !== "";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <StoreNavbar />

      <main>
        <section
          aria-labelledby="product-hero-title"
          className="px-4 pt-10 pb-6 text-center sm:px-6 sm:pt-14 sm:pb-8 lg:px-10"
        >
          <div className="mx-auto max-w-3xl">
            <h1
              className="font-heading text-3xl font-semibold leading-[1.08] tracking-[-0.03em] text-primary sm:text-4xl lg:text-5xl"
              id="product-hero-title"
            >
              Pilihan produk segar,
              <br />
              <span className="text-foreground">untuk menemani hidangan Anda.</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-muted-foreground sm:mt-5 sm:text-base sm:leading-7">
              Jelajahi berbagai pilihan sayur, buah, dan kebutuhan dapur berkualitas. 
              Temukan produk favorit Anda dengan mudah.
            </p>
          </div>
        </section>

        <section
          aria-label="Slide promosi Alkadi"
          className="mx-4 mb-14 sm:mx-6 lg:mx-10"
        >
          <div
            className="relative mx-auto flex max-w-[96rem] items-center justify-center gap-6 sm:gap-10 md:gap-14"
            onMouseEnter={() => setIsHeroHovered(true)}
            onMouseLeave={() => setIsHeroHovered(false)}
          >
            <button
              aria-label="Lihat slide sebelumnya"
              className="group relative hidden aspect-square w-40 shrink-0 cursor-pointer overflow-hidden rounded-3xl border border-border/70 opacity-55 shadow-sm transition-opacity duration-300 hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 md:block lg:w-52 xl:w-60"
              onClick={() => setHeroSlide(previousHeroSlide)}
              type="button"
            >
              <Image
                alt=""
                className="object-contain transition-transform duration-500 group-hover:scale-105"
                fill
                loading="lazy"
                sizes="(max-width: 1024px) 160px, (max-width: 1280px) 208px, 240px"
                src={heroImages[previousHeroSlide].src}
              />
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute inset-0 flex items-center justify-center text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                <span className="flex size-12 items-center justify-center rounded-full bg-black/40">
                  <ChevronLeft aria-hidden="true" className="size-7" />
                </span>
              </div>
            </button>

            <div className="store-hero relative isolate aspect-square w-full max-w-[calc(100%-1rem)] flex-1 overflow-hidden border border-border/70 md:max-w-3xl">
              <div className="store-hero-background" aria-hidden="true">
                {heroImages.map((image, index) => (
                  <Image
                    alt={image.alt}
                    className={`object-contain transition-opacity duration-1000 ${
                      index === heroSlide ? "opacity-100" : "opacity-0"
                    }`}
                    fill
                    key={image.src}
                    loading="eager"
                    priority={index === 0}
                    sizes="(max-width: 640px) calc(100vw - 2rem), (max-width: 1024px) calc(100vw - 3rem), 768px"
                    src={image.src}
                  />
                ))}
              </div>
              <button
                aria-label="Lihat slide sebelumnya"
                className="absolute left-3 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/85 text-foreground shadow-sm transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:hidden"
                onClick={() => setHeroSlide(previousHeroSlide)}
                type="button"
              >
                <ChevronLeft aria-hidden="true" className="size-5" />
              </button>
              <button
                aria-label="Lihat slide berikutnya"
                className="absolute right-3 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/85 text-foreground shadow-sm transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:hidden"
                onClick={() => setHeroSlide(nextHeroSlide)}
                type="button"
              >
                <ChevronRight aria-hidden="true" className="size-5" />
              </button>
            </div>

            <button
              aria-label="Lihat slide berikutnya"
              className="group relative hidden aspect-square w-40 shrink-0 cursor-pointer overflow-hidden rounded-3xl border border-border/70 opacity-55 shadow-sm transition-opacity duration-300 hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 md:block lg:w-52 xl:w-60"
              onClick={() => setHeroSlide(nextHeroSlide)}
              type="button"
            >
              <Image
                alt=""
                className="object-contain transition-transform duration-500 group-hover:scale-105"
                fill
                loading="lazy"
                sizes="(max-width: 1024px) 160px, (max-width: 1280px) 208px, 240px"
                src={heroImages[nextHeroSlide].src}
              />
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute inset-0 flex items-center justify-center text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                <span className="flex size-12 items-center justify-center rounded-full bg-black/40">
                  <ChevronRight aria-hidden="true" className="size-7" />
                </span>
              </div>
            </button>
          </div>
          <div
            aria-hidden="true"
            className="mx-auto mt-6 max-w-7xl border-t border-border/70 sm:mt-8"
          />
          <div className="mx-auto mt-8 flex w-full max-w-3xl items-center gap-3 sm:mt-10">
            <form
              className="flex w-full min-w-0 items-center gap-2"
              onSubmit={submitSearch}
              role="search"
            >
              <label className="relative min-w-0 flex-1">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  aria-label="Cari produk atau kategori"
                  className="h-11 w-full rounded-xl border-border/80 bg-background pl-10 text-sm placeholder:text-muted-foreground sm:text-base"
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Cari produk atau kategori..."
                  type="search"
                  value={searchInput}
                />
              </label>
              <Button
                aria-label="Mulai pencarian"
                className="h-11 w-11 shrink-0 rounded-xl px-0 sm:w-auto sm:gap-1.5 sm:px-4"
                disabled={searchInput.trim() === searchTerm.trim()}
                type="submit"
              >
                <Search aria-hidden="true" className="size-4" />
                <span className="sr-only sm:not-sr-only">Cari</span>
              </Button>
            </form>
          </div>
          {categoryError ? (
            <p
              className="mx-auto mt-3 max-w-3xl text-sm text-destructive"
              role="alert"
            >
              Gagal memuat kategori: {categoryError}
            </p>
          ) : null}
        </section>
        
        <section
          aria-labelledby="catalog-section-title"
          className="scroll-mt-20 py-12 sm:py-16 lg:py-20"
          id="katalog-produk"
        >
          <div className="mx-auto max-w-[1536px] px-4 sm:px-6 lg:px-10 xl:px-12">
            <div className="space-y-8">
              <div className="flex flex-col items-start justify-between gap-4 border-b border-border/60 pb-5 sm:flex-row sm:items-end">
                <div>
                  <h2
                    className="font-heading text-2xl font-bold tracking-tight sm:text-3xl"
                    id="catalog-section-title"
                  >
                    {selectedCategoryObj
                      ? `Produk kategori ${formatCategoryTitle(selectedCategoryObj.nama_kategori)}`
                      : isFiltering
                        ? `Hasil pencarian untuk “${debouncedSearch}”`
                        : "Semua Produk"}
                  </h2>
                  <p
                    aria-live="polite"
                    className="mt-1 text-sm text-muted-foreground"
                  >
                    {isLoading
                      ? "Memuat produk..."
                      : `${pagination?.total ?? rawProducts.length} produk tersedia`}
                  </p>
                </div>

                {isFiltering ? (
                  <Button
                    className="gap-2"
                    onClick={resetAllFilters}
                    size="sm"
                    variant="outline"
                  >
                    <RotateCcw aria-hidden="true" className="size-4" />
                    Tampilkan semua
                  </Button>
                ) : null}
              </div>

              {suggestedCategories.length > 0 ? (
                <div className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3.5">
                  <p className="text-sm font-medium">
                    Kategori yang mendekati pencarian
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {suggestedCategories.map((category) => (
                      <Button
                        key={category.id}
                        onClick={() => selectCategory(category.id)}
                        size="sm"
                        variant="outline"
                      >
                        {formatCategoryTitle(category.nama_kategori)}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : null}

              {error ? (
                <p
                  className="rounded-xl border border-destructive/30 bg-card px-4 py-3 text-sm text-destructive"
                  role="alert"
                >
                  Produk belum dapat dimuat: {error}
                </p>
              ) : null}

              <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {isLoading
                  ? Array.from({ length: 12 }, (_, index) => (
                      <ProductCardSkeleton key={`product-skeleton-${index}`} />
                    ))
                  : filteredProducts.map((product) => (
                      <StoreProductCard key={product.id} product={product} />
                    ))}

                {!isLoading && !error && filteredProducts.length === 0 ? (
                  <StoreEmptyState
                    action={{
                      label: "Tampilkan semua produk",
                      onClick: resetAllFilters,
                    }}
                    className="col-span-full"
                    description="Tidak ada produk yang cocok. Coba kata kunci lain atau pilih salah satu kategori yang mendekati."
                    icon={ShoppingBag}
                    title="Produk tidak ditemukan"
                  />
                ) : null}
              </div>

              {!isLoading && !error && lastPage > 1 ? (
                <div className="mt-8 flex flex-col items-center gap-3">
                  <Pagination aria-label="Navigasi halaman produk">
                    <PaginationContent className="flex-wrap">
                      <PaginationItem>
                        <PaginationPrevious
                          aria-disabled={page <= 1}
                          className={
                            page <= 1
                              ? "pointer-events-none opacity-50"
                              : undefined
                          }
                          href="#katalog-produk"
                          onClick={(event) => {
                            event.preventDefault();
                            selectPage(page - 1);
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
                              href="#katalog-produk"
                              isActive={item === page}
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
                          aria-disabled={page >= lastPage}
                          className={
                            page >= lastPage
                              ? "pointer-events-none opacity-50"
                              : undefined
                          }
                          href="#katalog-produk"
                          onClick={(event) => {
                            event.preventDefault();
                            selectPage(page + 1);
                          }}
                          text="Berikutnya"
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                  <p className="text-sm text-muted-foreground">
                    Halaman {page} dari {lastPage}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      </main>

      <StoreFooter />
    </div>
  );
}

export default function StoreProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background text-foreground">
          <StoreNavbar />
          <main className="mx-auto max-w-[1536px] px-4 py-8 sm:px-6 sm:py-10 lg:px-10 xl:px-12">
            <div className="space-y-8">
              <Skeleton className="h-64 w-full rounded-3xl" />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
                {Array.from({ length: 8 }, (_, i) => (
                  <Skeleton className="h-28 rounded-2xl" key={i} />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {Array.from({ length: 12 }, (_, i) => (
                  <Skeleton className="aspect-[4/3] rounded-2xl" key={i} />
                ))}
              </div>
            </div>
          </main>
          <StoreFooter />
        </div>
      }
    >
      <StoreProductsContent />
    </Suspense>
  );
}
