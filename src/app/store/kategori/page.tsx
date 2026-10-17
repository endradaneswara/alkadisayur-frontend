"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Apple,
  ArrowRight,
  Beef,
  Flame,
  Leaf,
  Search,
  ShieldCheck,
  Snowflake,
  Sparkles,
  Sprout,
  Truck,
  Wheat,
} from "lucide-react";
import { StoreFooter } from "@/components/store-footer";
import { StoreNavbar } from "@/components/store-navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/lib/store-catalog";
import { listKategori } from "@/services/kategoriService";
import type { Kategori } from "@/types";

function formatCategory(name?: string | null): string {
  if (!name) return "Umum";
  return name.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function getCategoryTheme(categoryName: string) {
  const norm = categoryName.toLowerCase();
  if (norm.includes("sayur")) {
    return {
      title: formatCategory(categoryName),
      desc: "Sayuran hijau segar, kaya serat, vitamin, dan nutrisi untuk santapan harian sehat.",
      badge: "Dipetik Segar",
      icon: Leaf,
      gradient: "from-emerald-500/15 via-emerald-500/5 to-transparent",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      iconBg: "bg-emerald-100 dark:bg-emerald-950/60",
      borderColor: "group-hover:border-emerald-500/60",
      badgeClass: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
    };
  }
  if (norm.includes("buah")) {
    return {
      title: formatCategory(categoryName),
      desc: "Buah-buahan manis, renyah, dan kaya antioksidan pilihan petani terbaik.",
      badge: "Kaya Vitamin",
      icon: Apple,
      gradient: "from-amber-500/15 via-orange-500/5 to-transparent",
      iconColor: "text-amber-600 dark:text-amber-400",
      iconBg: "bg-amber-100 dark:bg-amber-950/60",
      borderColor: "group-hover:border-amber-500/60",
      badgeClass: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/20",
    };
  }
  if (norm.includes("bumbu") || norm.includes("rempah")) {
    return {
      title: formatCategory(categoryName),
      desc: "Bumbu dapur lengkap dan rempah aromatik untuk menyempurnakan rasa masakan nusantara.",
      badge: "Aroma Alami",
      icon: Flame,
      gradient: "from-orange-500/15 via-amber-500/5 to-transparent",
      iconColor: "text-orange-600 dark:text-orange-400",
      iconBg: "bg-orange-100 dark:bg-orange-950/60",
      borderColor: "group-hover:border-orange-500/60",
      badgeClass: "bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/20",
    };
  }
  if (norm.includes("pokok") || norm.includes("sembako") || norm.includes("beras")) {
    return {
      title: formatCategory(categoryName),
      desc: "Kebutuhan bahan pangan pokok bermutu tinggi, bersih, dan higienis untuk keluarga.",
      badge: "Kebutuhan Pokok",
      icon: Wheat,
      gradient: "from-yellow-500/15 via-amber-500/5 to-transparent",
      iconColor: "text-yellow-600 dark:text-yellow-400",
      iconBg: "bg-yellow-100 dark:bg-yellow-950/60",
      borderColor: "group-hover:border-yellow-500/60",
      badgeClass: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-300 border-yellow-500/20",
    };
  }
  if (norm.includes("hewan") || norm.includes("daging") || norm.includes("ikan") || norm.includes("ayam")) {
    return {
      title: formatCategory(categoryName),
      desc: "Daging segar, ikan, dan protein hewani higienis dengan jaminan kesegaran optimal.",
      badge: "Protein Tinggi",
      icon: Beef,
      gradient: "from-rose-500/15 via-red-500/5 to-transparent",
      iconColor: "text-rose-600 dark:text-rose-400",
      iconBg: "bg-rose-100 dark:bg-rose-950/60",
      borderColor: "group-hover:border-rose-500/60",
      badgeClass: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/20",
    };
  }
  if (norm.includes("frozen") || norm.includes("beku")) {
    return {
      title: formatCategory(categoryName),
      desc: "Olahan makanan beku praktis, siap saji dan tahan lama dengan rasa yang tetap lezat.",
      badge: "Praktis & Higienis",
      icon: Snowflake,
      gradient: "from-sky-500/15 via-blue-500/5 to-transparent",
      iconColor: "text-sky-600 dark:text-sky-400",
      iconBg: "bg-sky-100 dark:bg-sky-950/60",
      borderColor: "group-hover:border-sky-500/60",
      badgeClass: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/20",
    };
  }
  return {
    title: formatCategory(categoryName),
    desc: "Produk pilihan berkualitas tinggi untuk melengkapi kebutuhan dapur dan keluarga Anda.",
    badge: "Pilihan Segar",
    icon: Sprout,
    gradient: "from-primary/15 via-primary/5 to-transparent",
    iconColor: "text-primary",
    iconBg: "bg-primary/10",
    borderColor: "group-hover:border-primary/60",
    badgeClass: "bg-primary/10 text-primary border-primary/20",
  };
}

export default function StoreCategoriesPage() {
  const [categories, setCategories] = useState<Kategori[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  }, []);

  const filteredCategories = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) =>
      c.nama_kategori.toLowerCase().includes(q) ||
      formatCategory(c.nama_kategori).toLowerCase().includes(q)
    );
  }, [categories, searchTerm]);

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
          <span aria-current="page" className="font-medium text-foreground">
            Kategori
          </span>
        </nav>

        <section aria-labelledby="categories-hero" className="mb-8">
          <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-emerald-500/5 to-background p-6 shadow-xs sm:p-8 md:p-10">
            <div className="pointer-events-none absolute -top-20 -right-20 size-72 rounded-full bg-primary/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 size-72 rounded-full bg-emerald-500/10 blur-3xl" />

            <div className="relative z-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
              <div className="max-w-2xl">
                <h1
                  className="mt-3 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
                  id="categories-title"
                >
                  Jelajahi Kategori
                </h1>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  Temukan sayuran segar petik hari ini, buah manis bervitamin, rempah pilihan,
                  dan kebutuhan dapur lengkap dengan standar mutu terjamin.
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-3 text-xs sm:text-sm">
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-card/80 px-3 py-1.5 font-medium text-foreground shadow-xs">
                    <Leaf className="size-4 text-emerald-600" />
                    100% Segar Alami
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-card/80 px-3 py-1.5 font-medium text-foreground shadow-xs">
                    <ShieldCheck className="size-4 text-primary" />
                    Kualitas Terjamin
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-card/80 px-3 py-1.5 font-medium text-foreground shadow-xs">
                    <Truck className="size-4 text-amber-600" />
                    Siap Antar ke Rumah
                  </span>
                </div>
              </div>

              {/* Quick Search inside Hero */}
              <div className="w-full shrink-0 md:w-80">
                <label className="relative block w-full">
                  <Search
                    aria-hidden="true"
                    className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    aria-label="Cari kategori"
                    className="h-11 w-full rounded-2xl border-border/80 bg-background/90 pl-10 text-sm placeholder:text-muted-foreground shadow-xs backdrop-blur-xs sm:text-base"
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Cari kategori..."
                    type="search"
                    value={searchTerm}
                  />
                </label>
              </div>
            </div>
          </div>
        </section>

        {/* Section List Kategori */}
        <section aria-labelledby="categories-list">
          <div className="mb-5 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {isLoading
                ? "Memuat kategori..."
                : `Menampilkan ${filteredCategories.length} kategori pilihan`}
            </p>
            {searchTerm ? (
              <Button
                onClick={() => setSearchTerm("")}
                size="sm"
                variant="ghost"
              >
                Reset pencarian
              </Button>
            ) : null}
          </div>

          {error ? (
            <p
              className="mb-6 rounded-xl border border-destructive/30 bg-card px-4 py-3 text-sm text-destructive"
              role="alert"
            >
              Kategori belum dapat dimuat: {error}
            </p>
          ) : null}

          {/* Grid Kategori Modern & Lebar */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {isLoading
              ? Array.from({ length: 8 }, (_, index) => (
                  <div
                    className="overflow-hidden rounded-2xl border border-border bg-card p-5"
                    key={`category-skeleton-${index}`}
                  >
                    <Skeleton className="h-28 w-full rounded-xl" />
                    <Skeleton className="mt-4 h-6 w-1/2" />
                    <Skeleton className="mt-2 h-4 w-full" />
                    <Skeleton className="mt-4 h-9 w-28 rounded-xl" />
                  </div>
                ))
              : filteredCategories.map((category) => {
                  const theme = getCategoryTheme(category.nama_kategori);
                  const Icon = theme.icon;

                  return (
                    <Card
                      className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/80 bg-card py-0 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${theme.borderColor}`}
                      key={category.id}
                    >
                      {/* Card Top Decorative Banner */}
                      <div className={`relative flex h-36 items-center justify-center bg-gradient-to-b ${theme.gradient} p-4 sm:h-40`}>
                        {/* Floating Badge */}
                        <div className="absolute top-3 right-3 z-10">
                          <Badge
                            className={`border text-[10px] font-semibold uppercase tracking-wider shadow-xs ${theme.badgeClass}`}
                          >
                            {theme.badge}
                          </Badge>
                        </div>

                        {/* Floating Icon with soft glow & hover effect */}
                        <div className={`flex size-18 items-center justify-center rounded-2xl ${theme.iconBg} ${theme.iconColor} shadow-xs ring-1 ring-border/40 transition-transform duration-300 group-hover:scale-110`}>
                          <Icon aria-hidden="true" className="size-9" />
                        </div>
                      </div>

                      {/* Header Title */}
                      <CardHeader className="gap-1.5 px-5 pt-4 pb-2">
                        <h2 className="font-heading text-xl font-bold tracking-tight text-foreground transition-colors group-hover:text-primary sm:text-2xl">
                          <Link
                            className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                            href={`/store/kategori/${category.id}`}
                          >
                            {theme.title}
                          </Link>
                        </h2>
                      </CardHeader>

                      {/* Content Description */}
                      <CardContent className="flex-1 px-5 pb-3">
                        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                          {theme.desc}
                        </p>
                      </CardContent>

                      {/* Footer CTA */}
                      <CardFooter className="border-t border-border/70 px-5 py-3">
                        <Button
                          className="w-full gap-2 rounded-xl text-xs font-semibold sm:text-sm group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                          nativeButton={false}
                          render={
                            <Link href={`/store/kategori/${category.id}`} />
                          }
                          variant="outline"
                        >
                          <span>Jelajahi Produk</span>
                          <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}

            {!isLoading && !error && filteredCategories.length === 0 ? (
              <div className="col-span-full rounded-2xl border border-dashed border-border bg-card px-5 py-12 text-center">
                <Sprout className="mx-auto size-12 text-muted-foreground/60" />
                <h3 className="mt-3 font-heading text-lg font-semibold text-foreground">
                  Kategori tidak ditemukan
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Coba kata kunci lain atau reset filter pencarian.
                </p>
              </div>
            ) : null}
          </div>
        </section>
      </main>
      <StoreFooter />
    </div>
  );
}
