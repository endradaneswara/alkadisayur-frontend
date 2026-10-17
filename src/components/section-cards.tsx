"use client"

import * as React from "react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  BanknoteIcon,
  ShoppingCartIcon,
  PackageIcon,
  FolderIcon,
  TrendingUpIcon,
} from "lucide-react"
import { formatRupiah } from "@/lib/store-catalog"
import type { Dashboard } from "@/types"

interface KartuStatistik {
  judul: string
  nilai: string
  ikon: React.ReactNode
  footerUtama: string
  footerKeterangan: string
  badge?: string
}

export function SectionCards({ dashboard }: { dashboard: Dashboard | null }) {
  const ringkasan = dashboard?.ringkasan
  const pesanan = dashboard?.pesanan

  const kartu: KartuStatistik[] = [
    {
      judul: "Total Penjualan",
      nilai: formatRupiah(ringkasan?.total_penjualan ?? 0),
      ikon: <BanknoteIcon className="size-5" />,
      footerUtama: "Akumulasi pesanan selesai",
      footerKeterangan: "Termasuk biaya pengiriman",
      badge: `${pesanan?.selesai ?? 0} pesanan selesai`,
    },
    {
      judul: "Total Pesanan",
      nilai: String(ringkasan?.total_pesanan ?? 0),
      ikon: <ShoppingCartIcon className="size-5" />,
      footerUtama: `${pesanan?.pending ?? 0} menunggu konfirmasi`,
      footerKeterangan: `${pesanan?.diproses ?? 0} diproses · ${pesanan?.dikirim ?? 0} dikirim`,
    },
    {
      judul: "Total Produk",
      nilai: String(ringkasan?.total_produk ?? 0),
      ikon: <PackageIcon className="size-5" />,
      footerUtama: `${dashboard?.stok.stok_menipis ?? 0} stok menipis`,
      footerKeterangan: `${dashboard?.stok.produk_tidak_tersedia ?? 0} tidak tersedia`,
    },
    {
      judul: "Total Kategori",
      nilai: String(ringkasan?.total_kategori ?? 0),
      ikon: <FolderIcon className="size-5" />,
      footerUtama: "Kategori produk aktif",
      footerKeterangan: "Pengelompokan katalog produk",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      {kartu.map((item) => (
        <Card key={item.judul} className="@container/card">
          <CardHeader>
            <CardDescription>{item.judul}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {item.nilai}
            </CardTitle>
            {item.badge ? (
              <CardAction>
                <Badge variant="outline">
                  <TrendingUpIcon />
                  {item.badge}
                </Badge>
              </CardAction>
            ) : null}
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              {item.footerUtama}
            </div>
            <div className="text-muted-foreground">
              {item.footerKeterangan}
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

