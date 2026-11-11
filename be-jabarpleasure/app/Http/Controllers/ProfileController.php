<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
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
            'avatar_url' => ['nullable', 'string'],
            'avatar' => ['nullable', 'file', 'image', 'max:2048'], // PRD constraint: Photo <= 2MB
        ], [
            'name.required' => 'Nama tidak boleh kosong.',
            'name.max' => 'Nama maksimal 100 karakter.',
            'avatar.image' => 'File avatar harus berupa gambar (JPG, PNG, WebP).',
            'avatar.max' => 'Ukuran foto profil maksimal 2MB.',
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
        if (array_key_exists('avatar_url', $validated) && !empty($validated['avatar_url'])) {
            $user->avatar_url = $validated['avatar_url'];
        }

        // Handle uploaded avatar file
        if ($request->hasFile('avatar')) {
            $file = $request->file('avatar');
            $extension = $file->getClientOriginalExtension() ?: 'webp';
            $filename = "avatar_user_{$user->id}_" . time() . '.' . $extension;

            // Check Supabase or local storage
            $supabaseUrl = rtrim(config('services.supabase.url', 'https://nruydgxivzixylaxoced.supabase.co'), '/');
            $supabaseKey = config('services.supabase.key');
            $bucket = config('services.supabase.bucket', 'destinations');
            $storagePath = "avatars/{$filename}";

            $storedUrl = null;
            if ($supabaseKey) {
                try {
                    $uploadUrl = "{$supabaseUrl}/storage/v1/object/{$bucket}/{$storagePath}";
                    $fileContents = file_get_contents($file->getRealPath());
                    $mime = $file->getMimeType() ?: 'image/jpeg';

                    $response = Http::withHeaders([
                        'Authorization' => 'Bearer ' . $supabaseKey,
                        'apiKey' => $supabaseKey,
                        'Content-Type' => $mime,
                        'x-upsert' => 'true',
                    ])->withBody($fileContents, $mime)->post($uploadUrl);

                    if ($response->successful()) {
                        $storedUrl = "{$supabaseUrl}/storage/v1/object/public/{$bucket}/{$storagePath}";
                    }
                } catch (\Throwable $e) {
                    Log::warning('Supabase avatar upload failed: ' . $e->getMessage());
                }
            }

            if (!$storedUrl) {
                $file->storeAs('public/avatars', $filename);
                $storedUrl = asset("storage/avatars/{$filename}");
            }

            $user->avatar_url = $storedUrl;
        }

        $user->save();

        return $this->show($request);
    }

    /**
     * Update the authenticated user's password.
     */
    public function updatePassword(Request $request): JsonResponse
    {
        $user = $this->resolveAuthenticatedUser($request);

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Sesi autentikasi tidak valid atau telah berakhir. Silakan login kembali.',
            ], 401);
        }

        $validator = Validator::make($request->all(), [
            'current_password' => ['required', 'string'],
            'new_password' => ['required', 'string', 'min:6'],
            'new_password_confirmation' => ['required', 'string', 'same:new_password'],
        ], [
            'current_password.required' => 'Kata sandi saat ini wajib diisi.',
            'new_password.required' => 'Kata sandi baru wajib diisi.',
            'new_password.min' => 'Kata sandi baru minimal 6 karakter.',
            'new_password_confirmation.required' => 'Konfirmasi kata sandi baru wajib diisi.',
            'new_password_confirmation.same' => 'Konfirmasi kata sandi baru tidak cocok.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors(),
            ], 422);
        }

        if (!Hash::check($request->input('current_password'), $user->password)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Kata sandi saat ini tidak cocok.',
                'errors' => [
                    'current_password' => ['Kata sandi saat ini salah.'],
                ],
            ], 422);
        }

        $user->password = Hash::make($request->input('new_password'));
        $user->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Kata sandi berhasil diperbarui.',
        ]);
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

        if ($request->filled('user_id')) {
            return User::find($request->input('user_id'));
        }

        return null;
    }
}

