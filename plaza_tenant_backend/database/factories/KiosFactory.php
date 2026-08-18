<?php

namespace Database\Factories;

use App\Models\Kios;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * Factory for Kios model.
 */
class KiosFactory extends Factory
{
    protected $model = Kios::class;

    public function definition(): array
    {
        $block  = fake()->randomElement(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']);
        $floor  = fake()->randomElement([1, 2]);
        $number = sprintf('%02d', fake()->unique()->numberBetween(1, 999));
        
        $sizes  = ['3x3 m²', '3x4 m²', '4x4 m²', '4x5 m²', '5x6 m²'];

        return [
            'No_Kios' => "K{$floor}-{$number}",
            'Lantai'  => $floor,
            'Ukuran'  => fake()->randomElement($sizes),
            'Status'  => 'Kosong',
        ];
    }

    public function terisi(): static
    {
        return $this->state(fn (array $attributes) => [
            'Status' => 'Terisi',
        ]);
    }
}
