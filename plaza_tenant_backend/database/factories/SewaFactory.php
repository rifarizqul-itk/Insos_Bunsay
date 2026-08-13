<?php

namespace Database\Factories;

use App\Models\Sewa;
use App\Models\Pemilik;
use App\Models\Kios;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * Factory for Sewa model.
 */
class SewaFactory extends Factory
{
    protected $model = Sewa::class;

    public function definition(): array
    {
        $businessTypes = [
            'Pakaian & Tekstil Pasar Kebun Sayur',
            'Kuliner & Rumah Makan Tradisional',
            'Perhiasan Emas & Aksesoris',
            'Cenderamata & Kerajinan Khas Kaltim',
            'Sembako & Hasil Bumi',
            'Elektronik & Servis HP',
            'Kue & Jajanan Pasar',
            'Kosmetik & Produk Kecantikan',
            'Sepatu & Tas Kulit',
            'Penjahit & Konveksi'
        ];

        $startDate = fake()->dateTimeBetween('-2 years', 'now')->format('Y-m-d');
        $endDate   = date('Y-m-d', strtotime($startDate . ' + 1 year'));

        return [
            'Id_Pemilik'     => Pemilik::factory(),
            'Id_Kios'        => Kios::factory(),
            'Jenis_Usaha'    => fake()->randomElement($businessTypes),
            'Tanggal_Mulai'  => $startDate,
            'Tanggal_Selesai'=> $endDate,
            'Keterangan'     => 'Sewa unit usaha di Plaza Kebun Sayur',
            'Status'         => 'Aktif',
        ];
    }

    public function selesai(): static
    {
        return $this->state(fn (array $attributes) => [
            'Status' => 'Selesai',
        ]);
    }
}
