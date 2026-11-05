"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface StoreItem {
  id: number;
  image: string;
  alt: string;
  tag: string;
}

const STORE_SHOWCASE_ITEMS: StoreItem[] = [
  {
    id: 1,
    image: "/toko1.webp",
    alt: "Toko Alkadi 1",
    tag: "1",
  },
  {
    id: 2,
    image: "/toko2.webp",
    alt: "Toko Alkadi 2",
    tag: "2",
  },
  {
    id: 3,
    image: "/toko3.webp",
    alt: "Toko Alkadi 3",
    tag: "3",
  },
  {
    id: 4,
    image: "/toko4.webp",
    alt: "Toko Alkadi 4",
    tag: "4",
  },
  {
    id: 5,
    image: "/toko5.webp",
    alt: "Toko Alkadi 5",
    tag: "5",
  },
  {
    id: 6,
    image: "/toko6.webp",
    alt: "Toko Alkadi 6",
    tag: "6",
  },
];

export function StoreShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const total = STORE_SHOWCASE_ITEMS.length;
  const current = STORE_SHOWCASE_ITEMS[activeIndex];
  const prevIndex = (activeIndex - 1 + total) % total;
  const nextIndex = (activeIndex + 1) % total;

  useEffect(() => {
    if (!isAutoPlaying || isHovered) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % total);
    }, 4500);

    return () => clearInterval(timer);
  }, [isAutoPlaying, isHovered, total]);

  function prevSlide() {
    setActiveIndex((prev) => (prev - 1 + total) % total);
  }

  function nextSlide() {
    setActiveIndex((prev) => (prev + 1) % total);
  }

  return (
    <section
      aria-labelledby="store-showcase-title"
      className="relative overflow-hidden py-20 sm:py-28"
    >
      <div className="mx-auto max-w-[1536px] px-4 sm:px-6 lg:px-10 xl:px-12">
        <div className="mx-auto max-w-3xl text-center">
          <h2
            className="mt-4 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
            id="store-showcase-title"
          >
            Lebih dari 10.000+ keluarga mempercayai kesegaran Alkadi.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Lihat langsung suasana gerai, standar kebersihan, dan kenyamanan berbelanja sayur segar di berbagai cabang toko Alkadi.
          </p>
        </div>

        <div
          className="relative mt-12 flex items-center justify-center gap-4 sm:gap-6"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <button
            aria-label="Lihat toko sebelumnya"
            className="group relative hidden aspect-[16/10] w-36 shrink-0 cursor-pointer overflow-hidden rounded-3xl border border-border/70 opacity-40 shadow-sm transition-all duration-500 hover:opacity-75 md:block lg:w-56"
            onClick={prevSlide}
            type="button"
          >
            <Image
              alt=" "
              className="object-cover blur-[0.5px] transition-transform duration-700 group-hover:scale-105"
              fill
              loading="lazy"
              sizes="256px"
              src={STORE_SHOWCASE_ITEMS[prevIndex].image}
            />
            <div className="absolute inset-0 bg-black/30" />
            <div className="absolute inset-0 flex items-center justify-center text-white opacity-0 transition-opacity group-hover:opacity-100">
              <span className="flex size-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md">
                <ChevronLeft className="size-6 text-white" />
              </span>
            </div>
          </button>

          <div className="relative aspect-[16/10] w-full max-w-[1040px] overflow-hidden rounded-[2rem] border border-border/80 bg-card shadow-2xl transition-all duration-500 sm:rounded-[2.5rem]">
            {STORE_SHOWCASE_ITEMS.map((item, index) => {
              const isActive = index === activeIndex;
              return (
                <div
                  aria-hidden={!isActive}
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                    isActive ? "opacity-100 z-0" : "opacity-0 -z-10 pointer-events-none"
                  }`}
                  key={item.id}
                >
                  <Image
                    alt={item.alt}
                    className="object-cover transition-transform duration-1000 scale-100 hover:scale-[1.02]"
                    fill
                    loading={index === 0 ? 'eager' : 'lazy'}
                    priority={index === 0}
                    sizes="(max-width: 1024px) 100vw, 1040px"
                    src={item.image}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/15" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
                </div>
              );
            })}

            <div className="absolute inset-x-0 bottom-0 z-10 p-6 sm:p-10">
              <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
                <div className="flex items-center gap-2.5">
                  <span className="font-heading text-2xl font-bold tracking-tight text-white drop-shadow-md sm:text-3xl">
                    Alkadi Fresh Market
                  </span>
                </div>
              </div>
            </div>
          </div>

          <button
            aria-label="Lihat toko berikutnya"
            className="group relative hidden aspect-[16/10] w-36 shrink-0 cursor-pointer overflow-hidden rounded-3xl border border-border/70 opacity-40 shadow-sm transition-all duration-500 hover:opacity-75 md:block lg:w-56"
            onClick={nextSlide}
            type="button"
          >
            <Image
              alt={STORE_SHOWCASE_ITEMS[nextIndex].alt}
              className="object-cover blur-[0.5px] transition-transform duration-700 group-hover:scale-105"
              fill
              loading="lazy"
              sizes="256px"
              src={STORE_SHOWCASE_ITEMS[nextIndex].image}
            />
            <div className="absolute inset-0 bg-black/30" />
            <div className="absolute inset-0 flex items-center justify-center text-white opacity-0 transition-opacity group-hover:opacity-100">
              <span className="flex size-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md">
                <ChevronRight className="size-6 text-white" />
              </span>
            </div>
          </button>
        </div>
      </div>
    </section>
  );
}
