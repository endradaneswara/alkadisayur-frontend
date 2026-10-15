"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Leaf } from "lucide-react";
import { StoreFooter } from "@/components/store-footer";
import { StoreNavbar } from "@/components/store-navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/lib/store-catalog";
import { listKategori } from "@/services/kategoriService";
import type { Kategori } from "@/types";

export default function StoreCategoriesPage() {
  const [categories, setCategories] = useState<Kategori[]>([]);
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
          <span aria-current="page" className="font-medium text-foreground">
            Kategori
          </span>
        </nav>

        <section aria-labelledby="categories-title">
          <div className="mb-8 max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">
              Belanja lebih mudah
            </p>
            <h1
              className="mt-3 font-heading text-3xl font-semibold tracking-tight sm:text-4xl"
              id="categories-title"
            >
              Jelajahi kategori
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
              Temukan produk segar sesuai kebutuhan dapur dan menu hari ini.
            </p>
          </div>

          {error ? (
            <p
              className="mb-6 rounded-xl border border-destructive/30 bg-card px-4 py-3 text-sm text-destructive"
              role="alert"
            >
              Kategori belum dapat dimuat: {error}
            </p>
          ) : null}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {isLoading
              ? Array.from({ length: 6 }, (_, index) => (
                  <div
                    className="rounded-2xl border border-border bg-card p-5"
                    key={`category-skeleton-${index}`}
                  >
                    <Skeleton className="size-12 rounded-xl" />
                    <Skeleton className="mt-5 h-5 w-2/3" />
                    <Skeleton className="mt-3 h-4 w-full" />
                    <Skeleton className="mt-6 h-9 w-32" />
                  </div>
                ))
              : categories.map((category) => (
                  <Card
                    className="group border-border py-0 transition-colors hover:border-primary/50"
                    key={category.id}
                  >
                    <div className="flex h-36 items-center justify-center bg-secondary sm:h-44">
                      <span className="flex size-16 items-center justify-center rounded-2xl bg-card text-primary">
                        <Leaf aria-hidden="true" className="size-8" />
                      </span>
                    </div>
                    <CardHeader className="gap-2 px-5 pt-5">
                      <CardTitle className="text-xl">
                        {category.nama_kategori}
                      </CardTitle>
                      <p className="text-sm leading-6 text-muted-foreground">
                        Pilihan segar untuk melengkapi kebutuhan Anda.
                      </p>
                    </CardHeader>
                    <CardContent className="px-5 pb-2">
                      <p className="text-sm text-muted-foreground">
                        Lihat produk dalam kategori ini.
                      </p>
                    </CardContent>
                    <CardFooter className="px-5 pb-5">
                      <Button
                        className="w-full sm:w-auto"
                        nativeButton={false}
                        render={
                          <Link href={`/store/kategori/${category.id}`} />
                        }
                        variant="outline"
                      >
                        Lihat produk
                        <ArrowRight aria-hidden="true" data-icon="inline-end" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
            {!isLoading && !error && categories.length === 0 ? (
              <div className="col-span-full rounded-2xl border border-dashed border-border bg-card px-5 py-12 text-center">
                <h2 className="font-heading text-lg font-semibold">
                  Belum ada kategori
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Kategori produk akan muncul di sini setelah tersedia.
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
