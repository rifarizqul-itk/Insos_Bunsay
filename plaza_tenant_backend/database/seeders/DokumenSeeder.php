<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DokumenSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('dokumen')->insertOrIgnore([
            ['Id_Dokumen' => 1, 'Id_Pemilik' => 1, 'Id_Kios' => 1, 'Jenis_Dokumen' => 'Sertifikat', 'Nomor_Dokumen' => 'DOC001', 'Tanggal' => '2023-01-01'],
            ['Id_Dokumen' => 2, 'Id_Pemilik' => 2, 'Id_Kios' => 2, 'Jenis_Dokumen' => 'SP', 'Nomor_Dokumen' => 'DOC002', 'Tanggal' => '2023-01-01'],
            ['Id_Dokumen' => 3, 'Id_Pemilik' => 3, 'Id_Kios' => 3, 'Jenis_Dokumen' => 'PPJB', 'Nomor_Dokumen' => 'DOC003', 'Tanggal' => '2023-01-01'],
            ['Id_Dokumen' => 4, 'Id_Pemilik' => 4, 'Id_Kios' => 4, 'Jenis_Dokumen' => 'AJB', 'Nomor_Dokumen' => 'DOC004', 'Tanggal' => '2023-01-01'],
            ['Id_Dokumen' => 5, 'Id_Pemilik' => 5, 'Id_Kios' => 5, 'Jenis_Dokumen' => 'Sertifikat', 'Nomor_Dokumen' => 'DOC005', 'Tanggal' => '2023-01-01'],
            ['Id_Dokumen' => 6, 'Id_Pemilik' => 6, 'Id_Kios' => 6, 'Jenis_Dokumen' => 'SP', 'Nomor_Dokumen' => 'DOC006', 'Tanggal' => '2023-01-01'],
            ['Id_Dokumen' => 7, 'Id_Pemilik' => 7, 'Id_Kios' => 7, 'Jenis_Dokumen' => 'PPJB', 'Nomor_Dokumen' => 'DOC007', 'Tanggal' => '2023-01-01'],
            ['Id_Dokumen' => 8, 'Id_Pemilik' => 8, 'Id_Kios' => 8, 'Jenis_Dokumen' => 'AJB', 'Nomor_Dokumen' => 'DOC008', 'Tanggal' => '2023-01-01'],
            ['Id_Dokumen' => 9, 'Id_Pemilik' => 9, 'Id_Kios' => 9, 'Jenis_Dokumen' => 'Sertifikat', 'Nomor_Dokumen' => 'DOC009', 'Tanggal' => '2023-01-01'],
            ['Id_Dokumen' => 10, 'Id_Pemilik' => 10, 'Id_Kios' => 10, 'Jenis_Dokumen' => 'SP', 'Nomor_Dokumen' => 'DOC010', 'Tanggal' => '2023-01-01'],
            ['Id_Dokumen' => 11, 'Id_Pemilik' => 11, 'Id_Kios' => 11, 'Jenis_Dokumen' => 'PPJB', 'Nomor_Dokumen' => 'DOC011', 'Tanggal' => '2023-01-01'],
            ['Id_Dokumen' => 12, 'Id_Pemilik' => 12, 'Id_Kios' => 12, 'Jenis_Dokumen' => 'AJB', 'Nomor_Dokumen' => 'DOC012', 'Tanggal' => '2023-01-01'],
            ['Id_Dokumen' => 13, 'Id_Pemilik' => 13, 'Id_Kios' => 13, 'Jenis_Dokumen' => 'Sertifikat', 'Nomor_Dokumen' => 'DOC013', 'Tanggal' => '2023-01-01'],
            ['Id_Dokumen' => 14, 'Id_Pemilik' => 14, 'Id_Kios' => 14, 'Jenis_Dokumen' => 'SP', 'Nomor_Dokumen' => 'DOC014', 'Tanggal' => '2023-01-01'],
            ['Id_Dokumen' => 15, 'Id_Pemilik' => 15, 'Id_Kios' => 15, 'Jenis_Dokumen' => 'PPJB', 'Nomor_Dokumen' => 'DOC015', 'Tanggal' => '2023-01-01'],
            ['Id_Dokumen' => 16, 'Id_Pemilik' => 16, 'Id_Kios' => 16, 'Jenis_Dokumen' => 'AJB', 'Nomor_Dokumen' => 'DOC016', 'Tanggal' => '2023-01-01'],
            ['Id_Dokumen' => 17, 'Id_Pemilik' => 17, 'Id_Kios' => 17, 'Jenis_Dokumen' => 'Sertifikat', 'Nomor_Dokumen' => 'DOC017', 'Tanggal' => '2023-01-01'],
            ['Id_Dokumen' => 18, 'Id_Pemilik' => 18, 'Id_Kios' => 18, 'Jenis_Dokumen' => 'SP', 'Nomor_Dokumen' => 'DOC018', 'Tanggal' => '2023-01-01'],
            ['Id_Dokumen' => 19, 'Id_Pemilik' => 19, 'Id_Kios' => 19, 'Jenis_Dokumen' => 'PPJB', 'Nomor_Dokumen' => 'DOC019', 'Tanggal' => '2023-01-01'],
            ['Id_Dokumen' => 20, 'Id_Pemilik' => 20, 'Id_Kios' => 20, 'Jenis_Dokumen' => 'AJB', 'Nomor_Dokumen' => 'DOC020', 'Tanggal' => '2023-01-01'],
        ]);
    }
}
