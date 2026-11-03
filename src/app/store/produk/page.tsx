"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Apple,
  ArrowRight,
  Beef,
  CheckCircle2,
  ChevronRight,
  Coffee,
  Flame,
  Layers,
  Leaf,
  RotateCcw,
  Search,
  ShieldCheck,
  ShoppingBag,
  Snowflake,
  Sparkles,
  Truck,
  UtensilsCrossed,
  Wheat,
  type LucideIcon,
} from "lucide-react";
import { StoreFooter } from "@/components/store-footer";
import { StoreNavbar } from "@/components/store-navbar";
import { StoreProductCard } from "@/components/store-product-card";
import { ProductCardSkeleton } from "@/components/store-product-card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { StoreEmptyState } from "@/components/store-empty-state";
import { Badge } from "@/components/ui/badge";
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
import { useCart } from "@/hooks/useCart";
import { useDebounce } from "@/hooks/useDebounce";
import { queryKeys } from "@/lib/query-keys";
import { getErrorMessage, isProductAvailable } from "@/lib/store-catalog";
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

function getCategoryVisual(name: string): { image: string; icon: LucideIcon } {
  const normalized = name.toLowerCase().trim();
  if (normalized.includes("sayur")) {
    return { image: "/sayuran.webp", icon: Leaf };
  }
  if (normalized.includes("buah")) {
    return { image: "/sayur background1.webp", icon: Apple };
  }
  if (normalized.includes("bumbu")) {
    return { image: "/bumbu-dapur.webp", icon: UtensilsCrossed };
  }
  if (normalized.includes("pokok")) {
    return { image: "/sayur-background2.webp", icon: Wheat };
  }
  if (normalized.includes("hewan") || normalized.includes("daging")) {
    return { image: "/hewani.webp", icon: Beef };
  }
  if (normalized.includes("minum") || normalized.includes("makan")) {
    return { image: "/minuman.webp", icon: Coffee };
  }
  if (normalized.includes("frozen") || normalized.includes("beku")) {
    return { image: "/frozen-food.webp", icon: Snowflake };
  }
  return { image: "/sayur background4.webp", icon: ShoppingBag };
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

  useEffect(() => {
    const param =
      searchParams.get("kategori") ?? searchParams.get("kategori_id");
    const catId = param ? Number(param) : null;
    if (catId && !isNaN(catId)) {
      setSelectedCategory(catId);
    }
  }, [searchParams]);

  const heroImages = [
    { src: "/background-landing2.webp", alt: "Sayuran segar Alkadi" },
    { src: "/sayuran.webp", alt: "Pilihan sayuran segar" },
    { src: "/bumbu-dapur.webp", alt: "Bumbu dapur pilihan" },
  ];
  const [heroSlide, setHeroSlide] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setHeroSlide((current) => (current + 1) % heroImages.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [heroImages.length]);

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(searchTerm, 400);
  const { cart } = useCart();
  const cartCount = cart?.total_item ?? 0;

  // Categories list query
  const categoriesQuery = useQuery({
    queryKey: queryKeys.kategori.list({ page: 1 }),
    queryFn: async () => {
      const response = await listKategori({ page: 1 });
      return response.data;
    },
  });

  // Featured products query for curated top picks
  const featuredQuery = useQuery({
    queryKey: ["barang", "featured-curated"] as const,
    queryFn: async () => {
      const response = await listBarang<BarangCustomer>({ page: 1 });
      return response.data;
    },
    enabled: selectedCategory === null && !debouncedSearch,
  });

  // Main paginated query (responds to page and selectedCategory)
  const productsQuery = useQuery({
    queryKey:
      selectedCategory === null
        ? queryKeys.barang.list({ page })
        : queryKeys.kategori.barang(selectedCategory, { page }),
    queryFn: async () => {
      const response =
        selectedCategory === null
          ? await listBarang<BarangCustomer>({ page })
          : await listBarangByKategori(selectedCategory, { page });

      return response;
    },
  });

  const categories = categoriesQuery.data ?? [];
  const rawProducts = productsQuery.data?.data ?? [];
  const featuredList = featuredQuery.data ?? [];
  const pagination = productsQuery.data?.meta;
  const isLoading = productsQuery.isLoading;
  const isLoadingCategories = categoriesQuery.isLoading;

  const error =
    productsQuery.error instanceof Error
      ? getErrorMessage(productsQuery.error)
      : null;
  const categoryError =
    categoriesQuery.error instanceof Error
      ? getErrorMessage(categoriesQuery.error)
      : null;

  // Find category helpers
  const sayurCategory = useMemo(
    () =>
      categories.find((c) =>
        c.nama_kategori.toLowerCase().includes("sayur"),
      ),
    [categories],
  );

  const bumbuCategory = useMemo(
    () =>
      categories.find((c) =>
        c.nama_kategori.toLowerCase().includes("bumbu"),
      ),
    [categories],
  );

  // Dedicated query for fresh sayuran section in showcase
  const sayurProductsQuery = useQuery({
    queryKey: ["kategori", "barang", "sayur-curated"] as const,
    queryFn: async () => {
      if (!sayurCategory) return [];
      const response = await listBarangByKategori(sayurCategory.id, {
        page: 1,
      });
      return response.data;
    },
    enabled: Boolean(
      sayurCategory && selectedCategory === null && !debouncedSearch,
    ),
  });

  // Dedicated query for bumbu dapur section in showcase
  const bumbuProductsQuery = useQuery({
    queryKey: ["kategori", "barang", "bumbu-curated"] as const,
    queryFn: async () => {
      if (!bumbuCategory) return [];
      const response = await listBarangByKategori(bumbuCategory.id, {
        page: 1,
      });
      return response.data;
    },
    enabled: Boolean(
      bumbuCategory && selectedCategory === null && !debouncedSearch,
    ),
  });

  // Reset page when category or search changes
  useEffect(() => {
    setPage(1);
  }, [selectedCategory, debouncedSearch]);

  const lastPage = pagination?.last_page ?? 1;

  // Filtered products on the current page based on search term
  const filteredProducts = useMemo(() => {
    const normalizedSearch = debouncedSearch.trim().toLocaleLowerCase("id-ID");

    if (!normalizedSearch) {
      return rawProducts;
    }

    return rawProducts.filter((product) =>
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
  }, [rawProducts, debouncedSearch]);

  // Featured products for the curated catalog
  const featuredProducts = useMemo(() => {
    const source = featuredList.length > 0 ? featuredList : rawProducts;
    return source.filter(isProductAvailable).slice(0, 6);
  }, [featuredList, rawProducts]);

  // Sayuran products for the fresh harvest catalog
  const sayuranCatalogProducts = useMemo(() => {
    const list = sayurProductsQuery.data ?? [];
    if (list.length > 0) {
      return list.filter(isProductAvailable).slice(0, 6);
    }
    const source = featuredList.length > 0 ? featuredList : rawProducts;
    return source
      .filter(
        (p) =>
          isProductAvailable(p) &&
          (p.nama_kategori?.toLowerCase().includes("sayur") ||
            p.nama_kategori?.toLowerCase().includes("buah")),
      )
      .slice(0, 6);
  }, [sayurProductsQuery.data, featuredList, rawProducts]);

  // Bumbu products for the spices & kitchen catalog
  const bumbuCatalogProducts = useMemo(() => {
    const list = bumbuProductsQuery.data ?? [];
    if (list.length > 0) {
      return list.filter(isProductAvailable).slice(0, 6);
    }
    const source = featuredList.length > 0 ? featuredList : rawProducts;
    return source
      .filter(
        (p) =>
          isProductAvailable(p) &&
          (p.nama_kategori?.toLowerCase().includes("bumbu") ||
            p.nama_kategori?.toLowerCase().includes("pokok") ||
            p.nama_kategori?.toLowerCase().includes("hewan")),
      )
      .slice(0, 6);
  }, [bumbuProductsQuery.data, featuredList, rawProducts]);

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
    setPage(1);
  }

  const selectedCategoryObj = categories.find((c) => c.id === selectedCategory);
  const isFiltering = selectedCategory !== null || debouncedSearch.trim() !== "";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <StoreNavbar cartCount={cartCount} />

      <main>
        <section
          aria-labelledby="hero-title"
          className="store-hero relative isolate -mt-[76px] flex min-h-[540px] items-center overflow-hidden sm:min-h-[620px] lg:min-h-[660px]"
        >
          <div className="store-hero-background" aria-hidden="true">
            {heroImages.map((image, index) => (
              <Image
                alt={image.alt}
                className={`object-cover transition-opacity duration-1000 ${
                  index === heroSlide ? "opacity-100" : "opacity-0"
                }`}
                fill
                key={image.src}
                priority={index === 0}
                sizes="100vw"
                src={image.src}
              />
            ))}
          </div>

          <div className="mx-auto w-full max-w-[1536px] px-4 pt-28 pb-14 sm:px-6 sm:pt-36 sm:pb-20 lg:px-10 lg:pt-40 lg:pb-20 xl:px-12">
            <div className="store-enter flex flex-col items-start max-w-3xl">
              {/* Breadcrumb */}
              <nav
                aria-label="Breadcrumb"
                className="mb-4 flex items-center gap-2 text-xs font-medium text-foreground/80 sm:text-sm"
              >
                <Link
                  className="transition-colors hover:text-primary"
                  href="/store"
                >
                  Beranda
                </Link>
                <ChevronRight aria-hidden="true" className="size-3.5" />
                <span
                  aria-current="page"
                  className="font-semibold text-primary"
                >
                  Katalog Produk
                </span>
              </nav>

              {/* Main Heading */}
              <h1
                className="mt-4 font-heading text-3xl leading-[1.12] font-semibold tracking-[-0.03em] text-primary sm:text-5xl lg:text-6xl"
                id="hero-title"
              >
                Pilihan Segar &amp;
                <br />
                <span className="text-foreground">Kebutuhan Dapur Terbaik.</span>
              </h1>

              {/* Subtitle */}
              <p className="mt-4 max-w-2xl text-base leading-7 text-foreground/90 sm:text-lg sm:leading-8">
                Jelajahi aneka sayuran segar, buah pilihan, bumbu dapur tradisional,
                hingga bahan pokok berkualitas langsung dari petani lokal terpercaya.
              </p>
            </div>

            {/* Feature highlights grid inside Hero bottom */}
            <div className="mt-12 grid grid-cols-2 gap-3 border-t border-border/60 pt-8 sm:grid-cols-4 sm:gap-4">
              <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background/70 p-3 backdrop-blur-sm sm:p-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Leaf aria-hidden="true" className="size-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold sm:text-sm">100% Segar</p>
                  <p className="text-[11px] text-muted-foreground sm:text-xs">
                    Dipetik tiap pagi
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background/70 p-3 backdrop-blur-sm sm:p-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <ShieldCheck aria-hidden="true" className="size-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold sm:text-sm">Kualitas Terjaga</p>
                  <p className="text-[11px] text-muted-foreground sm:text-xs">
                    Sortir higienis
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background/70 p-3 backdrop-blur-sm sm:p-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Truck aria-hidden="true" className="size-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold sm:text-sm">Pengiriman Cepat</p>
                  <p className="text-[11px] text-muted-foreground sm:text-xs">
                    Kurir khusus segar
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background/70 p-3 backdrop-blur-sm sm:p-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <CheckCircle2 aria-hidden="true" className="size-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold sm:text-sm">Harga Jujur</p>
                  <p className="text-[11px] text-muted-foreground sm:text-xs">
                    Ramah keluarga
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION 2: SECTION KATEGORI DI BAWAH HERO                     */}
        {/* ============================================================ */}
        <section
          aria-labelledby="category-section-title"
          className="scroll-mt-20 border-b border-border/60 bg-background dark:bg-secondary text-primary dark:text-secondary-foreground py-14 sm:py-20"
          id="section-kategori"
        >
          <div className="mx-auto max-w-[1536px] px-4 sm:px-6 lg:px-10 xl:px-12">
            <div className="mb-9 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
                  PILIHAN KATEGORI
                </p>
                <h2
                  className="mt-2 font-heading text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl"
                  id="category-section-title"
                >
                  Temukan Berdasarkan Kategori
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
                  Pilih kategori di bawah untuk menyaring katalog produk sesuai
                  kebutuhan belanja harian Anda.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {selectedCategory !== null ? (
                  <Button
                    className="gap-1.5"
                    onClick={() => selectCategory(null)}
                    size="sm"
                    variant="outline"
                  >
                    <RotateCcw aria-hidden="true" className="size-3.5" />
                    Tampilkan Semua Kategori
                  </Button>
                ) : null}
                <Button
                  className="gap-1.5"
                  onClick={() => scrollToId("katalog-produk")}
                  size="sm"
                  variant="ghost"
                >
                  Ke Katalog Produk
                  <ArrowRight aria-hidden="true" className="size-4" />
                </Button>
              </div>
            </div>

            {/* Search & Filter Toolbar — above category selection cards */}
            <div className="mb-9 flex flex-col items-stretch justify-between gap-3 rounded-2xl border border-border/80 bg-card p-3 shadow-xs sm:flex-row sm:items-center sm:p-4">
              <div className="flex flex-1 items-center gap-3">
                <label className="relative min-w-0 flex-1">
                  <Search
                    aria-hidden="true"
                    className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    aria-label="Cari produk"
                    className="h-10 w-full rounded-xl border-border/80 bg-background pl-10 text-sm placeholder:text-muted-foreground sm:text-base"
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Cari produk atau kategori..."
                    type="search"
                    value={searchTerm}
                  />
                </label>

                <div className="w-full sm:w-56">
                  <Select
                    items={[
                      { label: "Semua kategori", value: "all" },
                      ...categories.map((c) => ({
                        label: formatCategoryTitle(c.nama_kategori),
                        value: String(c.id),
                      })),
                    ]}
                    onValueChange={(val) => {
                      selectCategory(
                        !val || val === "all" ? null : Number(val),
                      );
                    }}
                    value={
                      selectedCategory === null
                        ? "all"
                        : String(selectedCategory)
                    }
                  >
                    <SelectTrigger
                      aria-label="Filter kategori"
                      className="h-10 w-full rounded-xl border-border/80 bg-background"
                    >
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Kategori Produk</SelectLabel>
                        <SelectItem value="all">Semua Kategori</SelectItem>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={String(c.id)}>
                            {formatCategoryTitle(c.nama_kategori)}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {categoryError ? (
              <p
                className="mb-6 rounded-xl border border-destructive/30 bg-card px-4 py-3 text-sm text-destructive"
                role="alert"
              >
                Gagal memuat kategori: {categoryError}
              </p>
            ) : null}

            {/* Category Cards Grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 sm:gap-4">
              {/* "Semua Kategori" Card */}
              <button
                aria-label="Tampilkan semua kategori produk"
                aria-pressed={selectedCategory === null}
                className={`store-category-card group relative flex min-h-[148px] flex-col items-center justify-center rounded-2xl border p-4 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                  selectedCategory === null
                    ? "border-primary bg-primary/10 shadow-sm ring-2 ring-primary/40"
                    : "border-border/80 bg-card hover:border-primary/50 hover:bg-secondary/60"
                }`}
                onClick={() => selectCategory(null)}
                type="button"
              >
                <div
                  className={`mb-3 flex size-12 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110 ${
                    selectedCategory === null
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-secondary text-primary group-hover:bg-primary group-hover:text-primary-foreground"
                  }`}
                >
                  <Layers aria-hidden="true" className="size-6" />
                </div>
                <span className="text-xs font-semibold sm:text-sm">Semua</span>
                <span className="mt-0.5 text-[11px] text-muted-foreground">
                  Semua Produk
                </span>
                {selectedCategory === null ? (
                  <span className="absolute top-2 right-2 flex size-2 rounded-full bg-primary" />
                ) : null}
              </button>

              {/* Dynamic Category Cards */}
              {isLoadingCategories
                ? Array.from({ length: 8 }, (_, index) => (
                    <div
                      className="flex min-h-[148px] flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card p-4"
                      key={`category-skeleton-${index}`}
                    >
                      <Skeleton className="size-12 rounded-2xl" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                  ))
                : categories.map((category) => {
                    const visual = getCategoryVisual(category.nama_kategori);
                    const IconComponent = visual.icon;
                    const isSelected = selectedCategory === category.id;

                    return (
                      <button
                        aria-label={`Tampilkan kategori ${category.nama_kategori}`}
                        aria-pressed={isSelected}
                        className={`store-category-card group relative flex min-h-[148px] flex-col items-center justify-center overflow-hidden rounded-2xl border p-3.5 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                          isSelected
                            ? "border-primary bg-primary/10 shadow-sm ring-2 ring-primary/40"
                            : "border-border/80 bg-card hover:border-primary/50 hover:bg-secondary/60"
                        }`}
                        key={category.id}
                        onClick={() =>
                          selectCategory(isSelected ? null : category.id)
                        }
                        type="button"
                      >
                        <div className="relative mb-2.5 size-12 overflow-hidden rounded-2xl bg-secondary/80 shadow-xs ring-1 ring-border/50 transition-transform duration-300 group-hover:scale-110">
                          <Image
                            alt={category.nama_kategori}
                            className="object-cover"
                            fill
                            sizes="48px"
                            src={visual.image}
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
                            <IconComponent
                              aria-hidden="true"
                              className="size-5 text-white"
                            />
                          </div>
                        </div>

                        <span className="line-clamp-2 text-xs font-semibold text-foreground group-hover:text-primary sm:text-sm">
                          {formatCategoryTitle(category.nama_kategori)}
                        </span>

                        <span className="mt-1 text-[11px] text-muted-foreground">
                          {isSelected ? "Aktif" : "Pilih"}
                        </span>

                        {isSelected ? (
                          <span className="absolute top-2 right-2 flex size-2 rounded-full bg-primary" />
                        ) : null}
                      </button>
                    );
                  })}
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION 3: BEBERAPA KATALOG PRODUK DI BAWAH KATEGORI         */}
        {/* ============================================================ */}
        <section
          aria-labelledby="catalog-section-title"
          className="scroll-mt-20 py-12 sm:py-16 lg:py-20"
          id="katalog-produk"
        >
          <div className="mx-auto max-w-[1536px] px-4 sm:px-6 lg:px-10 xl:px-12">
            {/* If user is filtering by category OR searching, show the focused filtered catalog view */}
            {isFiltering ? (
              <div className="space-y-8">
                {/* Filter header banner */}
                <div className="flex flex-col items-start justify-between gap-4 rounded-3xl border border-primary/20 bg-primary/5 p-6 sm:flex-row sm:items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-primary text-primary-foreground">
                        Katalog Terfilter
                      </Badge>
                      {selectedCategoryObj ? (
                        <Badge variant="outline">
                          {formatCategoryTitle(
                            selectedCategoryObj.nama_kategori,
                          )}
                        </Badge>
                      ) : null}
                      {debouncedSearch ? (
                        <Badge variant="outline">
                          Kata kunci: &ldquo;{debouncedSearch}&rdquo;
                        </Badge>
                      ) : null}
                    </div>
                    <h2
                      className="mt-2 font-heading text-2xl font-bold tracking-tight sm:text-3xl"
                      id="catalog-section-title"
                    >
                      {selectedCategoryObj
                        ? `Katalog ${formatCategoryTitle(selectedCategoryObj.nama_kategori)}`
                        : `Hasil Pencarian untuk &ldquo;${debouncedSearch}&rdquo;`}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {isLoading
                        ? "Memuat produk..."
                        : `Ditemukan ${filteredProducts.length} produk pada halaman ini`}
                    </p>
                  </div>

                  <Button
                    className="gap-2"
                    onClick={resetAllFilters}
                    size="sm"
                    variant="outline"
                  >
                    <RotateCcw aria-hidden="true" className="size-4" />
                    Kembali ke Semua Katalog
                  </Button>
                </div>

                {error ? (
                  <p
                    className="rounded-xl border border-destructive/30 bg-card px-4 py-3 text-sm text-destructive"
                    role="alert"
                  >
                    Produk belum dapat dimuat: {error}
                  </p>
                ) : null}

                {/* Filtered Products Grid */}
                <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                  {isLoading
                    ? Array.from({ length: 12 }, (_, index) => (
                        <ProductCardSkeleton
                          key={`filtered-skeleton-${index}`}
                        />
                      ))
                    : filteredProducts.map((product) => (
                        <StoreProductCard
                          key={product.id}
                          product={product}
                        />
                      ))}

                  {!isLoading && !error && filteredProducts.length === 0 ? (
                    <StoreEmptyState
                      action={{
                        label: "Reset Pencarian & Filter",
                        onClick: resetAllFilters,
                      }}
                      className="col-span-full"
                      description="Tidak ada produk yang cocok dengan pencarian Anda. Coba kata kunci lain atau reset filter."
                      icon={ShoppingBag}
                      title="Produk tidak ditemukan"
                    />
                  ) : null}
                </div>

                {/* Pagination for filtered catalog */}
                {!isLoading && !error && lastPage > 1 ? (
                  <div className="mt-10 flex flex-col items-center gap-3">
                    <Pagination aria-label="Navigasi halaman katalog">
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
                      {pagination?.total ? ` — ${pagination.total} produk` : ""}
                    </p>
                  </div>
                ) : null}
              </div>
            ) : (
              /* If no single category/search is chosen, display multiple distinct curated product catalogs! */
              <div className="space-y-16 sm:space-y-20">
                {/* -------------------------------------------------------- */}
                {/* KATALOG 1: PRODUK UNGGULAN & REKOMENDASI HARI INI        */}
                {/* -------------------------------------------------------- */}
                <div className="space-y-6">
                  <div className="flex flex-col items-start justify-between gap-4 border-b border-border/60 pb-5 sm:flex-row sm:items-end">
                    <div>
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
                        <Sparkles aria-hidden="true" className="size-3.5" />
                        <span>REKOMENDASI SPESIAL</span>
                      </div>
                      <h2
                        className="mt-2 font-heading text-2xl font-bold tracking-tight sm:text-3xl"
                        id="catalog-section-title"
                      >
                        Katalog Produk Unggulan Hari Ini
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                        Produk pilihan segar terbaik dan paling digemari pelanggan
                        minggu ini.
                      </p>
                    </div>

                    <Button
                      className="gap-1.5 font-medium"
                      onClick={() => scrollToId("katalog-semua-produk")}
                      size="sm"
                      variant="ghost"
                    >
                      Lihat Semua Produk
                      <ArrowRight aria-hidden="true" className="size-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {featuredQuery.isLoading
                      ? Array.from({ length: 6 }, (_, index) => (
                          <ProductCardSkeleton
                            key={`featured-skeleton-${index}`}
                          />
                        ))
                      : featuredProducts.map((product) => (
                          <StoreProductCard
                            key={`featured-${product.id}`}
                            product={product}
                          />
                        ))}
                  </div>
                </div>

                {/* -------------------------------------------------------- */}
                {/* KATALOG 2: KATALOG SAYURAN & HASIL KEBUN SEGAR           */}
                {/* -------------------------------------------------------- */}
                {sayuranCatalogProducts.length > 0 ? (
                  <div className="space-y-6">
                    <div className="flex flex-col items-start justify-between gap-4 border-b border-border/60 pb-5 sm:flex-row sm:items-end">
                      <div>
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-0.5 text-xs font-semibold text-primary">
                          <Leaf aria-hidden="true" className="size-3.5" />
                          <span>SEGAR DARI KEBUN</span>
                        </div>
                        <h2 className="mt-2 font-heading text-2xl font-bold tracking-tight sm:text-3xl">
                          Katalog Sayuran &amp; Hasil Kebun Segar
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                          Sayuran hijau hidroponik, sayur segar, dan buah yang dipetik
                          langsung setiap pagi.
                        </p>
                      </div>

                      {sayurCategory ? (
                        <Button
                          className="gap-1.5 font-medium text-primary hover:text-primary"
                          onClick={() => selectCategory(sayurCategory.id)}
                          size="sm"
                          variant="outline"
                        >
                          Semua Sayuran ({sayurCategory.nama_kategori})
                          <ArrowRight aria-hidden="true" className="size-4" />
                        </Button>
                      ) : null}
                    </div>

                    <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                      {sayurProductsQuery.isLoading
                        ? Array.from({ length: 6 }, (_, index) => (
                            <ProductCardSkeleton
                              key={`sayur-skeleton-${index}`}
                            />
                          ))
                        : sayuranCatalogProducts.map((product) => (
                            <StoreProductCard
                              key={`sayur-${product.id}`}
                              product={product}
                            />
                          ))}
                    </div>
                  </div>
                ) : null}

                {/* -------------------------------------------------------- */}
                {/* KATALOG 3: KATALOG REMPAH & BUMBU DAPUR                  */}
                {/* -------------------------------------------------------- */}
                {bumbuCatalogProducts.length > 0 ? (
                  <div className="space-y-6">
                    <div className="flex flex-col items-start justify-between gap-4 border-b border-border/60 pb-5 sm:flex-row sm:items-end">
                      <div>
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/10 px-3 py-0.5 text-xs font-semibold text-orange-700 dark:text-orange-400">
                          <Flame aria-hidden="true" className="size-3.5" />
                          <span>DAPUR &amp; KULINER</span>
                        </div>
                        <h2 className="mt-2 font-heading text-2xl font-bold tracking-tight sm:text-3xl">
                          Katalog Rempah, Bumbu &amp; Kebutuhan Dapur
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                          Rempah alami, aneka bumbu dapur, bahan pokok, dan pelengkap
                          lezat untuk memasak.
                        </p>
                      </div>

                      {bumbuCategory ? (
                        <Button
                          className="gap-1.5 font-medium text-primary hover:text-primary"
                          onClick={() => selectCategory(bumbuCategory.id)}
                          size="sm"
                          variant="outline"
                        >
                          Semua Bumbu ({bumbuCategory.nama_kategori})
                          <ArrowRight aria-hidden="true" className="size-4" />
                        </Button>
                      ) : null}
                    </div>

                    <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                      {bumbuProductsQuery.isLoading
                        ? Array.from({ length: 6 }, (_, index) => (
                            <ProductCardSkeleton
                              key={`bumbu-skeleton-${index}`}
                            />
                          ))
                        : bumbuCatalogProducts.map((product) => (
                            <StoreProductCard
                              key={`bumbu-${product.id}`}
                              product={product}
                            />
                          ))}
                    </div>
                  </div>
                ) : null}

                {/* -------------------------------------------------------- */}
                {/* KATALOG 4: SEMUA KATALOG PRODUK & PENCARIAN              */}
                {/* -------------------------------------------------------- */}
                <div
                  className="scroll-mt-24 space-y-6 pt-4"
                  id="katalog-semua-produk"
                >
                  <div className="flex flex-col items-start justify-between gap-4 border-b border-border/60 pb-5 md:flex-row md:items-end">
                    <div>
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-0.5 text-xs font-semibold text-primary">
                        <Layers aria-hidden="true" className="size-3.5" />
                        <span>KOLEKSI LENGKAP</span>
                      </div>
                      <h2 className="mt-2 font-heading text-2xl font-bold tracking-tight sm:text-3xl">
                        Semua Katalog Produk
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                        Telusuri seluruh koleksi produk Alkadi dengan filter pencarian
                        dan navigasi halaman.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p
                      aria-live="polite"
                      className="text-sm text-muted-foreground"
                    >
                      {isLoading
                        ? "Memuat produk..."
                        : `${filteredProducts.length} produk pada halaman ini`}
                    </p>
                  </div>

                  {error ? (
                    <p
                      className="rounded-xl border border-destructive/30 bg-card px-4 py-3 text-sm text-destructive"
                      role="alert"
                    >
                      Produk belum dapat dimuat: {error}
                    </p>
                  ) : null}

                  {/* Main Product Grid */}
                  <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {isLoading
                      ? Array.from({ length: 12 }, (_, index) => (
                          <ProductCardSkeleton
                            key={`product-skeleton-${index}`}
                          />
                        ))
                      : filteredProducts.map((product) => (
                          <StoreProductCard
                            key={`all-${product.id}`}
                            product={product}
                          />
                        ))}
                    {!isLoading && !error && filteredProducts.length === 0 ? (
                      <StoreEmptyState
                        className="col-span-full"
                        description="Coba kata kunci lain atau pilih kategori yang berbeda."
                        icon={ShoppingBag}
                        title="Produk tidak ditemukan"
                      />
                    ) : null}
                  </div>

                  {/* Pagination for All Products */}
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
                              href="#katalog-semua-produk"
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
                                  href="#katalog-semua-produk"
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
                              href="#katalog-semua-produk"
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
                        {pagination?.total ? ` — ${pagination.total} produk` : ""}
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            )}
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
