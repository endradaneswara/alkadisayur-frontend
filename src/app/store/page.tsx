"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Leaf,
  ShieldCheck,
  ShoppingBasket,
  Truck,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { StoreFooter } from "@/components/store-footer";
import { StoreNavbar } from "@/components/store-navbar";
import { StoreShowcase } from "@/components/store-showcase";

export default function StoreLandingPage() {
  const cartCount = 0;

  return (
    <div className="store-landing min-h-screen bg-background text-foreground">
      <StoreNavbar cartCount={cartCount} />
      <main>
        <section
          aria-labelledby="hero-title"
          className="flex flex-col items-center px-4 pb-10 pt-14 text-center sm:px-6 sm:pb-14 sm:pt-20 lg:px-10 lg:pb-16 lg:pt-24 xl:px-12"
        >
          <div className="store-enter flex max-w-3xl flex-col items-center">
            <h1 className="font-heading text-4xl font-semibold leading-[1.05] tracking-[-0.04em] text-primary sm:text-5xl lg:text-6xl" id="hero-title">
              Segarnya alam,
              <br />
              <span className="text-foreground">sampai di meja Anda.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:mt-6 sm:text-lg sm:leading-8">
              Temukan sayur dan kebutuhan segar pilihan untuk setiap hidangan keluarga. Belanja lebih praktis, pilih sesuai kebutuhan.
            </p>
            <Link className={buttonVariants({ className: "mt-7 h-11 px-5 shadow-sm" })} href="/store/produk">
              Mulai belanja <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </section>

        <section
          aria-label="Banner toko"
          className="store-hero relative isolate mx-auto w-[calc(100%-2rem)] min-h-[400px] overflow-hidden sm:w-[calc(100%-3rem)] sm:min-h-[500px] lg:w-[calc(100%-5rem)] lg:min-h-[600px] xl:w-[calc(100%-6rem)]"
        >
          <div className="store-hero-background" aria-hidden="true">
            <Image
              alt=""
              className="object-cover"
              fill
              priority
              sizes="70vw"
              src="/background-landing2.webp"
            />
          </div>
        </section>

        <section
          aria-labelledby="benefits-title"
                  className="scroll-mt-24 bg-background dark:bg-secondary py-16 sm:py-20"
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

        <StoreShowcase />
      </main>

      <StoreFooter />
    </div>
  );
}
