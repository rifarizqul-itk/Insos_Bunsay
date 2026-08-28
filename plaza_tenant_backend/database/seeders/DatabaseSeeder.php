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
            KiosSeeder::class,               // Master ~300 Unit Kios Fisik Blok A-H (Status awal: Kosong)
            SimulationScenarioSeeder::class, // Skenario Simulasi 10 Orang Tim (100% State Coverage)
        ]);
    }
}
