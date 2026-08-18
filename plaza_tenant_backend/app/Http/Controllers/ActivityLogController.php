<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    /**
     * Get list of activity logs with optional filters (search, modul, role, date range).
     */
    public function index(Request $request): JsonResponse
    {
        $query = ActivityLog::query();

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('username', 'like', "%{$search}%")
                  ->orWhere('deskripsi', 'like', "%{$search}%")
                  ->orWhere('aksi', 'like', "%{$search}%");
            });
        }

        if ($request->filled('modul') && $request->input('modul') !== 'Semua') {
            $query->where('modul', $request->input('modul'));
        }

        if ($request->filled('role') && $request->input('role') !== 'Semua') {
            $query->where('role', $request->input('role'));
        }

        $logs = $query->orderBy('id', 'desc')->limit(200)->get();

        return response()->json([
            'status' => 'success',
            'data'   => $logs,
        ]);
    }
}
