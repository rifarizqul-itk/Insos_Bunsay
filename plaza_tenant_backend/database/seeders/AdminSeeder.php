<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('user')->insertOrIgnore([
            // --- AKUN PENGELOLA (ADMIN) ---
            ['Id_user' => 99, 'Id_roles' => 1, 'Username' => 'admin', 'Password' => Hash::make('123456')],
        ]);
    }
}
