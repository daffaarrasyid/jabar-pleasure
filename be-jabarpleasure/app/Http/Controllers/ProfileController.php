<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Laravel\Sanctum\Sanctum;

class ProfileController extends Controller
{
    /**
     * Get the authenticated user's profile and database statistics.
     */
    public function show(Request $request): JsonResponse
    {
        $user = $this->resolveAuthenticatedUser($request);

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Sesi autentikasi tidak valid atau telah berakhir. Silakan login kembali.',
            ], 401);
        }

        // Aggregate statistics from database tables
        $wishlistCount = $user->wishlists()->count();
        $itineraryCount = $user->itineraries()->count();
        $checkInsCount = $user->checkIns()->count();
        $completedItineraries = $user->itineraries()->where('status', 'completed')->count();
        $tripsCount = max($checkInsCount, $completedItineraries);

        // Load interest preferences
        $preferences = $user->categories()
            ->get(['categories.id', 'categories.name', 'categories.slug']);

        return response()->json([
            'status' => 'success',
            'message' => 'Data profil berhasil dimuat.',
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone ?? '-',
                'city' => $user->city ?? 'Bogor, Jawa Barat',
                'avatar_url' => $user->avatar_url,
                'initials' => $user->initials,
                'role' => $user->role,
                'statistics' => [
                    'trips_count' => $tripsCount,
                    'wishlist_count' => $wishlistCount,
                    'itinerary_count' => $itineraryCount,
                ],
                'preferences' => $preferences,
                'created_at' => $user->created_at,
            ],
        ]);
    }

    /**
     * Update the authenticated user's profile.
     */
    public function update(Request $request): JsonResponse
    {
        $user = $this->resolveAuthenticatedUser($request);

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Sesi autentikasi tidak valid atau telah berakhir. Silakan login kembali.',
            ], 401);
        }

        $validator = Validator::make($request->all(), [
            'name' => ['sometimes', 'required', 'string', 'max:100'],
            'phone' => ['nullable', 'string', 'max:30'],
            'city' => ['nullable', 'string', 'max:100'],
            'avatar_url' => ['nullable', 'string', 'max:255'],
        ], [
            'name.required' => 'Nama tidak boleh kosong.',
            'name.max' => 'Nama maksimal 100 karakter.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors(),
            ], 422);
        }

        $validated = $validator->validated();

        if (isset($validated['name'])) {
            $user->name = trim($validated['name']);
        }
        if (array_key_exists('phone', $validated)) {
            $user->phone = $validated['phone'];
        }
        if (array_key_exists('city', $validated)) {
            $user->city = $validated['city'];
        }
        if (array_key_exists('avatar_url', $validated)) {
            $user->avatar_url = $validated['avatar_url'];
        }

        $user->save();

        return $this->show($request);
    }

    /**
     * Helper to resolve the authenticated User instance.
     */
    private function resolveAuthenticatedUser(Request $request): ?User
    {
        if ($user = $request->user()) {
            return $user;
        }

        if ($bearer = $request->bearerToken()) {
            $tokenModel = Sanctum::$personalAccessTokenModel;
            $foundToken = $tokenModel::findToken($bearer);
            if ($foundToken && $foundToken->tokenable instanceof User) {
                return $foundToken->tokenable;
            }
        }

        return null;
    }
}

