export const queryKeys = {
  profile: ["profile"] as const,

  keranjang: ["keranjang"] as const,

  kategori: {
    all: ["kategori"] as const,
    list: (params: object) => ["kategori", "list", params] as const,
    barang: (id: string | number, params: object) =>
      ["kategori", "barang", id, params] as const,
  },

  barang: {
    all: ["barang"] as const,
    list: (params: object) => ["barang", "list", params] as const,
    detail: (id: string | number) => ["barang", "detail", id] as const,
  },

  lokasi: {
    all: ["lokasi"] as const,
    list: (params: object) => ["lokasi", "list", params] as const,
  },

  alamat: {
    all: ["alamat"] as const,
    list: (params: object) => ["alamat", "list", params] as const,
  },

  ulasan: {
    all: ["ulasan"] as const,
    list: (params: object) => ["ulasan", "list", params] as const,
  },

  notifikasi: {
    all: ["notifikasi"] as const,
    list: (params: object) => ["notifikasi", "list", params] as const,
  },

  adminNotifikasi: {
    all: ["admin-notifikasi"] as const,
    list: (params: object) => ["admin-notifikasi", "list", params] as const,
  },

  pesanan: {
    all: ["pesanan"] as const,
    list: (params: object) => ["pesanan", "list", params] as const,
    detail: (id: string | number) => ["pesanan", "detail", id] as const,
  },

  adminPesanan: {
    all: ["admin-pesanan"] as const,
    list: (params: object) => ["admin-pesanan", "list", params] as const,
  },

  pembayaran: {
    all: ["pembayaran"] as const,
    list: (params: object) => ["pembayaran", "list", params] as const,
  },

  pengguna: {
    all: ["pengguna"] as const,
    list: (params: object) => ["pengguna", "list", params] as const,
  },

  dashboard: (rentang: string, lokasiId?: number | null) =>
    ["dashboard", rentang, lokasiId ?? null] as const,

  penjualan: {
    all: ["penjualan"] as const,
    adminList: (params: object) => ["penjualan", "admin", "list", params] as const,
    adminSummary: (params: object) =>
      ["penjualan", "admin", "summary", params] as const,
    superAdminList: (params: object) =>
      ["penjualan", "super-admin", "list", params] as const,
    superAdminSummary: (params: object) =>
      ["penjualan", "super-admin", "summary", params] as const,
  },
};
