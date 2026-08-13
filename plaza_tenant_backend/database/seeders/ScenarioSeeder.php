<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Pemilik;
use App\Models\Kios;
use App\Models\Sewa;
use App\Models\Tagihan;
use App\Models\Pembayaran;
use App\Models\Dokumen;
use App\Models\ActivityLog;
use App\Models\Notification;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

/**
 * Main Scenario Seeder generating 250+ tenant accounts and all required
 * business & edge case scenarios for Plaza Kebun Sayur (Bunsay).
 * Fully Idempotent: Can be executed safely multiple times via `php artisan db:seed`.
 */
class ScenarioSeeder extends Seeder
{
    private string $passwordHash;

    public function __construct()
    {
        $this->passwordHash = Hash::make('password123');
    }

    public function run(): void
    {
        $this->command->info('Seeding Plaza Kebun Sayur Scenarios (250+ Tenants)...');

        // Fetch available kiosks created by KiosSeeder
        $availableKiosks = Kios::where('Status', 'Kosong')->get();
        $kioskIndex = 0;

        $getKiosk = function () use (&$availableKiosks, &$kioskIndex) {
            if ($kioskIndex >= $availableKiosks->count()) {
                // Create extra kiosk if run out
                $kiosk = Kios::create([
                    'No_Kios' => 'X' . rand(1,9) . '-' . sprintf('%03d', rand(100, 999)),
                    'Lantai'  => rand(1, 2),
                    'Ukuran'  => '4x4 m²',
                    'Status'  => 'Kosong',
                ]);
                return $kiosk;
            }
            return $availableKiosks[$kioskIndex++];
        };

        // ============================================================
        // BAGIAN 1: FEATURED TEST ACCOUNTS (Login Utama untuk Testing UI/API)
        // ============================================================
        $this->command->info('Creating Featured Test Accounts...');

        // 1. SC-03: Tenant Aktif Normal (tenant_aktif)
        $this->createFeaturedTenant(
            username: 'tenant_aktif',
            name: 'H. Ahmad Subandi (Toko Pakaian)',
            getKiosk: $getKiosk,
            monthsCount: 6,
            overdueCount: 0,
            statusTagihanTerakhir: 'Lunas'
        );

        // 2. SC-04: Tenant Menunggak 1 Bulan (tenant_tunggak1) - Listrik dimatikan
        $this->createFeaturedTenant(
            username: 'tenant_tunggak1',
            name: 'Hj. Siti Rahmawati (Warung Sembako)',
            getKiosk: $getKiosk,
            monthsCount: 4,
            overdueCount: 1,
            statusTagihanTerakhir: 'Belum Bayar'
        );

        // 3. SC-05 / SC-51: Tenant Menunggak Multi-Bulan (tenant_tunggak_multi)
        $this->createFeaturedTenant(
            username: 'tenant_tunggak_multi',
            name: 'Budi Santoso (Servis HP & Elektronik)',
            getKiosk: $getKiosk,
            monthsCount: 5,
            overdueCount: 3,
            statusTagihanTerakhir: 'Belum Bayar'
        );

        // 4. SC-06: Tenant Melunasi Tunggakan (tenant_lunas)
        $this->createFeaturedTenant(
            username: 'tenant_lunas',
            name: 'Dewi Lestari (Toko Perhiasan Emas)',
            getKiosk: $getKiosk,
            monthsCount: 4,
            overdueCount: 0,
            statusTagihanTerakhir: 'Lunas'
        );

        // 5. SC-01 / Edge Case 1: Tenant Baru Tanpa Kios / 0 Tagihan (tenant_baru_0tagihan)
        $user0 = User::firstOrCreate(
            ['Username' => 'tenant_baru_0tagihan'],
            [
                'Id_roles'    => 2,
                'Password'    => $this->passwordHash,
                'sub_role'    => 'tenant',
                'status_aktif'=> 1,
                'nama_lengkap'=> 'Rizky Pratama (Tenant Baru)',
                'email'       => 'rizky.baru@bunsay.id',
            ]
        );
        Pemilik::firstOrCreate(
            ['Id_User' => $user0->Id_user],
            [
                'Nama'       => $user0->nama_lengkap,
                'No_Telepon' => '081234567890',
                'No_KTP'     => '6471012345670001',
                'Alamat'     => 'Jl. Kebun Sayur No. 12, Balikpapan',
            ]
        );

        // 6. Edge Case 2: Tenant >50 Tagihan / Stress Test (tenant_stress_50)
        $this->createStressTenant('tenant_stress_50', 'Pak Harun (Toko Souvenir Legendaris)', $getKiosk, 60);

        // 7. Edge Case 3 / SC-19: Partial Payment FIFO (tenant_fifocicil)
        $this->createFifoPartialPaymentTenant('tenant_fifocicil', 'Ibu Nurhayati (Kedai Kopi)', $getKiosk);

        // 8. SC-17 / SC-24: Dispute / Sanggahan Cycle (tenant_dispute)
        $this->createDisputeTenant('tenant_dispute', 'Pak Bambang (Toko Penjahit)', $getKiosk);

        // 9. SC-14: Midtrans Auto-Confirm Payment (tenant_midtrans)
        $this->createMidtransTenant('tenant_midtrans', 'Sari Melati (Batik Kaltim)', $getKiosk);

        // 10. SC-08 / Rule #8: Multi-Kios Tenant (tenant_multikios)
        $this->createMultiKiosTenant('tenant_multikios', 'H. Fahmi Riza (Grosir Pakaian)', $getKiosk, 3);

        // 11. SC-07 / SC-36: Tenant Keluar / Soft-Deleted Lease (tenant_selesai)
        $this->createSoftDeletedTenant('tenant_selesai', 'M. Arifin (Eks Tenant Aksesoris)', $getKiosk);


        // ============================================================
        // BAGIAN 2: BULK TENANT ALLOCATIONS (Mencapai Total 250+ Accounts)
        // ============================================================
        $this->command->info('Seeding Bulk Tenant Groups (reaching 250+ accounts)...');

        // Group A: Tenant Aktif Normal (120 accounts)
        for ($i = 1; $i <= 120; $i++) {
            $this->createFeaturedTenant(
                username: "tenant_aktif_{$i}",
                name: fake()->name() . " (Kios A-{$i})",
                getKiosk: $getKiosk,
                monthsCount: rand(3, 8),
                overdueCount: 0,
                statusTagihanTerakhir: rand(0, 1) ? 'Lunas' : 'Belum Bayar'
            );
        }

        // Group B: Tenant Menunggak 1 Bulan (40 accounts)
        for ($i = 1; $i <= 40; $i++) {
            $this->createFeaturedTenant(
                username: "tenant_tunggak1_{$i}",
                name: fake()->name() . " (Sembako {$i})",
                getKiosk: $getKiosk,
                monthsCount: rand(2, 6),
                overdueCount: 1,
                statusTagihanTerakhir: 'Belum Bayar'
            );
        }

        // Group C: Tenant Menunggak Multi-Bulan (35 accounts)
        for ($i = 1; $i <= 35; $i++) {
            $this->createFeaturedTenant(
                username: "tenant_tunggak_multi_{$i}",
                name: fake()->name() . " (Kuliner {$i})",
                getKiosk: $getKiosk,
                monthsCount: rand(4, 9),
                overdueCount: rand(2, 4),
                statusTagihanTerakhir: 'Belum Bayar'
            );
        }

        // Group D: Tenant Keluar / Soft-Deleted Lease (25 accounts)
        for ($i = 1; $i <= 25; $i++) {
            $this->createSoftDeletedTenant(
                username: "tenant_keluar_{$i}",
                name: fake()->name() . " (Eks Tenant {$i})",
                getKiosk: $getKiosk
            );
        }

        // Group E: Tenant Baru tanpa Kios / 0 Tagihan (15 accounts)
        for ($i = 1; $i <= 15; $i++) {
            $u = User::firstOrCreate(
                ['Username' => "tenant_baru_{$i}"],
                [
                    'Id_roles'    => 2,
                    'Password'    => $this->passwordHash,
                    'sub_role'    => 'tenant',
                    'status_aktif'=> 1,
                    'nama_lengkap'=> fake()->name() . " (Calon Tenant {$i})",
                    'email'       => "tenant.baru.{$i}@bunsay.id",
                ]
            );
            Pemilik::firstOrCreate(
                ['Id_User' => $u->Id_user],
                [
                    'Nama'       => $u->nama_lengkap,
                    'No_Telepon' => '08' . fake()->numerify('##########'),
                    'No_KTP'     => fake()->numerify('6471############'),
                    'Alamat'     => 'Jl. Kebun Sayur No. ' . rand(1, 100) . ', Balikpapan',
                ]
            );
        }

        // Group F: Tenant Multi-Kios (5 accounts x 2 kiosks = 10 leases)
        for ($i = 1; $i <= 5; $i++) {
            $this->createMultiKiosTenant(
                username: "tenant_multikios_{$i}",
                name: fake()->name() . " (Grosir {$i})",
                getKiosk: $getKiosk,
                kioskCount: 2
            );
        }

        // Group G: Heavy Stress Test Tenant (1 account x 55 invoices)
        $this->createStressTenant('tenant_stress_heavy', 'CV Kebun Sayur Jaya (Stress Test 55 Tagihan)', $getKiosk, 55);

        // ============================================================
        // BAGIAN 3: VERIFICATION QUEUE & SYSTEM AUDIT LOGS / NOTIFICATIONS
        // ============================================================
        $this->command->info('Seeding Verification Queue, Audit Logs & Notifications...');

        // 15 Payments in 'Menunggu' status for Admin Verification Queue (SC-23)
        $pendingTagihans = Tagihan::where('Status_Tagihan', 'Belum Bayar')->limit(15)->get();
        foreach ($pendingTagihans as $idx => $t) {
            Pembayaran::firstOrCreate(
                ['Id_Tagihan' => $t->Id_Tagihan, 'Verifikasi_Pembayaran' => 'Menunggu'],
                [
                    'Tanggal_Bayar'        => now()->subDays(rand(1, 10))->toDateString(),
                    'Total_Bayar'          => $t->Total_Tagihan,
                    'Metode_Bayar'         => 'Transfer',
                    'Bukti_Pembayaran'      => 'storage/bukti/bukti_pending_' . ($idx + 1) . '.png',
                ]
            );
            $t->update(['Status_Tagihan' => 'Menunggu Verifikasi']);
        }

        // Generate 30 ActivityLog entries if not seeded
        if (ActivityLog::count() < 10) {
            $actions = [
                ['modul' => 'Pembayaran', 'aksi' => 'Verifikasi Terima', 'deskripsi' => 'Admin memverifikasi pembayaran transfer sebesar Rp 750.000 (DITERIMA).'],
                ['modul' => 'Pembayaran', 'aksi' => 'Verifikasi Tolak', 'deskripsi' => 'Admin menolak pembayaran transfer karena foto bukti tidak jelas.'],
                ['modul' => 'Sewa', 'aksi' => 'Akhiri Sewa', 'deskripsi' => 'Admin mengakhiri masa sewa kios B1-05 (Status diubah ke Selesai).'],
                ['modul' => 'Kios', 'aksi' => 'Tambah Kios', 'deskripsi' => 'Admin menambahkan unit kios baru H2-15 di Lantai 2.'],
                ['modul' => 'User', 'aksi' => 'Register Tenant', 'deskripsi' => 'Admin mendaftarkan akun tenant baru H. Ahmad Subandi.'],
            ];

            for ($i = 0; $i < 30; $i++) {
                $act = $actions[array_rand($actions)];
                ActivityLog::create([
                    'id_user'    => 1,
                    'username'   => 'admin',
                    'role'       => 'admin',
                    'modul'      => $act['modul'],
                    'aksi'       => $act['aksi'],
                    'deskripsi'  => $act['deskripsi'],
                    'ip_address' => '127.0.0.1',
                    'created_at' => now()->subDays(rand(1, 30)),
                ]);
            }
        }

        // Generate 40 Notifications if not seeded
        if (Notification::count() < 10) {
            for ($i = 0; $i < 40; $i++) {
                Notification::create([
                    'target_type' => rand(0, 1) ? 'tenant' : 'admin',
                    'id_user'     => null,
                    'title'       => rand(0, 1) ? 'Pemberitahuan Tagihan Sewa' : 'Pembayaran Perlu Verifikasi',
                    'message'     => 'Sistem mencatat transaksi baru pada unit kios Plaza Kebun Sayur.',
                    'type'        => ['info', 'success', 'warning', 'danger'][rand(0, 3)],
                    'is_read'     => (bool) rand(0, 1),
                    'link'        => '/admin/verifikasi-bukti',
                    'created_at'  => now()->subDays(rand(1, 20)),
                ]);
            }
        }

        $totalUsers = User::where('Id_roles', 2)->count();
        $this->command->info("SUCCESS! Seeded total of {$totalUsers} tenant accounts into database.");
    }

    // ============================================================
    // HELPER METHODS FOR CREATING SPECIFIC SCENARIO TENANTS
    // ============================================================

    private function createFeaturedTenant(
        string $username,
        string $name,
        callable $getKiosk,
        int $monthsCount,
        int $overdueCount,
        string $statusTagihanTerakhir
    ): void {
        $user = User::firstOrCreate(
            ['Username' => $username],
            [
                'Id_roles'    => 2,
                'Password'    => $this->passwordHash,
                'sub_role'    => 'tenant',
                'status_aktif'=> 1,
                'nama_lengkap'=> $name,
                'email'       => "{$username}@bunsay.id",
            ]
        );

        $pemilik = Pemilik::firstOrCreate(
            ['Id_User' => $user->Id_user],
            [
                'Nama'       => $name,
                'No_Telepon' => '08' . fake()->numerify('##########'),
                'No_KTP'     => fake()->numerify('6471############'),
                'Alamat'     => 'Plaza Kebun Sayur, Balikpapan',
            ]
        );

        if (Sewa::where('Id_Pemilik', $pemilik->Id_Pemilik)->exists()) {
            return; // Already seeded, skip
        }

        $kios = $getKiosk();
        $kios->update(['Status' => 'Terisi']);

        $startDate = Carbon::now()->subMonths($monthsCount)->startOfMonth();
        $sewa = Sewa::create([
            'Id_Pemilik'     => $pemilik->Id_Pemilik,
            'Id_Kios'        => $kios->Id_Kios,
            'Jenis_Usaha'    => 'Usaha Dagang Pasar Kebun Sayur',
            'Tanggal_Mulai'  => $startDate->toDateString(),
            'Tanggal_Selesai'=> $startDate->copy()->addYear()->toDateString(),
            'Keterangan'     => 'Sewa aktif unit toko',
            'Status'         => 'Aktif',
        ]);

        // Dokumen Legal
        Dokumen::create([
            'Id_Pemilik'    => $pemilik->Id_Pemilik,
            'Id_Kios'       => $kios->Id_Kios,
            'Jenis_Dokumen' => 'SP',
            'Nomor_Dokumen' => 'SP/BUNSAY/' . rand(100, 999) . '/2026',
            'Tanggal'       => $startDate->toDateString(),
        ]);

        // Create billing history per month
        $tarif = 750000.00;
        for ($m = 0; $m < $monthsCount; $m++) {
            $currMonthDate = $startDate->copy()->addMonths($m);
            $periodeStr    = $currMonthDate->format('Y-m');
            $dueDateStr    = $currMonthDate->copy()->day(12)->format('Y-m-d');

            $isOverdue = ($m >= ($monthsCount - $overdueCount));

            if ($isOverdue) {
                // Overdue invoice
                Tagihan::create([
                    'Id_Sewa'          => $sewa->Id_Sewa,
                    'Periode'          => $periodeStr,
                    'Jatuh_Tempo'      => $dueDateStr,
                    'Tarif_Sewa'       => $tarif,
                    'Hutang_Tunggakan' => $tarif * ($m - ($monthsCount - $overdueCount)),
                    'Total_Tagihan'    => $tarif,
                    'Sisa_Tagihan'     => $tarif,
                    'Status_Tagihan'   => 'Belum Bayar',
                ]);
            } else {
                // Paid invoice
                $t = Tagihan::create([
                    'Id_Sewa'          => $sewa->Id_Sewa,
                    'Periode'          => $periodeStr,
                    'Jatuh_Tempo'      => $dueDateStr,
                    'Tarif_Sewa'       => $tarif,
                    'Hutang_Tunggakan' => 0.00,
                    'Total_Tagihan'    => $tarif,
                    'Sisa_Tagihan'     => 0.00,
                    'Status_Tagihan'   => 'Lunas',
                ]);

                Pembayaran::create([
                    'Id_Tagihan'           => $t->Id_Tagihan,
                    'Tanggal_Bayar'        => $currMonthDate->copy()->day(15)->toDateString(),
                    'Total_Bayar'          => $tarif,
                    'Metode_Bayar'         => 'Transfer',
                    'Bukti_Pembayaran'      => 'storage/bukti/bukti_' . $t->Id_Tagihan . '.png',
                    'Verifikasi_Pembayaran'=> 'Diterima',
                ]);
            }
        }
    }

    private function createStressTenant(string $username, string $name, callable $getKiosk, int $count): void
    {
        $user = User::firstOrCreate(
            ['Username' => $username],
            [
                'Id_roles'    => 2,
                'Password'    => $this->passwordHash,
                'sub_role'    => 'tenant',
                'status_aktif'=> 1,
                'nama_lengkap'=> $name,
                'email'       => "{$username}@bunsay.id",
            ]
        );

        $pemilik = Pemilik::firstOrCreate(
            ['Id_User' => $user->Id_user],
            [
                'Nama'       => $name,
                'No_Telepon' => '0852' . fake()->numerify('########'),
                'No_KTP'     => fake()->numerify('6471############'),
                'Alamat'     => 'Blok Utama Kebun Sayur, Balikpapan',
            ]
        );

        if (Sewa::where('Id_Pemilik', $pemilik->Id_Pemilik)->exists()) {
            return;
        }

        $kios = $getKiosk();
        $kios->update(['Status' => 'Terisi']);

        $startDate = Carbon::now()->subMonths($count)->startOfMonth();
        $sewa = Sewa::create([
            'Id_Pemilik'     => $pemilik->Id_Pemilik,
            'Id_Kios'        => $kios->Id_Kios,
            'Jenis_Usaha'    => 'Grosir Cenderamata Legendaris (Stress Test 50+ Tagihan)',
            'Tanggal_Mulai'  => $startDate->toDateString(),
            'Tanggal_Selesai'=> Carbon::now()->addYears(2)->toDateString(),
            'Keterangan'     => 'Kontrak sewa jangka panjang untuk stress testing UI/API pagination',
            'Status'         => 'Aktif',
        ]);

        $tarif = 1000000.00;
        for ($i = 0; $i < $count; $i++) {
            $dt = $startDate->copy()->addMonths($i);
            $isLast = ($i === $count - 1);

            $t = Tagihan::create([
                'Id_Sewa'          => $sewa->Id_Sewa,
                'Periode'          => $dt->format('Y-m'),
                'Jatuh_Tempo'      => $dt->copy()->day(25)->format('Y-m-d'),
                'Tarif_Sewa'       => $tarif,
                'Hutang_Tunggakan' => 0.00,
                'Total_Tagihan'    => $tarif,
                'Sisa_Tagihan'     => $isLast ? $tarif : 0.00,
                'Status_Tagihan'   => $isLast ? 'Belum Bayar' : 'Lunas',
            ]);

            if (!$isLast) {
                Pembayaran::create([
                    'Id_Tagihan'           => $t->Id_Tagihan,
                    'Tanggal_Bayar'        => $dt->copy()->day(10)->toDateString(),
                    'Total_Bayar'          => $tarif,
                    'Metode_Bayar'         => ($i % 3 === 0) ? 'Midtrans' : (($i % 2 === 0) ? 'Transfer' : 'Tunai'),
                    'Bukti_Pembayaran'      => 'storage/bukti/stress_' . $i . '.png',
                    'Verifikasi_Pembayaran'=> 'Diterima',
                ]);
            }
        }
    }

    private function createFifoPartialPaymentTenant(string $username, string $name, callable $getKiosk): void
    {
        $user = User::firstOrCreate(
            ['Username' => $username],
            [
                'Id_roles'    => 2,
                'Password'    => $this->passwordHash,
                'sub_role'    => 'tenant',
                'status_aktif'=> 1,
                'nama_lengkap'=> $name,
                'email'       => "{$username}@bunsay.id",
            ]
        );

        $pemilik = Pemilik::firstOrCreate(
            ['Id_User' => $user->Id_user],
            [
                'Nama'            => $name,
                'No_Telepon'      => '0813' . fake()->numerify('########'),
                'No_KTP'          => fake()->numerify('6471############'),
                'Alamat'          => 'Kios Kuliner Bunsay',
                'izinkan_cicilan' => true,
            ]
        );

        if (Sewa::where('Id_Pemilik', $pemilik->Id_Pemilik)->exists()) {
            return;
        }

        $kios = $getKiosk();
        $kios->update(['Status' => 'Terisi']);

        $sewa = Sewa::create([
            'Id_Pemilik'     => $pemilik->Id_Pemilik,
            'Id_Kios'        => $kios->Id_Kios,
            'Jenis_Usaha'    => 'Kedai Kopi & Teh Tradisional',
            'Tanggal_Mulai'  => Carbon::now()->subMonths(3)->startOfMonth()->toDateString(),
            'Tanggal_Selesai'=> Carbon::now()->addYear()->toDateString(),
            'Keterangan'     => 'Sewa Aktif - Kasus Pembayaran Cicilan FIFO',
            'Status'         => 'Aktif',
        ]);

        $tarif = 500000.00;

        // Tagihan 1: Bulan lalu (Lunas via FIFO)
        $t1 = Tagihan::create([
            'Id_Sewa'          => $sewa->Id_Sewa,
            'Periode'          => Carbon::now()->subMonths(2)->format('Y-m'),
            'Jatuh_Tempo'      => Carbon::now()->subMonths(2)->day(25)->format('Y-m-d'),
            'Tarif_Sewa'       => $tarif,
            'Hutang_Tunggakan' => 0.00,
            'Total_Tagihan'    => $tarif,
            'Sisa_Tagihan'     => 0.00,
            'Status_Tagihan'   => 'Lunas',
        ]);

        // Tagihan 2: Bulan kemarin (Dicicil, sisa 250k)
        $t2 = Tagihan::create([
            'Id_Sewa'          => $sewa->Id_Sewa,
            'Periode'          => Carbon::now()->subMonth()->format('Y-m'),
            'Jatuh_Tempo'      => Carbon::now()->subMonth()->day(25)->format('Y-m-d'),
            'Tarif_Sewa'       => $tarif,
            'Hutang_Tunggakan' => 0.00,
            'Total_Tagihan'    => $tarif,
            'Sisa_Tagihan'     => 250000.00,
            'Status_Tagihan'   => 'Dicicil',
        ]);

        // Tagihan 3: Bulan ini (Belum Bayar, sisa 500k)
        $t3 = Tagihan::create([
            'Id_Sewa'          => $sewa->Id_Sewa,
            'Periode'          => Carbon::now()->format('Y-m'),
            'Jatuh_Tempo'      => Carbon::now()->day(25)->format('Y-m-d'),
            'Tarif_Sewa'       => $tarif,
            'Hutang_Tunggakan' => 0.00,
            'Total_Tagihan'    => $tarif,
            'Sisa_Tagihan'     => 500000.00,
            'Status_Tagihan'   => 'Belum Bayar',
        ]);

        // Record pembayaran cicilan (Total Bayar 750k -> 500k pelunasan t1 + 250k ke t2)
        Pembayaran::create([
            'Id_Tagihan'           => $t2->Id_Tagihan,
            'Tanggal_Bayar'        => now()->subDays(3)->toDateString(),
            'Total_Bayar'          => 750000.00,
            'Metode_Bayar'         => 'Transfer',
            'Bukti_Pembayaran'      => 'storage/bukti/fifo_partial_750k.png',
            'Verifikasi_Pembayaran'=> 'Diterima',
            'catatan_admin'        => 'Pembayaran cicilan Rp 750.000 dialokasikan via FIFO: Rp 500.000 melunasi tagihan tertua, Rp 250.000 menyicil tagihan berjalan.',
        ]);
    }

    private function createDisputeTenant(string $username, string $name, callable $getKiosk): void
    {
        $user = User::firstOrCreate(
            ['Username' => $username],
            [
                'Id_roles'    => 2,
                'Password'    => $this->passwordHash,
                'sub_role'    => 'tenant',
                'status_aktif'=> 1,
                'nama_lengkap'=> $name,
                'email'       => "{$username}@bunsay.id",
            ]
        );

        $pemilik = Pemilik::firstOrCreate(
            ['Id_User' => $user->Id_user],
            [
                'Nama'       => $name,
                'No_Telepon' => '0814' . fake()->numerify('########'),
                'No_KTP'     => fake()->numerify('6471############'),
                'Alamat'     => 'Plaza Bunsay',
            ]
        );

        if (Sewa::where('Id_Pemilik', $pemilik->Id_Pemilik)->exists()) {
            return;
        }

        $kios = $getKiosk();
        $kios->update(['Status' => 'Terisi']);

        $sewa = Sewa::create([
            'Id_Pemilik'     => $pemilik->Id_Pemilik,
            'Id_Kios'        => $kios->Id_Kios,
            'Jenis_Usaha'    => 'Toko Penjahit & Permak Pakaian',
            'Tanggal_Mulai'  => Carbon::now()->subMonths(2)->toDateString(),
            'Tanggal_Selesai'=> Carbon::now()->addYear()->toDateString(),
            'Keterangan'     => 'Sewa Aktif - Sanggahan Dispute Pembayaran',
            'Status'         => 'Aktif',
        ]);

        $t = Tagihan::create([
            'Id_Sewa'          => $sewa->Id_Sewa,
            'Periode'          => Carbon::now()->format('Y-m'),
            'Jatuh_Tempo'      => Carbon::now()->day(25)->format('Y-m-d'),
            'Tarif_Sewa'       => 600000.00,
            'Hutang_Tunggakan' => 0.00,
            'Total_Tagihan'    => 600000.00,
            'Sisa_Tagihan'     => 600000.00,
            'Status_Tagihan'   => 'Menunggu Verifikasi',
        ]);

        Pembayaran::create([
            'Id_Tagihan'           => $t->Id_Tagihan,
            'Tanggal_Bayar'        => now()->subDays(2)->toDateString(),
            'Total_Bayar'          => 600000.00,
            'Metode_Bayar'         => 'Transfer',
            'Bukti_Pembayaran'      => 'storage/bukti/bukti_buram.png',
            'Verifikasi_Pembayaran'=> 'Menunggu',
            'catatan_admin'        => 'Ditolak sebelumnya karena foto resi mesin ATM terpotong.',
            'teks_sanggahan'       => 'Saya sudah mengunggah ulang tangkapan layar m-banking yang jelas. Mohon bantu verifikasi ulang, terima kasih.',
            'bukti_sanggahan'      => 'storage/bukti/sanggahan_mbanking_clear.png',
        ]);
    }

    private function createMidtransTenant(string $username, string $name, callable $getKiosk): void
    {
        $user = User::firstOrCreate(
            ['Username' => $username],
            [
                'Id_roles'    => 2,
                'Password'    => $this->passwordHash,
                'sub_role'    => 'tenant',
                'status_aktif'=> 1,
                'nama_lengkap'=> $name,
                'email'       => "{$username}@bunsay.id",
            ]
        );

        $pemilik = Pemilik::firstOrCreate(
            ['Id_User' => $user->Id_user],
            [
                'Nama'       => $name,
                'No_Telepon' => '0815' . fake()->numerify('########'),
                'No_KTP'     => fake()->numerify('6471############'),
                'Alamat'     => 'Plaza Kebun Sayur',
            ]
        );

        if (Sewa::where('Id_Pemilik', $pemilik->Id_Pemilik)->exists()) {
            return;
        }

        $kios = $getKiosk();
        $kios->update(['Status' => 'Terisi']);

        $sewa = Sewa::create([
            'Id_Pemilik'     => $pemilik->Id_Pemilik,
            'Id_Kios'        => $kios->Id_Kios,
            'Jenis_Usaha'    => 'Batik Kaltim & Tenun Tradisional',
            'Tanggal_Mulai'  => Carbon::now()->subMonth()->toDateString(),
            'Tanggal_Selesai'=> Carbon::now()->addYear()->toDateString(),
            'Keterangan'     => 'Sewa Aktif - Auto-confirm Midtrans Payment',
            'Status'         => 'Aktif',
        ]);

        $t = Tagihan::create([
            'Id_Sewa'          => $sewa->Id_Sewa,
            'Periode'          => Carbon::now()->format('Y-m'),
            'Jatuh_Tempo'      => Carbon::now()->day(25)->format('Y-m-d'),
            'Tarif_Sewa'       => 850000.00,
            'Hutang_Tunggakan' => 0.00,
            'Total_Tagihan'    => 850000.00,
            'Sisa_Tagihan'     => 0.00,
            'Status_Tagihan'   => 'Lunas',
        ]);

        Pembayaran::create([
            'Id_Tagihan'           => $t->Id_Tagihan,
            'Tanggal_Bayar'        => now()->toDateString(),
            'Total_Bayar'          => 850000.00,
            'Metode_Bayar'         => 'Midtrans',
            'Bukti_Pembayaran'      => 'MIDTRANS-SETTLEMENT-TX998231',
            'Verifikasi_Pembayaran'=> 'Diterima',
            'catatan_admin'        => 'Pembayaran dikonfirmasi otomatis oleh Midtrans Webhook.',
        ]);
    }

    private function createMultiKiosTenant(string $username, string $name, callable $getKiosk, int $kioskCount): void
    {
        $user = User::firstOrCreate(
            ['Username' => $username],
            [
                'Id_roles'    => 2,
                'Password'    => $this->passwordHash,
                'sub_role'    => 'tenant',
                'status_aktif'=> 1,
                'nama_lengkap'=> $name,
                'email'       => "{$username}@bunsay.id",
            ]
        );

        $pemilik = Pemilik::firstOrCreate(
            ['Id_User' => $user->Id_user],
            [
                'Nama'       => $name,
                'No_Telepon' => '0816' . fake()->numerify('########'),
                'No_KTP'     => fake()->numerify('6471############'),
                'Alamat'     => 'Kompleks Ruko Kebun Sayur',
            ]
        );

        if (Sewa::where('Id_Pemilik', $pemilik->Id_Pemilik)->exists()) {
            return;
        }

        for ($k = 1; $k <= $kioskCount; $k++) {
            $kios = $getKiosk();
            $kios->update(['Status' => 'Terisi']);

            $sewa = Sewa::create([
                'Id_Pemilik'     => $pemilik->Id_Pemilik,
                'Id_Kios'        => $kios->Id_Kios,
                'Jenis_Usaha'    => "Grosir Pakaian Cabang {$k}",
                'Tanggal_Mulai'  => Carbon::now()->subMonths(3)->toDateString(),
                'Tanggal_Selesai'=> Carbon::now()->addYear()->toDateString(),
                'Keterangan'     => "Sewa Kios Ke-{$k} Pemilik Multi-Kios",
                'Status'         => 'Aktif',
            ]);

            $tarif = 900000.00;
            $t = Tagihan::create([
                'Id_Sewa'          => $sewa->Id_Sewa,
                'Periode'          => Carbon::now()->format('Y-m'),
                'Jatuh_Tempo'      => Carbon::now()->day(25)->format('Y-m-d'),
                'Tarif_Sewa'       => $tarif,
                'Hutang_Tunggakan' => 0.00,
                'Total_Tagihan'    => $tarif,
                'Sisa_Tagihan'     => 0.00,
                'Status_Tagihan'   => 'Lunas',
            ]);

            Pembayaran::create([
                'Id_Tagihan'           => $t->Id_Tagihan,
                'Tanggal_Bayar'        => now()->subDays(5)->toDateString(),
                'Total_Bayar'          => $tarif,
                'Metode_Bayar'         => 'Transfer',
                'Bukti_Pembayaran'      => "storage/bukti/multikios_{$k}.png",
                'Verifikasi_Pembayaran'=> 'Diterima',
            ]);
        }
    }

    private function createSoftDeletedTenant(string $username, string $name, callable $getKiosk): void
    {
        $user = User::firstOrCreate(
            ['Username' => $username],
            [
                'Id_roles'    => 2,
                'Password'    => $this->passwordHash,
                'sub_role'    => 'tenant',
                'status_aktif'=> 1,
                'nama_lengkap'=> $name,
                'email'       => "{$username}@bunsay.id",
            ]
        );

        $pemilik = Pemilik::firstOrCreate(
            ['Id_User' => $user->Id_user],
            [
                'Nama'       => $name,
                'No_Telepon' => '0817' . fake()->numerify('########'),
                'No_KTP'     => fake()->numerify('6471############'),
                'Alamat'     => 'Balikpapan Barat',
            ]
        );

        if (Sewa::where('Id_Pemilik', $pemilik->Id_Pemilik)->exists()) {
            return;
        }

        $kios = $getKiosk();
        // Sewa Selesai -> Kios Kosong! (Business Rule #5)
        $kios->update(['Status' => 'Kosong']);

        $startDate = Carbon::now()->subYear()->toDateString();
        $endDate   = Carbon::now()->subMonths(1)->toDateString();

        $sewa = Sewa::create([
            'Id_Pemilik'     => $pemilik->Id_Pemilik,
            'Id_Kios'        => $kios->Id_Kios,
            'Jenis_Usaha'    => 'Aksesoris & Souvenir (Masa Sewa Berakhir)',
            'Tanggal_Mulai'  => $startDate,
            'Tanggal_Selesai'=> $endDate,
            'Keterangan'     => 'Masa sewa telah selesai dan diarsipkan (Soft-delete)',
            'Status'         => 'Selesai',
        ]);

        // Historical bills remain in DB
        $t = Tagihan::create([
            'Id_Sewa'          => $sewa->Id_Sewa,
            'Periode'          => Carbon::now()->subMonths(2)->format('Y-m'),
            'Jatuh_Tempo'      => Carbon::now()->subMonths(2)->day(25)->format('Y-m-d'),
            'Tarif_Sewa'       => 500000.00,
            'Hutang_Tunggakan' => 0.00,
            'Total_Tagihan'    => 500000.00,
            'Sisa_Tagihan'     => 0.00,
            'Status_Tagihan'   => 'Lunas',
        ]);

        Pembayaran::create([
            'Id_Tagihan'           => $t->Id_Tagihan,
            'Tanggal_Bayar'        => Carbon::now()->subMonths(2)->day(15)->toDateString(),
            'Total_Bayar'          => 500000.00,
            'Metode_Bayar'         => 'Tunai',
            'Bukti_Pembayaran'      => 'storage/bukti/selesai_history.png',
            'Verifikasi_Pembayaran'=> 'Diterima',
        ]);
    }
}
