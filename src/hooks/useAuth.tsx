
"use client";

import * as React from "react";
import { hasAuthSession } from "@/services/api";
import { getProfile } from "@/services/profileService";
import type { PenggunaLogin } from "@/types";

type AuthContextType = {
  currentUser: PenggunaLogin | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshProfile: () => Promise<void>;
  clearUser: () => void;
};

const AuthContext = React.createContext<AuthContextType | undefined>(
  undefined,
);

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentUser, setCurrentUser] =
    React.useState<PenggunaLogin | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // Deduplikasi request profil: pemanggilan refreshProfile bersamaan
  // (mis. beberapa komponen mount di waktu yang sama) hanya menghasilkan
  // satu request API.
  const inFlightProfileRequest = React.useRef<Promise<void> | null>(null);

  const loadProfile = React.useCallback(async (): Promise<void> => {
    if (!hasAuthSession()) {
      setCurrentUser(null);
      return;
    }

    try {
      const response = await getProfile();
      setCurrentUser(response.data);
    } catch {
      // Sesi kedaluwarsa atau profil gagal dimuat; anggap sebagai guest.
      setCurrentUser(null);
    }
  }, []);

  const refreshProfile = React.useCallback(async (): Promise<void> => {
    if (inFlightProfileRequest.current) {
      await inFlightProfileRequest.current;
      return;
    }

    const request = loadProfile().finally(() => {
      inFlightProfileRequest.current = null;
    });

    inFlightProfileRequest.current = request;

    setIsLoading(true);

    try {
      await request;
    } finally {
      setIsLoading(false);
    }
  }, [loadProfile]);

  React.useEffect(() => {
    void refreshProfile();
  }, [refreshProfile]);

  const clearUser = React.useCallback((): void => {
    setCurrentUser(null);
  }, []);

  const value = React.useMemo(
    () => ({
      currentUser,
      isLoading,
      isAuthenticated: currentUser !== null,
      refreshProfile,
      clearUser,
    }),
    [currentUser, isLoading, refreshProfile, clearUser],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = React.useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth harus digunakan di dalam AuthProvider.");
  }

  return context;
}
