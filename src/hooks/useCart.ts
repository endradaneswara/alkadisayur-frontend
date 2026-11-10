"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";
import { hasAuthSession } from "@/services/api";
import {
  addItemKeranjang,
  clearKeranjang,
  getKeranjang,
  removeItemKeranjang,
  updateItemKeranjang,
} from "@/services/keranjangService";
import type { Keranjang } from "@/types";

export interface UseCartResult {
  cart: Keranjang | null;
  items: Keranjang["items"];
  totalItem: number;
  totalHarga: number;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  isAdding: boolean;
  isUpdating: boolean;
  isClearing: boolean;
  addItem: (barangId: number, jumlah?: number) => Promise<Keranjang | null>;
  updateItem: (itemId: number, jumlah: number) => Promise<boolean>;
  removeItem: (itemId: number) => Promise<boolean>;
  clear: () => Promise<boolean>;
  refetch: () => void;
}

export function useCart(): UseCartResult {
  const queryClient = useQueryClient();
  const isAuthenticated = hasAuthSession();

  const cartQuery = useQuery({
    queryKey: queryKeys.keranjang,
    queryFn: async () => {
      const response = await getKeranjang();
      return response.data;
    },
    enabled: isAuthenticated,
    staleTime: 30 * 1000,
  });

  const invalidate = React.useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.keranjang });
  }, [queryClient]);

  const addItemMutation = useMutation({
    mutationFn: async ({ barangId, jumlah }: { barangId: number; jumlah: number }) => {
      const response = await addItemKeranjang(barangId, jumlah);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.keranjang, data);
    },
    onError: invalidate,
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ itemId, jumlah }: { itemId: number; jumlah: number }) => {
      const response = await updateItemKeranjang(itemId, jumlah);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.keranjang, data);
    },
    onError: invalidate,
  });

  const removeItemMutation = useMutation({
    mutationFn: async (itemId: number) => {
      await removeItemKeranjang(itemId);
    },
    onSuccess: invalidate,
  });

  const clearMutation = useMutation({
    mutationFn: async () => {
      await clearKeranjang();
    },
    onSuccess: invalidate,
  });

  const addItem = React.useCallback(
    async (barangId: number, jumlah = 1): Promise<Keranjang | null> => {
      try {
        return await addItemMutation.mutateAsync({ barangId, jumlah });
      } catch {
        return null;
      }
    },
    [addItemMutation],
  );

  const updateItem = React.useCallback(
    async (itemId: number, jumlah: number): Promise<boolean> => {
      try {
        await updateItemMutation.mutateAsync({ itemId, jumlah });
        return true;
      } catch {
        return false;
      }
    },
    [updateItemMutation],
  );

  const removeItem = React.useCallback(
    async (itemId: number): Promise<boolean> => {
      try {
        await removeItemMutation.mutateAsync(itemId);
        return true;
      } catch {
        return false;
      }
    },
    [removeItemMutation],
  );

  const clear = React.useCallback(async (): Promise<boolean> => {
    try {
      await clearMutation.mutateAsync();
      return true;
    } catch {
      return false;
    }
  }, [clearMutation]);

  const cart = cartQuery.data ?? null;
  const totalHarga = Number(cart?.total_harga ?? 0);

  return {
    cart,
    items: cart?.items ?? [],
    totalItem: cart?.items ? cart.items.length : (cart?.total_item ?? 0),
    totalHarga,
    isLoading: cartQuery.isLoading,
    isError: cartQuery.isError,
    error: cartQuery.error instanceof Error ? cartQuery.error.message : null,
    isAdding: addItemMutation.isPending,
    isUpdating: updateItemMutation.isPending || removeItemMutation.isPending,
    isClearing: clearMutation.isPending,
    addItem,
    updateItem,
    removeItem,
    clear,
    refetch: () => void cartQuery.refetch(),
  };
}
