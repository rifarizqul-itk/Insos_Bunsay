import React, { useState, useEffect } from 'react';
import { cn } from '../utils/cn';
import { formatDateTimeLocal } from '../utils/dateFormat';
import { Modal } from './Modal';
import { Badge } from './Badge';
import { Button } from './Button';
import { Icon } from './Icon';
import { ImageGallerySlider } from './ImageGallerySlider';

export function resolveMidtransChannel(item) {
  if (!item) return 'Tidak Tersedia';

  const rawType = String(
    item.payment_type ||
    item.paymentType ||
    item.tipe_pembayaran ||
    item.saluran ||
    item.channel ||
    ''
  ).toLowerCase();

  const bank = String(item.bank || item.nama_bank || '').toLowerCase();
  const vaNumbers = item.va_numbers || item.vaNumbers;
  const vaBank = Array.isArray(vaNumbers) && vaNumbers[0]?.bank ? String(vaNumbers[0].bank).toLowerCase() : '';
  const issuer = String(item.issuer || item.acquirer || '').toLowerCase();
  const store = String(item.store || '').toLowerCase();

  if (rawType.includes('qris')) {
    if (issuer.includes('gopay')) return 'QRIS (GoPay)';
    if (issuer.includes('shopee') || issuer.includes('airpay')) return 'QRIS (ShopeePay)';
    if (issuer.includes('dana')) return 'QRIS (DANA)';
    return 'QRIS (GoPay / ShopeePay / BCA)';
  }

  if (rawType.includes('bank_transfer') || rawType.includes('va')) {
    const targetBank = vaBank || bank;
    if (targetBank === 'bca') return 'Virtual Account BCA';
    if (targetBank === 'bni') return 'Virtual Account BNI';
    if (targetBank === 'bri') return 'Virtual Account BRI';
    if (targetBank === 'cimb') return 'Virtual Account CIMB Niaga';
    if (targetBank === 'permata' || item.permata_va_number) return 'Virtual Account Permata';
    return targetBank ? `Virtual Account ${targetBank.toUpperCase()}` : 'Virtual Account Bank';
  }

  if (rawType.includes('echannel') || rawType.includes('mandiri')) {
    return 'Mandiri Bill Payment';
  }

  if (rawType.includes('gopay')) return 'GoPay / GoPayLater';
  if (rawType.includes('shopeepay')) return 'ShopeePay';
  if (rawType.includes('dana')) return 'DANA';

  if (rawType.includes('cstore')) {
    if (store.includes('alfa')) return 'Gerai Alfamart';
    if (store.includes('indo')) return 'Gerai Indomaret';
    return 'Gerai Retail (Minimarket)';
  }

  if (rawType.includes('credit_card') || rawType.includes('card')) {
    return 'Kartu Debit/Kredit (3DS Verified)';
  }

  // Check from fallback strings
  const fallbackStr = String(item.labelMetode || item.metode || item.Bukti_Pembayaran || '');
  if (/bca/i.test(fallbackStr)) return 'Virtual Account BCA';
  if (/bni/i.test(fallbackStr)) return 'Virtual Account BNI';
  if (/bri/i.test(fallbackStr)) return 'Virtual Account BRI';
  if (/mandiri/i.test(fallbackStr)) return 'Mandiri Bill Payment';
  if (/gopay/i.test(fallbackStr)) return 'GoPay / GoPayLater';
  if (/shopee/i.test(fallbackStr)) return 'ShopeePay';
  if (/qris/i.test(fallbackStr)) return 'QRIS';

  return 'Tidak Tersedia';
}

export function BuktiPembayaranModal({ isOpen, onClose, item, onUploadBukti }) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isModalOpen = isOpen !== undefined ? isOpen : Boolean(item);

  useEffect(() => {
    setImageError(false);
    setIsZoomed(false);
  }, [item, isModalOpen]);

  if (!item || !isModalOpen) return null;

  const rawMetode = String(item.metode || item.labelMetode || '').trim();
  const isMidtrans = /midtrans/i.test(rawMetode);
  const isTunai = /tunai|cash/i.test(rawMetode);
  const isTransfer = !isMidtrans && !isTunai;

  const nominalNumeric = typeof item.nominal === 'number' 
    ? item.nominal 
    : Number(String(item.nominal || item.nominalRaw || item.nominalAngka || 0).replace(/[^0-9]/g, '')) || 0;

  const nominalFormatted = typeof item.nominal === 'number' 
    ? `Rp ${item.nominal.toLocaleString('id-ID')}` 
    : (String(item.nominal || '').startsWith('Rp') 
        ? item.nominal 
        : `Rp ${nominalNumeric.toLocaleString('id-ID')}`);

  const buktiUrl = item.buktiUrl || item.Bukti_Pembayaran || '';
  const isFilePath = buktiUrl && (buktiUrl.includes('/') || buktiUrl.includes('\\') || /\.(png|jpg|jpeg|webp)$/i.test(buktiUrl));
  
  const rawId = String(item.trxCode || item.id || '').trim();
  const trxLabel = rawId 
    ? (rawId.toUpperCase().startsWith('TRX-') ? rawId.toUpperCase() : `TRX-${rawId}`)
    : 'TRX-PAYMENT';

  // Midtrans Order ID or clean reference
  const midtransOrderId = (buktiUrl && buktiUrl.startsWith('BUNSAY-')) 
    ? buktiUrl 
    : `BUNSAY-${trxLabel}-${item.tanggal ? item.tanggal.replace(/[^0-9]/g, '') : '2026'}`;

  const displayRefCode = isMidtrans 
    ? midtransOrderId 
    : (isFilePath ? trxLabel : (buktiUrl || trxLabel));

  // Resolve image source URL for backend storage files
  const getResolvedImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://')) {
      if (/ngrok/i.test(url) && !url.includes('ngrok-skip-browser-warning')) {
        const sep = url.includes('?') ? '&' : '?';
        return `${url}${sep}ngrok-skip-browser-warning=true`;
      }
      return url;
    }
    const apiBase = (
      import.meta.env?.VITE_API_BASE_URL ||
      import.meta.env?.VITE_API_URL ||
      ''
    ).replace(/\/api\/?$/, '').replace(/\/+$/, '');

    const cleanPath = url.startsWith('/') ? url : `/${url}`;
    if (apiBase) {
      const fullUrl = `${apiBase}${cleanPath}`;
      if (/ngrok/i.test(fullUrl) && !fullUrl.includes('ngrok-skip-browser-warning')) {
        const sep = fullUrl.includes('?') ? '&' : '?';
        return `${fullUrl}${sep}ngrok-skip-browser-warning=true`;
      }
      return fullUrl;
    }
    return cleanPath;
  };

  const baseImageSrc = isFilePath ? getResolvedImageUrl(buktiUrl) : (buktiUrl.startsWith('data:') ? buktiUrl : null);
  const activeImageSrc = baseImageSrc;

  const handleCopyCode = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadBukti = async () => {
    if (!activeImageSrc) return;
    const fileName = isFilePath ? (buktiUrl.split('/').pop() || `Bukti_Transfer_${trxLabel}.jpg`) : `Bukti_Transfer_${trxLabel}.jpg`;
    try {
      const res = await fetch(activeImageSrc);
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      const link = document.createElement('a');
      link.href = activeImageSrc;
      link.download = fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Modal
      isOpen={isModalOpen}
      onClose={onClose}
      title="Rincian Transaksi"
      subtitle={`ID: ${trxLabel}`}
      badge={<Badge status={item.status || 'Diterima'} />}
      size="xl"
      footer={
        <div className="flex items-center justify-between w-full gap-3">
          {(!activeImageSrc || buktiUrl === 'LOKET-CASH-CLAIM' || String(buktiUrl).startsWith('LOKET-CASH') || item.status === 'Ditolak') && onUploadBukti ? (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => {
                onClose();
                onUploadBukti(item);
              }}
              className="gap-1.5 font-bold text-xs"
            >
              <Icon icon="heroicons:camera-20-solid" className="size-4" />
              <span>{item.status === 'Ditolak' && activeImageSrc ? 'Perbaiki Foto Bukti' : '+ Unggah Foto Bukti'}</span>
            </Button>
          ) : <div />}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
            className="px-6 font-bold ms-auto"
          >
            Tutup
          </Button>
        </div>
      }
    >
      <div data-slot="bukti-pembayaran-sheet" className="flex flex-col gap-5 font-sans print:p-0">

        {/* 1. HERO AMOUNT SECTION */}
        <div className="bg-mono-100/60 border border-border/80 rounded-xl p-5 flex flex-col gap-2">
          <span className="label-micro text-text-3">Total Pembayaran</span>
          <div className="flex items-baseline justify-between gap-2 flex-wrap">
            <span className="text-3xl font-extrabold text-red font-tabular-nums tracking-tight">
              {nominalFormatted}
            </span>
            <span className="text-xs font-bold text-text-3 font-tabular-nums" title={formatDateTimeLocal(item.waktu || item.tanggal).fullTitle}>
              {formatDateTimeLocal(item.waktu || item.tanggal).formatted}
            </span>
          </div>
        </div>

        {/* 2. TRANSACTION METADATA (Structured Key-Value Grid) */}
        <div className="flex flex-col gap-3">
          <h2 className="label-micro text-text-3">Informasi Transaksi</h2>
          
          <div className="grid grid-cols-2 gap-x-6 gap-y-3.5 text-xs bg-white p-4 rounded-lg border border-border/80">
            <div>
              <span className="text-text-3 font-medium block mb-0.5">Nama Penyewa</span>
              <strong className="text-text font-bold text-sm block">
                {item.nama || 'Tenant'}
              </strong>
            </div>

            <div>
              <span className="text-text-3 font-medium block mb-0.5">Unit Kios</span>
              <strong className="text-text font-bold text-sm block font-tabular-nums">
                Kios {item.kios || '-'}
              </strong>
            </div>

            <div>
              <span className="text-text-3 font-medium block mb-0.5">Metode Pembayaran</span>
              <span className="text-text font-bold text-xs flex items-center gap-1.5 mt-0.5">
                {isMidtrans ? (
                  <>
                    <Icon icon="heroicons:bolt-20-solid" className="size-4 text-orange" />
                    <span>Pembayaran Otomatis</span>
                  </>
                ) : isTunai ? (
                  <>
                    <Icon icon="heroicons:banknotes-20-solid" className="size-4 text-amber-700" />
                    <span>Tunai (Kasir Loket)</span>
                  </>
                ) : (
                  <>
                    <Icon icon="heroicons:building-library-20-solid" className="size-4 text-emerald-700" />
                    <span>Transfer Bank Manual</span>
                  </>
                )}
              </span>
            </div>

            <div>
              <span className="text-text-3 font-medium block mb-0.5">Kode Referensi</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="font-mono font-bold text-xs text-text bg-mono-100 px-2 py-0.5 rounded-sm border border-border/80 truncate max-w-[110px]">
                  {displayRefCode}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyCode(displayRefCode)}
                  aria-label="Salin kode transaksi"
                  className="text-text-3 hover:text-red hover:bg-mono-200/60 active:scale-95 transition-all min-w-[36px] min-h-[36px] flex items-center justify-center rounded-md cursor-pointer -me-1"
                  title="Salin Kode"
                >
                  <Icon icon={copied ? "heroicons:check-20-solid" : "heroicons:clipboard-document-20-solid"} className={cn("size-4", copied ? "text-green" : "")} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 3. CATATAN ADMIN / SANGGAHAN JIKA ADA */}
        {item.status === 'Ditolak' && item.catatanAdmin && (
          <div className="p-3.5 bg-red-50 border border-red/20 rounded-lg text-xs flex flex-col gap-1">
            <span className="font-bold text-red flex items-center gap-1.5">
              <Icon icon="heroicons:exclamation-circle-20-solid" className="size-4" />
              <span>Alasan Penolakan dari Admin:</span>
            </span>
            <p className="text-text font-medium italic ps-5.5">"{item.catatanAdmin}"</p>
          </div>
        )}

        {item.teksSanggahan && (
          <div className="p-3.5 bg-amber-50/80 border border-amber-300/80 rounded-lg text-xs flex flex-col gap-2.5">
            <span className="font-bold text-amber-800 flex items-center gap-1.5">
              <Icon icon="heroicons:chat-bubble-bottom-center-text-20-solid" className="size-4" />
              <span>Sanggahan dari Tenant:</span>
            </span>
            <p className="text-amber-950 font-medium italic ps-5.5">"{item.teksSanggahan}"</p>
            {(item.buktiSanggahan || item.bukti_sanggahan) && (
              <div className="mt-1 ps-5.5">
                <ImageGallerySlider
                  images={item.buktiSanggahan || item.bukti_sanggahan}
                  resolveUrl={getResolvedImageUrl}
                  title="Lampiran Foto Sanggahan"
                  maxHeightClass="max-h-56"
                  badgePrefix="Lampiran #"
                />
              </div>
            )}
          </div>
        )}

        {/* 4. DETAIL SPESIFIK BERDASARKAN METODE */}

        {/* A. DETAIL RESMI MIDTRANS PAYMENT GATEWAY */}
        {isMidtrans && (
          <div className="flex flex-col gap-3">
            <h2 className="label-micro text-text-3">Rincian Transaksi</h2>
            
            <div className="bg-mono-50 border border-border/80 rounded-xl p-4 flex flex-col gap-3 text-xs">
              <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="size-7 rounded bg-orange-bg text-orange flex items-center justify-center font-bold">
                    <Icon icon="heroicons:bolt-20-solid" className="size-4.5" />
                  </div>
                  <div>
                    <span className="font-bold text-text block">Midtrans Payment Gateway</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5">
                <div>
                  <span className="text-text-3 text-[11px] block">Order ID Gateway</span>
                  <span className="font-mono font-bold text-xs text-text break-all">
                    {midtransOrderId}
                  </span>
                </div>

                <div>
                  <span className="text-text-3 text-[11px] block">Saluran Pembayaran</span>
                  <span className="font-semibold text-text">{resolveMidtransChannel(item)}</span>
                </div>

                <div>
                  <span className="text-text-3 text-[11px] block">Status Transaksi</span>
                  <span className="font-bold text-emerald-800 font-mono">settlement (accept)</span>
                </div>

                <div>
                  <span className="text-text-3 text-[11px] block">Waktu Settle</span>
                  <span className="font-bold text-text font-tabular-nums">{item.tanggal || item.waktu || '-'}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-border/60 flex items-center gap-2 text-[11px] text-emerald-800 font-medium">
                <Icon icon="heroicons:shield-check-20-solid" className="size-4 text-emerald-600 shrink-0" />
                <span>Terverifikasi via Signature Midtrans</span>
              </div>
            </div>
          </div>
        )}

        {/* B. DETAIL CATATAN PEMBAYARAN TUNAI LOKET */}
        {isTunai && (
          <div className="flex flex-col gap-3">
            <h2 className="label-micro text-text-3">Catatan Pembayaran Tunai Loket</h2>

            {/* Cash Counter Info Card */}
            <div className="bg-mono-50 border border-border/80 rounded-xl p-4 flex flex-col gap-3 text-xs">
              <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="size-7 rounded bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                    <Icon icon="heroicons:banknotes-20-solid" className="size-4.5" />
                  </div>
                  <div>
                    <span className="font-bold text-text block">Loket Kasir Pengelola</span>
                    <span className="text-text-3 text-[11px]">UPTD Pasar Plaza Kebun Sayur</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                <div>
                  <span className="text-text-3 text-[11px] block">Kode Transaksi</span>
                  <span className="font-mono font-bold text-xs text-text">{trxLabel}</span>
                </div>
                <div>
                  <span className="text-text-3 text-[11px] block">Petugas Penerima</span>
                  <span className="font-semibold text-text">Staf Kasir Loket</span>
                </div>
                <div>
                  <span className="text-text-3 text-[11px] block">Status Pembukuan</span>
                  <span className={cn(
                    "font-bold",
                    item.status === 'Diterima' ? "text-emerald-800" : "text-amber-800"
                  )}>
                    {item.status === 'Diterima' ? 'Tercatat di Kas' : 'Menunggu Konfirmasi Loket'}
                  </span>
                </div>
                <div>
                  <span className="text-text-3 text-[11px] block">Waktu Penyetoran</span>
                  <span className="font-bold text-text font-tabular-nums">{item.tanggal || item.waktu || '-'}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-border/60 flex items-center gap-2 text-[11px] text-amber-900 font-medium">
                <Icon icon="heroicons:information-circle-20-solid" className="size-4 text-amber-700 shrink-0" />
                <span>Struk cetak fisik resmi diserahkan langsung oleh kasir melalui sistem internal Batavia.</span>
              </div>
            </div>
          </div>
        )}

        {/* C. LAMPIRAN FOTO BUKTI / STRUK PEMBAYARAN */}
        <div className="flex flex-col gap-3">
          <h2 className="label-micro text-text-3">
            {isTunai ? 'Lampiran Foto Struk / Bukti Fisik Loket' : 'Lampiran Bukti Slip Transfer'}
          </h2>

          {activeImageSrc && !imageError ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-3">
                  Pratinjau Foto Bukti:
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsZoomed(!isZoomed)}
                    className="text-xs font-bold text-text-2 hover:text-red flex items-center gap-1 cursor-pointer transition-colors"
                    aria-label={isZoomed ? "Kecilkan tampilan foto bukti" : "Perbesar tampilan foto bukti"}
                  >
                    <Icon icon={isZoomed ? "heroicons:magnifying-glass-minus-20-solid" : "heroicons:magnifying-glass-plus-20-solid"} className="size-3.5" />
                    <span>{isZoomed ? 'Kecilkan' : 'Perbesar'}</span>
                  </button>
                  <span className="text-border text-xs">|</span>
                  <button
                    type="button"
                    onClick={handleDownloadBukti}
                    className="text-xs font-bold text-red hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                    aria-label="Unduh foto bukti"
                  >
                    <Icon icon="heroicons:arrow-down-tray-20-solid" className="size-3.5" />
                    <span>Unduh</span>
                  </button>
                  {onUploadBukti && item.status === 'Ditolak' && (
                    <>
                      <span className="text-border text-xs">|</span>
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onUploadBukti(item);
                        }}
                        className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer transition-colors"
                        aria-label="Perbaiki foto bukti pembayaran yang ditolak"
                      >
                        <Icon icon="heroicons:arrow-path-20-solid" className="size-3.5" />
                        <span>Perbaiki Foto</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className={cn(
                "w-full bg-mono-100/30 rounded-lg border border-border overflow-hidden flex items-center justify-center p-2 transition-all",
                isZoomed ? "max-h-[30rem]" : "max-h-72"
              )}>
                <button
                  type="button"
                  onClick={() => setIsZoomed(!isZoomed)}
                  aria-label={isZoomed ? "Kecilkan tampilan foto bukti" : "Perbesar tampilan foto bukti"}
                  className="flex items-center justify-center max-h-full max-w-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red rounded-md"
                >
                  <img
                    src={activeImageSrc}
                    alt={`Bukti ${trxLabel}`}
                    loading="lazy"
                    onError={() => {
                      setImageError(true);
                    }}
                    className="max-h-full max-w-full object-contain rounded-md"
                  />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-mono-50 border border-dashed border-border/80 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-9 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                  <Icon icon="heroicons:camera-20-solid" className="size-5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-text">Belum ada foto bukti fisik / struk</span>
                  <span className="text-text-3 text-2xs">
                    {isTunai 
                      ? 'Foto struk loket kasir dapat dilampirkan sebagai arsip digital.' 
                      : 'Berkas bukti pembayaran tidak ditemukan atau belum dilampirkan.'}
                  </span>
                </div>
              </div>
              {onUploadBukti && (
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    onClose();
                    onUploadBukti(item);
                  }}
                  className="gap-1.5 font-bold shrink-0 text-xs shadow-2xs"
                >
                  <Icon icon="heroicons:arrow-up-tray-20-solid" className="size-4" />
                  <span>Unggah Foto Bukti</span>
                </Button>
              )}
            </div>
          )}
        </div>

      </div>
    </Modal>
  );
}

export default BuktiPembayaranModal;
