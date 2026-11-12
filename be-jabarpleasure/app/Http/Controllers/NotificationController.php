<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Get paginated notifications for the authenticated user.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user() ?? User::first();
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthenticated user',
            ], 401);
        }

        $perPage = min((int) $request->input('per_page', 20), 50);
        $unreadOnly = $request->boolean('unread_only');

        $query = Notification::where('user_id', $user->id)->recent();

        if ($unreadOnly) {
            $query->unread();
        }

        $notifications = $query->paginate($perPage);
        $unreadCount = Notification::where('user_id', $user->id)->unread()->count();

        return response()->json([
            'status' => 'success',
            'data' => $notifications->items(),
            'unread_count' => $unreadCount,
            'pagination' => [
                'current_page' => $notifications->currentPage(),
                'last_page' => $notifications->lastPage(),
                'per_page' => $notifications->perPage(),
                'total' => $notifications->total(),
            ],
        ]);
    }

    /**
     * Get unread notification count for badge display.
     */
    public function unreadCount(Request $request): JsonResponse
    {
        $user = $request->user() ?? User::first();
        if (!$user) {
            return response()->json([
                'status' => 'success',
                'unread_count' => 0,
                'notifications_enabled' => true,
            ]);
        }

        $enabled = (bool) ($user->notifications_enabled ?? true);
        $count = $enabled
            ? Notification::where('user_id', $user->id)->unread()->count()
            : 0;

        return response()->json([
            'status' => 'success',
            'unread_count' => $count,
            'notifications_enabled' => $enabled,
        ]);
    }

    /**
     * Mark a single notification as read.
     */
    public function markAsRead(Request $request, int|string $id): JsonResponse
    {
        $user = $request->user() ?? User::first();
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthenticated user',
            ], 401);
        }

        $notification = Notification::where('id', $id)
            ->where('user_id', $user->id)
            ->first();

        if (!$notification) {
            return response()->json([
                'status' => 'error',
                'message' => 'Notifikasi tidak ditemukan.',
            ], 404);
        }

        if (is_null($notification->read_at)) {
            $notification->update(['read_at' => now()]);
        }

        $unreadCount = Notification::where('user_id', $user->id)->unread()->count();

        return response()->json([
            'status' => 'success',
            'message' => 'Notifikasi ditandai telah dibaca.',
            'unread_count' => $unreadCount,
        ]);
    }

    /**
     * Mark all notifications of the user as read.
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        $user = $request->user() ?? User::first();
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthenticated user',
            ], 401);
        }

        Notification::where('user_id', $user->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json([
            'status' => 'success',
            'message' => 'Semua notifikasi berhasil ditandai telah dibaca.',
            'unread_count' => 0,
        ]);
    }
}

