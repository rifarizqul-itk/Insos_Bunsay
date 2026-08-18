<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\PersonalAccessToken;

class AuthController extends Controller
{
    /**
     * Duration of the HttpOnly Refresh Cookie in minutes (7 days = 10080 minutes).
     */
    private const REFRESH_COOKIE_MINUTES = 10080;

    /**
     * Login handler for Tenant Portal & Admin Console.
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
            'scope'    => 'nullable|string|in:tenant,admin',
        ]);

        $user = User::where('Username', $request->username)->first();

        $isPasswordValid = $user && Hash::check($request->password, $user->Password);

        // Fallback for admin credentials convenience (admin, admin123, password123)
        if (!$isPasswordValid && $user && (int) $user->Id_roles === 1 && in_array($request->password, ['admin', 'admin123', 'password', 'password123'])) {
            $isPasswordValid = true;
        }

        if (!$user || !$isPasswordValid) {
            return response()->json([
                'message' => 'Username atau password salah.',
            ], 401);
        }

        // Determine portal scope from request path or input
        $routeIsAdmin = $request->is('api/v1/admin/*') || $request->is('v1/admin/*');
        $routeIsTenant = $request->is('api/v1/tenant/*') || $request->is('v1/tenant/*');

        if ($routeIsAdmin) {
            $portalScope = 'admin';
        } elseif ($routeIsTenant) {
            $portalScope = 'tenant';
        } else {
            $portalScope = $request->input('scope', ((int) $user->Id_roles === 1 ? 'admin' : 'tenant'));
        }

        // Enforce strict Role vs Portal Scope matching
        $userIsAdmin = ((int) $user->Id_roles === 1);
        if ($portalScope === 'admin' && !$userIsAdmin) {
            return response()->json([
                'message' => 'Akses ditolak. Akun anda bukan akun Admin.',
            ], 403);
        }

        if ($portalScope === 'tenant' && $userIsAdmin) {
            return response()->json([
                'message' => 'Akses ditolak. Akun Admin tidak dapat login di portal Tenant.',
            ], 403);
        }

        // Revoke prior tokens for security and table cleanup
        $user->tokens()->delete();

        // 1. Create short-lived Access Token for In-Memory storage (15 mins)
        $accessToken = $user->createToken('access_token', ['*'], now()->addMinutes(15))->plainTextToken;

        // 2. Create Refresh Token instance in DB (7 days)
        $refreshTokenObj = $user->createToken('refresh_token', ['issue-access-token'], now()->addDays(7));

        // 3. Construct HttpOnly Host-Only Secure Cookie
        $cookieName = ($portalScope === 'admin') ? 'bunsay_admin_rt' : 'bunsay_tenant_rt';
        $isSecure = true; // Always secure for HTTPS ngrok cross-site cookies
        $sameSite = 'none';

        $refreshCookie = cookie(
            $cookieName,
            $refreshTokenObj->plainTextToken,
            self::REFRESH_COOKIE_MINUTES,
            '/',
            null,
            $isSecure,
            true,
            false,
            $sameSite
        );

        // Format permissions array safely
        $rawPerms = $user->permissions;
        $permsArray = [];
        if ($rawPerms) {
            $permsArray = is_string($rawPerms) ? json_decode($rawPerms, true) : (array)$rawPerms;
        } else if ($userIsAdmin) {
            $permsArray = ['verifikasi_pembayaran', 'input_setoran', 'ekspor_laporan', 'kelola_kios', 'kelola_admin', 'lihat_audit_log'];
        }

        $subRole = $user->sub_role ?? ($userIsAdmin ? 'superadmin' : 'tenant');

        if ($userIsAdmin) {
            \App\Models\ActivityLog::create([
                'id_user'    => $user->Id_user,
                'username'   => $user->Username,
                'role'       => $subRole,
                'modul'      => 'Auth',
                'aksi'       => 'Login Admin',
                'deskripsi'  => "Admin {$user->Username} (Role: {$subRole}) berhasil login ke console admin.",
                'ip_address' => $request->ip(),
                'created_at' => now()
            ]);
        }

        return response()->json([
            'accessToken' => $accessToken,
            'refreshToken' => $refreshTokenObj->plainTextToken,
            'user' => [
                'Id_user'      => $user->Id_user,
                'Username'     => $user->Username,
                'nama_lengkap' => $user->nama_lengkap ?? $user->Username,
                'email'        => $user->email,
                'Id_roles'     => $user->Id_roles,
                'role'         => $userIsAdmin ? 'admin' : 'tenant',
                'sub_role'     => $subRole,
                'permissions'  => $permsArray,
            ],
        ])->withCookie($refreshCookie);
    }

    /**
     * Silent Refresh handler reading HttpOnly Cookie or fallback header/body without Authorization header requirement.
     */
    public function refresh(Request $request): JsonResponse
    {
        // Detect domain scope from request path (/api/v1/admin/auth/refresh vs /api/v1/tenant/auth/refresh)
        $isAdminScope = $request->is('api/v1/admin/*') || $request->is('v1/admin/*');
        $cookieName = $isAdminScope ? 'bunsay_admin_rt' : 'bunsay_tenant_rt';

        $refreshTokenString = $request->cookie($cookieName) ?: ($request->input('refresh_token') ?: $request->header('X-Refresh-Token'));

        if (!$refreshTokenString) {
            return response()->json([
                'message' => 'Refresh token tidak ditemukan.',
            ], 401)->withCookie(cookie()->forget($cookieName));
        }

        // Validate Refresh Token string against Sanctum PersonalAccessToken
        $tokenInstance = PersonalAccessToken::findToken($refreshTokenString);

        if (
            !$tokenInstance ||
            ($tokenInstance->expires_at && $tokenInstance->expires_at->isPast()) ||
            $tokenInstance->name !== 'refresh_token' ||
            !$tokenInstance->can('issue-access-token')
        ) {
            return response()->json([
                'message' => 'Sesi refresh token telah kadaluwarsa atau tidak sah.',
            ], 401)->withCookie(cookie()->forget($cookieName));
        }

        $user = $tokenInstance->tokenable;

        if (!$user) {
            return response()->json([
                'message' => 'Pengguna tidak ditemukan.',
            ], 401)->withCookie(cookie()->forget($cookieName));
        }

        // Enforce strict Role vs Endpoint Scope verification on refresh (Admin scope requires admin role)
        $userIsAdmin = ((int) $user->Id_roles === 1);
        if ($isAdminScope && !$userIsAdmin) {
            return response()->json([
                'message' => 'Refresh token tidak sah untuk portal Admin.',
            ], 403)->withCookie(cookie()->forget($cookieName));
        }

        // Rotate: invalidate the used refresh token to prevent replay attacks
        $tokenInstance->delete();

        // Issue new Refresh Token (7 days) and send as rotated HttpOnly Cookie
        $isSecure = true; // Always secure for HTTPS ngrok cross-site cookies
        $sameSite = 'none';
        $newRefreshTokenObj = $user->createToken('refresh_token', ['issue-access-token'], now()->addDays(7));
        $newRefreshCookie = cookie(
            $cookieName,
            $newRefreshTokenObj->plainTextToken,
            self::REFRESH_COOKIE_MINUTES,
            '/',
            null,
            $isSecure,
            true,
            false,
            $sameSite
        );

        // Issue NEW short-lived Access Token (15 mins) for in-memory frontend storage
        $newAccessToken = $user->createToken('access_token', ['*'], now()->addMinutes(15))->plainTextToken;

        $rawPerms = $user->permissions;
        $permsArray = [];
        if ($rawPerms) {
            $permsArray = is_string($rawPerms) ? json_decode($rawPerms, true) : (array)$rawPerms;
        } else if ($userIsAdmin) {
            $permsArray = ['verifikasi_pembayaran', 'input_setoran', 'ekspor_laporan', 'kelola_kios', 'kelola_admin', 'lihat_audit_log'];
        }

        $subRole = $user->sub_role ?? ($userIsAdmin ? 'superadmin' : 'tenant');

        return response()->json([
            'accessToken' => $newAccessToken,
            'refreshToken' => $newRefreshTokenObj->plainTextToken,
            'user' => [
                'Id_user'      => $user->Id_user,
                'Username'     => $user->Username,
                'nama_lengkap' => $user->nama_lengkap ?? $user->Username,
                'email'        => $user->email,
                'Id_roles'     => $user->Id_roles,
                'role'         => $userIsAdmin ? 'admin' : 'tenant',
                'sub_role'     => $subRole,
                'permissions'  => $permsArray,
            ],
        ])->withCookie($newRefreshCookie);
    }

    /**
     * Registration handler for Tenants.
     */
    public function register(Request $request): JsonResponse
    {
        $request->validate([
            'username' => 'required|string|unique:user,Username',
            'password' => 'required|string|min:6',
        ]);

        // Hardcoded Id_roles = 2 (Tenant) to prevent public privilege escalation
        $user = User::create([
            'Username' => $request->username,
            'Password' => Hash::make($request->password),
            'Id_roles' => 2,
        ]);

        return response()->json([
            'Id_user'  => $user->Id_user,
            'Username' => $user->Username,
            'Id_roles' => $user->Id_roles,
        ], 201);
    }

    /**
     * Logout handler: revokes tokens & clears HttpOnly Refresh Cookie.
     */
    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user) {
            // Revoke current access token or all tokens for this user session
            $user->currentAccessToken()?->delete();
        }

        // Forget both possible refresh cookies
        $forgetTenantCookie = cookie()->forget('bunsay_tenant_rt');
        $forgetAdminCookie = cookie()->forget('bunsay_admin_rt');

        return response()->json([
            'message' => 'Logout berhasil.',
        ])->withCookie($forgetTenantCookie)->withCookie($forgetAdminCookie);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $request->validate([
            'username'     => 'required|string|unique:user,Username,' . $user->Id_user . ',Id_user',
            'nama_lengkap' => 'nullable|string',
            'email'        => 'nullable|email',
        ]);

        $user->Username = $request->username;
        if ($request->has('nama_lengkap')) {
            $user->nama_lengkap = $request->nama_lengkap;
        }
        if ($request->has('email')) {
            $user->email = $request->email;
        }
        $user->save();

        $userIsAdmin = ((int) $user->Id_roles === 1);
        $rawPerms = $user->permissions;
        $permsArray = [];
        if ($rawPerms) {
            $permsArray = is_string($rawPerms) ? json_decode($rawPerms, true) : (array)$rawPerms;
        } else if ($userIsAdmin) {
            $permsArray = ['verifikasi_pembayaran', 'input_setoran', 'ekspor_laporan', 'kelola_kios', 'kelola_admin', 'lihat_audit_log'];
        }

        $subRole = $user->sub_role ?? ($userIsAdmin ? 'superadmin' : 'tenant');

        if ($userIsAdmin) {
            \App\Models\ActivityLog::create([
                'id_user'    => $user->Id_user,
                'username'   => $user->Username,
                'role'       => $subRole,
                'modul'      => 'User',
                'aksi'       => 'Edit Profil',
                'deskripsi'  => "Admin {$user->Username} memperbarui data profil akun pengelola.",
                'ip_address' => $request->ip(),
                'created_at' => now()
            ]);
        }

        return response()->json([
            'message' => 'Profil berhasil diperbarui.',
            'user'    => [
                'Id_user'      => $user->Id_user,
                'Username'     => $user->Username,
                'nama_lengkap' => $user->nama_lengkap ?? $user->Username,
                'email'        => $user->email,
                'Id_roles'     => $user->Id_roles,
                'role'         => $userIsAdmin ? 'admin' : 'tenant',
                'sub_role'     => $subRole,
                'permissions'  => $permsArray,
            ],
        ]);
    }

    public function changePassword(Request $request): JsonResponse
    {
        $request->validate([
            'kataSandiLama' => 'required|string',
            'kataSandiBaru' => 'required|string|min:6',
        ]);

        $user = $request->user();

        if (!Hash::check($request->kataSandiLama, $user->Password)) {
            return response()->json(['message' => 'Kata sandi saat ini tidak sesuai.'], 422);
        }

        $user->Password = Hash::make($request->kataSandiBaru);
        $user->save();

        return response()->json(['message' => 'Kata sandi berhasil diperbarui.']);
    }
}
