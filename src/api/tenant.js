import { mockDelay } from './client';

// Mock data tenant dashboard
const mockDashboard = {
  nama: 'Hj. Yuliana',
  kios: 'B-1001',
  serviceCharge: { status: 'Lunas', nominal: 350000, dueDate: '2026-06-10' },
  tunggakan: { status: 'Belum Lunas', nominal: 13219998, label: 'Tunggakan Historis s/d Sept 2024' }
};

export const getTenantDashboard = async () => {
  return mockDelay(mockDashboard);
};

export const getTenantHistory = async () => {
  return mockDelay([
    { id: 'TX-4001', tanggal: '10 Mei 2026', tipe: 'Service Charge', nominal: 350000, metode: 'QRIS', status: 'Lunas' },
    { id: 'TX-4002', tanggal: '02 Mei 2026', tipe: 'Sewa Gedung', nominal: 1500000, metode: 'Transfer Bank', status: 'Lunas' },
    { id: 'TX-4003', tanggal: '19 Mei 2026', tipe: 'Cicilan Tunggakan (Piutang)', nominal: 2000000, metode: 'Transfer Bank', status: 'Menunggu Verifikasi' }
  ]);
};

export const getTunggakan = async () => {
  return mockDelay({
    totalAwal: 13219998,
    totalTerbayar: 3000000,
    sisa: 10219998,
    riwayatCicilan: [
      { ke: 1, tanggal: '05 April 2026', nominal: 1000000, status: 'Tervalidasi' },
      { ke: 2, tanggal: '19 Mei 2026', nominal: 2000000, status: 'Menunggu Konfirmasi' }
    ]
  });
};

export const createPayment = async (payload) => {
  // payload: { jenisTagihan, nominal, metode, berkas? }
  return mockDelay({
    success: true,
    id: `TRX-${Date.now()}`,
    status: payload.metode === 'midtrans_gateway' ? 'Lunas' : 'Pending'
  });
};
