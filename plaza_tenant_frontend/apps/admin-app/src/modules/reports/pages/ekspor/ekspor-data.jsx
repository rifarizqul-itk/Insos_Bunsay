import React, { useState } from 'react';
import { Icon, FormField, Button, Card, useToast } from '@bunsay/shared-ui';
import { downloadExcelRekap } from '@bunsay/shared-core';
import { useAdminAuth } from '../../../auth/useAdminAuth';

function EksporData() {
  const { addToast } = useToast();
  const { httpClient } = useAdminAuth();
  const [bulanFilter, setBulanFilter] = useState('Mei');
  const [tahunFilter, setTahunFilter] = useState('2026');
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadExcel = async (e) => {
    e.preventDefault();
    setIsDownloading(true);
    try {
      let dataTransaksi = [];
      try {
        const response = await httpClient.get('/api/v1/admin/pembayaran');
        dataTransaksi = Array.isArray(response?.data) ? response.data : (response?.data?.data || []);
      } catch (_) {}

      downloadExcelRekap(dataTransaksi, bulanFilter, tahunFilter);
      addToast(`Berkas rekap keuangan ${bulanFilter} ${tahunFilter} berhasil diunduh!`, 'success');
    } catch (err) {
      console.error('Error downloading Excel:', err);
      addToast('Gagal memproses berkas Excel.', 'error');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div data-slot="ekspor-data" className="page-fade-in flex flex-col gap-4 sm:gap-6 font-sans">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-text text-balance">
          Ekspor Laporan
        </h1>
      </div>

      <div className="ekspor-layout-grid mobile-stack grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
        <Card variant="elevated" className="lg:col-span-8 p-4 sm:p-6 flex flex-col gap-4 shadow-xs">
          <h2 className="text-base sm:text-lg font-bold text-text border-b border-border pb-2.5 text-balance">
            Pilih Periode Laporan
          </h2>
          
          <form onSubmit={handleDownloadExcel} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
              <FormField label="Bulan Laporan" id="ekspor-bulan">
                <select 
                  value={bulanFilter} 
                  onChange={(e) => setBulanFilter(e.target.value)} 
                  className="w-full h-10 rounded-lg border border-border bg-warm-gray/50 pl-3 pr-8 text-sm font-medium text-text focus:bg-white transition-colors cursor-pointer"
                >
                  {['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'].map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </FormField>

              <FormField label="Tahun Laporan" id="ekspor-tahun">
                <select 
                  value={tahunFilter} 
                  onChange={(e) => setTahunFilter(e.target.value)} 
                  className="w-full h-10 rounded-lg border border-border bg-warm-gray/50 pl-3 pr-8 text-sm font-bold font-tabular-nums text-text focus:bg-white transition-colors cursor-pointer"
                >
                  {['2024','2025','2026'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </FormField>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isDownloading}
              className="h-10.5 px-6 text-sm font-bold gap-2 shadow-xs w-full sm:w-auto sm:self-start"
            >
              {isDownloading ? (
                <span role="status" className="flex items-center gap-2 justify-center">
                  <Icon icon="heroicons:arrow-path-20-solid" className="size-4 animate-spin" />
                  <span>Memproses...</span>
                </span>
              ) : (
                <>
                  <Icon icon="heroicons:arrow-down-tray-20-solid" className="size-4.5" />
                  <span>Unduh Rekap Excel</span>
                </>
              )}
            </Button>
          </form>
        </Card>

        <Card variant="elevated" className="lg:col-span-4 p-4 sm:p-5 flex flex-col gap-3 shadow-xs">
          <div className="flex items-center gap-2 border-b border-border pb-2.5">
            <Icon icon="heroicons:table-cells-20-solid" className="size-5 text-red" />
            <h2 className="text-sm sm:text-base font-bold text-text text-balance">Format Laporan (.xlsx)</h2>
          </div>
          
          <ul className="text-xs sm:text-sm text-text-2 space-y-2 leading-relaxed">
            <li className="flex gap-2">
              <strong className="text-text font-bold flex-shrink-0">Sheet 1:</strong>
              <span>Rekap Transaksi Pembayaran</span>
            </li>
            <li className="flex gap-2">
              <strong className="text-text font-bold flex-shrink-0">Sheet 2:</strong>
              <span>Akumulasi Tunggakan per Tenant</span>
            </li>
            <li className="flex gap-2">
              <strong className="text-text font-bold flex-shrink-0">Sheet 3:</strong>
              <span>Pemetaan Status Kios Plaza</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

export default EksporData;
