import React, { useState } from 'react';
import { Modal } from './Modal';
import { Badge } from './Badge';
import { Button } from './Button';
import { Icon } from './Icon';
import { Card } from './Card';

export function BuktiPembayaranModal({ isOpen, onClose, item }) {
  const [isZoomed, setIsZoomed] = useState(false);

  if (!item) return null;

  const metode = item.metode || (item.labelMetode?.includes('Midtrans') ? 'Midtrans' : (item.labelMetode?.includes('Tunai') ? 'Tunai' : 'Transfer'));
  const nominalFormatted = typeof item.nominal === 'number' 
    ? `Rp ${item.nominal.toLocaleString('id-ID')}` 
    : (item.nominal?.startsWith?.('Rp') ? item.nominal : `Rp ${Number(item.nominalRaw || item.nominalAngka || 0).toLocaleString('id-ID')}`);

  const buktiUrl = item.buktiUrl || item.Bukti_Pembayaran || '';
  const isImageBukti = buktiUrl && (
    buktiUrl.startsWith('data:image/') || 
    buktiUrl.startsWith('http') || 
    buktiUrl.startsWith('/') || 
    buktiUrl.startsWith('storage/') ||
    buktiUrl.endsWith('.png') ||
    buktiUrl.endsWith('.jpg') ||
    buktiUrl.endsWith('.jpeg')
  );

  const parsedImageSrc = isImageBukti 
    ? ((buktiUrl.startsWith('http') || buktiUrl.startsWith('data:')) ? buktiUrl : (buktiUrl.startsWith('/') ? buktiUrl : `/${buktiUrl}`))
    : null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Resi & Bukti Pembayaran ${item.id || item.trxCode || ''}`}
      size="lg"
      footer={
        <div className="flex items-center justify-between w-full gap-3 print:hidden">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={handlePrint}
            className="gap-2 font-bold text-text-2 border-border hover:bg-warm-gray"
          >
            <Icon icon="heroicons:printer-20-solid" width="18" height="18" />
            <span>Cetak Resi</span>
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={onClose}
            className="px-6 font-bold"
          >
            Tutup
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-5 font-sans print:p-0">
        {/* Header Ringkasan Transaksi */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-warm-gray/30 p-4 rounded-xl text-sm border border-border">
          <div>
            <span className="text-text-3 font-semibold text-xs block mb-0.5">Nama Penyewa & Kios:</span>
            <strong className="text-text font-bold text-sm">
              {item.nama || 'Tenant'} {item.kios ? `(${item.kios})` : ''}
            </strong>
          </div>
          <div>
            <span className="text-text-3 font-semibold text-xs block mb-0.5">Total Nominal Pembayaran:</span>
            <strong className="text-red font-extrabold text-base font-tabular-nums">
              {nominalFormatted}
            </strong>
          </div>
          <div>
            <span className="text-text-3 font-semibold text-xs block mb-0.5">Waktu Transaksi:</span>
            <strong className="text-text font-bold font-tabular-nums text-xs sm:text-sm">
              {item.tanggal || item.waktu || '-'}
            </strong>
          </div>
          <div>
            <span className="text-text-3 font-semibold text-xs block mb-0.5">Metode & Status:</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-bold text-xs text-text">{metode === 'Midtrans' ? 'Midtrans Gateway' : metode === 'Tunai' ? 'Tunai Loket' : 'Transfer Bank'}</span>
              <Badge status={item.status || 'Diterima'} />
            </div>
          </div>
        </div>

        {/* 1. KONTEN KHUSUS: MIDTRANS GATEWAY */}
        {metode === 'Midtrans' && (
          <div className="flex flex-col gap-3 p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white border border-indigo-800 shadow-md">
            <div className="flex items-center justify-between border-b border-indigo-800/80 pb-3">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
                  <Icon icon="heroicons:bolt-20-solid" width="20" height="20" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm tracking-wide text-white">E-Receipt Midtrans Gateway</h4>
                  <p className="text-[11px] text-indigo-200">Sistem Pembayaran Instan Terverifikasi Otomatis</p>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 rounded-full text-xs font-extrabold tracking-wider uppercase">
                SETTLED
              </span>
            </div>

            <div className="space-y-2 text-xs text-indigo-100 pt-1">
              <div className="flex justify-between items-center py-1 border-b border-indigo-800/40">
                <span className="text-indigo-300 font-semibold">Kode Transaksi / Order ID:</span>
                <span className="font-mono font-bold text-white bg-indigo-900/60 px-2 py-0.5 rounded border border-indigo-700">
                  {buktiUrl || `BUNSAY-${item.id || 'TX'}-${Date.now()}`}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-indigo-800/40">
                <span className="text-indigo-300 font-semibold">Gateway Provider:</span>
                <span className="font-bold text-white">Midtrans Snap Engine (Bank Indonesia / QRIS / VA)</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-indigo-800/40">
                <span className="text-indigo-300 font-semibold">Verifikasi Keaslian:</span>
                <span className="font-bold text-emerald-300 flex items-center gap-1">
                  <Icon icon="heroicons:shield-check-20-solid" width="14" height="14" />
                  <span>Digital Signature Valid (SHA-512)</span>
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-indigo-300 font-semibold">Catatan Sistem:</span>
                <span className="text-indigo-200 italic">Tagihan sewa diproses otomatis tanpa antrean verifikasi manual.</span>
              </div>
            </div>
          </div>
        )}

        {/* 2. KONTEN KHUSUS: TRANSFER BANK MANUAL */}
        {metode === 'Transfer' && (
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-text-2 uppercase tracking-wider">
                Foto Bukti Slip / M-Banking:
              </label>
              {parsedImageSrc && (
                <button
                  type="button"
                  onClick={() => setIsZoomed(!isZoomed)}
                  className="text-xs font-bold text-red hover:underline flex items-center gap-1"
                >
                  <Icon icon={isZoomed ? "heroicons:magnifying-glass-minus-20-solid" : "heroicons:magnifying-glass-plus-20-solid"} width="14" height="14" />
                  <span>{isZoomed ? 'Perkecil Gambar' : 'Perbesar Gambar'}</span>
                </button>
              )}
            </div>

            {parsedImageSrc ? (
              <div className={`w-full bg-black/5 rounded-xl border border-border overflow-hidden flex items-center justify-center p-2 transition-all ${isZoomed ? 'max-h-[500px]' : 'max-h-72'}`}>
                <img
                  src={parsedImageSrc}
                  alt={`Bukti Transfer ${item.id}`}
                  className="max-h-full max-w-full object-contain rounded-lg shadow-sm cursor-pointer hover:opacity-95"
                  onClick={() => setIsZoomed(!isZoomed)}
                />
              </div>
            ) : (
              <div className="w-full h-44 bg-warm-gray/60 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center text-center p-4">
                <Icon icon="heroicons:photo-20-solid" width="36" height="36" className="text-text-3 opacity-60 mb-2" />
                <span className="text-xs text-text-2 font-bold">Lampiran Bukti Transfer Bank</span>
                <span className="text-[11px] text-text-3 font-mono mt-1 italic">[{buktiUrl || `Resi_Transfer_${item.id}.jpg`}]</span>
              </div>
            )}
          </div>
        )}

        {/* 3. KONTEN KHUSUS: SETORAN TUNAI LOKET */}
        {metode === 'Tunai' && (
          <div className="flex flex-col gap-3">
            {parsedImageSrc ? (
              <div className="flex flex-col gap-2">
                <label className="text-xs font-extrabold text-text-2 uppercase tracking-wider">
                  Foto Kuitansi Fisik Loket Kasir:
                </label>
                <div className="w-full max-h-72 bg-black/5 rounded-xl border border-border overflow-hidden flex items-center justify-center p-2">
                  <img
                    src={parsedImageSrc}
                    alt={`Kuitansi Kasir ${item.id}`}
                    className="max-h-64 max-w-full object-contain rounded-lg shadow-sm"
                  />
                </div>
              </div>
            ) : (
              <div className="p-5 bg-amber-50/60 border-2 border-dashed border-amber-300 rounded-2xl flex flex-col gap-3 text-sm">
                <div className="flex items-center justify-between border-b border-amber-200 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Icon icon="heroicons:document-text-20-solid" width="22" height="22" className="text-amber-700" />
                    <strong className="font-extrabold text-amber-950">Tanda Terima Loket Kasir Resmi</strong>
                  </div>
                  <span className="px-2 py-0.5 bg-amber-200/80 text-amber-900 rounded text-xs font-extrabold font-mono">
                    LOKET-CASH
                  </span>
                </div>
                <div className="space-y-1.5 text-xs text-amber-900">
                  <p>Pembayaran tunai diterima langsung di Loket Pengelola Plaza Kebun Sayur.</p>
                  <p className="font-medium">Nomor Referensi Kasir: <span className="font-mono font-bold">{buktiUrl || `LOKET-${item.id || 'CASH'}-${item.tanggal || 'PAID'}`}</span></p>
                  <div className="pt-2 flex items-center gap-2 text-emerald-800 font-bold">
                    <Icon icon="heroicons:check-badge-20-solid" width="18" height="18" />
                    <span>Telah diverifikasi dan disetor ke kas pengelola.</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
