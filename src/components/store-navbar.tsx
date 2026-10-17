"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bell,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  MapPin,
  MessageSquare,
  Menu,
  ShoppingCart,
  UserRound,
  X,
  Vegan,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { toast } from "@/components/ui/toast";
import { storeLinks } from "@/lib/store-links";
import { clearAuthSession, hasAuthSession } from "@/services/api";
import { logout } from "@/services/authService";
import { getProfile } from "@/services/profileService";
import { cn } from "@/lib/utils";
import type { PenggunaLogin } from "@/types";

interface StoreNavbarProps {
  cartCount?: number;
  className?: string;
}

export function StoreNavbar({
  cartCount = 0,
  className,
}: StoreNavbarProps) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<PenggunaLogin | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const [authStatus, setAuthStatus] = useState<
    "checking" | "guest" | "authenticated"
  >("checking");

  useEffect(() => {
    let isCurrent = true;

    void Promise.resolve().then(() => {
      if (!hasAuthSession()) {
        if (isCurrent) {
          setAuthStatus("guest");
        }
        return;
      }

      return getProfile()
        .then((response) => {
          if (isCurrent) {
            setCurrentUser(response.data);
            setAuthStatus("authenticated");
          }
        })
        .catch((error: unknown) => {
          if (!isCurrent) {
            return;
          }

          if (!hasAuthSession()) {
            setAuthStatus("guest");
            return;
          }

          console.error("Gagal memuat profil pengguna.", error);
          setAuthStatus("authenticated");
        });
    });

    return () => {
      isCurrent = false;
    };
  }, []);

  async function handleLogout(): Promise<void> {
    setIsSigningOut(true);
    setLogoutError(null);

    try {
      await logout();
      setCurrentUser(null);
      setAuthStatus("guest");
      setMobileMenuOpen(false);
      toast.add({
        title: "Logout berhasil",
        description: "Anda telah keluar dari akun.",
        type: "success",
      });
      router.replace("/store");
    } catch (error: unknown) {
      console.error("Gagal keluar dari akun.", error);

      if (!hasAuthSession()) {
        setCurrentUser(null);
        setAuthStatus("guest");
        clearAuthSession();
        toast.add({
          title: "Sesi berakhir",
          description: "Silakan login kembali untuk melanjutkan.",
          type: "error",
        });
        router.replace("/store/akun/login");
        return;
      }

      const message =
        error instanceof Error
          ? error.message
          : "Gagal keluar dari akun. Silakan coba lagi.";
      setLogoutError(message);
      toast.add({
        title: "Logout gagal",
        description: message,
        type: "error",
      });
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-black/10 bg-white/40 backdrop-blur-md",
        className,
      )}
    >
      <div className="mx-auto flex h-[76px] max-w-[1536px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-10 xl:px-12">
        <Link
          aria-label="Alkadi Sayur, beranda"
          className="flex shrink-0 items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          href="/store"
          onClick={() => setMobileMenuOpen(false)}
        >
          <span className="flex flex-col">
            <span className="flex items-center gap-2 font-heading text-lg leading-none font-bold tracking-tight text-primary">
              <Vegan className="size-6" />
              Alkadi
            </span>
          </span>
        </Link>

        <nav
          aria-label="Navigasi utama"
          className="hidden items-center gap-8 lg:flex"
        >
          {storeLinks.map((link) => (
            <Link
              key={link.href}
              className="text-sm font-medium text-green-950 transition-colors hover:text-green-700 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green-800"
              href={link.href}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          {authStatus === "guest" ? (
            <Button
              aria-label="Login"
              className="hidden sm:inline-flex"
              nativeButton={false}
              render={<Link href="/store/akun/login" />}
              variant="ghost"
            >
              <UserRound aria-hidden="true" data-icon="inline-start" />
              Login
            </Button>
          ) : null}
          {authStatus === "authenticated" ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    aria-label={`Menu akun ${currentUser?.name ?? "saya"}`}
                    className="rounded-full"
                    size="icon"
                    variant="ghost"
                  />
                }
              >
                <Avatar aria-hidden="true">
                  <AvatarImage alt="" src={currentUser?.avatar ?? undefined} />
                  <AvatarFallback>
                    {currentUser?.name?.trim().charAt(0).toUpperCase() || (
                      <UserRound aria-hidden="true" />
                    )}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuGroup>
                  <DropdownMenuItem render={<Link href="/store/akun/profile" />}>
                    <UserRound aria-hidden="true" />
                    Profil
                  </DropdownMenuItem>
                  <DropdownMenuItem render={<Link href="/store/akun/alamat" />}>
                    <MapPin aria-hidden="true" />
                    Alamat
                  </DropdownMenuItem>
                  <DropdownMenuItem render={<Link href="/store/pesanan" />}>
                    <ClipboardList aria-hidden="true" />
                    Pesanan
                  </DropdownMenuItem>
                  <DropdownMenuItem render={<Link href="/store/akun/notifikasi" />}>
                    <Bell aria-hidden="true" />
                    Notifikasi
                  </DropdownMenuItem>
                  <DropdownMenuItem render={<Link href="/store/akun/ulasan" />}>
                    <MessageSquare aria-hidden="true" />
                    Ulasan
                  </DropdownMenuItem>
                  {currentUser?.role === "admin" ||
                  currentUser?.role === "superAdmin" ? (
                    <DropdownMenuItem render={<Link href="/dashboard" />}>
                      <LayoutDashboard aria-hidden="true" />
                      Dashboard
                    </DropdownMenuItem>
                  ) : null}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  disabled={isSigningOut}
                  onClick={() => void handleLogout()}
                  variant="destructive"
                >
                  <LogOut aria-hidden="true" />
                  {isSigningOut ? "Keluar..." : "Sign out"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}

          <Button
            aria-label={
              cartCount > 0 ? `Keranjang, ${cartCount} item` : "Keranjang"
            }
            className="relative"
            nativeButton={false}
            render={<Link href="/store/keranjang" />}
            variant="ghost"
          >
            <ShoppingCart aria-hidden="true" data-icon="inline-start" />
            <span className="hidden sm:inline">Keranjang</span>
            {cartCount > 0 ? (
              <span
                aria-hidden="true"
                className="ml-1 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground"
              >
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            ) : null}
          </Button>

          <ModeToggle />

          <Button
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu"}
            className="lg:hidden"
            onClick={() => setMobileMenuOpen((open) => !open)}
            size="icon"
            variant="ghost"
          >
            {mobileMenuOpen ? (
              <X aria-hidden="true" />
            ) : (
              <Menu aria-hidden="true" />
            )}
          </Button>
        </div>
      </div>

      {logoutError ? (
        <p
          className="mx-auto max-w-7xl px-4 pb-3 text-sm text-destructive sm:px-6 lg:px-8"
          role="alert"
        >
          {logoutError}
        </p>
      ) : null}

      {mobileMenuOpen ? (
        <nav
          aria-label="Navigasi seluler"
          className="store-mobile-menu flex flex-col gap-1 border-t border-border bg-card px-4 py-3 lg:hidden"
        >
          {storeLinks.map((link) => (
            <Link
              key={link.href}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {authStatus === "authenticated" ? (
            <>
              <Link
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
                href="/store/akun/profile"
                onClick={() => setMobileMenuOpen(false)}
              >
                Profil saya
              </Link>
              <Link
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
                href="/store/pesanan"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pesanan
              </Link>
              <button
                className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-destructive hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-50"
                disabled={isSigningOut}
                onClick={() => void handleLogout()}
                type="button"
              >
                {isSigningOut ? "Keluar..." : "Sign out"}
              </button>
            </>
          ) : authStatus === "guest" ? (
            <Link
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
              href="/store/akun/login"
              onClick={() => setMobileMenuOpen(false)}
            >
              Login
            </Link>
          ) : null}
        </nav>
      ) : null}
    </header>
  );
}
