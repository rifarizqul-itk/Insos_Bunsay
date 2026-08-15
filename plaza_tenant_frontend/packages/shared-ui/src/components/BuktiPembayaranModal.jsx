import React, { useState, useEffect } from 'react';
import { cn } from '../utils/cn';
import { Sheet } from './Sheet';
import { Badge } from './Badge';
import { Button } from './Button';
import { Icon } from './Icon';
import { BunsayQRCode } from './BunsayQRCode';

function angkaKeTerbilang(nilai) {
  const n = Math.floor(Math.abs(Number(nilai) || 0));
  if (n === 0) return 'Nol';
  
  const bilangan = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];
  
  function convert(x) {
    if (x < 12) return bilangan[x];
    if (x < 20) return convert(x - 10) + ' Belas';
    if (x < 100) return convert(Math.floor(x / 10)) + ' Puluh' + (x % 10 !== 0 ? ' ' + convert(x % 10) : '');
    if (x < 200) return 'Seratus' + (x - 100 !== 0 ? ' ' + convert(x - 100) : '');
    if (x < 1000) return convert(Math.floor(x / 100)) + ' Ratus' + (x % 100 !== 0 ? ' ' + convert(x % 100) : '');
    if (x < 2000) return 'Seribu' + (x - 1000 !== 0 ? ' ' + convert(x - 1000) : '');
    if (x < 1000000) return convert(Math.floor(x / 1000)) + ' Ribu' + (x % 1000 !== 0 ? ' ' + convert(x % 1000) : '');
    if (x < 1000000000) return convert(Math.floor(x / 1000000)) + ' Juta' + (x % 1000000 !== 0 ? ' ' + convert(x % 1000000) : '');
    return '';
  }

  return convert(n).trim();
}

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

export function BuktiPembayaranModal({ isOpen, onClose, item }) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
    setIsZoomed(false);
  }, [item, isOpen]);

  if (!item) return null;

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

  const terbilangTeks = angkaKeTerbilang(nominalNumeric);

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

  // Dynamic verification URL for QR Code
  const verificationUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/verifikasi?trx=${encodeURIComponent(trxLabel)}&ref=${encodeURIComponent(displayRefCode)}`
    : `https://bunsay.balikpapan.go.id/verifikasi?trx=${encodeURIComponent(trxLabel)}`;

  // Resolve image source URL for backend storage files
  const getResolvedImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    const cleanPath = url.startsWith('/') ? url.slice(1) : url;
    return `http://localhost:8000/${cleanPath}`;
  };

  const parsedImageSrc = isFilePath ? getResolvedImageUrl(buktiUrl) : (buktiUrl.startsWith('data:') ? buktiUrl : null);

  const handleCopyCode = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Isolated Professional Iframe Print
  const handlePrint = () => {
    const qrElement = document.getElementById('bunsay-qr-svg-wrapper');
    const qrSvgMarkup = qrElement ? qrElement.innerHTML : '';

    const printIframe = document.createElement('iframe');
    printIframe.style.position = 'fixed';
    printIframe.style.right = '0';
    printIframe.style.bottom = '0';
    printIframe.style.width = '0';
    printIframe.style.height = '0';
    printIframe.style.border = '0';
    document.body.appendChild(printIframe);

    const doc = printIframe.contentWindow.document;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="id">
        <head>
          <meta charset="utf-8">
          <title>Bukti Pembayaran Retribusi - ${trxLabel}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 15mm 20mm;
            }
            * {
              box-sizing: border-box;
            }
            body {
              font-family: Arial, sans-serif;
              color: #111;
              background: #fff;
              margin: 0;
              padding: 0;
              font-size: 13px;
              line-height: 1.5;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .kop-container {
              text-align: center;
              border-bottom: 3px double #111;
              padding-bottom: 12px;
              margin-bottom: 20px;
            }
            .kop-container h2 {
              margin: 0;
              font-size: 16px;
              font-weight: 800;
              letter-spacing: 0.5px;
              text-transform: uppercase;
            }
            .kop-container h3 {
              margin: 3px 0;
              font-size: 14px;
              font-weight: 700;
            }
            .kop-container p {
              margin: 2px 0;
              font-size: 11px;
              color: #444;
            }
            .doc-title {
              text-align: center;
              margin-bottom: 20px;
            }
            .doc-title h1 {
              margin: 0;
              font-size: 14px;
              font-weight: 800;
              text-decoration: underline;
              letter-spacing: 0.5px;
              text-transform: uppercase;
            }
            .doc-title p {
              margin: 4px 0 0 0;
              font-size: 12px;
              font-weight: 600;
              color: #222;
            }
            .meta-grid {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 18px;
              font-size: 12px;
            }
            .meta-grid td {
              padding: 4px 6px;
              vertical-align: top;
            }
            .meta-grid td.lbl {
              width: 18%;
              color: #444;
              font-weight: 600;
            }
            .meta-grid td.col {
              width: 2%;
              text-align: center;
            }
            .meta-grid td.val {
              width: 30%;
              font-weight: 700;
              color: #000;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 16px;
              font-size: 12px;
            }
            .items-table th {
              background-color: #f2f2f2;
              border: 1px solid #333;
              padding: 8px 10px;
              font-weight: 700;
              text-align: left;
            }
            .items-table td {
              border: 1px solid #333;
              padding: 8px 10px;
            }
            .total-row th {
              background-color: #f9f9f9;
              font-size: 13px;
              font-weight: 800;
            }
            .terbilang-card {
              border: 1px solid #333;
              background-color: #fafafa;
              padding: 8px 12px;
              margin-bottom: 24px;
              font-size: 12px;
              font-style: italic;
            }
            .footer-grid {
              display: table;
              width: 100%;
              margin-top: 20px;
              page-break-inside: avoid;
            }
            .footer-col-left {
              display: table-cell;
              width: 55%;
              vertical-align: top;
              padding-right: 20px;
              font-size: 11px;
              color: #444;
            }
            .footer-col-right {
              display: table-cell;
              width: 45%;
              vertical-align: top;
              text-align: center;
              font-size: 12px;
            }
            .qr-holder {
              display: inline-block;
              margin: 6px auto;
              padding: 4px;
              border: 1px solid #ddd;
              background: #fff;
              border-radius: 6px;
            }
            .qr-holder svg {
              display: block;
              width: 90px;
              height: 90px;
            }
          </style>
        </head>
        <body>
          <div class="kop-container">
            <h2>Pemerintah Kota Balikpapan</h2>
            <h3>Dinas Perdagangan &bull; UPTD Pasar Plaza Kebun Sayur</h3>
            <p>Jl. Letjen Suprapto, Baru Ilir, Balikpapan Barat &bull; Telp: (0542) 731234 &bull; Pos: 76131</p>
          </div>

          <div class="doc-title">
            <h1>Surat Setoran Retribusi Daerah (SSRD Elektronik)</h1>
            <p>No. Kuitansi: <strong>${trxLabel}</strong> &bull; Status: <strong style="color: #14592F;">LUNAS</strong></p>
          </div>

          <table class="meta-grid">
            <tr>
              <td class="lbl">Nama Penyewa</td>
              <td class="col">:</td>
              <td class="val">${item.nama || 'Tenant'}</td>
              <td class="lbl">Tanggal Bayar</td>
              <td class="col">:</td>
              <td class="val">${item.tanggal || item.waktu || '-'}</td>
            </tr>
            <tr>
              <td class="lbl">Unit / Lokasi Kios</td>
              <td class="col">:</td>
              <td class="val">Kios ${item.kios || '-'}</td>
              <td class="lbl">Metode Bayar</td>
              <td class="col">:</td>
              <td class="val">${isMidtrans ? `Pembayaran Otomatis (${resolveMidtransChannel(item)})` : isTunai ? 'Setoran Tunai (Loket)' : 'Transfer Bank'}</td>
            </tr>
            <tr>
              <td class="lbl">Kode Referensi</td>
              <td class="col">:</td>
              <td class="val" style="font-family: monospace;">${displayRefCode}</td>
              <td class="lbl">Status Verifikasi</td>
              <td class="col">:</td>
              <td class="val" style="color: #14592F;">${item.status || 'Diterima'}</td>
            </tr>
          </table>

          <table class="items-table">
            <thead>
              <tr>
                <th style="width: 8%; text-align: center;">No</th>
                <th style="width: 52%;">Uraian Retribusi Pemakaian Kekayaan Daerah</th>
                <th style="width: 20%; text-align: center;">Periode</th>
                <th style="width: 20%; text-align: right;">Jumlah (Rp)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="text-align: center;">1</td>
                <td>
                  <strong>Sewa Kios Plaza Kebun Sayur</strong><br>
                  <span style="font-size: 11px; color: #555;">Unit Kios ${item.kios || '-'} &bull; Dikelola UPTD Pasar Balikpapan</span>
                </td>
                <td style="text-align: center;">${item.periode || 'Bulan Berjalan'}</td>
                <td style="text-align: right; font-weight: 700;">${nominalFormatted}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="total-row">
                <th colspan="3" style="text-align: right;">TOTAL DIBAYAR</th>
                <th style="text-align: right; font-size: 14px;">${nominalFormatted}</th>
              </tr>
            </tfoot>
          </table>

          <div class="terbilang-card">
            <strong>Terbilang:</strong> <em># ${terbilangTeks} Rupiah #</em>
          </div>

          <div class="footer-grid">
            <div class="footer-col-left">
              <p><strong>Catatan Keabsahan Dokumen:</strong></p>
              <p style="margin: 2px 0;">1. Dokumen ini merupakan Surat Setoran Retribusi Daerah (SSRD Elektronik) yang diterbitkan secara sah oleh Sistem e-Retribusi UPTD Pasar Plaza Kebun Sayur.</p>
              <p style="margin: 2px 0;">2. Keabsahan bukti setoran ini dapat divalidasi dengan memindai QR Code resmi di samping.</p>
              <p style="margin: 8px 0 0 0; font-size: 10px; color: #666;">Dicetak pada: ${new Date().toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })} WITA</p>
            </div>

            <div class="footer-col-right">
              <p style="margin: 0;">Balikpapan, ${item.tanggal || item.waktu || '2026'}</p>
              <p style="margin: 2px 0 4px 0; font-weight: 700;">UPTD Pasar Plaza Kebun Sayur</p>
              
              <div class="qr-holder">
                ${qrSvgMarkup}
              </div>

              <p style="margin: 2px 0 0 0; font-size: 11px; font-weight: 700; color: #14592F;">TERVERIFIKASI SISTEM e-RETRIBUSI</p>
              <p style="margin: 1px 0 0 0; font-size: 10px; color: #555;">( Bendahara Penerimaan / Kasir Loket )</p>
            </div>
          </div>
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      try {
        printIframe.contentWindow.focus();
        printIframe.contentWindow.print();
      } catch (e) {
        console.error('Print Error:', e);
      } finally {
        setTimeout(() => {
          if (document.body.contains(printIframe)) {
            document.body.removeChild(printIframe);
          }
        }, 1000);
      }
    }, 250);
  };

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title="Rincian Transaksi"
      subtitle={`ID: ${trxLabel}`}
      badge={<Badge status={item.status || 'Diterima'} />}
      width="md"
      footer={
        <div className="flex items-center justify-between w-full gap-3 print:hidden">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="gap-2 font-bold text-text-2 border-border/80 hover:bg-mono-100"
          >
            <Icon icon="heroicons:printer-20-solid" className="size-4" />
            <span>Cetak Resi</span>
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
            className="px-6 font-bold"
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
            <span className="text-xs font-bold text-text-3 font-tabular-nums">
              {item.tanggal || item.waktu || '-'}
            </span>
          </div>
        </div>

        {/* 2. TRANSACTION METADATA (Structured Key-Value Grid) */}
        <div className="flex flex-col gap-3">
          <h4 className="label-micro text-text-3">Informasi Transaksi</h4>
          
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
                  className="text-text-3 hover:text-red transition-colors p-1 cursor-pointer"
                  title="Salin Kode"
                >
                  <Icon icon={copied ? "heroicons:check-20-solid" : "heroicons:clipboard-document-20-solid"} className={cn("size-3.5", copied ? "text-green" : "")} />
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
          <div className="p-3.5 bg-amber-50/80 border border-amber-300/80 rounded-lg text-xs flex flex-col gap-1">
            <span className="font-bold text-amber-800 flex items-center gap-1.5">
              <Icon icon="heroicons:chat-bubble-bottom-center-text-20-solid" className="size-4" />
              <span>Sanggahan dari Tenant:</span>
            </span>
            <p className="text-amber-950 font-medium italic ps-5.5">"{item.teksSanggahan}"</p>
          </div>
        )}

        {/* 4. DETAIL SPESIFIK BERDASARKAN METODE */}

        {/* A. DETAIL RESMI MIDTRANS PAYMENT GATEWAY */}
        {isMidtrans && (
          <div className="flex flex-col gap-3">
            <h4 className="label-micro text-text-3">Rincian Transaksi</h4>
            
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

        {/* B. DETAIL RESMI KUITANSI KASIR LOKET TUNAI */}
        {isTunai && (
          <div className="flex flex-col gap-3">
            <h4 className="label-micro text-text-3">Bukti Kuitansi Kasir Loket</h4>

            {/* Stamped Cash Counter Voucher Card */}
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
                  <span className="text-text-3 text-[11px] block">No. Bukti Kuitansi</span>
                  <span className="font-mono font-bold text-xs text-text">{`KWT-${trxLabel}`}</span>
                </div>
                <div>
                  <span className="text-text-3 text-[11px] block">Petugas Penerima</span>
                  <span className="font-semibold text-text">Staf Kasir Loket</span>
                </div>
                <div>
                  <span className="text-text-3 text-[11px] block">Status Pembukuan</span>
                  <span className="font-bold text-emerald-800">Tercatat di Kas</span>
                </div>
                <div>
                  <span className="text-text-3 text-[11px] block">Waktu Penyetoran</span>
                  <span className="font-bold text-text font-tabular-nums">{item.tanggal || item.waktu || '-'}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-border/60 flex items-center gap-2 text-[11px] text-amber-900 font-medium">
                <Icon icon="heroicons:check-badge-20-solid" className="size-4 text-amber-700 shrink-0" />
                <span>Kuitansi fisik resmi telah diserahkan &amp; distempel langsung di loket kasir pengelola.</span>
              </div>
            </div>
          </div>
        )}

        {/* C. DETAIL TRANSFER BANK MANUAL DENGAN SLIP */}
        {isTransfer && (
          <div className="flex flex-col gap-3">
            <h4 className="label-micro text-text-3">Lampiran Bukti Slip Transfer</h4>

            {parsedImageSrc && !imageError ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-text-3">Pratinjau Foto Slip:</span>
                  <button
                    type="button"
                    onClick={() => setIsZoomed(!isZoomed)}
                    className="text-xs font-bold text-red hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Icon icon={isZoomed ? "heroicons:magnifying-glass-minus-20-solid" : "heroicons:magnifying-glass-plus-20-solid"} className="size-3.5" />
                    <span>{isZoomed ? 'Kecilkan' : 'Perbesar'}</span>
                  </button>
                </div>

                <div className={cn(
                  "w-full bg-mono-100/30 rounded-lg border border-border overflow-hidden flex items-center justify-center p-2 transition-all",
                  isZoomed ? "max-h-[30rem]" : "max-h-72"
                )}>
                  <img
                    src={parsedImageSrc}
                    alt={`Bukti Transfer ${trxLabel}`}
                    loading="lazy"
                    onError={() => setImageError(true)}
                    className="max-h-full max-w-full object-contain rounded-md cursor-pointer"
                    onClick={() => setIsZoomed(!isZoomed)}
                  />
                </div>
              </div>
            ) : (
              <div className="bg-mono-50 border border-border/80 rounded-lg p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-10 rounded-md bg-mono-200/80 flex items-center justify-center text-mono-600 shrink-0">
                    <Icon icon="heroicons:photo-20-solid" className="size-5.5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-text truncate">
                      {isFilePath ? buktiUrl.split('/').pop() : `Bukti_Transfer_${trxLabel}.jpg`}
                    </span>
                    <span className="text-xs text-text-3 font-medium">
                      Lampiran Berkas Slip Transfer
                    </span>
                  </div>
                </div>

                {parsedImageSrc && (
                  <a
                    href={parsedImageSrc}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-red hover:underline px-2.5 py-1.5 rounded bg-white border border-border/80 shrink-0"
                  >
                    <span>Buka</span>
                    <Icon icon="heroicons:arrow-top-right-on-square-20-solid" className="size-3.5" />
                  </a>
                )}
              </div>
            )}
          </div>
        )}

        {/* 5. DIGITAL AUTHENTICITY QR CODE & SEAL SECTION */}
        <div className="pt-3 border-t border-border/60 flex flex-col gap-3">
          <h4 className="label-micro text-text-3">Verifikasi &amp; Keabsahan Digital</h4>
          
          <div className="flex items-center gap-4 p-3.5 rounded-xl bg-mono-50 border border-border/80">
            <div id="bunsay-qr-svg-wrapper" className="shrink-0">
              <BunsayQRCode value={verificationUrl} size={90} />
            </div>

            <div className="flex flex-col gap-1 min-w-0 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                <Icon icon="heroicons:shield-check-20-solid" className="size-4 text-emerald-600 shrink-0" />
                <span>Dokumen Sah e-Retribusi</span>
              </div>
              <p className="text-[11px] text-text-3 leading-snug">
                Pindai QR Code dengan kamera ponsel untuk memvalidasi keaslian resi ini langsung pada server UPTD.
              </p>
              <a
                href={verificationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-bold text-red hover:underline inline-flex items-center gap-1 mt-0.5"
              >
                <span>Buka Tautan Validasi</span>
                <Icon icon="heroicons:arrow-top-right-on-square-20-solid" className="size-3" />
              </a>
            </div>
          </div>
        </div>

      </div>
    </Sheet>
  );
}

export default BuktiPembayaranModal;
