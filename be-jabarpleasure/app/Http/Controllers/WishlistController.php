<?php

namespace App\Http\Controllers;

use App\Models\Destination;
use App\Models\User;
use App\Models\Wishlist;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class WishlistController extends Controller
{
    /**
     * Get list of user's saved wishlist destinations.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user() ?? User::first();

        if (!$user) {
            return response()->json([
                'status' => 'success',
                'data' => [],
            ]);
        }

        $wishlists = Wishlist::where('user_id', $user->id)
            ->with([
                'destination' => function ($q) {
                    $q->with(['category:id,name,slug', 'regency:id,name'])
                      ->withCount('checkIns')
                      ->withCoordinates();
                },
            ])
            ->orderBy('id', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $wishlists,
        ]);
    }

    /**
     * Toggle add / remove destination from user's wishlist.
     */
    public function toggle(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'destination_id' => 'required|integer|exists:destinations,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Destinasi tidak valid',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user() ?? User::first();

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Pengguna tidak terotentikasi',
            ], 401);
        }

        $destinationId = (int) $request->input('destination_id');

        $existing = Wishlist::where('user_id', $user->id)
            ->where('destination_id', $destinationId)
            ->first();

        if ($existing) {
            $existing->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Destinasi dihapus dari Wishlist',
                'is_wishlisted' => false,
                'destination_id' => $destinationId,
            ]);
        }

        Wishlist::create([
            'user_id' => $user->id,
            'destination_id' => $destinationId,
            'created_at' => now(),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Destinasi berhasil disimpan ke Wishlist',
            'is_wishlisted' => true,
            'destination_id' => $destinationId,
        ]);
    }

    /**
     * Remove destination from user's wishlist by destination ID.
     */
    public function destroy(int $destinationId, Request $request): JsonResponse
    {
        $user = $request->user() ?? User::first();

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Pengguna tidak terotentikasi',
            ], 401);
        }

        Wishlist::where('user_id', $user->id)
            ->where('destination_id', $destinationId)
            ->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Destinasi dihapus dari Wishlist',
            'is_wishlisted' => false,
            'destination_id' => $destinationId,
        ]);
    }
}

