import { mockDelay } from './client';

const mockTenants = [
  { id: 1, nama: 'Hj. Yuliana', kios: 'B-1001', usaha: 'Kerajinan', statusPembayaran: 'Lunas', tunggakan: 13219998, rincianTunggakan: 'Tunggakan historis s/d September 2024' },
  { id: 2, nama: 'Eva Tauresea', kios: 'B-1004', usaha: 'Fashion', statusPembayaran: 'Menunggu Verifikasi', tunggakan: 0, rincianTunggakan: '—' },
  { id: 3, nama: 'H. Ahmad', kios: 'B-1013', usaha: 'Perhiasan', statusPembayaran: 'Belum Bayar', tunggakan: 5500000, rincianTunggakan: 'Service Charge Bulan Berjalan (Rp 4.000.000) + Denda (Rp 1.500.000)' },
  { id: 4, nama: 'Toko Kalimantan', kios: 'A-1002', usaha: 'Oleh-oleh', statusPembayaran: 'Lunas', tunggakan: 0, rincianTunggakan: '—' }
];

const mockKios = [
  { id: 1, lantai: 'Lt. 1', nomorKios: 'B-1001', statusKios: 'Terisi', tenant: 'Hj. Yuliana', usaha: 'Kerajinan', catatan: 'Sertifikat diambil BPD Syariah' },
  { id: 2, lantai: 'Lt. 1', nomorKios: 'B-1004', statusKios: 'Kosong', tenant: '—', usaha: '—', catatan: 'Unit tersedia' },
  { id: 3, lantai: 'Lt. 1', nomorKios: 'B-1013', statusKios: 'Perlu Validasi', tenant: '(ambigu)', usaha: '—', catatan: 'Kios dalam proses pengalihan kepemilikan' },
  { id: 4, lantai: 'Lt. 2', nomorKios: 'A-2005', statusKios: 'Terisi', tenant: 'Eva Tauresea', usaha: 'Fashion', catatan: 'Data lengkap terverifikasi' },
  { id: 5, lantai: 'Lt. 3', nomorKios: 'C-3002', statusKios: 'Perlu Validasi', tenant: '—', usaha: '—', catatan: 'Belum dibuatkan sertifikat / unit sewa' }
];

export const getAdminTenants = async () => {
  return mockDelay(mockTenants);
};

export const getAdminKios = async () => {
  return mockDelay(mockKios);
};

export const getAdminKiosDetail = async (kiosId) => {
  const detail = mockKios.find(k => k.id === kiosId);
  if (!detail) throw new Error('Kios not found');
  return mockDelay(detail);
};

export const createTenant = async (payload) => {
  // payload: { nama, kios, email, usaha }
  return mockDelay({ success: true, id: Date.now() });
};

export const updateKios = async (kiosId, data) => {
  return mockDelay({ success: true });
};
