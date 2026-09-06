<?php

namespace Database\Seeders;

use App\Models\ActivityLog;
use App\Models\Dokumen;
use App\Models\Kios;
use App\Models\Notification;
use App\Models\Pembayaran;
use App\Models\Pemilik;
use App\Models\Role;
use App\Models\Sewa;
use App\Models\Tagihan;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Hash;

/**
 * SimulationScenarioSeeder
 *
 * Seeder interaktif untuk 10 anggota tim Inovasi Sosial Plaza Kebun Sayur Balikpapan
 * berdasarkan dokumen PROPOSAL INOVASI SOSIAL.docx.md:
 *
 * 3 Admin:
 *  1. Patra Ananda (10241061) - Superadmin Utama
 *  2. Armansyah (10241013) - Admin Kasir & Loket
 *  3. Muhammad Rifa Al Rizqul Aulia (10241050) - Admin Petugas Kios & Verifikator
 *
 * 7 Tenant (SEMUA memiliki kewajiban belum lunas dengan variasi skenario riil per 7 Sep 2026):
 *  4. Clara Uenike Meylan Langi (10241018) - Multi-Kios (A1-01 & A1-02, tagihan berjalan & tunggakan)
 *  5. Dawwas Eryansyah Pratama (10241019)  - Lancar Berjalan (Belum Jatuh Tempo 12 Sep 2026)
 *  6. Indriani Anwar (10241036)           - Tagihan Dicicil (FIFO Cicilan, sisa Rp 900.000)
 *  7. Tika Mila Wahyuni (10241070)        - Menunggak 1 Bulan (Agustus belum bayar, SP-1)
 *  8. Dhia Salsabila Raihan (17241018)    - Menunggak Kritis 2-3 Bulan (Juli, Ags, Sep belum bayar, SP-2)
 *  9. Yael Crisyella Harahap (17241044)   - Menunggu Verifikasi Admin (Struk BNI baru diupload)
 * 10. Elsya Nur Aulia Handayani (10241026)- Dispute Sanggahan (Struk ATM BCA baru diajukan)
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
        $this->command->info('🚀 [SIMULATION SEEDER] Memulai inisialisasi akun 10 orang tim dan data skenario...');

        // Bersihkan direktori bukti gambar agar tidak ada artefak lama
        $buktiDir = public_path('storage/bukti');
        if (!is_dir($buktiDir)) {
            mkdir($buktiDir, 0777, true);
        }

        // 1. Pastikan Role Master tersedia
        Role::updateOrInsert(['Id_roles' => 1], ['Nama_role' => 'Admin']);
        Role::updateOrInsert(['Id_roles' => 2], ['Nama_role' => 'Tenant']);

        // Helper untuk fetch/create kios fisik
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
        // BAGIAN 1: 3 AKUN ADMIN / PENGELOLA (ANGGOTA 1 - 3)
        // =========================================================================
        $this->command->info('👑 Seeding 3 Akun Admin Tim Inovasi Sosial...');

        $allPermissions = json_encode([
            'verifikasi_pembayaran',
            'input_setoran',
            'ekspor_laporan',
            'kelola_kios',
            'kelola_admin',
            'lihat_audit_log'
        ]);

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

        // Anggota 1: Patra Ananda (10241061) - Superadmin Utama
        User::updateOrInsert(
            ['Username' => 'sim_superadmin'],
            [
                'Id_roles'     => 1,
                'Password'     => $this->adminPasswordHash,
                'nama_lengkap' => 'Patra Ananda (10241061) - Superadmin Utama',
                'email'        => '10241061@student.itk.ac.id',
                'sub_role'     => 'superadmin',
                'permissions'  => $allPermissions,
                'status_aktif' => 1,
            ]
        );

        // Anggota 2: Armansyah (10241013) - Admin Kasir & Loket
        User::updateOrInsert(
            ['Username' => 'sim_admin_kasir'],
            [
                'Id_roles'     => 1,
                'Password'     => $this->adminPasswordHash,
                'nama_lengkap' => 'Armansyah (10241013) - Admin Kasir & Loket',
                'email'        => '10241013@student.itk.ac.id',
                'sub_role'     => 'kasir',
                'permissions'  => $kasirPermissions,
                'status_aktif' => 1,
            ]
        );

        // Anggota 3: Muhammad Rifa Al Rizqul Aulia (10241050) - Admin Petugas Kios & Verifikator
        User::updateOrInsert(
            ['Username' => 'sim_admin_kios'],
            [
                'Id_roles'     => 1,
                'Password'     => $this->adminPasswordHash,
                'nama_lengkap' => 'Muhammad Rifa Al Rizqul Aulia (10241050) - Admin Petugas Kios',
                'email'        => '10241050@student.itk.ac.id',
                'sub_role'     => 'petugas_kios',
                'permissions'  => $petugasKiosPermissions,
                'status_aktif' => 1,
            ]
        );

        // =========================================================================
        // BAGIAN 2: 7 AKUN TENANT DENGAN SKENARIO TAGIHAN BELUM LUNAS (ANGGOTA 4 - 10)
        // =========================================================================
        $this->command->info('🏪 Seeding 7 Akun Tenant dengan Berbagai Skenario Tagihan Aktif...');

        // -------------------------------------------------------------------------
        // ANGGOTA 4: CLARA UENIKE MEYLAN LANGI (10241018) - KETUA TIM
        // Skenario: MULTI-KIOS (Kios A1-01 & A1-02, Lantai 1)
        // Kios A1-01: Lancar berjalan Sep 2026 (Belum Bayar)
        // Kios A1-02: Nunggak Ags 2026 + Sep 2026 (Belum Bayar)
        // -------------------------------------------------------------------------
        $userClara = User::updateOrInsert(
            ['Username' => 'tenant_clara'],
            [
                'Id_roles'     => 2,
                'Password'     => $this->tenantPasswordHash,
                'sub_role'     => 'tenant',
                'status_aktif' => 1,
                'nama_lengkap' => 'Clara Uenike Meylan Langi (Ketua Tim)',
                'email'        => '10241018@student.itk.ac.id',
            ]
        );
        $userClaraObj = User::where('Username', 'tenant_clara')->first();

        $pemilikClara = Pemilik::updateOrInsert(
            ['Id_User' => $userClaraObj->Id_user],
            [
                'Nama'            => 'Clara Uenike Meylan Langi',
                'No_Telepon'      => '081256520229',
                'No_KTP'          => '6471011802040001',
                'Alamat'          => 'Jln. Letjen Suprapto, Baru Ilir, Balikpapan Barat',
                'izinkan_cicilan' => true,
            ]
        );
        $pemilikClaraObj = Pemilik::where('Id_User', $userClaraObj->Id_user)->first();

        // Kios 1: A1-01 (Boutique Tenun Dayak)
        $kiosClara1 = $getOrCreateKiosk('A1-01', 1, '4x5 m²', 'Terisi');
        $kiosClara1->update(['Status' => 'Terisi']);

        $sewaClara1 = Sewa::updateOrInsert(
            ['Id_Pemilik' => $pemilikClaraObj->Id_Pemilik, 'Id_Kios' => $kiosClara1->Id_Kios],
            [
                'Jenis_Usaha'     => 'Boutique Kain Tenun & Busana Khas Dayak',
                'Tanggal_Mulai'   => '2026-07-01',
                'Tanggal_Selesai' => '2028-06-30',
                'Tarif_Bulanan'   => 1500000.00,
                'Keterangan'      => 'Sewa kios primer lantai 1 depan lobby.',
                'Status'          => 'Aktif',
            ]
        );
        $sewaClara1Obj = Sewa::where('Id_Pemilik', $pemilikClaraObj->Id_Pemilik)->where('Id_Kios', $kiosClara1->Id_Kios)->first();

        // Tagihan Juli & Agustus LUNAS (dengan bukti transfer BCA)
        $strukClaraJul = ReceiptGeneratorHelper::make('struk_bca_clara_jul.png', 'BCA', 'Clara Uenike Meylan Langi', 1500000, '08 Jul 2026 11:20 WITA', 'BCA-TX20260708-0112', 'Sewa Kios A1-01 Juli 2026');
        $strukClaraAgs = ReceiptGeneratorHelper::make('struk_bca_clara_ags.png', 'BCA', 'Clara Uenike Meylan Langi', 1500000, '09 Ags 2026 14:10 WITA', 'BCA-TX20260809-0219', 'Sewa Kios A1-01 Agustus 2026');

        $tClaraJul = Tagihan::create([
            'Id_Sewa' => $sewaClara1Obj->Id_Sewa,
            'Periode' => '2026-07',
            'Jatuh_Tempo' => '2026-07-12',
            'Tarif_Sewa' => 1500000,
            'Hutang_Tunggakan' => 0,
            'Total_Tagihan' => 1500000,
            'Sisa_Tagihan' => 0,
            'Status_Tagihan' => 'Lunas',
        ]);
        Pembayaran::create([
            'Id_Tagihan' => $tClaraJul->Id_Tagihan,
            'Tanggal_Bayar' => '2026-07-08',
            'Total_Bayar' => 1500000,
            'Metode_Bayar' => 'Transfer',
            'Bukti_Pembayaran' => $strukClaraJul,
            'Verifikasi_Pembayaran' => 'Diterima',
            'catatan_admin' => 'Verifikasi pembayaran lunas tepat waktu.',
            'created_at' => Carbon::parse('2026-07-08 11:25:00'),
        ]);

        $tClaraAgs = Tagihan::create([
            'Id_Sewa' => $sewaClara1Obj->Id_Sewa,
            'Periode' => '2026-08',
            'Jatuh_Tempo' => '2026-08-12',
            'Tarif_Sewa' => 1500000,
            'Hutang_Tunggakan' => 0,
            'Total_Tagihan' => 1500000,
            'Sisa_Tagihan' => 0,
            'Status_Tagihan' => 'Lunas',
        ]);
        Pembayaran::create([
            'Id_Tagihan' => $tClaraAgs->Id_Tagihan,
            'Tanggal_Bayar' => '2026-08-09',
            'Total_Bayar' => 1500000,
            'Metode_Bayar' => 'Transfer',
            'Bukti_Pembayaran' => $strukClaraAgs,
            'Verifikasi_Pembayaran' => 'Diterima',
            'catatan_admin' => 'Verifikasi bukti transfer diterima.',
            'created_at' => Carbon::parse('2026-08-09 14:15:00'),
        ]);

        // Tagihan September 2026 Kios A1-01: BELUM BAYAR (Lancar berjalan, jatuh tempo 12 Sep)
        Tagihan::create([
            'Id_Sewa' => $sewaClara1Obj->Id_Sewa,
            'Periode' => '2026-09',
            'Jatuh_Tempo' => '2026-09-12',
            'Tarif_Sewa' => 1500000,
            'Hutang_Tunggakan' => 0,
            'Total_Tagihan' => 1500000,
            'Sisa_Tagihan' => 1500000,
            'Status_Tagihan' => 'Belum Bayar',
        ]);

        // Kios 2: A1-02 (Cinderamata & Kerajinan)
        $kiosClara2 = $getOrCreateKiosk('A1-02', 1, '3x4 m²', 'Terisi');
        $kiosClara2->update(['Status' => 'Terisi']);

        $sewaClara2 = Sewa::updateOrInsert(
            ['Id_Pemilik' => $pemilikClaraObj->Id_Pemilik, 'Id_Kios' => $kiosClara2->Id_Kios],
            [
                'Jenis_Usaha'     => 'Pusat Cinderamata & Aksesoris Borneo',
                'Tanggal_Mulai'   => '2026-07-01',
                'Tanggal_Selesai' => '2027-06-30',
                'Tarif_Bulanan'   => 1200000.00,
                'Keterangan'      => 'Kios kedua berdampingan unit A1-01.',
                'Status'          => 'Aktif',
            ]
        );
        $sewaClara2Obj = Sewa::where('Id_Pemilik', $pemilikClaraObj->Id_Pemilik)->where('Id_Kios', $kiosClara2->Id_Kios)->first();

        // Juli Lunas
        $tClara2Jul = Tagihan::create([
            'Id_Sewa' => $sewaClara2Obj->Id_Sewa,
            'Periode' => '2026-07',
            'Jatuh_Tempo' => '2026-07-12',
            'Tarif_Sewa' => 1200000,
            'Hutang_Tunggakan' => 0,
            'Total_Tagihan' => 1200000,
            'Sisa_Tagihan' => 0,
            'Status_Tagihan' => 'Lunas',
        ]);
        Pembayaran::create([
            'Id_Tagihan' => $tClara2Jul->Id_Tagihan,
            'Tanggal_Bayar' => '2026-07-10',
            'Total_Bayar' => 1200000,
            'Metode_Bayar' => 'Tunai',
            'Bukti_Pembayaran' => 'SETORAN-KASIR-LOKET-702',
            'Verifikasi_Pembayaran' => 'Diterima',
            'catatan_admin' => 'Setoran tunai di loket pengelola.',
            'created_at' => Carbon::parse('2026-07-10 10:00:00'),
        ]);

        // Agustus 2026: BELUM BAYAR (Nunggak 1 bulan)
        Tagihan::create([
            'Id_Sewa' => $sewaClara2Obj->Id_Sewa,
            'Periode' => '2026-08',
            'Jatuh_Tempo' => '2026-08-12',
            'Tarif_Sewa' => 1200000,
            'Hutang_Tunggakan' => 0,
            'Total_Tagihan' => 1200000,
            'Sisa_Tagihan' => 1200000,
            'Status_Tagihan' => 'Belum Bayar',
        ]);

        // September 2026: BELUM BAYAR (Terakumulasi tunggakan Ags)
        Tagihan::create([
            'Id_Sewa' => $sewaClara2Obj->Id_Sewa,
            'Periode' => '2026-09',
            'Jatuh_Tempo' => '2026-09-12',
            'Tarif_Sewa' => 1200000,
            'Hutang_Tunggakan' => 1200000,
            'Total_Tagihan' => 2400000,
            'Sisa_Tagihan' => 2400000,
            'Status_Tagihan' => 'Belum Bayar',
        ]);

        // -------------------------------------------------------------------------
        // ANGGOTA 5: DAWWAS ERYANSYAH PRATAMA (10241019)
        // Skenario: TAGIHAN LANCAR BERJALAN (Belum Jatuh Tempo, sisa 5 hari per 7 Sep)
        // Kios B1-05 (Lantai 1)
        // -------------------------------------------------------------------------
        $userDawwas = User::updateOrInsert(
            ['Username' => 'tenant_dawwas'],
            [
                'Id_roles'     => 2,
                'Password'     => $this->tenantPasswordHash,
                'sub_role'     => 'tenant',
                'status_aktif' => 1,
                'nama_lengkap' => 'Dawwas Eryansyah Pratama',
                'email'        => '10241019@student.itk.ac.id',
            ]
        );
        $userDawwasObj = User::where('Username', 'tenant_dawwas')->first();

        $pemilikDawwas = Pemilik::updateOrInsert(
            ['Id_User' => $userDawwasObj->Id_user],
            [
                'Nama'            => 'Dawwas Eryansyah Pratama',
                'No_Telepon'      => '081255101019',
                'No_KTP'          => '6471011905040002',
                'Alamat'          => 'Jl. Pandan Sari No. 14, Balikpapan Barat',
                'izinkan_cicilan' => false,
            ]
        );
        $pemilikDawwasObj = Pemilik::where('Id_User', $userDawwasObj->Id_user)->first();

        $kiosDawwas = $getOrCreateKiosk('B1-05', 1, '4x4 m²', 'Terisi');
        $kiosDawwas->update(['Status' => 'Terisi']);

        $sewaDawwas = Sewa::updateOrInsert(
            ['Id_Pemilik' => $pemilikDawwasObj->Id_Pemilik, 'Id_Kios' => $kiosDawwas->Id_Kios],
            [
                'Jenis_Usaha'     => 'Toko Souvenir & Kerajinan Manik Borneo',
                'Tanggal_Mulai'   => '2026-06-01',
                'Tanggal_Selesai' => '2028-05-31',
                'Tarif_Bulanan'   => 1400000.00,
                'Keterangan'      => 'Sewa kios suvenir khas Kalimantan.',
                'Status'          => 'Aktif',
            ]
        );
        $sewaDawwasObj = Sewa::where('Id_Pemilik', $pemilikDawwasObj->Id_Pemilik)->where('Id_Kios', $kiosDawwas->Id_Kios)->first();

        // Bulan lalu (Agustus) Lunas via Mandiri Livin'
        $strukDawwasAgs = ReceiptGeneratorHelper::make('struk_mandiri_dawwas_ags.png', 'Mandiri', 'Dawwas Eryansyah Pratama', 1400000, '08 Ags 2026 13:45 WITA', 'MDR-TX20260808-8812', 'Sewa Kios B1-05 Agustus 2026');

        $tDawwasAgs = Tagihan::create([
            'Id_Sewa' => $sewaDawwasObj->Id_Sewa,
            'Periode' => '2026-08',
            'Jatuh_Tempo' => '2026-08-12',
            'Tarif_Sewa' => 1400000,
            'Hutang_Tunggakan' => 0,
            'Total_Tagihan' => 1400000,
            'Sisa_Tagihan' => 0,
            'Status_Tagihan' => 'Lunas',
        ]);
        Pembayaran::create([
            'Id_Tagihan' => $tDawwasAgs->Id_Tagihan,
            'Tanggal_Bayar' => '2026-08-08',
            'Total_Bayar' => 1400000,
            'Metode_Bayar' => 'Transfer',
            'Bukti_Pembayaran' => $strukDawwasAgs,
            'Verifikasi_Pembayaran' => 'Diterima',
            'catatan_admin' => 'Pembayaran Mandiri terverifikasi.',
            'created_at' => Carbon::parse('2026-08-08 13:50:00'),
        ]);

        // Tagihan September 2026: BELUM BAYAR (Lancar, jatuh tempo 12 Sep 2026)
        Tagihan::create([
            'Id_Sewa' => $sewaDawwasObj->Id_Sewa,
            'Periode' => '2026-09',
            'Jatuh_Tempo' => '2026-09-12',
            'Tarif_Sewa' => 1400000,
            'Hutang_Tunggakan' => 0,
            'Total_Tagihan' => 1400000,
            'Sisa_Tagihan' => 1400000,
            'Status_Tagihan' => 'Belum Bayar',
        ]);

        // -------------------------------------------------------------------------
        // ANGGOTA 6: INDRIANI ANWAR (10241036)
        // Skenario: TAGIHAN DICICIL (FIFO Cicilan)
        // Kios C1-12 (Lantai 1)
        // Tagihan Rp 1.600.000, sudah dibayar Rp 700.000 via BRImo, sisa Rp 900.000 (Dicicil)
        // -------------------------------------------------------------------------
        $userIndriani = User::updateOrInsert(
            ['Username' => 'tenant_indriani'],
            [
                'Id_roles'     => 2,
                'Password'     => $this->tenantPasswordHash,
                'sub_role'     => 'tenant',
                'status_aktif' => 1,
                'nama_lengkap' => 'Indriani Anwar',
                'email'        => '10241036@student.itk.ac.id',
            ]
        );
        $userIndrianiObj = User::where('Username', 'tenant_indriani')->first();

        $pemilikIndriani = Pemilik::updateOrInsert(
            ['Id_User' => $userIndrianiObj->Id_user],
            [
                'Nama'            => 'Indriani Anwar',
                'No_Telepon'      => '081255101036',
                'No_KTP'          => '6471013608040003',
                'Alamat'          => 'Jl. Baru Ulu No. 88, Balikpapan Barat',
                'izinkan_cicilan' => true,
            ]
        );
        $pemilikIndrianiObj = Pemilik::where('Id_User', $userIndrianiObj->Id_user)->first();

        $kiosIndriani = $getOrCreateKiosk('C1-12', 1, '4x4 m²', 'Terisi');
        $kiosIndriani->update(['Status' => 'Terisi']);

        $sewaIndriani = Sewa::updateOrInsert(
            ['Id_Pemilik' => $pemilikIndrianiObj->Id_Pemilik, 'Id_Kios' => $kiosIndriani->Id_Kios],
            [
                'Jenis_Usaha'     => 'Kios Herbal & Obat Tradisional Pasak Bumi',
                'Tanggal_Mulai'   => '2026-07-01',
                'Tanggal_Selesai' => '2027-06-30',
                'Tarif_Bulanan'   => 1600000.00,
                'Keterangan'      => 'Tenant memiliki fasilitas pembayaran bertahap (cicilan).',
                'Status'          => 'Aktif',
            ]
        );
        $sewaIndrianiObj = Sewa::where('Id_Pemilik', $pemilikIndrianiObj->Id_Pemilik)->where('Id_Kios', $kiosIndriani->Id_Kios)->first();

        // Tagihan September 2026: Total Rp 1.600.000
        $tIndrianiSep = Tagihan::create([
            'Id_Sewa' => $sewaIndrianiObj->Id_Sewa,
            'Periode' => '2026-09',
            'Jatuh_Tempo' => '2026-09-12',
            'Tarif_Sewa' => 1600000,
            'Hutang_Tunggakan' => 0,
            'Total_Tagihan' => 1600000,
            'Sisa_Tagihan' => 900000, // sisa 900rb
            'Status_Tagihan' => 'Dicicil',
        ]);

        // Pembayaran Cicilan Pertama Rp 700.000 via BRImo pada 3 Sep 2026
        $strukIndrianiCicil = ReceiptGeneratorHelper::make('struk_bri_indriani_cicil.png', 'BRI', 'Indriani Anwar', 700000, '03 Sep 2026 10:15 WITA', 'BRI-TX20260903-7182', 'Cicilan 1 Sewa Kios C1-12 Sep 2026');

        Pembayaran::create([
            'Id_Tagihan' => $tIndrianiSep->Id_Tagihan,
            'Tanggal_Bayar' => '2026-09-03',
            'Total_Bayar' => 700000,
            'Metode_Bayar' => 'Transfer',
            'Bukti_Pembayaran' => $strukIndrianiCicil,
            'Verifikasi_Pembayaran' => 'Diterima',
            'catatan_admin' => 'Cicilan tahap 1 Rp 700.000 diterima, sisa Rp 900.000 sebelum 12 September.',
            'created_at' => Carbon::parse('2026-09-03 10:20:00'),
        ]);

        // -------------------------------------------------------------------------
        // ANGGOTA 7: TIKA MILA WAHYUNI (10241070)
        // Skenario: NUNGGAK 1 BULAN (Peringatan SP-1)
        // Kios D2-08 (Lantai 2)
        // Tagihan Agustus 2026 lewat tempo (Belum Bayar) + September 2026 (Belum Bayar)
        // -------------------------------------------------------------------------
        $userTika = User::updateOrInsert(
            ['Username' => 'tenant_tika'],
            [
                'Id_roles'     => 2,
                'Password'     => $this->tenantPasswordHash,
                'sub_role'     => 'tenant',
                'status_aktif' => 1,
                'nama_lengkap' => 'Tika Mila Wahyuni',
                'email'        => '10241070@student.itk.ac.id',
            ]
        );
        $userTikaObj = User::where('Username', 'tenant_tika')->first();

        $pemilikTika = Pemilik::updateOrInsert(
            ['Id_User' => $userTikaObj->Id_user],
            [
                'Nama'            => 'Tika Mila Wahyuni',
                'No_Telepon'      => '081255101070',
                'No_KTP'          => '6471017011040004',
                'Alamat'          => 'Jl. Semoi No. 23, Kampung Baru Tengah, Balikpapan Barat',
                'izinkan_cicilan' => false,
            ]
        );
        $pemilikTikaObj = Pemilik::where('Id_User', $userTikaObj->Id_user)->first();

        $kiosTika = $getOrCreateKiosk('D2-08', 2, '3x4 m²', 'Terisi');
        $kiosTika->update(['Status' => 'Terisi']);

        $sewaTika = Sewa::updateOrInsert(
            ['Id_Pemilik' => $pemilikTikaObj->Id_Pemilik, 'Id_Kios' => $kiosTika->Id_Kios],
            [
                'Jenis_Usaha'     => 'Aksesoris & Batu Akik Permata Martapura',
                'Tanggal_Mulai'   => '2026-06-01',
                'Tanggal_Selesai' => '2027-05-31',
                'Tarif_Bulanan'   => 1300000.00,
                'Keterangan'      => 'Kios aksesoris lantai 2.',
                'Status'          => 'Aktif',
            ]
        );
        $sewaTikaObj = Sewa::where('Id_Pemilik', $pemilikTikaObj->Id_Pemilik)->where('Id_Kios', $kiosTika->Id_Kios)->first();

        // Tagihan Agustus 2026: Lewat jatuh tempo (Nunggak 1 bulan)
        Tagihan::create([
            'Id_Sewa' => $sewaTikaObj->Id_Sewa,
            'Periode' => '2026-08',
            'Jatuh_Tempo' => '2026-08-12',
            'Tarif_Sewa' => 1300000,
            'Hutang_Tunggakan' => 0,
            'Total_Tagihan' => 1300000,
            'Sisa_Tagihan' => 1300000,
            'Status_Tagihan' => 'Belum Bayar',
        ]);

        // Tagihan September 2026: Terakumulasi tunggakan
        Tagihan::create([
            'Id_Sewa' => $sewaTikaObj->Id_Sewa,
            'Periode' => '2026-09',
            'Jatuh_Tempo' => '2026-09-12',
            'Tarif_Sewa' => 1300000,
            'Hutang_Tunggakan' => 1300000,
            'Total_Tagihan' => 2600000,
            'Sisa_Tagihan' => 2600000,
            'Status_Tagihan' => 'Belum Bayar',
        ]);

        // -------------------------------------------------------------------------
        // ANGGOTA 8: DHIA SALSABILA RAIHAN (17241018)
        // Skenario: NUNGGAK KRITIS 2-3 BULAN (Peringatan SP-2 / Segel)
        // Kios E2-03 (Lantai 2)
        // Tagihan Juli & Agustus nunggak + September berjalan (Total 4.5jt Belum Bayar)
        // -------------------------------------------------------------------------
        $userDhia = User::updateOrInsert(
            ['Username' => 'tenant_dhia'],
            [
                'Id_roles'     => 2,
                'Password'     => $this->tenantPasswordHash,
                'sub_role'     => 'tenant',
                'status_aktif' => 1,
                'nama_lengkap' => 'Dhia Salsabila Raihan',
                'email'        => '17241018@student.itk.ac.id',
            ]
        );
        $userDhiaObj = User::where('Username', 'tenant_dhia')->first();

        $pemilikDhia = Pemilik::updateOrInsert(
            ['Id_User' => $userDhiaObj->Id_user],
            [
                'Nama'            => 'Dhia Salsabila Raihan',
                'No_Telepon'      => '081255101718',
                'No_KTP'          => '6471021812040005',
                'Alamat'          => 'Jl. Letjen Soeprapto No. 45, Balikpapan Barat',
                'izinkan_cicilan' => false,
            ]
        );
        $pemilikDhiaObj = Pemilik::where('Id_User', $userDhiaObj->Id_user)->first();

        $kiosDhia = $getOrCreateKiosk('E2-03', 2, '4x4 m²', 'Terisi');
        $kiosDhia->update(['Status' => 'Terisi']);

        $sewaDhia = Sewa::updateOrInsert(
            ['Id_Pemilik' => $pemilikDhiaObj->Id_Pemilik, 'Id_Kios' => $kiosDhia->Id_Kios],
            [
                'Jenis_Usaha'     => 'Sentra Amplang & Kerupuk Khas Balikpapan',
                'Tanggal_Mulai'   => '2026-05-01',
                'Tanggal_Selesai' => '2027-04-30',
                'Tarif_Bulanan'   => 1500000.00,
                'Keterangan'      => 'Kios oleh-oleh khas amplang ikan pipih.',
                'Status'          => 'Aktif',
            ]
        );
        $sewaDhiaObj = Sewa::where('Id_Pemilik', $pemilikDhiaObj->Id_Pemilik)->where('Id_Kios', $kiosDhia->Id_Kios)->first();

        // Tagihan Juli 2026: NUNGGAK (Sisa 1.5jt)
        Tagihan::create([
            'Id_Sewa' => $sewaDhiaObj->Id_Sewa,
            'Periode' => '2026-07',
            'Jatuh_Tempo' => '2026-07-12',
            'Tarif_Sewa' => 1500000,
            'Hutang_Tunggakan' => 0,
            'Total_Tagihan' => 1500000,
            'Sisa_Tagihan' => 1500000,
            'Status_Tagihan' => 'Belum Bayar',
        ]);

        // Tagihan Agustus 2026: NUNGGAK (Sisa 1.5jt)
        Tagihan::create([
            'Id_Sewa' => $sewaDhiaObj->Id_Sewa,
            'Periode' => '2026-08',
            'Jatuh_Tempo' => '2026-08-12',
            'Tarif_Sewa' => 1500000,
            'Hutang_Tunggakan' => 1500000,
            'Total_Tagihan' => 3000000,
            'Sisa_Tagihan' => 1500000,
            'Status_Tagihan' => 'Belum Bayar',
        ]);

        // Tagihan September 2026: NUNGGAK KRITIS (Total hutang 4.5jt)
        Tagihan::create([
            'Id_Sewa' => $sewaDhiaObj->Id_Sewa,
            'Periode' => '2026-09',
            'Jatuh_Tempo' => '2026-09-12',
            'Tarif_Sewa' => 1500000,
            'Hutang_Tunggakan' => 3000000,
            'Total_Tagihan' => 4500000,
            'Sisa_Tagihan' => 4500000,
            'Status_Tagihan' => 'Belum Bayar',
        ]);

        // -------------------------------------------------------------------------
        // ANGGOTA 9: YAEL CRISYELLA HARAHAP (17241044)
        // Skenario: MENUNGGU VERIFIKASI ADMIN (Bukti Baru Diunggah via BNI Mobile)
        // Kios F2-15 (Lantai 2)
        // Pembayaran transfer Rp 1.500.000 menunggu verifikasi manual admin di panel
        // -------------------------------------------------------------------------
        $userYael = User::updateOrInsert(
            ['Username' => 'tenant_yael'],
            [
                'Id_roles'     => 2,
                'Password'     => $this->tenantPasswordHash,
                'sub_role'     => 'tenant',
                'status_aktif' => 1,
                'nama_lengkap' => 'Yael Crisyella Harahap',
                'email'        => '17241044@student.itk.ac.id',
            ]
        );
        $userYaelObj = User::where('Username', 'tenant_yael')->first();

        $pemilikYael = Pemilik::updateOrInsert(
            ['Id_User' => $userYaelObj->Id_user],
            [
                'Nama'            => 'Yael Crisyella Harahap',
                'No_Telepon'      => '081255101744',
                'No_KTP'          => '6471024403040006',
                'Alamat'          => 'Jl. Sidodadi No. 12, Balikpapan Barat',
                'izinkan_cicilan' => false,
            ]
        );
        $pemilikYaelObj = Pemilik::where('Id_User', $userYaelObj->Id_user)->first();

        $kiosYael = $getOrCreateKiosk('F2-15', 2, '4x4 m²', 'Terisi');
        $kiosYael->update(['Status' => 'Terisi']);

        $sewaYael = Sewa::updateOrInsert(
            ['Id_Pemilik' => $pemilikYaelObj->Id_Pemilik, 'Id_Kios' => $kiosYael->Id_Kios],
            [
                'Jenis_Usaha'     => 'Fashion Muslim & Busana Sasirangan',
                'Tanggal_Mulai'   => '2026-07-01',
                'Tanggal_Selesai' => '2027-06-30',
                'Tarif_Bulanan'   => 1500000.00,
                'Keterangan'      => 'Kios busana sasirangan dan bordir.',
                'Status'          => 'Aktif',
            ]
        );
        $sewaYaelObj = Sewa::where('Id_Pemilik', $pemilikYaelObj->Id_Pemilik)->where('Id_Kios', $kiosYael->Id_Kios)->first();

        // Tagihan September 2026: Status Menunggu Verifikasi
        $tYaelSep = Tagihan::create([
            'Id_Sewa' => $sewaYaelObj->Id_Sewa,
            'Periode' => '2026-09',
            'Jatuh_Tempo' => '2026-09-12',
            'Tarif_Sewa' => 1500000,
            'Hutang_Tunggakan' => 0,
            'Total_Tagihan' => 1500000,
            'Sisa_Tagihan' => 1500000,
            'Status_Tagihan' => 'Menunggu Verifikasi',
        ]);

        // Struk BNI asli diunggah 6 Sep 2026
        $strukYaelSep = ReceiptGeneratorHelper::make('struk_bni_yael_sep.png', 'BNI', 'Yael Crisyella Harahap', 1500000, '06 Sep 2026 15:30 WITA', 'BNI-TX20260906-9921', 'Sewa Kios F2-15 September 2026');

        Pembayaran::create([
            'Id_Tagihan' => $tYaelSep->Id_Tagihan,
            'Tanggal_Bayar' => '2026-09-06',
            'Total_Bayar' => 1500000,
            'Metode_Bayar' => 'Transfer',
            'Bukti_Pembayaran' => $strukYaelSep,
            'Verifikasi_Pembayaran' => 'Menunggu',
            'catatan_admin' => null,
            'created_at' => Carbon::parse('2026-09-06 15:35:00'),
        ]);

        // -------------------------------------------------------------------------
        // ANGGOTA 10: ELSYA NUR AULIA HANDAYANI (10241026)
        // Skenario: DISPUTE & REBUTTAL (SANGGAHAN AKTIF DENGAN STRUK ATM BARU)
        // Kios G2-04 (Lantai 2)
        // Struk pertama buram -> Ditolak -> Ajukan sanggahan dengan Struk Fisik ATM BCA jelas
        // -------------------------------------------------------------------------
        $userElsya = User::updateOrInsert(
            ['Username' => 'tenant_elsya'],
            [
                'Id_roles'     => 2,
                'Password'     => $this->tenantPasswordHash,
                'sub_role'     => 'tenant',
                'status_aktif' => 1,
                'nama_lengkap' => 'Elsya Nur Aulia Handayani',
                'email'        => '10241026@student.itk.ac.id',
            ]
        );
        $userElsyaObj = User::where('Username', 'tenant_elsya')->first();

        $pemilikElsya = Pemilik::updateOrInsert(
            ['Id_User' => $userElsyaObj->Id_user],
            [
                'Nama'            => 'Elsya Nur Aulia Handayani',
                'No_Telepon'      => '081255101026',
                'No_KTP'          => '6471012607040007',
                'Alamat'          => 'Jl. Manggar Sari No. 5, Balikpapan Barat',
                'izinkan_cicilan' => false,
            ]
        );
        $pemilikElsyaObj = Pemilik::where('Id_User', $userElsyaObj->Id_user)->first();

        $kiosElsya = $getOrCreateKiosk('G2-04', 2, '3x4 m²', 'Terisi');
        $kiosElsya->update(['Status' => 'Terisi']);

        $sewaElsya = Sewa::updateOrInsert(
            ['Id_Pemilik' => $pemilikElsyaObj->Id_Pemilik, 'Id_Kios' => $kiosElsya->Id_Kios],
            [
                'Jenis_Usaha'     => 'Kios Kuliner & Minuman Tradisional Saraba',
                'Tanggal_Mulai'   => '2026-07-01',
                'Tanggal_Selesai' => '2027-06-30',
                'Tarif_Bulanan'   => 1250000.00,
                'Keterangan'      => 'Kios minuman rempah khas Kalimantan.',
                'Status'          => 'Aktif',
            ]
        );
        $sewaElsyaObj = Sewa::where('Id_Pemilik', $pemilikElsyaObj->Id_Pemilik)->where('Id_Kios', $kiosElsya->Id_Kios)->first();

        // Tagihan September 2026
        $tElsyaSep = Tagihan::create([
            'Id_Sewa' => $sewaElsyaObj->Id_Sewa,
            'Periode' => '2026-09',
            'Jatuh_Tempo' => '2026-09-12',
            'Tarif_Sewa' => 1250000,
            'Hutang_Tunggakan' => 0,
            'Total_Tagihan' => 1250000,
            'Sisa_Tagihan' => 1250000,
            'Status_Tagihan' => 'Menunggu Verifikasi',
        ]);

        // Struk lama yang buram (dibuat dengan mode blurry)
        $strukElsyaBuram = ReceiptGeneratorHelper::make('struk_bca_elsya_buram.png', 'BCA', 'Elsya Nur Aulia H', 1250000, '04 Sep 2026 14:10 WITA', 'BCA-TX20260904-4412', 'Sewa Kios G2-04', true);

        // Struk baru lampiran sanggahan: Struk Fisik Mesin ATM BCA yang tajam
        $strukAtmElsyaJelas = ReceiptGeneratorHelper::make('struk_atm_elsya_jelas.png', 'ATM', 'Elsya Nur Aulia Handayani', 1250000, '05/09/2026 09:42', 'ATM-BCA-5519283', 'Sewa Kios G2-04');

        Pembayaran::create([
            'Id_Tagihan' => $tElsyaSep->Id_Tagihan,
            'Tanggal_Bayar' => '2026-09-04',
            'Total_Bayar' => 1250000,
            'Metode_Bayar' => 'Transfer',
            'Bukti_Pembayaran' => $strukElsyaBuram,
            'Verifikasi_Pembayaran' => 'Menunggu',
            'catatan_admin' => 'Foto bukti sebelumnya buram dan nominal terpotong.',
            'teks_sanggahan' => 'Mohon maaf bukti sebelumnya buram karena kamera hp. Ini saya lampirkan foto struk fisik ATM BCA di lobi plaza yang sangat jelas.',
            'bukti_sanggahan' => $strukAtmElsyaJelas,
            'created_at' => Carbon::parse('2026-09-04 14:15:00'),
            'updated_at' => Carbon::parse('2026-09-05 10:00:00'),
        ]);

        // =========================================================================
        // BAGIAN 3: DOKUMEN HUKUM SEWA KIOS
        // =========================================================================
        $this->command->info('📄 Menghasilkan Surat Perjanjian Sewa (SP & PPJB) untuk seluruh tenant...');
        foreach ([$pemilikClaraObj, $pemilikDawwasObj, $pemilikIndrianiObj, $pemilikTikaObj, $pemilikDhiaObj, $pemilikYaelObj, $pemilikElsyaObj] as $idx => $pem) {
            $sewa = Sewa::where('Id_Pemilik', $pem->Id_Pemilik)->first();
            if ($sewa) {
                Dokumen::create([
                    'Id_Pemilik'     => $pem->Id_Pemilik,
                    'Id_Kios'        => $sewa->Id_Kios,
                    'Jenis_Dokumen'  => 'SP',
                    'Nomor_Dokumen'  => sprintf('SP/PLAZA-BUNSAY/2026/%04d', $idx + 1),
                    'Tanggal'        => $sewa->Tanggal_Mulai,
                ]);
                Dokumen::create([
                    'Id_Pemilik'     => $pem->Id_Pemilik,
                    'Id_Kios'        => $sewa->Id_Kios,
                    'Jenis_Dokumen'  => 'PPJB',
                    'Nomor_Dokumen'  => sprintf('PPJB/PLAZA-BUNSAY/2026/%04d', $idx + 1),
                    'Tanggal'        => Carbon::parse($sewa->Tanggal_Mulai)->addDays(3)->toDateString(),
                ]);
            }
        }

        // =========================================================================
        // BAGIAN 4: NOTIFIKASI DINAMIS & LOG AKTIVITAS AUDIT
        // =========================================================================
        $this->command->info('🔔 Mengirimkan notifikasi sistem dan mencatat activity log...');

        // Notifikasi Admin
        Notification::send(
            'admin',
            null,
            'Antrean Bukti Transfer Menunggu Verifikasi',
            'Terdapat bukti transfer dari Yael Crisyella Harahap (Kios F2-15) sebesar Rp 1.500.000 menunggu verifikasi loket.',
            'info',
            '/admin/verifikasi-bukti'
        );

        Notification::send(
            'admin',
            null,
            'Sanggahan Pembayaran Masuk',
            'Tenant Elsya Nur Aulia (Kios G2-04) mengajukan sanggahan dengan melampirkan foto struk fisik ATM BCA baru.',
            'warning',
            '/admin/verifikasi-bukti'
        );

        Notification::send(
            'admin',
            null,
            'Laporan Keuangan September 2026 Tersedia',
            'Rekapitulasi tagihan gedung dan setoran tenant bulan September 2026 siap diekspor ke format Excel.',
            'success',
            '/admin/ekspor'
        );

        // Notifikasi Tenant
        Notification::send(
            'tenant',
            $userTikaObj->Id_user,
            'Surat Peringatan 1 (SP-1) Keterlambatan Sewa',
            'Yth. Tika Mila Wahyuni, tagihan sewa Kios D2-08 bulan Agustus 2026 telah melewati jatuh tempo. Harap segera melunasi kewajiban.',
            'danger',
            '/tenant/pembayaran'
        );

        Notification::send(
            'tenant',
            $userDhiaObj->Id_user,
            'Peringatan Kritis Keterlambatan Sewa (SP-2)',
            'Yth. Dhia Salsabila Raihan, terdapat tunggakan sewa Kios E2-03 selama 2 bulan berturut-turut. Mohon segera hubungi kantor pengelola.',
            'danger',
            '/tenant/pembayaran'
        );

        Notification::send(
            'tenant',
            $userIndrianiObj->Id_user,
            'Pembayaran Cicilan Berhasil Dicatat',
            'Pembayaran cicilan Rp 700.000 untuk Kios C1-12 telah diverifikasi. Sisa tagihan Anda adalah Rp 900.000.',
            'info',
            '/tenant/histori'
        );

        // Activity Logs
        $admPatra = User::where('Username', 'sim_superadmin')->first();
        $admArman = User::where('Username', 'sim_admin_kasir')->first();
        $admRifa  = User::where('Username', 'sim_admin_kios')->first();

        $logs = [
            ['id_user' => $admPatra?->Id_user ?? 1, 'username' => 'sim_superadmin', 'role' => 'superadmin', 'modul' => 'User', 'aksi' => 'Inisialisasi Sistem', 'deskripsi' => 'Superadmin Patra Ananda melakukan inisialisasi master data tenant dan kiosk Plaza Kebun Sayur.'],
            ['id_user' => $admArman?->Id_user ?? 2, 'username' => 'sim_admin_kasir', 'role' => 'kasir', 'modul' => 'Pembayaran', 'aksi' => 'Verifikasi Cicilan', 'deskripsi' => 'Kasir Armansyah memverifikasi cicilan Rp 700.000 untuk Kios C1-12 (Indriani Anwar).'],
            ['id_user' => $admRifa?->Id_user ?? 3,  'username' => 'sim_admin_kios', 'role' => 'petugas_kios', 'modul' => 'Kios', 'aksi' => 'Update Status Kios', 'deskripsi' => 'Petugas Rifa memperbarui status Kios A1-01 dan A1-02 (Clara Uenike) menjadi Terisi.'],
            ['id_user' => $admArman?->Id_user ?? 2, 'username' => 'sim_admin_kasir', 'role' => 'kasir', 'modul' => 'Pembayaran', 'aksi' => 'Penolakan Bukti Transfer', 'deskripsi' => 'Kasir Armansyah menolak bukti transfer Kios G2-04 (Elsya Nur Aulia) dikarenakan foto buram.'],
        ];

        foreach ($logs as $lg) {
            ActivityLog::create([
                'id_user'    => $lg['id_user'],
                'username'   => $lg['username'],
                'role'       => $lg['role'],
                'modul'      => $lg['modul'],
                'aksi'       => $lg['aksi'],
                'deskripsi'  => $lg['deskripsi'],
                'ip_address' => '127.0.0.1',
                'created_at' => now()->subHours(rand(2, 48)),
            ]);
        }

        $this->command->info('✅ [SIMULATION SEEDER] Selesai! Seluruh 10 akun anggota tim, data kios, foto struk bank asli, dan skenario tagihan aktif siap digunakan.');
    }
}
