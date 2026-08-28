<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\ActivityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class StafManagementController extends Controller
{
    /**
     * Get list of all admin staff accounts.
     */
    public function index(Request $request): JsonResponse
    {
        $currentUserId = $request->user()?->Id_user;
        $stafList = User::where('Id_roles', 1)->with('tokens')->get()->map(function ($u) use ($currentUserId) {
            $rawPerms = $u->permissions;
            $permsArray = [];
            if ($rawPerms) {
                $permsArray = is_string($rawPerms) ? json_decode($rawPerms, true) : (array)$rawPerms;
            } else {
                $permsArray = ['verifikasi_pembayaran', 'input_setoran', 'ekspor_laporan', 'kelola_kios', 'kelola_admin', 'lihat_audit_log'];
            }

            // Calculate presence / online status based on personal_access_tokens
            $latestToken = $u->tokens->sortByDesc('last_used_at')->first();
            $lastUsedAt = $latestToken?->last_used_at ?? $latestToken?->created_at;

            $isCurrentUser = ($currentUserId !== null && (int)$u->Id_user === (int)$currentUserId);
            $isActiveRecently = $lastUsedAt && $lastUsedAt->diffInMinutes(now()) <= 5;
            $isOnline = $isCurrentUser || ($isActiveRecently && (int)($u->status_aktif ?? 1) === 1);

            return [
                'id'              => $u->Id_user,
                'username'        => $u->Username,
                'nama_lengkap'    => $u->nama_lengkap ?? $u->Username,
                'email'           => $u->email ?? '-',
                'sub_role'        => $u->sub_role ?? 'admin',
                'permissions'     => $permsArray,
                'status_aktif'    => (int)($u->status_aktif ?? 1) === 1,
                'is_online'       => (bool)$isOnline,
                'presence_status' => $isOnline ? 'Online' : 'Offline',
                'last_seen_at'    => $lastUsedAt?->toISOString(),
            ];
        });

        return response()->json([
            'status' => 'success',
            'data'   => $stafList,
        ]);
    }

    /**
     * Helper to verify if the requesting user has permission to manage staff.
     */
    private function authorizeStaffManager(Request $request): ?JsonResponse
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $rawPerms = $user->permissions;
        $permsArray = [];
        if ($rawPerms) {
            $permsArray = is_string($rawPerms) ? json_decode($rawPerms, true) : (array)$rawPerms;
        } else {
            $permsArray = ['verifikasi_pembayaran', 'input_setoran', 'ekspor_laporan', 'kelola_kios', 'kelola_admin', 'lihat_audit_log'];
        }

        $isSuperadmin = ($user->sub_role === 'superadmin') || in_array('kelola_admin', $permsArray, true);
        if (!$isSuperadmin) {
            return response()->json([
                'message' => 'Akses ditolak. Anda memerlukan hak akses Kelola Admin / Superadmin untuk melakukan aksi ini.',
            ], 403);
        }

        return null;
    }

    /**
     * Store new admin staff account.
     */
    public function store(Request $request): JsonResponse
    {
        if ($deny = $this->authorizeStaffManager($request)) {
            return $deny;
        }

        $request->validate([
            'username'     => 'required|string|unique:user,Username',
            'nama_lengkap' => 'required|string',
            'email'        => 'nullable|email',
            'password'     => 'required|string|min:6',
            'sub_role'     => 'required|string',
            'permissions'  => 'required|array',
        ]);

        $staf = User::create([
            'Username'     => $request->username,
            'nama_lengkap' => $request->nama_lengkap,
            'email'        => $request->email,
            'Password'     => Hash::make($request->password),
            'Id_roles'     => 1, // Admin role
            'sub_role'     => $request->sub_role,
            'permissions'  => json_encode($request->permissions),
            'status_aktif' => 1,
        ]);

        ActivityLog::record(
            $request,
            'User',
            'Tambah Staf',
            "Menambahkan staf baru {$staf->nama_lengkap} (@{$staf->Username}) dengan role {$staf->sub_role}."
        );

        return response()->json([
            'message' => 'Akun staf pengelola berhasil dibuat.',
            'data'    => $staf,
        ], 201);
    }

    /**
     * Update admin staff account permissions / role.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        if ($deny = $this->authorizeStaffManager($request)) {
            return $deny;
        }

        $staf = User::where('Id_roles', 1)->find($id);

        if (!$staf) {
            return response()->json(['message' => 'Akun staf tidak ditemukan.'], 404);
        }

        $request->validate([
            'nama_lengkap' => 'required|string',
            'email'        => 'nullable|email',
            'sub_role'     => 'required|string',
            'permissions'  => 'required|array',
            'password'     => 'nullable|string|min:6',
        ]);

        $staf->nama_lengkap = $request->nama_lengkap;
        $staf->email = $request->email;
        $staf->sub_role = $request->sub_role;
        $staf->permissions = json_encode($request->permissions);

        if ($request->filled('password')) {
            $staf->Password = Hash::make($request->password);
        }

        $staf->save();

        ActivityLog::record(
            $request,
            'User',
            'Edit Staf',
            "Memperbarui role & permission staf {$staf->nama_lengkap} (@{$staf->Username}) menjadi {$staf->sub_role}."
        );

        return response()->json([
            'message' => 'Data staf pengelola berhasil diperbarui.',
            'data'    => $staf,
        ]);
    }

    /**
     * Toggle active status of admin staff account.
     */
    public function toggleStatus(Request $request, int $id): JsonResponse
    {
        if ($deny = $this->authorizeStaffManager($request)) {
            return $deny;
        }

        $currentUser = $request->user();
        if ($currentUser && (int)$currentUser->Id_user === (int)$id) {
            return response()->json([
                'message' => 'Anda tidak dapat menonaktifkan akun yang sedang Anda gunakan saat ini.',
            ], 422);
        }

        $staf = User::where('Id_roles', 1)->find($id);

        if (!$staf) {
            return response()->json(['message' => 'Akun staf tidak ditemukan.'], 404);
        }

        $newStatus = ((int)($staf->status_aktif ?? 1) === 1) ? 0 : 1;
        $staf->status_aktif = $newStatus;
        $staf->save();

        // If deactivated, revoke all existing tokens immediately to force logout
        if ($newStatus === 0) {
            $staf->tokens()->delete();
        }

        $statusStr = $newStatus === 1 ? 'Diaktifkan (Reactivated)' : 'Dinonaktifkan (Deactivated)';

        ActivityLog::record(
            $request,
            'User',
            'Toggle Status Staf',
            "Status akun staf {$staf->Username} diubah menjadi {$statusStr}."
        );

        return response()->json([
            'message' => "Akun staf @{$staf->Username} berhasil {$statusStr}.",
            'status_aktif' => $newStatus === 1,
        ]);
    }

    /**
     * Delete an admin staff account permanently.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        if ($deny = $this->authorizeStaffManager($request)) {
            return $deny;
        }

        $currentUser = $request->user();
        if ($currentUser && (int)$currentUser->Id_user === (int)$id) {
            return response()->json([
                'message' => 'Anda tidak dapat menghapus akun yang sedang Anda gunakan saat ini.',
            ], 422);
        }

        $staf = User::where('Id_roles', 1)->find($id);

        if (!$staf) {
            return response()->json(['message' => 'Akun staf tidak ditemukan.'], 404);
        }

        $username = $staf->Username;
        $namaLengkap = $staf->nama_lengkap ?? $username;
        $staf->delete();

        ActivityLog::record(
            $request,
            'User',
            'Hapus Staf',
            "Menghapus akun staf pengelola {$namaLengkap} (@{$username})."
        );

        return response()->json([
            'message' => "Akun staf @{$username} berhasil dihapus permanen.",
        ]);
    }
}
