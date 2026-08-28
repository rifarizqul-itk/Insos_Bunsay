<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Get notifications for logged-in Tenant.
     */
    public function tenantNotifications(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'status'      => 'success',
                'unreadCount' => 0,
                'data'        => [],
            ]);
        }

        $notifications = Notification::where('target_type', 'tenant')
            ->where(function ($q) use ($user) {
                $q->where('id_user', $user->Id_user)->orWhereNull('id_user');
            })
            ->orderBy('id', 'desc')
            ->limit(50)
            ->get();

        $unreadCount = Notification::where('target_type', 'tenant')
            ->where(function ($q) use ($user) {
                $q->where('id_user', $user->Id_user)->orWhereNull('id_user');
            })
            ->where('is_read', false)
            ->count();

        return response()->json([
            'status'      => 'success',
            'unreadCount' => $unreadCount,
            'data'        => $notifications,
        ]);
    }

    /**
     * Get notifications for Admin staff.
     */
    public function adminNotifications(Request $request): JsonResponse
    {
        $notifications = Notification::where('target_type', 'admin')
            ->orderBy('id', 'desc')
            ->limit(50)
            ->get();

        $unreadCount = Notification::where('target_type', 'admin')
            ->where('is_read', false)
            ->count();

        return response()->json([
            'status'      => 'success',
            'unreadCount' => $unreadCount,
            'data'        => $notifications,
        ]);
    }

    /**
     * Mark single notification as read.
     */
    public function markAsRead(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $query = Notification::where('id', $id);

        if ($user && (int)$user->Id_roles !== 1) {
            // Tenant context: ensure notification belongs to this tenant or is broadcast
            $query->where('target_type', 'tenant')->where(function ($q) use ($user) {
                $q->where('id_user', $user->Id_user)->orWhereNull('id_user');
            });
        }

        $notif = $query->first();

        if ($notif) {
            $notif->is_read = true;
            $notif->save();
        }

        return response()->json(['message' => 'Notifikasi ditandai telah dibaca.']);
    }

    /**
     * Mark all notifications as read for target type.
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        $targetType = $request->input('target_type', 'admin');
        $user = $request->user();

        $query = Notification::where('target_type', $targetType);
        if ($targetType === 'tenant' && $user) {
            $query->where(function ($q) use ($user) {
                $q->where('id_user', $user->Id_user)->orWhereNull('id_user');
            });
        }

        $query->update(['is_read' => true]);

        return response()->json(['message' => 'Seluruh notifikasi berhasil ditandai telah dibaca.']);
    }
}
