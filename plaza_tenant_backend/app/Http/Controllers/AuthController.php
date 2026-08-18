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

        if (!$user || !Hash::check($request->password, $user->Password)) {
            return response()->json([
                'message' => 'Username atau password salah.',
            ], 401);
        }

        // Determine scope: admin (Id_roles 1) vs tenant (Id_roles 2)
        $scope = $request->input('scope', ($user->Id_roles === 1 ? 'admin' : 'tenant'));
        $cookieName = ($scope === 'admin') ? 'bunsay_admin_rt' : 'bunsay_tenant_rt';

        // 1. Create short-lived Access Token for In-Memory storage
        $accessToken = $user->createToken('access_token', ['*'], now()->addMinutes(15))->plainTextToken;

        // 2. Create Refresh Token instance in DB
        $refreshTokenObj = $user->createToken('refresh_token', ['issue-access-token'], now()->addDays(7));
        $refreshTokenPlainText = $refreshTokenObj->plainTextToken;

        // 3. Construct HttpOnly Host-Only Secure Cookie
        // Parameters: name, value, minutes, path, domain=null (Host-Only), secure=true, httpOnly=true, raw=false, sameSite='Strict'
        $isSecure = config('session.secure', true);
        $refreshCookie = cookie(
            $cookieName,
            $refreshTokenPlainText,
            self::REFRESH_COOKIE_MINUTES,
            '/',
            null,
            $isSecure,
            true,
            false,
            'Strict'
        );

        return response()->json([
            'accessToken' => $accessToken,
            'user' => [
                'Id_user'  => $user->Id_user,
                'Username' => $user->Username,
                'Id_roles' => $user->Id_roles,
                'role'     => $user->Id_roles === 1 ? 'admin' : 'tenant',
            ],
        ])->withCookie($refreshCookie);
    }

    /**
     * Silent Refresh handler reading HttpOnly Cookie without Authorization header requirement.
     */
    public function refresh(Request $request): JsonResponse
    {
        // Detect domain scope from request path (/api/v1/admin/auth/refresh vs /api/v1/tenant/auth/refresh)
        $isAdminScope = $request->is('api/v1/admin/*');
        $cookieName = $isAdminScope ? 'bunsay_admin_rt' : 'bunsay_tenant_rt';

        $refreshTokenString = $request->cookie($cookieName);

        if (!$refreshTokenString) {
            return response()->json([
                'message' => 'Refresh token cookie tidak ditemukan.',
            ], 401);
        }

        // Validate Refresh Token string against Sanctum PersonalAccessToken
        $tokenInstance = PersonalAccessToken::findToken($refreshTokenString);

        if (!$tokenInstance || ($tokenInstance->expires_at && $tokenInstance->expires_at->isPast())) {
            // Clear invalid cookie
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

        // Issue NEW short-lived Access Token (15 mins) for in-memory frontend storage
        $newAccessToken = $user->createToken('access_token', ['*'], now()->addMinutes(15))->plainTextToken;

        return response()->json([
            'accessToken' => $newAccessToken,
        ]);
    }

    /**
     * Registration handler for Tenants.
     */
    public function register(Request $request): JsonResponse
    {
        $request->validate([
            'username' => 'required|string|unique:user,Username',
            'password' => 'required|string|min:6',
            'id_roles' => 'required|integer',
        ]);

        $user = User::create([
            'Username' => $request->username,
            'Password' => Hash::make($request->password),
            'Id_roles' => $request->id_roles,
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
            // Revoke current access token
            $request->user()->currentAccessToken()?->delete();
        }

        // Forget both possible refresh cookies
        $forgetTenantCookie = cookie()->forget('bunsay_tenant_rt');
        $forgetAdminCookie = cookie()->forget('bunsay_admin_rt');

        return response()->json([
            'message' => 'Logout berhasil.',
        ])->withCookie($forgetTenantCookie)->withCookie($forgetAdminCookie);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'username' => 'required|string|unique:user,Username,' . $user->Id_user . ',Id_user',
        ]);

        $user->Username = $request->username;
        $user->save();

        return response()->json([
            'message' => 'Profil berhasil diperbarui.',
            'user'    => [
                'Id_user'  => $user->Id_user,
                'Username' => $user->Username,
                'Id_roles' => $user->Id_roles,
            ],
        ]);
    }

    public function changePassword(Request $request)
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
