export type NilaiUang = number | string;

export type RolePengguna = 'customer' | 'admin' | 'superAdmin';

export type StatusBarang = 'tersedia' | 'tidak_tersedia';

export type MetodePesanan = 'pesan_antar' | 'ambil_ditoko';

export type StatusPesanan =
  | 'pending'
  | 'diproses'
  | 'dikirim'
  | 'selesai'
  | 'dibatalkan';

export type MetodePembayaran = 'QRIS' | 'Transfer' | 'COD';

export type StatusPembayaran = 'pending' | 'berhasil' | 'gagal' | 'expired';

export interface Kategori {
  id: number;
  nama_kategori: string;
  created_at?: string | null;
  updated_at?: string | null;
}

/** Data produk yang dikirim API untuk admin. */
export interface Barang {
  id: number;
  kategori_id: number;
  nama_kategori?: string | null;
  KodeItem: string;
  Barcode: string;
  SKU: string;
  NamaItem: string;
  Merek: string | null;
  Stok: number;
  Rak: string | null;
  TipeItem: string | null;
  HargaBeli: NilaiUang;
  HargaJual: NilaiUang;
  Keterangan: string | null;
  Foto: string | null;
  Status: StatusBarang;
  created_at?: string | null;
  updated_at?: string | null;
}

/**
 * Data produk untuk customer.
 * API customer tidak menyertakan stok, kode item, barcode, SKU,
 * rak, atau harga beli.
 */
export interface BarangCustomer {
  id: number;
  kategori_id: number;
  nama_kategori?: string | null;
  NamaItem: string;
  Merek: string | null;
  TipeItem: string | null;
  HargaJual: NilaiUang;
  Keterangan: string | null;
  Foto: string | null;
  Status: StatusBarang;
  Stok?: number;
}

export interface Pengguna {
  id: number;
  name: string;
  email: string;
  no_hp: string | null;
  role: RolePengguna;
  created_at?: string | null;
  updated_at?: string | null;
}

/** Bentuk pengguna pada respons login dan registrasi. */
export interface PenggunaLogin {
  id: number;
  name: string;
  email: string;
  role: RolePengguna;
  no_hp: string | null;
  avatar: string | null;
  email_verified_at: string | null;
  lokasi_id?: number | null;
  lokasi?: Lokasi | null;
}

export interface ResponsAutentikasi {
  user: PenggunaLogin;
  token?: string;
}

export interface Alamat {
  id: number;
  user_id: number;
  nama_alamat: string;
  nama_penerima: string;
  no_hp: string;
  alamat_lengkap: string;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface Lokasi {
  id: number;
  nama: string;
  latitude: NilaiUang;
  longitude: NilaiUang;
  deskripsi: string | null;
  biaya_pengiriman: NilaiUang;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface KeranjangItem {
  id: number;
  barang_id: number;
  nama_barang: string | null;
  jumlah: number;
  harga: NilaiUang;
  subtotal: NilaiUang;
}

export interface Keranjang {
  id: number;
  user_id: number;
  items: KeranjangItem[];
  total_item: number;
  total_harga: NilaiUang;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface PesananItem {
  id: number;
  pesanan_id: number;
  barang_id: number;
  nama_barang: string;
  jumlah: number;
  harga: NilaiUang;
  subtotal: NilaiUang;
  barang?: {
    NamaItem: string;
  } | null;
}

export interface Pembayaran {
  id: number;
  pesanan_id: number;
  metode_pembayaran: MetodePembayaran;
  status: StatusPembayaran;
  jumlah: NilaiUang;
  transaksi_id: string;
  tanggal_pembayaran: string;
  pesanan?: {
    id: number;
    nomor_order: string;
    status: StatusPesanan;
  } | null;
}

export interface Pesanan {
  id: number;
  user_id: number;
  nomor_order: string;
  pelanggan?: {
    id: number;
    nama: string;
    email: string;
  } | null;
  metode: MetodePesanan;
  status: StatusPesanan;
  total_harga: NilaiUang;
  biaya_pengiriman: NilaiUang;
  catatan: string | null;
  tanggal_pemesanan: string;
  alamat?: Alamat | null;
  lokasi_toko?: Lokasi | null;
  items?: PesananItem[];
  pembayaran?: Pembayaran | null;
}

export interface Ulasan {
  id: number;
  user_id: number;
  rating: number;
  komentar: string | null;
  user?: {
    id: number;
    name: string;
  } | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface Notifikasi {
  id: number;
  user_id: number;
  pesanan_id: number;
  judul: string;
  pesan: string;
  dibaca_pada: string | null;
  sudah_dibaca: boolean;
  pesanan?: {
    id: number;
    nomor_order: string;
    status: StatusPesanan;
  } | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface Dashboard {
  ringkasan: {
    total_produk: number;
    total_kategori: number;
    total_pengguna: number;
    total_pesanan: number;
    total_penjualan: NilaiUang;
  };
  pengguna: {
    total: number;
    admin: number;
    customer: number;
  };
  pesanan: {
    total: number;
    pending: number;
    diproses: number;
    dikirim: number;
    selesai: number;
    dibatalkan: number;
  };
  stok: {
    stok_menipis: number;
    produk_tidak_tersedia: number;
  };
  grafik_penjualan: DataGrafikPenjualan[];
  pesanan_terbaru: Pesanan[];
  lokasi_terpilih?: Lokasi | null;
  penjualan_per_cabang?: {
    id: number;
    nama: string;
    total_pesanan: number;
    total_penjualan: NilaiUang;
  }[];
}

export type RentangGrafik = "1h" | "7h" | "30h";

export interface DataGrafikPenjualan {
  tanggal: string;
  total_penjualan: number;
  total_pesanan: number;
}

export interface Penjualan {
  id: number;
  nomor_order: string;
  pelanggan?: {
    id: number;
    nama: string;
    email: string;
  } | null;
  metode: MetodePesanan;
  total_harga: NilaiUang;
  biaya_pengiriman: NilaiUang;
  total_pendapatan: NilaiUang;
  tanggal_pemesanan: string;
  items?: PesananItem[];
  pembayaran?: Pembayaran | null;
  alamat?: Alamat | null;
  lokasi_toko?: Lokasi | null;
}

export interface RingkasanPenjualan {
  total_transaksi: number;
  total_penjualan: NilaiUang;
  total_pengiriman: NilaiUang;
  total_pendapatan: NilaiUang;
}

/** Respons standar endpoint API non-paginated. */
export interface ResponsApi<T> {
  success: boolean;
  message: string;
  data: T;
}

/** Respons standar endpoint API paginated Laravel. */
export interface ResponsApiPaginated<T> {
  success: boolean;
  message: string;
  data: T[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number | null;
    last_page: number;
    path: string;
    per_page: number;
    to: number | null;
    total: number;
  };
}