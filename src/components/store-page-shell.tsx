import type { ReactNode } from "react";

import { StoreFooter } from "@/components/store-footer";
import { StoreNavbar } from "@/components/store-navbar";
import { cn } from "@/lib/utils";

interface StorePageShellProps {
  children: ReactNode;
  className?: string;
}

export function StorePageShell({
  children,
  className,
}: StorePageShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <StoreNavbar />
      <main
        className={cn(
          "mx-auto w-full max-w-[1536px] flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-10 xl:px-12",
          className,
        )}
      >
        {children}
      </main>
      <StoreFooter />
    </div>
  );
}
