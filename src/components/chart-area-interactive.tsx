"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { Skeleton } from "@/components/ui/skeleton"
import { formatRupiah } from "@/lib/store-catalog"
import type { DataGrafikPenjualan, RentangGrafik } from "@/types"

const konfigurasiGrafik = {
  penjualan: {
    label: "Total Penjualan",
    color: "var(--primary)",
  },
} satisfies ChartConfig

const opsiRentang: { nilai: RentangGrafik; label: string }[] = [
  { nilai: "1h", label: "1 hari" },
  { nilai: "7h", label: "7 hari" },
  { nilai: "30h", label: "30 hari" },
]

export function ChartPenjualan({
  data,
  rentang,
  onRentangChange,
  isLoading,
}: {
  data: DataGrafikPenjualan[]
  rentang: RentangGrafik
  onRentangChange: (rentang: RentangGrafik) => void
  isLoading?: boolean
}) {
  const totalPenjualan = React.useMemo(
    () => data.reduce((total, item) => total + item.total_penjualan, 0),
    [data],
  )

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Grafik Penjualan</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            {formatRupiah(totalPenjualan)} dari pesanan selesai
          </span>
          <span className="@[540px]/card:hidden">
            {formatRupiah(totalPenjualan)}
          </span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            multiple={false}
            value={[rentang]}
            onValueChange={(value) => {
              if (value[0]) {
                onRentangChange(value[0] as RentangGrafik)
              }
            }}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
          >
            {opsiRentang.map((opsi) => (
              <ToggleGroupItem key={opsi.nilai} value={opsi.nilai}>
                {opsi.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <Select
            value={rentang}
            onValueChange={(value) => onRentangChange(value as RentangGrafik)}
          >
            <SelectTrigger
              className="flex w-32 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Pilih rentang"
            >
              <SelectValue placeholder="Rentang" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {opsiRentang.map((opsi) => (
                <SelectItem
                  key={opsi.nilai}
                  value={opsi.nilai}
                  className="rounded-lg"
                >
                  {opsi.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {isLoading ? (
          <Skeleton className="h-[250px] w-full rounded-xl" />
        ) : (
          <ChartContainer
            config={konfigurasiGrafik}
            className="aspect-auto h-[250px] w-full"
          >
            <AreaChart data={data}>
              <defs>
                <linearGradient id="fillPenjualan" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-penjualan)"
                    stopOpacity={1.0}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-penjualan)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="tanggal"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value: string) =>
                  new Date(value).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                  })
                }
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) =>
                      new Date(value).toLocaleDateString("id-ID", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })
                    }
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="total_penjualan"
                type="natural"
                fill="url(#fillPenjualan)"
                stroke="var(--color-penjualan)"
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
