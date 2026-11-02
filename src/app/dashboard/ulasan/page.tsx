"use client";

import * as React from "react";

import { AccessGuard } from "@/components/access-guard";
import { UlasanTable } from "@/components/ulasan-table";

export default function DashboardUlasanPage() {
  return (
    <AccessGuard roles={["superAdmin"]}>
      <div className="flex flex-1 flex-col">
        <UlasanTable isFullPage />
      </div>
    </AccessGuard>
  );
}
