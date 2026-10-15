"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Store } from "lucide-react";
import { StoreFooter } from "@/components/store-footer";
import { StoreNavbar } from "@/components/store-navbar";
import { Button } from "@/components/ui/button";
import { Map, MapControls } from "@/components/ui/map";

const storeSlides = [
  {
    src: "/images/lokasi-toko-1.jpg",
    alt: "Tampak depan toko Alkadi pertama",
    label: "Toko Alkadi 1",
  },
  {
    src: "/images/lokasi-toko-2.jpg",
    alt: "Tampak depan toko Alkadi kedua",
    label: "Toko Alkadi 2",
  },
];

export default function LokasiPage() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [failedImageSources, setFailedImageSources] = useState<Set<string>>(
    () => new Set(),
  );

  useEffect(() => {
    const slideTimer = window.setInterval(() => {
      setActiveSlide((currentSlide) => (currentSlide + 1) % storeSlides.length);
    }, 6000);

    return () => window.clearInterval(slideTimer);
  }, []);

  function showSlide(slideIndex: number): void {
    setActiveSlide((slideIndex + storeSlides.length) % storeSlides.length);
  }

  const currentSlide = storeSlides[activeSlide];
  const imageIsUnavailable = failedImageSources.has(currentSlide.src);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <StoreNavbar />
      <main>
        <section
          aria-label="Foto lokasi toko Alkadi"
          aria-roledescription="carousel"
          className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8"
        >
          <div className="relative isolate flex min-h-[420px] overflow-hidden rounded-2xl border border-border bg-secondary sm:min-h-[520px] lg:min-h-[600px]">
            {imageIsUnavailable ? (
              <div
                aria-label={`Foto ${currentSlide.label} belum ditambahkan`}
                className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-secondary px-6 text-center text-primary"
                role="img"
              >
                <Store aria-hidden="true" className="size-14" />
              </div>
            ) : (
              <Image
                key={currentSlide.src}
                alt={currentSlide.alt}
                className="object-cover"
                fill
                priority={activeSlide === 0}
                sizes="(max-width: 1280px) 100vw, 1280px"
                src={currentSlide.src}
                onError={() => {
                  setFailedImageSources((sources) => {
                    const nextSources = new Set(sources);
                    nextSources.add(currentSlide.src);
                    return nextSources;
                  });
                }}
              />
            )}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent"
            />
            <div className="relative z-10 mt-auto flex w-full flex-wrap items-end justify-between gap-6 p-5 text-white sm:p-8 lg:p-10">
              <div aria-live="polite">
                <p className="text-sm font-medium text-white/85">
                  Lokasi toko Alkadi
                </p>
                <h1
                  className="mt-2 font-heading text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl"
                  id="hero-title"
                >
                  {currentSlide.label}
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  aria-label="Foto sebelumnya"
                  onClick={() => showSlide(activeSlide - 1)}
                  size="icon"
                  variant="outline"
                >
                  <ChevronLeft aria-hidden="true" />
                </Button>
                <span
                  aria-label={`Foto ${activeSlide + 1} dari ${storeSlides.length}`}
                  className="min-w-14 text-center text-sm font-medium"
                  role="status"
                >
                  {activeSlide + 1} / {storeSlides.length}
                </span>
                <Button
                  aria-label="Foto berikutnya"
                  onClick={() => showSlide(activeSlide + 1)}
                  size="icon"
                  variant="outline"
                >
                  <ChevronRight aria-hidden="true" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section
          aria-labelledby="store-map-title"
          className="bg-card py-12 sm:py-16 lg:py-20"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-6 max-w-2xl sm:mb-8">
              <p className="text-sm font-semibold tracking-wide text-primary">
                Kunjungi kami
              </p>
              <h2
                className="mt-2 font-heading text-3xl font-semibold tracking-tight sm:text-4xl"
                id="store-map-title"
              >
                Temukan lokasi toko
              </h2>
            </div>
            <div
              aria-label="Peta lokasi toko Alkadi"
              className="h-[360px] overflow-hidden rounded-2xl border border-border sm:h-[460px]"
              role="region"
            >
              <Map
                className="h-full w-full"
                center={[117, -2]}
                zoom={4}
              >
                <MapControls showCompass position="bottom-right" />
              </Map>
            </div>
          </div>
        </section>
      </main>
      <StoreFooter />
    </div>
  );
}