"use client";

import { useEffect, useState } from "react";
import { Mail, Phone, UserRound } from "lucide-react";

import { ProfileEditSheet } from "@/components/profile-edit-sheet";
import { StoreFooter } from "@/components/store-footer";
import { StoreNavbar } from "@/components/store-navbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <StoreNavbar />
      <main className="flex-1">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Akun Saya
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
                Profil
              </h1>
            </div>

            <Button onClick={() => setIsSheetOpen(true)} type="button">
              Edit profile
            </Button>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center gap-4 pb-4">
              <Avatar className="size-16 border border-border bg-muted">
                <AvatarImage
                  alt={user?.name ?? "User avatar"}
                  src={user?.avatar ?? undefined}
                />
                <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">
                  {initial}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-1">
                <CardTitle className="text-2xl">
                  {user?.name ?? "Memuat..."}
                </CardTitle>
                <CardDescription>
                  {user?.email ?? "Mengambil data akun..."}
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
                <Mail className="text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user?.email ?? "-"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
                <Phone className="text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Nomor HP</p>
                  <p className="font-medium">{user?.no_hp ?? "Belum diisi"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3 md:col-span-2">
                <UserRound className="text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Role</p>
                  <p className="font-medium capitalize">{user?.role ?? "-"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {!isLoading ? (
            <ProfileEditSheet
              open={isSheetOpen}
              onOpenChange={setIsSheetOpen}
              user={user}
              onSave={setUser}
            />
          ) : null}
        </div>
      </main>
      <StoreFooter />
    </div>
  );
}
