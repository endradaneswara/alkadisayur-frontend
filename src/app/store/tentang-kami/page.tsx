"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Award,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  HeartHandshake,
  Leaf,
  Quote,
  ShieldCheck,
  Sparkles,
  Star,
  Store,
  Users,
} from "lucide-react";
import { StoreFooter } from "@/components/store-footer";
import { StoreNavbar } from "@/components/store-navbar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { listUlasan } from "@/services/ulasanService";
import type { Ulasan } from "@/types";

const stats = [
  { value: "10.000+", label: "Keluarga Terlayani" },
  { value: "50+", label: "Mitra Petani Lokal" },
  { value: "500+", label: "Pilihan Produk Segar" },
  { value: "99.8%", label: "Tingkat Kesegaran Terjaga" },
];

const commitments = [
  {
    icon: Leaf,
    title: "Kesegaran Alami Tanpa Kompromi",
    description:
      "Sayur mayur dipanen langsung dari kebun mitra setiap pagi hari, melewati sortir ketat sebelum tiba di rak toko dan diantar ke rumah Anda.",
  },
  {
    icon: ShieldCheck,
    title: "Standar Higienitas & Kualitas",
    description:
      "Semua produk disimpan dalam suhu optimal dengan fasilitas berpendingin modern untuk menjaga nutrisi, tekstur, dan rasa alami tetap terjaga.",
  },
  {
    icon: Award,
    title: "Harga Jujur & Transparan",
    description:
      "Kami memotong rantai distribusi panjang agar petani menerima harga yang adil dan Anda mendapatkan harga terbaik tanpa markup berlebihan.",
  },
  {
    icon: HeartHandshake,
    title: "Garansi Kepuasan Pelanggan",
    description:
      "Jika produk yang diterima tidak segar atau cacat, kami siap mengganti atau mengembalikan dana tanpa proses yang berbelit-belit.",
  },
];

const advantages = [
  {
    title: "Dipetik Langsung dari Kebun",
    description:
      "Bekerja sama erat dengan kelompok tani lokal di dataran tinggi yang merawat tanaman dengan metode ramah lingkungan.",
  },
  {
    title: "Jaringan Cabang Fisik yang Bersih",
    description:
      "Toko kami ber-AC, tertata rapi, dan memiliki display sayuran yang selalu terjaga kelembabannya sepanjang hari.",
  },
  {
    title: "Belanja Fleksibel: Online & Offline",
    description:
      "Kunjungi cabang terdekat atau pesan langsung melalui web / WhatsApp dengan pengantaran cepat ke seluruh kota.",
  },
  {
    title: "Pilihan Komprehensif Satu Atap",
    description:
      "Tidak hanya sayuran hijau, kami juga menyediakan buah-buahan, rempah bumbu dapur, produk hewani, serta olahan frozen food.",
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`size-4 ${
            i < rating
              ? "fill-amber-400 text-amber-400"
              : "text-muted-foreground/30"
          }`}
        />
      ))}
    </div>
  );
}

export default function TentangKamiPage() {
  const [reviews, setReviews] = useState<Ulasan[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void listUlasan({ page: 1 })
      .then((res) => setReviews(res.data))
      .catch(() => setReviews([]))
      .finally(() => setIsLoadingReviews(false));
  }, []);

  function scrollLeft() {
    scrollRef.current?.scrollBy({ left: -360, behavior: "smooth" });
  }
  function scrollRight() {
    scrollRef.current?.scrollBy({ left: 360, behavior: "smooth" });
  }

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : "5.0";

  return (
    <div className="store-landing min-h-screen bg-background text-foreground">
      <StoreNavbar />

      <main>
        <section
          aria-labelledby="about-hero-title"
          className="store-hero relative isolate -mt-[76px] flex min-h-[600px] items-center overflow-hidden sm:min-h-[680px] lg:min-h-[720px]"
        >
          <div className="store-hero-background" aria-hidden="true">
            <Image
              alt="Toko Sayur Alkadi"
              className="object-cover"
              fill
              priority
              sizes="100vw"
              src="/toko5.webp"
            />
          </div>

          <div className="mx-auto grid w-full max-w-[1536px] items-center gap-12 px-4 pt-28 pb-14 sm:px-6 sm:pt-36 sm:pb-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:px-10 lg:pt-40 lg:pb-24 xl:px-12">
            <div className="store-enter flex flex-col items-start">

              <h1
                className="mt-4 max-w-2xl font-heading text-4xl leading-[1.08] font-semibold tracking-[-0.04em] text-primary sm:text-5xl lg:text-6xl"
                id="about-hero-title"
              >
                Membawa Kesegaran Alami,
                <br />
                <span className="text-foreground">Langsung ke Meja Anda.</span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-7 text-foreground sm:text-lg sm:leading-8">
                Alkadi hadir untuk memudahkan setiap keluarga menikmati sayuran,
                buah, dan bahan masakan terbaik yang dipanen segar dengan standar
                mutu tertinggi dan harga yang terjangkau.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button
                  className="h-11 px-5"
                  nativeButton={false}
                  render={<a href="#cerita-alkadi" />}
                  size="lg"
                >
                  Baca Kisah Kami
                  <ArrowRight aria-hidden="true" data-icon="inline-end" />
                </Button>
                <Button
                  className="h-11 px-5"
                  nativeButton={false}
                  render={<Link href="/store/produk" />}
                  size="lg"
                  variant="outline"
                >
                  Jelajahi Produk
                </Button>
              </div>
            </div>

            <div className="store-enter store-enter-delay-1 relative hidden lg:block">
              <div className="relative aspect-4/3 overflow-hidden rounded-3xl border border-border bg-card shadow-2xl">
                <Image
                  alt="Interior Toko Alkadi"
                  className="object-cover"
                  fill
                  priority
                  sizes="600px"
                  src="/toko1.webp"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-8 text-white">
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
                    Dedikasi Kami
                  </span>
                  <h3 className="mt-1 font-heading text-2xl font-bold">
                    Toko Sayur Modern & Terpercaya
                  </h3>
                  <p className="mt-2 text-sm text-white/80">
                    Menghubungkan kebaikan alam dan petani lokal langsung ke dapur
                    keluarga Indonesia.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STATISTIK */}
        <section className="border-b border-border bg-card py-10 sm:py-14">
          <div className="mx-auto max-w-[1536px] px-4 sm:px-6 lg:px-10 xl:px-12">
            <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center sm:text-left">
                  <p className="font-heading text-3xl font-bold tracking-tight text-primary sm:text-4xl">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs font-medium text-muted-foreground sm:text-sm">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="cerita-alkadi"
          aria-labelledby="story-title"
          className="mx-auto max-w-[1536px] px-4 py-16 sm:px-6 sm:py-20 lg:px-10 lg:py-24 xl:px-12"
        >
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                Cerita Alkadi
              </span>
              <h2
                className="mt-3 font-heading text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl"
                id="story-title"
              >
                Berawal dari Cinta pada Hidangan Sehat Keluarga
              </h2>
              <div className="mt-6 space-y-4 text-base leading-7 text-muted-foreground">
                <p>
                  Alkadi bermula dari sebuah kegelisahan sederhana: betapa sulitnya
                  menemukan sayur segar berkualitas tinggi di tengah hiruk pikuk
                  perkotaan tanpa harus berdesakan di pasar tradisional subuh-subuh
                  atau membayar harga selangit di supermarket besar.
                </p>
                <p>
                  Kami meyakini bahwa setiap keluarga berhak mendapatkan akses
                  terhadap sayuran dan bahan dapur yang dipanen di puncak
                  kesegarannya. Oleh karena itu, kami membangun hubungan langsung
                  dengan para petani lokal di berbagai daerah sentra sayur.
                </p>
                <p>
                  Kini, Alkadi telah berkembang menjadi jaringan gerai sayur modern
                  dan platform belanja daring terpadu. Setiap harinya, puluhan jenis
                  sayur mayur, buah segar, dan kebutuhan pokok kami seleksi dengan
                  cermat demi menghadirkan kebahagiaan di meja makan Anda.
                </p>
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
                <div className="flex items-center gap-2 rounded-xl bg-primary/10 px-4 py-2.5 text-sm font-semibold text-primary">
                  <CheckCircle2 className="size-4" />
                  Dipanen Setiap Pagi
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-primary/10 px-4 py-2.5 text-sm font-semibold text-primary">
                  <CheckCircle2 className="size-4" />
                  Sortir Kualitas Ketat
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-primary/10 px-4 py-2.5 text-sm font-semibold text-primary">
                  <CheckCircle2 className="size-4" />
                  Dukungan Petani Lokal
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative aspect-3/4 overflow-hidden rounded-2xl border border-border shadow-lg">
                <Image
                  alt="Aktivitas Toko Alkadi"
                  className="object-cover"
                  fill
                  sizes="400px"
                  src="/toko2.webp"
                />
              </div>
              <div className="relative aspect-3/4 mt-8 overflow-hidden rounded-2xl border border-border shadow-lg">
                <Image
                  alt="Display Sayur Alkadi"
                  className="object-cover"
                  fill
                  sizes="400px"
                  src="/toko3.webp"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-card py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-[1536px] px-4 sm:px-6 lg:px-10 xl:px-12">
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                Arah & Panduan Kami
              </span>
              <h2 className="mt-2 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
                Visi & Misi Alkadi
              </h2>
              <p className="mt-3 text-sm text-muted-foreground sm:text-base">
                Prinsip kokoh yang memandu setiap langkah kami dalam melayani
                kebutuhan dapur harian Anda.
              </p>
            </div>

            <div className="mt-12 grid gap-8 lg:grid-cols-2">
              <div className="flex flex-col rounded-3xl border border-border bg-background p-8 sm:p-10">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Sparkles className="size-6" />
                </span>
                <span className="mt-6 text-xs font-bold uppercase tracking-widest text-primary">
                  Visi Kami
                </span>
                <h3 className="mt-2 font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  Menjadi Pilihan Utama Keluarga dalam Memenuhi Kebutuhan Pangan Segar
                </h3>
                <p className="mt-4 text-base leading-7 text-muted-foreground">
                  Menjadi jaringan penyedia sayur mayur dan bahan dapur segar yang paling
                  terpercaya di Indonesia, mengedepankan kualitas hasil alam,
                  kemudahan akses berbelanja, serta keberlanjutan bagi ekosistem
                  pertanian lokal.
                </p>
              </div>

              <div className="flex flex-col rounded-3xl border border-border bg-background p-8 sm:p-10">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Users className="size-6" />
                </span>
                <span className="mt-6 text-xs font-bold uppercase tracking-widest text-primary">
                  Misi Kami
                </span>
                <h3 className="mt-2 font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  Langkah Nyata Melayani Sepenuh Hati
                </h3>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground sm:text-base">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="mt-1 size-5 shrink-0 text-primary" />
                    <span>
                      Menyediakan bahan pangan segar bermutu prima setiap hari melalui kontrol mutu yang ketat.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="mt-1 size-5 shrink-0 text-primary" />
                    <span>
                      Membangun kemitraan yang adil dan berkeadilan dengan petani lokal Indonesia.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="mt-1 size-5 shrink-0 text-primary" />
                    <span>
                      Menghadirkan layanan belanja yang praktis, cepat, dan higienis secara offline maupun online.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="mt-1 size-5 shrink-0 text-primary" />
                    <span>
                      Menjaga kestabilan harga yang terjangkau bagi seluruh lapisan masyarakat.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section
          aria-labelledby="commitments-title"
          className="mx-auto max-w-[1536px] px-4 py-16 sm:px-6 sm:py-20 lg:px-10 lg:py-24 xl:px-12"
        >
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Nilai Utama
            </span>
            <h2
              className="mt-2 font-heading text-3xl font-semibold tracking-tight sm:text-4xl"
              id="commitments-title"
            >
              Komitmen Alkadi untuk Anda
            </h2>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
              Setiap produk yang Anda terima adalah wujud janji kami atas
              kesegaran, integritas, dan kepuasan pelanggan.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {commitments.map((item) => {
              const Icon = item.icon;
              return (
                <Card
                  key={item.title}
                  className="flex flex-col border border-border p-6 transition-all hover:border-primary hover:shadow-md"
                >
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="size-6" />
                  </span>
                  <h3 className="mt-5 font-heading text-lg font-bold text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {item.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="border-t border-border bg-card py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-[1536px] px-4 sm:px-6 lg:px-10 xl:px-12">
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                Mengapa Memilih Kami
              </span>
              <h2 className="mt-2 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
                Keunggulan Belanja di Alkadi
              </h2>
              <p className="mt-3 text-sm text-muted-foreground sm:text-base">
                Pengalaman belanja yang dirancang khusus untuk memenuhi standar
                tinggi dapur keluarga modern.
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {advantages.map((adv, index) => (
                <div
                  key={adv.title}
                  className="flex flex-col rounded-2xl border border-border bg-background p-6 transition-colors hover:border-primary"
                >
                  <span className="font-heading text-3xl font-extrabold text-primary/40">
                    0{index + 1}
                  </span>
                  <h3 className="mt-4 font-heading text-lg font-semibold text-foreground">
                    {adv.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {adv.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          aria-labelledby="reviews-title"
          className="overflow-hidden border-t border-border bg-background py-16 sm:py-20 lg:py-24"
        >
          <div className="mx-auto max-w-[1536px] px-4 sm:px-6 lg:px-10 xl:px-12">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                  Cerita Pelanggan
                </span>
                <h2
                  className="mt-2 font-heading text-3xl font-semibold tracking-tight sm:text-4xl"
                  id="reviews-title"
                >
                  Apa Kata Mereka?
                </h2>
                <p className="mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
                  Ribuan keluarga sudah mempercayakan kebutuhan sayur segar mereka
                  kepada Alkadi. Berikut pengalaman nyata dari pelanggan setia kami.
                </p>
              </div>

              <div className="flex items-center gap-6">
                {!isLoadingReviews && reviews.length > 0 && (
                  <div className="hidden items-center gap-3 sm:flex">
                    <div className="flex size-14 items-center justify-center rounded-2xl bg-amber-500/10">
                      <Star className="size-7 fill-amber-400 text-amber-400" />
                    </div>
                    <div>
                      <p className="font-heading text-2xl font-extrabold text-foreground">
                        {avgRating}
                        <span className="ml-1 text-sm font-normal text-muted-foreground">
                          / 5.0
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {reviews.length} ulasan pelanggan
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <button
                    aria-label="Geser ulasan ke kiri"
                    onClick={scrollLeft}
                    className="flex size-10 items-center justify-center rounded-xl border border-border bg-card text-foreground transition-all hover:border-primary hover:bg-primary/5 hover:text-primary"
                    type="button"
                  >
                    <ChevronLeft className="size-5" />
                  </button>
                  <button
                    aria-label="Geser ulasan ke kanan"
                    onClick={scrollRight}
                    className="flex size-10 items-center justify-center rounded-xl border border-border bg-card text-foreground transition-all hover:border-primary hover:bg-primary/5 hover:text-primary"
                    type="button"
                  >
                    <ChevronRight className="size-5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-10">
              {isLoadingReviews ? (
                <div className="flex gap-5">
                  {Array.from({ length: 4 }, (_, i) => (
                    <Skeleton key={i} className="h-52 w-80 shrink-0 rounded-3xl" />
                  ))}
                </div>
              ) : reviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-3xl border border-border/80 bg-card py-16 text-center">
                  <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Star className="size-8" />
                  </div>
                  <h3 className="mt-4 font-heading text-lg font-bold">
                    Belum Ada Ulasan
                  </h3>
                  <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                    Jadilah yang pertama memberikan ulasan setelah berbelanja di Alkadi!
                  </p>
                  <Button
                    className="mt-5 gap-2"
                    nativeButton={false}
                    render={<Link href="/store/akun/ulasan" />}
                    variant="outline"
                  >
                    Tulis Ulasan
                  </Button>
                </div>
              ) : (
                <div
                  ref={scrollRef}
                  className="flex gap-5 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory"
                  style={{ scrollbarWidth: "none" }}
                >
                  {reviews.map((review) => {
                    const initial =
                      review.user?.name?.trim().charAt(0).toUpperCase() ?? "P";
                    return (
                      <article
                        key={review.id}
                        className="w-80 shrink-0 snap-start rounded-3xl border border-border bg-card p-6 transition-all duration-200 hover:border-primary/50 hover:shadow-lg sm:w-96"
                      >
                        <Quote className="size-7 text-primary/30" />

                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground line-clamp-4">
                          {review.komentar || "Produk sangat segar dan berkualitas. Pelayanan memuaskan!"}
                        </p>

                        <div className="mt-4">
                          <StarRating rating={review.rating} />
                        </div>

                        <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                          <Avatar className="size-10 border border-border">
                            <AvatarFallback className="bg-primary/10 font-bold text-primary">
                              {initial}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {review.user?.name ?? "Pelanggan Alkadi"}
                            </p>
                            {review.created_at && (
                              <p className="text-[11px] text-muted-foreground">
                                {new Date(review.created_at).toLocaleDateString(
                                  "id-ID",
                                  { dateStyle: "medium" },
                                )}
                              </p>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>

            {!isLoadingReviews && reviews.length > 0 && (
              <div className="mt-8 flex justify-center">
                <Button
                  className="gap-2"
                  nativeButton={false}
                  render={<Link href="/store/akun/ulasan" />}
                  variant="outline"
                >
                  Tulis Ulasan Anda
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>

      <StoreFooter />
    </div>
  );
}