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
    <div data-slot="ekspor-data" className="page-fade-in flex flex-col gap-6 sm:gap-8 font-sans">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight text-balance">
          Ekspor Laporan
        </h1>
      </div>

      <div className="ekspor-layout-grid mobile-stack grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        <Card variant="elevated" className="lg:col-span-8 p-6 sm:p-8 flex flex-col gap-6">
          <h3 className="text-lg font-extrabold text-text tracking-tight border-b border-border pb-3 text-balance">
            Pilih Periode Laporan
          </h3>
          
          <form onSubmit={handleDownloadExcel} className="flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FormField label="Bulan Laporan" id="ekspor-bulan">
                <select 
                  value={bulanFilter} 
                  onChange={(e) => setBulanFilter(e.target.value)} 
                  className="w-full h-11 rounded-md border border-border bg-warm-gray/50 pl-3.5 pr-9 text-base font-semibold text-text focus:bg-white transition-colors cursor-pointer"
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
                  className="w-full h-11 rounded-md border border-border bg-warm-gray/50 pl-3.5 pr-9 text-base font-bold font-tabular-nums text-text focus:bg-white transition-colors cursor-pointer"
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
              size="lg"
              disabled={isDownloading}
              className="h-13 px-8 text-base font-extrabold gap-2.5 shadow-md w-full sm:w-auto sm:self-start"
            >
              {isDownloading ? (
                <span role="status" className="flex items-center gap-2 justify-center">
                  <Icon icon="heroicons:arrow-path-20-solid" className="size-5 animate-spin" />
                  <span>Memproses...</span>
                </span>
              ) : (
                <>
                  <Icon icon="heroicons:arrow-down-tray-20-solid" className="size-5.5" />
                  <span>Unduh Rekap Excel</span>
                </>
              )}
            </Button>
          </form>
        </Card>

        <Card variant="elevated" className="lg:col-span-4 p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Icon icon="heroicons:table-cells-20-solid" className="size-5.5 text-red" />
            <h3 className="text-base font-extrabold text-text tracking-tight text-balance">Format Laporan (.xlsx)</h3>
          </div>
          
          <ul className="text-sm text-text-2 space-y-3 leading-relaxed">
            <li className="flex gap-2">
              <strong className="text-text font-bold flex-shrink-0">Sheet 1:</strong>
              <span>Rekap Transaksi Pembayaran (Tunai, Transfer, Midtrans)</span>
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
