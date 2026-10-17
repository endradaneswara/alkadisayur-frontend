"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Calendar,
  CheckCircle2,
  ClipboardList,
  Edit3,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Shield,
  UserRound,
} from "lucide-react";

import { ProfileEditSheet } from "@/components/profile-edit-sheet";
import { StoreAccountNav } from "@/components/store-account-nav";
import { StorePageShell } from "@/components/store-page-shell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getProfile } from "@/services/profileService";
import type { PenggunaLogin } from "@/types";

export default function ProfilePage() {
  const [user, setUser] = useState<PenggunaLogin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    let isCurrent = true;

    void getProfile()
      .then((response) => {
        if (isCurrent) {
          setUser(response.data);
        }
      })
      .catch((error: unknown) => {
        console.error("Gagal memuat profil pengguna.", error);
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

  const initial = user?.name?.trim().charAt(0).toUpperCase() ?? "U";

  return (
    <StorePageShell>
      <div className="w-full">
        <StoreAccountNav
          title="Profil Saya"
          badge="Informasi Akun"
          description="Kelola informasi profil, kontak aktif, dan preferensi akun belanja Anda di Alkadi."
          action={
            <Button
              onClick={() => setIsSheetOpen(true)}
              type="button"
              className="gap-2"
            >
              <Edit3 className="size-4" />
              Edit Profil
            </Button>
          }
        />

        {isLoading ? (
          <div className="flex flex-col gap-6">
            <Skeleton className="h-64 w-full rounded-3xl" />
            <Skeleton className="h-48 w-full rounded-3xl" />
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {/* Kartu Profil Utama Lebar Penuh */}
            <Card className="overflow-hidden border border-border/80 shadow-xs">
              {/* Cover Banner */}
              <div className="h-32 bg-gradient-to-r from-primary/30 via-emerald-500/20 to-primary/10 sm:h-40" />

              <div className="relative px-6 pb-6 sm:px-8">
                {/* Avatar Mengambang */}
                <div className="flex flex-wrap items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-6">
                  <Avatar className="size-28 border-4 border-background bg-card shadow-lg sm:size-32">
                    <AvatarImage
                      alt={user?.name ?? "User avatar"}
                      src={user?.avatar ?? undefined}
                    />
                    <AvatarFallback className="bg-primary/10 text-3xl font-bold text-primary">
                      {initial}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setIsSheetOpen(true)}
                      className="gap-2"
                    >
                      <Edit3 className="size-4" />
                      Ubah Data
                    </Button>
                  </div>
                </div>

                {/* Info Identitas */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
                        {user?.name ?? "Pelanggan Alkadi"}
                      </h2>
                      <Badge className="bg-primary/10 text-primary border border-primary/20 capitalize font-semibold">
                        <CheckCircle2 className="mr-1 size-3" />
                        {user?.role ?? "Customer"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {user?.email ?? "-"}
                    </p>
                  </div>
                </div>

                {/* Grid Detail Info Akun */}
                <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="flex items-center gap-3.5 rounded-2xl border border-border/80 bg-muted/20 p-4 transition-colors hover:border-primary/40">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Mail className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Alamat Email</p>
                      <p className="font-semibold text-sm truncate text-foreground">
                        {user?.email ?? "-"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5 rounded-2xl border border-border/80 bg-muted/20 p-4 transition-colors hover:border-primary/40">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Phone className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Nomor Telepon / WA</p>
                      <p className="font-semibold text-sm truncate text-foreground">
                        {user?.no_hp ?? "Belum ditambahkan"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5 rounded-2xl border border-border/80 bg-muted/20 p-4 transition-colors hover:border-primary/40">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Shield className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Status Akun</p>
                      <p className="font-semibold text-sm capitalize text-foreground">
                        {user?.role === "superAdmin"
                          ? "Super Administrator"
                          : user?.role === "admin"
                          ? "Administrator"
                          : "Pengguna Terverifikasi"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5 rounded-2xl border border-border/80 bg-muted/20 p-4 transition-colors hover:border-primary/40">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Calendar className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Bergabung Sejak</p>
                      <p className="font-semibold text-sm text-foreground">
                        Aktif
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Pintasan Fitur Akun Lainnya (Kartu Akses Cepat Lebar) */}
            <div>
              <h3 className="mb-4 font-heading text-lg font-bold text-foreground">
                Pintasan Fitur Akun
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Link
                  href="/store/pesanan"
                  className="flex items-center justify-between rounded-2xl border border-border/80 bg-card p-5 transition-all duration-200 hover:border-primary hover:shadow-md"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                      <ClipboardList className="size-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Pesanan Saya</h4>
                      <p className="text-xs text-muted-foreground">
                        Lihat status dan riwayat transaksi
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-primary">Buka →</span>
                </Link>

                <Link
                  href="/store/akun/alamat"
                  className="flex items-center justify-between rounded-2xl border border-border/80 bg-card p-5 transition-all duration-200 hover:border-primary hover:shadow-md"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                      <MapPin className="size-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Daftar Alamat</h4>
                      <p className="text-xs text-muted-foreground">
                        Atur alamat tujuan pengiriman
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-primary">Buka →</span>
                </Link>

                <Link
                  href="/store/akun/ulasan"
                  className="flex items-center justify-between rounded-2xl border border-border/80 bg-card p-5 transition-all duration-200 hover:border-primary hover:shadow-md"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                      <MessageSquare className="size-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Ulasan Toko</h4>
                      <p className="text-xs text-muted-foreground">
                        Bagikan penilaian dan pengalaman Anda
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-primary">Buka →</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Modal Sheet Edit Profile */}
        {!isLoading && user ? (
          <ProfileEditSheet
            open={isSheetOpen}
            onOpenChange={setIsSheetOpen}
            user={user}
            onSave={setUser}
          />
        ) : null}
      </div>
    </StorePageShell>
  );
}
