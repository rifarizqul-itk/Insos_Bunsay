import { mockDelay } from './client';

// Initial Mock Datasets
let mockTenants = [
  { id: 1, nama: 'Hj. Yuliana', kios: 'B-1001', usaha: 'Kerajinan', statusPembayaran: 'Lunas', tunggakan: 13219998, rincianTunggakan: 'Tunggakan historis s/d September 2024' },
  { id: 2, nama: 'Eva Tauresea', kios: 'B-1004', usaha: 'Fashion', statusPembayaran: 'Menunggu Verifikasi', tunggakan: 0, rincianTunggakan: '—' },
  { id: 3, nama: 'H. Ahmad', kios: 'B-1013', usaha: 'Perhiasan', statusPembayaran: 'Belum Bayar', tunggakan: 5500000, rincianTunggakan: 'Service Charge Bulan Berjalan (Rp 4.000.000) + Denda (Rp 1.500.000)' },
  { id: 4, nama: 'Toko Kalimantan', kios: 'A-1002', usaha: 'Oleh-oleh', statusPembayaran: 'Lunas', tunggakan: 0, rincianTunggakan: '—' }
];

let mockKios = [
  { id: 1, lantai: 'Lt. 1', nomorKios: 'B-1001', statusKios: 'Terisi', tenant: 'Hj. Yuliana', usaha: 'Kerajinan', catatan: 'Sertifikat diambil BPD Syariah' },
  { id: 2, lantai: 'Lt. 1', nomorKios: 'B-1004', statusKios: 'Terisi', tenant: 'Eva Tauresea', usaha: 'Fashion', catatan: 'Unit aktif' },
  { id: 3, lantai: 'Lt. 1', nomorKios: 'B-1013', statusKios: 'Perlu Validasi', tenant: 'H. Ahmad', usaha: 'Perhiasan', catatan: 'Kios dalam proses pengalihan kepemilikan' },
  { id: 4, lantai: 'Lt. 2', nomorKios: 'A-2005', statusKios: 'Terisi', tenant: 'Toko Kalimantan', usaha: 'Oleh-oleh', catatan: 'Data lengkap terverifikasi' },
  { id: 5, lantai: 'Lt. 3', nomorKios: 'C-3002', statusKios: 'Kosong', tenant: '—', usaha: '—', catatan: 'Unit sewa siap huni' }
];

/**
 * Concrete Mock Adapter implementing AdminPort
 * Dipakai saat VITE_USE_MOCK=true (kategori 4: true external/mock)
 */
export const MockAdminAdapter = {
  async getTenants() {
    return mockDelay([...mockTenants]);
  },

  async getKiosList() {
    return mockDelay([...mockKios]);
  },

  async getKiosDetail(kiosId) {
    const numericId = Number(kiosId);
    const detail = mockKios.find(k => k.id === numericId || k.nomorKios === kiosId);
    if (!detail) {
      throw new Error(`Data administrasi kios ${kiosId} tidak ditemukan.`);
    }

    // Detail administrasi legalitas lengkap dengan properti yang cocok dengan UI
    const defaultAdmin = {
      sp: '423 / 15 Januari 2022',
      ppjb: '108 / 20 Januari 2022',
      bast: '01 Februari 2022',
      ukuran: '12 Meter Persegi',
      sertifikat: '422 / 10 Maret 2023',
      ktp: '175102.460772.0005',
      alamat: 'Jl. Adil Makmur No. 42, Balikpapan',
      kontak: '0812-5564-593',
      keterangan: detail.catatan || 'Sertifikat diambil BPD Syariah'
    };

    const fullDetail = {
      ...detail,
      detailAdministrasi: {
        ...defaultAdmin,
        ...(detail.detailAdministrasi || {})
      }
    };

    return mockDelay(fullDetail);
  },

  async createTenant(payload) {
    const { nama, kios, email, usaha } = payload || {};

    if (!nama || nama.trim().length === 0) {
      return mockDelay({
        success: false,
        message: 'Nama tenant wajib diisi.',
        field: 'nama'
      });
    }

    if (!kios || kios.trim().length === 0) {
      return mockDelay({
        success: false,
        message: 'Nomor kios wajib dipilih.',
        field: 'kios'
      });
    }

    // Cek ketersediaan kios
    const targetKios = mockKios.find(k => k.nomorKios === kios || String(k.id) === kios);
    if (targetKios && targetKios.statusKios === 'Terisi') {
      return mockDelay({
        success: false,
        message: `Kios ${targetKios.nomorKios} sudah terisi oleh ${targetKios.tenant}.`,
        field: 'kios'
      });
    }

    const newTenantId = Date.now();
    const newTenant = {
      id: newTenantId,
      nama: nama.trim(),
      kios: targetKios ? targetKios.nomorKios : kios,
      usaha: usaha || 'Umum',
      statusPembayaran: 'Belum Bayar',
      tunggakan: 0,
      rincianTunggakan: '—'
    };

    mockTenants.unshift(newTenant);

    if (targetKios) {
      targetKios.statusKios = 'Terisi';
      targetKios.tenant = nama.trim();
      targetKios.usaha = usaha || 'Umum';
    }

    return mockDelay({
      success: true,
      id: newTenantId,
      message: `Tenant ${nama} (${newTenant.kios}) berhasil didaftarkan.`,
      data: newTenant
    });
  },

  async updateKios(kiosId, data) {
    const numericId = Number(kiosId);
    const targetIndex = mockKios.findIndex(k => k.id === numericId || k.nomorKios === kiosId);

    if (targetIndex === -1) {
      return mockDelay({
        success: false,
        message: `Kios ${kiosId} tidak ditemukan.`,
        field: 'kiosId'
      });
    }

    const currentKios = mockKios[targetIndex];
    const { tenant, statusKios, usaha, catatan, ...adminDetails } = data || {};

    mockKios[targetIndex] = {
      ...currentKios,
      ...(tenant && { tenant }),
      ...(statusKios && { statusKios }),
      ...(usaha && { usaha }),
      ...(catatan !== undefined && { catatan }),
      detailAdministrasi: {
        ...(currentKios.detailAdministrasi || {}),
        ...adminDetails
      }
    };

    return mockDelay({
      success: true,
      message: `Data administrasi kios ${currentKios.nomorKios} berhasil diperbarui.`
    });
  }
};


// Unified Port Seam Export
export const adminPort = MockAdminAdapter;

// Legacy Direct API Wrappers
export const getAdminTenants = () => adminPort.getTenants();
export const getAdminKios = () => adminPort.getKiosList();
export const getAdminKiosDetail = (kiosId) => adminPort.getKiosDetail(kiosId);
export const createTenant = (payload) => adminPort.createTenant(payload);
export const updateKios = (kiosId, data) => adminPort.updateKios(kiosId, data);

