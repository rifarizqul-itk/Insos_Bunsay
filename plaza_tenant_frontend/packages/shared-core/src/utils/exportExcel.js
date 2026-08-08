import * as XLSX from 'xlsx';

/**
 * Utility to format transaction records into a formatted .xlsx file and trigger download.
 */
export const downloadExcelRekap = (dataTransaksi, bulan, tahun) => {
  // 1. Format JSON data so Excel column headers are clean and readable
  const formattedRows = (dataTransaksi || []).map((item, index) => ({
    'No': index + 1,
    'ID Transaksi': item.id || item.Id_Pembayaran || `-`,
    'Nama Tenant': item.nama || item.tagihan?.sewa?.pemilik?.Nama || item.tagihan?.sewa?.pemilik?.Nama_Pemilik || '-',
    'Kios': item.kios || item.tagihan?.sewa?.kios?.No_Kios || item.tagihan?.sewa?.kios?.Kode_Kios || '-',
    'Tanggal Bayar': item.waktu || item.Tanggal_Bayar || '-',
    'Metode Bayar': item.metode || item.Metode_Bayar || '-',
    'Nominal (Rp)': item.nominalAngka || item.Total_Bayar || 0,
    'Status Verifikasi': item.status || item.Verifikasi_Pembayaran || '-'
  }));

  // 2. Create Worksheet from JSON objects
  const worksheet = XLSX.utils.json_to_sheet(formattedRows);

  // 3. Create new Workbook & append Worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `Rekap ${bulan} ${tahun}`);

  // 4. Trigger download of .xlsx file
  const namaFile = `Laporan_Keuangan_Plaza_${bulan}_${tahun}.xlsx`;
  XLSX.writeFile(workbook, namaFile);
};
