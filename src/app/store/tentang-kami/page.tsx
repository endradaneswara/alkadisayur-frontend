import Link from "next/link";
import { ArrowRight, Leaf, PackageCheck, Store } from "lucide-react";

import { StorePageShell } from "@/components/store-page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const commitments = [
  {
    title: "Pilihan untuk kebutuhan dapur",
    description:
      "Jelajahi produk dan kategori untuk menemukan bahan yang sesuai dengan kebutuhan harian Anda.",
    icon: Leaf,
    href: "/store/produk",
    action: "Lihat produk",
  },
  {
    title: "Belanja sesuai cara Anda",
    description:
      "Pilih pesan antar atau ambil di lokasi toko yang tersedia saat membuat pesanan.",
    icon: PackageCheck,
    href: "/store/lokasi",
    action: "Temukan lokasi",
  },
  {
    title: "Informasi toko yang jelas",
    description:
      "Lihat lokasi dan informasi kontak Alkadi sebelum berkunjung atau membuat pesanan.",
    icon: Store,
    href: "/store/kontak",
    action: "Hubungi kami",
  },
];

export default function AboutPage() {
  return (
    <StorePageShell>
      <section className="mx-auto flex max-w-5xl flex-col gap-10">
        <header className="rounded-3xl border border-border bg-secondary/60 px-6 py-12 sm:px-10 sm:py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Tentang Alkadi
          </p>
          <h1 className="mt-3 max-w-2xl font-heading text-3xl font-semibold tracking-tight sm:text-5xl">
            Kebutuhan dapur keluarga, lebih mudah ditemukan.
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
            Alkadi adalah toko sayur dan kebutuhan dapur. Kami menyediakan
            katalog produk yang dapat dijelajahi, pilihan lokasi toko, serta
            layanan pemesanan untuk membantu pelanggan berbelanja dengan praktis.
          </p>
          <Button className="mt-7" nativeButton={false} render={<Link href="/store/produk" />}>
            Jelajahi produk
            <ArrowRight aria-hidden="true" data-icon="inline-end" />
          </Button>
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          {commitments.map(({ title, description, icon: Icon, href, action }) => (
            <Card className="flex flex-col" key={title}>
              <CardHeader>
                <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon aria-hidden="true" className="size-5" />
                </span>
                <CardTitle className="pt-2">{title}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-5">
                <p className="text-sm leading-6 text-muted-foreground">
                  {description}
                </p>
                <Link className="mt-auto text-sm font-semibold text-primary hover:underline" href={href}>
                  {action} <span aria-hidden="true">→</span>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </StorePageShell>
  );
}