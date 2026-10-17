"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, PackageOpen } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRupiah, getErrorMessage } from "@/lib/store-catalog";
import { listAdminPesanan } from "@/services/pesananService";
import type { Pesanan, StatusPesanan } from "@/types";

const statusLabels: Record<StatusPesanan, string> = {
  pending: "Pending",
  diproses: "Diproses",
  dikirim: "Dikirim",
  selesai: "Selesai",
  dibatalkan: "Dibatalkan",
};

const statusVariants: Record<
  StatusPesanan,
  "default" | "secondary" | "outline" | "destructive"
> = {
  pending: "outline",
  diproses: "secondary",
  dikirim: "default",
  selesai: "secondary",
  dibatalkan: "destructive",
};

export function PesananTable() {
  const [pesanan, setPesanan] = React.useState<Pesanan[]>([]);
  const [page, setPage] = React.useState(1);
  const [lastPage, setLastPage] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadPesanan = React.useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await listAdminPesanan({ page });
      setPesanan(response.data);
      setLastPage(response.meta.last_page);
      setError(null);
    } catch (loadError: unknown) {
      setError(getErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  React.useEffect(() => {
    void Promise.resolve().then(() => loadPesanan());
  }, [loadPesanan]);

  return (
    <Card className="mx-4 mb-6 lg:mx-6">
      <CardHeader>
        <CardTitle>Daftar Pesanan</CardTitle>
        <CardDescription>
          Pesanan terbaru yang masuk, halaman {page} dari {lastPage}
        </CardDescription>
      </CardHeader>
      {error ? (
        <div
          className="mx-6 mb-4 rounded-xl border border-destructive/30 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          Pesanan belum dapat dimuat: {error}
          <Button
            className="ml-3"
            onClick={() => void loadPesanan()}
            size="sm"
            variant="outline"
          >
            Coba lagi
          </Button>
        </div>
      ) : isLoading ? (
        <div className="flex flex-col gap-2 px-6 pb-6">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton className="h-12 rounded-lg" key={index} />
          ))}
        </div>
      ) : pesanan.length === 0 ? (
        <div className="flex flex-col items-center gap-3 px-6 pb-10 pt-2 text-center">
          <PackageOpen aria-hidden="true" className="size-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Belum ada pesanan yang masuk.
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto px-1">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nomor Order</TableHead>
                  <TableHead>Pelanggan</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Metode</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pesanan.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.nomor_order}
                    </TableCell>
                    <TableCell>
                      {item.pelanggan?.nama ?? "-"}
                    </TableCell>
                    <TableCell>
                      {new Date(item.tanggal_pemesanan).toLocaleString("id-ID", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </TableCell>
                    <TableCell>
                      {item.metode === "pesan_antar" ? "Pesan antar" : "Ambil di toko"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariants[item.status]}>
                        {statusLabels[item.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatRupiah(item.total_harga)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {lastPage > 1 ? (
            <nav
              aria-label="Navigasi halaman pesanan"
              className="flex items-center justify-between px-6 py-4"
            >
              <Button
                disabled={page <= 1}
                onClick={() => setPage((current) => current - 1)}
                size="sm"
                variant="outline"
              >
                <ChevronLeft aria-hidden="true" data-icon="inline-start" />
                Sebelumnya
              </Button>
              <p className="text-sm text-muted-foreground">
                Halaman {page} dari {lastPage}
              </p>
              <Button
                disabled={page >= lastPage}
                onClick={() => setPage((current) => current + 1)}
                size="sm"
                variant="outline"
              >
                Berikutnya
                <ChevronRight aria-hidden="true" data-icon="inline-end" />
              </Button>
            </nav>
          ) : null}
        </>
      )}
    </Card>
  );
}
