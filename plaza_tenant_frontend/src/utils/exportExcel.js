import * as XLSX from 'xlsx';

// Fungsi untuk mengkonversi data transaksi menjadi berkas .xlsx dan mengunduhnya

export const downloadExcelRekap = (dataTransaksi, bulan, tahun) => {
  // 1. Format data JSON agar nama kolom di Excel rapi dan mudah dibaca
  const formattedRows = (dataTransaksi || []).map((item, index) => ({
    'No': index + 1,
    'ID Transaksi': item.id || item.Id_Pembayaran || `-`,
    'Nama Tenant': item.nama || item.tagihan?.sewa?.pemilik?.Nama_Pemilik || '-',
    'Kios': item.kios || item.tagihan?.sewa?.kios?.Kode_Kios || '-',
    'Tanggal Bayar': item.waktu || item.Tanggal_Bayar || '-',
    'Metode Bayar': item.metode || item.Metode_Bayar || '-',
    'Nominal (Rp)': item.nominalAngka || item.Total_Bayar || 0,
    'Status Verifikasi': item.status || item.Verifikasi_Pembayaran || '-'
  }));

  // 2. Buat Lembar Kerja (Worksheet) dari array object JSON
  const worksheet = XLSX.utils.json_to_sheet(formattedRows);

  // 3. Buat Buku Kerja (Workbook) baru & masukkan Worksheet di atas
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `Rekap ${bulan} ${tahun}`);

  // 4. Picu unduhan berkas .xlsx ke komputer pengguna
  const namaFile = `Laporan_Keuangan_Plaza_${bulan}_${tahun}.xlsx`;
  XLSX.writeFile(workbook, namaFile);
};
