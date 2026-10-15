"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Clock3, MapPin, Phone, Store } from "lucide-react";

import { StorePageShell } from "@/components/store-page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/lib/store-catalog";
import { listLokasi } from "@/services/lokasiService";
import type { Lokasi } from "@/types";

export default function ContactPage() {
  const [locations, setLocations] = useState<Lokasi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;
    void listLokasi({ page: 1 })
      .then((response) => {
        if (isCurrent) {
          setLocations(response.data);
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
    <StorePageShell>
      <section className="mx-auto flex max-w-5xl flex-col gap-8">
        <header className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Kami siap membantu
          </p>
          <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            Hubungi Alkadi
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
            Hubungi kami untuk pertanyaan tentang produk, lokasi toko, atau
            pesanan Anda.
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Phone aria-hidden="true" className="size-5 text-primary" />
                Telepon
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <p className="text-sm text-muted-foreground">
                Hubungi nomor layanan Alkadi.
              </p>
              <a className="w-fit text-lg font-semibold text-primary hover:underline" href="tel:+6281215770290">
                0812-1577-0290
              </a>
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock3 aria-hidden="true" className="size-4" />
                Setiap hari, 06.00–23.00
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Store aria-hidden="true" className="size-5 text-primary" />
                Lokasi toko
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <p className="text-sm text-muted-foreground">
                Lihat lokasi dan petunjuk menuju toko Alkadi.
              </p>
              <Button nativeButton={false} render={<Link href="/store/lokasi" />} variant="outline">
                Lihat halaman lokasi
              </Button>
            </CardContent>
          </Card>
        </div>

        <section aria-labelledby="contact-locations">
          <h2 className="mb-4 font-heading text-xl font-semibold" id="contact-locations">
            Lokasi toko Alkadi
          </h2>
          {error ? (
            <p className="rounded-xl border border-destructive/30 bg-card px-4 py-3 text-sm text-destructive" role="alert">
              Lokasi toko belum dapat dimuat: {error}
            </p>
          ) : null}
          <div className="grid gap-4 md:grid-cols-2">
            {isLoading
              ? Array.from({ length: 2 }, (_, index) => (
                  <Skeleton className="h-36 rounded-xl" key={index} />
                ))
              : locations.map((location) => (
                  <Card key={location.id}>
                    <CardContent className="flex items-start gap-3 p-5">
                      <MapPin aria-hidden="true" className="mt-1 size-5 shrink-0 text-primary" />
                      <div className="flex-1">
                        <h3 className="font-semibold">{location.nama}</h3>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          {location.deskripsi || "Hubungi kami untuk informasi lokasi toko."}
                        </p>
                        <a
                          className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${location.latitude},${location.longitude}`)}`}
                          rel="noreferrer"
                          target="_blank"
                        >
                          Buka peta
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            {!isLoading && !error && locations.length === 0 ? (
              <p className="text-sm text-muted-foreground">Belum ada lokasi toko yang tersedia.</p>
            ) : null}
          </div>
        </section>
      </section>
    </StorePageShell>
  );
}