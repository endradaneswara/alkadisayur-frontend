"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

import { AppSidebar } from "@/components/app-sidebar";
import { ChartPenjualan } from "@/components/chart-area-interactive";
import { PesananTable } from "@/components/pesanan-table";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/lib/store-catalog";
import { hasAuthSession } from "@/services/api";
import { getDashboard } from "@/services/dashboardService";
import type { Dashboard, RentangGrafik } from "@/types";

export default function Page() {
  const router = useRouter();
  const [dashboard, setDashboard] = React.useState<Dashboard | null>(null);
  const [rentang, setRentang] = React.useState<RentangGrafik>("7h");
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadDashboard = React.useCallback(
    async (rentangAktif: RentangGrafik): Promise<void> => {
      setIsLoading(true);
      try {
        const response = await getDashboard(rentangAktif);
        setDashboard(response.data);
        setError(null);
      } catch (loadError: unknown) {
        setError(getErrorMessage(loadError));
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  React.useEffect(() => {
    void Promise.resolve().then(() => {
      if (!hasAuthSession()) {
        router.replace("/store/akun/login");
        return;
      }
      return loadDashboard(rentang);
    });
  }, [loadDashboard, rentang, router]);

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {error ? (
                <div className="px-4 lg:px-6">
                  <Alert variant="destructive">
                    <AlertTitle>Dashboard gagal dimuat</AlertTitle>
                    <AlertDescription className="flex flex-wrap items-center gap-3">
                      {error}
                      <Button
                        onClick={() => void loadDashboard(rentang)}
                        size="sm"
                        variant="outline"
                      >
                        Coba lagi
                      </Button>
                    </AlertDescription>
                  </Alert>
                </div>
              ) : null}

              {isLoading && !dashboard ? (
                <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
                  {Array.from({ length: 4 }, (_, index) => (
                    <Skeleton className="h-36 rounded-xl" key={index} />
                  ))}
                </div>
              ) : (
                <SectionCards dashboard={dashboard} />
              )}

              <div className="px-4 lg:px-6">
                <ChartPenjualan
                  data={dashboard?.grafik_penjualan ?? []}
                  rentang={rentang}
                  onRentangChange={setRentang}
                  isLoading={isLoading && !dashboard}
                />
              </div>

              <PesananTable />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
