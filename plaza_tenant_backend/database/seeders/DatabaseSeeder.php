<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

/**
 * Main DatabaseSeeder orchestrating the Plaza Kebun Sayur mock data generation.
 * Single command execution: php artisan db:seed
 */
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            AdminSeeder::class,
            RealTenantSeeder::class,   // 886 tenant real murni dari Data Kios BY LEGAL
            // ScenarioSeeder::class,  // [NONAKTIF] dinonaktifkan agar 100% data real
        ]);
    }
}
