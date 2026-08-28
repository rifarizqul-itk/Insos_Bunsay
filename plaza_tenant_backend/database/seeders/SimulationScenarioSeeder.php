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
use App\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

/**
 * SimulationScenarioSeeder
 * 
 * Comprehensive Combinatorial Interactive Simulation Seeder for Insos Bunsay.
 * Specifically structured for a 10-Person Team E2E Verification & Interactive Simulation.
 * Covers 100% of system states:
 * - 3 Admin Roles (Superadmin, Cashier/Verifikator, Kiosk Officer/Auditor)
 * - 7 Tenant Personas (Ideal on-time, 1-mo overdue, 3-mo critical, FIFO partial payment,
 *   Dispute/Rebuttal sanggahan, Multi-kiosk cross-floor, Soft-deleted archive + 50-month stress test,
 *   plus 0-kiosk prospective onboarding and no-installment permission guards).
 */
class SimulationScenarioSeeder extends Seeder
{
    private string $adminPasswordHash;
    private string $tenantPasswordHash;

    public function __construct()
    {
        $this->adminPasswordHash  = Hash::make('admin123');
        $this->tenantPasswordHash = Hash::make('bunsay123');
    }

    public function run(): void
    {
        $this->command->info('🚀 [SIMULATION SEEDER] Initializing Insos Bunsay 10-Person Team Scenarios...');

        // 1. Ensure Roles exist
        Role::updateOrInsert(['Id_roles' => 1], ['Nama_role' => 'Admin']);
        Role::updateOrInsert(['Id_roles' => 2], ['Nama_role' => 'Tenant']);

        // 2. Helper to fetch or create standard physical kiosk
        $getOrCreateKiosk = function (string $noKios, int $lantai, string $ukuran = '4x4 m²', string $status = 'Kosong'): Kios {
            return Kios::firstOrCreate(
                ['No_Kios' => $noKios],
                [
                    'Lantai' => $lantai,
                    'Ukuran' => $ukuran,
                    'Status' => $status,
                ]
            );
        };

        // =========================================================================
        // SECTION 1: THE 3 ADMIN PARTICIPANTS (PERSON 1 - 3)
        // =========================================================================
        $this->command->info('👑 Seeding 3 Admin Simulation Accounts...');

        $allPermissions = json_encode([
            'verifikasi_pembayaran',
            'input_setoran',
            'ekspor_laporan',
            'kelola_kios',
            'kelola_admin',
            'lihat_audit_log'
        ]);

        // Permissions: Both non-superadmin admins have full payment access (verifikasi_pembayaran + input_setoran)
        $kasirPermissions = json_encode([
            'verifikasi_pembayaran',
            'input_setoran',
            'ekspor_laporan',
            'lihat_audit_log'
        ]);

        $petugasKiosPermissions = json_encode([
            'verifikasi_pembayaran',
            'input_setoran',
            'kelola_kios',
            'ekspor_laporan',
            'lihat_audit_log'
        ]);

        // Person 1: Patra - Superadmin Utama (Full master access)
        User::updateOrInsert(
            ['Username' => 'sim_superadmin'],
            [
                'Id_roles'     => 1,
                'Password'     => $this->adminPasswordHash,
                'nama_lengkap' => 'Patra (Superadmin Utama)',
                'email'        => 'patra.admin@bunsay.id',
                'sub_role'     => 'superadmin',
                'permissions'  => $allPermissions,
                'status_aktif' => 1,
            ]
        );

        // Person 2: Arman - Admin Kasir & Loket (Payment focus: Kasir + Verifikator)
        User::updateOrInsert(
            ['Username' => 'sim_admin_kasir'],
            [
                'Id_roles'     => 1,
                'Password'     => $this->adminPasswordHash,
                'nama_lengkap' => 'Arman (Admin Kasir & Loket)',
                'email'        => 'arman.kasir@bunsay.id',
                'sub_role'     => 'kasir',
                'permissions'  => $kasirPermissions,
                'status_aktif' => 1,
            ]
        );

        // Person 3: Rifa - Admin Petugas Kios & Pembayaran (Kiosk & Payment access)
        User::updateOrInsert(
            ['Username' => 'sim_admin_petugas'],
            [
                'Id_roles'     => 1,
                'Password'     => $this->adminPasswordHash,
                'nama_lengkap' => 'Rifa (Petugas Kios & Pembayaran)',
                'email'        => 'rifa.petugas@bunsay.id',
                'sub_role'     => 'petugas_kios',
                'permissions'  => $petugasKiosPermissions,
                'status_aktif' => 1,
            ]
        );

        // Deactivated Admin Account (Negative Testing)
        User::updateOrInsert(
            ['Username' => 'sim_admin_nonaktif'],
            [
                'Id_roles'     => 1,
                'Password'     => $this->adminPasswordHash,
                'nama_lengkap' => 'Eks Staf Non-Aktif (Negative Test)',
                'email'        => 'nonaktif.sim@bunsay.id',
                'sub_role'     => 'kasir',
                'permissions'  => $kasirPermissions,
                'status_aktif' => 0,
            ]
        );

        // =========================================================================
        // SECTION 2: THE 7 TENANT PARTICIPANTS & COMBINATORIAL PERSONAS (PERSON 4 - 10)
        // =========================================================================
        $this->command->info('🏪 Seeding 7 Tenant Participants & Combinatorial State Personas...');

        // -------------------------------------------------------------------------
        // PERSON 4: DAWWAS - TENANT A "THE IDEAL ON-TIME MERCHANT" + PROSPECT EDGE
        // -------------------------------------------------------------------------
        // Account 4A: Ideal Tenant (On-time, multi-method paid, clean ledger)
        $user4A = User::updateOrInsert(
            ['Username' => 'sim_tenant_ideal'],
            [
                'Id_roles'     => 2,
                'Password'     => $this->tenantPasswordHash,
                'sub_role'     => 'tenant',
                'status_aktif' => 1,
                'nama_lengkap' => 'Dawwas (Toko Pakaian Barokah)',
                'email'        => 'dawwas.ideal@bunsay.id',
            ]
        );
        $user4AObj = User::where('Username', 'sim_tenant_ideal')->first();

        $pemilik4A = Pemilik::updateOrInsert(
            ['Id_User' => $user4AObj->Id_user],
            [
                'Nama'            => 'Dawwas',
                'No_Telepon'      => '081255001122',
                'No_KTP'          => '6471011508800001',
                'Alamat'          => 'Jl. Pandan Sari No. 14, Balikpapan Barat',
                'izinkan_cicilan' => false,
            ]
        );
        $pemilik4AObj = Pemilik::where('Id_User', $user4AObj->Id_user)->first();

        $kios4A = $getOrCreateKiosk('A1-01', 1, '4x4 m²', 'Terisi');
        $kios4A->update(['Status' => 'Terisi']);

        $startDate4A = Carbon::now()->subMonths(5)->startOfMonth();
        $sewa4A = Sewa::updateOrInsert(
            ['Id_Pemilik' => $pemilik4AObj->Id_Pemilik, 'Id_Kios' => $kios4A->Id_Kios],
            [
                'Jenis_Usaha'     => 'Toko Pakaian Muslim & Batik Modern',
                'Tanggal_Mulai'   => $startDate4A->toDateString(),
                'Tanggal_Selesai' => $startDate4A->copy()->addYears(2)->toDateString(),
                'Tarif_Bulanan'   => 750000.00,
                'Keterangan'      => 'Sewa aktif jangka panjang - Pembayaran lancar tanpa tunggakan.',
                'Status'          => 'Aktif',
            ]
        );
        $sewa4AObj = Sewa::where('Id_Pemilik', $pemilik4AObj->Id_Pemilik)->where('Id_Kios', $kios4A->Id_Kios)->first();

        // Complete Legal Documents
        Dokumen::updateOrInsert(
            ['Id_Pemilik' => $pemilik4AObj->Id_Pemilik, 'Id_Kios' => $kios4A->Id_Kios, 'Jenis_Dokumen' => 'SP'],
            ['Nomor_Dokumen' => 'SP/BUNSAY/2026/0401', 'Tanggal' => $startDate4A->toDateString()]
        );
        Dokumen::updateOrInsert(
            ['Id_Pemilik' => $pemilik4AObj->Id_Pemilik, 'Id_Kios' => $kios4A->Id_Kios, 'Jenis_Dokumen' => 'PPJB'],
            ['Nomor_Dokumen' => 'PPJB/BUNSAY/2026/0401', 'Tanggal' => $startDate4A->copy()->addDays(3)->toDateString()]
        );
        Dokumen::updateOrInsert(
            ['Id_Pemilik' => $pemilik4AObj->Id_Pemilik, 'Id_Kios' => $kios4A->Id_Kios, 'Jenis_Dokumen' => 'AJB'],
            ['Nomor_Dokumen' => 'AJB/NOTARIS-BPN/2026/088', 'Tanggal' => $startDate4A->copy()->addDays(10)->toDateString()]
        );
        Dokumen::updateOrInsert(
            ['Id_Pemilik' => $pemilik4AObj->Id_Pemilik, 'Id_Kios' => $kios4A->Id_Kios, 'Jenis_Dokumen' => 'Sertifikat'],
            ['Nomor_Dokumen' => 'SERT-HGB-BUNSAY-0401', 'Tanggal' => $startDate4A->copy()->addDays(20)->toDateString()]
        );

        // 6 Months Invoices (All Paid: mix of Midtrans, Transfer, Tunai)
        for ($m = 0; $m < 6; $m++) {
            $mDate = $startDate4A->copy()->addMonths($m);
            $periode = $mDate->format('Y-m');
            $tagihan = Tagihan::updateOrInsert(
                ['Id_Sewa' => $sewa4AObj->Id_Sewa, 'Periode' => $periode],
                [
                    'Jatuh_Tempo'      => $mDate->copy()->day(12)->toDateString(),
                    'Tarif_Sewa'       => 750000.00,
                    'Hutang_Tunggakan' => 0.00,
                    'Total_Tagihan'    => 750000.00,
                    'Sisa_Tagihan'     => 0.00,
                    'Status_Tagihan'   => 'Lunas',
                ]
            );
            $tagihanObj = Tagihan::where('Id_Sewa', $sewa4AObj->Id_Sewa)->where('Periode', $periode)->first();

            $method = ($m % 3 === 0) ? 'Midtrans' : (($m % 2 === 0) ? 'Transfer' : 'Tunai');
            Pembayaran::updateOrInsert(
                ['Id_Tagihan' => $tagihanObj->Id_Tagihan],
                [
                    'Tanggal_Bayar'         => $mDate->copy()->day(8)->toDateString(),
                    'Total_Bayar'           => 750000.00,
                    'Metode_Bayar'          => $method,
                    'Bukti_Pembayaran'      => ($method === 'Midtrans') ? 'MIDTRANS-SETTLEMENT-TX401' . $m : 'storage/bukti/sim_ideal_' . $m . '.png',
                    'Verifikasi_Pembayaran' => 'Diterima',
                    'catatan_admin'         => ($method === 'Midtrans') ? 'Auto-settled by Midtrans Gateway' : 'Lunas tepat waktu sebelum jatuh tempo.',
                ]
            );
        }

        // Account 4B: Dawwas Edge - Calon Tenant Baru Onboarding
        $user4B = User::updateOrInsert(
            ['Username' => 'sim_tenant_baru'],
            [
                'Id_roles'     => 2,
                'Password'     => $this->tenantPasswordHash,
                'sub_role'     => 'tenant',
                'status_aktif' => 1,
                'nama_lengkap' => 'Dawwas (Calon Tenant Baru)',
                'email'        => 'dawwas.prospek@bunsay.id',
            ]
        );
        $user4BObj = User::where('Username', 'sim_tenant_baru')->first();
        $pemilik4B = Pemilik::updateOrInsert(
            ['Id_User' => $user4BObj->Id_user],
            [
                'Nama'            => 'Dawwas (Calon Baru)',
                'No_Telepon'      => '082199887766',
                'No_KTP'          => '6471022001950002', // 16 Digit NIK Wajib
                'Alamat'          => 'Jl. MT Haryono No. 89, Balikpapan',
                'izinkan_cicilan' => false,
            ]
        );
        $pemilik4BObj = Pemilik::where('Id_User', $user4BObj->Id_user)->first();

        $kios4B = $getOrCreateKiosk('D2-01', 2, '3x4 m²', 'Terisi');
        $kios4B->update(['Status' => 'Terisi']);

        $startDate4B = Carbon::now()->startOfMonth();
        $sewa4B = Sewa::updateOrInsert(
            ['Id_Pemilik' => $pemilik4BObj->Id_Pemilik, 'Id_Kios' => $kios4B->Id_Kios],
            [
                'Jenis_Usaha'     => 'Toko Busana & Aksesoris Pria (Pendaftaran Baru)',
                'Tanggal_Mulai'   => $startDate4B->toDateString(),
                'Tanggal_Selesai' => $startDate4B->copy()->addYear()->toDateString(),
                'Tarif_Bulanan'   => 750000.00,
                'Keterangan'      => 'Pendaftaran tenant baru oleh admin loket.',
                'Status'          => 'Aktif',
            ]
        );
        $sewa4BObj = Sewa::where('Id_Pemilik', $pemilik4BObj->Id_Pemilik)->where('Id_Kios', $kios4B->Id_Kios)->first();

        Tagihan::updateOrInsert(
            ['Id_Sewa' => $sewa4BObj->Id_Sewa, 'Periode' => $startDate4B->format('Y-m')],
            [
                'Jatuh_Tempo'      => $startDate4B->copy()->day(12)->toDateString(),
                'Tarif_Sewa'       => 750000.00,
                'Hutang_Tunggakan' => 0.00,
                'Total_Tagihan'    => 750000.00,
                'Sisa_Tagihan'     => 750000.00,
                'Status_Tagihan'   => 'Belum Bayar',
            ]
        );


        // -------------------------------------------------------------------------
        // PERSON 5: TIKA - TENANT B "1-MONTH OVERDUE (LISTRIK PERINGATAN)"
        // -------------------------------------------------------------------------
        $user5 = User::updateOrInsert(
            ['Username' => 'sim_tenant_tunggak1'],
            [
                'Id_roles'     => 2,
                'Password'     => $this->tenantPasswordHash,
                'sub_role'     => 'tenant',
                'status_aktif' => 1,
                'nama_lengkap' => 'Tika (Warung Sembako Berkah)',
                'email'        => 'tika.sembako@bunsay.id',
            ]
        );
        $user5Obj = User::where('Username', 'sim_tenant_tunggak1')->first();

        $pemilik5 = Pemilik::updateOrInsert(
            ['Id_User' => $user5Obj->Id_user],
            [
                'Nama'            => 'Tika',
                'No_Telepon'      => '081347890123',
                'No_KTP'          => '6471016503750003',
                'Alamat'          => 'Jl. Baru Kebun Sayur Gang 5 No. 3',
                'izinkan_cicilan' => false,
            ]
        );
        $pemilik5Obj = Pemilik::where('Id_User', $user5Obj->Id_user)->first();

        $kios5 = $getOrCreateKiosk('B1-05', 1, '4x4 m²', 'Terisi');
        $kios5->update(['Status' => 'Terisi']);

        $startDate5 = Carbon::now()->subMonths(3)->startOfMonth();
        $sewa5 = Sewa::updateOrInsert(
            ['Id_Pemilik' => $pemilik5Obj->Id_Pemilik, 'Id_Kios' => $kios5->Id_Kios],
            [
                'Jenis_Usaha'     => 'Warung Sembako & Kebutuhan Pokok',
                'Tanggal_Mulai'   => $startDate5->toDateString(),
                'Tanggal_Selesai' => $startDate5->copy()->addYear()->toDateString(),
                'Tarif_Bulanan'   => 800000.00,
                'Keterangan'      => 'Sewa aktif unit toko lantai 1 blok B',
                'Status'          => 'Aktif',
            ]
        );
        $sewa5Obj = Sewa::where('Id_Pemilik', $pemilik5Obj->Id_Pemilik)->where('Id_Kios', $kios5->Id_Kios)->first();

        // Legal Docs: SP & PPJB
        Dokumen::updateOrInsert(
            ['Id_Pemilik' => $pemilik5Obj->Id_Pemilik, 'Id_Kios' => $kios5->Id_Kios, 'Jenis_Dokumen' => 'SP'],
            ['Nomor_Dokumen' => 'SP/BUNSAY/2026/0505', 'Tanggal' => $startDate5->toDateString()]
        );
        Dokumen::updateOrInsert(
            ['Id_Pemilik' => $pemilik5Obj->Id_Pemilik, 'Id_Kios' => $kios5->Id_Kios, 'Jenis_Dokumen' => 'PPJB'],
            ['Nomor_Dokumen' => 'PPJB/BUNSAY/2026/0505', 'Tanggal' => $startDate5->copy()->addDays(5)->toDateString()]
        );

        // Previous 3 months paid
        for ($m = 0; $m < 3; $m++) {
            $mDate = $startDate5->copy()->addMonths($m);
            $periode = $mDate->format('Y-m');
            $t = Tagihan::updateOrInsert(
                ['Id_Sewa' => $sewa5Obj->Id_Sewa, 'Periode' => $periode],
                [
                    'Jatuh_Tempo'      => $mDate->copy()->day(12)->toDateString(),
                    'Tarif_Sewa'       => 800000.00,
                    'Hutang_Tunggakan' => 0.00,
                    'Total_Tagihan'    => 800000.00,
                    'Sisa_Tagihan'     => 0.00,
                    'Status_Tagihan'   => 'Lunas',
                ]
            );
            $tObj = Tagihan::where('Id_Sewa', $sewa5Obj->Id_Sewa)->where('Periode', $periode)->first();
            Pembayaran::updateOrInsert(
                ['Id_Tagihan' => $tObj->Id_Tagihan],
                [
                    'Tanggal_Bayar'         => $mDate->copy()->day(10)->toDateString(),
                    'Total_Bayar'           => 800000.00,
                    'Metode_Bayar'          => 'Transfer',
                    'Bukti_Pembayaran'      => 'storage/bukti/sim_tunggak1_paid_' . $m . '.png',
                    'Verifikasi_Pembayaran' => 'Diterima',
                ]
            );
        }

        // Current Month: Overdue (Belum Bayar > 12th)
        $curMonthDate5 = Carbon::now()->startOfMonth();
        Tagihan::updateOrInsert(
            ['Id_Sewa' => $sewa5Obj->Id_Sewa, 'Periode' => $curMonthDate5->format('Y-m')],
            [
                'Jatuh_Tempo'      => $curMonthDate5->copy()->day(12)->toDateString(),
                'Tarif_Sewa'       => 800000.00,
                'Hutang_Tunggakan' => 0.00,
                'Total_Tagihan'    => 800000.00,
                'Sisa_Tagihan'     => 800000.00,
                'Status_Tagihan'   => 'Belum Bayar',
            ]
        );


        // -------------------------------------------------------------------------
        // PERSON 6: DHIA - TENANT C "3-MONTH CRITICAL ARREARS (SEGEL / SP-3)"
        // -------------------------------------------------------------------------
        $user6 = User::updateOrInsert(
            ['Username' => 'sim_tenant_kritis'],
            [
                'Id_roles'     => 2,
                'Password'     => $this->tenantPasswordHash,
                'sub_role'     => 'tenant',
                'status_aktif' => 1,
                'nama_lengkap' => 'Dhia (Servis HP & Elektronik)',
                'email'        => 'dhia.kritis@bunsay.id',
            ]
        );
        $user6Obj = User::where('Username', 'sim_tenant_kritis')->first();

        $pemilik6 = Pemilik::updateOrInsert(
            ['Id_User' => $user6Obj->Id_user],
            [
                'Nama'            => 'Dhia',
                'No_Telepon'      => '085233445566',
                'No_KTP'          => '6471011006880004',
                'Alamat'          => 'Jl. Letjen Suprapto No. 55, Balikpapan',
                'izinkan_cicilan' => false,
            ]
        );
        $pemilik6Obj = Pemilik::where('Id_User', $user6Obj->Id_user)->first();

        $kios6 = $getOrCreateKiosk('C1-12', 1, '4x5 m²', 'Terisi');
        $kios6->update(['Status' => 'Terisi']);

        $startDate6 = Carbon::now()->subMonths(5)->startOfMonth();
        $sewa6 = Sewa::updateOrInsert(
            ['Id_Pemilik' => $pemilik6Obj->Id_Pemilik, 'Id_Kios' => $kios6->Id_Kios],
            [
                'Jenis_Usaha'     => 'Servis HP & Toko Aksesoris Elektronik',
                'Tanggal_Mulai'   => $startDate6->toDateString(),
                'Tanggal_Selesai' => $startDate6->copy()->addYear()->toDateString(),
                'Tarif_Bulanan'   => 750000.00,
                'Keterangan'      => 'Sewa aktif - Menunggak 3 bulan berturut-turut. Status SP-3 Peringatan Penyegelan.',
                'Status'          => 'Aktif',
            ]
        );
        $sewa6Obj = Sewa::where('Id_Pemilik', $pemilik6Obj->Id_Pemilik)->where('Id_Kios', $kios6->Id_Kios)->first();

        // Month 1 & 2 Paid
        for ($m = 0; $m < 2; $m++) {
            $mDate = $startDate6->copy()->addMonths($m);
            $t = Tagihan::updateOrInsert(
                ['Id_Sewa' => $sewa6Obj->Id_Sewa, 'Periode' => $mDate->format('Y-m')],
                [
                    'Jatuh_Tempo'      => $mDate->copy()->day(12)->toDateString(),
                    'Tarif_Sewa'       => 750000.00,
                    'Hutang_Tunggakan' => 0.00,
                    'Total_Tagihan'    => 750000.00,
                    'Sisa_Tagihan'     => 0.00,
                    'Status_Tagihan'   => 'Lunas',
                ]
            );
            $tObj = Tagihan::where('Id_Sewa', $sewa6Obj->Id_Sewa)->where('Periode', $mDate->format('Y-m'))->first();
            Pembayaran::updateOrInsert(
                ['Id_Tagihan' => $tObj->Id_Tagihan],
                [
                    'Tanggal_Bayar'         => $mDate->copy()->day(11)->toDateString(),
                    'Total_Bayar'           => 750000.00,
                    'Metode_Bayar'          => 'Tunai',
                    'Bukti_Pembayaran'      => 'storage/bukti/kritis_paid_' . $m . '.png',
                    'Verifikasi_Pembayaran' => 'Diterima',
                ]
            );
        }

        // Month 3 (2 months ago): Belum Bayar (Tunggakan 1)
        $m3Date = $startDate6->copy()->addMonths(2);
        Tagihan::updateOrInsert(
            ['Id_Sewa' => $sewa6Obj->Id_Sewa, 'Periode' => $m3Date->format('Y-m')],
            [
                'Jatuh_Tempo'      => $m3Date->copy()->day(12)->toDateString(),
                'Tarif_Sewa'       => 750000.00,
                'Hutang_Tunggakan' => 0.00,
                'Total_Tagihan'    => 750000.00,
                'Sisa_Tagihan'     => 750000.00,
                'Status_Tagihan'   => 'Belum Bayar',
            ]
        );

        // Month 4 (1 month ago): Belum Bayar (Tunggakan 2)
        $m4Date = $startDate6->copy()->addMonths(3);
        Tagihan::updateOrInsert(
            ['Id_Sewa' => $sewa6Obj->Id_Sewa, 'Periode' => $m4Date->format('Y-m')],
            [
                'Jatuh_Tempo'      => $m4Date->copy()->day(12)->toDateString(),
                'Tarif_Sewa'       => 750000.00,
                'Hutang_Tunggakan' => 750000.00,
                'Total_Tagihan'    => 1500000.00,
                'Sisa_Tagihan'     => 750000.00,
                'Status_Tagihan'   => 'Belum Bayar',
            ]
        );

        // Month 5 (Current month): Belum Bayar (Tunggakan 3 - Kritis)
        $m5Date = $startDate6->copy()->addMonths(4);
        Tagihan::updateOrInsert(
            ['Id_Sewa' => $sewa6Obj->Id_Sewa, 'Periode' => $m5Date->format('Y-m')],
            [
                'Jatuh_Tempo'      => $m5Date->copy()->day(12)->toDateString(),
                'Tarif_Sewa'       => 750000.00,
                'Hutang_Tunggakan' => 1500000.00,
                'Total_Tagihan'    => 2250000.00,
                'Sisa_Tagihan'     => 750000.00,
                'Status_Tagihan'   => 'Belum Bayar',
            ]
        );


        // -------------------------------------------------------------------------
        // PERSON 7: INDRIANI - TENANT D "PARTIAL PAYMENT (FIFO CICILAN)" + NO-CICIL EDGE
        // -------------------------------------------------------------------------
        $user7 = User::updateOrInsert(
            ['Username' => 'sim_tenant_cicil'],
            [
                'Id_roles'     => 2,
                'Password'     => $this->tenantPasswordHash,
                'sub_role'     => 'tenant',
                'status_aktif' => 1,
                'nama_lengkap' => 'Indriani (Kedai Kopi & Kuliner Nusantara)',
                'email'        => 'indriani.cicil@bunsay.id',
            ]
        );
        $user7Obj = User::where('Username', 'sim_tenant_cicil')->first();

        $pemilik7 = Pemilik::updateOrInsert(
            ['Id_User' => $user7Obj->Id_user],
            [
                'Nama'            => 'Indriani',
                'No_Telepon'      => '081399112233',
                'No_KTP'          => '6471015011780005',
                'Alamat'          => 'Pujasera Plaza Kebun Sayur',
                'izinkan_cicilan' => true, // ENABLED CICILAN PERMISSION
            ]
        );
        $pemilik7Obj = Pemilik::where('Id_User', $user7Obj->Id_user)->first();

        $kios7 = $getOrCreateKiosk('D1-08', 1, '3x3 m²', 'Terisi');
        $kios7->update(['Status' => 'Terisi']);

        $startDate7 = Carbon::now()->subMonths(2)->startOfMonth();
        $sewa7 = Sewa::updateOrInsert(
            ['Id_Pemilik' => $pemilik7Obj->Id_Pemilik, 'Id_Kios' => $kios7->Id_Kios],
            [
                'Jenis_Usaha'     => 'Kedai Minuman Kopi & Teh Tradisional',
                'Tanggal_Mulai'   => $startDate7->toDateString(),
                'Tanggal_Selesai' => $startDate7->copy()->addYear()->toDateString(),
                'Tarif_Bulanan'   => 500000.00,
                'Keterangan'      => 'Sewa Aktif - Akun resmi uji coba Pembayaran Cicilan Parsial FIFO.',
                'Status'          => 'Aktif',
            ]
        );
        $sewa7Obj = Sewa::where('Id_Pemilik', $pemilik7Obj->Id_Pemilik)->where('Id_Kios', $kios7->Id_Kios)->first();

        // Invoice 1: 2 months ago (Lunas via FIFO)
        $t7_1 = Tagihan::updateOrInsert(
            ['Id_Sewa' => $sewa7Obj->Id_Sewa, 'Periode' => $startDate7->format('Y-m')],
            [
                'Jatuh_Tempo'      => $startDate7->copy()->day(12)->toDateString(),
                'Tarif_Sewa'       => 500000.00,
                'Hutang_Tunggakan' => 0.00,
                'Total_Tagihan'    => 500000.00,
                'Sisa_Tagihan'     => 0.00,
                'Status_Tagihan'   => 'Lunas',
            ]
        );

        // Invoice 2: 1 month ago (Dicicil, sisa 250k)
        $t7_2Date = $startDate7->copy()->addMonth();
        $t7_2 = Tagihan::updateOrInsert(
            ['Id_Sewa' => $sewa7Obj->Id_Sewa, 'Periode' => $t7_2Date->format('Y-m')],
            [
                'Jatuh_Tempo'      => $t7_2Date->copy()->day(12)->toDateString(),
                'Tarif_Sewa'       => 500000.00,
                'Hutang_Tunggakan' => 0.00,
                'Total_Tagihan'    => 500000.00,
                'Sisa_Tagihan'     => 250000.00,
                'Status_Tagihan'   => 'Dicicil',
            ]
        );
        $t7_2Obj = Tagihan::where('Id_Sewa', $sewa7Obj->Id_Sewa)->where('Periode', $t7_2Date->format('Y-m'))->first();

        // Record FIFO partial payment
        Pembayaran::updateOrInsert(
            ['Id_Tagihan' => $t7_2Obj->Id_Tagihan],
            [
                'Tanggal_Bayar'         => now()->subDays(4)->toDateString(),
                'Total_Bayar'           => 750000.00,
                'Metode_Bayar'          => 'Transfer',
                'Bukti_Pembayaran'      => 'storage/bukti/sim_fifo_750k.png',
                'Verifikasi_Pembayaran' => 'Diterima',
                'catatan_admin'         => 'Setoran cicilan Rp 750.000: Rp 500.000 melunasi tagihan tertua, Rp 250.000 menyicil tagihan bulan kemarin (Sisa Rp 250.000).',
            ]
        );

        // Invoice 3: Current Month (Belum Bayar, sisa 500k)
        $t7_3Date = Carbon::now()->startOfMonth();
        Tagihan::updateOrInsert(
            ['Id_Sewa' => $sewa7Obj->Id_Sewa, 'Periode' => $t7_3Date->format('Y-m')],
            [
                'Jatuh_Tempo'      => $t7_3Date->copy()->day(12)->toDateString(),
                'Tarif_Sewa'       => 500000.00,
                'Hutang_Tunggakan' => 250000.00,
                'Total_Tagihan'    => 750000.00,
                'Sisa_Tagihan'     => 500000.00,
                'Status_Tagihan'   => 'Belum Bayar',
            ]
        );

        // Account 7B: Indriani Edge (Disallowed Cicilan Permission)
        $user7B = User::updateOrInsert(
            ['Username' => 'sim_tenant_nocicil'],
            [
                'Id_roles'     => 2,
                'Password'     => $this->tenantPasswordHash,
                'sub_role'     => 'tenant',
                'status_aktif' => 1,
                'nama_lengkap' => 'Indriani (Edge - Tanpa Izin Cicil)',
                'email'        => 'indriani.nocicil@bunsay.id',
            ]
        );
        $user7BObj = User::where('Username', 'sim_tenant_nocicil')->first();
        Pemilik::updateOrInsert(
            ['Id_User' => $user7BObj->Id_user],
            [
                'Nama'            => 'Indriani (Non-Cicil)',
                'No_Telepon'      => '081288776655',
                'No_KTP'          => '6471011202820006',
                'Alamat'          => 'Jl. Soekarno Hatta Km 2',
                'izinkan_cicilan' => false, // DISALLOWED
            ]
        );


        // -------------------------------------------------------------------------
        // PERSON 8: ELSYA - TENANT E "DISPUTE & REBUTTAL (SANGGAHAN) CHALLENGER"
        // -------------------------------------------------------------------------
        $user8 = User::updateOrInsert(
            ['Username' => 'sim_tenant_dispute'],
            [
                'Id_roles'     => 2,
                'Password'     => $this->tenantPasswordHash,
                'sub_role'     => 'tenant',
                'status_aktif' => 1,
                'nama_lengkap' => 'Elsya (Toko Busana & Penjahit)',
                'email'        => 'elsya.dispute@bunsay.id',
            ]
        );
        $user8Obj = User::where('Username', 'sim_tenant_dispute')->first();

        $pemilik8 = Pemilik::updateOrInsert(
            ['Id_User' => $user8Obj->Id_user],
            [
                'Nama'            => 'Elsya',
                'No_Telepon'      => '081344556677',
                'No_KTP'          => '6471011809760007',
                'Alamat'          => 'Plaza Kebun Sayur Lantai 2 Blok E',
                'izinkan_cicilan' => false,
            ]
        );
        $pemilik8Obj = Pemilik::where('Id_User', $user8Obj->Id_user)->first();

        $kios8 = $getOrCreateKiosk('E2-03', 2, '4x4 m²', 'Terisi');
        $kios8->update(['Status' => 'Terisi']);

        $startDate8 = Carbon::now()->subMonth()->startOfMonth();
        $sewa8 = Sewa::updateOrInsert(
            ['Id_Pemilik' => $pemilik8Obj->Id_Pemilik, 'Id_Kios' => $kios8->Id_Kios],
            [
                'Jenis_Usaha'     => 'Penjahit & Permak Pakaian Tradisional',
                'Tanggal_Mulai'   => $startDate8->toDateString(),
                'Tanggal_Selesai' => $startDate8->copy()->addYear()->toDateString(),
                'Tarif_Bulanan'   => 600000.00,
                'Keterangan'      => 'Sewa Aktif - Simulasi Siklus Sanggahan & Dispute Pembayaran.',
                'Status'          => 'Aktif',
            ]
        );
        $sewa8Obj = Sewa::where('Id_Pemilik', $pemilik8Obj->Id_Pemilik)->where('Id_Kios', $kios8->Id_Kios)->first();

        $t8Date = Carbon::now()->startOfMonth();
        $t8 = Tagihan::updateOrInsert(
            ['Id_Sewa' => $sewa8Obj->Id_Sewa, 'Periode' => $t8Date->format('Y-m')],
            [
                'Jatuh_Tempo'      => $t8Date->copy()->day(12)->toDateString(),
                'Tarif_Sewa'       => 600000.00,
                'Hutang_Tunggakan' => 0.00,
                'Total_Tagihan'    => 600000.00,
                'Sisa_Tagihan'     => 600000.00,
                'Status_Tagihan'   => 'Menunggu Verifikasi',
            ]
        );
        $t8Obj = Tagihan::where('Id_Sewa', $sewa8Obj->Id_Sewa)->where('Periode', $t8Date->format('Y-m'))->first();

        // Payment with Rejected Note + Tenant Sanggahan Rebuttal attached
        Pembayaran::updateOrInsert(
            ['Id_Tagihan' => $t8Obj->Id_Tagihan],
            [
                'Tanggal_Bayar'         => now()->subDays(2)->toDateString(),
                'Total_Bayar'           => 600000.00,
                'Metode_Bayar'          => 'Transfer',
                'Bukti_Pembayaran'      => 'storage/bukti/sim_bukti_buram_rejected.png',
                'Verifikasi_Pembayaran' => 'Menunggu',
                'catatan_admin'         => 'Bukti pembayaran sebelumnya ditolak: foto struk ATM terpotong dan nomor referensi tidak terbaca.',
                'teks_sanggahan'        => 'Mohon maaf, berikut saya lampirkan bukti mutasi mobile banking yang jelas dan berstempel lunas. Mohon verifikasi ulang.',
                'bukti_sanggahan'       => 'storage/bukti/sim_sanggahan_clear_mbanking.png',
            ]
        );


        // -------------------------------------------------------------------------
        // PERSON 9: YAEL - TENANT F "CONGLOMERATE MULTI-KIOSK TENANT (CROSS-FLOOR)"
        // -------------------------------------------------------------------------
        $user9 = User::updateOrInsert(
            ['Username' => 'sim_tenant_multikios'],
            [
                'Id_roles'     => 2,
                'Password'     => $this->tenantPasswordHash,
                'sub_role'     => 'tenant',
                'status_aktif' => 1,
                'nama_lengkap' => 'Yael (Grosir Tekstil & Fashion)',
                'email'        => 'yael.multikios@bunsay.id',
            ]
        );
        $user9Obj = User::where('Username', 'sim_tenant_multikios')->first();

        $pemilik9 = Pemilik::updateOrInsert(
            ['Id_User' => $user9Obj->Id_user],
            [
                'Nama'            => 'Yael',
                'No_Telepon'      => '081277889900',
                'No_KTP'          => '6471012504790008',
                'Alamat'          => 'Kompleks Ruko Sentra Timur Balikpapan',
                'izinkan_cicilan' => false,
            ]
        );
        $pemilik9Obj = Pemilik::where('Id_User', $user9Obj->Id_user)->first();

        $multiKiosks = [
            ['no' => 'F1-15', 'lantai' => 1, 'ukuran' => '5x6 m²', 'tarif' => 1000000.00, 'nama' => 'Grosir Tekstil Utama (Lantai 1)'],
            ['no' => 'F2-08', 'lantai' => 2, 'ukuran' => '4x4 m²', 'tarif' => 800000.00,  'nama' => 'Showroom Pakaian Wanita (Lantai 2)'],
            ['no' => 'G2-11', 'lantai' => 2, 'ukuran' => '3x4 m²', 'tarif' => 600000.00,  'nama' => 'Gudang & Aksesoris Busana (Lantai 2)'],
        ];

        foreach ($multiKiosks as $mk) {
            $kObj = $getOrCreateKiosk($mk['no'], $mk['lantai'], $mk['ukuran'], 'Terisi');
            $kObj->update(['Status' => 'Terisi']);

            $startDate9 = Carbon::now()->subMonths(2)->startOfMonth();
            $sewa9 = Sewa::updateOrInsert(
                ['Id_Pemilik' => $pemilik9Obj->Id_Pemilik, 'Id_Kios' => $kObj->Id_Kios],
                [
                    'Jenis_Usaha'     => $mk['nama'],
                    'Tanggal_Mulai'   => $startDate9->toDateString(),
                    'Tanggal_Selesai' => $startDate9->copy()->addYears(2)->toDateString(),
                    'Tarif_Bulanan'   => $mk['tarif'],
                    'Keterangan'      => "Unit multi-kios pemilik Yael ({$mk['no']}).",
                    'Status'          => 'Aktif',
                ]
            );
            $sewa9Obj = Sewa::where('Id_Pemilik', $pemilik9Obj->Id_Pemilik)->where('Id_Kios', $kObj->Id_Kios)->first();

            // Create current month invoice
            $t9 = Tagihan::updateOrInsert(
                ['Id_Sewa' => $sewa9Obj->Id_Sewa, 'Periode' => Carbon::now()->format('Y-m')],
                [
                    'Jatuh_Tempo'      => Carbon::now()->day(12)->toDateString(),
                    'Tarif_Sewa'       => $mk['tarif'],
                    'Hutang_Tunggakan' => 0.00,
                    'Total_Tagihan'    => $mk['tarif'],
                    'Sisa_Tagihan'     => 0.00,
                    'Status_Tagihan'   => 'Lunas',
                ]
            );
            $t9Obj = Tagihan::where('Id_Sewa', $sewa9Obj->Id_Sewa)->where('Periode', Carbon::now()->format('Y-m'))->first();

            Pembayaran::updateOrInsert(
                ['Id_Tagihan' => $t9Obj->Id_Tagihan],
                [
                    'Tanggal_Bayar'         => now()->subDays(5)->toDateString(),
                    'Total_Bayar'           => $mk['tarif'],
                    'Metode_Bayar'          => 'Transfer',
                    'Bukti_Pembayaran'      => "storage/bukti/sim_multikios_{$mk['no']}.png",
                    'Verifikasi_Pembayaran' => 'Diterima',
                    'catatan_admin'         => "Pembayaran lunas unit {$mk['no']}.",
                ]
            );
        }


        // -------------------------------------------------------------------------
        // PERSON 10: CLARA - TENANT G "ARCHIVED LEASE (SOFT-DELETE) & STRESS 50 INVOICES"
        // -------------------------------------------------------------------------
        // Account 10A: Soft-deleted / Completed Lease Tenant
        $user10A = User::updateOrInsert(
            ['Username' => 'sim_tenant_selesai'],
            [
                'Id_roles'     => 2,
                'Password'     => $this->tenantPasswordHash,
                'sub_role'     => 'tenant',
                'status_aktif' => 1,
                'nama_lengkap' => 'Clara (Eks Tenant Aksesoris)',
                'email'        => 'clara.selesai@bunsay.id',
            ]
        );
        $user10AObj = User::where('Username', 'sim_tenant_selesai')->first();

        $pemilik10A = Pemilik::updateOrInsert(
            ['Id_User' => $user10AObj->Id_user],
            [
                'Nama'            => 'Clara',
                'No_Telepon'      => '081366778899',
                'No_KTP'          => '6471010307770009',
                'Alamat'          => 'Balikpapan Barat (Eks Tenant Bunsay)',
                'izinkan_cicilan' => false,
            ]
        );
        $pemilik10AObj = Pemilik::where('Id_User', $user10AObj->Id_user)->first();

        $kios10A = $getOrCreateKiosk('H1-20', 1, '3x4 m²', 'Kosong');
        $kios10A->update(['Status' => 'Kosong']); // Business rule: Sewa Selesai => Kios Kosong!

        $sewa10A = Sewa::updateOrInsert(
            ['Id_Pemilik' => $pemilik10AObj->Id_Pemilik, 'Id_Kios' => $kios10A->Id_Kios],
            [
                'Jenis_Usaha'     => 'Aksesoris & Souvenir Tradisional (Masa Sewa Berakhir)',
                'Tanggal_Mulai'   => Carbon::now()->subYear()->toDateString(),
                'Tanggal_Selesai' => Carbon::now()->subMonths(1)->toDateString(),
                'Tarif_Bulanan'   => 500000.00,
                'Keterangan'      => 'Masa sewa telah selesai dan diarsipkan (Soft-deleted). Kios kembali Kosong.',
                'Status'          => 'Selesai',
            ]
        );
        $sewa10AObj = Sewa::where('Id_Pemilik', $pemilik10AObj->Id_Pemilik)->where('Id_Kios', $kios10A->Id_Kios)->first();

        // Archived historical bills remain intact
        for ($m = 1; $m <= 3; $m++) {
            $mDate = Carbon::now()->subMonths($m + 1);
            $t = Tagihan::updateOrInsert(
                ['Id_Sewa' => $sewa10AObj->Id_Sewa, 'Periode' => $mDate->format('Y-m')],
                [
                    'Jatuh_Tempo'      => $mDate->copy()->day(12)->toDateString(),
                    'Tarif_Sewa'       => 500000.00,
                    'Hutang_Tunggakan' => 0.00,
                    'Total_Tagihan'    => 500000.00,
                    'Sisa_Tagihan'     => 0.00,
                    'Status_Tagihan'   => 'Lunas',
                ]
            );
            $tObj = Tagihan::where('Id_Sewa', $sewa10AObj->Id_Sewa)->where('Periode', $mDate->format('Y-m'))->first();
            Pembayaran::updateOrInsert(
                ['Id_Tagihan' => $tObj->Id_Tagihan],
                [
                    'Tanggal_Bayar'         => $mDate->copy()->day(10)->toDateString(),
                    'Total_Bayar'           => 500000.00,
                    'Metode_Bayar'          => 'Tunai',
                    'Bukti_Pembayaran'      => 'storage/bukti/sim_selesai_archived_' . $m . '.png',
                    'Verifikasi_Pembayaran' => 'Diterima',
                ]
            );
        }

        // Account 10B: Clara Stress Test 50 Invoices
        $user10B = User::updateOrInsert(
            ['Username' => 'sim_tenant_stress50'],
            [
                'Id_roles'     => 2,
                'Password'     => $this->tenantPasswordHash,
                'sub_role'     => 'tenant',
                'status_aktif' => 1,
                'nama_lengkap' => 'Clara (CV Megah 50 Invoices)',
                'email'        => 'clara.stress@bunsay.id',
            ]
        );
        $user10BObj = User::where('Username', 'sim_tenant_stress50')->first();

        $pemilik10B = Pemilik::updateOrInsert(
            ['Id_User' => $user10BObj->Id_user],
            [
                'Nama'            => 'Clara (CV Megah)',
                'No_Telepon'      => '081211223344',
                'No_KTP'          => '6471019908700010',
                'Alamat'          => 'Kavling Utama Lantai 1 Blok G',
                'izinkan_cicilan' => false,
            ]
        );
        $pemilik10BObj = Pemilik::where('Id_User', $user10BObj->Id_user)->first();

        $kios10B = $getOrCreateKiosk('G1-01', 1, '5x6 m²', 'Terisi');
        $kios10B->update(['Status' => 'Terisi']);

        $startDate10B = Carbon::now()->subMonths(49)->startOfMonth();
        $sewa10B = Sewa::updateOrInsert(
            ['Id_Pemilik' => $pemilik10BObj->Id_Pemilik, 'Id_Kios' => $kios10B->Id_Kios],
            [
                'Jenis_Usaha'     => 'Sentra Kerajinan & Cenderamata Legendaris Kaltim (Stress Test 50 Invoices)',
                'Tanggal_Mulai'   => $startDate10B->toDateString(),
                'Tanggal_Selesai' => Carbon::now()->addYears(3)->toDateString(),
                'Tarif_Bulanan'   => 1200000.00,
                'Keterangan'      => 'Sewa aktif jangka panjang untuk stress testing pagination dan agregasi keuangan.',
                'Status'          => 'Aktif',
            ]
        );
        $sewa10BObj = Sewa::where('Id_Pemilik', $pemilik10BObj->Id_Pemilik)->where('Id_Kios', $kios10B->Id_Kios)->first();

        for ($i = 0; $i < 50; $i++) {
            $dt = $startDate10B->copy()->addMonths($i);
            $isCurrent = ($i === 49);

            $t = Tagihan::updateOrInsert(
                ['Id_Sewa' => $sewa10BObj->Id_Sewa, 'Periode' => $dt->format('Y-m')],
                [
                    'Jatuh_Tempo'      => $dt->copy()->day(12)->toDateString(),
                    'Tarif_Sewa'       => 1200000.00,
                    'Hutang_Tunggakan' => 0.00,
                    'Total_Tagihan'    => 1200000.00,
                    'Sisa_Tagihan'     => $isCurrent ? 1200000.00 : 0.00,
                    'Status_Tagihan'   => $isCurrent ? 'Belum Bayar' : 'Lunas',
                ]
            );
            $tObj = Tagihan::where('Id_Sewa', $sewa10BObj->Id_Sewa)->where('Periode', $dt->format('Y-m'))->first();

            if (!$isCurrent) {
                $payMethod = ($i % 3 === 0) ? 'Midtrans' : (($i % 2 === 0) ? 'Transfer' : 'Tunai');
                Pembayaran::updateOrInsert(
                    ['Id_Tagihan' => $tObj->Id_Tagihan],
                    [
                        'Tanggal_Bayar'         => $dt->copy()->day(7)->toDateString(),
                        'Total_Bayar'           => 1200000.00,
                        'Metode_Bayar'          => $payMethod,
                        'Bukti_Pembayaran'      => "storage/bukti/stress50_receipt_{$i}.png",
                        'Verifikasi_Pembayaran' => 'Diterima',
                        'catatan_admin'         => 'Settled automatically',
                    ]
                );
            }
        }


        // =========================================================================
        // SECTION 3: REAL-TIME NOTIFICATIONS & SYSTEM AUDIT ACTIVITY LOGS
        // =========================================================================
        $this->command->info('🔔 Seeding Notifications & Audit Trail Logs...');

        // Admin Notifications
        Notification::send(
            'admin',
            null,
            'Antrean Bukti Transfer Menunggu Verifikasi',
            'Terdapat bukti transfer dari tenant Elsya yang mengajukan sanggahan dan menunggu verifikasi loket.',
            'warning',
            '/admin/verifikasi-bukti'
        );

        Notification::send(
            'admin',
            null,
            'Laporan Retribusi Bulanan Siap Ekspor',
            'Rekapitulasi keuangan seluruh blok kios telah dihitung dan siap diunduh dalam format Excel (.xlsx).',
            'success',
            '/admin/ekspor'
        );

        // Tenant Notifications
        Notification::send(
            'tenant',
            $user5Obj->Id_user,
            'Peringatan Jatuh Tempo Pembayaran Kios B1-05',
            'Yth. Tika, tagihan sewa Kios B1-05 telah melewati tanggal 12. Harap segera lakukan pembayaran sebelum pemutusan listrik.',
            'danger',
            '/tenant/pembayaran'
        );

        Notification::send(
            'tenant',
            $user4AObj->Id_user,
            'Pembayaran Sewa Terverifikasi Lunas',
            'Terima kasih! Pembayaran sewa Kios A1-01 bulan berjalan telah berhasil diverifikasi.',
            'success',
            '/tenant/histori'
        );

        // Activity Logs
        $actions = [
            ['id_user' => 1, 'username' => 'sim_superadmin', 'role' => 'superadmin', 'modul' => 'User', 'aksi' => 'Tambah Staf', 'deskripsi' => 'Superadmin Patra mendaftarkan akun sim_admin_kasir (Arman) dengan hak akses loket verifikasi.'],
            ['id_user' => 2, 'username' => 'sim_admin_kasir', 'role' => 'kasir', 'modul' => 'Pembayaran', 'aksi' => 'Input Setoran Tunai', 'deskripsi' => 'Kasir Arman menerima setoran tunai sebesar Rp 750.000 untuk Kios C1-12 (Dhia).'],
            ['id_user' => 3, 'username' => 'sim_admin_petugas', 'role' => 'petugas_kios', 'modul' => 'Kios', 'aksi' => 'Update Status Kios', 'deskripsi' => 'Petugas Rifa memperbarui status Kios A1-01 menjadi Terisi.'],
            ['id_user' => 1, 'username' => 'sim_superadmin', 'role' => 'superadmin', 'modul' => 'Sewa', 'aksi' => 'Akhiri Sewa', 'deskripsi' => 'Superadmin Patra mengakhiri kontrak sewa Kios H1-20 (Clara).'],
            ['id_user' => 3, 'username' => 'sim_admin_petugas', 'role' => 'auditor', 'modul' => 'Laporan', 'aksi' => 'Ekspor Rekapitulasi', 'deskripsi' => 'Auditor Rifa mengunduh laporan rekapitulasi pembayaran semester pertama.'],
        ];

        foreach ($actions as $act) {
            ActivityLog::create([
                'id_user'    => $act['id_user'],
                'username'   => $act['username'],
                'role'       => $act['role'],
                'modul'      => $act['modul'],
                'aksi'       => $act['aksi'],
                'deskripsi'  => $act['deskripsi'],
                'ip_address' => '127.0.0.1',
                'created_at' => now()->subHours(rand(1, 48)),
            ]);
        }

        $this->command->info('✅ [SIMULATION SEEDER] Finished successfully! All 10 simulation participants and edge scenarios are ready for testing.');
    }
}
