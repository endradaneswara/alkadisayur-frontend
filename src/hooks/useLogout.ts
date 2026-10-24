"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/hooks/useAuth";
import { clearAuthSession } from "@/services/api";
import { logout } from "@/services/authService";

export function useLogout(): {
  logout: () => Promise<void>;
  isPending: boolean;
} {
  const queryClient = useQueryClient();
  const { clearUser } = useAuth();
  const [isPending, setIsPending] = React.useState(false);

  const performLogout = React.useCallback(async (): Promise<void> => {
    setIsPending(true);

    try {
      await logout();
    } finally {
      clearAuthSession();
      clearUser();
      queryClient.clear();
    }
  }, [clearUser, queryClient]);

  return { logout: performLogout, isPending };
}
