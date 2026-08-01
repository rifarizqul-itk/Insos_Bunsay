<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SewaSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('sewa')->insertOrIgnore([
            ['Id_Sewa' => 1, 'Id_Pemilik' => 1, 'Id_Kios' => 1, 'Jenis_Usaha' => 'Kuliner', 'Tanggal_Mulai' => '2023-01-01', 'Tanggal_Selesai' => '2026-12-31', 'Keterangan' => 'Sewa aktif'],
            ['Id_Sewa' => 2, 'Id_Pemilik' => 2, 'Id_Kios' => 2, 'Jenis_Usaha' => 'Aksesoris', 'Tanggal_Mulai' => '2023-01-01', 'Tanggal_Selesai' => '2026-12-31', 'Keterangan' => 'Sewa aktif'],
            ['Id_Sewa' => 3, 'Id_Pemilik' => 3, 'Id_Kios' => 3, 'Jenis_Usaha' => 'Kelontong', 'Tanggal_Mulai' => '2023-01-01', 'Tanggal_Selesai' => '2026-12-31', 'Keterangan' => 'Sewa aktif'],
            ['Id_Sewa' => 4, 'Id_Pemilik' => 4, 'Id_Kios' => 4, 'Jenis_Usaha' => 'Fashion', 'Tanggal_Mulai' => '2023-01-01', 'Tanggal_Selesai' => '2026-12-31', 'Keterangan' => 'Sewa aktif'],
            ['Id_Sewa' => 5, 'Id_Pemilik' => 5, 'Id_Kios' => 5, 'Jenis_Usaha' => 'Kuliner', 'Tanggal_Mulai' => '2023-01-01', 'Tanggal_Selesai' => '2026-12-31', 'Keterangan' => 'Sewa aktif'],
            ['Id_Sewa' => 6, 'Id_Pemilik' => 6, 'Id_Kios' => 6, 'Jenis_Usaha' => 'Aksesoris', 'Tanggal_Mulai' => '2023-01-01', 'Tanggal_Selesai' => '2026-12-31', 'Keterangan' => 'Sewa aktif'],
            ['Id_Sewa' => 7, 'Id_Pemilik' => 7, 'Id_Kios' => 7, 'Jenis_Usaha' => 'Kelontong', 'Tanggal_Mulai' => '2023-01-01', 'Tanggal_Selesai' => '2026-12-31', 'Keterangan' => 'Sewa aktif'],
            ['Id_Sewa' => 8, 'Id_Pemilik' => 8, 'Id_Kios' => 8, 'Jenis_Usaha' => 'Fashion', 'Tanggal_Mulai' => '2023-01-01', 'Tanggal_Selesai' => '2026-12-31', 'Keterangan' => 'Sewa aktif'],
            ['Id_Sewa' => 9, 'Id_Pemilik' => 9, 'Id_Kios' => 9, 'Jenis_Usaha' => 'Kuliner', 'Tanggal_Mulai' => '2023-01-01', 'Tanggal_Selesai' => '2026-12-31', 'Keterangan' => 'Sewa aktif'],
            ['Id_Sewa' => 10, 'Id_Pemilik' => 10, 'Id_Kios' => 10, 'Jenis_Usaha' => 'Aksesoris', 'Tanggal_Mulai' => '2023-01-01', 'Tanggal_Selesai' => '2026-12-31', 'Keterangan' => 'Sewa aktif'],
            ['Id_Sewa' => 11, 'Id_Pemilik' => 11, 'Id_Kios' => 11, 'Jenis_Usaha' => 'Kelontong', 'Tanggal_Mulai' => '2023-01-01', 'Tanggal_Selesai' => '2026-12-31', 'Keterangan' => 'Sewa aktif'],
            ['Id_Sewa' => 12, 'Id_Pemilik' => 12, 'Id_Kios' => 12, 'Jenis_Usaha' => 'Fashion', 'Tanggal_Mulai' => '2023-01-01', 'Tanggal_Selesai' => '2026-12-31', 'Keterangan' => 'Sewa aktif'],
            ['Id_Sewa' => 13, 'Id_Pemilik' => 13, 'Id_Kios' => 13, 'Jenis_Usaha' => 'Kuliner', 'Tanggal_Mulai' => '2023-01-01', 'Tanggal_Selesai' => '2026-12-31', 'Keterangan' => 'Sewa aktif'],
            ['Id_Sewa' => 14, 'Id_Pemilik' => 14, 'Id_Kios' => 14, 'Jenis_Usaha' => 'Aksesoris', 'Tanggal_Mulai' => '2023-01-01', 'Tanggal_Selesai' => '2026-12-31', 'Keterangan' => 'Sewa aktif'],
            ['Id_Sewa' => 15, 'Id_Pemilik' => 15, 'Id_Kios' => 15, 'Jenis_Usaha' => 'Kelontong', 'Tanggal_Mulai' => '2023-01-01', 'Tanggal_Selesai' => '2026-12-31', 'Keterangan' => 'Sewa aktif'],
            ['Id_Sewa' => 16, 'Id_Pemilik' => 16, 'Id_Kios' => 16, 'Jenis_Usaha' => 'Fashion', 'Tanggal_Mulai' => '2023-01-01', 'Tanggal_Selesai' => '2026-12-31', 'Keterangan' => 'Sewa aktif'],
            ['Id_Sewa' => 17, 'Id_Pemilik' => 17, 'Id_Kios' => 17, 'Jenis_Usaha' => 'Kuliner', 'Tanggal_Mulai' => '2023-01-01', 'Tanggal_Selesai' => '2026-12-31', 'Keterangan' => 'Sewa aktif'],
            ['Id_Sewa' => 18, 'Id_Pemilik' => 18, 'Id_Kios' => 18, 'Jenis_Usaha' => 'Aksesoris', 'Tanggal_Mulai' => '2023-01-01', 'Tanggal_Selesai' => '2026-12-31', 'Keterangan' => 'Sewa aktif'],
            ['Id_Sewa' => 19, 'Id_Pemilik' => 19, 'Id_Kios' => 19, 'Jenis_Usaha' => 'Kelontong', 'Tanggal_Mulai' => '2023-01-01', 'Tanggal_Selesai' => '2026-12-31', 'Keterangan' => 'Sewa aktif'],
            ['Id_Sewa' => 20, 'Id_Pemilik' => 20, 'Id_Kios' => 20, 'Jenis_Usaha' => 'Fashion', 'Tanggal_Mulai' => '2023-01-01', 'Tanggal_Selesai' => '2026-12-31', 'Keterangan' => 'Sewa aktif'],
        ]);
    }
}
