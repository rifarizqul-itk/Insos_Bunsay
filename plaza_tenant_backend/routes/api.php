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
// 0. HEALTH CHECK & PUBLIC VERIFICATION ENDPOINTS
// ============================================================
Route::get('/health', fn () => response()->json([
    'status' => 'OK',
    'service' => 'Insos Bunsay API Backend',
    'timestamp' => now()->toIso8601String(),
]));

Route::middleware('throttle:60,1')->get('/v1/public/verifikasi-resi', [PembayaranController::class, 'verifikasiResiPublic']);


// ============================================================
// 1. TENANT DOMAIN AUTH ROUTES (bunsayhub.id)
// ============================================================
Route::prefix('v1/tenant/auth')->group(function () {
    // Public Tenant Auth
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
    
    // Silent Refresh Endpoint (HttpOnly Cookie based - No Bearer token required)
    Route::post('/refresh', [AuthController::class, 'refresh']);

    // Protected Tenant Auth
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::put('/profile', [AuthController::class, 'updateProfile']);
        Route::put('/change-password', [AuthController::class, 'changePassword']);
    });
});

// ============================================================
// 2. ADMIN DOMAIN AUTH ROUTES (admin.bunsayhub.id)
// ============================================================
Route::prefix('v1/admin/auth')->group(function () {
    // Public Admin Auth
    Route::post('/login', [AuthController::class, 'login'])->name('login');
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
    
    // Silent Refresh Endpoint (HttpOnly Cookie based - No Bearer token required)
    Route::post('/refresh', [AuthController::class, 'refresh']);

    // Protected Admin Auth
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::put('/profile', [AuthController::class, 'updateProfile']);
        Route::put('/change-password', [AuthController::class, 'changePassword']);
    });
});

// ============================================================
// 3. LEGACY AUTH ROUTES — DEPRECATED (410 Gone)
// ============================================================
// These routes are no longer active. Dual-domain architecture
// requires scoped versioned endpoints for proper cookie scoping.
Route::post('/login', fn () => response()->json([
    'message' => 'Endpoint ini tidak lagi aktif. Gunakan /api/v1/tenant/auth/login atau /api/v1/admin/auth/login',
], 410));
Route::post('/register', fn () => response()->json([
    'message' => 'Endpoint ini tidak lagi aktif. Gunakan /api/v1/tenant/auth/register',
], 410));

// ============================================================
// 4. PROTECTED TENANT BUSINESS ROUTES
// ============================================================
Route::middleware('auth:sanctum')->prefix('v1/tenant')->group(function () {
    // Tenant Dashboard & Payment Endpoints
    Route::get('/dashboard', [DashboardController::class, 'tenantDashboard']);
    Route::get('/tagihan', [TagihanController::class, 'tenantTagihan']);
    Route::get('/pembayaran', [PembayaranController::class, 'index']);
    Route::post('/pembayaran', [PembayaranController::class, 'store']);
    Route::post('/pembayaran/{id}/sanggah', [PembayaranController::class, 'sanggah']);
    Route::post('/midtrans/token', [\App\Http\Controllers\MidtransController::class, 'createSnapToken']);
    Route::get('/notifications', [\App\Http\Controllers\NotificationController::class, 'tenantNotifications']);
    Route::put('/notifications/{id}/read', [\App\Http\Controllers\NotificationController::class, 'markAsRead']);
    Route::put('/notifications/read-all', [\App\Http\Controllers\NotificationController::class, 'markAllAsRead']);
});

// Midtrans Public Webhook Notification Callback
Route::post('/v1/midtrans/notification', [\App\Http\Controllers\MidtransController::class, 'handleNotification']);



// ============================================================
// 5. PROTECTED ADMIN BUSINESS & MASTER DATA ROUTES (Admin Role Required)
// ============================================================
Route::middleware(['auth:sanctum', 'admin'])->prefix('v1/admin')->group(function () {
    // Admin Dashboard & Reports
    Route::get('/dashboard', [DashboardController::class, 'adminDashboard']);
    Route::get('/ekspor', [PembayaranController::class, 'ekspor']);
    
    // Master Data & Kiosk Management
    Route::get('/kios/kosong', [KiosController::class, 'getKosong']);
    Route::post('/sewa/{id}/akhiri', [SewaController::class, 'akhiriSewa']);
    Route::apiResource('pemilik', PemilikController::class);
    Route::put('/pemilik/{id}/toggle-cicilan', [PemilikController::class, 'toggleCicilan']);
    Route::post('/pemilik/{id}/reset-password', [PemilikController::class, 'resetPassword']);
    Route::apiResource('kios', KiosController::class);
    Route::apiResource('sewa', SewaController::class);
    Route::apiResource('dokumen', DokumenController::class);
    Route::apiResource('tagihan', TagihanController::class)->except(['destroy']);
    Route::apiResource('pembayaran', PembayaranController::class)->except(['destroy']);
    Route::put('/pembayaran/{id}/konfirmasi', [PembayaranController::class, 'konfirmasi']);

    // Audit Logs & Staff Management (RBAC & Audit Trail)
    Route::get('/logs', [\App\Http\Controllers\ActivityLogController::class, 'index']);
    Route::get('/staf', [\App\Http\Controllers\StafManagementController::class, 'index']);
    Route::post('/staf', [\App\Http\Controllers\StafManagementController::class, 'store']);
    Route::put('/staf/{id}', [\App\Http\Controllers\StafManagementController::class, 'update']);
    Route::put('/staf/{id}/toggle-status', [\App\Http\Controllers\StafManagementController::class, 'toggleStatus']);
    Route::delete('/staf/{id}', [\App\Http\Controllers\StafManagementController::class, 'destroy']);

    // Notifications
    Route::get('/notifications', [\App\Http\Controllers\NotificationController::class, 'adminNotifications']);
    Route::put('/notifications/{id}/read', [\App\Http\Controllers\NotificationController::class, 'markAsRead']);
    Route::put('/notifications/read-all', [\App\Http\Controllers\NotificationController::class, 'markAllAsRead']);
});

