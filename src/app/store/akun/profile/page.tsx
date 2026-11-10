"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Bell,
  CalendarCheck,
  ClipboardList,
  Edit3,
  Mail,
  Phone,
  Shield,
} from "lucide-react";

import { ProfileEditSheet } from "@/components/profile-edit-sheet";
import { ProfileAddressManager } from "@/components/profile-address-manager";
import { StoreAccountNav } from "@/components/store-account-nav";
import { StorePageShell } from "@/components/store-page-shell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";

function formatVerifiedDate(value: string | null | undefined): string {
  if (!value) return "Belum terverifikasi";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Belum terverifikasi";
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function ProfilePage() {
  const { currentUser, isLoading, refreshProfile } = useAuth();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const initial = currentUser?.name?.trim().charAt(0).toUpperCase() ?? "U";

  return (
    <StorePageShell>
      <div className="w-full">
        <StoreAccountNav
          title="Profile Saya"
          description="Kelola informasi profil, kontak aktif, dan preferensi akun belanja Anda di Alkadi."
        />

        {isLoading ? (
          <div className="flex flex-col gap-6">
            <Skeleton className="h-64 w-full rounded-3xl" />
            <Skeleton className="h-48 w-full rounded-3xl" />
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            {/* Kartu Profil Utama Lebar Penuh */}
            <Card className="overflow-hidden border border-border/80 shadow-xs">
              {/* Cover Banner */}
              <div className="h-32" />

              <div className="relative px-6 pb-6 sm:px-8">
                {/* Avatar Mengambang */}
                <div className="flex flex-wrap items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-6">
                  <Avatar className="size-28 border-4 border-background bg-card shadow-lg sm:size-32">
                    <AvatarImage
                      alt={currentUser?.name ?? "User avatar"}
                      src={currentUser?.avatar ?? undefined}
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
                    <div>
                      <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
                        {currentUser?.name ?? "Pelanggan Alkadi"}
                      </h2>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {currentUser?.email ?? "-"}
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
                        {currentUser?.email ?? "-"}
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
                        {currentUser?.no_hp ?? "Belum ditambahkan"}
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
                        {currentUser?.role === "superAdmin"
                          ? "Super Administrator"
                          : currentUser?.role === "admin"
                          ? "Administrator"
                          : "Pengguna Terverifikasi"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5 rounded-2xl border border-border/80 bg-muted/20 p-4 transition-colors hover:border-primary/40">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <CalendarCheck className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Tanggal Bergabung</p>
                      <p className="font-semibold text-sm text-foreground">
                        {formatVerifiedDate(currentUser?.email_verified_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Kelola Alamat Pengiriman Pengguna */}
            <ProfileAddressManager />

          </div>
        )}

        {/* Modal Sheet Edit Profile */}
        {!isLoading && currentUser ? (
          <ProfileEditSheet
            open={isSheetOpen}
            onOpenChange={setIsSheetOpen}
            user={currentUser}
            onSave={() => void refreshProfile()}
          />
        ) : null}
      </div>
    </StorePageShell>
  );
}
