<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

/**
 * Factory for User model matching Bunsay schema.
 */
class UserFactory extends Factory
{
    protected $model = User::class;

    /**
     * Default state: Active Tenant User
     */
    public function definition(): array
    {
        $username = 'tenant_' . fake()->unique()->numberBetween(1000, 9999);
        return [
            'Id_roles'    => 2, // 2 = Tenant
            'Username'    => $username,
            'Password'    => Hash::make('password123'),
            'sub_role'    => 'tenant',
            'permissions' => null,
            'status_aktif'=> 1,
            'nama_lengkap'=> fake()->name(),
            'email'       => fake()->unique()->safeEmail(),
        ];
    }

    /**
     * State: Admin User
     */
    public function admin(string $subRole = 'admin'): static
    {
        return $this->state(fn (array $attributes) => [
            'Id_roles'    => 1, // 1 = Admin
            'sub_role'    => $subRole,
            'permissions' => json_encode(['all' => true]),
            'status_aktif'=> 1,
        ]);
    }

    /**
     * State: Superadmin
     */
    public function superadmin(): static
    {
        return $this->admin('superadmin');
    }

    /**
     * State: Staff Loket
     */
    public function staffLoket(): static
    {
        return $this->admin('staff_loket');
    }
}
