<?php

namespace Database\Seeders;

use App\Models\Kios;
use Illuminate\Database\Seeder;

/**
 * Seeder to generate ~300 Kios units across Blocks A-H on Lantai 1 & Lantai 2.
 */
class KiosSeeder extends Seeder
{
    public function run(): void
    {
        $blocks = [
            'A' => ['floor1' => 20, 'floor2' => 15],
            'B' => ['floor1' => 20, 'floor2' => 15],
            'C' => ['floor1' => 20, 'floor2' => 15],
            'D' => ['floor1' => 20, 'floor2' => 15],
            'E' => ['floor1' => 20, 'floor2' => 15],
            'F' => ['floor1' => 20, 'floor2' => 15],
            'G' => ['floor1' => 20, 'floor2' => 15],
            'H' => ['floor1' => 20, 'floor2' => 20],
        ];

        $sizes = ['3x3 m²', '3x4 m²', '4x4 m²', '4x5 m²', '5x6 m²'];

        foreach ($blocks as $block => $floors) {
            // Lantai 1
            for ($i = 1; $i <= $floors['floor1']; $i++) {
                $noKios = sprintf('%s1-%02d', $block, $i);
                Kios::updateOrInsert(
                    ['No_Kios' => $noKios],
                    [
                        'Lantai' => 1,
                        'Ukuran' => $sizes[array_rand($sizes)],
                        'Status' => 'Kosong',
                    ]
                );
            }

            // Lantai 2
            for ($i = 1; $i <= $floors['floor2']; $i++) {
                $noKios = sprintf('%s2-%02d', $block, $i);
                Kios::updateOrInsert(
                    ['No_Kios' => $noKios],
                    [
                        'Lantai' => 2,
                        'Ukuran' => $sizes[array_rand($sizes)],
                        'Status' => 'Kosong',
                    ]
                );
            }
        }
    }
}
