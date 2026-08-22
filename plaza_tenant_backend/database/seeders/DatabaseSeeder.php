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
            KiosSeeder::class,
            ScenarioSeeder::class,
            BulkStressSeeder::class,  // 20k stress-test data
        ]);
    }
}
