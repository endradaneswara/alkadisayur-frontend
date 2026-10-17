"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Banknote,
  BellIcon,
  Building2,
  CheckCircle2,
  CircleUserRoundIcon,
  Compass,
  EllipsisVerticalIcon,
  LogOutIcon,
  Mail,
  MapPin,
  Phone,
  ShieldAlert,
  ShieldCheck,
  Store,
  User,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { toast } from "@/components/ui/toast";
import { formatRupiah } from "@/lib/store-catalog";
import { clearAuthSession, hasAuthSession } from "@/services/api";
import { logout } from "@/services/authService";
import { getProfile } from "@/services/profileService";
import type { PenggunaLogin, RolePengguna } from "@/types";

function RoleBadge({ role }: { role?: RolePengguna }) {
  if (role === "superAdmin") {
    return (
      <Badge className="border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-950/40 dark:text-purple-300">
        <ShieldAlert className="mr-1 size-3" />
        Super Admin
      </Badge>
    );
  }
  if (role === "admin") {
    return (
      <Badge className="border-primary/20 bg-primary/10 text-primary hover:bg-primary/20">
        <ShieldCheck className="mr-1 size-3" />
        Admin Cabang
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-muted-foreground">
      <User className="mr-1 size-3" />
      Customer
    </Badge>
  );
}

export function NavUser({
  user,
  currentUser: initialCurrentUser,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
  currentUser?: PenggunaLogin | null;
}) {
  const router = useRouter();
  const { isMobile } = useSidebar();

  const [profileSheetOpen, setProfileSheetOpen] = React.useState(false);
  const [profileData, setProfileData] = React.useState<PenggunaLogin | null>(
    initialCurrentUser ?? null,
  );
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  React.useEffect(() => {
    if (initialCurrentUser) {
      setProfileData(initialCurrentUser);
    }
  }, [initialCurrentUser]);

  const fetchProfile = React.useCallback(async () => {
    if (!hasAuthSession()) return;
    try {
      const res = await getProfile();
      setProfileData(res.data);
    } catch {
    }
  }, []);

  React.useEffect(() => {
    if (!profileData && hasAuthSession()) {
      void fetchProfile();
    }
  }, [profileData, fetchProfile]);

  const handleOpenProfileSheet = () => {
    void fetchProfile();
    setProfileSheetOpen(true);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      clearAuthSession();
      toast.add({
        title: "Logout berhasil",
        description: "Anda telah keluar dari sesi akun.",
        type: "success",
      });
      router.replace("/store/akun/login");
    } catch {
      clearAuthSession();
      toast.add({
        title: "Sesi berakhir",
        description: "Anda telah keluar dari aplikasi.",
        type: "info",
      });
      router.replace("/store/akun/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const displayName = profileData?.name || user.name;
  const displayEmail = profileData?.email || user.email;
  const displayAvatar = profileData?.avatar || user.avatar;
  const role = profileData?.role;
  const lokasi = profileData?.lokasi;

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <SidebarMenuButton
                  size="lg"
                  className="aria-expanded:bg-muted"
                  aria-label="Menu akun pengguna"
                />
              }
            >
              <Avatar className="size-8 rounded-lg grayscale">
                <AvatarImage src={displayAvatar} alt={displayName} />
                <AvatarFallback className="rounded-lg">
                  {displayName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{displayName}</span>
                <span className="truncate text-xs text-foreground/70">
                  {displayEmail}
                </span>
              </div>
              <EllipsisVerticalIcon className="ml-auto size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="min-w-56"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuGroup>
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="size-8">
                      <AvatarImage src={displayAvatar} alt={displayName} />
                      <AvatarFallback className="rounded-lg">
                        {displayName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">{displayName}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {displayEmail}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={handleOpenProfileSheet}
                  className="cursor-pointer"
                >
                  <CircleUserRoundIcon className="mr-2 size-4" />
                  Akun
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push("/dashboard/notifikasi")}
                  className="cursor-pointer"
                >
                  <BellIcon className="mr-2 size-4" />
                  Notifikasi
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => void handleLogout()}
                disabled={isLoggingOut}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <LogOutIcon className="mr-2 size-4" />
                {isLoggingOut ? "Keluar..." : "Keluar"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <Sheet open={profileSheetOpen} onOpenChange={setProfileSheetOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto p-6">
          <SheetHeader className="mb-6">
            <div className="flex items-center gap-2 text-primary">
              <CircleUserRoundIcon className="size-5" />
              <SheetTitle className="text-lg font-bold">Informasi Akun</SheetTitle>
            </div>
            <SheetDescription className="text-xs text-muted-foreground">
              Detail profil akun dan informasi lokasi cabang toko yang terhubung
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-xs">
              <div className="flex items-center gap-3">
                <Avatar className="size-14 border border-border">
                  <AvatarImage src={displayAvatar} alt={displayName} />
                  <AvatarFallback className="text-base font-semibold">
                    {displayName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h3 className="font-heading text-base font-bold text-foreground">
                    {displayName}
                  </h3>
                  <RoleBadge role={role} />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2.5 pt-2 border-t border-border/80 text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Mail className="size-3.5" />
                    Email
                  </span>
                  <span className="font-medium text-foreground">{displayEmail}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Phone className="size-3.5" />
                    No. Handphone
                  </span>
                  <span className="font-medium text-foreground">
                    {profileData?.no_hp || "-"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <CheckCircle2 className="size-3.5" />
                    Status Akun
                  </span>
                  <Badge variant="outline" className="text-[10px] text-primary border-primary/20 bg-primary/5">
                    Aktif
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Store className="size-4 text-primary" />
                <h4 className="text-sm font-semibold text-foreground">
                  Informasi Lokasi Toko / Cabang
                </h4>
              </div>

              {lokasi ? (
                <div className="flex flex-col gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
                        <MapPin className="size-3.5" />
                      </div>
                      <span className="font-heading font-semibold text-foreground text-sm">
                        {lokasi.nama}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                      Cabang Aktif
                    </Badge>
                  </div>

                  {lokasi.deskripsi && (
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {lokasi.deskripsi}
                    </p>
                  )}

                  <div className="grid grid-cols-1 gap-2 border-t border-primary/10 pt-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Compass className="size-3.5 text-primary" />
                        Koordinat
                      </span>
                      <span className="font-mono text-[11px] text-foreground">
                        {Number(lokasi.latitude).toFixed(4)}, {Number(lokasi.longitude).toFixed(4)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Banknote className="size-3.5 text-primary" />
                        Biaya Pengiriman
                      </span>
                      <span className="font-semibold text-primary">
                        {formatRupiah(lokasi.biaya_pengiriman)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : role === "superAdmin" ? (
                <div className="flex flex-col gap-2.5 rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center gap-2 text-primary">
                    <Building2 className="size-5" />
                    <span className="font-heading font-semibold text-sm text-foreground">
                      Kantor Pusat / Seluruh Cabang
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Sebagai <strong>Super Administrator</strong>, akun Anda memiliki hak akses penuh untuk mengelola dan memantau seluruh cabang toko Alkadi.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setProfileSheetOpen(false);
                      router.push("/dashboard/lokasi");
                    }}
                    className="mt-1 h-8 text-xs border-primary/20 text-primary hover:bg-primary/10 justify-start"
                  >
                    <MapPin className="mr-1.5 size-3.5" />
                    Kelola Semua Lokasi Cabang
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-3 rounded-xl border border-dashed border-border p-4 text-muted-foreground">
                  <AlertCircle className="size-5 text-amber-500 shrink-0" />
                  <div className="text-xs">
                    <p className="font-medium text-foreground">Cabang Belum Dihubungkan</p>
                    <p className="text-muted-foreground text-[11px] mt-0.5">
                      Akun admin ini belum terhubung ke cabang toko tertentu. Hubungi Super Admin untuk penugasan cabang.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => setProfileSheetOpen(false)}
                className="flex-1 text-xs"
              >
                Tutup
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => void handleLogout()}
                disabled={isLoggingOut}
                className="flex-1 text-xs gap-1.5"
              >
                <LogOutIcon className="size-3.5" />
                {isLoggingOut ? "Keluar..." : "Keluar Akun"}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
