import { mockDelay, httpClient } from './client';
import { allocatePaymentFIFO } from '../utils/fifoAllocator';

// Initial In-Memory Mock Data (ERD v4 Multi-Metode: Transfer, Tunai, Midtrans)
let mockAntrean = [
  {
    id: 'TRX-1092',
    idPemilik: 4,
    nama: 'Dedi Irawan',
    kios: 'B-1004',
    tagihan: 'Sewa Kios Mei 2026',
    nominal: 'Rp 4.000.000',
    nominalAngka: 4000000,
    metode: 'Transfer',
    labelMetode: 'Transfer Bank (BNI)',
    waktu: '19 Mei 2026, 14:20 WITA',
    status: 'Menunggu Verifikasi',
    bukti: 'bukti_dedi_mei.jpg',
    alokasi: [
      { idTagihan: 102, periode: '2026-05', nominalTeralokasi: 4000000, totalTagihan: 4000000, statusAkhir: 'Belum Bayar' }
    ]
  },
  {
    id: 'TRX-1093',
    idPemilik: 2,
    nama: 'Budi Santoso',
    kios: 'B-1002',
    tagihan: 'Sewa Kios Mei 2026',
    nominal: 'Rp 4.000.000',
    nominalAngka: 4000000,
    metode: 'Transfer',
    labelMetode: 'Transfer Bank (Mandiri)',
    waktu: '18 Mei 2026, 11:30 WITA',
    status: 'Menunggu Verifikasi',
    bukti: 'bukti_budi_mei.jpg',
    alokasi: [
      { idTagihan: 103, periode: '2026-05', nominalTeralokasi: 4000000, totalTagihan: 4000000, statusAkhir: 'Belum Bayar' }
    ]
  },
  {
    id: 'TRX-1094',
    idPemilik: 3,
    nama: 'Citra Lestari',
    kios: 'B-1003',
    tagihan: 'Sewa Kios Mei 2026',
    nominal: 'Rp 4.000.000',
    nominalAngka: 4000000,
    metode: 'Transfer',
    labelMetode: 'Transfer Bank (BCA)',
    waktu: '17 Mei 2026, 10:15 WITA',
    status: 'Menunggu Verifikasi',
    bukti: 'bukti_citra_mei.jpg',
    alokasi: [
      { idTagihan: 104, periode: '2026-05', nominalTeralokasi: 4000000, totalTagihan: 4000000, statusAkhir: 'Belum Bayar' }
    ]
  },
  {
    id: 'TRX-1095',
    idPemilik: 5,
    nama: 'Eka Putri',
    kios: 'B-1005',
    tagihan: 'Sewa Kios Mei 2026',
    nominal: 'Rp 3.500.000',
    nominalAngka: 3500000,
    metode: 'Transfer',
    labelMetode: 'Transfer Bank (BRI)',
    waktu: '16 Mei 2026, 15:45 WITA',
    status: 'Menunggu Verifikasi',
    bukti: 'bukti_eka_mei.jpg',
    alokasi: [
      { idTagihan: 105, periode: '2026-05', nominalTeralokasi: 3500000, totalTagihan: 3500000, statusAkhir: 'Belum Bayar' }
    ]
  },
  {
    id: 'TRX-1096',
    idPemilik: 6,
    nama: 'Fajar Hadi',
    kios: 'B-1006',
    tagihan: 'Sewa Kios Mei 2026',
    nominal: 'Rp 4.000.000',
    nominalAngka: 4000000,
    metode: 'Transfer',
    labelMetode: 'Transfer Bank (BNI)',
    waktu: '15 Mei 2026, 09:20 WITA',
    status: 'Menunggu Verifikasi',
    bukti: 'bukti_fajar_mei.jpg',
    alokasi: [
      { idTagihan: 106, periode: '2026-05', nominalTeralokasi: 4000000, totalTagihan: 4000000, statusAkhir: 'Belum Bayar' }
    ]
  },
  {
    id: 'TRX-1097',
    idPemilik: 7,
    nama: 'Gita Sari',
    kios: 'B-1007',
    tagihan: 'Sewa Kios Mei 2026',
    nominal: 'Rp 4.000.000',
    nominalAngka: 4000000,
    metode: 'Tunai',
    labelMetode: 'Tunai (Loket)',
    waktu: '14 Mei 2026, 13:10 WITA',
    status: 'Menunggu Verifikasi',
    bukti: 'bukti_gita.jpg',
    alokasi: [
      { idTagihan: 107, periode: '2026-05', nominalTeralokasi: 4000000, totalTagihan: 4000000, statusAkhir: 'Belum Bayar' }
    ]
  },
  {
    id: 'TRX-1098',
    idPemilik: 8,
    nama: 'Hendra Wijaya',
    kios: 'B-1008',
    tagihan: 'Sewa Kios Mei 2026',
    nominal: 'Rp 4.000.000',
    nominalAngka: 4000000,
    metode: 'Transfer',
    labelMetode: 'Transfer Bank (Mandiri)',
    waktu: '13 Mei 2026, 16:00 WITA',
    status: 'Menunggu Verifikasi',
    bukti: 'bukti_hendra_mei.jpg',
    alokasi: [
      { idTagihan: 108, periode: '2026-05', nominalTeralokasi: 4000000, totalTagihan: 4000000, statusAkhir: 'Belum Bayar' }
    ]
  },
  {
    id: 'TRX-1099',
    idPemilik: 9,
    nama: 'Indah Permata',
    kios: 'B-1009',
    tagihan: 'Sewa Kios Mei 2026',
    nominal: 'Rp 4.000.000',
    nominalAngka: 4000000,
    metode: 'Transfer',
    labelMetode: 'Transfer Bank (BCA)',
    waktu: '12 Mei 2026, 10:45 WITA',
    status: 'Menunggu Verifikasi',
    bukti: 'bukti_indah_mei.jpg',
    alokasi: [
      { idTagihan: 109, periode: '2026-05', nominalTeralokasi: 4000000, totalTagihan: 4000000, statusAkhir: 'Belum Bayar' }
    ]
  }
];

let mockRiwayat = [
  {
    id: 'TRX-1090',
    idPemilik: 1,
    nama: 'AHMAD SARONI',
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
      const ownerMap = {
        1: { nama: 'AHMAD SARONI', kios: 'B-1001' },
        2: { nama: 'Budi Santoso', kios: 'B-1002' },
        3: { nama: 'Citra Lestari', kios: 'B-1003' },
        4: { nama: 'Dedi Irawan', kios: 'A-1002' }
      };
      const tenantInfo = ownerMap[ownerId] || { nama: typeof tenantId === 'string' ? tenantId : 'Hj. Yuliana', kios: 'B-1001' };

      const tenantBills = (mockUnpaidBillsMap[ownerId] || mockUnpaidBillsMap[1]).filter(b => b.statusTagihan !== 'Lunas');
      const fifoResult = allocatePaymentFIFO(tenantBills, nominalAngka);

      applyAllocationToMockBills(ownerId, fifoResult.allocations);

      const newId = `CASH-${Date.now()}`;
      const finishedItem = {
        id: newId,
        idPemilik: ownerId,
        nama: tenantInfo.nama,
        kios: tenantInfo.kios,
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
      const ownerId = Number(tenantId) || 1;
      const ownerMap = {
        1: { nama: 'Hj. Yuliana', kios: 'B-1001, B-1002' },
        2: { nama: 'Eva Tauresea', kios: 'B-1004' },
        3: { nama: 'H. Ahmad', kios: 'B-1013' },
        4: { nama: 'Toko Kalimantan', kios: 'A-1002' }
      };
      const tenantInfo = ownerMap[ownerId] || { nama: typeof tenantId === 'string' ? tenantId : 'Hj. Yuliana', kios: 'B-1001' };

      const tenantBills = (mockUnpaidBillsMap[ownerId] || mockUnpaidBillsMap[1]).filter(b => b.statusTagihan !== 'Lunas');
      const fifoResult = allocatePaymentFIFO(tenantBills, nominalAngka);

      if (isInstant && fifoResult.allocations.length > 0) {
        applyAllocationToMockBills(ownerId, fifoResult.allocations);
      }

      const item = {
        id: newId,
        idPemilik: ownerId,
        nama: tenantInfo.nama,
        kios: tenantInfo.kios,
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

/**
 * Real API Adapter — terhubung langsung ke REST API Laravel Backend (/api/pembayaran)
 */
export const RealTransactionAdapter = {
  async query(params) {
    const { scope, tenantId, status } = params || {};
    try {
      const rawData = await httpClient.get('/pembayaran');

      if (!Array.isArray(rawData)) {
        return MockTransactionAdapter.query(params);
      }

      const formatted = rawData.map(item => {
        if (!item) return null;
        const statusVerifikasi = item.Verifikasi_Pembayaran || 'Menunggu';
        const isApproved = statusVerifikasi === 'Diterima';
        const statusDisplay = statusVerifikasi === 'Menunggu'
          ? 'Menunggu Verifikasi'
          : (isApproved ? 'Lunas' : 'Ditolak');

        const namaTenant = item.tagihan?.sewa?.pemilik?.Nama || item.tagihan?.sewa?.pemilik?.Nama_Pemilik || item.nama || 'Tenant Kebun Sayur';
        const kodeKios = item.tagihan?.sewa?.kios?.No_Kios || item.tagihan?.sewa?.kios?.Kode_Kios || item.tagihan?.sewa?.kios?.Nomor_Kios || item.kios || '-';
        const totalNominal = Number(item.Total_Bayar ?? item.nominalAngka ?? 0);

        const periodeTagihan = item.tagihan?.Periode || item.tagihan?.Periode_Tagihan;
        const labelTagihan = typeof item.tagihan === 'string'
          ? item.tagihan
          : (periodeTagihan ? `Sewa Kios Periode ${periodeTagihan}` : 'Pelunasan Masa Sewa Kios');

        return {
          id: item.Id_Pembayaran || item.id || `TRX-${Math.random()}`,
          idPemilik: item.tagihan?.sewa?.pemilik?.Id_Pemilik || item.idPemilik,
          nama: namaTenant,
          kios: kodeKios,
          tagihan: labelTagihan,
          nominal: totalNominal > 0 ? `Rp ${totalNominal.toLocaleString('id-ID')}` : (item.nominal || 'Rp 0'),
          nominalAngka: totalNominal,
          metode: item.Metode_Bayar || item.metode || 'Transfer',
          labelMetode: (item.Metode_Bayar || item.metode) === 'Tunai'
            ? 'Tunai (Loket)'
            : ((item.Metode_Bayar || item.metode) === 'Midtrans'
                ? 'Midtrans Gateway'
                : 'Transfer Bank'),
          waktu: item.Tanggal_Bayar || item.waktu || '-',
          status: statusDisplay,
          bukti: item.Bukti_Pembayaran || item.bukti || null,
          alokasi: item.Id_Tagihan ? [
            {
              idTagihan: item.Id_Tagihan,
              periode: periodeTagihan || '-',
              nominalTeralokasi: totalNominal,
              totalTagihan: Number(item.tagihan?.Total_Tagihan || item.tagihan?.Nominal_Tagihan || totalNominal),
              statusAkhir: isApproved ? 'Lunas' : (statusVerifikasi === 'Ditolak' ? 'Belum Bayar' : 'Proses Verifikasi')
            }
          ] : (item.alokasi || [])
        };
      }).filter(Boolean);

      let result = formatted;
      if (scope === 'QUEUE') {
        result = result.filter(item => item.status === 'Menunggu Verifikasi');
      } else if (scope === 'HISTORY') {
        result = result.filter(item => item.status !== 'Menunggu Verifikasi');
      }

      if (tenantId) {
        result = result.filter(item => item.idPemilik === Number(tenantId) || item.nama === tenantId);
      }

      return result;
    } catch (err) {
      return MockTransactionAdapter.query(params);
    }
  },

  async previewFIFO(idPemilik, nominal) {
    return MockTransactionAdapter.previewFIFO(idPemilik, nominal);
  },

  async execute(command) {
    const { type, payload } = command || {};

    if (type === 'VERIFY_TRANSACTION') {
      const { id, status } = payload || {};
      const statusBackend = (status === 'Lunas' || status === 'Diterima') ? 'Diterima' : 'Ditolak';
      const numericId = String(id || '').replace(/^[^\d]*/, '') || id;

      try {
        const response = await httpClient.put(`/pembayaran/${numericId}/konfirmasi`, {
          status: statusBackend
        });

        return {
          success: true,
          id,
          message: response.message || `Transaksi ${id} berhasil di-konfirmasi.`
        };
      } catch (err) {
        return {
          success: false,
          message: err.message || 'Gagal memproses verifikasi di server.'
        };
      }
    }

    if (type === 'RECORD_CASH') {
      const { tenantId, idTagihan, nominal, bukti } = payload || {};
      try {
        const response = await httpClient.post('/pembayaran', {
          Id_Tagihan: idTagihan || tenantId || 1,
          Tanggal_Bayar: new Date().toISOString().split('T')[0],
          Total_Bayar: Number(nominal) || 0,
          Metode_Bayar: 'Tunai',
          Bukti_Pembayaran: typeof bukti === 'string' ? bukti : (bukti?.name || 'setoran_tunai_loket.jpg'),
          Verifikasi_Pembayaran: 'Diterima'
        });

        return {
          success: true,
          id: response.Id_Pembayaran || response.id,
          message: `Setoran tunai Rp ${Number(nominal).toLocaleString('id-ID')} berhasil dicatat di server.`
        };
      } catch (err) {
        return {
          success: false,
          message: err.message || 'Gagal mencatat setoran tunai ke server.'
        };
      }
    }

    if (type === 'SUBMIT_PAYMENT') {
      const { tenantId, idTagihan, nominal, metode, bukti, berkas } = payload || {};
      const fileBukti = (typeof bukti === 'string' && bukti.length > 5)
        ? bukti
        : (typeof berkas === 'string' && berkas.length > 5
            ? berkas
            : (bukti?.name || berkas?.name || 'bukti_transfer.jpg'));
      const statusVerifikasi = metode === 'Midtrans' ? 'Diterima' : 'Menunggu';

      try {
        const response = await httpClient.post('/pembayaran', {
          Id_Tagihan: idTagihan || tenantId || 1,
          Tanggal_Bayar: new Date().toISOString().split('T')[0],
          Total_Bayar: Number(nominal) || 0,
          Metode_Bayar: metode || 'Transfer',
          Bukti_Pembayaran: fileBukti,
          Verifikasi_Pembayaran: statusVerifikasi
        });

        return {
          success: true,
          id: response.Id_Pembayaran || response.id,
          message: metode === 'Midtrans'
            ? 'Pembayaran Midtrans berhasil dicatat!'
            : 'Bukti pembayaran terkirim! Menunggu verifikasi admin.'
        };
      } catch (err) {
        return {
          success: false,
          message: err.message || 'Gagal mengirim pembayaran ke server.'
        };
      }
    }

    return MockTransactionAdapter.execute(command);
  }
};

export const transactionPort = RealTransactionAdapter;

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
  if (import.meta.env.VITE_USE_MOCK !== 'false') {
    return mockDelay(`SNAP-MOCK-TOKEN-${Date.now()}`, 300);
  }

  try {
    const response = await fetch('/api/v1/midtrans/snap-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        order_id: orderId || `BUNSAY-${Date.now()}`,
        gross_amount: Number(nominal) || 100000,
        customer_name: customerName,
        customer_email: customerEmail
      })
    });

    const data = await response.json();
    if (data && data.token) {
      return data.token;
    }
    throw new Error(data.message || 'Gagal menghasilkan token Midtrans Snap');
  } catch (err) {
    console.error('Midtrans Snap Token Error:', err);
    return mockDelay(`SNAP-FALLBACK-TOKEN-${Date.now()}`, 300);
  }
};
