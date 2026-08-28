<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Pemilik;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;
use Laravel\Sanctum\PersonalAccessToken;

class AuthController extends Controller
{
    /**
     * Duration of the HttpOnly Refresh Cookie in minutes (7 days = 10080 minutes).
     */
    private const REFRESH_COOKIE_MINUTES = 43200; // 30 days

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

        $throttleKey = 'login_attempts_' . strtolower(trim((string) $request->username)) . '|' . $request->ip();

        if (RateLimiter::tooManyAttempts($throttleKey, 3)) {
            $seconds = RateLimiter::availableIn($throttleKey);
            return response()->json([
                'message' => "Terlalu banyak percobaan login gagal (Maksimal 3 kali). Silakan coba lagi dalam {$seconds} detik atau gunakan fitur Lupa Kata Sandi.",
                'retryAfter' => $seconds,
                'isLocked' => true,
                'remainingAttempts' => 0,
            ], 429);
        }

        $user = User::where('Username', $request->username)->first();

        $isPasswordValid = $user && Hash::check($request->password, $user->Password);

        if (!$user || !$isPasswordValid) {
            RateLimiter::hit($throttleKey, 60);
            $remaining = RateLimiter::remaining($throttleKey, 3);
            return response()->json([
                'message' => $remaining > 0
                    ? "Username atau kata sandi salah. Sisa percobaan login: {$remaining} kali."
                    : "Username atau kata sandi salah. Batas 3 kali percobaan terlampaui. Akun dikunci sementara 60 detik.",
                'remainingAttempts' => $remaining,
                'isLocked' => $remaining <= 0,
                'retryAfter' => $remaining <= 0 ? 60 : 0,
            ], 401);
        }

        RateLimiter::clear($throttleKey);

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

        // Prune only expired tokens to keep database light while allowing multi-device testing
        $user->tokens()->where('expires_at', '<', now())->delete();

        // 1. Create Access Token for In-Memory storage (24 hours TTL for active testing stability)
        $accessToken = $user->createToken('access_token', ['*'], now()->addHours(24))->plainTextToken;

        // 2. Create Refresh Token instance in DB (30 days TTL)
        $refreshTokenObj = $user->createToken('refresh_token', ['issue-access-token'], now()->addDays(30));

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
        $newRefreshTokenObj = $user->createToken('refresh_token', ['issue-access-token'], now()->addDays(30));
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

        // Issue NEW Access Token (24 hours TTL) for in-memory frontend storage
        $newAccessToken = $user->createToken('access_token', ['*'], now()->addHours(24))->plainTextToken;

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
            'username'     => 'nullable|string|unique:user,Username,' . $user->Id_user . ',Id_user',
            'nama_lengkap' => 'nullable|string',
            'Nama'         => 'nullable|string',
            'email'        => 'nullable|string',
            'Email'        => 'nullable|string',
            'No_Telepon'   => 'nullable|string',
            'telepon'      => 'nullable|string',
            'Alamat'       => 'nullable|string',
            'alamat'       => 'nullable|string',
        ]);

        $email = $request->input('Email', $request->input('email'));
        if (!empty($email)) {
            $email = trim(strtolower((string) $email));
            $validTlds = ['com', 'id', 'co.id', 'net', 'org', 'ac.id', 'go.id', 'sch.id', 'or.id', 'biz.id', 'my.id', 'web.id', 'gov.id', 'edu'];
            $pattern = '/^[a-zA-Z0-9._%+-]+@([a-zA-Z0-9.-]+\.([a-zA-Z]{2,}))$/';
            if (!preg_match($pattern, $email, $matches)) {
                return response()->json([
                    'message' => 'Format alamat email tidak valid (contoh: nama@gmail.com atau nama@perusahaan.co.id).',
                ], 422);
            }
            $fullDomain = strtolower($matches[1]);
            $isValidTld = false;
            foreach ($validTlds as $tld) {
                if ($fullDomain === $tld || str_ends_with($fullDomain, '.' . $tld)) {
                    $isValidTld = true;
                    break;
                }
            }
            if (!$isValidTld || str_ends_with($fullDomain, '.cm') || str_ends_with($fullDomain, '.cmo') || str_ends_with($fullDomain, '.con') || str_ends_with($fullDomain, '.coom')) {
                return response()->json([
                    'message' => 'Ekstensi domain email tidak resmi. Gunakan domain resmi seperti .com, .co.id, .id, .net, .org, atau .ac.id.',
                ], 422);
            }
        }

        if ($request->has('username') && !empty($request->username)) {
            $user->Username = $request->username;
        }
        if ($email !== null) {
            $user->email = $email;
        }
        $nama = $request->input('Nama', $request->input('nama_lengkap', $request->input('nama')));
        if ($nama !== null && !empty($nama)) {
            $user->nama_lengkap = $nama;
        }
        $user->save();

        // Update Pemilik if tenant
        if ($user->pemilik) {
            $pemilik = $user->pemilik;
            if ($nama !== null && !empty($nama)) {
                $pemilik->Nama = $nama;
            }
            $telp = $request->input('No_Telepon', $request->input('telepon'));
            if ($telp !== null) {
                $pemilik->No_Telepon = $telp;
            }
            $alamat = $request->input('Alamat', $request->input('alamat'));
            if ($alamat !== null) {
                $pemilik->Alamat = $alamat;
            }
            $pemilik->save();
        }

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

    /**
     * Kirim kode OTP pemulihan kata sandi ke WhatsApp atau Email pengguna.
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate([
            'identifier' => 'required|string',
        ]);

        $identifier = trim($request->identifier);
        $cleanPhone = preg_replace('/\D/', '', $identifier);

        // 1. Cari user berdasarkan Username, Email, atau No Telepon di tabel Pemilik
        $user = null;

        if (!empty($cleanPhone) && strlen($cleanPhone) >= 9) {
            $pemilik = Pemilik::where('No_Telepon', 'like', "%{$cleanPhone}%")
                ->orWhere('No_Telepon', $identifier)
                ->first();

            if ($pemilik) {
                $user = User::find($pemilik->Id_User);
            }
        }

        if (!$user) {
            $user = User::where('Username', $identifier)
                ->orWhere('email', $identifier)
                ->first();
        }

        if (!$user) {
            return response()->json([
                'message' => 'Nomor WhatsApp, username, atau email tidak ditemukan dalam sistem.',
            ], 404);
        }

        // Generate 6 digit OTP
        $otp = str_pad((string) random_int(100000, 999999), 6, '0', STR_PAD_LEFT);

        // Simpan di Cache selama 15 menit
        Cache::put("password_reset_otp_{$user->Id_user}", $otp, now()->addMinutes(15));

        $namaUser = $user->nama_lengkap ?? $user->Username;
        $noHp = $user->pemilik?->No_Telepon;
        $emailTujuan = $user->email;
        $fonnteToken = config('services.fonnte.token');
        $targetMasked = '';

        // 2. Prioritas 1: Kirim via WhatsApp (Fonnte) jika No HP & Token Fonnte tersedia
        $targetPhone = (!empty($cleanPhone) && strlen($cleanPhone) >= 9) ? $cleanPhone : $noHp;

        if (!empty($fonnteToken) && !empty($targetPhone)) {
            $pesanWa = "Halo *{$namaUser}*,\n\nKami menerima permintaan untuk mengatur ulang kata sandi akun Plaza Kebun Sayur Anda.\n\nKode Verifikasi (OTP) Anda adalah:\n👉 *{$otp}*\n\nKode ini berlaku selama 15 menit. Jangan bagikan kode ini kepada siapa pun demi keamanan akun Anda.\n\n_Pengelola Plaza Kebun Sayur Balikpapan_";

            try {
                Http::withHeaders([
                    'Authorization' => $fonnteToken,
                ])->timeout(10)->post('https://api.fonnte.com/send', [
                    'target'      => $targetPhone,
                    'message'     => $pesanWa,
                    'countryCode' => '62',
                ]);
            } catch (\Throwable $e) {
                \Log::warning('Gagal kirim OTP via Fonnte WA: ' . $e->getMessage());
            }

            // Sensor nomor WA (contoh: 0812****890)
            $targetMasked = substr($targetPhone, 0, 4) . '****' . substr($targetPhone, -3);
        }

        // 3. Cadangan: Kirim juga via Email jika ada
        if (!empty($emailTujuan)) {
            try {
                Mail::raw("Halo {$namaUser},\n\nKode Verifikasi (OTP) pemulihan kata sandi Plaza Kebun Sayur Anda adalah: {$otp}\n\nKode ini berlaku selama 15 menit. Jangan bagikan kode ini kepada siapa pun.\n\nSalam hormat,\nPengelola Plaza Kebun Sayur Balikpapan", function ($message) use ($emailTujuan) {
                    $message->to($emailTujuan)
                            ->subject('Kode Verifikasi Pemulihan Kata Sandi - Plaza Kebun Sayur');
                });
            } catch (\Throwable $e) {
                \Log::warning('Gagal kirim email OTP via SMTP: ' . $e->getMessage());
            }

            if (empty($targetMasked)) {
                $parts = explode('@', $emailTujuan);
                $targetMasked = substr($parts[0], 0, 2) . '***@' . ($parts[1] ?? 'email.com');
            }
        }

        return response()->json([
            'success'     => true,
            'message'     => "Kode verifikasi 6 digit telah dikirim ke {$targetMasked}.",
            'userId'      => $user->Id_user,
            'maskedEmail' => $targetMasked,
        ]);
    }

    /**
     * Verifikasi OTP dan atur kata sandi baru.
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'userId'        => 'required|integer',
            'otp'           => 'required|string|size:6',
            'kataSandiBaru' => 'required|string|min:6',
        ]);

        $user = User::find($request->userId);
        if (!$user) {
            return response()->json([
                'message' => 'Pengguna tidak ditemukan.',
            ], 404);
        }

        $cachedOtp = Cache::get("password_reset_otp_{$user->Id_user}");

        if (!$cachedOtp || $cachedOtp !== trim($request->otp)) {
            return response()->json([
                'message' => 'Kode verifikasi salah atau sudah kadaluarsa (berlaku 15 menit).',
            ], 422);
        }

        // Update password baru
        $user->Password = Hash::make($request->kataSandiBaru);
        $user->save();

        // Hapus OTP dari cache
        Cache::forget("password_reset_otp_{$user->Id_user}");

        return response()->json([
            'success' => true,
            'message' => 'Kata sandi berhasil diperbarui! Silakan masuk dengan kata sandi baru Anda.',
        ]);
    }
}
