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
            // KiosSeeder::class,     // [NONAKTIF] kios dummy — kios real dibuat di RealTenantSeeder
            RealTenantSeeder::class,   // 886 tenant real dari Data Kios BY LEGAL April 2025
            // ScenarioSeeder::class,  // [NONAKTIF] dummy scenario tenants
            // BulkStressSeeder::class,// [NONAKTIF] 20k stress-test data
        ]);
    }
}
