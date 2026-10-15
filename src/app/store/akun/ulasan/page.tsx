"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { MessageSquare, Pencil, Star, Trash2 } from "lucide-react";

import { StorePageShell } from "@/components/store-page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { toast } from "@/components/ui/toast";
import { getErrorMessage } from "@/lib/store-catalog";
import { hasAuthSession } from "@/services/api";
import { getProfile } from "@/services/profileService";
import {
  createUlasan,
  deleteUlasan,
  listUlasan,
  updateUlasan,
} from "@/services/ulasanService";
import type { Ulasan } from "@/types";

export default function ReviewsPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Ulasan[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPage = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      const [profileResponse, reviewsResponse] = await Promise.all([
        getProfile(),
        listUlasan({ page }),
      ]);
      setUserId(profileResponse.data.id);
      setReviews(reviewsResponse.data);
      setLastPage(reviewsResponse.meta.last_page);
      setError(null);
    } catch (loadError: unknown) {
      setError(getErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void Promise.resolve().then(() => {
      if (!hasAuthSession()) {
        router.replace("/store/akun/login");
        return;
      }
      return loadPage();
    });
  }, [loadPage, router]);

  const ownReview = reviews.find((review) => review.user_id === userId) ?? null;

  function startEdit(review: Ulasan): void {
    setEditingReviewId(review.id);
    setRating(review.rating);
    setComment(review.komentar ?? "");
  }

  function resetForm(): void {
    setEditingReviewId(null);
    setRating(5);
    setComment("");
    setError(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);
    setIsSaving(true);
    try {
      if (editingReviewId === null) {
        const response = await createUlasan({
          rating,
          komentar: comment.trim() || null,
        });
        setReviews((current) => [response.data, ...current]);
        toast.add({
          title: "Ulasan terkirim",
          description: "Terima kasih telah berbagi masukan dengan Alkadi.",
          type: "success",
        });
      } else {
        const response = await updateUlasan(editingReviewId, {
          rating,
          komentar: comment.trim() || null,
        });
        setReviews((current) =>
          current.map((review) =>
            review.id === editingReviewId ? response.data : review,
          ),
        );
        toast.add({
          title: "Ulasan diperbarui",
          description: "Perubahan ulasan berhasil disimpan.",
          type: "success",
        });
      }
      resetForm();
    } catch (saveError: unknown) {
      const message = getErrorMessage(saveError);
      setError(message);
      toast.add({
        title: "Ulasan tidak dapat disimpan",
        description: message,
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(review: Ulasan): Promise<void> {
    if (!window.confirm("Hapus ulasan Anda?")) {
      return;
    }
    try {
      await deleteUlasan(review.id);
      setReviews((current) => current.filter((item) => item.id !== review.id));
      resetForm();
      toast.add({
        title: "Ulasan dihapus",
        description: "Ulasan Anda berhasil dihapus.",
        type: "success",
      });
    } catch (deleteError: unknown) {
      toast.add({
        title: "Ulasan tidak dapat dihapus",
        description: getErrorMessage(deleteError),
        type: "error",
      });
    }
  }

  return (
    <StorePageShell>
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Akun saya
          </p>
          <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight">
            Ulasan pelanggan
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Baca pengalaman pelanggan dan bagikan masukan umum tentang Alkadi.
          </p>
        </header>

        <p className="rounded-xl border bg-muted/30 px-4 py-3 text-sm leading-6 text-muted-foreground">
          Ulasan ini ditujukan untuk toko secara umum, bukan untuk produk atau
          pesanan tertentu. Setiap akun dapat mengirim satu ulasan dan dapat
          memperbarui atau menghapus ulasannya.
        </p>

        {error ? (
          <p className="rounded-xl border border-destructive/30 bg-card px-4 py-3 text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <div className="grid items-start gap-6 lg:grid-cols-[1fr_360px]">
          <section aria-label="Ulasan pelanggan" className="flex flex-col gap-3">
            {isLoading ? (
              Array.from({ length: 3 }, (_, index) => (
                <Skeleton className="h-28 rounded-xl" key={index} />
              ))
            ) : reviews.length ? (
              reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="flex items-start justify-between gap-4 p-5">
                    <div className="min-w-0">
                      <p className="font-semibold">{review.user?.name ?? "Pelanggan Alkadi"}</p>
                      <div aria-label={`Rating ${review.rating} dari 5`} className="mt-2 flex text-primary">
                        {Array.from({ length: 5 }, (_, index) => (
                          <Star
                            aria-hidden="true"
                            className={index < review.rating ? "size-4 fill-current" : "size-4"}
                            key={index}
                          />
                        ))}
                      </div>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {review.komentar || "Tidak ada komentar tambahan."}
                      </p>
                      {review.created_at ? (
                        <p className="mt-2 text-xs text-muted-foreground">
                          {new Date(review.created_at).toLocaleDateString("id-ID", {
                            dateStyle: "medium",
                          })}
                        </p>
                      ) : null}
                    </div>
                    {review.user_id === userId ? (
                      <div className="flex shrink-0 gap-1">
                        <Button aria-label="Edit ulasan saya" onClick={() => startEdit(review)} size="icon" variant="ghost">
                          <Pencil aria-hidden="true" />
                        </Button>
                        <Button aria-label="Hapus ulasan saya" onClick={() => void handleDelete(review)} size="icon" variant="ghost">
                          <Trash2 aria-hidden="true" />
                        </Button>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
                  <MessageSquare aria-hidden="true" className="size-9 text-muted-foreground" />
                  <p className="font-medium">Belum ada ulasan pada halaman ini.</p>
                </CardContent>
              </Card>
            )}

            {!isLoading && lastPage > 1 ? (
              <nav aria-label="Halaman ulasan" className="flex items-center justify-between">
                <Button disabled={page <= 1} onClick={() => setPage((current) => current - 1)} variant="outline">
                  Sebelumnya
                </Button>
                <span className="text-sm text-muted-foreground">
                  {page} / {lastPage}
                </span>
                <Button disabled={page >= lastPage} onClick={() => setPage((current) => current + 1)} variant="outline">
                  Berikutnya
                </Button>
              </nav>
            ) : null}
          </section>

          <Card>
            <CardHeader>
              <CardTitle>{ownReview || editingReviewId ? "Perbarui ulasan" : "Tulis ulasan"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <FieldGroup>
                  <Field>
                    <FieldLabel>Penilaian</FieldLabel>
                    <ToggleGroup
                      aria-label="Pilih penilaian dari 1 sampai 5 bintang"
                      className="w-full justify-between"
                      onValueChange={(values) => {
                        if (values[0]) {
                          setRating(Number(values[0]));
                        }
                      }}
                      spacing={1}
                      value={[String(rating)]}
                      variant="outline"
                    >
                      {Array.from({ length: 5 }, (_, index) => {
                        const score = index + 1;
                        return (
                          <ToggleGroupItem
                            aria-label={`${score} bintang`}
                            className="flex-1"
                            key={score}
                            value={String(score)}
                          >
                            {score}
                          </ToggleGroupItem>
                        );
                      })}
                    </ToggleGroup>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="review-comment">Komentar (opsional)</FieldLabel>
                    <Input
                      id="review-comment"
                      maxLength={255}
                      onChange={(event) => setComment(event.target.value)}
                      placeholder="Bagikan masukan Anda"
                      value={comment}
                    />
                    <FieldDescription>{comment.length}/255 karakter</FieldDescription>
                  </Field>
                  <div className="flex flex-wrap gap-2">
                    <Button disabled={isSaving} type="submit">
                      {isSaving ? "Mengirim..." : editingReviewId !== null || ownReview ? "Simpan ulasan" : "Kirim ulasan"}
                    </Button>
                    {editingReviewId !== null ? (
                      <Button onClick={resetForm} type="button" variant="outline">
                        Batal
                      </Button>
                    ) : null}
                  </div>
                </FieldGroup>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </StorePageShell>
  );
}
