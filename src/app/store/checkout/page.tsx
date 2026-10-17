"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, MapPin, PackageCheck } from "lucide-react";

import { StorePageShell } from "@/components/store-page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { formatRupiah, getErrorMessage } from "@/lib/store-catalog";
import { hasAuthSession } from "@/services/api";
import { listAlamat } from "@/services/alamatService";
import { getKeranjang } from "@/services/keranjangService";
import { listLokasi } from "@/services/lokasiService";
import { createPembayaran } from "@/services/pembayaranService";
import { createPesanan } from "@/services/pesananService";
import type {
  Alamat,
  Keranjang,
  Lokasi,
  MetodePembayaran,
  MetodePesanan,
} from "@/types";

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Keranjang | null>(null);
  const [addresses, setAddresses] = useState<Alamat[]>([]);
  const [locations, setLocations] = useState<Lokasi[]>([]);
  const [method, setMethod] = useState<MetodePesanan>("pesan_antar");
  const [addressId, setAddressId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<MetodePembayaran>("COD");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdOrderId, setCreatedOrderId] = useState<number | null>(null);

  useEffect(() => {
    if (!hasAuthSession()) {
      router.replace("/store/akun/login");
      return;
    }

    let isCurrent = true;
    void Promise.all([getKeranjang(), listAlamat({ page: 1 }), listLokasi({ page: 1 })])
      .then(([cartResponse, addressResponse, locationResponse]) => {
        if (!isCurrent) {
          return;
        }

        setCart(cartResponse.data);
        setAddresses(addressResponse.data);
        setLocations(locationResponse.data);
        setAddressId(addressResponse.data[0] ? String(addressResponse.data[0].id) : "");
        setLocationId(locationResponse.data[0] ? String(locationResponse.data[0].id) : "");
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
  }, [router]);

  const selectedLocation = locations.find(
    (location) => String(location.id) === locationId,
  );
  const deliveryFee =
    method === "pesan_antar" ? Number(selectedLocation?.biaya_pengiriman ?? 0) : 0;
  const total = Number(cart?.total_harga ?? 0) + deliveryFee;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);

    if (!cart || cart.items.length === 0) {
      setError("Keranjang Anda kosong. Tambahkan produk sebelum checkout.");
      return;
    }
    if (!locationId) {
      setError("Pilih lokasi toko untuk memproses pesanan.");
      return;
    }
    if (method === "pesan_antar" && !addressId) {
      setError("Pilih alamat pengiriman atau tambahkan alamat baru.");
      return;
    }

    setIsSubmitting(true);
    try {
      const orderResponse = await createPesanan({
        metode: method,
        lokasi_toko_id: Number(locationId),
        alamat_id: method === "pesan_antar" ? Number(addressId) : null,
        catatan: notes.trim() || null,
      });
      setCreatedOrderId(orderResponse.data.id);

      try {
        await createPembayaran({
          pesanan_id: orderResponse.data.id,
          metode_pembayaran: paymentMethod,
        });
      } catch (paymentError: unknown) {
        const message = `Pesanan berhasil dibuat, tetapi pencatatan pembayaran gagal: ${getErrorMessage(paymentError)}`;
        setError(message);
        toast.add({
          title: "Pesanan dibuat, pembayaran belum tercatat",
          description: getErrorMessage(paymentError),
          type: "error",
        });
        return;
      }

      toast.add({
        title: "Pesanan berhasil dibuat",
        description: "Detail dan status pesanan dapat dilihat pada halaman pesanan.",
        type: "success",
      });
      router.push(`/store/pesanan/${orderResponse.data.id}`);
    } catch (submitError: unknown) {
      const message = getErrorMessage(submitError);
      setError(message);
      toast.add({
        title: "Checkout gagal",
        description: message,
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (createdOrderId !== null) {
    return (
      <StorePageShell>
        <Card className="mx-auto max-w-xl">
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <PackageCheck aria-hidden="true" className="size-12 text-primary" />
            <h1 className="font-heading text-2xl font-semibold">
              Pesanan berhasil dibuat
            </h1>
            <p className="text-sm leading-6 text-muted-foreground">{error}</p>
            <Button
              nativeButton={false}
              render={<Link href={`/store/pesanan/${createdOrderId}`} />}
            >
              Lihat pesanan
            </Button>
          </CardContent>
        </Card>
      </StorePageShell>
    );
  }

  return (
    <StorePageShell>
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <Button
          className="w-fit"
          nativeButton={false}
          render={<Link href="/store/keranjang" />}
          variant="ghost"
        >
          <ArrowLeft aria-hidden="true" data-icon="inline-start" />
          Kembali ke keranjang
        </Button>
        <header>
          <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight">
            Checkout
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Pilih cara menerima pesanan dan metode pembayaran.
          </p>
        </header>

        {error ? (
          <p className="rounded-xl border border-destructive/30 bg-card px-4 py-3 text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        {!isLoading && !error && locations.length === 0 ? (
          <p className="rounded-xl border border-destructive/30 bg-card px-4 py-3 text-sm text-destructive" role="alert">
            Checkout belum tersedia karena belum ada lokasi toko yang dapat dipilih.
          </p>
        ) : null}

        {isLoading ? (
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <Skeleton className="h-96 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
        ) : null}

        {!isLoading && !error && cart?.items.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
              <p>Keranjang Anda kosong.</p>
              <Button nativeButton={false} render={<Link href="/store/produk" />}>
                Pilih produk
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {!isLoading && cart && cart.items.length > 0 ? (
          <form className="grid items-start gap-6 lg:grid-cols-[1fr_320px]" onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Informasi pesanan</CardTitle>
              </CardHeader>
              <CardContent>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="checkout-method">Cara menerima pesanan</FieldLabel>
                    <Select
                      items={[
                        { label: "Pesan antar", value: "pesan_antar" },
                        { label: "Ambil di toko", value: "ambil_ditoko" },
                      ]}
                      onValueChange={(value) => {
                        if (value === "pesan_antar" || value === "ambil_ditoko") {
                          setMethod(value);
                        }
                      }}
                      value={method}
                    >
                      <SelectTrigger aria-label="Cara menerima pesanan" id="checkout-method">
                        <SelectValue placeholder="Pilih cara menerima" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="pesan_antar">Pesan antar</SelectItem>
                          <SelectItem value="ambil_ditoko">Ambil di toko</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="checkout-location">Lokasi toko</FieldLabel>
                    <Select
                      items={locations.map((location) => ({
                        label: location.nama,
                        value: String(location.id),
                      }))}
                      onValueChange={(value) => setLocationId(value ?? "")}
                      value={locationId}
                    >
                      <SelectTrigger aria-label="Lokasi toko" id="checkout-location">
                        <SelectValue placeholder="Pilih lokasi toko" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {locations.map((location) => (
                            <SelectItem key={location.id} value={String(location.id)}>
                              {location.nama}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {selectedLocation ? (
                      <FieldDescription className="flex items-center gap-1">
                        <MapPin aria-hidden="true" className="size-3" />
                        {selectedLocation.deskripsi || "Lokasi toko Alkadi"}
                      </FieldDescription>
                    ) : null}
                  </Field>

                  {method === "pesan_antar" ? (
                    <Field>
                      <div className="flex items-center justify-between gap-3">
                        <FieldLabel htmlFor="checkout-address">Alamat pengiriman</FieldLabel>
                        <Link className="text-sm text-primary hover:underline" href="/store/akun/alamat">
                          Kelola alamat
                        </Link>
                      </div>
                      {addresses.length > 0 ? (
                        <Select
                          items={addresses.map((address) => ({
                            label: `${address.nama_alamat} — ${address.nama_penerima}`,
                            value: String(address.id),
                          }))}
                          onValueChange={(value) => setAddressId(value ?? "")}
                          value={addressId}
                        >
                          <SelectTrigger aria-label="Alamat pengiriman" id="checkout-address">
                            <SelectValue placeholder="Pilih alamat" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {addresses.map((address) => (
                                <SelectItem key={address.id} value={String(address.id)}>
                                  {address.nama_alamat} — {address.nama_penerima}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                          Anda belum menyimpan alamat pengiriman.
                          <Button
                            className="mt-3"
                            nativeButton={false}
                            render={<Link href="/store/akun/alamat" />}
                            size="sm"
                            variant="outline"
                          >
                            Tambah alamat
                          </Button>
                        </div>
                      )}
                      {addressId ? (
                        <FieldDescription>
                          {addresses.find((address) => String(address.id) === addressId)?.alamat_lengkap}
                        </FieldDescription>
                      ) : null}
                    </Field>
                  ) : null}

                  <Field>
                    <FieldLabel htmlFor="checkout-payment">Metode pembayaran</FieldLabel>
                    <Select
                      items={[
                        { label: "Bayar di tempat (COD)", value: "COD" },
                        { label: "Transfer", value: "Transfer" },
                        { label: "QRIS", value: "QRIS" },
                      ]}
                      onValueChange={(value) => {
                        if (value === "COD" || value === "Transfer" || value === "QRIS") {
                          setPaymentMethod(value);
                        }
                      }}
                      value={paymentMethod}
                    >
                      <SelectTrigger aria-label="Metode pembayaran" id="checkout-payment">
                        <SelectValue placeholder="Pilih metode pembayaran" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="COD">Bayar di tempat (COD)</SelectItem>
                          <SelectItem value="Transfer">Transfer</SelectItem>
                          <SelectItem value="QRIS">QRIS</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FieldDescription>
                      Pembayaran dicatat dengan status menunggu. Instruksi pembayaran
                      atau konfirmasi akan diberikan oleh pihak toko.
                    </FieldDescription>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="checkout-notes">Catatan pesanan (opsional)</FieldLabel>
                    <Input
                      id="checkout-notes"
                      maxLength={1000}
                      onChange={(event) => setNotes(event.target.value)}
                      placeholder="Contoh: pilih sayur yang masih segar"
                      value={notes}
                    />
                  </Field>
                </FieldGroup>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ringkasan pesanan</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {cart.items.map((item) => (
                  <div className="flex justify-between gap-3 text-sm" key={item.id}>
                    <span className="min-w-0 text-muted-foreground">
                      {item.nama_barang} × {item.jumlah}
                    </span>
                    <span className="shrink-0">{formatRupiah(item.subtotal)}</span>
                  </div>
                ))}
                <div className="flex justify-between border-t pt-3 text-sm">
                  <span>Subtotal</span>
                  <span>{formatRupiah(cart.total_harga)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Biaya pengiriman</span>
                  <span>{formatRupiah(deliveryFee)}</span>
                </div>
                <div className="flex justify-between border-t pt-3 font-semibold">
                  <span>Total</span>
                  <span>{formatRupiah(total)}</span>
                </div>
                <Button disabled={isSubmitting || !locations.length || (method === "pesan_antar" && !addresses.length)} type="submit">
                  {isSubmitting ? "Memproses pesanan..." : "Buat pesanan"}
                </Button>
              </CardContent>
            </Card>
          </form>
        ) : null}
      </div>
    </StorePageShell>
  );
}