"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  MapPin,
  Navigation,
  Phone,
  Store,
} from "lucide-react";
import { StoreFooter } from "@/components/store-footer";
import { StoreNavbar } from "@/components/store-navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Map,
  MapControls,
  MapMarker,
  MarkerContent,
  MarkerPopup,
} from "@/components/ui/map";
import { listLokasi } from "@/services/lokasiService";
import type { Lokasi } from "@/types";

interface BranchSlide {
  src: string;
  name: string;
  tagline: string;
  address: string;
  hours: string;
  phone: string;
  lat: number;
  lng: number;
}

const branchSlides: BranchSlide[] = [
  {
    src: "/toko1.webp",
    name: "Toko Alkadi Sokka",
    tagline: "Pusat sayur segar dan kebutuhan dapur lengkap",
    address: "Sokka, Kebumen, Jawa Tengah",
    hours: "Setiap Hari, 06.00 – 23.00 WIB",
    phone: "0812-1577-0290",
    lat: -7.67906,
    lng: 109.641435,
  },
  {
    src: "/toko2.webp",
    name: "Toko Alkadi Pemuda",
    tagline: "Belanja nyaman dengan fasilitas display segar berpendingin",
    address: "Jl. Pemuda, Gombong, Kebumen, Jawa Tengah",
    hours: "Setiap Hari, 06.00 – 22.00 WIB",
    phone: "0812-1577-0290",
    lat: -7.607,
    lng: 109.514,
  },
];

export default function LokasiPage() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [apiLocations, setApiLocations] = useState<Lokasi[]>([]);
  const [isLoadingApi, setIsLoadingApi] = useState(true);

  useEffect(() => {
    let isCurrent = true;
    void listLokasi({ page: 1 })
      .then((res) => {
        if (isCurrent && res.data) {
          setApiLocations(res.data);
        }
      })
      .catch(() => {
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoadingApi(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((curr) => (curr + 1) % branchSlides.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, []);

  const currentSlide = branchSlides[activeSlide];

  const validLocations = apiLocations.filter(
    (loc) => !isNaN(Number(loc.latitude)) && !isNaN(Number(loc.longitude)),
  );

  const mapCenter: [number, number] =
    validLocations.length > 0
      ? [Number(validLocations[0].longitude), Number(validLocations[0].latitude)]
      : [109.641435, -7.67906];

  return (
    <div className="store-landing min-h-screen bg-background text-foreground">
      <StoreNavbar />

      <main>
        <section
          aria-labelledby="lokasi-hero-title"
          className="store-hero relative isolate -mt-[76px] flex min-h-[600px] items-center overflow-hidden sm:min-h-[680px] lg:min-h-[720px]"
        >
          <div className="store-hero-background" aria-hidden="true">
            <Image
              alt={currentSlide.name}
              className="object-cover transition-all duration-700"
              fill
              priority
              sizes="100vw"
              src={currentSlide.src}
            />
          </div>

          <div className="mx-auto grid w-full max-w-[1536px] items-center gap-12 px-4 pt-28 pb-14 sm:px-6 sm:pt-36 sm:pb-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:px-10 lg:pt-40 lg:pb-24 xl:px-12">
            <div className="store-enter flex flex-col items-start">
              <h1
                className="mt-4 max-w-2xl font-heading text-4xl leading-[1.08] font-semibold tracking-[-0.04em] text-primary sm:text-5xl lg:text-6xl"
                id="lokasi-hero-title"
              >
                Kunjungi Cabang
                <br />
                <span className="text-foreground">Toko Alkadi Terdekat</span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-7 text-foreground sm:text-lg sm:leading-8">
                Temukan pengalaman belanja sayur dan kebutuhan dapur segar
                secara langsung di toko kami yang bersih, nyaman, dan ramah
                keluarga.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-4 rounded-xl border border-border/80 bg-background/80 p-4 backdrop-blur-md">
                <div className="flex items-center gap-2.5 text-sm font-medium">
                  <MapPin aria-hidden="true" className="size-4 text-primary" />
                  <span>{currentSlide.name}</span>
                </div>
                <div className="hidden h-4 w-px bg-border sm:block" />
                <div className="flex items-center gap-2.5 text-xs text-muted-foreground sm:text-sm">
                  <Clock aria-hidden="true" className="size-4 text-primary" />
                  <span>{currentSlide.hours}</span>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button
                  className="h-11 px-5"
                  nativeButton={false}
                  render={<a href="#peta-lokasi" />}
                  size="lg"
                >
                  <MapPin aria-hidden="true" data-icon="inline-start" />
                  Lihat Peta Lokasi
                </Button>
              </div>
            </div>

            <div className="store-enter store-enter-delay-1 flex flex-col gap-4">
              <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
                <Image
                  alt={currentSlide.name}
                  className="object-cover"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 600px"
                  src={currentSlide.src}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                  <span className="text-xs font-semibold tracking-wider uppercase text-emerald-300">
                    Foto Cabang
                  </span>
                  <h3 className="mt-1 font-heading text-xl font-bold sm:text-2xl">
                    {currentSlide.name}
                  </h3>
                  <p className="mt-1 text-xs text-white/80 sm:text-sm">
                    {currentSlide.tagline}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Button
                    aria-label="Cabang sebelumnya"
                    onClick={() =>
                      setActiveSlide(
                        (curr) =>
                          (curr - 1 + branchSlides.length) % branchSlides.length,
                      )
                    }
                    size="icon"
                    variant="outline"
                  >
                    <ChevronLeft aria-hidden="true" className="size-4" />
                  </Button>
                  <Button
                    aria-label="Cabang berikutnya"
                    onClick={() =>
                      setActiveSlide(
                        (curr) => (curr + 1) % branchSlides.length,
                      )
                    }
                    size="icon"
                    variant="outline"
                  >
                    <ChevronRight aria-hidden="true" className="size-4" />
                  </Button>
                  <span className="text-xs font-medium text-muted-foreground">
                    {activeSlide + 1} dari {branchSlides.length}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {branchSlides.map((slide, idx) => (
                    <button
                      key={slide.name}
                      aria-label={`Pilih ${slide.name}`}
                      className={`h-2.5 rounded-full transition-all ${
                        idx === activeSlide
                          ? "w-8 bg-primary"
                          : "w-2.5 bg-border hover:bg-primary/50"
                      }`}
                      onClick={() => setActiveSlide(idx)}
                      type="button"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-card py-16 sm:py-20">
          <div className="mx-auto max-w-[1536px] px-4 sm:px-6 lg:px-10 xl:px-12">
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                Kenyamanan Berbelanja
              </span>
              <h2 className="mt-2 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
                Mengapa Belanja Langsung di Alkadi?
              </h2>
              <p className="mt-3 text-sm text-muted-foreground sm:text-base">
                Kami merancang toko fisik agar setiap keluarga dapat memilih bahan
                makanan berkualitas dengan higienis, leluasa, dan puas.
              </p>
            </div>
          </div>
        </section>

        <section
          id="peta-lokasi"
          aria-labelledby="store-map-title"
          className="mx-auto max-w-[1536px] px-4 py-16 sm:px-6 sm:py-20 lg:px-10 lg:py-24 xl:px-12"
        >
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                Peta Interaktif
              </p>
              <h2
                className="mt-1 font-heading text-3xl font-semibold tracking-tight sm:text-4xl"
                id="store-map-title"
              >
                Temukan Lokasi Toko di Peta
              </h2>
              <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                Klik pin marker pada peta untuk melihat detail cabang dan membuka petunjuk arah Google Maps.
              </p>
            </div>

            <Button
              nativeButton={false}
              render={<Link href="/store/kontak" />}
              variant="outline"
            >
              Hubungi Layanan Toko
            </Button>
          </div>

          <div
            aria-label="Peta lokasi toko Alkadi"
            className="h-[460px] overflow-hidden rounded-2xl border border-border sm:h-[560px] shadow-lg"
            role="region"
          >
            <Map className="h-full w-full" center={mapCenter} zoom={11}>
              <MapControls position="bottom-right" showCompass />

              {validLocations.length > 0
                ? validLocations.map((loc) => {
                    const lat = Number(loc.latitude);
                    const lng = Number(loc.longitude);
                    const gmapsUrl =
                      loc.link_gmaps ||
                      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        `${lat},${lng}`,
                      )}`;

                    return (
                      <MapMarker key={loc.id} latitude={lat} longitude={lng}>
                        <MarkerContent>
                          <div className="group relative flex flex-col items-center">
                            <span className="mb-1.5 rounded-md bg-background/95 px-2.5 py-1 text-[11px] font-bold text-foreground shadow-md ring-1 ring-border whitespace-nowrap">
                              {loc.nama}
                            </span>
                            <div className="relative flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl ring-4 ring-primary/30 transition-transform group-hover:scale-110">
                              <Store className="size-5" />
                            </div>
                            <div className="-mt-1 size-2 rotate-45 bg-primary" />
                          </div>
                        </MarkerContent>

                        <MarkerPopup closeButton>
                          <div className="flex flex-col gap-2 p-1 text-xs max-w-[240px]">
                            <div className="flex items-center gap-1.5 font-bold text-sm text-foreground">
                              <Store className="size-4 text-primary" />
                              {loc.nama}
                            </div>
                            <p className="text-muted-foreground leading-relaxed">
                              {loc.deskripsi || "Cabang resmi toko Alkadi."}
                            </p>
                            <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
                              <a
                                href={gmapsUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline text-xs"
                              >
                                <Navigation className="size-3.5" />
                                Buka di Google Maps
                                <ExternalLink className="size-3" />
                              </a>
                            </div>
                          </div>
                        </MarkerPopup>
                      </MapMarker>
                    );
                  })
                : 
                  branchSlides.map((branch) => {
                    const gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${branch.lat},${branch.lng}`,
                    )}`;

                    return (
                      <MapMarker
                        key={branch.name}
                        latitude={branch.lat}
                        longitude={branch.lng}
                      >
                        <MarkerContent>
                          <div className="group relative flex flex-col items-center">
                            <span className="mb-1.5 rounded-md bg-background/95 px-2.5 py-1 text-[11px] font-bold text-foreground shadow-md ring-1 ring-border whitespace-nowrap">
                              {branch.name}
                            </span>
                            <div className="relative flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl ring-4 ring-primary/30 transition-transform group-hover:scale-110">
                              <Store className="size-5" />
                            </div>
                            <div className="-mt-1 size-2 rotate-45 bg-primary" />
                          </div>
                        </MarkerContent>

                        <MarkerPopup closeButton>
                          <div className="flex flex-col gap-2 p-1 text-xs max-w-[240px]">
                            <div className="flex items-center gap-1.5 font-bold text-sm text-foreground">
                              <Store className="size-4 text-primary" />
                              {branch.name}
                            </div>
                            <p className="text-muted-foreground leading-relaxed">
                              {branch.address}
                            </p>
                            <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
                              <a
                                href={gmapsUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline text-xs"
                              >
                                <Navigation className="size-3.5" />
                                Buka di Google Maps
                                <ExternalLink className="size-3" />
                              </a>
                            </div>
                          </div>
                        </MarkerPopup>
                      </MapMarker>
                    );
                  })}
            </Map>
          </div>
        </section>
      </main>

      <StoreFooter />
    </div>
  );
}