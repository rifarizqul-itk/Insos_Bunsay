<?php

namespace Database\Seeders;

class ReceiptGeneratorHelper
{
    public static function make(
        string $filename,
        string $bank,
        string $sender,
        float $amount,
        string $date,
        string $ref,
        string $notes = '',
        bool $isBlurry = false
    ): string {
        $dir = public_path('storage/bukti');
        if (!is_dir($dir)) {
            mkdir($dir, 0777, true);
        }

        $w = 420;
        $h = 660;
        $im = imagecreatetruecolor($w, $h);

        $fontRegular = '/usr/share/fonts/opentype/urw-base35/NimbusSans-Regular.otf';
        $fontBold = '/usr/share/fonts/opentype/urw-base35/NimbusSans-Bold.otf';
        $fontMono = '/usr/share/fonts/opentype/urw-base35/NimbusMonoPS-Regular.otf';

        if ($bank === 'ATM') {
            return self::makeAtmSlip($im, $w, $h, $dir, $filename, $sender, $amount, $date, $ref, $fontMono);
        }

        $bg = imagecolorallocate($im, 248, 249, 250);
        imagefilledrectangle($im, 0, 0, $w, $h, $bg);

        $themes = [
            'BCA' => [
                'header' => [0, 90, 160],
                'title'  => 'm-Transfer BERHASIL',
                'bank'   => 'BCA mobile',
            ],
            'Mandiri' => [
                'header' => [0, 45, 98],
                'title'  => 'Transfer Berhasil',
                'bank'   => 'Livin\' by Mandiri',
            ],
            'BRI' => [
                'header' => [0, 82, 156],
                'title'  => 'Transaksi Berhasil',
                'bank'   => 'BRImo (Bank BRI)',
            ],
            'BNI' => [
                'header' => [0, 94, 106],
                'title'  => 'Transfer Sukses',
                'bank'   => 'BNI Mobile Banking',
            ],
        ];

        $cfg = $themes[$bank] ?? $themes['BCA'];

        $hdrColor = imagecolorallocate($im, $cfg['header'][0], $cfg['header'][1], $cfg['header'][2]);
        imagefilledrectangle($im, 0, 0, $w, 85, $hdrColor);

        $white = imagecolorallocate($im, 255, 255, 255);
        $dark = imagecolorallocate($im, 30, 41, 59);
        $gray = imagecolorallocate($im, 100, 116, 139);
        $lightGray = imagecolorallocate($im, 226, 232, 240);
        $green = imagecolorallocate($im, 16, 185, 129);

        imagettftext($im, 11, 0, 20, 35, $white, $fontRegular, $cfg['bank']);
        imagettftext($im, 14, 0, 20, 65, $white, $fontBold, $cfg['title']);

        // Checkmark badge
        imagefilledellipse($im, $w - 45, 45, 36, 36, $green);
        imagettftext($im, 13, 0, $w - 55, 52, $white, $fontBold, 'OK');

        // Nominal Box
        $cardBg = imagecolorallocate($im, 255, 255, 255);
        imagefilledrectangle($im, 16, 95, $w - 16, 165, $cardBg);
        imagerectangle($im, 16, 95, $w - 16, 165, $lightGray);

        imagettftext($im, 8, 0, 30, 120, $gray, $fontRegular, 'TOTAL TRANSAKSI');
        $amountFormatted = 'Rp ' . number_format($amount, 0, ',', '.');
        imagettftext($im, 16, 0, 30, 150, $dark, $fontBold, $amountFormatted);

        // Details card
        imagefilledrectangle($im, 16, 175, $w - 16, 590, $cardBg);
        imagerectangle($im, 16, 175, $w - 16, 590, $lightGray);

        $items = [
            ['Tanggal Transaksi', $date],
            ['Nomor Referensi', $ref],
            ['Pengirim', strtoupper($sender)],
            ['Bank Penerima', $bank . ' Virtual Account / Direct'],
            ['Rekening Tujuan', '0468-2918-2200'],
            ['Nama Penerima', 'PLAZA KEBUN SAYUR'],
            ['Nominal Transfer', $amountFormatted],
            ['Biaya Transaksi', 'Rp 0'],
            ['Keterangan', $notes ?: 'Pembayaran Sewa Kios'],
        ];

        $y = 205;
        foreach ($items as $idx => $row) {
            imagettftext($im, 8, 0, 30, $y, $gray, $fontRegular, $row[0]);
            imagettftext($im, 9, 0, 30, $y + 17, $dark, $fontBold, substr($row[1], 0, 40));
            $y += 42;
            if ($idx < count($items) - 1) {
                imageline($im, 30, $y - 12, $w - 30, $y - 12, $lightGray);
            }
        }

        // Footer
        imagettftext($im, 8, 0, 35, 620, $gray, $fontRegular, 'Struk ini adalah bukti pembayaran digital yang sah.');
        imagettftext($im, 7, 0, 85, 638, $gray, $fontRegular, 'PT Pengelola Plaza Kebun Sayur Balikpapan');

        if ($isBlurry) {
            $smallW = 75;
            $smallH = 115;
            $small = imagecreatetruecolor($smallW, $smallH);
            imagecopyresampled($small, $im, 0, 0, 0, 0, $smallW, $smallH, $w, $h);
            imagecopyresampled($im, $small, 0, 0, 0, 0, $w, $h, $smallW, $smallH);
            imagedestroy($small);
        }

        $outPath = $dir . '/' . $filename;
        imagepng($im, $outPath, 6);
        imagedestroy($im);

        return 'storage/bukti/' . $filename;
    }

    private static function makeAtmSlip($im, $w, $h, $dir, $filename, $sender, $amount, $date, $ref, $fontMono): string
    {
        $paperBg = imagecolorallocate($im, 246, 246, 242);
        imagefilledrectangle($im, 0, 0, $w, $h, $paperBg);

        $ink = imagecolorallocate($im, 25, 25, 25);
        $dimInk = imagecolorallocate($im, 100, 100, 100);

        imagettftext($im, 12, 0, 95, 50, $ink, $fontMono, 'BANK CENTRAL ASIA');
        imagettftext($im, 10, 0, 80, 75, $ink, $fontMono, 'STRUK TRANSFER ATM');
        imagettftext($im, 8, 0, 60, 95, $dimInk, $fontMono, 'LOKASI: ATM PLAZA KEBUN SAYUR');

        imagettftext($im, 9, 0, 20, 115, $ink, $fontMono, '----------------------------------------');

        $lines = [
            'TANGGAL   : ' . $date,
            'NO. REF   : ' . $ref,
            'KARTU     : 5371-88**-****-1026',
            'PENGIRIM  : ' . strtoupper($sender),
            'KE REK    : 0468-2918-22',
            'PENERIMA  : PLAZA KEBUN SAYUR',
            'JUMLAH    : Rp ' . number_format($amount, 0, ',', '.'),
            'BIAYA ADM : Rp 0',
            'TOTAL     : Rp ' . number_format($amount, 0, ',', '.'),
            'STATUS    : TRANSAKSI BERHASIL',
        ];

        $y = 145;
        foreach ($lines as $line) {
            imagettftext($im, 9, 0, 25, $y, $ink, $fontMono, $line);
            $y += 34;
        }

        imagettftext($im, 9, 0, 20, $y, $ink, $fontMono, '----------------------------------------');
        imagettftext($im, 8, 0, 45, $y + 35, $dimInk, $fontMono, 'HARAP SIMPAN STRUK INI');
        imagettftext($im, 8, 0, 35, $y + 55, $dimInk, $fontMono, 'SEBAGAI BUKTI PEMBAYARAN SAH');
        imagettftext($im, 8, 0, 75, $y + 85, $dimInk, $fontMono, 'TERIMA KASIH');

        $outPath = $dir . '/' . $filename;
        imagepng($im, $outPath, 6);
        imagedestroy($im);

        return 'storage/bukti/' . $filename;
    }
}
