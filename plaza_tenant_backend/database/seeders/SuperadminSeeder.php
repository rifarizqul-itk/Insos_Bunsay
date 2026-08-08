<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class SuperadminSeeder extends Seeder
{
    public function run(): void
    {
        $allPermissions = json_encode([
            'verifikasi_pembayaran',
            'input_setoran',
            'ekspor_laporan',
            'kelola_kios',
            'kelola_admin',
            'lihat_audit_log'
        ]);

        $kasirPermissions = json_encode([
            'input_setoran',
            'verifikasi_pembayaran'
        ]);

        $auditorPermissions = json_encode([
            'ekspor_laporan',
            'lihat_audit_log'
        ]);

        // 1. Akun Superadmin Utama (username: superadmin, pass: superadmin123)
        DB::table('user')->updateOrInsert(
            ['Username' => 'superadmin'],
            [
                'Id_roles'     => 1,
                'Password'     => Hash::make('superadmin123'),
                'nama_lengkap' => 'Superadmin Pengelola Plaza',
                'email'        => 'superadmin@bunsay.id',
                'sub_role'     => 'superadmin',
                'permissions'  => $allPermissions,
                'status_aktif' => 1,
            ]
        );

        // 2. Akun Admin Standar (username: admin, pass: 123456)
        DB::table('user')->updateOrInsert(
            ['Username' => 'admin'],
            [
                'Id_roles'     => 1,
                'Password'     => Hash::make('123456'),
                'nama_lengkap' => 'Admin Pengelola Plaza',
                'email'        => 'admin@bunsay.id',
                'sub_role'     => 'superadmin',
                'permissions'  => $allPermissions,
                'status_aktif' => 1,
            ]
        );

        // 3. Akun Sampel Kasir (username: kasir_lisa, pass: kasir123)
        DB::table('user')->updateOrInsert(
            ['Username' => 'kasir_lisa'],
            [
                'Id_roles'     => 1,
                'Password'     => Hash::make('kasir123'),
                'nama_lengkap' => 'Lisa Anggraini (Kasir Loket)',
                'email'        => 'lisa.kasir@bunsay.id',
                'sub_role'     => 'kasir',
                'permissions'  => $kasirPermissions,
                'status_aktif' => 1,
            ]
        );

        // 4. Akun Sampel Auditor (username: auditor_budi, pass: auditor123)
        DB::table('user')->updateOrInsert(
            ['Username' => 'auditor_budi'],
            [
                'Id_roles'     => 1,
                'Password'     => Hash::make('auditor123'),
                'nama_lengkap' => 'Budi Santoso (Auditor Keuangan)',
                'email'        => 'budi.auditor@bunsay.id',
                'sub_role'     => 'auditor',
                'permissions'  => $auditorPermissions,
                'status_aktif' => 1,
            ]
        );
    }
}
