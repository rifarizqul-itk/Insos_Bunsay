<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('user')->insertOrIgnore([
            ['Id_user' => 1, 'Id_roles' => 2, 'Username' => 'pemilik1', 'Password' => Hash::make('123456')],
            ['Id_user' => 2, 'Id_roles' => 2, 'Username' => 'pemilik2', 'Password' => Hash::make('123456')],
            ['Id_user' => 3, 'Id_roles' => 2, 'Username' => 'pemilik3', 'Password' => Hash::make('123456')],
            ['Id_user' => 4, 'Id_roles' => 2, 'Username' => 'pemilik4', 'Password' => Hash::make('123456')],
            ['Id_user' => 5, 'Id_roles' => 2, 'Username' => 'pemilik5', 'Password' => Hash::make('123456')],
            ['Id_user' => 6, 'Id_roles' => 2, 'Username' => 'pemilik6', 'Password' => Hash::make('123456')],
            ['Id_user' => 7, 'Id_roles' => 2, 'Username' => 'pemilik7', 'Password' => Hash::make('123456')],
            ['Id_user' => 8, 'Id_roles' => 2, 'Username' => 'pemilik8', 'Password' => Hash::make('123456')],
            ['Id_user' => 9, 'Id_roles' => 2, 'Username' => 'pemilik9', 'Password' => Hash::make('123456')],
            ['Id_user' => 10, 'Id_roles' => 2, 'Username' => 'pemilik10', 'Password' => Hash::make('123456')],
            ['Id_user' => 11, 'Id_roles' => 2, 'Username' => 'pemilik11', 'Password' => Hash::make('123456')],
            ['Id_user' => 12, 'Id_roles' => 2, 'Username' => 'pemilik12', 'Password' => Hash::make('123456')],
            ['Id_user' => 13, 'Id_roles' => 2, 'Username' => 'pemilik13', 'Password' => Hash::make('123456')],
            ['Id_user' => 14, 'Id_roles' => 2, 'Username' => 'pemilik14', 'Password' => Hash::make('123456')],
            ['Id_user' => 15, 'Id_roles' => 2, 'Username' => 'pemilik15', 'Password' => Hash::make('123456')],
            ['Id_user' => 16, 'Id_roles' => 2, 'Username' => 'pemilik16', 'Password' => Hash::make('123456')],
            ['Id_user' => 17, 'Id_roles' => 2, 'Username' => 'pemilik17', 'Password' => Hash::make('123456')],
            ['Id_user' => 18, 'Id_roles' => 2, 'Username' => 'pemilik18', 'Password' => Hash::make('123456')],
            ['Id_user' => 19, 'Id_roles' => 2, 'Username' => 'pemilik19', 'Password' => Hash::make('123456')],
            ['Id_user' => 20, 'Id_roles' => 2, 'Username' => 'pemilik20', 'Password' => Hash::make('123456')],
        ]);
    }
}
