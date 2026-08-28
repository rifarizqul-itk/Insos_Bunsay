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
