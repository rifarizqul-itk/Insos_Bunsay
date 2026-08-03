<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TagihanSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('tagihan')->insertOrIgnore([
            ['Id_Tagihan' => 1, 'Id_Sewa' => 1, 'Periode' => '2025-04', 'Jatuh_Tempo' => '2025-04-10', 'Tarif_Sewa' => 500000.00, 'Hutang_Tunggakan' => 0.00, 'Total_Tagihan' => 500000.00, 'Status_Tagihan' => 'Belum Bayar'],
            ['Id_Tagihan' => 2, 'Id_Sewa' => 2, 'Periode' => '2025-04', 'Jatuh_Tempo' => '2025-04-10', 'Tarif_Sewa' => 500000.00, 'Hutang_Tunggakan' => 50000.00, 'Total_Tagihan' => 550000.00, 'Status_Tagihan' => 'Belum Bayar'],
            ['Id_Tagihan' => 3, 'Id_Sewa' => 3, 'Periode' => '2025-04', 'Jatuh_Tempo' => '2025-04-10', 'Tarif_Sewa' => 600000.00, 'Hutang_Tunggakan' => 0.00, 'Total_Tagihan' => 600000.00, 'Status_Tagihan' => 'Belum Bayar'],
            ['Id_Tagihan' => 4, 'Id_Sewa' => 4, 'Periode' => '2025-04', 'Jatuh_Tempo' => '2025-04-10', 'Tarif_Sewa' => 700000.00, 'Hutang_Tunggakan' => 0.00, 'Total_Tagihan' => 700000.00, 'Status_Tagihan' => 'Menunggu Verifikasi'],
            ['Id_Tagihan' => 5, 'Id_Sewa' => 5, 'Periode' => '2025-04', 'Jatuh_Tempo' => '2025-04-10', 'Tarif_Sewa' => 500000.00, 'Hutang_Tunggakan' => 100000.00, 'Total_Tagihan' => 600000.00, 'Status_Tagihan' => 'Belum Bayar'],
            ['Id_Tagihan' => 6, 'Id_Sewa' => 6, 'Periode' => '2025-04', 'Jatuh_Tempo' => '2025-04-10', 'Tarif_Sewa' => 550000.00, 'Hutang_Tunggakan' => 0.00, 'Total_Tagihan' => 550000.00, 'Status_Tagihan' => 'Lunas'],
            ['Id_Tagihan' => 7, 'Id_Sewa' => 7, 'Periode' => '2025-04', 'Jatuh_Tempo' => '2025-04-10', 'Tarif_Sewa' => 600000.00, 'Hutang_Tunggakan' => 0.00, 'Total_Tagihan' => 600000.00, 'Status_Tagihan' => 'Belum Bayar'],
            ['Id_Tagihan' => 8, 'Id_Sewa' => 8, 'Periode' => '2025-04', 'Jatuh_Tempo' => '2025-04-10', 'Tarif_Sewa' => 700000.00, 'Hutang_Tunggakan' => 0.00, 'Total_Tagihan' => 700000.00, 'Status_Tagihan' => 'Lunas'],
            ['Id_Tagihan' => 9, 'Id_Sewa' => 9, 'Periode' => '2025-04', 'Jatuh_Tempo' => '2025-04-10', 'Tarif_Sewa' => 500000.00, 'Hutang_Tunggakan' => 50000.00, 'Total_Tagihan' => 550000.00, 'Status_Tagihan' => 'Belum Bayar'],
            ['Id_Tagihan' => 10, 'Id_Sewa' => 10, 'Periode' => '2025-04', 'Jatuh_Tempo' => '2025-04-10', 'Tarif_Sewa' => 550000.00, 'Hutang_Tunggakan' => 0.00, 'Total_Tagihan' => 550000.00, 'Status_Tagihan' => 'Belum Bayar'],
            ['Id_Tagihan' => 11, 'Id_Sewa' => 11, 'Periode' => '2025-04', 'Jatuh_Tempo' => '2025-04-10', 'Tarif_Sewa' => 600000.00, 'Hutang_Tunggakan' => 0.00, 'Total_Tagihan' => 600000.00, 'Status_Tagihan' => 'Menunggu Verifikasi'],
            ['Id_Tagihan' => 12, 'Id_Sewa' => 12, 'Periode' => '2025-04', 'Jatuh_Tempo' => '2025-04-10', 'Tarif_Sewa' => 700000.00, 'Hutang_Tunggakan' => 0.00, 'Total_Tagihan' => 700000.00, 'Status_Tagihan' => 'Belum Bayar'],
            ['Id_Tagihan' => 13, 'Id_Sewa' => 13, 'Periode' => '2025-04', 'Jatuh_Tempo' => '2025-04-10', 'Tarif_Sewa' => 500000.00, 'Hutang_Tunggakan' => 0.00, 'Total_Tagihan' => 500000.00, 'Status_Tagihan' => 'Lunas'],
            ['Id_Tagihan' => 14, 'Id_Sewa' => 14, 'Periode' => '2025-04', 'Jatuh_Tempo' => '2025-04-10', 'Tarif_Sewa' => 550000.00, 'Hutang_Tunggakan' => 100000.00, 'Total_Tagihan' => 650000.00, 'Status_Tagihan' => 'Belum Bayar'],
            ['Id_Tagihan' => 15, 'Id_Sewa' => 15, 'Periode' => '2025-04', 'Jatuh_Tempo' => '2025-04-10', 'Tarif_Sewa' => 600000.00, 'Hutang_Tunggakan' => 0.00, 'Total_Tagihan' => 600000.00, 'Status_Tagihan' => 'Belum Bayar'],
            ['Id_Tagihan' => 16, 'Id_Sewa' => 16, 'Periode' => '2025-04', 'Jatuh_Tempo' => '2025-04-10', 'Tarif_Sewa' => 700000.00, 'Hutang_Tunggakan' => 0.00, 'Total_Tagihan' => 700000.00, 'Status_Tagihan' => 'Lunas'],
            ['Id_Tagihan' => 17, 'Id_Sewa' => 17, 'Periode' => '2025-04', 'Jatuh_Tempo' => '2025-04-10', 'Tarif_Sewa' => 500000.00, 'Hutang_Tunggakan' => 0.00, 'Total_Tagihan' => 500000.00, 'Status_Tagihan' => 'Belum Bayar'],
            ['Id_Tagihan' => 18, 'Id_Sewa' => 18, 'Periode' => '2025-04', 'Jatuh_Tempo' => '2025-04-10', 'Tarif_Sewa' => 550000.00, 'Hutang_Tunggakan' => 50000.00, 'Total_Tagihan' => 600000.00, 'Status_Tagihan' => 'Belum Bayar'],
            ['Id_Tagihan' => 19, 'Id_Sewa' => 19, 'Periode' => '2025-04', 'Jatuh_Tempo' => '2025-04-10', 'Tarif_Sewa' => 600000.00, 'Hutang_Tunggakan' => 0.00, 'Total_Tagihan' => 600000.00, 'Status_Tagihan' => 'Menunggu Verifikasi'],
            ['Id_Tagihan' => 20, 'Id_Sewa' => 20, 'Periode' => '2025-04', 'Jatuh_Tempo' => '2025-04-10', 'Tarif_Sewa' => 700000.00, 'Hutang_Tunggakan' => 0.00, 'Total_Tagihan' => 700000.00, 'Status_Tagihan' => 'Belum Bayar'],
        ]);
    }
}
