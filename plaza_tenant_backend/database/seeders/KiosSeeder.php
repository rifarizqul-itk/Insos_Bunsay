<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class KiosSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('kios')->insertOrIgnore([
            ['Id_Kios' => 1, 'No_Kios' => 'B-1001', 'Lantai' => 1, 'Ukuran' => '4x4 m', 'Status' => 'Terisi'],
            ['Id_Kios' => 2, 'No_Kios' => 'B-1002', 'Lantai' => 1, 'Ukuran' => '3x3 m', 'Status' => 'Terisi'],
            ['Id_Kios' => 3, 'No_Kios' => 'B-1003', 'Lantai' => 1, 'Ukuran' => '3x4 m', 'Status' => 'Terisi'],
            ['Id_Kios' => 4, 'No_Kios' => 'B-1004', 'Lantai' => 1, 'Ukuran' => '4x5 m', 'Status' => 'Terisi'],
            ['Id_Kios' => 5, 'No_Kios' => 'B-1005', 'Lantai' => 1, 'Ukuran' => '4x5 m', 'Status' => 'Terisi'],
            ['Id_Kios' => 6, 'No_Kios' => 'B-1006', 'Lantai' => 1, 'Ukuran' => '4x4 m', 'Status' => 'Terisi'],
            ['Id_Kios' => 7, 'No_Kios' => 'B-1007', 'Lantai' => 1, 'Ukuran' => '3x3 m', 'Status' => 'Terisi'],
            ['Id_Kios' => 8, 'No_Kios' => 'B-1008', 'Lantai' => 1, 'Ukuran' => '3x4 m', 'Status' => 'Terisi'],
            ['Id_Kios' => 9, 'No_Kios' => 'B-1009', 'Lantai' => 1, 'Ukuran' => '4x5 m', 'Status' => 'Terisi'],
            ['Id_Kios' => 10, 'No_Kios' => 'B-1010', 'Lantai' => 1, 'Ukuran' => '4x5 m', 'Status' => 'Terisi'],
            ['Id_Kios' => 11, 'No_Kios' => 'B-1011', 'Lantai' => 1, 'Ukuran' => '4x4 m', 'Status' => 'Terisi'],
            ['Id_Kios' => 12, 'No_Kios' => 'B-1012', 'Lantai' => 1, 'Ukuran' => '3x3 m', 'Status' => 'Terisi'],
            ['Id_Kios' => 13, 'No_Kios' => 'B-1013', 'Lantai' => 1, 'Ukuran' => '3x4 m', 'Status' => 'Terisi'],
            ['Id_Kios' => 14, 'No_Kios' => 'B-1014', 'Lantai' => 1, 'Ukuran' => '4x5 m', 'Status' => 'Terisi'],
            ['Id_Kios' => 15, 'No_Kios' => 'B-1015', 'Lantai' => 1, 'Ukuran' => '4x5 m', 'Status' => 'Terisi'],
            ['Id_Kios' => 16, 'No_Kios' => 'B-1016', 'Lantai' => 1, 'Ukuran' => '4x4 m', 'Status' => 'Terisi'],
            ['Id_Kios' => 17, 'No_Kios' => 'B-1017', 'Lantai' => 1, 'Ukuran' => '3x3 m', 'Status' => 'Terisi'],
            ['Id_Kios' => 18, 'No_Kios' => 'B-1018', 'Lantai' => 1, 'Ukuran' => '3x4 m', 'Status' => 'Terisi'],
            ['Id_Kios' => 19, 'No_Kios' => 'B-1019', 'Lantai' => 1, 'Ukuran' => '4x5 m', 'Status' => 'Kosong'],
            ['Id_Kios' => 20, 'No_Kios' => 'B-1020', 'Lantai' => 1, 'Ukuran' => '4x5 m', 'Status' => 'Kosong'],
        ]);
    }
}
