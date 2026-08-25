<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthSecurityTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed core roles for RBAC tests
        Role::create(['Id_roles' => 1, 'Nama_role' => 'Admin']);
        Role::create(['Id_roles' => 2, 'Nama_role' => 'Tenant']);
    }

    /**
     * Test health check endpoint.
     */
    public function test_health_check_endpoint_returns_ok(): void
    {
        $response = $this->getJson('/api/health');

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'OK',
                'service' => 'Insos Bunsay API Backend'
            ]);
    }

    /**
     * Test legacy deprecated auth routes return 410 Gone.
     */
    public function test_legacy_auth_routes_return_410_gone(): void
    {
        $response = $this->postJson('/api/login');
        $response->assertStatus(410);

        $response = $this->postJson('/api/register');
        $response->assertStatus(410);
    }

    /**
     * Test unauthenticated access to protected routes returns 401.
     */
    public function test_protected_routes_require_authentication(): void
    {
        $response = $this->getJson('/api/v1/tenant/dashboard');
        $response->assertStatus(401);

        $response = $this->getJson('/api/v1/admin/kios');
        $response->assertStatus(401);

        $response = $this->getJson('/api/v1/admin/staf');
        $response->assertStatus(401);
    }

    /**
     * Test admin login requires actual hashed password match (backdoor is removed).
     */
    public function test_admin_login_rejects_incorrect_password_and_common_passwords(): void
    {
        User::create([
            'Username' => 'superadmin',
            'Password' => Hash::make('CorrectSecretPassword123!'),
            'Id_roles' => 1,
            'email' => 'superadmin@bunsay.id',
        ]);

        $response = $this->postJson('/api/v1/admin/auth/login', [
            'username' => 'superadmin',
            'password' => 'admin123', // common default that would have bypassed before
        ]);

        $response->assertStatus(401);
    }

    /**
     * Test forgot password returns 404 for non-existent identifiers.
     */
    public function test_forgot_password_returns_404_for_unknown_user(): void
    {
        $response = $this->postJson('/api/v1/tenant/auth/forgot-password', [
            'identifier' => 'non_existent_tenant_999@example.com',
        ]);

        $response->assertStatus(404)
            ->assertJson([
                'message' => 'Nomor WhatsApp, username, atau email tidak ditemukan dalam sistem.'
            ]);
    }
}
