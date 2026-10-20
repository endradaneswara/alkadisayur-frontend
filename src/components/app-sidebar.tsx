
"use client";

import * as React from "react";

import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

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
} from "lucide-react";

import type { PenggunaLogin } from "@/types";

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  currentUser: PenggunaLogin;
};

export function AppSidebar({
  currentUser,
  ...props
}: AppSidebarProps) {
  const isSuperAdmin = currentUser.role === "superAdmin";

  const navMain = React.useMemo(() => {
    const items = [
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
    ];

    if (isSuperAdmin) {
      items.push(
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
      );
    }

    return items;
  }, [isSuperAdmin]);

  const documents = React.useMemo(() => {
    if (!isSuperAdmin) {
      return [];
    }

    return [
      {
        name: "Management Akun",
        url: "/dashboard/user",
        icon: <UsersIcon />,
      },
      {
        name: "Management Lokasi",
        url: "/dashboard/lokasi",
        icon: <MapPin />,
      },
      {
        name: "Ulasan",
        url: "/store/akun/ulasan",
        icon: <StarIcon />,
      },
    ];
  }, [isSuperAdmin]);

  const user = React.useMemo(
    () => ({
      name: currentUser.name || "Admin",
      email: currentUser.email || "admin@alkadi.com",
      avatar: currentUser.avatar || "/avatars/shadcn.jpg",
    }),
    [currentUser],
  );

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
              <span className="text-base font-semibold">
                Alkadi
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navMain} />

        {documents.length > 0 && (
          <NavDocuments items={documents} />
        )}
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
