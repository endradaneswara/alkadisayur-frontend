"use client";

import * as React from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import type { RolePengguna } from "@/types";

type AccessGuardProps = {
  children: React.ReactNode;
  roles: RolePengguna[];
  message?: string;
};

export function AccessGuard({
  children,
  roles,
  message = "Anda tidak memiliki akses ke halaman ini.",
}: AccessGuardProps) {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-12 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
    );
  }

  const isAuthorized =
    currentUser !== null && roles.includes(currentUser.role);

  if (!isAuthorized) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
        <Alert variant="destructive">
          <AlertTitle>Akses Terbatas</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
}
