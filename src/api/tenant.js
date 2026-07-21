import { mockDelay } from './client';

// Initial Mock Datasets
let mockDashboard = {
  nama: 'Hj. Yuliana',
  kios: 'B-1001',
  serviceCharge: { status: 'Lunas', nominal: 350000, dueDate: '2026-06-10' },
  tunggakan: { status: 'Belum Lunas', nominal: 13219998, label: 'Tunggakan Historis s/d Sept 2024' }
};

let mockTunggakan = {
  totalAwal: 13219998,
  totalTerbayar: 3000000,
  sisa: 10219998,
  riwayatCicilan: [
    { ke: 1, tanggal: '05 April 2026', nominal: 1000000, status: 'Tervalidasi' },
    { ke: 2, tanggal: '19 Mei 2026', nominal: 2000000, status: 'Menunggu Konfirmasi' }
  ]
};

let mockProfile = {
  nama: 'Hj. Yuliana',
  kios: 'B-1001',
  email: 'yuliana.bunsay@email.com',
  telepon: '0812-5564-593',
  alamat: 'Jl. Adil Makmur No. 42, Kec. Balikpapan Barat, Kota Balikpapan, Kaltim 76123',
  jenisUsaha: 'Kerajinan'
};

/**
 * Concrete Mock Adapter implementing TenantPort
 * Dipakai saat VITE_USE_MOCK=true (kategori 4: true external/mock)
 */
export const MockTenantAdapter = {
  async getDashboard() {
    return mockDelay({ ...mockDashboard });
  },

  async getTunggakan() {
    return mockDelay({ ...mockTunggakan });
  },

  async getProfile() {
    return mockDelay({ ...mockProfile });
  },

  async updateProfile(payload) {
    const { nama, email, telepon, alamat, jenisUsaha } = payload || {};

    // Validasi Nomor Telepon (Contoh Kasus Validasi WCAG 3.3.1 / 3.3.3)
    if (telepon) {
      const cleanPhone = String(telepon).replace(/[^0-9]/g, '');
      if (cleanPhone.length < 10 || cleanPhone.length > 13) {
        return mockDelay({
          success: false,
          message: 'Nomor telepon harus berisi 10 hingga 13 digit angka valid.',
          field: 'telepon'
        });
      }
    }

    // Validasi Email Sederhana
    if (email && (!email.includes('@') || !email.includes('.'))) {
      return mockDelay({
        success: false,
        message: 'Format email tidak valid (contoh: nama@domain.com).',
        field: 'email'
      });
    }

    // Validasi Nama Wajib
    if (!nama || nama.trim().length === 0) {
      return mockDelay({
        success: false,
        message: 'Nama lengkap tidak boleh kosong.',
        field: 'nama'
      });
    }

    // Update in-memory state
    mockProfile = {
      ...mockProfile,
      ...(nama && { nama }),
      ...(email && { email }),
      ...(telepon && { telepon }),
      ...(alamat && { alamat }),
      ...(jenisUsaha && { jenisUsaha })
    };

    // Sinkronkan ke dashboard
    mockDashboard.nama = mockProfile.nama;

    return mockDelay({
      success: true,
      message: 'Profil tenant berhasil diperbarui.',
      data: { ...mockProfile }
    });
  }
};

// Unified Port Seam Export
export const tenantPort = MockTenantAdapter;

// Legacy functions for backward compatibility
export const getTenantDashboard = () => tenantPort.getDashboard();
export const getTunggakan = () => tenantPort.getTunggakan();
export const getTenantProfile = () => tenantPort.getProfile();
export const updateTenantProfile = (payload) => tenantPort.updateProfile(payload);

export const getTenantHistory = async () => {
  return mockDelay([
    { id: 'TX-4001', tanggal: '10 Mei 2026', tipe: 'Service Charge', nominal: 350000, metode: 'QRIS', status: 'Lunas' },
    { id: 'TX-4002', tanggal: '02 Mei 2026', tipe: 'Sewa Gedung', nominal: 1500000, metode: 'Transfer Bank', status: 'Lunas' },
    { id: 'TX-4003', tanggal: '19 Mei 2026', tipe: 'Cicilan Tunggakan (Piutang)', nominal: 2000000, metode: 'Transfer Bank', status: 'Menunggu Verifikasi' }
  ]);
};

export const createPayment = async (payload) => {
  return mockDelay({
    success: true,
    id: `TRX-${Date.now()}`,
    status: payload.metode === 'midtrans_gateway' ? 'Lunas' : 'Pending'
  });
};

