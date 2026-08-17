import ExcelJS from 'exceljs';

/**
 * Utility to format transaction records into a formatted .xlsx file using ExcelJS and trigger browser download.
 *
 * @param {Array} dataTransaksi
 * @param {string|number} bulan
 * @param {string|number} tahun
 */
export const downloadExcelRekap = async (dataTransaksi, bulan, tahun) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Bunsay Hub - Plaza Kebun Sayur';
  workbook.created = new Date();

  const sheetName = `Rekap ${bulan || 'Bulan'} ${tahun || 'Tahun'}`;
  const worksheet = workbook.addWorksheet(sheetName.substring(0, 31));

  // 1. Setup table columns with header names and widths
  worksheet.columns = [
    { header: 'No', key: 'no', width: 6 },
    { header: 'ID Transaksi', key: 'id', width: 18 },
    { header: 'Nama Tenant', key: 'nama', width: 28 },
    { header: 'Kios', key: 'kios', width: 14 },
    { header: 'Tanggal Bayar', key: 'tanggal', width: 18 },
    { header: 'Metode Bayar', key: 'metode', width: 18 },
    { header: 'Nominal (Rp)', key: 'nominal', width: 20 },
    { header: 'Status Verifikasi', key: 'status', width: 20 }
  ];

  // 2. Style Header Row
  const headerRow = worksheet.getRow(1);
  headerRow.font = { name: 'Arial', size: 11, bold: true, color: {argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1E293B' }
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  headerRow.height = 24;

  // 3. Add Data Rows
  (dataTransaksi || []).forEach((item, index) => {
    const row = worksheet.addRow({
      no: index + 1,
      id: item.id || item.Id_Pembayaran || '-',
      nama: item.nama || item.tagihan?.sewa?.pemilik ?.Nama || item.tagihan?.sewa?.pemilik?.Nama_Pemilik || '-',
      kios: item.kios || item.tagihan?.sewa?.kios?.No_Kios || item.tagihan?.sewa?.kios?.Kode_Kios || '-',
      tanggal: item.waktu || item.Tanggal_Bayar || '-',
      metode: item.metode || item.Metode_Bayar || '-',
      nominal: Number(item.nominalAngka || item.Total_Bayar || 0),
      status: item.status || item.Verifikasi_Pembayaran || '-'
    });

    row.getCell('no').alignment = { horizontal: 'center' };
    row.getCell('id').alignment = { horizontal: 'center' };
    row.getCell('kios').alignment = { horizontal: 'center' };
    row.getCell('tanggal').alignment = { horizontal: 'center' };
    row.getCell('metode').alignment = { horizontal: 'center' };
    row.getCell('status').alignment = { horizontal: 'center' };
    row.getCell('nominal').numFmt = '#,##0';
  });

  // 4. Generate file buffer and trigger download in browser
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `Laporan_Keuangan_Plaza_${bulan || 'Rekap'}_${tahun || ''}.xlsx`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(url);
};
