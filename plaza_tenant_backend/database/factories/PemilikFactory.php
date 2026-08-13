<?php

namespace Database\Factories;

use App\Models\Pemilik;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * Factory for Pemilik model.
 */
class PemilikFactory extends Factory
{
    protected $model = Pemilik::class;

    public function definition(): array
    {
        return [
            'Id_User'    => User::factory(),
            'Nama'       => fake()->name(),
            'No_Telepon' => '08' . fake()->numerify('##########'),
            'No_KTP'     => fake()->numerify('6471############'),
            'Alamat'     => 'Jl. Kebun Sayur No. ' . fake()->numberBetween(1, 150) . ', Balikpapan',
        ];
    }
}
