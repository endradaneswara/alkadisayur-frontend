"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Bell,
  ClipboardList,
  LayoutDashboard,
  LogOut,
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
import { useAuth } from "@/hooks/useAuth";
import { storeLinks } from "@/lib/store-links";
import { clearAuthSession, hasAuthSession } from "@/services/api";
import { logout } from "@/services/authService";
import { cn } from "@/lib/utils";
import { useCart } from "@/hooks/useCart";


export function StoreNavbar({ className }: { className?: string }) {
  const { totalItem } = useCart();
  const router = useRouter();
  const { currentUser, isLoading, isAuthenticated, clearUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  const authStatus: "checking" | "guest" | "authenticated" = isLoading
    ? "checking"
    : isAuthenticated
      ? "authenticated"
      : "guest";

  async function handleLogout(): Promise<void> {
    setIsSigningOut(true);
    setLogoutError(null);

    try {
      await logout();
      clearUser();
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
        clearAuthSession();
        clearUser();
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
        "sticky top-0 z-40 border-b border-border bg-background/60 backdrop-blur-md dark:border-white dark:text-[#E8F5E9]",
        className,
      )}
    >
      <div className="mx-auto flex h-[76px] max-w-[1536px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-10 xl:px-12">
        <Link
          aria-label="Alkadi Sayur, beranda"
          className="flex shrink-0 items-center gap-3 rounded-lg text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring dark:text-[#E8F5E9]"
          href="/store"
          onClick={() => setMobileMenuOpen(false)}
        >
          <span className="flex flex-col">
            <span className="flex items-center gap-2 font-heading text-lg leading-none font-bold tracking-tight text-primary dark:text-[#E8F5E9]">
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
              className="text-sm font-medium text-foreground transition-colors hover:text-primary focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring dark:text-[#E8F5E9] dark:hover:text-white"
              href={link.href}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
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
          <Button
            aria-label={
              totalItem > 0 ? `Keranjang, ${totalItem} item` : "Keranjang"
            }
            className="relative"
            nativeButton={false}
            render={<Link href="/store/keranjang" />}
            variant="ghost"
          >
            <ShoppingCart aria-hidden="true" data-icon="inline-start" />
            {totalItem > 0 ? (
              <span
                aria-hidden="true"
                className="ml-1 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground"
              >
                {totalItem > 9 ? "9+" : totalItem}
              </span>
            ) : null}
          </Button>
          {authStatus === "guest" ? (
            <Button
              aria-label="Login"
              className="inline-flex"
              nativeButton={false}
              render={<Link href="/store/akun/login" />}
              variant="ghost"
            >
              <UserRound aria-hidden="true" data-icon="inline-start" />
              <span className="hidden sm:inline">Login</span>
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
                  <DropdownMenuItem render={<Link href="/store/pesanan" />}>
                    <ClipboardList aria-hidden="true" />
                    Pesanan
                  </DropdownMenuItem>
                  <DropdownMenuItem render={<Link href="/store/akun/notifikasi" />}>
                    <Bell aria-hidden="true" />
                    Notifikasi
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
                  {isSigningOut ? "Keluar..." : "Logout"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}

          <span aria-hidden="true" className="mx-2 h-6 w-px bg-border sm:mx-3 dark:bg-white" />
          <ModeToggle />
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
        </nav>
      ) : null}
    </header>
  );
}
