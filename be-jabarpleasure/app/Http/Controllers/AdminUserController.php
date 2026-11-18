<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    /**
     * List all users with pagination, role filter, status filter, and keyword search.
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = min((int) $request->input('per_page', 15), 50);
        $search = $request->input('search');
        $role = $request->input('role');
        $status = $request->input('status'); // 'active' or 'blocked'

        $query = User::select([
            'id',
            'name',
            'email',
            'phone',
            'city',
            'avatar_url',
            'travel_style',
            'role',
            'is_blocked',
            'created_at',
        ]);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ILIKE', "%{$search}%")
                  ->orWhere('email', 'ILIKE', "%{$search}%")
                  ->orWhere('phone', 'ILIKE', "%{$search}%")
                  ->orWhere('city', 'ILIKE', "%{$search}%");
            });
        }

        if ($role && in_array($role, ['admin', 'user'])) {
            $query->where('role', $role);
        }

        if ($status === 'blocked') {
            $query->where('is_blocked', true);
        } elseif ($status === 'active') {
            $query->where(function ($q) {
                $q->where('is_blocked', false)->orWhereNull('is_blocked');
            });
        }

        $users = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'status' => 'success',
            'data' => $users->items(),
            'pagination' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
            ],
        ]);
    }

    /**
     * Toggle is_blocked status for a user (PRD F-14: Moderasi Pengguna).
     */
    public function toggleBlock(Request $request, int|string $id): JsonResponse
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Akun pengguna tidak ditemukan.',
            ], 404);
        }

        // Prevent blocking the master admin
        if ($user->email === 'admin123@jabarpleasure.id' || $user->name === 'admin123') {
            return response()->json([
                'status' => 'error',
                'message' => 'Akun Administrator utama tidak dapat diblokir.',
            ], 422);
        }

        $newBlockedState = !$user->is_blocked;
        $user->is_blocked = $newBlockedState;
        $user->save();

        $actionText = $newBlockedState ? 'diblokir' : 'diaktifkan kembali';

        return response()->json([
            'status' => 'success',
            'message' => "Pengguna '{$user->name}' berhasil {$actionText}.",
            'data' => $user,
        ]);
    }

    /**
     * Update user role (admin / user).
     */
    public function updateRole(Request $request, int|string $id): JsonResponse
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Akun pengguna tidak ditemukan.',
            ], 404);
        }

        $validated = $request->validate([
            'role' => 'required|in:admin,user',
        ]);

        $user->role = $validated['role'];
        $user->save();

        return response()->json([
            'status' => 'success',
            'message' => "Peran akun '{$user->name}' diubah menjadi {$user->role}.",
            'data' => $user,
        ]);
    }
}

