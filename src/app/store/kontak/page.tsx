"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  HelpCircle,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  Sparkles,
  Store,
} from "lucide-react";
import { StoreFooter } from "@/components/store-footer";
import { StoreNavbar } from "@/components/store-navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { getErrorMessage } from "@/lib/store-catalog";
import { listLokasi } from "@/services/lokasiService";
import type { Lokasi } from "@/types";

const faqList = [
  {
    q: "Apakah pesanan bisa dikirim di hari yang sama (Same-Day Delivery)?",
    a: "Ya! Pesanan yang masuk sebelum pukul 15.00 WIB akan dikirim pada hari yang sama menggunakan kurir instan atau pengantaran reguler Alkadi.",
  },
  {
    q: "Bagaimana jika sayur yang saya terima tidak segar?",
    a: "Alkadi memberikan Garansi Kesegaran 100%. Cukup foto produk dan hubungi WhatsApp kami dalam 1x24 jam, kami siap mengganti atau mengembalikan dana.",
  },
  {
    q: "Apakah toko fisik buka setiap hari termasuk hari libur nasional?",
    a: "Benar, toko fisik kami beroperasi setiap hari dari pukul 06.00 hingga 23.00 WIB demi memenuhi kebutuhan sayur segar keluarga Anda kapan saja.",
  },
  {
    q: "Bagaimana cara melakukan pemesanan partai besar atau untuk katering/restoran?",
    a: "Silakan hubungi WhatsApp kami dengan memilih peruntukan B2B/Katering untuk mendapatkan penawaran harga grosir khusus dan jadwal suplai rutin.",
  },
];

export default function ContactPage() {
  const [locations, setLocations] = useState<Lokasi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [subject, setSubject] = useState("Pertanyaan Produk");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

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

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !contactInfo.trim() || !message.trim()) return;

    setIsSubmitting(true);
    // Simulasi pengiriman dan siapkan opsi redirect ke WhatsApp
    setTimeout(() => {
      setIsSubmitting(false);
      setFormSubmitted(true);
    }, 800);
  }

  function handleSendViaWhatsApp() {
    const text = `Halo Alkadi,\nNama: ${name || "Pelanggan"}\nKontak: ${contactInfo || "-"}\nSubjek: ${subject}\nPesan: ${message || "Halo, saya ingin bertanya tentang layanan Alkadi."}`;
    const url = `https://wa.me/6281215770290?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  }

  return (
    <div className="store-landing min-h-screen bg-background text-foreground">
      <StoreNavbar />

      <main>
        <section
          aria-labelledby="contact-hero-title"
          className="store-hero relative isolate -mt-[76px] flex min-h-[600px] items-center overflow-hidden sm:min-h-[680px] lg:min-h-[720px]"
        >
          <div className="store-hero-background" aria-hidden="true">
            <Image
              alt="Hubungi Toko Alkadi"
              className="object-cover"
              fill
              priority
              sizes="100vw"
              src="/toko6.webp"
            />
          </div>

          <div className="mx-auto grid w-full max-w-[1536px] items-center gap-12 px-4 pt-28 pb-14 sm:px-6 sm:pt-36 sm:pb-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:px-10 lg:pt-40 lg:pb-24 xl:px-12">
            <div className="store-enter flex flex-col items-start">
              <h1
                className="mt-4 max-w-2xl font-heading text-4xl leading-[1.08] font-semibold tracking-[-0.04em] text-primary sm:text-5xl lg:text-6xl"
                id="contact-hero-title"
              >
                Kami Siap Membantu
                <br />
                <span className="text-foreground">Kapan Saja Anda Butuhkan.</span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-7 text-foreground sm:text-lg sm:leading-8">
                Punya pertanyaan mengenai stok sayur, konfirmasi pesanan,
                kemitraan pasokan, atau alamat toko kami? Tim layanan pelanggan
                Alkadi selalu siap menyapa Anda.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button
                  className="h-11 bg-emerald-600 hover:bg-emerald-700 text-white px-5"
                  nativeButton={false}
                  render={
                    <a
                      href="https://wa.me/6281215770290?text=Halo%20Alkadi,%20saya%20ingin%20bertanya%20tentang%20produk%20dan%20layanan%20Alkadi."
                      rel="noreferrer"
                      target="_blank"
                    />
                  }
                  size="lg"
                >
                  <MessageCircle aria-hidden="true" data-icon="inline-start" />
                  Chat WhatsApp Sekarang
                </Button>
                <Button
                  className="h-11 px-5"
                  nativeButton={false}
                  render={<a href="#formulir-pesan" />}
                  size="lg"
                  variant="outline"
                >
                  Kirim Formulir Pesan
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1536px] px-4 py-16 sm:px-6 sm:py-20 lg:px-10 xl:px-12">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="flex flex-col border border-border p-6 transition-all hover:border-primary hover:shadow-md">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
                <MessageCircle className="size-6" />
              </span>
              <h3 className="mt-5 font-heading text-xl font-bold">
                WhatsApp & Telepon
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Konsultasikan pesanan sayur, ketersediaan stok produk, atau
                komplain secara langsung dengan tim customer care kami.
              </p>
              <div className="mt-auto pt-6 border-t border-border">
                <a
                  className="block text-lg font-bold text-emerald-600 hover:underline"
                  href="https://wa.me/6281215770290"
                  rel="noreferrer"
                  target="_blank"
                >
                  0812-1577-0290
                </a>
                <p className="mt-1 text-xs text-muted-foreground">
                  Klik untuk langsung chat di WhatsApp
                </p>
              </div>
            </Card>

            <Card className="flex flex-col border border-border p-6 transition-all hover:border-primary hover:shadow-md">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <MapPin className="size-6" />
              </span>
              <h3 className="mt-5 font-heading text-xl font-bold">
                Alamat Toko Cabang
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Kunjungi gerai toko kami untuk memilih langsung aneka sayuran segar
                dan kebutuhan dapur keluarga dengan suasana yang nyaman.
              </p>
              <div className="mt-auto pt-6 border-t border-border">
                <p className="text-sm font-semibold">Toko Alkadi</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Jl. Sokka Petanahan, Widarapayung, Kedawung, Pejagoan, Kebumen
                </p>
                <Link
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                  href="/store/lokasi"
                >
                  <Store className="size-3.5" />
                  Lihat Semua Cabang & Peta
                </Link>
              </div>
            </Card>

            <Card className="flex flex-col border border-border p-6 transition-all hover:border-primary hover:shadow-md">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600">
                <Clock className="size-6" />
              </span>
              <h3 className="mt-5 font-heading text-xl font-bold">
                Jam Operasional
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Kami siap menyambut Anda dari pagi buta saat sayur baru dipetik
                hingga malam hari setiap harinya.
              </p>
              <div className="mt-auto pt-6 border-t border-border space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Toko Buka:</span>
                  <span className="font-semibold text-foreground">
                    Senin – Minggu, 06.00 – 23.00
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pengantaran:</span>
                  <span className="font-semibold text-foreground">
                    07.00 – 20.00 WIB
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Layanan CS:</span>
                  <span className="font-semibold text-foreground">
                    07.00 – 22.00 WIB
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </section>

        <section
          id="formulir-pesan"
          aria-labelledby="form-section-title"
          className="border-y border-border bg-card py-16 sm:py-20 lg:py-24"
        >
          <div className="mx-auto max-w-[1536px] px-4 sm:px-6 lg:px-10 xl:px-12">
            <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                  Formulir Pesan
                </span>
                <h2
                  className="mt-2 font-heading text-3xl font-semibold tracking-tight sm:text-4xl"
                  id="form-section-title"
                >
                  Kirim Pertanyaan atau Masukan untuk Kami
                </h2>
                <p className="mt-4 text-base text-muted-foreground">
                  Isi formulir di samping untuk mengirimkan pesan, pertanyaan stok,
                  kerja sama kemitraan sayur mayur, atau saran pengembangan toko
                  Alkadi.
                </p>

                <div className="mt-8 space-y-4">
                  <div className="flex items-start gap-3 rounded-2xl border border-border bg-background p-4">
                    <CheckCircle2 className="mt-1 size-5 shrink-0 text-emerald-600" />
                    <div>
                      <h4 className="text-sm font-semibold">Tanggapan Cepat</h4>
                      <p className="text-xs text-muted-foreground">
                        Pesan Anda akan ditanggapi oleh tim kami dalam waktu maksimal 1x24 jam.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-2xl border border-border bg-background p-4">
                    <MessageCircle className="mt-1 size-5 shrink-0 text-primary" />
                    <div>
                      <h4 className="text-sm font-semibold">Terhubung Langsung</h4>
                      <p className="text-xs text-muted-foreground">
                        Anda juga dapat langsung meneruskan pesan yang ditulis ke nomor WhatsApp resmi kami.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <h4 className="text-sm font-semibold text-foreground mb-3">
                    Lokasi Toko Terdaftar:
                  </h4>
                  {isLoading ? (
                    <Skeleton className="h-24 w-full rounded-xl" />
                  ) : locations.length > 0 ? (
                    <div className="space-y-2">
                      {locations.slice(0, 3).map((loc) => (
                        <div
                          key={loc.id}
                          className="flex items-center justify-between rounded-xl border border-border bg-background p-3 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <MapPin className="size-4 text-primary" />
                            <span className="font-medium">{loc.nama}</span>
                          </div>
                          <a
                            className="font-semibold text-primary hover:underline"
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                              `${loc.latitude},${loc.longitude}`,
                            )}`}
                            rel="noreferrer"
                            target="_blank"
                          >
                            Peta
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Kunjungi halaman <Link className="text-primary underline" href="/store/lokasi">Lokasi Cabang</Link> untuk melihat seluruh gerai Alkadi.
                    </p>
                  )}
                </div>
              </div>
              <div className="rounded-3xl border border-border bg-background p-6 sm:p-10 shadow-lg">
                {formSubmitted ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <span className="flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                      <CheckCircle2 className="size-8" />
                    </span>
                    <h3 className="mt-4 font-heading text-2xl font-bold">
                      Pesan Berhasil Dikirim!
                    </h3>
                    <p className="mt-2 max-w-md text-sm text-muted-foreground">
                      Terima kasih, {name}. Tim Alkadi telah menerima pesan Anda dan
                      akan segera menghubungi melalui {contactInfo}.
                    </p>
                    <div className="mt-6 flex flex-wrap justify-center gap-3">
                      <Button
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={handleSendViaWhatsApp}
                      >
                        <MessageCircle aria-hidden="true" data-icon="inline-start" />
                        Lanjutkan di WhatsApp
                      </Button>
                      <Button
                        onClick={() => {
                          setFormSubmitted(false);
                          setName("");
                          setContactInfo("");
                          setMessage("");
                        }}
                        variant="outline"
                      >
                        Kirim Pesan Lain
                      </Button>
                    </div>
                  </div>
                ) : (
                  <form className="space-y-5" onSubmit={handleFormSubmit}>
                    <div>
                      <Label htmlFor="contact-name">Nama Lengkap</Label>
                      <Input
                        id="contact-name"
                        className="mt-1.5"
                        placeholder="Masukkan nama Anda..."
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="contact-info">Nomor WhatsApp atau Email</Label>
                      <Input
                        id="contact-info"
                        className="mt-1.5"
                        placeholder="Contoh: 0812xxxxxxxx atau nama@email.com"
                        required
                        value={contactInfo}
                        onChange={(e) => setContactInfo(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="contact-subject">Kategori Pertanyaan</Label>
                      <select
                        id="contact-subject"
                        className="mt-1.5 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                        value={subject}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSubject(e.target.value)}
                      >
                        <option value="Pertanyaan Produk & Ketersediaan Stok">
                          Pertanyaan Produk & Ketersediaan Stok
                        </option>
                        <option value="Konfirmasi & Status Pesanan">
                          Konfirmasi & Status Pesanan
                        </option>
                        <option value="Kemitraan Petani / Supplier Sayur">
                          Kemitraan Petani / Supplier Sayur
                        </option>
                        <option value="Pemesanan Skala Besar (B2B/Katering)">
                          Pemesanan Skala Besar (B2B/Katering)
                        </option>
                        <option value="Saran, Masukan & Komplain">
                          Saran, Masukan & Komplain
                        </option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="contact-message">Pesan Anda</Label>
                      <Textarea
                        id="contact-message"
                        className="mt-1.5 min-h-[120px]"
                        placeholder="Tuliskan pertanyaan atau informasi yang ingin Anda tanyakan..."
                        required
                        value={message}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
                      />
                    </div>

                    <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                      <Button
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        size="lg"
                        type="button"
                        onClick={handleSendViaWhatsApp}
                      >
                        <MessageCircle aria-hidden="true" data-icon="inline-start" />
                        Kirim via WA
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

        <section
          aria-labelledby="faq-title"
          className="mx-auto max-w-[1536px] px-4 py-16 sm:px-6 sm:py-20 lg:px-10 lg:py-24 xl:px-12"
        >
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Tanya Jawab
            </span>
            <h2
              className="mt-2 font-heading text-3xl font-semibold tracking-tight sm:text-4xl"
              id="faq-title"
            >
              Pertanyaan yang Sering Diajukan
            </h2>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
              Jawaban cepat untuk pertanyaan seputar pemesanan sayur, jam buka,
              dan layanan garansi mutu di Alkadi.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {faqList.map((item) => (
              <Card key={item.q} className="border border-border p-6">
                <div className="flex items-start gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <HelpCircle className="size-4" />
                  </span>
                  <div>
                    <h3 className="font-heading text-base font-bold text-foreground">
                      {item.q}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {item.a}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <StoreFooter />
    </div>
  );
}