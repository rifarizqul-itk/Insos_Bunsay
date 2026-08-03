<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            AdminSeeder::class,
            UserSeeder::class,
            PemilikSeeder::class,
            KiosSeeder::class,
            SewaSeeder::class,
            TagihanSeeder::class,
            PembayaranSeeder::class,
            DokumenSeeder::class,
        ]);
    }
}
