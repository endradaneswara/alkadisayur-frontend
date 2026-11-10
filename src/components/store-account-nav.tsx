"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  ClipboardList,
  UserRound,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AccountTab {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const accountTabs: AccountTab[] = [
  {
    label: "Profile",
    href: "/store/akun/profile",
    icon: UserRound,
  },
  {
    label: "Pesanan",
    href: "/store/pesanan",
    icon: ClipboardList,
  },
  {
    label: "Notifikasi",
    href: "/store/akun/notifikasi",
    icon: Bell,
  },
];

interface StoreAccountNavProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export function StoreAccountNav({
  title,
  description,
  action,
}: StoreAccountNavProps) {
  const pathname = usePathname();

  return (
    <div className="mb-8 flex flex-col gap-6">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <Link className="hover:text-primary transition-colors" href="/store">
          Beranda
        </Link>
        <span aria-hidden="true" className="px-2">
          /
        </span>
        <span className="text-muted-foreground">Akun</span>
        {title ? (
          <>
            <span aria-hidden="true" className="px-2">
              /
            </span>
            <span aria-current="page" className="font-medium text-foreground">
              {title}
            </span>
          </>
        ) : null}
      </nav>

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          {title ? (
            <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {title}
            </h1>
          ) : null}
          {description ? (
            <p className="mt-2 text-sm text-muted-foreground sm:text-base max-w-2xl">
              {description}
            </p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>

      <div className="flex w-full overflow-x-auto border-b border-border pb-px scrollbar-none">
        <nav className="flex items-center gap-2" aria-label="Menu akun pengguna">
          {accountTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive =
              tab.href === "/store/pesanan"
                ? pathname.startsWith("/store/pesanan")
                : pathname === tab.href;

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all whitespace-nowrap",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                )}
              >
                <Icon className={cn("size-4", isActive ? "text-primary-foreground" : "text-primary")} />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
