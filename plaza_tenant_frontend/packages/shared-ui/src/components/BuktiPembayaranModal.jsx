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
      title={`Detail Pembayaran ${item.id || item.trxCode || ''}`}
      size="md"
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

        {/* 1. KONTEN KHUSUS: RESI RESMI MIDTRANS GATEWAY (CLEAN LIGHT PAPER DESIGN) */}
        {isMidtrans && (
          <div className="bg-white border border-border rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col gap-4 text-text">
            {/* Header Resi */}
            <div className="flex items-start justify-between border-b border-border/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="size-11 rounded-xl bg-indigo-50 border border-indigo-200/80 flex items-center justify-center text-indigo-600 shadow-xs">
                  <Icon icon="heroicons:bolt-20-solid" width="24" height="24" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-text tracking-tight flex items-center gap-2">
                    <span>Resi Digital Midtrans</span>
                  </h3>
                  <p className="text-xs text-text-3 font-medium">Pembayaran Otomatis Terverifikasi</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-700 text-xs font-extrabold shadow-2xs">
                <Icon icon="heroicons:check-badge-20-solid" width="16" height="16" className="text-emerald-600" />
                <span>LUNAS (SETTLED)</span>
              </div>
            </div>

            {/* Nominal Banner */}
            <div className="bg-warm-gray/40 border border-border/60 rounded-xl p-4 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-text-3 block">Total Pembayaran:</span>
                <span className="text-2xl font-extrabold text-red font-tabular-nums tracking-tight">
                  {nominalFormatted}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-text-3 block">Waktu Transaksi:</span>
                <span className="text-xs font-bold text-text font-tabular-nums">
                  {item.tanggal || item.waktu || '-'}
                </span>
              </div>
            </div>

            {/* Detail Transaksi Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div className="p-3 bg-cream/40 rounded-lg border border-border/50">
                <span className="text-text-3 font-medium block mb-0.5">Penyewa & Unit Kios:</span>
                <strong className="text-text font-bold text-sm block">
                  {item.nama || 'Tenant'}
                </strong>
                <span className="text-text-2 font-semibold font-tabular-nums">Kios {item.kios || '-'}</span>
              </div>

              <div className="p-3 bg-cream/40 rounded-lg border border-border/50">
                <span className="text-text-3 font-medium block mb-0.5">Saluran Gateway:</span>
                <strong className="text-text font-bold text-sm block">
                  Midtrans Snap Engine
                </strong>
                <span className="text-text-3 font-medium">QRIS / GoPay / VA Bank</span>
              </div>

              <div className="sm:col-span-2 p-3 bg-cream/40 rounded-lg border border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-text-3 font-medium block mb-0.5">Nomor Order / Kode Referensi:</span>
                  <span className="font-mono font-bold text-xs text-text bg-white px-2.5 py-1 rounded border border-border inline-block shadow-2xs">
                    {orderId}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyCode(orderId)}
                  className="h-8 text-xs font-bold gap-1 self-start sm:self-center border-border hover:bg-white"
                >
                  <Icon icon={copied ? "heroicons:check-20-solid" : "heroicons:clipboard-document-20-solid"} width="14" height="14" className={copied ? "text-green" : "text-text-2"} />
                  <span>{copied ? 'Tersalin' : 'Salin Kode'}</span>
                </Button>
              </div>
            </div>

            {/* Footer Seal */}
            <div className="pt-2 border-t border-dashed border-border flex items-center justify-between text-[11px] text-text-3">
              <div className="flex items-center gap-1.5 font-semibold text-emerald-800">
                <Icon icon="heroicons:shield-check-20-solid" width="16" height="16" className="text-emerald-600" />
                <span>Tanda Tangan Digital Sah (SHA-512)</span>
              </div>
              <span className="font-medium italic">Plaza Kebun Sayur Hub</span>
            </div>
          </div>
        )}

        {/* 2. KONTEN KHUSUS: TRANSFER BANK MANUAL */}
        {isTransfer && (
          <div className="bg-white border border-border rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col gap-4 text-text">
            {/* Header Ringkasan */}
            <div className="flex items-start justify-between border-b border-border/80 pb-4">
              <div>
                <h3 className="font-extrabold text-base text-text tracking-tight">Bukti Transfer Bank</h3>
                <p className="text-xs text-text-3 font-medium">Unggahan Bukti Pembayaran Manual</p>
              </div>
              <Badge status={item.status || 'Menunggu'} />
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-warm-gray/30 p-3.5 rounded-xl border border-border/60">
              <div>
                <span className="text-text-3 font-medium block">Penyewa:</span>
                <strong className="text-text font-bold">{item.nama} ({item.kios})</strong>
              </div>
              <div>
                <span className="text-text-3 font-medium block">Total Bayar:</span>
                <strong className="text-red font-extrabold text-sm font-tabular-nums">{nominalFormatted}</strong>
              </div>
              <div>
                <span className="text-text-3 font-medium block">Tanggal Bayar:</span>
                <span className="text-text font-bold font-tabular-nums">{item.tanggal || item.waktu || '-'}</span>
              </div>
              <div>
                <span className="text-text-3 font-medium block">Metode:</span>
                <span className="text-text font-bold">Transfer Bank</span>
              </div>
            </div>

            {/* Foto Bukti Transfer */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-text-2">Lampiran Bukti Slip / Screenshot:</label>
                {parsedImageSrc && (
                  <button
                    type="button"
                    onClick={() => setIsZoomed(!isZoomed)}
                    className="text-xs font-bold text-red hover:underline flex items-center gap-1"
                  >
                    <Icon icon={isZoomed ? "heroicons:magnifying-glass-minus-20-solid" : "heroicons:magnifying-glass-plus-20-solid"} width="14" height="14" />
                    <span>{isZoomed ? 'Kecilkan' : 'Perbesar'}</span>
                  </button>
                )}
              </div>

              {parsedImageSrc ? (
                <div className={`w-full bg-warm-gray/20 rounded-xl border border-border overflow-hidden flex items-center justify-center p-2 transition-all ${isZoomed ? 'max-h-[500px]' : 'max-h-72'}`}>
                  <img
                    src={parsedImageSrc}
                    alt={`Bukti Transfer ${item.id}`}
                    className="max-h-full max-w-full object-contain rounded-lg shadow-xs cursor-pointer"
                    onClick={() => setIsZoomed(!isZoomed)}
                  />
                </div>
              ) : (
                <div className="w-full h-40 bg-warm-gray/40 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center text-center p-4">
                  <Icon icon="heroicons:photo-20-solid" width="36" height="36" className="text-text-3 opacity-50 mb-1" />
                  <span className="text-xs text-text-2 font-bold">Lampiran Bukti Transfer</span>
                  <span className="text-[11px] text-text-3 font-mono mt-0.5">[{buktiUrl || `Resi_Transfer_${item.id}.jpg`}]</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. KONTEN KHUSUS: SETORAN TUNAI LOKET */}
        {isTunai && (
          <div className="bg-white border border-border rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col gap-4 text-text">
            <div className="flex items-start justify-between border-b border-border/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="size-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shadow-xs">
                  <Icon icon="heroicons:document-text-20-solid" width="24" height="24" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-text tracking-tight">Kuitansi Kasir Loket</h3>
                  <p className="text-xs text-text-3 font-medium">Pembayaran Tunai Langsung Pengelola</p>
                </div>
              </div>
              <Badge status={item.status || 'Diterima'} />
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-warm-gray/30 p-3.5 rounded-xl border border-border/60">
              <div>
                <span className="text-text-3 font-medium block">Penyewa:</span>
                <strong className="text-text font-bold">{item.nama} ({item.kios})</strong>
              </div>
              <div>
                <span className="text-text-3 font-medium block">Total Bayar:</span>
                <strong className="text-red font-extrabold text-sm font-tabular-nums">{nominalFormatted}</strong>
              </div>
              <div>
                <span className="text-text-3 font-medium block">Tanggal Setor:</span>
                <span className="text-text font-bold font-tabular-nums">{item.tanggal || item.waktu || '-'}</span>
              </div>
              <div>
                <span className="text-text-3 font-medium block">Metode:</span>
                <span className="text-text font-bold">Tunai (Kasir Loket)</span>
              </div>
            </div>

            {/* Foto Kuitansi jika ada */}
            {parsedImageSrc ? (
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-text-2">Foto Kuitansi Fisik Loket:</label>
                <div className="w-full max-h-72 bg-warm-gray/20 rounded-xl border border-border overflow-hidden flex items-center justify-center p-2">
                  <img
                    src={parsedImageSrc}
                    alt={`Kuitansi Kasir ${item.id}`}
                    className="max-h-64 max-w-full object-contain rounded-lg shadow-xs"
                  />
                </div>
              </div>
            ) : (
              <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                <p className="font-semibold">Pembayaran tunai diterima dan dicatat langsung di loket kasir pengelola.</p>
                <p className="font-mono text-[11px] text-amber-800">No. Bukti Kasir: {buktiUrl || `LOKET-TRX-${item.id}`}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
