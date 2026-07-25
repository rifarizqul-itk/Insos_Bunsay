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

  const parsePeriodToTimestamp = (pStr) => {
    if (!pStr) return 0;
    const str = String(pStr).trim();
    if (/^\d{4}-\d{2}$/.test(str)) {
      const [year, month] = str.split('-').map(Number);
      return year * 100 + month;
    }
    const monthNames = {
      januari: 1, jan: 1,
      februari: 2, feb: 2,
      maret: 3, mar: 3,
      april: 4, apr: 4,
      mei: 5,
      juni: 6, jun: 6,
      juli: 7, jul: 7,
      agustus: 8, agu: 8, ags: 8,
      september: 9, sep: 9,
      oktober: 10, okt: 10,
      november: 11, nov: 11,
      desember: 12, des: 12
    };
    const parts = str.toLowerCase().split(/\s+/);
    if (parts.length >= 2) {
      const monthNum = monthNames[parts[0]] || 1;
      const yearNum = parseInt(parts[1], 10) || 2026;
      return yearNum * 100 + monthNum;
    }
    return 0;
  };

  // Urutkan tagihan berdasarkan periode tertua secara kronologis (bukan alfabetis)
  const sortedBills = [...unpaidBills].sort((a, b) => {
    const timeA = parsePeriodToTimestamp(a.periode);
    const timeB = parsePeriodToTimestamp(b.periode);
    if (timeA !== timeB) return timeA - timeB;
    return (a.periode || '').localeCompare(b.periode || '');
  });

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
