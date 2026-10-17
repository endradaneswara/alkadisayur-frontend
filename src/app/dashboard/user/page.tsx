"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Mail,
  Pencil,
  Phone,
  RotateCcw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  User,
  Users,
} from "lucide-react";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/toast";
import { getErrorMessage } from "@/lib/store-catalog";
import { hasAuthSession } from "@/services/api";
import { listPengguna, updateRolePengguna } from "@/services/penggunaService";
import { getProfile } from "@/services/profileService";
import type { Pengguna, PenggunaLogin, RolePengguna } from "@/types";

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "-";
  try {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function RoleBadge({ role }: { role: RolePengguna }) {
  if (role === "superAdmin") {
    return (
      <Badge className="border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-950/40 dark:text-purple-300">
        <ShieldAlert className="mr-1 size-3" />
        Super Admin
      </Badge>
    );
  }
  if (role === "admin") {
    return (
      <Badge className="border-primary/20 bg-primary/10 text-primary hover:bg-primary/20">
        <ShieldCheck className="mr-1 size-3" />
        Admin Cabang
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-muted-foreground">
      <User className="mr-1 size-3" />
      Customer
    </Badge>
  );
}

export default function UserManagementPage() {
  const router = useRouter();

  const [currentUser, setCurrentUser] = React.useState<PenggunaLogin | null>(null);
  const [userList, setUserList] = React.useState<Pengguna[]>([]);
  const [page, setPage] = React.useState(1);
  const [lastPage, setLastPage] = React.useState(1);
  const [total, setTotal] = React.useState(0);

  // Filters
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterRole, setFilterRole] = React.useState<string>("semua");

  // Loading & status
  const [isLoadingUser, setIsLoadingUser] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isUpdatingRole, setIsUpdatingRole] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  // Sheet edit role state
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<Pengguna | null>(null);
  const [selectedRole, setSelectedRole] = React.useState<RolePengguna>("customer");

  // Check auth
  React.useEffect(() => {
    let isCurrent = true;
    if (!hasAuthSession()) {
      router.replace("/store/akun/login");
      return;
    }
    void getProfile()
      .then((res) => {
        if (isCurrent) setCurrentUser(res.data);
      })
      .catch((err: unknown) => {
        if (isCurrent) setError(getErrorMessage(err));
      })
      .finally(() => {
        if (isCurrent) setIsLoadingUser(false);
      });
    return () => {
      isCurrent = false;
    };
  }, [router]);

  // Load users
  const loadUsers = React.useCallback(async () => {
    if (isLoadingUser || !currentUser) return;
    if (currentUser.role !== "superAdmin") {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await listPengguna({ page });
      setUserList(res.data);
      setLastPage(res.meta?.last_page ?? 1);
      setTotal(res.meta?.total ?? res.data.length);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [isLoadingUser, currentUser, page]);

  React.useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  // Client-side filtering for search & role
  const filteredUsers = React.useMemo(() => {
    return userList.filter((u) => {
      const matchSearch =
        !searchQuery.trim() ||
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.no_hp && u.no_hp.includes(searchQuery));

      const matchRole =
        filterRole === "semua" || u.role === filterRole;

      return matchSearch && matchRole;
    });
  }, [userList, searchQuery, filterRole]);

  // Handle open role sheet
  const handleOpenEdit = (user: Pengguna) => {
    setSelectedUser(user);
    setSelectedRole(user.role);
    setSheetOpen(true);
  };

  // Submit role update
  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setIsUpdatingRole(true);
    setError(null);
    try {
      await updateRolePengguna(selectedUser.id, selectedRole);
      setSheetOpen(false);
      toast.add({
        title: "Role Berhasil Diperbarui",
        description: `Peran untuk ${selectedUser.name} berhasil diubah menjadi ${selectedRole}.`,
        type: "success",
      });
      void loadUsers();
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      setError(msg);
      toast.add({
        title: "Gagal Mengubah Role",
        description: msg,
        type: "error",
      });
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const handleResetFilter = () => {
    setSearchQuery("");
    setFilterRole("semua");
    setPage(1);
  };

  const hasActiveFilter = searchQuery !== "" || filterRole !== "semua";

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />

        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
          {/* Header */}
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                Manajemen Akun
              </h1>
              <p className="text-xs text-muted-foreground sm:text-sm">
                Kelola hak akses dan peran pengguna toko Alkadi
              </p>
            </div>
          </div>

          {/* Alert Success */}
          {successMessage && (
            <Alert className="border-primary/20 bg-primary/5 text-primary">
              <ShieldCheck className="size-4 text-primary" />
              <AlertTitle>Berhasil</AlertTitle>
              <AlertDescription className="text-xs sm:text-sm">
                {successMessage}
              </AlertDescription>
            </Alert>
          )}

          {/* Alert Error */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertTitle>Terjadi Kesalahan</AlertTitle>
              <AlertDescription className="text-xs sm:text-sm">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Access Denied for Non-SuperAdmin */}
          {!isLoadingUser && currentUser && currentUser.role !== "superAdmin" ? (
            <Card className="border-border">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                  <ShieldAlert className="size-7" />
                </div>
                <h2 className="mt-4 text-base font-semibold text-foreground">
                  Akses Terbatas
                </h2>
                <p className="mt-1 max-w-sm text-xs text-muted-foreground sm:text-sm">
                  Halaman Manajemen Akun hanya dapat diakses oleh Super Administrator. Silakan hubungi pengelola sistem.
                </p>
                <Button
                  onClick={() => router.push("/dashboard")}
                  className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Kembali ke Dashboard
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border shadow-xs">
              <CardHeader className="p-4 sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-base sm:text-lg">
                      Daftar Pengguna ({total})
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Daftar seluruh akun terdaftar beserta perannya dalam sistem
                    </CardDescription>
                  </div>

                  {/* Filters */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Search */}
                    <div className="flex h-8 items-center gap-1.5 rounded-md border border-input bg-card px-2.5 shadow-xs">
                      <Search className="size-3.5 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Cari nama/email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-6 w-36 border-0 bg-transparent p-0 text-xs shadow-none focus-visible:ring-0 sm:w-48"
                      />
                    </div>

                    {/* Role Filter */}
                    <Select
                      value={filterRole}
                      onValueChange={(v) => setFilterRole(v ?? "semua")}
                    >
                      <SelectTrigger className="h-8 w-36 text-xs">
                        <SelectValue placeholder="Semua Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="semua">Semua Role</SelectItem>
                        <SelectItem value="customer">Customer</SelectItem>
                        <SelectItem value="admin">Admin Cabang</SelectItem>
                        <SelectItem value="superAdmin">Super Admin</SelectItem>
                      </SelectContent>
                    </Select>

                    {hasActiveFilter && (
                      <Button
                        onClick={handleResetFilter}
                        size="sm"
                        variant="ghost"
                        className="h-8 text-xs text-muted-foreground hover:text-foreground"
                      >
                        <RotateCcw className="mr-1 size-3.5" />
                        Reset
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-border bg-muted/40">
                        <TableHead className="w-12 text-center text-xs">No</TableHead>
                        <TableHead className="text-xs">Pengguna</TableHead>
                        <TableHead className="text-xs">Kontak</TableHead>
                        <TableHead className="text-xs">Role / Hak Akses</TableHead>
                        <TableHead className="text-xs">Terdaftar</TableHead>
                        <TableHead className="w-24 text-right text-xs">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading || isLoadingUser ? (
                        Array.from({ length: 5 }).map((_, i) => (
                          <TableRow key={i}>
                            <TableCell className="text-center">
                              <Skeleton className="mx-auto h-4 w-4" />
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-44" />
                              </div>
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-4 w-28" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-5 w-20 rounded-full" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-4 w-20" />
                            </TableCell>
                            <TableCell className="text-right">
                              <Skeleton className="ml-auto h-7 w-16" />
                            </TableCell>
                          </TableRow>
                        ))
                      ) : filteredUsers.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="py-12 text-center text-muted-foreground"
                          >
                            <div className="flex flex-col items-center justify-center gap-2">
                              <Users className="size-8 text-muted-foreground/40" />
                              <p className="text-sm font-medium">Tidak ada pengguna ditemukan</p>
                              {hasActiveFilter && (
                                <p className="text-xs text-muted-foreground">
                                  Coba ubah kata kunci pencarian atau filter role
                                </p>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUsers.map((user, idx) => (
                          <TableRow
                            key={user.id}
                            className="border-b border-border transition-colors hover:bg-muted/30"
                          >
                            <TableCell className="text-center text-xs text-muted-foreground">
                              {(page - 1) * 15 + idx + 1}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="text-xs font-semibold text-foreground sm:text-sm">
                                  {user.name}
                                </span>
                                <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                  <Mail className="size-3" />
                                  {user.email}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {user.no_hp ? (
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Phone className="size-3" />
                                  {user.no_hp}
                                </span>
                              ) : (
                                <span className="text-xs text-muted-foreground/60">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <RoleBadge role={user.role} />
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="size-3" />
                                {formatDate(user.created_at)}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenEdit(user)}
                                className="h-7 px-2 text-xs text-primary border-primary/20 hover:bg-primary/10"
                                aria-label={`Ubah role ${user.name}`}
                              >
                                <Pencil className="mr-1 size-3" />
                                Ubah Role
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>

              {/* Pagination */}
              {lastPage > 1 && (
                <CardFooter className="flex items-center justify-between border-t border-border p-4">
                  <div className="text-xs text-muted-foreground">
                    Halaman <span className="font-medium text-foreground">{page}</span> dari{" "}
                    <span className="font-medium text-foreground">{lastPage}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1 || isLoading}
                      className="h-8 px-2.5 text-xs"
                      aria-label="Halaman sebelumnya"
                    >
                      <ChevronLeft className="mr-1 size-3.5" />
                      Sebelumnya
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                      disabled={page >= lastPage || isLoading}
                      className="h-8 px-2.5 text-xs"
                      aria-label="Halaman berikutnya"
                    >
                      Selanjutnya
                      <ChevronRight className="ml-1 size-3.5" />
                    </Button>
                  </div>
                </CardFooter>
              )}
            </Card>
          )}
        </div>

        {/* Sheet Edit Role */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent className="w-full sm:max-w-md p-6">
            <SheetHeader className="mb-6">
              <SheetTitle className="text-lg font-bold">Ubah Role Pengguna</SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground">
                Perbarui hak akses dan wewenang pengguna dalam sistem Alkadi
              </SheetDescription>
            </SheetHeader>

            {selectedUser && (
              <form onSubmit={handleSaveRole} className="flex flex-col gap-5">
                <div className="rounded-lg border border-border bg-muted/40 p-3">
                  <div className="text-xs text-muted-foreground">Akun</div>
                  <div className="font-medium text-foreground">{selectedUser.name}</div>
                  <div className="text-xs text-muted-foreground">{selectedUser.email}</div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="role-select">Pilih Peran (Role)</Label>
                  <Select
                    value={selectedRole}
                    onValueChange={(v) => setSelectedRole((v ?? "customer") as RolePengguna)}
                    disabled={isUpdatingRole}
                  >
                    <SelectTrigger id="role-select" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer">
                        <div className="flex items-center gap-2">
                          <User className="size-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">Customer</div>
                            <div className="text-[11px] text-muted-foreground">
                              Hanya dapat berbelanja di toko
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="admin">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="size-4 text-primary" />
                          <div>
                            <div className="font-medium">Admin Cabang</div>
                            <div className="text-[11px] text-muted-foreground">
                              Mengelola penjualan dan pesanan cabang
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="superAdmin">
                        <div className="flex items-center gap-2">
                          <ShieldAlert className="size-4 text-purple-600" />
                          <div>
                            <div className="font-medium">Super Admin</div>
                            <div className="text-[11px] text-muted-foreground">
                              Akses penuh semua cabang dan konfigurasi
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {selectedUser.id === currentUser?.id && (
                  <Alert className="border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                    <Shield className="size-4" />
                    <AlertTitle className="text-xs font-semibold">Perhatian</AlertTitle>
                    <AlertDescription className="text-xs">
                      Anda sedang mengubah role akun Anda sendiri. Mengubahnya ke role yang lebih rendah dapat mencabut akses admin Anda.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="mt-4 flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSheetOpen(false)}
                    disabled={isUpdatingRole}
                    className="text-xs"
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    disabled={isUpdatingRole}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs"
                  >
                    {isUpdatingRole ? "Menyimpan..." : "Simpan Perubahan"}
                  </Button>
                </div>
              </form>
            )}
          </SheetContent>
        </Sheet>
      </SidebarInset>
    </SidebarProvider>
  );
}
