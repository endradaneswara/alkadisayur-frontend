"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  Bell,
  CheckCheck,
  Clock,
  Package,
  Trash2,
} from "lucide-react";

import { StoreAccountNav } from "@/components/store-account-nav";
import { StorePageShell } from "@/components/store-page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { getErrorMessage } from "@/lib/store-catalog";
import { hasAuthSession } from "@/services/api";
import {
  deleteNotifikasi,
  listNotifikasi,
  markAllNotifikasiRead,
  markNotifikasiRead,
} from "@/services/notifikasiService";
import type { Notifikasi } from "@/types";

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notifikasi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(async (): Promise<void> => {
    try {
      const response = await listNotifikasi({ page: 1 });
      setNotifications(response.data);
      setError(null);
    } catch (loadError: unknown) {
      setError(getErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(() => {
      if (!hasAuthSession()) {
        router.replace("/store/akun/login");
        return;
      }
      return loadNotifications();
    });
  }, [loadNotifications, router]);

  async function markRead(notification: Notifikasi): Promise<void> {
    if (notification.sudah_dibaca) {
      return;
    }
    try {
      await markNotifikasiRead(notification.id);
      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id
            ? { ...item, sudah_dibaca: true, dibaca_pada: new Date().toISOString() }
            : item,
        ),
      );
    } catch (markError: unknown) {
      toast.add({
        title: "Notifikasi tidak dapat diperbarui",
        description: getErrorMessage(markError),
        type: "error",
      });
    }
  }

  async function markAllRead(): Promise<void> {
    try {
      await markAllNotifikasiRead();
      await loadNotifications();
      toast.add({
        title: "Notifikasi diperbarui",
        description: "Semua notifikasi ditandai sudah dibaca.",
        type: "success",
      });
    } catch (markError: unknown) {
      toast.add({
        title: "Notifikasi tidak dapat diperbarui",
        description: getErrorMessage(markError),
        type: "error",
      });
    }
  }

  async function removeNotification(notification: Notifikasi): Promise<void> {
    try {
      await deleteNotifikasi(notification.id);
      setNotifications((current) => current.filter((item) => item.id !== notification.id));
      toast.add({
        title: "Notifikasi dihapus",
        description: "Notifikasi berhasil dihapus.",
        type: "success",
      });
    } catch (deleteError: unknown) {
      toast.add({
        title: "Notifikasi tidak dapat dihapus",
        description: getErrorMessage(deleteError),
        type: "error",
      });
    }
  }

  const unreadCount = notifications.filter((n) => !n.sudah_dibaca).length;

  return (
    <StorePageShell>
      <div className="w-full">
        {/* Navigation Tabs Header */}
        <StoreAccountNav
          title="Notifikasi"
          badge="Pemberitahuan"
          description="Dapatkan kabar terbaru seputar perkembangan status pesanan, pembayaran, dan informasi toko Alkadi."
          action={
            unreadCount > 0 ? (
              <Button onClick={() => void markAllRead()} variant="outline" size="sm" className="gap-2">
                <CheckCheck className="size-4" />
                Tandai Semua Dibaca ({unreadCount})
              </Button>
            ) : null
          }
        />

        {error ? (
          <div
            className="mb-6 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
            role="alert"
          >
            Notifikasi gagal dimuat: {error}
          </div>
        ) : null}

        {isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton className="h-28 w-full rounded-2xl" key={index} />
            ))}
          </div>
        ) : null}

        {/* State Kosong */}
        {!isLoading && !error && notifications.length === 0 ? (
          <Card className="border border-border/80 bg-card/60">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex size-16 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                <Bell className="size-8" />
              </div>
              <h3 className="mt-4 font-heading text-xl font-bold">Belum Ada Notifikasi</h3>
              <p className="mt-1 max-w-sm text-xs text-muted-foreground sm:text-sm">
                Informasi penting dan update status belanja Anda akan muncul di sini.
              </p>
            </CardContent>
          </Card>
        ) : null}

        {/* Daftar Notifikasi Lebar Penuh */}
        {!isLoading && notifications.length > 0 ? (
          <section aria-label="Daftar notifikasi" className="flex flex-col gap-3">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`transition-all duration-200 hover:shadow-md ${
                  notification.sudah_dibaca
                    ? "border-border/80 bg-card/70"
                    : "border-primary/40 bg-primary/[0.03] ring-1 ring-primary/20"
                }`}
              >
                <CardContent className="flex items-start justify-between gap-4 p-5 sm:p-6">
                  <div className="flex items-start gap-4 flex-1">
                    <span
                      className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
                        notification.sudah_dibaca
                          ? "bg-muted text-muted-foreground"
                          : "bg-primary/15 text-primary"
                      }`}
                    >
                      <Bell className="size-5" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-heading font-bold text-base text-foreground">
                          {notification.judul}
                        </h3>
                        {!notification.sudah_dibaca ? (
                          <Badge className="bg-primary text-primary-foreground text-[10px] px-2 py-0.5">
                            Baru
                          </Badge>
                        ) : null}
                      </div>

                      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                        {notification.pesan}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Clock className="size-3.5" />
                          {new Date(notification.created_at ?? "").toLocaleString("id-ID", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </span>

                        {notification.pesanan ? (
                          <Link
                            className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                            href={`/store/pesanan/${notification.pesanan.id}`}
                            onClick={() => void markRead(notification)}
                          >
                            <span>Lihat Pesanan #{notification.pesanan.nomor_order}</span>
                            <ArrowRight className="size-3" />
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    {!notification.sudah_dibaca ? (
                      <Button
                        aria-label={`Tandai ${notification.judul} sudah dibaca`}
                        onClick={() => void markRead(notification)}
                        size="icon"
                        variant="ghost"
                        className="size-8 text-primary hover:text-primary"
                      >
                        <CheckCheck className="size-4" />
                      </Button>
                    ) : null}
                    <Button
                      aria-label={`Hapus notifikasi ${notification.judul}`}
                      onClick={() => void removeNotification(notification)}
                      size="icon"
                      variant="ghost"
                      className="size-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </section>
        ) : null}
      </div>
    </StorePageShell>
  );
}
