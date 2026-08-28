<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdminRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user || (int) $user->Id_roles !== 1) {
            return response()->json([
                'message' => 'Akses ditolak. Endpoint ini hanya dapat diakses oleh Admin.',
            ], 403);
        }

        if ((int) ($user->status_aktif ?? 1) === 0) {
            $user->tokens()->delete();
            return response()->json([
                'message' => 'Akun Anda dinonaktifkan (Deactivated). Sesi Anda telah dihentikan.',
                'isDeactivated' => true,
            ], 403);
        }

        return $next($request);
    }
}
