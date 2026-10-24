
"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";

import { ChartPenjualan } from "@/components/chart-area-interactive";
import { PesananTable } from "@/components/pesanan-table";
import { SectionCards } from "@/components/section-cards";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { queryKeys } from "@/lib/query-keys";
import { getErrorMessage } from "@/lib/store-catalog";
import { getDashboard } from "@/services/dashboardService";
import type { RentangGrafik } from "@/types";

export default function Page() {
  const [rentang, setRentang] = React.useState<RentangGrafik>("7h");

  const dashboardQuery = useQuery({
    queryKey: queryKeys.dashboard(rentang),
    queryFn: async () => {
      const response = await getDashboard(rentang);
      return response.data;
    },
  });

  const dashboard = dashboardQuery.data ?? null;
  const isLoading = dashboardQuery.isLoading;
  const error = dashboardQuery.error instanceof Error
    ? getErrorMessage(dashboardQuery.error)
    : null;

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {error && (
            <div className="px-4 lg:px-6">
              <Alert variant="destructive">
                <AlertTitle>Dashboard gagal dimuat</AlertTitle>
                <AlertDescription className="flex flex-wrap items-center gap-3">
                  {error}
                  <Button
                    onClick={() => void dashboardQuery.refetch()}
                    size="sm"
                    variant="outline"
                    disabled={dashboardQuery.isFetching}
                  >
                    Coba lagi
                  </Button>
                </AlertDescription>
              </Alert>
            </div>
          )}

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
  );
}
