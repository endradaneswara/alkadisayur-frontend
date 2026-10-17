"use client"

import * as React from "react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  BellIcon,
  FileIcon,
  FolderIcon,
  LayoutDashboardIcon,
  MapPin,
  NotebookPen,
  ShoppingCartMinus,
  StarIcon,
  UsersIcon,
  Vegan,
} from "lucide-react"

import { hasAuthSession } from "@/services/api"
import { getProfile } from "@/services/profileService"
import type { PenggunaLogin } from "@/types"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [currentUser, setCurrentUser] = React.useState<PenggunaLogin | null>(null)

  React.useEffect(() => {
    let isCurrent = true
    if (hasAuthSession()) {
      void getProfile()
        .then((res) => {
          if (isCurrent) setCurrentUser(res.data)
        })
        .catch(() => undefined)
    }
    return () => {
      isCurrent = false
    }
  }, [])

  const isSuperAdmin = currentUser?.role === "superAdmin"

  // Untuk admin cabang biasa: HANYA dashboard, penjualan, pesanan, dan notifikasi
  const navMain = React.useMemo(() => {
    if (!isSuperAdmin) {
      return [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: <LayoutDashboardIcon />,
        },
        {
          title: "Penjualan",
          url: "/dashboard/penjualan",
          icon: <NotebookPen />,
        },
        {
          title: "Pesanan",
          url: "/dashboard/pesanan",
          icon: <ShoppingCartMinus />,
        },
        {
          title: "Notifikasi",
          url: "/dashboard/notifikasi",
          icon: <BellIcon />,
        },
      ]
    }

    // Untuk Super Admin: semua menu termasuk produk & kategori
    return [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: <LayoutDashboardIcon />,
      },
      {
        title: "Penjualan",
        url: "/dashboard/penjualan",
        icon: <NotebookPen />,
      },
      {
        title: "Pesanan",
        url: "/dashboard/pesanan",
        icon: <ShoppingCartMinus />,
      },
      {
        title: "Notifikasi",
        url: "/dashboard/notifikasi",
        icon: <BellIcon />,
      },
      {
        title: "Produk",
        url: "/dashboard/produk",
        icon: <FileIcon />,
      },
      {
        title: "Kategori",
        url: "/dashboard/kategori",
        icon: <FolderIcon />,
      },
    ]
  }, [isSuperAdmin])

  const documents = React.useMemo(() => {
    if (!isSuperAdmin) {
      return []
    }

    return [
      {
        name: "Management Akun",
        url: "/dashboard/user",
        icon: <UsersIcon />,
      },
      {
        name: "Management lokasi",
        url: "/dashboard/lokasi",
        icon: <MapPin />,
      },
      {
        name: "Ulasan",
        url: "/store/akun/ulasan",
        icon: <StarIcon />,
      },
    ]
  }, [isSuperAdmin])

  const user = React.useMemo(() => {
    return {
      name: currentUser?.name || "Admin",
      email: currentUser?.email || "admin@alkadi.com",
      avatar: currentUser?.avatar || "/avatars/shadcn.jpg",
    }
  }, [currentUser])

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<a href="/store" />}
            >
              <Vegan className="size-5!" />
              <span className="text-base font-semibold">Alkadi</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        {documents.length > 0 && <NavDocuments items={documents} />}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} currentUser={currentUser} />
      </SidebarFooter>
    </Sidebar>
  )
}
