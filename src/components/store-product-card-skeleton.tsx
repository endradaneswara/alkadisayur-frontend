import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * Skeleton kartu produk store — satu sumber untuk semua state loading grid produk.
 */
export function ProductCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-9 w-full rounded-xl" />
    </div>
  );
}
