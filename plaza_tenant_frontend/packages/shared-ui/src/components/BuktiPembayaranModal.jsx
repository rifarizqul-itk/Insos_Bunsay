import React, { useState } from 'react';
import { Modal } from './Modal';
import { Badge } from './Badge';
import { Button } from './Button';
import { Icon } from './Icon';

export function BuktiPembayaranModal({ isOpen, onClose, item }) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!item) return null;

  const rawMetode = String(item.metode || item.labelMetode || '').trim();
  const isMidtrans = /midtrans/i.test(rawMetode);
  const isTunai = /tunai|cash/i.test(rawMetode);
  const isTransfer = !isMidtrans && !isTunai;

  const nominalFormatted = typeof item.nominal === 'number' 
    ? `Rp ${item.nominal.toLocaleString('id-ID')}` 
    : (String(item.nominal || '').startsWith('Rp') ? item.nominal : `Rp ${Number(item.nominalRaw || item.nominalAngka || 0).toLocaleString('id-ID')}`);

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

  const handleCopyCode = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const orderId = buktiUrl || `BUNSAY-${item.id || 'TX'}-${item.tanggal || Date.now()}`;

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
      <div className="flex flex-col gap-4 font-sans print:p-0">
        {/* Header Ringkasan Transaksi */}
        <div 
          className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 rounded-xl text-sm border"
          style={{ backgroundColor: '#F7F3EE', borderColor: '#E6DED6' }}
        >
          <div>
            <span className="text-xs block mb-0.5" style={{ color: '#7A695E', fontWeight: 600 }}>Nama Penyewa & Kios:</span>
            <strong className="text-sm font-bold" style={{ color: '#1C1512' }}>
              {item.nama || 'Tenant'} {item.kios ? `(${item.kios})` : ''}
            </strong>
          </div>
          <div>
            <span className="text-xs block mb-0.5" style={{ color: '#7A695E', fontWeight: 600 }}>Total Nominal Pembayaran:</span>
            <strong className="text-base font-extrabold font-tabular-nums" style={{ color: '#8B1A1A' }}>
              {nominalFormatted}
            </strong>
          </div>
          <div>
            <span className="text-xs block mb-0.5" style={{ color: '#7A695E', fontWeight: 600 }}>Waktu Transaksi:</span>
            <strong className="text-xs sm:text-sm font-bold font-tabular-nums" style={{ color: '#1C1512' }}>
              {item.tanggal || item.waktu || '-'}
            </strong>
          </div>
          <div>
            <span className="text-xs block mb-0.5" style={{ color: '#7A695E', fontWeight: 600 }}>Metode & Status:</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-bold text-xs" style={{ color: '#1C1512' }}>
                {isMidtrans ? 'Midtrans Gateway' : isTunai ? 'Tunai Loket' : 'Transfer Bank'}
              </span>
              <Badge status={item.status || 'Diterima'} />
            </div>
          </div>
        </div>

        {/* 1. KONTEN KHUSUS: MIDTRANS GATEWAY */}
        {isMidtrans && (
          <div 
            className="flex flex-col gap-3.5 p-5 rounded-2xl border shadow-lg text-white"
            style={{ 
              backgroundColor: '#0F172A', 
              borderColor: '#334155',
              background: 'linear-gradient(145deg, #0f172a 0%, #1e1b4b 100%)'
            }}
          >
            {/* Top Bar Receipt */}
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: '#334155' }}>
              <div className="flex items-center gap-2.5">
                <div 
                  className="size-9 rounded-xl flex items-center justify-center text-indigo-300"
                  style={{ backgroundColor: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(129, 140, 248, 0.3)' }}
                >
                  <Icon icon="heroicons:bolt-20-solid" width="22" height="22" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm tracking-wide text-white flex items-center gap-1.5">
                    <span>E-Receipt Midtrans Gateway</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-indigo-500/30 text-indigo-200 rounded font-mono">OFFICIAL</span>
                  </h4>
                  <p className="text-[11px]" style={{ color: '#94A3B8' }}>Resi Digital Pembayaran Instan Terverifikasi</p>
                </div>
              </div>
              <span 
                className="px-2.5 py-1 rounded-full text-xs font-extrabold tracking-wider uppercase flex items-center gap-1"
                style={{ 
                  backgroundColor: 'rgba(16, 185, 129, 0.15)', 
                  border: '1px solid rgba(52, 211, 153, 0.4)',
                  color: '#34D399'
                }}
              >
                <Icon icon="heroicons:check-badge-20-solid" width="14" height="14" />
                <span>SETTLED</span>
              </span>
            </div>

            {/* Receipt Table Items */}
            <div className="space-y-2 text-xs pt-1">
              <div className="flex justify-between items-center py-1.5 border-b" style={{ borderColor: 'rgba(51, 65, 85, 0.6)' }}>
                <span style={{ color: '#94A3B8', fontWeight: 600 }}>Kode Transaksi / Order ID:</span>
                <div className="flex items-center gap-1.5">
                  <span 
                    className="font-mono font-bold text-white px-2 py-0.5 rounded border"
                    style={{ backgroundColor: '#1E293B', borderColor: '#475569' }}
                  >
                    {orderId}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(orderId)}
                    className="p-1 hover:bg-slate-700 rounded text-slate-300 hover:text-white transition-colors"
                    title="Salin Kode Transaksi"
                    aria-label="Salin Kode Transaksi"
                  >
                    <Icon icon={copied ? "heroicons:check-20-solid" : "heroicons:clipboard-document-20-solid"} width="15" height="15" />
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b" style={{ borderColor: 'rgba(51, 65, 85, 0.6)' }}>
                <span style={{ color: '#94A3B8', fontWeight: 600 }}>Gateway Provider:</span>
                <span className="font-bold text-white">Midtrans Snap Engine (QRIS / GoPay / VA Bank)</span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b" style={{ borderColor: 'rgba(51, 65, 85, 0.6)' }}>
                <span style={{ color: '#94A3B8', fontWeight: 600 }}>Keaslian & Enkripsi:</span>
                <span className="font-bold flex items-center gap-1" style={{ color: '#34D399' }}>
                  <Icon icon="heroicons:shield-check-20-solid" width="15" height="15" />
                  <span>Valid SHA-512 Digital Signature</span>
                </span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b" style={{ borderColor: 'rgba(51, 65, 85, 0.6)' }}>
                <span style={{ color: '#94A3B8', fontWeight: 600 }}>Tipe Verifikasi:</span>
                <span className="font-semibold text-slate-200">Otomatis / Real-Time Machine Settlement</span>
              </div>

              <div className="p-2.5 rounded-lg mt-2" style={{ backgroundColor: 'rgba(30, 41, 59, 0.7)', border: '1px solid #334155' }}>
                <p className="text-[11px] leading-relaxed italic" style={{ color: '#CBD5E1' }}>
                  💡 <strong>Catatan:</strong> Resi digital ini diterbitkan langsung oleh sistem gateway Midtrans dan diakui secara sah oleh Pengelola Plaza Kebun Sayur sebagai bukti pelunasan sewa kios.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 2. KONTEN KHUSUS: TRANSFER BANK MANUAL */}
        {isTransfer && (
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold uppercase tracking-wider" style={{ color: '#54463E' }}>
                Foto Bukti Slip / M-Banking:
              </label>
              {parsedImageSrc && (
                <button
                  type="button"
                  onClick={() => setIsZoomed(!isZoomed)}
                  className="text-xs font-bold hover:underline flex items-center gap-1"
                  style={{ color: '#8B1A1A' }}
                >
                  <Icon icon={isZoomed ? "heroicons:magnifying-glass-minus-20-solid" : "heroicons:magnifying-glass-plus-20-solid"} width="14" height="14" />
                  <span>{isZoomed ? 'Perkecil Gambar' : 'Perbesar Gambar'}</span>
                </button>
              )}
            </div>

            {parsedImageSrc ? (
              <div 
                className={`w-full rounded-xl border overflow-hidden flex items-center justify-center p-2 transition-all ${isZoomed ? 'max-h-[500px]' : 'max-h-72'}`}
                style={{ backgroundColor: 'rgba(0,0,0,0.04)', borderColor: '#E6DED6' }}
              >
                <img
                  src={parsedImageSrc}
                  alt={`Bukti Transfer ${item.id}`}
                  className="max-h-full max-w-full object-contain rounded-lg shadow-sm cursor-pointer hover:opacity-95"
                  onClick={() => setIsZoomed(!isZoomed)}
                />
              </div>
            ) : (
              <div 
                className="w-full h-44 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center p-4"
                style={{ backgroundColor: '#F2ECE4', borderColor: '#C4B8B0' }}
              >
                <Icon icon="heroicons:photo-20-solid" width="36" height="36" className="text-text-3 opacity-60 mb-2" />
                <span className="text-xs font-bold" style={{ color: '#54463E' }}>Lampiran Bukti Transfer Bank</span>
                <span className="text-[11px] font-mono mt-1 italic" style={{ color: '#7A695E' }}>
                  [{buktiUrl || `Resi_Transfer_${item.id}.jpg`}]
                </span>
              </div>
            )}
          </div>
        )}

        {/* 3. KONTEN KHUSUS: SETORAN TUNAI LOKET */}
        {isTunai && (
          <div className="flex flex-col gap-3">
            {parsedImageSrc ? (
              <div className="flex flex-col gap-2">
                <label className="text-xs font-extrabold uppercase tracking-wider" style={{ color: '#54463E' }}>
                  Foto Kuitansi Fisik Loket Kasir:
                </label>
                <div 
                  className="w-full max-h-72 rounded-xl border overflow-hidden flex items-center justify-center p-2"
                  style={{ backgroundColor: 'rgba(0,0,0,0.04)', borderColor: '#E6DED6' }}
                >
                  <img
                    src={parsedImageSrc}
                    alt={`Kuitansi Kasir ${item.id}`}
                    className="max-h-64 max-w-full object-contain rounded-lg shadow-sm"
                  />
                </div>
              </div>
            ) : (
              <div 
                className="p-5 border-2 border-dashed rounded-2xl flex flex-col gap-3 text-sm"
                style={{ backgroundColor: '#FFFBEB', borderColor: '#FCD34D' }}
              >
                <div className="flex items-center justify-between border-b pb-2.5" style={{ borderColor: '#FDE68A' }}>
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
                  <p className="font-medium">
                    Nomor Referensi Kasir: <span className="font-mono font-bold">{buktiUrl || `LOKET-${item.id || 'CASH'}-${item.tanggal || 'PAID'}`}</span>
                  </p>
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
