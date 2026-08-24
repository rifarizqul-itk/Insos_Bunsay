import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

// Official Plaza Kebun Sayur Logo URL served directly from Vite public assets (optimized 7.6KB asset)
const BUNSAY_OFFICIAL_LOGO_PATH = '/assets/bunsay_qr_logo_128.png';

export function BunsayQRCode({
  value,
  size = 110,
  className = '',
  includeMargin = false,
  logoSrc = BUNSAY_OFFICIAL_LOGO_PATH,
  ariaLabel = 'QR Code Verifikasi Resmi Pembayaran Kios Plaza Kebun Sayur',
}) {
  const logoWidth = Math.round(size * 0.28);
  const logoHeight = Math.round(size * 0.28);

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className={`inline-flex items-center justify-center p-2 bg-white rounded-lg border border-border/80 shadow-xs ${className}`}
    >
      <QRCodeSVG
        value={value || 'https://bunsay.balikpapan.go.id/verifikasi'}
        size={size}
        level="H"
        includeMargin={includeMargin}
        fgColor="#1F1010"
        bgColor="#FFFFFF"
        imageSettings={{
          src: logoSrc,
          width: logoWidth,
          height: logoHeight,
          excavate: true,
        }}
      />
    </div>
  );
}

export default BunsayQRCode;
