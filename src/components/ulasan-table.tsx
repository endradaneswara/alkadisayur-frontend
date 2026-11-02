"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  MessageSquare,
  RotateCcw,
  Search,
  Star,
  Trash2,
} from "lucide-react";

import { ConfirmDialogHost } from "@/components/confirm-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/toast";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";
import { usePagination } from "@/hooks/usePagination";
import { queryKeys } from "@/lib/query-keys";
import { getErrorMessage } from "@/lib/store-catalog";
import { deleteUlasan, listUlasan } from "@/services/ulasanService";
import type { Ulasan } from "@/types";

const ratingLabels: Record<number, string> = {
  1: "Sangat Buruk",
  2: "Buruk",
  3: "Cukup",
  4: "Bagus",
  5: "Sangat Bagus",
};

const ratingBadgeVariants: Record<
  number,
  "default" | "secondary" | "outline" | "destructive"
> = {
  1: "destructive",
  2: "destructive",
  3: "outline",
  4: "secondary",
  5: "default",
};

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1" aria-label={`Rating ${rating} dari 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`size-4 ${
            star <= rating
              ? "fill-amber-400 text-amber-400"
              : "fill-muted text-muted-foreground/30"
          }`}
        />
      ))}
      <span className="ml-1 text-xs font-semibold text-foreground">
        {rating}.0
      </span>
    </div>
  );
}

interface UlasanTableProps {
  isFullPage?: boolean;
}

export function UlasanTable({ isFullPage = false }: UlasanTableProps) {
  const pagination = usePagination();
  const queryClient = useQueryClient();
  const confirmDialog = useConfirmDialog();

  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [selectedRating, setSelectedRating] = React.useState<string>("all");
  const [activeReview, setActiveReview] = React.useState<Ulasan | null>(null);

  // Debounce search input
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search.trim());
      pagination.setPage(1);
    }, 350);

    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const ratingFilter = selectedRating === "all" ? undefined : Number(selectedRating);

  const ulasanQuery = useQuery({
    queryKey: queryKeys.ulasan.list({
      page: pagination.page,
      rating: ratingFilter,
      search: debouncedSearch || undefined,
    }),
    queryFn: async () => {
      const response = await listUlasan({
        page: pagination.page,
        rating: ratingFilter,
        search: debouncedSearch || undefined,
      });
      return response;
    },
  });

  React.useEffect(() => {
    if (ulasanQuery.data) {
      pagination.setMeta(ulasanQuery.data.meta);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ulasanQuery.data]);

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await deleteUlasan(id);
    },
    onSuccess: async () => {
      toast.add({
        title: "Ulasan Berhasil Dihapus",
        description: "Ulasan pengguna telah dihapus dari sistem.",
        type: "success",
      });
      if (activeReview) setActiveReview(null);
      await queryClient.invalidateQueries({ queryKey: queryKeys.ulasan.all });
    },
    onError: (err: unknown) => {
      toast.add({
        title: "Gagal Menghapus Ulasan",
        description: getErrorMessage(err),
        type: "error",
      });
    },
  });

  const handleDelete = (item: Ulasan) => {
    confirmDialog.confirm(
      {
        title: "Hapus Ulasan Pengguna?",
        description: `Apakah Anda yakin ingin menghapus ulasan dari "${item.user?.name ?? "Pengguna"}"? Tindakan ini tidak dapat dibatalkan.`,
        confirmLabel: "Hapus Ulasan",
        cancelLabel: "Batal",
      },
      () => deleteMutation.mutateAsync(item.id),
    );
  };

  const handleResetFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setSelectedRating("all");
    pagination.setPage(1);
  };

  const reviews = React.useMemo(
    () => ulasanQuery.data?.data ?? [],
    [ulasanQuery.data?.data],
  );
  const isLoading = ulasanQuery.isLoading;
  const isFetching = ulasanQuery.isFetching;
  const error = ulasanQuery.error instanceof Error
    ? getErrorMessage(ulasanQuery.error)
    : null;

  const totalReviews = pagination.total;
  const averageRating = React.useMemo(() => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
    return Number((sum / reviews.length).toFixed(1));
  }, [reviews]);

  return (
    <>
      <ConfirmDialogHost dialog={confirmDialog} />

      <Card className={`${isFullPage ? "mx-4 my-6 lg:mx-6" : "mx-4 mb-6 lg:mx-6"}`}>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-xl font-bold tracking-tight">
                Daftar Ulasan Pengguna
              </CardTitle>
              <CardDescription className="mt-1">
                Hasil ulasan dan penilaian dari pelanggan terhadap produk dan layanan.
              </CardDescription>
            </div>

            {/* Quick stats chips */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="gap-1.5 px-3 py-1 text-xs font-medium">
                <Star className="size-3.5 fill-amber-400 text-amber-400" />
                Rata-rata: <span className="font-bold text-foreground">{averageRating > 0 ? averageRating : "-"}</span> / 5.0
              </Badge>
              <Badge variant="secondary" className="gap-1.5 px-3 py-1 text-xs font-medium">
                <MessageSquare className="size-3.5" />
                Total: <span className="font-bold text-foreground">{totalReviews}</span> Ulasan
              </Badge>
            </div>
          </div>

          {/* Filters & Search Toolbar */}
          <div className="mt-4 flex flex-col gap-2.5 pt-2 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari berdasarkan nama atau komentar ulasan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 text-sm"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="w-[180px]">
                <Select
                  value={selectedRating}
                  onValueChange={(val) => {
                    setSelectedRating(val ?? "all");
                    pagination.setPage(1);
                  }}
                >
                  <SelectTrigger className="w-full text-xs">
                    <Filter className="mr-1.5 size-3.5 text-muted-foreground" />
                    <SelectValue placeholder="Filter Rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Rating</SelectItem>
                    <SelectItem value="5">⭐⭐⭐⭐⭐ (5 Bintang)</SelectItem>
                    <SelectItem value="4">⭐⭐⭐⭐ (4 Bintang)</SelectItem>
                    <SelectItem value="3">⭐⭐⭐ (3 Bintang)</SelectItem>
                    <SelectItem value="2">⭐⭐ (2 Bintang)</SelectItem>
                    <SelectItem value="1">⭐ (1 Bintang)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(search || selectedRating !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  className="h-9 px-2.5 text-xs text-muted-foreground hover:text-foreground"
                  title="Reset filter"
                >
                  <RotateCcw className="size-3.5" />
                  <span className="hidden sm:inline">Reset</span>
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-0 pb-0">
          {error ? (
            <div
              className="mx-6 mb-6 rounded-xl border border-destructive/30 px-4 py-3 text-sm text-destructive"
              role="alert"
            >
              Ulasan belum dapat dimuat: {error}
              <Button
                className="ml-3"
                onClick={() => void ulasanQuery.refetch()}
                size="sm"
                variant="outline"
                disabled={isFetching}
              >
                Coba lagi
              </Button>
            </div>
          ) : isLoading ? (
            <div className="flex flex-col gap-2.5 px-6 pb-6">
              {Array.from({ length: 5 }, (_, index) => (
                <Skeleton className="h-14 rounded-lg" key={index} />
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                <MessageSquare className="size-6 text-muted-foreground" />
              </div>
              <div className="max-w-sm space-y-1">
                <p className="font-semibold text-foreground">Belum ada ulasan</p>
                <p className="text-xs text-muted-foreground">
                  {search || selectedRating !== "all"
                    ? "Tidak ada ulasan yang cocok dengan kriteria pencarian atau filter yang dipilih."
                    : "Pelanggan belum memberikan ulasan atau penilaian saat ini."}
                </p>
              </div>
              {(search || selectedRating !== "all") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetFilters}
                  className="mt-1"
                >
                  Bersihkan Filter
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Pelanggan</TableHead>
                      <TableHead className="w-[180px]">Rating</TableHead>
                      <TableHead>Komentar Ulasan</TableHead>
                      <TableHead className="w-[170px]">Tanggal</TableHead>
                      <TableHead className="w-[100px] text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reviews.map((item) => (
                      <TableRow key={item.id} className="group">
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <Avatar className="size-8">
                              {item.user?.avatar && (
                                <AvatarImage
                                  src={item.user.avatar}
                                  alt={item.user?.name ?? "Pelanggan"}
                                />
                              )}
                              <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                                {item.user?.name
                                  ? item.user.name.slice(0, 2).toUpperCase()
                                  : "US"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="font-medium text-foreground">
                                {item.user?.name ?? "Pelanggan"}
                              </span>
                              {item.user?.email && (
                                <span className="text-xs text-muted-foreground">
                                  {item.user.email}
                                </span>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <RatingStars rating={item.rating} />
                            <Badge
                              variant={ratingBadgeVariants[item.rating] ?? "outline"}
                              className="w-fit text-[10px] uppercase tracking-wider"
                            >
                              {ratingLabels[item.rating] ?? `${item.rating} Bintang`}
                            </Badge>
                          </div>
                        </TableCell>

                        <TableCell>
                          {item.komentar ? (
                            <p className="line-clamp-2 text-sm text-foreground/90 leading-relaxed">
                              &ldquo;{item.komentar}&rdquo;
                            </p>
                          ) : (
                            <span className="text-xs italic text-muted-foreground">
                              Tidak ada komentar tertulis
                            </span>
                          )}
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Calendar className="size-3.5 shrink-0" />
                            <span>
                              {item.created_at
                                ? new Date(item.created_at).toLocaleString("id-ID", {
                                    dateStyle: "medium",
                                    timeStyle: "short",
                                  })
                                : "-"}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => setActiveReview(item)}
                              title="Lihat Detail Ulasan"
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <Eye className="size-4" />
                              <span className="sr-only">Lihat Detail</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => handleDelete(item)}
                              title="Hapus Ulasan"
                              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="size-4" />
                              <span className="sr-only">Hapus</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination controls */}
              {pagination.lastPage > 1 && (
                <nav
                  aria-label="Navigasi halaman ulasan"
                  className="flex items-center justify-between border-t px-6 py-4"
                >
                  <Button
                    disabled={!pagination.canGoPrevious || isFetching}
                    onClick={pagination.goToPreviousPage}
                    size="sm"
                    variant="outline"
                  >
                    <ChevronLeft aria-hidden="true" className="size-4 mr-1" />
                    Sebelumnya
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    Halaman <span className="font-medium text-foreground">{pagination.page}</span> dari{" "}
                    <span className="font-medium text-foreground">{pagination.lastPage}</span>
                  </p>
                  <Button
                    disabled={!pagination.canGoNext || isFetching}
                    onClick={pagination.goToNextPage}
                    size="sm"
                    variant="outline"
                  >
                    Berikutnya
                    <ChevronRight aria-hidden="true" className="size-4 ml-1" />
                  </Button>
                </nav>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Detail Sheet for a Review */}
      <Sheet open={Boolean(activeReview)} onOpenChange={(open) => !open && setActiveReview(null)}>
        <SheetContent side="right" className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Detail Ulasan Pelanggan</SheetTitle>
            <SheetDescription>
              Informasi lengkap penilaian dan testimoni pengguna.
            </SheetDescription>
          </SheetHeader>

          {activeReview && (
            <div className="flex flex-col gap-6 py-4">
              <div className="flex items-center gap-3 rounded-lg border p-3 bg-muted/40">
                <Avatar className="size-11">
                  {activeReview.user?.avatar && (
                    <AvatarImage
                      src={activeReview.user.avatar}
                      alt={activeReview.user?.name ?? "Pelanggan"}
                    />
                  )}
                  <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                    {activeReview.user?.name
                      ? activeReview.user.name.slice(0, 2).toUpperCase()
                      : "US"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-semibold text-foreground">
                    {activeReview.user?.name ?? "Pelanggan"}
                  </span>
                  {activeReview.user?.email && (
                    <span className="text-xs text-muted-foreground">
                      {activeReview.user.email}
                    </span>
                  )}
                  <span className="mt-0.5 text-[11px] text-muted-foreground">
                    User ID: #{activeReview.user_id}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Penilaian & Rating
                </span>
                <div className="flex items-center gap-3">
                  <RatingStars rating={activeReview.rating} />
                  <Badge variant={ratingBadgeVariants[activeReview.rating] ?? "outline"}>
                    {ratingLabels[activeReview.rating]}
                  </Badge>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Isi Ulasan
                </span>
                <div className="rounded-lg border bg-background p-4 text-sm leading-relaxed text-foreground shadow-xs">
                  {activeReview.komentar ? (
                    <p>&ldquo;{activeReview.komentar}&rdquo;</p>
                  ) : (
                    <p className="italic text-muted-foreground">
                      Pelanggan ini tidak meninggalkan komentar tertulis.
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Waktu Dibuat:</span>
                  <span className="font-medium text-foreground">
                    {activeReview.created_at
                      ? new Date(activeReview.created_at).toLocaleString("id-ID", {
                          dateStyle: "full",
                          timeStyle: "medium",
                        })
                      : "-"}
                  </span>
                </div>
                {activeReview.updated_at && activeReview.updated_at !== activeReview.created_at && (
                  <div className="flex items-center justify-between">
                    <span>Terakhir Diperbarui:</span>
                    <span className="font-medium text-foreground">
                      {new Date(activeReview.updated_at).toLocaleString("id-ID", {
                        dateStyle: "full",
                        timeStyle: "medium",
                      })}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-4 flex gap-2">
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => handleDelete(activeReview)}
                >
                  <Trash2 className="size-4 mr-2" />
                  Hapus Ulasan Ini
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
