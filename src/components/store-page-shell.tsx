import type { ReactNode } from "react";

import { StoreFooter } from "@/components/store-footer";
import { StoreNavbar } from "@/components/store-navbar";

interface StorePageShellProps {
  children: ReactNode;
}

export function StorePageShell({ children }: StorePageShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <StoreNavbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {children}
      </main>
      <StoreFooter />
    </div>
  );
}
