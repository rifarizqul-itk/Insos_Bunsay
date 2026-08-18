<?php

namespace Database\Factories;

use App\Models\Dokumen;
use App\Models\Pemilik;
use App\Models\Kios;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * Factory for Dokumen model.
 */
class DokumenFactory extends Factory
{
    protected $model = Dokumen::class;

    public function definition(): array
    {
        $jenis = fake()->randomElement(['Sertifikat', 'SP', 'PPJB', 'AJB']);
        return [
            'Id_Pemilik'    => Pemilik::factory(),
            'Id_Kios'       => Kios::factory(),
            'Jenis_Dokumen' => $jenis,
            'Nomor_Dokumen' => 'DOC/' . strtoupper($jenis) . '/' . fake()->numerify('2026/####'),
            'Tanggal'       => fake()->dateTimeBetween('-3 years', 'now')->format('Y-m-d'),
        ];
    }
}
