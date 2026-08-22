<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

/**
 * BulkStressSeeder — Generate ~20.000 records untuk validasi performa index.
 *
 * Strategi: DB::table()->insert() dalam batch 500 baris (bukan Eloquent model).
 * Alasan: Raw insert 10-50x lebih cepat karena skip model events, casting, dll.
 *
 * Data yang dibuat:
 *   - 2.000 akun User tenant baru  (bulk_tenant_1 .. bulk_tenant_2000)
 *   - 2.000 data Pemilik
 *   - 2.000 data Sewa (1 kios per tenant, kios dibuat otomatis)
 *   - 10.000 Tagihan (rata2 5 tagihan per tenant, berbagai status)
 *   - 6.000 Pembayaran (tanggal tersebar selama 2 tahun)
 *
 * Total rows: ~22.000 baris baru di database.
 *
 * Jalankan: php artisan db:seed --class=BulkStressSeeder
 */
class BulkStressSeeder extends Seeder
{
    private const TENANT_COUNT = 2000;
    private const TAGIHAN_PER_TENANT = 5;
    private const BATCH_SIZE = 500;

    private int $roleIdTenant = 2;
    private string $passwordHash;

    public function __construct()
    {
        $this->passwordHash = Hash::make('password123');
    }

    public function run(): void
    {
        $this->command->info('BulkStressSeeder: Generating ~22.000 rows...');

        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        $this->seedUsers();
        $this->seedPemilik();
        $this->seedSewaAndKios();
        $this->seedTagihan();
        $this->seedPembayaran();

        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $this->command->info('BulkStressSeeder: Selesai!');
        $this->command->table(
            ['Tabel', 'Estimasi Baris Baru'],
            [
                ['users',      self::TENANT_COUNT],
                ['pemilik',    self::TENANT_COUNT],
                ['kios',       self::TENANT_COUNT],
                ['sewa',       self::TENANT_COUNT],
                ['tagihan',    self::TENANT_COUNT * self::TAGIHAN_PER_TENANT],
                ['pembayaran', '~' . (self::TENANT_COUNT * self::TAGIHAN_PER_TENANT * 0.6)],
            ]
        );
    }

    // ============================================================
    // 1. USERS — 2.000 akun tenant
    // ============================================================
    private function seedUsers(): void
    {
        $this->command->info('  → Seeding users...');
        $batch = [];

        for ($i = 1; $i <= self::TENANT_COUNT; $i++) {
            $batch[] = [
                'Id_roles'    => $this->roleIdTenant,
                'Username'    => "bulk_tenant_{$i}",
                'Password'    => $this->passwordHash,
                'nama_lengkap'=> $this->fakeName($i),
                'email'       => "bulk.tenant.{$i}@bunsay.id",
                'sub_role'    => 'tenant',
                'status_aktif'=> 1,
                'permissions' => '[]',
            ];

            if (count($batch) >= self::BATCH_SIZE) {
                DB::table('user')->insertOrIgnore($batch);
                $batch = [];
            }
        }

        if (!empty($batch)) {
            DB::table('user')->insertOrIgnore($batch);
        }
    }

    // ============================================================
    // 2. PEMILIK — 2.000 data penyewa
    // ============================================================
    private function seedPemilik(): void
    {
        $this->command->info('  → Seeding pemilik...');

        // Ambil Id_user dari user yang baru saja dibuat
        $users = DB::table('user')
            ->where('Username', 'like', 'bulk_tenant_%')
            ->select('Id_user', 'nama_lengkap')
            ->get();

        $batch = [];

        foreach ($users as $user) {
            $batch[] = [
                'Id_User'    => $user->Id_user,
                'Nama'       => $user->nama_lengkap,
                'No_Telepon' => '08' . str_pad(rand(100000000, 999999999), 9, '0'),
                'No_KTP'     => '6471' . str_pad($user->Id_user, 12, '0', STR_PAD_LEFT),
                'Alamat'     => 'Jl. Kebun Sayur No. ' . rand(1, 500) . ', Balikpapan',
            ];

            if (count($batch) >= self::BATCH_SIZE) {
                DB::table('pemilik')->insertOrIgnore($batch);
                $batch = [];
            }
        }

        if (!empty($batch)) {
            DB::table('pemilik')->insertOrIgnore($batch);
        }
    }

    // ============================================================
    // 3. KIOS + SEWA — 1 kios baru per tenant, langsung status Terisi
    // ============================================================
    private function seedSewaAndKios(): void
    {
        $this->command->info('  → Seeding kios + sewa...');

        $pemilikList = DB::table('pemilik')
            ->join('user', 'pemilik.Id_User', '=', 'user.Id_user')
            ->where('user.Username', 'like', 'bulk_tenant_%')
            ->select('pemilik.Id_Pemilik')
            ->get();

        $sizes   = ['3x3 m²', '3x4 m²', '4x4 m²', '4x5 m²', '5x5 m²'];
        $usahas  = ['Pakaian', 'Makanan', 'Elektronik', 'Sembako', 'Aksesoris', 'Kosmetik'];
        $kiosBatch = [];
        $sewaBatch = [];
        $counter = 1;

        foreach ($pemilikList as $pemilik) {
            $noKios = 'BLK-' . str_pad($counter, 5, '0', STR_PAD_LEFT);

            // Insert kios satu per satu karena butuh lastInsertId
            $kiosId = DB::table('kios')->insertGetId([
                'No_Kios' => $noKios,
                'Lantai'  => ($counter % 2 === 0) ? 2 : 1,
                'Ukuran'  => $sizes[array_rand($sizes)],
                'Status'  => 'Terisi',
            ]);

            $mulai   = Carbon::now()->subMonths(rand(6, 36));
            $selesai = $mulai->copy()->addYears(rand(1, 3));

            $sewaBatch[] = [
                'Id_Pemilik'     => $pemilik->Id_Pemilik,
                'Id_Kios'        => $kiosId,
                'Jenis_Usaha'    => $usahas[array_rand($usahas)],
                'Tanggal_Mulai'  => $mulai->toDateString(),
                'Tanggal_Selesai'=> $selesai->toDateString(),
                'Status'         => 'Aktif',
                'Tarif_Bulanan'  => $this->randomTarif(),
            ];

            if (count($sewaBatch) >= self::BATCH_SIZE) {
                DB::table('sewa')->insert($sewaBatch);
                $sewaBatch = [];
            }

            $counter++;
        }

        if (!empty($sewaBatch)) {
            DB::table('sewa')->insert($sewaBatch);
        }
    }

    // ============================================================
    // 4. TAGIHAN — rata-rata 5 tagihan per tenant (10.000 total)
    // ============================================================
    private function seedTagihan(): void
    {
        $this->command->info('  → Seeding tagihan (10.000 rows)...');

        $sewaList = DB::table('sewa')
            ->join('pemilik', 'sewa.Id_Pemilik', '=', 'pemilik.Id_Pemilik')
            ->join('user', 'pemilik.Id_User', '=', 'user.Id_user')
            ->where('user.Username', 'like', 'bulk_tenant_%')
            ->select('sewa.Id_Sewa', 'sewa.Tanggal_Mulai', 'sewa.Tarif_Bulanan')
            ->get();

        $statusOptions = ['Lunas', 'Lunas', 'Lunas', 'Belum Bayar', 'Menunggu Verifikasi'];
        $batch = [];

        foreach ($sewaList as $sewa) {
            $mulai = Carbon::parse($sewa->Tanggal_Mulai);
            $tarif = (float) ($sewa->Tarif_Bulanan ?? 750000);

            for ($m = 0; $m < self::TAGIHAN_PER_TENANT; $m++) {
                $periode    = $mulai->copy()->addMonths($m);
                $jatuhTempo = $periode->copy()->endOfMonth();
                $status     = $statusOptions[array_rand($statusOptions)];
                $hutang     = ($m > 0 && rand(0, 4) === 0) ? $tarif : 0;
                $total      = $tarif + $hutang;
                $sisa       = ($status === 'Lunas') ? 0 : $total;

                $batch[] = [
                    'Id_Sewa'          => $sewa->Id_Sewa,
                    'Periode'          => $periode->format('Y-m'),
                    'Jatuh_Tempo'      => $jatuhTempo->toDateString(),
                    'Tarif_Sewa'       => $tarif,
                    'Hutang_Tunggakan' => $hutang,
                    'Total_Tagihan'    => $total,
                    'Sisa_Tagihan'     => $sisa,
                    'Status_Tagihan'   => $status,
                ];

                if (count($batch) >= self::BATCH_SIZE) {
                    DB::table('tagihan')->insert($batch);
                    $batch = [];
                }
            }
        }

        if (!empty($batch)) {
            DB::table('tagihan')->insert($batch);
        }
    }

    // ============================================================
    // 5. PEMBAYARAN — ~60% tagihan yang Lunas atau Menunggu punya record pembayaran
    //    Tanggal tersebar 2 tahun ke belakang untuk menguji index Tanggal_Bayar
    // ============================================================
    private function seedPembayaran(): void
    {
        $this->command->info('  → Seeding pembayaran (~6.000 rows)...');

        $tagihanList = DB::table('tagihan')
            ->join('sewa', 'tagihan.Id_Sewa', '=', 'sewa.Id_Sewa')
            ->join('pemilik', 'sewa.Id_Pemilik', '=', 'pemilik.Id_Pemilik')
            ->join('user', 'pemilik.Id_User', '=', 'user.Id_user')
            ->where('user.Username', 'like', 'bulk_tenant_%')
            ->whereIn('tagihan.Status_Tagihan', ['Lunas', 'Menunggu Verifikasi'])
            ->select('tagihan.Id_Tagihan', 'tagihan.Total_Tagihan', 'tagihan.Jatuh_Tempo')
            ->get();

        $metodes = ['Transfer', 'Tunai', 'Midtrans'];
        $batch   = [];

        foreach ($tagihanList as $tagihan) {
            // Tanggal bayar tersebar acak 0-30 hari sebelum jatuh tempo
            $jatuhTempo = Carbon::parse($tagihan->Jatuh_Tempo);
            $tanggalBayar = $jatuhTempo->copy()->subDays(rand(0, 30));

            // Pastikan tanggal tidak di masa depan
            if ($tanggalBayar->isFuture()) {
                $tanggalBayar = Carbon::now()->subDays(rand(1, 7));
            }

            $batch[] = [
                'Id_Tagihan'            => $tagihan->Id_Tagihan,
                'Tanggal_Bayar'         => $tanggalBayar->toDateString(),
                'Total_Bayar'           => (float) $tagihan->Total_Tagihan,
                'Metode_Bayar'          => $metodes[array_rand($metodes)],
                'Bukti_Pembayaran'      => null,
                'Verifikasi_Pembayaran' => 'Diterima',
            ];

            if (count($batch) >= self::BATCH_SIZE) {
                DB::table('pembayaran')->insertOrIgnore($batch);
                $batch = [];
            }
        }

        if (!empty($batch)) {
            DB::table('pembayaran')->insertOrIgnore($batch);
        }
    }

    // ============================================================
    // HELPERS
    // ============================================================
    private function fakeName(int $seed): string
    {
        $depan  = ['H. Ahmad', 'Hj. Siti', 'Budi', 'Dewi', 'Rizky', 'Andi', 'Nurul', 'Rudi', 'Lina', 'Wahyu'];
        $tengah = ['Santoso', 'Rahmawati', 'Pratama', 'Lestari', 'Subandi', 'Kurniawan', 'Wati', 'Susanto'];
        $bisnis = ['(Toko Pakaian)', '(Warung Makan)', '(Servis HP)', '(Sembako)', '(Grosir)', '(Kue & Roti)', '(Konter Pulsa)'];

        return $depan[$seed % count($depan)] . ' ' .
               $tengah[$seed % count($tengah)] . ' ' .
               $bisnis[$seed % count($bisnis)];
    }

    private function randomTarif(): float
    {
        $tiers = [500000, 600000, 750000, 850000, 1000000, 1250000];
        return $tiers[array_rand($tiers)];
    }
}
