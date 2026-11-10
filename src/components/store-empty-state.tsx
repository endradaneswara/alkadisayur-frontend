"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
};

export function StoreEmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-3xl border border-border bg-card py-16 text-center sm:py-20",
        className,
      )}
    >
      <div className="flex size-20 items-center justify-center rounded-3xl bg-primary/10 text-primary">
        <Icon aria-hidden="true" className="size-10" />
      </div>
      <h3 className="mt-6 font-heading text-xl font-semibold text-foreground">
        {title}
      </h3>
      {description ? (
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      ) : null}
      {action ? (
        <Button className="mt-6" onClick={action.onClick} size="lg">
          {action.label}
        </Button>
      ) : null}
    </div>
  );
}
