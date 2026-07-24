/**
 * Deep Module: FIFO Payment Allocator (First-In-First-Out)
 * Mengalokasikan nominal pembayaran bebas ke tagihan-tagihan sewa
 * berstatus belum lunas, diurutkan dari Periode tertua.
 */

/**
 * Menghitung Status_Tagihan berdasarkan total tagihan dan total terbayar.
 * @param {number} totalTagihan 
 * @param {number} totalTerbayar 
 * @returns {'Lunas' | 'Dicicil' | 'Belum Bayar'}
 */
export function calculateBillStatus(totalTagihan, totalTerbayar) {
  const terbayar = Math.max(0, Number(totalTerbayar) || 0);
  const total = Number(totalTagihan) || 0;

  if (terbayar >= total && total > 0) {
    return 'Lunas';
  }
  if (terbayar > 0 && terbayar < total) {
    return 'Dicicil';
  }
  return 'Belum Bayar';
}

/**
 * Mengalokasikan nominal pembayaran ke tagihan yang belum lunas secara FIFO.
 * 
 * @param {Array<Object>} unpaidBills - Daftar tagihan (harus diurutkan Periode ASC).
 * @param {number} paymentAmount - Nominal pembayaran bebas dalam Rupiah.
 * @returns {Object} { allocations, remainingAmount, updatedBills }
 */
export function allocatePaymentFIFO(unpaidBills = [], paymentAmount = 0) {
  let sisaDana = Math.max(0, Number(paymentAmount) || 0);
  const allocations = [];
  const updatedBills = [];

  // Urutkan tagihan berdasarkan periode tertua jika belum diurutkan
  const sortedBills = [...unpaidBills].sort((a, b) => (a.periode || '').localeCompare(b.periode || ''));

  for (const bill of sortedBills) {
    const totalTagihan = Number(bill.totalTagihan || bill.tarifSewa || 0);
    const totalTerbayarSebelumnya = Number(bill.totalTerbayar || bill.terbayar || 0);
    const sisaTagihan = Math.max(0, totalTagihan - totalTerbayarSebelumnya);

    if (sisaDana <= 0) {
      // Tidak ada sisa dana pembayaran untuk tagihan ini
      updatedBills.push({
        ...bill,
        totalTerbayar: totalTerbayarSebelumnya,
        statusTagihan: calculateBillStatus(totalTagihan, totalTerbayarSebelumnya)
      });
      continue;
    }

    if (sisaTagihan <= 0) {
      // Tagihan sudah lunas sebelumnya
      updatedBills.push({
        ...bill,
        totalTerbayar: totalTagihan,
        statusTagihan: 'Lunas'
      });
      continue;
    }

    // Hitung berapa nominal teralokasi ke tagihan ini
    const nominalTeralokasi = Math.min(sisaDana, sisaTagihan);
    const newTotalTerbayar = totalTerbayarSebelumnya + nominalTeralokasi;
    const statusAkhir = calculateBillStatus(totalTagihan, newTotalTerbayar);
    const newSisaTagihan = Math.max(0, totalTagihan - newTotalTerbayar);

    allocations.push({
      idTagihan: bill.idTagihan || bill.id,
      periode: bill.periode,
      tarifSewa: bill.tarifSewa || totalTagihan,
      totalTagihan: totalTagihan,
      terbayarSebelumnya: totalTerbayarSebelumnya,
      nominalTeralokasi: nominalTeralokasi,
      sisaTagihan: newSisaTagihan,
      statusAkhir: statusAkhir
    });

    updatedBills.push({
      ...bill,
      totalTerbayar: newTotalTerbayar,
      statusTagihan: statusAkhir
    });

    sisaDana -= nominalTeralokasi;
  }

  return {
    allocations,
    remainingAmount: sisaDana,
    updatedBills
  };
}
