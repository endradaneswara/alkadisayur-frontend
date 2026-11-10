"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Leaf,
  ShieldCheck,
  ShoppingBasket,
  Truck,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { buttonVariants } from "@/components/ui/button";
import { StoreFooter } from "@/components/store-footer";
import { StoreNavbar } from "@/components/store-navbar";
import { StoreShowcase } from "@/components/store-showcase";

export default function StoreLandingPage() {
  const benefitGridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const grid = benefitGridRef.current;
    if (!grid) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        grid.querySelectorAll(".store-benefit-reveal").forEach((card) => {
          card.classList.add("is-visible");
        });
        observer.disconnect();
      },
      { threshold: 0.15 },
    );

    observer.observe(grid);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="store-landing min-h-screen bg-background text-foreground">
      <StoreNavbar />
      <main>
        <section
          aria-labelledby="hero-title"
          className="flex flex-col items-center px-4 pb-10 pt-14 text-center sm:px-6 sm:pb-14 sm:pt-20 lg:px-10 lg:pb-16 lg:pt-24 xl:px-12"
        >
          <div className="store-hero-copy flex max-w-3xl flex-col items-center">
            <h1 className="store-copy-reveal font-heading text-4xl font-semibold leading-[1.05] tracking-[-0.04em] text-primary sm:text-5xl lg:text-6xl" id="hero-title">
              Segarnya alam,
              <br />
              <span className="text-foreground">sampai di meja anda.</span>
            </h1>
            <p className="store-copy-reveal mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:mt-6 sm:text-lg sm:leading-8">
              Temukan sayur dan kebutuhan segar pilihan untuk setiap hidangan keluarga. Belanja lebih praktis, pilih sesuai kebutuhan.
            </p>
          </div>
        </section>

        <section
          aria-label="Banner toko"
          className="mx-auto w-full px-4 sm:px-6 lg:px-10"
          style={{ backgroundColor: "transparent" }}
        >
          <Image
            alt="Promosi belanja kebutuhan dapur Alkadi"
            className="store-hero-image mx-auto h-auto w-full max-w-[52rem] rounded-3xl"
            height={1254}
            priority
            sizes="(max-width: 640px) calc(100vw - 2rem), (max-width: 1024px) calc(100vw - 3rem), 832px"
            src="/alkadiremove2.png"
            width={1254}
          />
          <div className="flex flex-col items-center gap-3 pb-12 pt-6 text-center">
            <Link
              className={buttonVariants({
                className:
                  "store-hero-cta h-12 gap-2 rounded-3xl px-7 text-base font-semibold shadow-lg shadow-primary/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/35 active:translate-y-0 active:scale-[0.98] [&_svg]:transition-transform [&_svg]:duration-200",
              })}
              href="/store/produk"
            >
              <ShoppingBasket aria-hidden="true" />
              Mulai belanja
            </Link>
          </div>
        </section>

        <section
          aria-labelledby="benefits-title"
                  className="scroll-mt-24 bg-background py-16 sm:py-20"
          id="keunggulan"
        >
          <div className="mx-auto max-w-[1536px] px-4 sm:px-6 lg:px-10 xl:px-12">
            <div className="store-benefit-copy mx-auto mb-10 max-w-2xl text-center">
              <p className="store-copy-reveal text-xs font-bold tracking-[0.16em] text-primary uppercase">
                Belanja terasa lebih mudah
              </p>
              <h2
                className="store-copy-reveal mt-3 font-heading text-3xl font-semibold tracking-tight sm:text-4xl"
                id="benefits-title"
              >
                Segar, praktis, dan dekat
              </h2>
              <p className="store-copy-reveal mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
                Kebutuhan dapur sehari-hari, lebih mudah ditemukan di alkadi.
              </p>
            </div>
            <div
              className="store-benefit-grid grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
              ref={benefitGridRef}
            >
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
              ].map((benefit, index) => {
                const BenefitIcon = benefit.icon;

                return (
                  <div
                    className="store-benefit-reveal group rounded-2xl border border-border bg-card p-5 shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-md sm:p-6"
                    key={benefit.title}
                    style={{ animationDelay: `${index * 110}ms` }}
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

        <StoreShowcase />
      </main>

      <StoreFooter />
    </div>
  );
}
