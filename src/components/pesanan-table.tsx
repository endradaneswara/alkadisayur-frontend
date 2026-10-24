"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import { usePagination } from "@/hooks/usePagination";
import { queryKeys } from "@/lib/query-keys";
import { formatRupiah, getErrorMessage } from "@/lib/store-catalog";
import { listAdminPesanan } from "@/services/pesananService";
import { updateStatusPembayaran } from "@/services/pembayaranService";
import type {
  StatusPembayaran,
  StatusPesanan,
} from "@/types";
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

const STATUS_BAYAR_OPTIONS: StatusPembayaran[] = [
  "pending",
  "berhasil",
  "gagal",
  "expired",
];

const statusBayarLabels: Record<StatusPembayaran, string> = {
  pending: "Menunggu",
  berhasil: "Berhasil",
  gagal: "Gagal",
  expired: "Kedaluwarsa",
};

const statusBayarVariants: Record<
  StatusPembayaran,
  "default" | "secondary" | "outline" | "destructive"
> = {
  pending: "outline",
  berhasil: "default",
  gagal: "destructive",
  expired: "secondary",
};

export function StatusBayarSelect({
  pembayaranId,
  status,
  onChange,
  disabled = false,
}: {
  pembayaranId: number;
  status: StatusPembayaran;
  onChange: (updated: { id: number; status: StatusPembayaran }) => void;
  disabled?: boolean;
}) {
  const [isUpdating, setIsUpdating] = React.useState(false);

  const handleValueChange = async (value: StatusPembayaran | string): Promise<void> => {
    const newStatus = value as StatusPembayaran;
    if (newStatus === status || isUpdating) return;

    setIsUpdating(true);
    try {
      const res = await updateStatusPembayaran(pembayaranId, newStatus);
      onChange({ id: res.data.id, status: res.data.status });
      toast.add({
        title: "Status Pembayaran Diperbarui",
        description: `Status pembayaran berhasil diubah menjadi ${statusBayarLabels[res.data.status]}.`,
        type: "success",
      });
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      toast.add({
        title: "Gagal Mengubah Status Pembayaran",
        description: msg,
        type: "error",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Select
      value={status}
      onValueChange={(value) => {
        if (typeof value === "string") void handleValueChange(value);
      }}
      disabled={disabled || isUpdating}
    >
      <SelectTrigger className="h-7 w-[130px] text-xs" aria-label="Status Bayar">
        <span className="flex items-center gap-1.5">
          <Badge variant={statusBayarVariants[status]} className="text-[10px]">
            {statusBayarLabels[status]}
          </Badge>
        </span>
      </SelectTrigger>
      <SelectContent>
        {STATUS_BAYAR_OPTIONS.map((option) => (
          <SelectItem key={option} value={option}>
            {statusBayarLabels[option]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function PesananTable() {
  const pagination = usePagination();

  const pesananQuery = useQuery({
    queryKey: queryKeys.adminPesanan.list({ page: pagination.page }),
    queryFn: async () => {
      const response = await listAdminPesanan({ page: pagination.page });
      return response;
    },
  });

  React.useEffect(() => {
    if (pesananQuery.data) {
      pagination.setMeta(pesananQuery.data.meta);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pesananQuery.data]);

  const pesanan = pesananQuery.data?.data ?? [];
  const isLoading = pesananQuery.isLoading;
  const error = pesananQuery.error instanceof Error
    ? getErrorMessage(pesananQuery.error)
    : null;

  return (
    <Card className="mx-4 mb-6 lg:mx-6">
      <CardHeader>
        <CardTitle>Daftar Pesanan</CardTitle>
        <CardDescription>
          Pesanan terbaru yang masuk, halaman {pagination.page} dari {pagination.lastPage}
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
            onClick={() => void pesananQuery.refetch()}
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
          {pagination.lastPage > 1 ? (
            <nav
              aria-label="Navigasi halaman pesanan"
              className="flex items-center justify-between px-6 py-4"
            >
              <Button
                disabled={!pagination.canGoPrevious}
                onClick={pagination.goToPreviousPage}
                size="sm"
                variant="outline"
              >
                <ChevronLeft aria-hidden="true" data-icon="inline-start" />
                Sebelumnya
              </Button>
              <p className="text-sm text-muted-foreground">
                Halaman {pagination.page} dari {pagination.lastPage}
              </p>
              <Button
                disabled={!pagination.canGoNext}
                onClick={pagination.goToNextPage}
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
