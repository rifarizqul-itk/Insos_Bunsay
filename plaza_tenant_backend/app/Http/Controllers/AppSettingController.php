<?php

namespace App\Http\Controllers;

use App\Models\AppSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AppSettingController extends Controller
{
    public function getPenaltySetting(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => AppSetting::getPenaltyConfig(),
        ]);
    }

    public function updatePenaltySetting(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'is_active' => 'required|boolean',
            'type'      => 'required|in:fixed,percentage',
            'nominal'   => 'required|numeric|min:0',
        ]);

        AppSetting::set('denda_keterlambatan_aktif', $validated['is_active'] ? '1' : '0', 'boolean');
        AppSetting::set('denda_tipe', $validated['type'], 'string');
        AppSetting::set('denda_nominal', (string) $validated['nominal'], 'number');

        return response()->json([
            'success' => true,
            'message' => 'Pengaturan denda keterlambatan berhasil disimpan.',
            'data'    => AppSetting::getPenaltyConfig(),
        ]);
    }
}
