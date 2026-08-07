<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PemilikController;
use App\Http\Controllers\KiosController;
use App\Http\Controllers\SewaController;
use App\Http\Controllers\DokumenController;
use App\Http\Controllers\TagihanController;
use App\Http\Controllers\PembayaranController;

/*
|--------------------------------------------------------------------------
| API Routes - Plaza Tenant Kebun Sayur Balikpapan
|--------------------------------------------------------------------------
|
| PATRA   → Auth & Dashboard
| ARMAN   → Pemilik, Kios, Sewa, Dokumen
| DAWWAS  → Tagihan, Pembayaran
|
*/

// ============================================================
// PUBLIC ROUTES (Tidak perlu login)
// PATRA
// ============================================================
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// ============================================================
// PROTECTED ROUTES (Wajib login)
// ============================================================
Route::middleware('auth:sanctum')->group(function () {

    // --- PATRA: Auth & Dashboard ---
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::put('/change-password', [AuthController::class, 'changePassword']);
    Route::get('/dashboard/admin', [DashboardController::class, 'adminDashboard']);
    Route::get('/dashboard/tenant', [DashboardController::class, 'tenantDashboard']);

    // --- ARMAN: Master Data Kios & Sewa ---
    Route::apiResource('pemilik', PemilikController::class);
    Route::apiResource('kios', KiosController::class);
    Route::apiResource('sewa', SewaController::class);
    Route::apiResource('dokumen', DokumenController::class);

    // --- DAWWAS: Tagihan & Pembayaran ---
    Route::apiResource('tagihan', TagihanController::class)->except(['destroy']);
    Route::apiResource('pembayaran', PembayaranController::class)->except(['destroy']);
    Route::put('/pembayaran/{id}/konfirmasi', [PembayaranController::class, 'konfirmasi']);
});
