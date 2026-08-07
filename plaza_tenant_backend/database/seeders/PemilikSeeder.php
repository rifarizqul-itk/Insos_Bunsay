<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PemilikSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('pemilik')->insertOrIgnore([
            ['Id_Pemilik' => 1, 'Id_User' => 1, 'Nama' => 'AHMAD SARONI ', 'No_Telepon' => '081234567801', 'No_KTP' => '6471010101010001', 'Alamat' => 'Jl. Adil Makmur No.01'],
            ['Id_Pemilik' => 2, 'Id_User' => 2, 'Nama' => 'Budi Santoso', 'No_Telepon' => '081234567802', 'No_KTP' => '6471010101010002', 'Alamat' => 'Jl. Adil Makmur No.02'],
            ['Id_Pemilik' => 3, 'Id_User' => 3, 'Nama' => 'Citra Lestari', 'No_Telepon' => '081234567803', 'No_KTP' => '6471010101010003', 'Alamat' => 'Jl. Adil Makmur No.03'],
            ['Id_Pemilik' => 4, 'Id_User' => 4, 'Nama' => 'Dedi Irawan', 'No_Telepon' => '081234567804', 'No_KTP' => '6471010101010004', 'Alamat' => 'Jl. Adil Makmur No.04'],
            ['Id_Pemilik' => 5, 'Id_User' => 5, 'Nama' => 'Eka Putri', 'No_Telepon' => '081234567805', 'No_KTP' => '6471010101010005', 'Alamat' => 'Jl. Adil Makmur No.05'],
            ['Id_Pemilik' => 6, 'Id_User' => 6, 'Nama' => 'Fajar Hadi', 'No_Telepon' => '081234567806', 'No_KTP' => '6471010101010006', 'Alamat' => 'Jl. Adil Makmur No.06'],
            ['Id_Pemilik' => 7, 'Id_User' => 7, 'Nama' => 'Gita Sari', 'No_Telepon' => '081234567807', 'No_KTP' => '6471010101010007', 'Alamat' => 'Jl. Adil Makmur No.07'],
            ['Id_Pemilik' => 8, 'Id_User' => 8, 'Nama' => 'Hendra Wijaya', 'No_Telepon' => '081234567808', 'No_KTP' => '6471010101010008', 'Alamat' => 'Jl. Adil Makmur No.08'],
            ['Id_Pemilik' => 9, 'Id_User' => 9, 'Nama' => 'Indah Permata', 'No_Telepon' => '081234567809', 'No_KTP' => '6471010101010009', 'Alamat' => 'Jl. Adil Makmur No.09'],
            ['Id_Pemilik' => 10, 'Id_User' => 10, 'Nama' => 'Joko Saputra', 'No_Telepon' => '081234567810', 'No_KTP' => '6471010101010010', 'Alamat' => 'Jl. Adil Makmur No.10'],
            ['Id_Pemilik' => 11, 'Id_User' => 11, 'Nama' => 'Karin Ayu', 'No_Telepon' => '081234567811', 'No_KTP' => '6471010101010011', 'Alamat' => 'Jl. Adil Makmur No.11'],
            ['Id_Pemilik' => 12, 'Id_User' => 12, 'Nama' => 'Lukman Hakim', 'No_Telepon' => '081234567812', 'No_KTP' => '6471010101010012', 'Alamat' => 'Jl. Adil Makmur No.12'],
            ['Id_Pemilik' => 13, 'Id_User' => 13, 'Nama' => 'Maya Sari', 'No_Telepon' => '081234567813', 'No_KTP' => '6471010101010013', 'Alamat' => 'Jl. Adil Makmur No.13'],
            ['Id_Pemilik' => 14, 'Id_User' => 14, 'Nama' => 'Nanda Putra', 'No_Telepon' => '081234567814', 'No_KTP' => '6471010101010014', 'Alamat' => 'Jl. Adil Makmur No.14'],
            ['Id_Pemilik' => 15, 'Id_User' => 15, 'Nama' => 'Oki Ramadhan', 'No_Telepon' => '081234567815', 'No_KTP' => '6471010101010015', 'Alamat' => 'Jl. Adil Makmur No.15'],
            ['Id_Pemilik' => 16, 'Id_User' => 16, 'Nama' => 'Putri Amelia', 'No_Telepon' => '081234567816', 'No_KTP' => '6471010101010016', 'Alamat' => 'Jl. Adil Makmur No.16'],
            ['Id_Pemilik' => 17, 'Id_User' => 17, 'Nama' => 'Rian Kurnia', 'No_Telepon' => '081234567817', 'No_KTP' => '6471010101010017', 'Alamat' => 'Jl. Adil Makmur No.17'],
            ['Id_Pemilik' => 18, 'Id_User' => 18, 'Nama' => 'Sinta Dewi', 'No_Telepon' => '081234567818', 'No_KTP' => '6471010101010018', 'Alamat' => 'Jl. Adil Makmur No.18'],
            ['Id_Pemilik' => 19, 'Id_User' => 19, 'Nama' => 'Taufik Hidayat', 'No_Telepon' => '081234567819', 'No_KTP' => '6471010101010019', 'Alamat' => 'Jl. Adil Makmur No.19'],
            ['Id_Pemilik' => 20, 'Id_User' => 20, 'Nama' => 'Vina Maharani', 'No_Telepon' => '081234567820', 'No_KTP' => '6471010101010020', 'Alamat' => 'Jl. Adil Makmur No.20'],
        ]);
    }
}
