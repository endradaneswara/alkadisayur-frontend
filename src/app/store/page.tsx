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
          className="mx-auto grid min-h-[520px] max-w-7xl items-center gap-12 px-4 py-14 sm:min-h-[600px] sm:px-6 sm:py-20 lg:min-h-[620px] lg:grid-cols-[1fr_0.92fr] lg:gap-16 lg:px-8 lg:py-24"
        >
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
          </div>
        </section>

        {(categoryError || productError) && (
          <div
            className="mx-auto mb-8 max-w-7xl px-4 sm:px-6 lg:px-8"
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
          className="scroll-mt-24 bg-card py-16 sm:py-20"
          id="kategori"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
                      className={`store-category-card group flex min-h-36 flex-col items-center justify-center rounded-2xl border p-4 text-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                        selectedCategory === category.id
                          ? "border-primary bg-secondary"
                          : "border-border bg-background hover:border-primary/50 hover:bg-secondary/60"
                      }`}
                      key={category.id}
                      onClick={() => selectCategory(category.id)}
                      type="button"
                    >
                      <span className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-card text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
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
          className="scroll-mt-24 mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
          id="produk-unggulan"
        >
          <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2
                className="mt-3 font-heading text-3xl font-semibold tracking-tight sm:text-4xl"
                id="featured-title"
              >
                Produk unggulan kami
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
                Produk paling banyak dicari untuk kebutuhan dapur sehari-hari.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {selectedCategory !== null ? (
                <Button
                  onClick={() => setSelectedCategory(null)}
                  size="sm"
                  variant="outline"
                >
                  Tampilkan semua
                  <X aria-hidden="true" data-icon="inline-end" />
                </Button>
              ) : null}
              <Button
                nativeButton={false}
                render={<Link href="/store/produk" />}
                size="sm"
                variant="outline"
              >
                Semua produk
                <ArrowRight aria-hidden="true" data-icon="inline-end" />
              </Button>
            </div>
          </div>

          {cartFeedback ? (
            <p
              aria-live="polite"
              className={`mb-5 rounded-lg border px-4 py-3 text-sm ${
                cartFeedbackIsError
                  ? "border-destructive/30 bg-destructive/5 text-destructive"
                  : "border-primary/20 bg-secondary text-primary"
              }`}
              role={cartFeedbackIsError ? "alert" : "status"}
            >
              {cartFeedback}
            </p>
          ) : null}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
            {isLoadingProducts
              ? Array.from({ length: 4 }, (_, index) => (
                  <Card
                    className="overflow-hidden border-border py-0"
                    key={`product-skeleton-${index}`}
                  >
                    <Skeleton className="aspect-[4/3] w-full rounded-none" />
                    <CardContent className="flex flex-col gap-3 p-5">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-5 w-1/3" />
                      <Skeleton className="mt-2 h-10 w-full" />
                    </CardContent>
                  </Card>
                ))
              : featuredProducts.map((product) => {
                  const isAdding = addingProductIds.includes(product.id);
                  const imageFailed = failedImageIds.includes(product.id);

                  return (
                    <Card
                      className="store-product-card border-border py-0"
                      key={product.id}
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
                        {product.Foto && !imageFailed ? (
                          <Image
                            alt={product.NamaItem}
                            className="object-cover"
                            fill
                            onError={() =>
                              setFailedImageIds((current) =>
                                current.includes(product.id)
                                  ? current
                                  : [...current, product.id],
                              )
                            }
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            src={getProductImageUrl(product.Foto)}
                            unoptimized
                          />
                        ) : (
                          <div
                            aria-label={`Foto ${product.NamaItem} belum tersedia`}
                            className="flex h-full flex-col items-center justify-center gap-2 text-primary"
                            role="img"
                          >
                            <ImagePlus aria-hidden="true" className="size-8" />
                            <span className="text-xs font-medium">
                              Foto produk belum tersedia
                            </span>
                          </div>
                        )}
                        <Badge className="absolute top-3 left-3" variant="secondary">
                          Pilihan segar
                        </Badge>
                      </div>
                      <CardContent className="flex flex-1 flex-col gap-2 p-5">
                        {product.nama_kategori ? (
                          <p className="text-xs font-medium text-muted-foreground">
                            {product.nama_kategori}
                          </p>
                        ) : null}
                        <h3 className="line-clamp-2 min-h-12 font-heading text-base leading-6 font-semibold text-foreground">
                          {product.NamaItem}
                        </h3>
                        {product.Merek ? (
                          <p className="truncate text-sm text-muted-foreground">
                            {product.Merek}
                          </p>
                        ) : null}
                        <p className="mt-auto pt-3 font-heading text-lg font-semibold text-primary">
                          {formatRupiah(product.HargaJual)}
                        </p>
                      </CardContent>
                      <CardFooter className="border-t border-border bg-card p-4">
                        <Button
                          className="h-10 w-full"
                          disabled={isAdding}
                          onClick={() => void handleAddToCart(product)}
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
                      </CardFooter>
                    </Card>
                  );
                })}
            {!isLoadingProducts && featuredProducts.length === 0 ? (
              <p className="col-span-full rounded-2xl border border-dashed border-border bg-card px-5 py-12 text-center text-sm leading-6 text-muted-foreground">
                {productError
                  ? "Produk unggulan akan tampil setelah katalog dapat dimuat."
                  : selectedCategory !== null
                    ? "Belum ada produk tersedia di kategori ini."
                    : "Produk unggulan akan tampil di sini setelah tersedia."}
              </p>
            ) : null}
          </div>
        </section>

        <section
          aria-labelledby="benefits-title"
          className="scroll-mt-24 border-y border-border bg-card py-16 sm:py-20"
          id="keunggulan"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
                    className="rounded-2xl border border-border bg-background p-5 sm:p-6"
                    key={benefit.title}
                  >
                    <span className="mb-5 flex size-11 items-center justify-center rounded-xl bg-secondary text-primary">
                      <BenefitIcon aria-hidden="true" className="size-5" />
                    </span>
                    <h3 className="font-heading text-base font-semibold">
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

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-6 rounded-[1.75rem] border border-border bg-secondary p-7 sm:p-10 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">
                Mulai dari kebutuhan hari ini
              </p>
              <h2 className="mt-3 font-heading text-3xl leading-tight font-semibold tracking-tight text-primary sm:text-4xl">
                Siapkan hidangan favorit bersama Alkadi.
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
                Pilih kategori, temukan produk, lalu lanjutkan belanja Anda.
              </p>
            </div>
            <Button
              className="h-11 shrink-0 px-5"
              nativeButton={false}
              render={<Link href="#kategori" />}
              size="lg"
            >
              Jelajahi toko
              <ArrowRight aria-hidden="true" data-icon="inline-end" />
            </Button>
          </div>
        </section>
      </main>

      <StoreFooter />
    </div>
  );
}
