"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  Edit3,
  MessageSquare,
  Send,
  Sparkles,
  Star,
  Trash2,
} from "lucide-react";

import { ConfirmDialogHost } from "@/components/confirm-dialog";
import { StoreAccountNav } from "@/components/store-account-nav";
import { StorePageShell } from "@/components/store-page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";
import { toast } from "@/components/ui/toast";
import { queryKeys } from "@/lib/query-keys";
import { hasAuthSession } from "@/services/api";
import {
  createUlasan,
  deleteUlasan,
  listUlasan,
  updateUlasan,
} from "@/services/ulasanService";

const ratingLabels = ["Sangat Buruk", "Buruk", "Cukup", "Bagus", "Sangat Bagus"];

export default function ReviewsPage() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const confirmDialog = useConfirmDialog();

  useEffect(() => {
    if (!hasAuthSession()) {
      router.replace("/store");
    }
  }, [router]);

  const reviewsQuery = useQuery({
    queryKey: queryKeys.ulasan.list({ page: 1 }),
    queryFn: async () => {
      const response = await listUlasan({ page: 1 });
      return response.data;
    },
    enabled: hasAuthSession() && currentUser !== null,
  });

  const uid = currentUser?.id;
  const ownReview = useMemo(() => {
    if (uid === undefined) return null;
    return reviewsQuery.data?.find((review) => review.user_id === uid) ?? null;
  }, [reviewsQuery.data, uid]);

  // Sinkronkan form dengan ulasan yang sudah ada saat data pertama dimuat.
  useEffect(() => {
    if (ownReview && !isEditing) {
      setRating(ownReview.rating);
      setComment(ownReview.komentar ?? "");
    }
  }, [ownReview, isEditing]);

  const isLoading = reviewsQuery.isLoading;

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = { rating, komentar: comment.trim() || null };
      if (isEditing && ownReview) {
        return updateUlasan(ownReview.id, payload);
      }
      return createUlasan(payload);
    },
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.ulasan.all });
      setIsEditing(false);

      if (isEditing) {
        toast.add({ title: "Ulasan diperbarui", type: "success" });
      } else {
        toast.add({
          title: "Ulasan terkirim",
          description: "Terima kasih sudah berbagi pengalaman!",
          type: "success",
        });
      }
      void response;
    },
    onError: (saveError: Error) => {
      setError(saveError.message);
      toast.add({ title: "Gagal menyimpan ulasan", description: saveError.message, type: "error" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (ulasanId: number) => {
      await deleteUlasan(ulasanId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.ulasan.all });
      setRating(5);
      setComment("");
      setIsEditing(false);
      toast.add({ title: "Ulasan dihapus", type: "success" });
    },
    onError: (deleteError: Error) => {
      toast.add({ title: "Gagal menghapus ulasan", description: deleteError.message, type: "error" });
    },
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    setError(null);
    void saveMutation.mutateAsync();
  }

  function handleDelete(): void {
    if (!ownReview) return;

    void confirmDialog.confirm(
      {
        title: "Hapus ulasan Anda?",
        description: "Ulasan akan dihapus secara permanen.",
        confirmLabel: "Hapus",
      },
      async () => {
        await deleteMutation.mutateAsync(ownReview.id);
      },
    );
  }

  const isSaving = saveMutation.isPending;
  const isDeleting = deleteMutation.isPending;
  const displayRating = hoverRating || rating;

  return (
    <StorePageShell>
      <div className="w-full">
        <StoreAccountNav
          title="Ulasan Toko"
          badge="Kepuasan Pelanggan"
          description="Bagikan pengalaman belanja Anda untuk membantu kami terus meningkatkan kualitas layanan Alkadi."
        />

        {isLoading ? (
          <div className="mx-auto max-w-2xl space-y-4">
            <Skeleton className="h-10 w-48 rounded-xl" />
            <Skeleton className="h-64 w-full rounded-3xl" />
          </div>
        ) : (
          <div className="mx-auto max-w-2xl">
            {/* Ulasan sudah ada & tidak sedang edit */}
            {ownReview && !isEditing ? (
              <div className="space-y-6">
                {/* Kartu Ulasan Saya */}
                <Card className="overflow-hidden border border-primary/30 bg-primary/[0.02] shadow-xs">
                  <CardHeader className="border-b border-border bg-primary/5 pb-4">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <CheckCircle2 className="size-5 text-primary" />
                      Ulasan Anda
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-5">
                    {/* Rating bintang besar */}
                    <div className="flex flex-col items-center gap-3 py-4">
                      <div
                        aria-label={`Rating ${ownReview.rating} dari 5`}
                        className="flex items-center gap-1.5"
                        role="img"
                      >
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            aria-hidden="true"
                            key={i}
                            className={`size-10 transition-colors ${
                              i < ownReview.rating
                                ? "fill-primary text-primary"
                                : "text-muted-foreground/20"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm font-semibold text-foreground">
                        {ratingLabels[ownReview.rating - 1]} ({ownReview.rating}/5)
                      </p>
                    </div>

                    {/* Komentar */}
                    {ownReview.komentar ? (
                      <div className="rounded-2xl border border-border bg-muted/20 p-4">
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          "{ownReview.komentar}"
                        </p>
                      </div>
                    ) : (
                      <p className="text-center text-xs text-muted-foreground italic">
                        Tidak ada komentar tertulis.
                      </p>
                    )}

                    {/* Tanggal */}
                    {ownReview.created_at && (
                      <p className="text-center text-[11px] text-muted-foreground">
                        Dikirim pada{" "}
                        {new Date(ownReview.created_at).toLocaleDateString("id-ID", {
                          dateStyle: "long",
                        })}
                      </p>
                    )}

                    {/* Tombol aksi */}
                    <div className="flex gap-3 pt-2">
                      <Button
                        className="flex-1 gap-2"
                        onClick={() => setIsEditing(true)}
                        variant="outline"
                      >
                        <Edit3 className="size-4" />
                        Ubah Ulasan
                      </Button>
                      <Button
                        className="gap-2 text-destructive hover:text-destructive"
                        disabled={isDeleting}
                        onClick={handleDelete}
                        variant="outline"
                      >
                        <Trash2 className="size-4" />
                        {isDeleting ? "Menghapus..." : "Hapus"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Informasi lanjutan */}
                <div className="rounded-2xl border border-border bg-card p-5 text-center text-sm text-muted-foreground">
                  Ulasan Anda tampil di halaman{" "}
                  <Link
                    href="/store/tentang-kami"
                    className="font-semibold text-primary hover:underline"
                  >
                    Tentang Kami
                  </Link>{" "}
                  dan membantu calon pelanggan lain mengenal Alkadi lebih baik.
                </div>
              </div>
            ) : (
              /* Form Kirim / Edit Ulasan */
              <Card className="overflow-hidden border border-border/80 shadow-xs">
                <CardHeader className="border-b border-border bg-muted/20 pb-4">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Sparkles className="size-4 text-primary" />
                    {isEditing ? "Perbarui Ulasan Anda" : "Tulis Ulasan untuk Alkadi"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Pilih Rating */}
                    <div>
                      <p className="mb-3 text-sm font-semibold text-foreground">
                        Berikan Penilaian
                      </p>
                      <div
                        aria-label={`Pilih rating: ${displayRating} dari 5`}
                        className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-muted/20 p-4"
                        role="radiogroup"
                      >
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setRating(star)}
                            className="flex flex-col items-center gap-1 p-1 transition-transform hover:scale-110"
                            aria-label={`${star} bintang`}
                          >
                            <Star
                              aria-hidden="true"
                              className={`size-9 transition-colors ${
                                star <= displayRating
                                  ? "fill-primary text-primary"
                                  : "text-muted-foreground/30 hover:text-primary/60"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                      <p className="mt-2 text-center text-sm font-medium text-muted-foreground">
                        {ratingLabels[displayRating - 1] ?? "Pilih rating"}
                      </p>
                    </div>

                    {/* Komentar */}
                    <div>
                      <label
                        htmlFor="review-comment"
                        className="mb-1.5 block text-sm font-semibold text-foreground"
                      >
                        Pengalaman Belanja Anda
                        <span className="ml-1 text-xs font-normal text-muted-foreground">
                          (opsional)
                        </span>
                      </label>
                      <textarea
                        id="review-comment"
                        maxLength={255}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Ceritakan kepuasan Anda mengenai kesegaran produk, ketepatan pengiriman, atau keramahan layanan Alkadi..."
                        value={comment}
                        className="min-h-[130px] w-full rounded-xl border border-input bg-transparent px-4 py-3 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring"
                      />
                      <p className="mt-1 text-right text-[11px] text-muted-foreground">
                        {comment.length}/255 karakter
                      </p>
                    </div>

                    {error && (
                      <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive" role="alert">
                        {error}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-3 pt-2">
                      <Button
                        className="flex-1 gap-2"
                        disabled={isSaving}
                        type="submit"
                      >
                        {isSaving ? (
                          "Menyimpan..."
                        ) : (
                          <>
                            <Send className="size-4" />
                            {isEditing ? "Simpan Perubahan" : "Kirim Ulasan"}
                          </>
                        )}
                      </Button>
                      {isEditing && (
                        <Button
                          onClick={() => {
                            setIsEditing(false);
                            setRating(ownReview?.rating ?? 5);
                            setComment(ownReview?.komentar ?? "");
                          }}
                          type="button"
                          variant="outline"
                        >
                          Batal
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Prompt belanja dulu jika belum punya pesanan */}
            {!isLoading && !ownReview && !isEditing && (
              <div className="mt-5 rounded-2xl border border-border bg-card p-5 text-center text-sm text-muted-foreground">
                <MessageSquare className="mx-auto mb-2 size-6 text-primary/50" />
                Belum pernah berbelanja? Ulasan terbaik lahir dari pengalaman nyata.{" "}
                <Link href="/store/produk" className="font-semibold text-primary hover:underline">
                  Mulai belanja sekarang →
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmDialogHost dialog={confirmDialog} />
    </StorePageShell>
  );
}
