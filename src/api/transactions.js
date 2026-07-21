import { mockDelay } from './client';

// Initial In-Memory Mock Data
let mockAntrean = [
  { id: 'TRX-1092', nama: 'Eva Tauresea', kios: 'B-1004', tagihan: 'Service Charge', nominal: 'Rp 1.500.000', metode: 'Transfer Bank (BNI)', waktu: '19 Mei 2026, 14:20 WITA', status: 'Menunggu Verifikasi' }
];

let mockRiwayat = [
  { id: 'TRX-1090', nama: 'Hj. Yuliana', kios: 'B-1001', tagihan: 'Service Charge', nominal: 'Rp 350.000', metode: 'QRIS Manual', waktu: '18 Mei 2026, 09:15 WITA', status: 'Lunas' },
  { id: 'TRX-1091', nama: 'Eva Tauresea', kios: 'B-1004', tagihan: 'Service Charge', nominal: 'Rp 1.500.000', metode: 'Transfer Bank (Mandiri)', waktu: '18 Mei 2026, 11:45 WITA', status: 'Tertolak', alasan: 'Bukti transfer tidak valid/rekayasa' }
];

/**
 * Concrete Mock Adapter implementing TransactionPort
 * Dipakai saat VITE_USE_MOCK=true (kategori 4: true external/mock)
 */
export const MockTransactionAdapter = {
  async query(params) {
    const { scope, tenantId, status } = params || {};
    let result = [];

    if (scope === 'QUEUE') {
      result = [...mockAntrean];
      if (tenantId) result = result.filter(item => item.tenantId === tenantId || item.nama === tenantId);
    } else if (scope === 'HISTORY') {
      result = [...mockRiwayat];
      if (tenantId) result = result.filter(item => item.tenantId === tenantId || item.nama === tenantId);
      if (status) result = result.filter(item => item.status === status);
    } else { // ALL
      result = [...mockAntrean, ...mockRiwayat];
    }

    return mockDelay(result);
  },

  async execute(command) {
    const { type, payload } = command || {};

    if (type === 'VERIFY_TRANSACTION') {
      const { id, status, alasan } = payload || {};
      const targetIndex = mockAntrean.findIndex(item => item.id === id);
      if (targetIndex === -1) {
        return mockDelay({
          success: false,
          message: `Transaksi ${id} tidak ditemukan di antrean verifikasi.`,
          field: 'id'
        });
      }

      const itemTarget = mockAntrean[targetIndex];
      const finishedItem = {
        ...itemTarget,
        status,
        alasan: status === 'Tertolak' ? (alasan || 'Bukti transfer tidak sesuai') : null
      };

      // Pindahkan dari antrean ke riwayat
      mockAntrean.splice(targetIndex, 1);
      mockRiwayat.unshift(finishedItem);

      return mockDelay({
        success: true,
        id,
        message: `Transaksi ${id} berhasil di-${status === 'Lunas' ? 'setujui (Lunas)' : 'tolak'}.`
      });
    }

    if (type === 'RECORD_CASH') {
      const { tenantId, jenisTagihan, nominal, bukti } = payload || {};
      if (!nominal || Number(nominal) <= 0) {
        return mockDelay({
          success: false,
          message: 'Nominal setoran tunai harus lebih dari Rp 0.',
          field: 'nominal'
        });
      }
      if (!bukti) {
        return mockDelay({
          success: false,
          message: 'Foto bukti setoran tunai wajib diunggah.',
          field: 'bukti'
        });
      }

      const newId = `CASH-${Date.now()}`;
      const finishedItem = {
        id: newId,
        nama: typeof tenantId === 'string' && isNaN(Number(tenantId)) ? tenantId : 'Hj. Yuliana',
        kios: 'B-1001',
        tagihan: jenisTagihan || 'Service Charge',
        nominal: `Rp ${Number(nominal).toLocaleString('id-ID')}`,
        metode: 'Tunai (Loket)',
        waktu: new Date().toLocaleString('id-ID') + ' WITA',
        status: 'Lunas',
        bukti
      };

      mockRiwayat.unshift(finishedItem);
      return mockDelay({
        success: true,
        id: newId,
        message: `Setoran tunai ${newId} berhasil dicatat.`
      });
    }

    if (type === 'SUBMIT_PAYMENT') {
      const { tenantId, jenisTagihan, nominal, metode, berkas, bukti } = payload || {};
      const newId = `TRX-${Math.floor(Math.random() * 9000) + 1000}`;
      const isInstant = metode === 'midtrans_gateway';

      let labelMetode = 'Transfer Bank Manual';
      if (metode === 'midtrans_gateway') labelMetode = 'Midtrans (Otomatis)';
      else if (metode === 'qris_manual') labelMetode = 'QRIS Manual';

      const item = {
        id: newId,
        nama: tenantId || 'Hj. Yuliana',
        kios: 'B-1001',
        tagihan: jenisTagihan || 'Service Charge',
        nominal: `Rp ${Number(nominal || 0).toLocaleString('id-ID')}`,
        metode: labelMetode,
        waktu: new Date().toLocaleString('id-ID') + ' WITA',
        status: isInstant ? 'Lunas' : 'Menunggu Verifikasi',
        bukti: berkas || bukti || null
      };

      if (isInstant) {
        mockRiwayat.unshift(item);
      } else {
        mockAntrean.unshift(item);
      }

      return mockDelay({
        success: true,
        id: newId,
        message: isInstant ? 'Pembayaran berhasil! Status Anda langsung lunas.' : 'Bukti terkirim! Menunggu verifikasi admin.'
      });
    }

    if (type === 'EXPORT_REPORT') {
      const { bulan, tahun } = payload || {};
      return mockDelay({
        success: true,
        url: `/downloads/rekap-${bulan || 'Mei'}-${tahun || '2026'}.xlsx`,
        message: `Berkas rekapitulasi ${bulan || 'Mei'} ${tahun || '2026'} siap diunduh.`
      });
    }

    return mockDelay({
      success: false,
      message: 'Command type tidak valid.',
      field: 'type'
    });
  }
};

// Unified Port Seam Export
export const transactionPort = MockTransactionAdapter;

// Legacy Direct API Wrappers
export const verifyTransaction = async (id, status, alasan = null) => {
  return transactionPort.execute({
    type: 'VERIFY_TRANSACTION',
    payload: { id, status, alasan }
  });
};

export const recordCashPayment = async (payload) => {
  return transactionPort.execute({
    type: 'RECORD_CASH',
    payload
  });
};

export const exportReport = async (bulan, tahun) => {
  return transactionPort.execute({
    type: 'EXPORT_REPORT',
    payload: { bulan, tahun }
  });
};

