"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Bell, CheckCheck, Trash2 } from "lucide-react";

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
    } catch (deleteError: unknown) {
      toast.add({
        title: "Notifikasi tidak dapat dihapus",
        description: getErrorMessage(deleteError),
        type: "error",
      });
    }
  }

  return (
    <StorePageShell>
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Akun saya
            </p>
            <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight">
              Notifikasi
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Informasi terbaru mengenai pesanan Anda.
            </p>
          </div>
          {notifications.some((item) => !item.sudah_dibaca) ? (
            <Button onClick={() => void markAllRead()} variant="outline">
              <CheckCheck aria-hidden="true" data-icon="inline-start" />
              Tandai semua dibaca
            </Button>
          ) : null}
        </header>

        {error ? (
          <p className="rounded-xl border border-destructive/30 bg-card px-4 py-3 text-sm text-destructive" role="alert">
            Notifikasi gagal dimuat: {error}
          </p>
        ) : null}

        {isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton className="h-24 rounded-xl" key={index} />
            ))}
          </div>
        ) : null}

        {!isLoading && !error && notifications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
              <Bell aria-hidden="true" className="size-10 text-muted-foreground" />
              <h2 className="font-semibold">Belum ada notifikasi</h2>
              <p className="text-sm text-muted-foreground">
                Pembaruan pesanan akan ditampilkan di halaman ini.
              </p>
            </CardContent>
          </Card>
        ) : null}

        {!isLoading ? (
          <section aria-label="Daftar notifikasi" className="flex flex-col gap-3">
            {notifications.map((notification) => (
              <Card
                className={notification.sudah_dibaca ? "" : "border-primary/40"}
                key={notification.id}
              >
                <CardContent className="flex items-start justify-between gap-4 p-4 sm:p-5">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold">{notification.judul}</h2>
                      {!notification.sudah_dibaca ? <Badge variant="secondary">Baru</Badge> : null}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {notification.pesan}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {new Date(notification.created_at ?? "").toLocaleString("id-ID", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                    {notification.pesanan ? (
                      <Link
                        className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
                        href={`/store/pesanan/${notification.pesanan.id}`}
                        onClick={() => void markRead(notification)}
                      >
                        Lihat pesanan {notification.pesanan.nomor_order}
                      </Link>
                    ) : null}
                  </div>
                  <div className="flex shrink-0">
                    {!notification.sudah_dibaca ? (
                      <Button
                        aria-label={`Tandai ${notification.judul} sudah dibaca`}
                        onClick={() => void markRead(notification)}
                        size="icon"
                        variant="ghost"
                      >
                        <CheckCheck aria-hidden="true" />
                      </Button>
                    ) : null}
                    <Button
                      aria-label={`Hapus notifikasi ${notification.judul}`}
                      onClick={() => void removeNotification(notification)}
                      size="icon"
                      variant="ghost"
                    >
                      <Trash2 aria-hidden="true" />
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
