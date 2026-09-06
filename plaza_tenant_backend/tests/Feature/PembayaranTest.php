<?php

namespace Tests\Feature;

use App\Models\Kios;
use App\Models\Pembayaran;
use App\Models\Pemilik;
use App\Models\Role;
use App\Models\Sewa;
use App\Models\Tagihan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PembayaranTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;
    protected User $tenantUser1;
    protected User $tenantUser2;
    protected Pemilik $pemilik1;
    protected Pemilik $pemilik2;
    protected Sewa $sewa1;
    protected Tagihan $tagihan1;
    protected Pembayaran $pembayaran1;

    protected function setUp(): void
    {
        parent::setUp();

        // Clean up test-created sanggahan artifacts between tests without wiping seeded demo files
        foreach (File::glob(public_path('storage/bukti/sanggahan_*')) ?: [] as $testFile) {
            @unlink($testFile);
        }

        Role::create(['Id_roles' => 1, 'Nama_role' => 'Admin']);
        Role::create(['Id_roles' => 2, 'Nama_role' => 'Tenant']);

        $this->adminUser = User::create([
            'Username' => 'admin_tester',
            'Password' => Hash::make('SecretAdminPass123!'),
            'Id_roles' => 1,
            'email' => 'admin@bunsay.id',
        ]);

        $this->tenantUser1 = User::create([
            'Username' => 'tenant_1',
            'Password' => Hash::make('TenantPass123!'),
            'Id_roles' => 2,
            'email' => 'tenant1@bunsay.id',
        ]);

        $this->tenantUser2 = User::create([
            'Username' => 'tenant_2',
            'Password' => Hash::make('TenantPass123!'),
            'Id_roles' => 2,
            'email' => 'tenant2@bunsay.id',
        ]);

        $this->pemilik1 = Pemilik::create([
            'Id_User' => $this->tenantUser1->Id_user,
            'Nama' => 'Tenant Satu',
            'No_Telepon' => '081234567890',
            'No_KTP' => '6471010000000001',
            'Alamat' => 'Balikpapan Barat',
        ]);

        $this->pemilik2 = Pemilik::create([
            'Id_User' => $this->tenantUser2->Id_user,
            'Nama' => 'Tenant Dua',
            'No_Telepon' => '081234567891',
            'No_KTP' => '6471010000000002',
            'Alamat' => 'Balikpapan Kota',
        ]);

        $kios = Kios::create([
            'No_Kios' => 'A-01',
            'Lantai' => 1,
            'Ukuran' => '3x3 m',
            'Status' => 'Terisi',
        ]);

        $this->sewa1 = Sewa::create([
            'Id_Pemilik' => $this->pemilik1->Id_Pemilik,
            'Id_Kios' => $kios->Id_Kios,
            'Jenis_Usaha' => 'Elektronik',
            'Tanggal_Mulai' => '2026-01-01',
            'Tanggal_Selesai' => '2026-12-31',
            'Status' => 'Aktif',
        ]);

        $this->tagihan1 = Tagihan::create([
            'Id_Sewa' => $this->sewa1->Id_Sewa,
            'Periode' => '2026-08',
            'Jatuh_Tempo' => '2026-08-10',
            'Tarif_Sewa' => 1500000,
            'Hutang_Tunggakan' => 0,
            'Total_Tagihan' => 1500000,
            'Sisa_Tagihan' => 1500000,
            'Status_Tagihan' => 'Belum Bayar',
        ]);

        $this->pembayaran1 = Pembayaran::create([
            'Id_Tagihan' => $this->tagihan1->Id_Tagihan,
            'Tanggal_Bayar' => '2026-08-05',
            'Total_Bayar' => 1500000,
            'Metode_Bayar' => 'Transfer',
            'Verifikasi_Pembayaran' => 'Ditolak',
        ]);
    }

    /**
     * Test tenant cannot rebut (sanggah) another tenant's payment (IDOR protection).
     */
    public function test_tenant_cannot_sanggah_other_tenants_payment(): void
    {
        Sanctum::actingAs($this->tenantUser2);

        $response = $this->postJson("/api/v1/tenant/pembayaran/{$this->pembayaran1->Id_Pembayaran}/sanggah", [
            'teks_sanggahan' => 'Ini bukti transfer sah saya yang salah diinput.',
        ]);

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'message' => 'Anda tidak memiliki hak akses untuk menyanggah transaksi ini.',
            ]);
    }

    /**
     * Test owner tenant can successfully submit sanggah.
     */
    public function test_owner_tenant_can_sanggah_their_own_payment(): void
    {
        Sanctum::actingAs($this->tenantUser1);

        $response = $this->postJson("/api/v1/tenant/pembayaran/{$this->pembayaran1->Id_Pembayaran}/sanggah", [
            'teks_sanggahan' => 'Mohon cek ulang, mutasi rekening sudah masuk per 5 Agustus.',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Sanggahan pembayaran berhasil dikirim.',
            ]);

        $this->assertDatabaseHas('pembayaran', [
            'Id_Pembayaran' => $this->pembayaran1->Id_Pembayaran,
            'Verifikasi_Pembayaran' => 'Menunggu',
            'teks_sanggahan' => 'Mohon cek ulang, mutasi rekening sudah masuk per 5 Agustus.',
        ]);
    }

    /**
     * Test owner tenant can submit sanggah with an uploaded file attachment.
     */
    public function test_owner_tenant_can_sanggah_with_attachment(): void
    {
        Sanctum::actingAs($this->tenantUser1);

        $file = \Illuminate\Http\UploadedFile::fake()->create('bukti_baru.png', 100, 'image/png');

        $response = $this->postJson("/api/v1/tenant/pembayaran/{$this->pembayaran1->Id_Pembayaran}/sanggah", [
            'teks_sanggahan'  => 'Lampiran mutasi bank resmi perbaikan.',
            'bukti_sanggahan' => $file,
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Sanggahan pembayaran berhasil dikirim.',
            ]);

        $this->assertDatabaseHas('pembayaran', [
            'Id_Pembayaran'   => $this->pembayaran1->Id_Pembayaran,
            'teks_sanggahan'  => 'Lampiran mutasi bank resmi perbaikan.',
            'Verifikasi_Pembayaran' => 'Menunggu',
        ]);
        $this->assertStringContainsString('storage/bukti/sanggahan_', $this->pembayaran1->fresh()->bukti_sanggahan);
    }

    /**
     * Unsupported file formats are rejected with an explicit 422 and leave
     * no trace (no DB update, no stored file) — evidence is never silently dropped.
     */
    public function test_sanggah_rejects_unsupported_file_format(): void
    {
        Sanctum::actingAs($this->tenantUser1);

        $file = \Illuminate\Http\UploadedFile::fake()->create('bukti.pdf', 100, 'application/pdf');

        $response = $this->postJson("/api/v1/tenant/pembayaran/{$this->pembayaran1->Id_Pembayaran}/sanggah", [
            'teks_sanggahan'  => 'Mencoba melampirkan PDF.',
            'bukti_sanggahan' => $file,
        ]);

        $response->assertStatus(422);

        $this->assertDatabaseMissing('pembayaran', [
            'Id_Pembayaran' => $this->pembayaran1->Id_Pembayaran,
            'teks_sanggahan' => 'Mencoba melampirkan PDF.',
        ]);
        $pdfFiles = File::glob(public_path('storage/bukti/*.pdf')) ?: [];
        $this->assertEmpty($pdfFiles);
    }

    /**
     * Evidence larger than 5MB is rejected with an explicit 422.
 */
    public function test_sanggah_rejects_oversized_file(): void
    {
        Sanctum::actingAs($this->tenantUser1);

        $file = \Illuminate\Http\UploadedFile::fake()->create('bukti_besar.png', 6 * 1024, 'image/png');

        $response = $this->postJson("/api/v1/tenant/pembayaran/{$this->pembayaran1->Id_Pembayaran}/sanggah", [
            'teks_sanggahan'  => 'Lampiran terlalu besar.',
            'bukti_sanggahan' => $file,
        ]);

        $response->assertStatus(422)
            ->assertJsonStructure(['message']);

        $this->assertDatabaseMissing('pembayaran', [
            'Id_Pembayaran' => $this->pembayaran1->Id_Pembayaran,
            'teks_sanggahan' => 'Lampiran terlalu besar.',
        ]);
    }

    /**
     * IDOR protection must run BEFORE any file is written: a wrong tenant
     * posting a valid image gets a 403 and no artifact may survive.
     */
    public function test_sanggah_by_wrong_tenant_leaves_no_files_or_rows(): void
    {
        Sanctum::actingAs($this->tenantUser2);

        $file = \Illuminate\Http\UploadedFile::fake()->create('bukti_baru.png', 100, 'image/png');

        $response = $this->postJson("/api/v1/tenant/pembayaran/{$this->pembayaran1->Id_Pembayaran}/sanggah", [
            'teks_sanggahan'  => 'Saya bukan pemilik transaksi ini.',
            'bukti_sanggahan' => $file,
        ]);

        $response->assertStatus(403);

        $this->assertDatabaseMissing('pembayaran', [
            'Id_Pembayaran' => $this->pembayaran1->Id_Pembayaran,
            'teks_sanggahan' => 'Saya bukan pemilik transaksi ini.',
        ]);
        $sanggahanFiles = File::glob(public_path('storage/bukti/sanggahan_*')) ?: [];
        $this->assertEmpty($sanggahanFiles);
    }

    /**
     * Helper: create a fresh sewa for tenant 1 (one per scenario).
     */
    private function createSewa(): Sewa
    {
        return Sewa::create([
            'Id_Pemilik' => $this->pemilik1->Id_Pemilik,
            'Id_Kios' => $this->sewa1->Id_Kios,
            'Jenis_Usaha' => 'Elektronik',
            'Tanggal_Mulai' => '2026-02-01',
            'Tanggal_Selesai' => '2026-12-31',
            'Status' => 'Aktif',
        ]);
    }

    /**
     * Helper: create an open tagihan, optionally on an existing sewa
     * (FIFO scenarios need several tagihan on the SAME sewa).
     */
    private function createOpenTagihan(float $total = 1500000, ?int $sewaId = null): Tagihan
    {
        $sewaId ??= $this->createSewa()->Id_Sewa;

        return Tagihan::create([
            'Id_Sewa' => $sewaId,
            'Periode' => '2026-09',
            'Jatuh_Tempo' => '2026-09-10',
            'Tarif_Sewa' => $total,
            'Hutang_Tunggakan' => 0,
            'Total_Tagihan' => $total,
            'Sisa_Tagihan' => $total,
            'Status_Tagihan' => 'Belum Bayar',
        ]);
    }

    /**
     * Transfer payments must be verified by an admin: even if the client
     * claims Verifikasi_Pembayaran = Diterima, the server stores Menunggu
     * and the tagihan is NOT marked Lunas.
     */
    public function test_store_forces_transfer_to_menunggu_despite_client_claiming_diterima(): void
    {
        Sanctum::actingAs($this->tenantUser1);
        $tagihan = $this->createOpenTagihan();

        $response = $this->postJson('/api/v1/tenant/pembayaran', [
            'Id_Tagihan'            => $tagihan->Id_Tagihan,
            'Tanggal_Bayar'         => '2026-09-01',
            'Total_Bayar'           => 1500000,
            'Metode_Bayar'          => 'Transfer',
            'Verifikasi_Pembayaran' => 'Diterima',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('Verifikasi_Pembayaran', 'Menunggu');

        $this->assertDatabaseHas('pembayaran', [
            'Id_Tagihan' => $tagihan->Id_Tagihan,
            'Verifikasi_Pembayaran' => 'Menunggu',
        ]);
        $this->assertDatabaseHas('tagihan', [
            'Id_Tagihan' => $tagihan->Id_Tagihan,
            'Status_Tagihan' => 'Belum Bayar',
        ]);
    }

    /**
     * Midtrans payments are auto-accepted and settle the tagihan immediately.
     */
    public function test_store_midtrans_auto_accepts_and_settles_tagihan(): void
    {
        Sanctum::actingAs($this->tenantUser1);
        $tagihan = $this->createOpenTagihan();

        $response = $this->postJson('/api/v1/tenant/pembayaran', [
            'Id_Tagihan'    => $tagihan->Id_Tagihan,
            'Tanggal_Bayar' => '2026-09-01',
            'Total_Bayar'   => 1500000,
            'Metode_Bayar'  => 'Midtrans',
            'Bukti_Pembayaran' => 'MIDTRANS-ORDER-9911',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('Verifikasi_Pembayaran', 'Diterima');

        $this->assertDatabaseHas('tagihan', [
            'Id_Tagihan' => $tagihan->Id_Tagihan,
            'Status_Tagihan' => 'Lunas',
            'Sisa_Tagihan' => 0,
        ]);
    }

    /**
     * Test admin konfirmasi with invalid ID returns 404 (no fallback to random payment).
     */
    public function test_admin_konfirmasi_returns_404_for_invalid_id(): void
    {
        Sanctum::actingAs($this->adminUser);

        $response = $this->putJson('/api/v1/admin/pembayaran/99999/konfirmasi', [
            'status' => 'Diterima',
            'catatan_admin' => 'Sudah diverifikasi rekening koran',
        ]);

        $response->assertStatus(404)
            ->assertJson([
                'message' => 'Data pembayaran tidak ditemukan.',
            ]);
    }

    /**
     * Test staf management update returns 404 for non-existent staff ID.
     */
    public function test_staf_update_returns_404_when_not_found(): void
    {
        Sanctum::actingAs($this->adminUser);

        $response = $this->putJson('/api/v1/admin/staf/99999', [
            'nama_lengkap' => 'Ghost Staff',
            'email' => 'ghost@bunsay.id',
            'sub_role' => 'kasir',
            'permissions' => ['input_setoran'],
        ]);

        $response->assertStatus(404)
            ->assertJson([
                'message' => 'Akun staf tidak ditemukan.',
            ]);
    }

    /**
     * Test public receipt verification returns 404 for non-existent random code.
     */
    public function test_public_verifikasi_resi_rejects_random_code(): void
    {
        $response = $this->getJson('/api/v1/public/verifikasi-resi?code=RANDOM-123456');

        $response->assertStatus(404)
            ->assertJson([
                'valid' => false,
            ]);
    }

    /**
     * Schema parity: production MySQL allows multiple tagihan per sewa and
     * multiple pembayaran per tagihan (unique constraints dropped in
     * 2026_08_07 + portable re-run in 2026_09_06). SQLite must match.
     */
    public function test_schema_allows_multiple_tagihan_per_sewa_and_multiple_payments(): void
    {
        $t1 = Tagihan::create([
            'Id_Sewa' => $this->sewa1->Id_Sewa,
            'Periode' => '2026-09',
            'Jatuh_Tempo' => '2026-09-10',
            'Tarif_Sewa' => 1500000,
            'Hutang_Tunggakan' => 0,
            'Total_Tagihan' => 1500000,
            'Sisa_Tagihan' => 1500000,
            'Status_Tagihan' => 'Belum Bayar',
        ]);
        $t2 = Tagihan::create([
            'Id_Sewa' => $this->sewa1->Id_Sewa,
            'Periode' => '2026-10',
            'Jatuh_Tempo' => '2026-10-10',
            'Tarif_Sewa' => 1500000,
            'Hutang_Tunggakan' => 0,
            'Total_Tagihan' => 1500000,
            'Sisa_Tagihan' => 1500000,
            'Status_Tagihan' => 'Belum Bayar',
        ]);

        Pembayaran::create([
            'Id_Tagihan' => $t1->Id_Tagihan,
            'Tanggal_Bayar' => '2026-09-05',
            'Total_Bayar' => 500000,
            'Metode_Bayar' => 'Transfer',
            'Verifikasi_Pembayaran' => 'Menunggu',
        ]);
        $second = Pembayaran::create([
            'Id_Tagihan' => $t1->Id_Tagihan,
            'Tanggal_Bayar' => '2026-09-06',
            'Total_Bayar' => 1000000,
            'Metode_Bayar' => 'Transfer',
            'Verifikasi_Pembayaran' => 'Menunggu',
        ]);

        $this->assertNotNull($t2->Id_Tagihan);
        $this->assertNotNull($second->Id_Pembayaran);
        $this->assertSame(2, Pembayaran::where('Id_Tagihan', $t1->Id_Tagihan)->count());
    }

    /**
     * FIFO partial payment: paying less than the targeted tagihan's remaining
     * amount allocates to the OLDEST open tagihan of the same sewa first.
     */
    public function test_partial_payment_allocates_fifo_to_oldest_tagihan(): void
    {
        Sanctum::actingAs($this->tenantUser1);

        $sewa = $this->createSewa();
        $old = $this->createOpenTagihan(1500000, $sewa->Id_Sewa); // T-tua: sisa 1.500.000
        $new = $this->createOpenTagihan(1000000, $sewa->Id_Sewa); // target: sisa 1.000.000

        // 800rb < 1.000.000 sisa target → partial → FIFO ke tagihan tertua.
        $response = $this->postJson('/api/v1/tenant/pembayaran', [
            'Id_Tagihan'    => $new->Id_Tagihan,
            'Tanggal_Bayar' => '2026-09-01',
            'Total_Bayar'   => 800000,
            'Metode_Bayar'  => 'Midtrans',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('Verifikasi_Pembayaran', 'Diterima');

        // Tagihan tertua menyerap seluruh 800rb (Dicicil, sisa 700rb);
        // tagihan target tidak tersentuh.
        $this->assertDatabaseHas('tagihan', [
            'Id_Tagihan' => $old->Id_Tagihan,
            'Status_Tagihan' => 'Dicicil',
            'Sisa_Tagihan' => 700000,
        ]);
        $this->assertDatabaseHas('tagihan', [
            'Id_Tagihan' => $new->Id_Tagihan,
            'Status_Tagihan' => 'Belum Bayar',
            'Sisa_Tagihan' => 1000000,
        ]);
    }

    /**
     * FIFO on admin verification: accepting a Transfer payment allocates
     * across the oldest open tagihan of the sewa, in order.
     */
    public function test_konfirmasi_diterima_allocates_fifo_across_open_tagihan(): void
    {
        Sanctum::actingAs($this->tenantUser1);

        $sewa = $this->createSewa();
        $old = $this->createOpenTagihan(1500000, $sewa->Id_Sewa); // sisa 1.500.000
        $new = $this->createOpenTagihan(1000000, $sewa->Id_Sewa); // anchor: sisa 1.000.000

        $pembayaran = Pembayaran::create([
            'Id_Tagihan' => $new->Id_Tagihan,
            'Tanggal_Bayar' => '2026-09-01',
            'Total_Bayar' => 2000000,
            'Metode_Bayar' => 'Transfer',
            'Verifikasi_Pembayaran' => 'Menunggu',
        ]);

        Sanctum::actingAs($this->adminUser);
        $response = $this->putJson("/api/v1/admin/pembayaran/{$pembayaran->Id_Pembayaran}/konfirmasi", [
            'status' => 'Diterima',
        ]);

        $response->assertStatus(200);

        // 2.000.000: tagihan tertua lunas penuh (1.500.000),
        // sisanya 500.000 membuat tagihan kedua Dicicil.
        $this->assertDatabaseHas('tagihan', [
            'Id_Tagihan' => $old->Id_Tagihan,
            'Status_Tagihan' => 'Lunas',
            'Sisa_Tagihan' => 0,
        ]);
        $this->assertDatabaseHas('tagihan', [
            'Id_Tagihan' => $new->Id_Tagihan,
            'Status_Tagihan' => 'Dicicil',
            'Sisa_Tagihan' => 500000,
        ]);
    }

    /**
     * Bare call (no ?page) keeps the legacy full-array shape consumed by
     * every existing admin page.
     */
    public function test_index_without_page_param_returns_legacy_array(): void
    {
        Sanctum::actingAs($this->adminUser);

        $response = $this->getJson('/api/v1/admin/pembayaran');

        $response->assertStatus(200);
        $this->assertIsArray($response->json());
        $this->assertArrayNotHasKey('data', $response->json());
        $this->assertGreaterThanOrEqual(1, count($response->json()));
    }

    /**
     ? Paginated call returns the envelope with metadata.
     */
    public function test_index_with_page_param_returns_pagination_envelope(): void
    {
        Sanctum::actingAs($this->adminUser);

        $response = $this->getJson('/api/v1/admin/pembayaran?page=1&page_size=5');

        $response->assertStatus(200)
            ->assertJsonStructure(['data', 'current_page', 'last_page', 'per_page', 'total'])
            ->assertJsonPath('current_page', 1)
            ->assertJsonPath('per_page', 5);
        $this->assertLessThanOrEqual(5, count($response->json('data')));
    }

    /**
     * Tenant pagination is scoped to the tenant's own payments only.
     */
    public function test_tenant_paginated_index_scopes_to_own_payments(): void
    {
        Sanctum::actingAs($this->tenantUser1);

        $response = $this->getJson('/api/v1/tenant/pembayaran?page=1&page_size=5');

        $response->assertStatus(200)
            ->assertJsonPath('current_page', 1);

        foreach ($response->json('data') as $row) {
            $this->assertSame($this->pemilik1->Nama, $row['tagihan']['sewa']['pemilik']['Nama']);
        }
    }

    /**
     * Server-side status filter works on the paginated shape.
     */
    public function test_index_paginated_filters_by_status(): void
    {
        Sanctum::actingAs($this->adminUser);

        $response = $this->getJson('/api/v1/admin/pembayaran?page=1&page_size=50&status=Ditolak');

        $response->assertStatus(200);
        foreach ($response->json('data') as $row) {
            $this->assertSame('Ditolak', $row['Verifikasi_Pembayaran']);
        }
    }

    /**
     * Server-side search matches TRX id (numeric) — TRX-<id> prefixes are
     * stripped by the client, bare numeric ids match Id_Pembayaran.
     */
    public function test_index_paginated_search_by_trx_id(): void
    {
        Sanctum::actingAs($this->adminUser);

        $response = $this->getJson('/api/v1/admin/pembayaran?page=1&page_size=50&q=' . $this->pembayaran1->Id_Pembayaran);

        $response->assertStatus(200);
        $ids = array_column($response->json('data'), 'Id_Pembayaran');
        $this->assertContains($this->pembayaran1->Id_Pembayaran, $ids);
    }

    /**
     * Server-side sorting: whitelisted columns, asc/desc only. Unknown keys
     * and injection attempts fall back to the default order.
     */
    public function test_index_paginated_sorting_whitelist(): void
    {
        Sanctum::actingAs($this->adminUser);

        // Nominal asc: nilai termahal harus di akhir.
        $asc = $this->getJson('/api/v1/admin/pembayaran?page=1&page_size=50&sort_by=nominal&sort_dir=asc');
        $asc->assertStatus(200);
        $nominals = array_column($asc->json('data'), 'Total_Bayar');
        $sortedNominals = $nominals;
        sort($nominals);
        $this->assertSame($nominals, $sortedNominals, 'nominal asc harus terurut naik');

        // Kolom whitelist lain tetap valid.
        $this->getJson('/api/v1/admin/pembayaran?page=1&page_size=5&sort_by=status&sort_dir=desc')
            ->assertStatus(200);

        // Key tidak dikenal / payloadInjection → fallback default, bukan error.
        $this->getJson('/api/v1/admin/pembayaran?page=1&page_size=5&sort_by=Id_Pembayaran; DROP TABLE pembayaran')
            ->assertStatus(200);
        $this->getJson('/api/v1/admin/pembayaran?page=1&page_size=5&sort_by=tanggal&sort_dir=notadir')
            ->assertStatus(200);
    }

    /**
     * Multi-status filter (?status=Diterima,Ditolak) untuk tab riwayat admin.
     */
    public function test_index_paginated_supports_multi_status_filter(): void
    {
        Sanctum::actingAs($this->adminUser);

        $response = $this->getJson('/api/v1/admin/pembayaran?page=1&page_size=50&status=Diterima,Ditolak');

        $response->assertStatus(200);
        foreach ($response->json('data') as $row) {
            $this->assertContains($row['Verifikasi_Pembayaran'], ['Diterima', 'Ditolak']);
        }
    }

    /**
     * Test public receipt verification validates legitimate paid transaction.
     */
    public function test_public_verifikasi_resi_validates_legitimate_payment(): void
    {
        $this->pembayaran1->update([
            'Verifikasi_Pembayaran' => 'Diterima',
            'Bukti_Pembayaran' => 'BUNSAY-TAG-1024',
        ]);

        $response = $this->getJson('/api/v1/public/verifikasi-resi?code=TRX-' . $this->pembayaran1->Id_Pembayaran);

        $response->assertStatus(200)
            ->assertJson([
                'valid' => true,
                'status' => 'LUNAS',
                'data' => [
                    'no_kuitansi' => 'TRX-' . $this->pembayaran1->Id_Pembayaran,
                    'total_bayar' => 1500000,
                ],
            ]);
    }
}
