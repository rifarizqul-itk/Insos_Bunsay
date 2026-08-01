<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('roles')->insertOrIgnore([
            ['Id_roles' => 1, 'Nama_role' => 'Admin'],
            ['Id_roles' => 2, 'Nama_role' => 'Pemilik'],
        ]);
    }
}
