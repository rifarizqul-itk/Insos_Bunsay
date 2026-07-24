import { mockDelay } from './client';
import { allocatePaymentFIFO } from '../utils/fifoAllocator';

// Initial In-Memory Mock Data (ERD v4 Multi-Metode: Transfer, Tunai, Midtrans)
let mockAntrean = [
  {
    id: 'TRX-1092',
    idPemilik: 2,
    nama: 'Eva Tauresea',
    kios: 'B-1004',
    tagihan: 'Sewa Kios Mei 2026',
    nominal: 'Rp 4.000.000',
    nominalAngka: 4000000,
    metode: 'Transfer',
    labelMetode: 'Transfer Bank (BNI)',
    waktu: '19 Mei 2026, 14:20 WITA',
    status: 'Menunggu Verifikasi',
    bukti: 'bukti_eva_mei.jpg',
    alokasi: [
      { idTagihan: 102, periode: '2026-05', nominalTeralokasi: 4000000, totalTagihan: 4000000, statusAkhir: 'Lunas' }
    ]
  }
];

let mockRiwayat = [
  {
    id: 'TRX-1090',
    idPemilik: 1,
    nama: 'Hj. Yuliana',
    kios: 'B-1001, B-1002',
    tagihan: 'Pelunasan Masa Sewa & Akumulasi Tunggakan',
    nominal: 'Rp 15.000.000',
    nominalAngka: 15000000,
    metode: 'Transfer',
    labelMetode: 'Transfer Bank (BNI)',
    waktu: '18 Mei 2026, 09:15 WITA',
    status: 'Lunas',
    alokasi: [
      { idTagihan: 89, periode: '2026-03', nominalTeralokasi: 4000000, totalTagihan: 4000000, statusAkhir: 'Lunas' },
      { idTagihan: 95, periode: '2026-04', nominalTeralokasi: 4000000, totalTagihan: 4000000, statusAkhir: 'Lunas' },
      { idTagihan: 101, periode: '2026-05', nominalTeralokasi: 7000000, totalTagihan: 7000000, statusAkhir: 'Lunas' }
    ]
  },
  {
    id: 'TRX-1089',
    idPemilik: 4,
    nama: 'Toko Kalimantan',
    kios: 'A-1002',
    tagihan: 'Pelunasan Masa Sewa Mei 2026',
    nominal: 'Rp 3.500.000',
    nominalAngka: 3500000,
    metode: 'Midtrans',
    labelMetode: 'Midtrans Snap Gateway',
    waktu: '17 Mei 2026, 16:10 WITA',
    status: 'Lunas',
    alokasi: [
      { idTagihan: 104, periode: '2026-05', nominalTeralokasi: 3500000, totalTagihan: 3500000, statusAkhir: 'Lunas' }
    ]
  },
  {
    id: 'TRX-1088',
    idPemilik: 3,
    nama: 'H. Ahmad',
    kios: 'B-1013',
    tagihan: 'Setoran Tunai Loket Pengelola',
    nominal: 'Rp 5.500.000',
    nominalAngka: 5500000,
    metode: 'Tunai',
    labelMetode: 'Tunai (Loket)',
    waktu: '15 Mei 2026, 10:30 WITA',
    status: 'Lunas',
    alokasi: [
      { idTagihan: 96, periode: '2026-04', nominalTeralokasi: 1500000, totalTagihan: 4000000, statusAkhir: 'Dicicil' },
      { idTagihan: 103, periode: '2026-05', nominalTeralokasi: 4000000, totalTagihan: 4000000, statusAkhir: 'Lunas' }
    ]
  },
  {
    id: 'TRX-1087',
    idPemilik: 1,
    nama: 'Hj. Yuliana',
    kios: 'B-1001',
    tagihan: 'Cicilan Sewa Apr 2026',
    nominal: 'Rp 3.500.000',
    nominalAngka: 3500000,
    metode: 'Midtrans',
    labelMetode: 'Midtrans Snap (QRIS)',
    waktu: '12 Apr 2026, 11:00 WITA',
    status: 'Lunas',
    alokasi: [
      { idTagihan: 95, periode: '2026-04', nominalTeralokasi: 3500000, totalTagihan: 4000000, statusAkhir: 'Dicicil' }
    ]
  },
  {
    id: 'TRX-1091',
    idPemilik: 2,
    nama: 'Eva Tauresea',
    kios: 'B-1004',
    tagihan: 'Sewa Kios Apr 2026',
    nominal: 'Rp 4.000.000',
    nominalAngka: 4000000,
    metode: 'Transfer',
    labelMetode: 'Transfer Bank (Mandiri)',
    waktu: '18 Mei 2026, 11:45 WITA',
    status: 'Ditolak',
    alasan: 'Bukti transfer tidak valid/rekayasa',
    alokasi: []
  }
];

// Mock Tagihan per Pemilik untuk kalkulasi FIFO
let mockUnpaidBillsMap = {
  1: [ // Hj. Yuliana
    { idTagihan: 89, periode: '2026-03', tarifSewa: 4000000, totalTagihan: 4000000, totalTerbayar: 4000000, statusTagihan: 'Lunas' },
    { idTagihan: 95, periode: '2026-04', tarifSewa: 4000000, totalTagihan: 4000000, totalTerbayar: 3500000, statusTagihan: 'Dicicil' },
    { idTagihan: 101, periode: '2026-05', tarifSewa: 7000000, totalTagihan: 7000000, totalTerbayar: 0, statusTagihan: 'Belum Bayar' }
  ],
  2: [ // Eva Tauresea
    { idTagihan: 102, periode: '2026-05', tarifSewa: 4000000, totalTagihan: 4000000, totalTerbayar: 0, statusTagihan: 'Belum Bayar' }
  ],
  3: [ // H. Ahmad
    { idTagihan: 96, periode: '2026-04', tarifSewa: 4000000, totalTagihan: 4000000, totalTerbayar: 1500000, statusTagihan: 'Dicicil' },
    { idTagihan: 103, periode: '2026-05', tarifSewa: 4000000, totalTagihan: 4000000, totalTerbayar: 0, statusTagihan: 'Belum Bayar' }
  ],
  4: [ // Toko Kalimantan
    { idTagihan: 104, periode: '2026-05', tarifSewa: 3500000, totalTagihan: 3500000, totalTerbayar: 3500000, statusTagihan: 'Lunas' }
  ]
};

function applyAllocationToMockBills(ownerId, allocations = []) {
  const bills = mockUnpaidBillsMap[ownerId] || mockUnpaidBillsMap[1];
  if (!bills || !allocations) return;
  allocations.forEach(alok => {
    const targetBill = bills.find(item => item.idTagihan === alok.idTagihan);
    if (targetBill) {
      targetBill.totalTerbayar = (targetBill.totalTerbayar || 0) + alok.nominalTeralokasi;
      targetBill.statusTagihan = alok.statusAkhir;
    }
  });
}

/**
 * Concrete Mock Adapter implementing TransactionPort
 */
export const MockTransactionAdapter = {
  async query(params) {
    const { scope, tenantId, status } = params || {};
    let result = [];

    if (scope === 'QUEUE') {
      result = [...mockAntrean];
      if (tenantId) result = result.filter(item => item.tenantId === tenantId || item.nama === tenantId || item.idPemilik === Number(tenantId));
    } else if (scope === 'HISTORY') {
      result = [...mockRiwayat];
      if (tenantId) result = result.filter(item => item.tenantId === tenantId || item.nama === tenantId || item.idPemilik === Number(tenantId));
      if (status) result = result.filter(item => item.status === status);
    } else { // ALL
      result = [...mockAntrean, ...mockRiwayat];
    }

    return mockDelay(result);
  },

  async previewFIFO(idPemilik, nominal) {
    const unpaidBills = (mockUnpaidBillsMap[idPemilik] || mockUnpaidBillsMap[1]).filter(b => b.statusTagihan !== 'Lunas');
    const fifoResult = allocatePaymentFIFO(unpaidBills, Number(nominal) || 0);
    return mockDelay(fifoResult);
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
      const isApproved = status === 'Lunas' || status === 'Diterima';
      const statusFinal = isApproved ? 'Lunas' : 'Ditolak';

      let alokasiFinal = itemTarget.alokasi || [];
      if (isApproved && (!alokasiFinal || alokasiFinal.length === 0)) {
        const tenantBills = (mockUnpaidBillsMap[itemTarget.idPemilik] || mockUnpaidBillsMap[1]).filter(b => b.statusTagihan !== 'Lunas');
        const fifo = allocatePaymentFIFO(tenantBills, itemTarget.nominalAngka || 0);
        alokasiFinal = fifo.allocations;
      }

      if (isApproved && alokasiFinal.length > 0) {
        applyAllocationToMockBills(itemTarget.idPemilik, alokasiFinal);
      }

      const finishedItem = {
        ...itemTarget,
        status: statusFinal,
        alasan: !isApproved ? (alasan || 'Bukti transfer tidak sesuai') : null,
        alokasi: alokasiFinal
      };

      // Pindahkan dari antrean ke riwayat
      mockAntrean.splice(targetIndex, 1);
      mockRiwayat.unshift(finishedItem);

      return mockDelay({
        success: true,
        id,
        message: `Transaksi ${id} berhasil di-${isApproved ? 'setujui (Lunas)' : 'tolak'}.`
      });
    }

    if (type === 'RECORD_CASH') {
      const { tenantId, jenisTagihan, nominal, bukti } = payload || {};
      const nominalAngka = Number(nominal) || 0;

      if (!nominal || nominalAngka <= 0) {
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

      const ownerId = Number(tenantId) || 1;
      const tenantBills = (mockUnpaidBillsMap[ownerId] || mockUnpaidBillsMap[1]).filter(b => b.statusTagihan !== 'Lunas');
      const fifoResult = allocatePaymentFIFO(tenantBills, nominalAngka);

      applyAllocationToMockBills(ownerId, fifoResult.allocations);

      const newId = `CASH-${Date.now()}`;
      const finishedItem = {
        id: newId,
        idPemilik: ownerId,
        nama: typeof tenantId === 'string' && isNaN(Number(tenantId)) ? tenantId : 'Hj. Yuliana',
        kios: ownerId === 3 ? 'B-1013' : 'B-1001',
        tagihan: jenisTagihan || 'Setoran Tunai Loket Pengelola',
        nominal: `Rp ${nominalAngka.toLocaleString('id-ID')}`,
        nominalAngka: nominalAngka,
        metode: 'Tunai',
        labelMetode: 'Tunai (Loket)',
        waktu: new Date().toLocaleString('id-ID') + ' WITA',
        status: 'Lunas',
        bukti,
        alokasi: fifoResult.allocations
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
      const nominalAngka = Number(nominal) || 0;
      const newId = `TRX-${Math.floor(Math.random() * 9000) + 1000}`;
      const isInstant = metode === 'Midtrans' || metode === 'midtrans_gateway';

      const labelMetode = isInstant ? 'Midtrans Snap Gateway' : 'Transfer Bank Manual';
      const ownerId = typeof tenantId === 'number' ? tenantId : 1;
      const tenantBills = (mockUnpaidBillsMap[ownerId] || mockUnpaidBillsMap[1]).filter(b => b.statusTagihan !== 'Lunas');
      const fifoResult = allocatePaymentFIFO(tenantBills, nominalAngka);

      if (isInstant && fifoResult.allocations.length > 0) {
        applyAllocationToMockBills(ownerId, fifoResult.allocations);
      }

      const item = {
        id: newId,
        idPemilik: ownerId,
        nama: typeof tenantId === 'string' ? tenantId : 'Hj. Yuliana',
        kios: 'B-1001',
        tagihan: jenisTagihan || 'Pelunasan Masa Sewa Kios',
        nominal: `Rp ${nominalAngka.toLocaleString('id-ID')}`,
        nominalAngka: nominalAngka,
        metode: isInstant ? 'Midtrans' : 'Transfer',
        labelMetode: labelMetode,
        waktu: new Date().toLocaleString('id-ID') + ' WITA',
        status: isInstant ? 'Lunas' : 'Menunggu Verifikasi',
        bukti: berkas || bukti || null,
        alokasi: fifoResult.allocations
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

export const transactionPort = MockTransactionAdapter;

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

export const getMidtransSnapToken = async ({ orderId, nominal, customerName, customerEmail }) => {
  const serverKey = import.meta.env.VITE_MIDTRANS_SERVER_KEY || 'Mid-server-zttL28HQs7NGhNZ6kI4sCKe-';
  const authHeader = 'Basic ' + btoa(serverKey + ':');

  const requestBody = JSON.stringify({
    transaction_details: {
      order_id: orderId || `BUNSAY-${Date.now()}`,
      gross_amount: Number(nominal) || 100000
    },
    credit_card: {
      secure: true
    },
    customer_details: {
      first_name: customerName || 'Hj. Yuliana',
      email: customerEmail || 'yuliana@gmail.com'
    }
  });

  const requestHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': authHeader
  };

  try {
    // 1. Coba melalui Vite proxy (/v1/transactions) untuk bypass CORS browser
    let response = await fetch('/v1/transactions', {
      method: 'POST',
      headers: requestHeaders,
      body: requestBody
    });

    if (!response.ok) {
      // 2. Fallback ke URL langsung
      response = await fetch('https://app.sandbox.midtrans.com/snap/v1/transactions', {
        method: 'POST',
        headers: requestHeaders,
        body: requestBody
      });
    }

    const data = await response.json();
    if (data && data.token) {
      return data.token;
    }
    throw new Error(data.error_messages ? data.error_messages.join(', ') : 'Gagal menghasilkan token Midtrans Snap');
  } catch (err) {
    console.error('Midtrans Snap Token Error:', err);
    throw err;
  }
};
