<?php

declare(strict_types=1);

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
| API Routes - Dual Domain Architecture (bunsayhub.id & admin.bunsayhub.id)
|--------------------------------------------------------------------------
|
| Versioned API v1 endpoints grouped by domain context (Tenant vs Admin).
| Supports In-Memory Access Token + HttpOnly Refresh Cookie Auth pattern.
|
*/

// ============================================================
// 1. TENANT DOMAIN AUTH ROUTES (bunsayhub.id)
// ============================================================
Route::prefix('v1/tenant/auth')->group(function () {
    // Public Tenant Auth
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
    
    // Silent Refresh Endpoint (HttpOnly Cookie based - No Bearer token required)
    Route::post('/refresh', [AuthController::class, 'refresh']);

    // Protected Tenant Auth
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});

// ============================================================
// 2. ADMIN DOMAIN AUTH ROUTES (admin.bunsayhub.id)
// ============================================================
Route::prefix('v1/admin/auth')->group(function () {
    // Public Admin Auth
    Route::post('/login', [AuthController::class, 'login']);
    
    // Silent Refresh Endpoint (HttpOnly Cookie based - No Bearer token required)
    Route::post('/refresh', [AuthController::class, 'refresh']);

    // Protected Admin Auth
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});

// ============================================================
// 3. BACKWARD-COMPATIBLE LEGACY ROUTES
// ============================================================
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// ============================================================
// 4. PROTECTED BUSINESS DOMAIN ROUTES
// ============================================================
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    // Dashboard Endpoints
    Route::prefix('v1/tenant')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'tenantDashboard']);
    });

    Route::prefix('v1/admin')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'adminDashboard']);
    });

    // Legacy Dashboard Endpoints
    Route::get('/dashboard/admin', [DashboardController::class, 'adminDashboard']);
    Route::get('/dashboard/tenant', [DashboardController::class, 'tenantDashboard']);

    // Master Data Kios & Sewa
    Route::apiResource('pemilik', PemilikController::class);
    Route::apiResource('kios', KiosController::class);
    Route::apiResource('sewa', SewaController::class);
    Route::apiResource('dokumen', DokumenController::class);

    // Tagihan & Pembayaran
    Route::apiResource('tagihan', TagihanController::class)->except(['destroy']);
    Route::apiResource('pembayaran', PembayaranController::class)->except(['destroy']);
    Route::put('/pembayaran/{id}/konfirmasi', [PembayaranController::class, 'konfirmasi']);
});
