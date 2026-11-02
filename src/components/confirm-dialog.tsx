"use client";

import * as React from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { UseConfirmDialogResult } from "@/hooks/useConfirmDialog";

export function ConfirmDialogHost({
  dialog,
}: {
  dialog: UseConfirmDialogResult;
}) {
  return (
    <AlertDialog
      open={dialog.isOpen}
      onOpenChange={(open) => {
        if (!open) dialog.close();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {dialog.options?.title ?? "Konfirmasi"}
          </AlertDialogTitle>
          {dialog.options?.description ? (
            <AlertDialogDescription>
              {dialog.options.description}
            </AlertDialogDescription>
          ) : null}
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={dialog.close} disabled={dialog.isPending}>
            {dialog.options?.cancelLabel ?? "Batal"}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => void dialog.handleConfirm()}
            disabled={dialog.isPending}
          >
            {dialog.isPending
              ? "Memproses..."
              : (dialog.options?.confirmLabel ?? "Konfirmasi")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
