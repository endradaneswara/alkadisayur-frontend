"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  BellOff,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Clock,
  ShoppingBag,
  Trash2,
} from "lucide-react";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { getErrorMessage } from "@/lib/store-catalog";
import { hasAuthSession } from "@/services/api";
import {
  deleteAdminNotifikasi,
  listAdminNotifikasi,
  markAdminNotifikasiRead,
  markAllAdminNotifikasiRead,
} from "@/services/notifikasiService";
import { getProfile } from "@/services/profileService";
import type { Notifikasi, PenggunaLogin, StatusPesanan } from "@/types";

function getStatusBadgeVariant(
  status: StatusPesanan | undefined,
): "default" | "secondary" | "outline" | "destructive" {
  switch (status) {
    case "selesai":
      return "default";
    case "dikirim":
      return "secondary";
    case "diproses":
    case "pending":
      return "outline";
    case "dibatalkan":
      return "destructive";
    default:
      return "outline";
  }
}

function getStatusLabel(status: StatusPesanan | undefined): string {
  switch (status) {
    case "pending":
      return "Menunggu";
    case "diproses":
      return "Diproses";
    case "dikirim":
      return "Dikirim";
    case "selesai":
      return "Selesai";
    case "dibatalkan":
      return "Dibatalkan";
    default:
      return status ?? "-";
  }
}

function formatWaktu(dateStr?: string | null): string {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Baru saja";
  if (diffMins < 60) return `${diffMins} menit lalu`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} jam lalu`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} hari lalu`;
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function NotifikasiPage() {
  const router = useRouter();

  const [currentUser, setCurrentUser] = React.useState<PenggunaLogin | null>(
    null,
  );
  const [notifikasiList, setNotifikasiList] = React.useState<Notifikasi[]>([]);
  const [page, setPage] = React.useState(1);
  const [lastPage, setLastPage] = React.useState(1);
  const [totalUnread, setTotalUnread] = React.useState(0);

  const [isLoadingUser, setIsLoadingUser] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isMarkingAll, setIsMarkingAll] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [deletingId, setDeletingId] = React.useState<number | null>(null);

  React.useEffect(() => {
    let isCurrent = true;
    if (!hasAuthSession()) {
      router.replace("/store/akun/login");
      return;
    }
    void getProfile()
      .then((res) => {
        if (isCurrent) setCurrentUser(res.data);
      })
      .catch((err: unknown) => {
        if (isCurrent) setError(getErrorMessage(err));
      })
      .finally(() => {
        if (isCurrent) setIsLoadingUser(false);
      });
    return () => {
      isCurrent = false;
    };
  }, [router]);

  const loadNotifikasi = React.useCallback(async () => {
    if (isLoadingUser || !currentUser) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await listAdminNotifikasi({ page });
      setNotifikasiList(res.data);
      setLastPage(res.meta?.last_page ?? 1);
      setTotalUnread(res.data.filter((n) => !n.sudah_dibaca).length);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [isLoadingUser, currentUser, page]);

  React.useEffect(() => {
    void loadNotifikasi();
  }, [loadNotifikasi]);

  const handleMarkRead = async (id: number) => {
    try {
      await markAdminNotifikasiRead(id);
      setNotifikasiList((prev) =>
        prev.map((n) =>
          n.id === id
            ? {
                ...n,
                sudah_dibaca: true,
                dibaca_pada: new Date().toISOString(),
              }
            : n,
        ),
      );
      setTotalUnread((prev) => Math.max(0, prev - 1));
    } catch {
      // silently ignore
    }
  };

  const handleMarkAllRead = async () => {
    setIsMarkingAll(true);
    try {
      await markAllAdminNotifikasiRead();
      setNotifikasiList((prev) =>
        prev.map((n) => ({
          ...n,
          sudah_dibaca: true,
          dibaca_pada: n.dibaca_pada ?? new Date().toISOString(),
        })),
      );
      setTotalUnread(0);
      toast.add({
        title: "Semua Ditandai Dibaca",
        description: "Seluruh notifikasi berhasil ditandai sebagai sudah dibaca.",
        type: "success",
      });
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      setError(msg);
      toast.add({
        title: "Gagal Menandai Notifikasi",
        description: msg,
        type: "error",
      });
    } finally {
      setIsMarkingAll(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await deleteAdminNotifikasi(id);
      const deleted = notifikasiList.find((n) => n.id === id);
      setNotifikasiList((prev) => prev.filter((n) => n.id !== id));
      if (deleted && !deleted.sudah_dibaca) {
        setTotalUnread((prev) => Math.max(0, prev - 1));
      }
      toast.add({
        title: "Notifikasi Dihapus",
        description: "Notifikasi berhasil dihapus.",
        type: "success",
      });
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      setError(msg);
      toast.add({
        title: "Gagal Menghapus Notifikasi",
        description: msg,
        type: "error",
      });
    } finally {
      setDeletingId(null);
    }
  };

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
        <SiteHeader title="Notifikasi" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">

              {/* Page Header */}
              <div className="px-4 lg:px-6">
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 shadow-xs md:p-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                        Notifikasi
                      </h2>
                      {totalUnread > 0 && (
                        <Badge className="text-xs">
                          {totalUnread} belum dibaca
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Pemberitahuan terkait pesanan dan aktivitas toko Alkadi.
                    </p>
                  </div>
                  {totalUnread > 0 && (
                    <Button
                      onClick={() => void handleMarkAllRead()}
                      disabled={isMarkingAll}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <CheckCheck className="size-4" />
                      {isMarkingAll ? "Menandai..." : "Tandai Semua Dibaca"}
                    </Button>
                  )}
                </div>
              </div>

              {/* Error Alert */}
              {error ? (
                <div className="px-4 lg:px-6">
                  <Alert variant="destructive">
                    <AlertTitle>Notifikasi gagal dimuat</AlertTitle>
                    <AlertDescription className="flex flex-wrap items-center gap-3">
                      {error}
                      <Button
                        onClick={() => void loadNotifikasi()}
                        size="sm"
                        variant="outline"
                      >
                        Coba lagi
                      </Button>
                    </AlertDescription>
                  </Alert>
                </div>
              ) : null}

              {/* Notification Card */}
              <div className="px-4 lg:px-6">
                <Card>
                  <CardHeader className="border-b border-border pb-4">
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="size-5 text-primary" />
                      Daftar Notifikasi
                    </CardTitle>
                    <CardDescription>
                      Halaman {page} dari {lastPage}
                      {totalUnread > 0
                        ? ` — ${totalUnread} belum dibaca`
                        : " — semua sudah dibaca"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    {isLoading ? (
                      <div className="divide-y divide-border">
                        {Array.from({ length: 5 }, (_, i) => (
                          <div key={i} className="flex items-start gap-4 p-5">
                            <Skeleton className="size-10 shrink-0 rounded-full" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-4 w-3/4" />
                              <Skeleton className="h-3 w-full" />
                              <Skeleton className="h-3 w-1/3" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : notifikasiList.length === 0 ? (
                      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                        <BellOff className="size-12 text-muted-foreground/40" />
                        <div>
                          <p className="font-medium text-foreground">
                            Tidak ada notifikasi
                          </p>
                          <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                            Notifikasi akan muncul saat ada aktivitas pesanan
                            baru atau perubahan status.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="divide-y divide-border">
                        {notifikasiList.map((notif) => (
                          <div
                            key={notif.id}
                            className={`group flex items-start gap-4 p-5 transition-colors ${
                              !notif.sudah_dibaca
                                ? "bg-primary/5 hover:bg-primary/10"
                                : "hover:bg-muted/40"
                            }`}
                          >
                            {/* Status icon */}
                            <div
                              className={`flex size-10 shrink-0 items-center justify-center rounded-full border ${
                                !notif.sudah_dibaca
                                  ? "border-primary/30 bg-primary/10 text-primary"
                                  : "border-border bg-muted/50 text-muted-foreground"
                              }`}
                            >
                              <ShoppingBag className="size-4" />
                            </div>

                            {/* Content */}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <p
                                      className={`text-sm font-semibold leading-snug ${
                                        !notif.sudah_dibaca
                                          ? "text-foreground"
                                          : "text-muted-foreground"
                                      }`}
                                    >
                                      {notif.judul}
                                    </p>
                                    {/* Unread dot */}
                                    {!notif.sudah_dibaca && (
                                      <span
                                        className="size-2 shrink-0 rounded-full bg-primary"
                                        aria-label="Belum dibaca"
                                      />
                                    )}
                                    {/* Pesanan status badge */}
                                    {notif.pesanan?.status && (
                                      <Badge
                                        variant={getStatusBadgeVariant(
                                          notif.pesanan.status,
                                        )}
                                        className="py-0 text-[10px]"
                                      >
                                        {getStatusLabel(notif.pesanan.status)}
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                    {notif.pesan}
                                  </p>
                                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                    {notif.pesanan?.nomor_order && (
                                      <span className="font-mono font-medium text-primary">
                                        #{notif.pesanan.nomor_order}
                                      </span>
                                    )}
                                    <span className="flex items-center gap-1">
                                      <Clock className="size-3" />
                                      {formatWaktu(notif.created_at)}
                                    </span>
                                    {notif.sudah_dibaca &&
                                      notif.dibaca_pada && (
                                        <span className="text-[11px] text-primary/70">
                                          Dibaca{" "}
                                          {formatWaktu(notif.dibaca_pada)}
                                        </span>
                                      )}
                                  </div>
                                </div>

                                {/* Action buttons — visible on hover */}
                                <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                  {!notif.sudah_dibaca && (
                                    <Button
                                      onClick={() =>
                                        void handleMarkRead(notif.id)
                                      }
                                      variant="ghost"
                                      size="icon"
                                      className="size-8 text-muted-foreground hover:text-primary"
                                      aria-label="Tandai sudah dibaca"
                                      title="Tandai sudah dibaca"
                                    >
                                      <CheckCheck className="size-4" />
                                    </Button>
                                  )}

                                  {/* Confirm before delete */}
                                  <AlertDialog>
                                    <AlertDialogTrigger
                                      render={
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="size-8 text-muted-foreground hover:text-destructive"
                                          aria-label="Hapus notifikasi"
                                          title="Hapus notifikasi"
                                          disabled={deletingId === notif.id}
                                        />
                                      }
                                    >
                                      <Trash2 className="size-4" />
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>
                                          Hapus notifikasi?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Notifikasi &ldquo;{notif.judul}&rdquo;
                                          akan dihapus secara permanen dan tidak
                                          dapat dikembalikan.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>
                                          Batal
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() =>
                                            void handleDelete(notif.id)
                                          }
                                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                          Hapus
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>

                  {lastPage > 1 && (
                    <CardFooter className="flex items-center justify-between border-t border-border px-6 py-4">
                      <p className="text-xs text-muted-foreground">
                        Halaman {page} dari {lastPage}
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          disabled={page <= 1 || isLoading}
                          onClick={() =>
                            setPage((prev) => Math.max(1, prev - 1))
                          }
                          size="sm"
                          variant="outline"
                        >
                          <ChevronLeft className="size-4" />
                          Sebelumnya
                        </Button>
                        <Button
                          disabled={page >= lastPage || isLoading}
                          onClick={() =>
                            setPage((prev) => Math.min(lastPage, prev + 1))
                          }
                          size="sm"
                          variant="outline"
                        >
                          Berikutnya
                          <ChevronRight className="size-4" />
                        </Button>
                      </div>
                    </CardFooter>
                  )}
                </Card>
              </div>

            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
