<?php

namespace Tests\Feature;

use App\Models\AppSetting;
use App\Models\Kios;
use App\Models\Notification;
use App\Models\Pemilik;
use App\Models\Role;
use App\Models\Sewa;
use App\Models\Tagihan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class RevisiMitraTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;
    protected User $tenantUser;
    protected Pemilik $pemilik;
    protected Kios $kios;
    protected Sewa $sewa;

    protected function setUp(): void
    {
        parent::setUp();

        Role::create(['Id_roles' => 1, 'Nama_role' => 'Admin']);
        Role::create(['Id_roles' => 2, 'Nama_role' => 'Tenant']);

        $this->adminUser = User::create([
            'Username' => 'admin_test',
            'Password' => Hash::make('AdminPass123!'),
            'Id_roles' => 1,
            'email'    => 'admin@bunsayhub.id',
        ]);

        $this->tenantUser = User::create([
            'Username' => 'tenant_test',
            'Password' => Hash::make('TenantPass123!'),
            'Id_roles' => 2,
            'email'    => 'tenant@bunsayhub.id',
        ]);

        $this->pemilik = Pemilik::create([
            'Id_User'          => $this->tenantUser->Id_user,
            'Nama'             => 'Ibu Fatimah',
            'No_Telepon'       => '081299998888',
            'No_KTP'           => '6471019999990001',
            'Alamat'           => 'Balikpapan',
            'izinkan_cicilan'  => false,
        ]);

        $this->kios = Kios::create([
            'No_Kios' => 'B-12',
            'Lantai'  => 1,
            'Ukuran'  => '3x4 m',
            'Status'  => 'Terisi',
        ]);

        $this->sewa = Sewa::create([
            'Id_Pemilik'     => $this->pemilik->Id_Pemilik,
            'Id_Kios'        => $this->kios->Id_Kios,
            'Jenis_Usaha'    => 'Kain Tenun',
            'Tanggal_Mulai'  => '2026-01-01',
            'Tanggal_Selesai'=> '2026-12-31',
            'Tarif_Bulanan'  => 750000,
            'Status'         => 'Aktif',
        ]);
    }

    public function test_admin_can_read_and_update_penalty_settings(): void
    {
        Sanctum::actingAs($this->adminUser);

        // Get initial setting
        $res = $this->getJson('/api/v1/admin/settings/penalty');
        $res->assertOk()
            ->assertJsonPath('success', true);

        // Update setting to active with percentage
        $updateRes = $this->putJson('/api/v1/admin/settings/penalty', [
            'is_active' => true,
            'type'      => 'percentage',
            'nominal'   => 5.0,
        ]);

        $updateRes->assertOk()
            ->assertJsonPath('data.is_active', true)
            ->assertJsonPath('data.type', 'percentage');

        $this->assertEquals(5.0, (float) $updateRes->json('data.nominal'));

        $this->assertTrue(AppSetting::isPenaltyActive());
        $this->assertEquals(37500.0, AppSetting::calculatePenalty(750000));
    }

    public function test_tenant_without_overdue_bills_is_not_allowed_to_cicil(): void
    {
        // Tagihan berjalan yang belum lewat jatuh tempo
        Tagihan::create([
            'Id_Sewa'        => $this->sewa->Id_Sewa,
            'Periode'        => now()->format('Y-m'),
            'Jatuh_Tempo'    => now()->addDays(10)->toDateString(),
            'Tarif_Sewa'     => 750000,
            'Total_Tagihan'  => 750000,
            'Sisa_Tagihan'   => 750000,
            'Status_Tagihan' => 'Belum Bayar',
        ]);

        Sanctum::actingAs($this->tenantUser);

        $dashRes = $this->getJson('/api/v1/tenant/dashboard');
        $dashRes->assertOk()
            ->assertJsonPath('hasTunggakan', false)
            ->assertJsonPath('izinkanCicilan', false);
    }

    public function test_tenant_with_overdue_bills_is_allowed_to_cicil(): void
    {
        // Tagihan yang telah melewati jatuh tempo (menunggak)
        Tagihan::create([
            'Id_Sewa'        => $this->sewa->Id_Sewa,
            'Periode'        => now()->subMonth()->format('Y-m'),
            'Jatuh_Tempo'    => now()->subDays(5)->toDateString(),
            'Tarif_Sewa'     => 750000,
            'Total_Tagihan'  => 750000,
            'Sisa_Tagihan'   => 750000,
            'Status_Tagihan' => 'Belum Bayar',
        ]);

        Sanctum::actingAs($this->tenantUser);

        $dashRes = $this->getJson('/api/v1/tenant/dashboard');
        $dashRes->assertOk()
            ->assertJsonPath('hasTunggakan', true)
            ->assertJsonPath('izinkanCicilan', true);
    }

    public function test_midtrans_endpoints_return_410_gone(): void
    {
        Sanctum::actingAs($this->tenantUser);

        $snapRes = $this->postJson('/api/v1/tenant/midtrans/token', [
            'Id_Tagihan' => 1,
            'nominal'    => 750000,
        ]);
        $snapRes->assertStatus(410);

        $webhookRes = $this->postJson('/api/v1/midtrans/notification', []);
        $webhookRes->assertStatus(410);
    }
}
