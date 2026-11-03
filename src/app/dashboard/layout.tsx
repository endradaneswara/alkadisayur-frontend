
"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/kategori": "Kategori",
  "/dashboard/lokasi": "Lokasi",
  "/dashboard/notifikasi": "Notifikasi",
  "/dashboard/penjualan": "Penjualan",
  "/dashboard/pesanan": "Pesanan",
  "/dashboard/produk": "Produk",
  "/dashboard/ulasan": "Ulasan Pelanggan",
  "/dashboard/user": "Manajemen Akun",
};

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, isLoading, isAuthenticated } = useAuth();

  const isAuthorized =
    currentUser !== null &&
    ["admin", "superAdmin"].includes(currentUser.role);

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/store");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-svh gap-4 p-4">
        <Skeleton className="hidden h-[calc(100svh-2rem)] w-64 rounded-xl md:block" />
        <div className="flex-1 space-y-4">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-36 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex min-h-svh items-center justify-center p-6">
        <p className="text-sm text-muted-foreground">
          Anda tidak memiliki akses.
        </p>
      </div>
    );
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar currentUser={currentUser} variant="inset" />

      <SidebarInset>
        <SiteHeader title={PAGE_TITLES[pathname] ?? "Dashboard"} />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
