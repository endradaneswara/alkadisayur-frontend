"use client";

import * as React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/store-catalog";
import { cn } from "@/lib/utils";

type ErrorBannerProps = {
  error: unknown;
  onRetry?: () => void;
  className?: string;
};

/**
 * Banner error store yang konsisten dengan role="alert".
 * Pesan diambil via getErrorMessage agar format sama dengan halaman lain.
 */
export function StoreErrorBanner({
  error,
  onRetry,
  className,
}: ErrorBannerProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3",
        className,
      )}
      role="alert"
    >
      <AlertCircle aria-hidden="true" className="size-5 shrink-0 text-destructive" />
      <p className="flex-1 text-sm text-destructive">{getErrorMessage(error)}</p>
      {onRetry ? (
        <Button
          className="h-8 shrink-0 gap-1.5 px-3 text-xs"
          onClick={onRetry}
          size="sm"
          variant="outline"
        >
          <RefreshCw aria-hidden="true" className="size-3.5" />
          Coba lagi
        </Button>
      ) : null}
    </div>
  );
}
