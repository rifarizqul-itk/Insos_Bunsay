<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PembayaranSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('pembayaran')->insertOrIgnore([
            ['Id_Pembayaran' => 1, 'Id_Tagihan' => 1, 'Tanggal_Bayar' => '2025-04-05', 'Total_Bayar' => 500000.00, 'Metode_Bayar' => 'Transfer', 'Bukti_Pembayaran' => 'bukti001.jpg', 'Verifikasi_Pembayaran' => 'Diterima'],
            ['Id_Pembayaran' => 2, 'Id_Tagihan' => 2, 'Tanggal_Bayar' => null, 'Total_Bayar' => 0.00, 'Metode_Bayar' => 'Cash', 'Bukti_Pembayaran' => '-', 'Verifikasi_Pembayaran' => 'Menunggu'],
            ['Id_Pembayaran' => 3, 'Id_Tagihan' => 3, 'Tanggal_Bayar' => null, 'Total_Bayar' => 0.00, 'Metode_Bayar' => 'Cash', 'Bukti_Pembayaran' => '-', 'Verifikasi_Pembayaran' => 'Menunggu'],
            ['Id_Pembayaran' => 4, 'Id_Tagihan' => 4, 'Tanggal_Bayar' => '2025-04-07', 'Total_Bayar' => 700000.00, 'Metode_Bayar' => 'Transfer', 'Bukti_Pembayaran' => 'bukti004.jpg', 'Verifikasi_Pembayaran' => 'Diterima'],
            ['Id_Pembayaran' => 5, 'Id_Tagihan' => 5, 'Tanggal_Bayar' => null, 'Total_Bayar' => 0.00, 'Metode_Bayar' => 'Cash', 'Bukti_Pembayaran' => '-', 'Verifikasi_Pembayaran' => 'Menunggu'],
            ['Id_Pembayaran' => 6, 'Id_Tagihan' => 6, 'Tanggal_Bayar' => '2025-04-06', 'Total_Bayar' => 550000.00, 'Metode_Bayar' => 'Transfer', 'Bukti_Pembayaran' => 'bukti006.jpg', 'Verifikasi_Pembayaran' => 'Diterima'],
            ['Id_Pembayaran' => 7, 'Id_Tagihan' => 7, 'Tanggal_Bayar' => null, 'Total_Bayar' => 0.00, 'Metode_Bayar' => 'Cash', 'Bukti_Pembayaran' => '-', 'Verifikasi_Pembayaran' => 'Menunggu'],
            ['Id_Pembayaran' => 8, 'Id_Tagihan' => 8, 'Tanggal_Bayar' => '2025-04-08', 'Total_Bayar' => 700000.00, 'Metode_Bayar' => 'Transfer', 'Bukti_Pembayaran' => 'bukti008.jpg', 'Verifikasi_Pembayaran' => 'Diterima'],
            ['Id_Pembayaran' => 9, 'Id_Tagihan' => 9, 'Tanggal_Bayar' => null, 'Total_Bayar' => 0.00, 'Metode_Bayar' => 'Cash', 'Bukti_Pembayaran' => '-', 'Verifikasi_Pembayaran' => 'Menunggu'],
            ['Id_Pembayaran' => 10, 'Id_Tagihan' => 10, 'Tanggal_Bayar' => null, 'Total_Bayar' => 0.00, 'Metode_Bayar' => 'Cash', 'Bukti_Pembayaran' => '-', 'Verifikasi_Pembayaran' => 'Menunggu'],
            ['Id_Pembayaran' => 11, 'Id_Tagihan' => 11, 'Tanggal_Bayar' => null, 'Total_Bayar' => 0.00, 'Metode_Bayar' => 'Cash', 'Bukti_Pembayaran' => '-', 'Verifikasi_Pembayaran' => 'Menunggu'],
            ['Id_Pembayaran' => 12, 'Id_Tagihan' => 12, 'Tanggal_Bayar' => null, 'Total_Bayar' => 0.00, 'Metode_Bayar' => 'Cash', 'Bukti_Pembayaran' => '-', 'Verifikasi_Pembayaran' => 'Menunggu'],
            ['Id_Pembayaran' => 13, 'Id_Tagihan' => 13, 'Tanggal_Bayar' => '2025-04-09', 'Total_Bayar' => 500000.00, 'Metode_Bayar' => 'Transfer', 'Bukti_Pembayaran' => 'bukti013.jpg', 'Verifikasi_Pembayaran' => 'Diterima'],
            ['Id_Pembayaran' => 14, 'Id_Tagihan' => 14, 'Tanggal_Bayar' => null, 'Total_Bayar' => 0.00, 'Metode_Bayar' => 'Cash', 'Bukti_Pembayaran' => '-', 'Verifikasi_Pembayaran' => 'Menunggu'],
            ['Id_Pembayaran' => 15, 'Id_Tagihan' => 15, 'Tanggal_Bayar' => null, 'Total_Bayar' => 0.00, 'Metode_Bayar' => 'Cash', 'Bukti_Pembayaran' => '-', 'Verifikasi_Pembayaran' => 'Menunggu'],
            ['Id_Pembayaran' => 16, 'Id_Tagihan' => 16, 'Tanggal_Bayar' => '2025-04-10', 'Total_Bayar' => 700000.00, 'Metode_Bayar' => 'Transfer', 'Bukti_Pembayaran' => 'bukti016.jpg', 'Verifikasi_Pembayaran' => 'Diterima'],
            ['Id_Pembayaran' => 17, 'Id_Tagihan' => 17, 'Tanggal_Bayar' => null, 'Total_Bayar' => 0.00, 'Metode_Bayar' => 'Cash', 'Bukti_Pembayaran' => '-', 'Verifikasi_Pembayaran' => 'Menunggu'],
            ['Id_Pembayaran' => 18, 'Id_Tagihan' => 18, 'Tanggal_Bayar' => null, 'Total_Bayar' => 0.00, 'Metode_Bayar' => 'Cash', 'Bukti_Pembayaran' => '-', 'Verifikasi_Pembayaran' => 'Menunggu'],
            ['Id_Pembayaran' => 19, 'Id_Tagihan' => 19, 'Tanggal_Bayar' => null, 'Total_Bayar' => 0.00, 'Metode_Bayar' => 'Cash', 'Bukti_Pembayaran' => '-', 'Verifikasi_Pembayaran' => 'Menunggu'],
            ['Id_Pembayaran' => 20, 'Id_Tagihan' => 20, 'Tanggal_Bayar' => null, 'Total_Bayar' => 0.00, 'Metode_Bayar' => 'Cash', 'Bukti_Pembayaran' => '-', 'Verifikasi_Pembayaran' => 'Menunggu'],
        ]);
    }
}
