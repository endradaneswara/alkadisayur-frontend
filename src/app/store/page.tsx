"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ImagePlus,
  Leaf,
  Plus,
  ShieldCheck,
  ShoppingBasket,
  Truck,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StoreFooter } from "@/components/store-footer";
import { StoreNavbar } from "@/components/store-navbar";
import { StoreShowcase } from "@/components/store-showcase";
import { API_BASE_URL, hasAuthSession } from "@/services/api";
import { addItemKeranjang } from "@/services/keranjangService";
import { listBarang } from "@/services/barangService";
import { listKategori } from "@/services/kategoriService";
import type { BarangCustomer, Kategori } from "@/types";

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Terjadi kesalahan saat menghubungi toko.";
}

function getProductImageUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const apiOrigin = API_BASE_URL.replace(/\/api\/?$/, "");
  if (path.startsWith("/storage/")) {
    return `${apiOrigin}${path}`;
  }
  if (path.startsWith("/")) {
    return path;
  }

  const storagePath = path.replace(/^storage\//, "");
  return `${apiOrigin}/storage/${storagePath}`;
}

function formatRupiah(value: string | number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export default function StoreLandingPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Kategori[]>([]);
  const [products, setProducts] = useState<BarangCustomer[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [productError, setProductError] = useState<string | null>(null);
  const [addingProductIds, setAddingProductIds] = useState<number[]>([]);
  const [failedImageIds, setFailedImageIds] = useState<number[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [cartFeedback, setCartFeedback] = useState<string | null>(null);
  const [cartFeedbackIsError, setCartFeedbackIsError] = useState(false);
  useEffect(() => {
    let isCurrent = true;

    void listKategori({ page: 1 })
      .then((response) => {
        if (isCurrent) {
          setCategories(response.data);
        }
      })
      .catch((error: unknown) => {
        if (isCurrent) {
          setCategoryError(getErrorMessage(error));
        }
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoadingCategories(false);
        }
      });

    void listBarang({ page: 1 })
      .then((response) => {
        if (isCurrent) {
          setProducts(response.data);
        }
      })
      .catch((error: unknown) => {
        if (isCurrent) {
          setProductError(getErrorMessage(error));
        }
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoadingProducts(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  const availableProducts = products.filter(
    (product) => product.Status === "tersedia",
  );
  const featuredProducts = availableProducts
    .filter(
      (product) =>
        selectedCategory === null || product.kategori_id === selectedCategory,
    )
    .slice(0, 4);
  const categoryProductCounts = new Map<number, number>();

  for (const product of availableProducts) {
    categoryProductCounts.set(
      product.kategori_id,
      (categoryProductCounts.get(product.kategori_id) ?? 0) + 1,
    );
  }

  async function handleAddToCart(product: BarangCustomer): Promise<void> {
    if (!hasAuthSession()) {
      router.push("/store/akun/login");
      return;
    }

    setAddingProductIds((current) => [...current, product.id]);
    setCartFeedback(null);
    setCartFeedbackIsError(false);

    try {
      const response = await addItemKeranjang(product.id, 1);
      setCartCount(response.data.total_item);
      setCartFeedback(`${product.NamaItem} berhasil ditambahkan ke keranjang.`);
    } catch (error: unknown) {
      setCartFeedback(getErrorMessage(error));
      setCartFeedbackIsError(true);
    } finally {
      setAddingProductIds((current) =>
        current.filter((productId) => productId !== product.id),
      );
    }
  }

  function selectCategory(categoryId: number | null): void {
    setSelectedCategory(categoryId);
    document
      .getElementById("produk-unggulan")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="store-landing min-h-screen bg-background text-foreground">
      <StoreNavbar cartCount={cartCount} />
      <main>
        <section
          aria-labelledby="hero-title"
          className="store-hero relative isolate -mt-[76px] flex min-h-[600px] items-center overflow-hidden sm:min-h-[680px] lg:min-h-[720px]"
        >
          <div className="store-hero-background" aria-hidden="true">
            <Image
              alt=""
              className="object-cover"
              fill
              priority
              sizes="100vw"
              src="/background-landing2.webp"
            />
          </div>
          <div className="mx-auto grid w-full max-w-[1536px] items-center gap-12 px-4 pt-28 pb-20 sm:px-6 sm:pt-36 sm:pb-28 lg:grid-cols-[1fr_0.92fr] lg:gap-16 lg:px-10 lg:pt-40 lg:pb-32 xl:px-12">
            <div className="store-enter flex flex-col items-start">
            <h1
              className="max-w-2xl font-heading text-4xl leading-[1.08] font-semibold tracking-[-0.04em] text-primary sm:text-5xl lg:text-6xl "
              id="hero-title"
            >
              Segarnya alam,
              <br />
              <span className="text-foreground">sampai di meja Anda.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 sm:text-lg sm:leading-8 text-foreground">
              Temukan sayur dan kebutuhan segar pilihan untuk setiap hidangan
              keluarga. Belanja lebih praktis, pilih sesuai kebutuhan.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button
                className="h-11 px-5"
                nativeButton={false}
                render={<Link href="#produk-unggulan" />}
                size="lg"
              >
                Mulai belanja
                <ArrowRight aria-hidden="true" data-icon="inline-end" />
              </Button>
              <Button
                className="h-11 px-5"
                nativeButton={false}
                render={<Link href="/store/produk" />}
                size="lg"
                variant="outline"
              >
                Jelajahi kategori
              </Button>
            </div>

            {/* Scroll indicator */}
            <div className="mt-12 flex flex-col items-center gap-1.5 self-center sm:self-auto" aria-hidden="true">
              <span className="text-[10px] font-semibold tracking-[0.18em] uppercase text-primary/60">Gulir ke bawah</span>
              <div className="flex flex-col items-center gap-0.5 animate-bounce">
                <span className="block h-5 w-px rounded-full bg-primary/30" />
                <span className="block size-1.5 rounded-full bg-primary/50" />
              </div>
            </div>
          </div>
          </div>

          {/* Decorative wave bottom transition */}
          <div className="absolute inset-x-0 bottom-0 z-10 leading-none" aria-hidden="true">
            <svg
              viewBox="0 0 1440 80"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
              className="w-full h-16 sm:h-20"
              style={{ display: "block" }}
            >
              <path
                d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z"
                fill="hsl(var(--secondary) / 0.4)"
                opacity="0.6"
              />
              <path
                d="M0,55 C360,20 720,75 1080,45 C1260,30 1380,60 1440,55 L1440,80 L0,80 Z"
                fill="hsl(var(--background))"
              />
            </svg>
          </div>
        </section>

        {(categoryError || productError) && (
          <div
            className="mx-auto mb-8 max-w-[1536px] px-4 sm:px-6 lg:px-10 xl:px-12"
            role="alert"
          >
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              <p className="font-semibold">Katalog belum dapat dimuat.</p>
              <p className="mt-1">
                {[
                  categoryError ? `Kategori: ${categoryError}` : null,
                  productError ? `Produk: ${productError}` : null,
                ]
                  .filter(Boolean)
                  .join(" ")}
              </p>
            </div>
          </div>
        )}

        <section
          aria-labelledby="category-title"
                  className="scroll-mt-24 bg-secondary/40 py-16 sm:py-20"
          id="kategori"
        >
          <div className="mx-auto max-w-[1536px] px-4 sm:px-6 lg:px-10 xl:px-12">
            <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2
                  className="mt-3 font-heading text-3xl font-semibold tracking-tight sm:text-4xl"
                  id="category-title"
                >
                  Temukan jenis produk kebutuhanmu
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
                  Temukan kebutuhan dapur dengan lebih mudah
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  nativeButton={false}
                  render={<Link href="#produk-unggulan" />}
                  size="sm"
                  variant="ghost"
                >
                  Lihat pilihan produk
                  <ArrowRight aria-hidden="true" data-icon="inline-end" />
                </Button>
                <Button
                  nativeButton={false}
                  render={<Link href="/store/kategori" />}
                  size="sm"
                  variant="outline"
                >
                  Semua kategori
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
              {isLoadingCategories
                ? Array.from({ length: 6 }, (_, index) => (
                    <div
                      className="flex min-h-36 flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-background p-4"
                      key={`category-skeleton-${index}`}
                    >
                      <Skeleton className="size-12 rounded-2xl" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  ))
                : categories.slice(0, 6).map((category, index) => (
                    <button
                      aria-label={`Tampilkan produk kategori ${category.nama_kategori}`}
                      className={`store-category-card group flex min-h-36 flex-col items-center justify-center rounded-2xl border p-4 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                        selectedCategory === category.id
                          ? "border-primary bg-secondary shadow-xs"
                          : "border-border bg-background hover:border-primary/50 hover:bg-secondary/60"
                      }`}
                      key={category.id}
                      onClick={() => selectCategory(category.id)}
                      type="button"
                    >
                      <span className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-card text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-xs">
                        {index % 2 === 0 ? (
                          <Leaf aria-hidden="true" className="size-5" />
                        ) : (
                          <ShoppingBasket
                            aria-hidden="true"
                            className="size-5"
                          />
                        )}
                      </span>
                      <span className="max-w-full truncate text-sm font-semibold text-foreground">
                        {category.nama_kategori}
                      </span>
                      <span className="mt-1 text-xs text-muted-foreground">
                        {categoryProductCounts.get(category.id) ?? 0} produk
                      </span>
                    </button>
                  ))}
              {!isLoadingCategories && categories.length === 0 ? (
                <p className="col-span-full rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
                  Kategori akan ditampilkan di sini setelah tersedia.
                </p>
              ) : null}
            </div>
          </div>
        </section>

        <section
          aria-labelledby="featured-title"
          className="scroll-mt-24 w-full bg-primary text-white py-16 sm:py-24"
          id="produk-unggulan"
        >
          <div className="mx-auto max-w-[1536px] px-4 sm:px-6 lg:px-10 xl:px-12">
            <div className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#bef264]">
                  Pilihan Eksklusif Alkadi
                </p>
                <h2
                  className="mt-3 font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl"
                  id="featured-title"
                >
                  Kesehatan & kesegaran keluarga dimulai dari dapur.
                </h2>
              </div>
              <div className="max-w-md text-left md:text-right">
                <p className="text-sm leading-relaxed text-white/70 sm:text-base">
                  Sayuran pilihan bermutu tinggi yang dipetik segar setiap pagi dari kebun mitra terpercaya untuk nutrisi terbaik keluarga.
                </p>
                <div className="mt-4 flex items-center justify-start gap-4 md:justify-end">
                  {selectedCategory !== null ? (
                    <Button
                      className="rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20"
                      onClick={() => setSelectedCategory(null)}
                      size="sm"
                      variant="outline"
                    >
                      Semua kategori
                      <X aria-hidden="true" className="size-3.5 ml-1" />
                    </Button>
                  ) : null}
                  <Link
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-white underline underline-offset-4 transition-colors hover:text-[#bef264]"
                    href="/store/produk"
                  >
                    <span>Lihat Semua Produk</span>
                    <ArrowRight aria-hidden="true" className="size-4" />
                  </Link>
                </div>
              </div>
            </div>

            {cartFeedback ? (
              <p
                aria-live="polite"
                className={`mb-6 rounded-2xl border px-4 py-3 text-sm backdrop-blur-xs ${
                  cartFeedbackIsError
                    ? "border-destructive/40 bg-destructive/15 text-red-200"
                    : "border-emerald-400/30 bg-emerald-950/60 text-emerald-200"
                }`}
                role={cartFeedbackIsError ? "alert" : "status"}
              >
                {cartFeedback}
              </p>
            ) : null}

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  badgeType: "accent",
                  image: "/sayur background1.webp",
                  fallbackTitle: "Paket Sayur Daun Hijau Segar",
                  fallbackPrice: 15000,
                },
                {
                  badgeType: "subtle",
                  image: "/sayur-background2.webp",
                  fallbackTitle: "Brokoli & Kembang Kol Pilihan",
                  fallbackPrice: 22000,
                },
                {
                  badge: "Favorit",
                  badgeType: "subtle",
                  image: "/sayur-background3.webp",
                  fallbackTitle: "Aneka Rempah & Bumbu Dapur",
                  fallbackPrice: 18000,
                },
                {
                  badgeType: "subtle",
                  image: "/sayur background4.webp",
                  fallbackTitle: "Wortel & Umbi Segar Organik",
                  fallbackPrice: 20000,
                },
              ].map((config, index) => {
                const product = featuredProducts[index];
                const title = product?.NamaItem || config.fallbackTitle;
                const price = product?.HargaJual || config.fallbackPrice;
                const productId = product?.id;
                const isAdding = productId ? addingProductIds.includes(productId) : false;

                return (
                  <div
                    className="group relative flex flex-col items-center justify-between rounded-3xl border border-white/10 bg-muted-foreground p-6 text-center shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:border-white/30 hover:shadow-2xl"
                    key={config.image}
                  >
                    <h3 className="line-clamp-2 min-h-[3rem] font-heading text-lg font-semibold tracking-tight text-white transition-colors group-hover:text-[#bef264] sm:text-xl">
                      {productId ? (
                        <Link href={`/store/produk/${productId}`}>
                          {title}
                        </Link>
                      ) : (
                        title
                      )}
                    </h3>

                    <div className="relative my-5 aspect-square w-full max-w-[210px] overflow-hidden rounded-2xl bg-black/25 shadow-xl ring-1 ring-white/15">
                      <Image
                        alt={title}
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        fill
                        loading={index === 0 ? "eager" : "lazy"}
                        priority={index === 0}
                        sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 22vw"
                        src={config.image}
                      />
                    </div>

                    <Button
                      className="mt-2 h-10 w-full max-w-[170px] rounded-full border border-white/20 bg-white/12 text-xs font-semibold text-white shadow-xs backdrop-blur-xs transition-all hover:bg-white/25 sm:text-sm"
                      disabled={isAdding}
                      onClick={() => {
                        if (product) {
                          void handleAddToCart(product);
                        } else {
                          router.push("/store/produk");
                        }
                      }}
                      type="button"
                    >
                      {isAdding ? (
                        "Menambahkan..."
                      ) : (
                        <>
                          <Plus aria-hidden="true" className="size-4" />
                          Beli Sekarang
                        </>
                      )}
                    </Button>

                    {/* Subtext: Starting price */}
                    <p className="mt-3 text-xs font-medium text-white/60">
                      Mulai dari {formatRupiah(price)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section
          aria-labelledby="benefits-title"
                  className="scroll-mt-24 border-y border-border bg-secondary/60 py-16 sm:py-20"
          id="keunggulan"
        >
          <div className="mx-auto max-w-[1536px] px-4 sm:px-6 lg:px-10 xl:px-12">
            <div className="mx-auto mb-10 max-w-2xl text-center">
              <p className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">
                Belanja terasa lebih mudah
              </p>
              <h2
                className="mt-3 font-heading text-3xl font-semibold tracking-tight sm:text-4xl"
                id="benefits-title"
              >
                Segar, praktis, dan dekat
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
                Kebutuhan dapur sehari-hari, lebih mudah ditemukan di satu
                tempat.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: Leaf,
                  title: "Pilihan produk segar",
                  description:
                    "Jelajahi pilihan sayur dan kebutuhan dapur yang tersedia.",
                },
                {
                  icon: ShoppingBasket,
                  title: "Mudah dijelajahi",
                  description:
                    "Temukan produk lewat kategori yang tersusun rapi.",
                },
                {
                  icon: ShieldCheck,
                  title: "Harga transparan",
                  description:
                    "Periksa harga produk sebelum memasukkannya ke keranjang.",
                },
                {
                  icon: Truck,
                  title: "Pilihan belanja fleksibel",
                  description:
                    "Lanjutkan belanja Anda dengan alur pemesanan yang praktis.",
                },
              ].map((benefit) => {
                const BenefitIcon = benefit.icon;

                return (
                  <div
                    className="group rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:shadow-md hover:border-primary/40"
                    key={benefit.title}
                  >
                    <span className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-secondary/50 text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-xs">
                      <BenefitIcon aria-hidden="true" className="size-6 transition-transform duration-300" />
                    </span>
                    <h3 className="font-heading text-base font-semibold transition-colors group-hover:text-primary">
                      {benefit.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {benefit.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Showcase Gerai Toko 1-6 (Seed.com style experience carousel) */}
        <StoreShowcase />
      </main>

      <StoreFooter />
    </div>
  );
}
