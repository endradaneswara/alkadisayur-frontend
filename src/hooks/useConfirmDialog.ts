"use client";

import * as React from "react";

export interface ConfirmDialogOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

export interface UseConfirmDialogResult {
  isOpen: boolean;
  options: ConfirmDialogOptions | null;
  isPending: boolean;
  confirm: (options: ConfirmDialogOptions, action: () => Promise<void> | void) => void;
  close: () => void;
  handleConfirm: () => Promise<void>;
}

export function useConfirmDialog(): UseConfirmDialogResult {
  const [isOpen, setIsOpen] = React.useState(false);
  const [options, setOptions] = React.useState<ConfirmDialogOptions | null>(null);
  const [isPending, setIsPending] = React.useState(false);
  const actionRef = React.useRef<(() => Promise<void> | void) | null>(null);

  const confirm = React.useCallback(
    (nextOptions: ConfirmDialogOptions, action: () => Promise<void> | void) => {
      setOptions(nextOptions);
      actionRef.current = action;
      setIsOpen(true);
    },
    [],
  );

  const close = React.useCallback(() => {
    if (isPending) return;
    setIsOpen(false);
    setOptions(null);
    actionRef.current = null;
  }, [isPending]);

  const handleConfirm = React.useCallback(async (): Promise<void> => {
    const action = actionRef.current;

    if (!action) {
      setIsOpen(false);
      return;
    }

    setIsPending(true);

    try {
      await action();
      setIsOpen(false);
      setOptions(null);
      actionRef.current = null;
    } finally {
      setIsPending(false);
    }
  }, []);

  return {
    isOpen,
    options,
    isPending,
    confirm,
    close,
    handleConfirm,
  };
}
