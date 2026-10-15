import {
  clearSession,
  googleUrl,
  login,
  logout,
  register,
  setSession,
} from './authService';
import {
  addItemKeranjang,
  clearKeranjang,
  getKeranjang,
  removeItemKeranjang,
  updateItemKeranjang,
} from './keranjangService';
import {
  createAlamat,
  deleteAlamat,
  getAlamat,
  listAlamat,
  updateAlamat,
} from './alamatService';
import {
  createBarang,
  deleteBarang,
  getBarang,
  listBarang,
  updateBarang,
} from './barangService';
import {
  createKategori,
  deleteKategori,
  getKategori,
  listBarangByKategori,
  listKategori,
  updateKategori,
} from './kategoriService';
import {
  createLokasi,
  deleteLokasi,
  getLokasi,
  listLokasi,
  updateBiayaPengiriman,
  updateLokasi,
} from './lokasiService';
import {
  createPembayaran,
  getPembayaran,
  listPembayaran,
  updateStatusPembayaran,
} from './pembayaranService';
import {
  createPesanan,
  cancelPesanan,
  getPesanan,
  listAdminPesanan,
  listPesanan,
  getAdminPesanan,
  updateAdminPesananStatus,
} from './pesananService';
import {
  createUlasan,
  deleteUlasan,
  getUlasan,
  listUlasan,
  updateUlasan,
} from './ulasanService';
import {
  deleteNotifikasi,
  deleteAdminNotifikasi,
  getAdminNotifikasi,
  getNotifikasi,
  listAdminNotifikasi,
  listNotifikasi,
  markAdminNotifikasiRead,
  markAllAdminNotifikasiRead,
  markAllNotifikasiRead,
  markNotifikasiRead,
} from './notifikasiService';
import { getDashboard } from './dashboardService';
import {
  getPenjualanAdmin,
  getPenjualanSuperAdmin,
  getRingkasanPenjualanAdmin,
  getRingkasanPenjualanSuperAdmin,
  listPenjualanAdmin,
  listPenjualanSuperAdmin,
} from './penjualanService';
import {
  getPengguna,
  listPengguna,
  updateRolePengguna,
} from './penggunaService';
import {
  confirmImportBarang,
  downloadTemplateBarang,
  exportBarang,
  previewImportBarang,
} from './dataService';
import { forgotPassword, resetPassword, updatePassword } from './passwordService';
import { getProfile, updateProfile } from './profileService';

export const api = {
  auth: { register, login, logout, googleUrl, setSession, clearSession },
  password: {
    forgot: forgotPassword,
    reset: resetPassword,
    update: updatePassword,
  },
  profile: { get: getProfile, update: updateProfile },
  kategori: {
    list: listKategori,
    get: getKategori,
    barang: listBarangByKategori,
    create: createKategori,
    update: updateKategori,
    delete: deleteKategori,
  },
  barang: {
    list: listBarang,
    get: getBarang,
    create: createBarang,
    update: updateBarang,
    delete: deleteBarang,
  },
  lokasi: {
    list: listLokasi,
    get: getLokasi,
    create: createLokasi,
    update: updateLokasi,
    updateBiayaPengiriman,
    delete: deleteLokasi,
  },
  alamat: {
    list: listAlamat,
    get: getAlamat,
    create: createAlamat,
    update: updateAlamat,
    delete: deleteAlamat,
  },
  keranjang: {
    get: getKeranjang,
    addItem: addItemKeranjang,
    updateItem: updateItemKeranjang,
    removeItem: removeItemKeranjang,
    clear: clearKeranjang,
  },
  pesanan: {
    list: listPesanan,
    create: createPesanan,
    get: getPesanan,
    cancel: cancelPesanan,
  },
  pembayaran: {
    list: listPembayaran,
    create: createPembayaran,
    get: getPembayaran,
    updateStatus: updateStatusPembayaran,
  },
  ulasan: {
    list: listUlasan,
    get: getUlasan,
    create: createUlasan,
    update: updateUlasan,
    delete: deleteUlasan,
  },
  notifikasi: {
    list: listNotifikasi,
    get: getNotifikasi,
    markRead: markNotifikasiRead,
    markAllRead: markAllNotifikasiRead,
    delete: deleteNotifikasi,
  },
  admin: {
    dashboard: getDashboard,
    pesanan: {
      list: listAdminPesanan,
      get: getAdminPesanan,
      updateStatus: updateAdminPesananStatus,
    },
    penjualan: {
      list: listPenjualanAdmin,
      summary: getRingkasanPenjualanAdmin,
      get: getPenjualanAdmin,
    },
    notifikasi: {
      list: listAdminNotifikasi,
      get: getAdminNotifikasi,
      markRead: markAdminNotifikasiRead,
      markAllRead: markAllAdminNotifikasiRead,
      delete: deleteAdminNotifikasi,
    },
  },
  superAdmin: {
    users: {
      list: listPengguna,
      get: getPengguna,
      updateRole: updateRolePengguna,
    },
    penjualan: {
      list: listPenjualanSuperAdmin,
      summary: getRingkasanPenjualanSuperAdmin,
      get: getPenjualanSuperAdmin,
    },
    data: {
      previewImport: previewImportBarang,
      confirmImport: confirmImportBarang,
      exportBarang,
      downloadTemplate: downloadTemplateBarang,
    },
  },
};

export * from './api';
export * from './apiError';
export * from './apiHelpers';
export * from './authService';
export * from './passwordService';
export * from './profileService';
export * from './barangService';
export * from './kategoriService';
export * from './lokasiService';
export * from './alamatService';
export * from './keranjangService';
export * from './pesananService';
export * from './pembayaranService';
export * from './ulasanService';
export * from './notifikasiService';
export * from './dashboardService';
export * from './penjualanService';
export * from './penggunaService';
export * from './dataService';
