<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\User;
use App\Services\AvatarStorageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
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
                'travel_style' => $user->travel_style ?? 'healing',
                'notifications_enabled' => (bool) ($user->notifications_enabled ?? true),
                'location_permission_enabled' => (bool) ($user->location_permission_enabled ?? true),
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
    public function update(Request $request, AvatarStorageService $avatarStorage): JsonResponse
    {
        $user = $this->resolveAuthenticatedUser($request);

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Sesi autentikasi tidak valid atau telah berakhir. Silakan login kembali.',
            ], 401);
        }

        if ($request->hasFile('avatar')) {
            $uploaded = $request->file('avatar');
            $size = $uploaded?->getSize();
            if ($size === false || $size > AvatarStorageService::MAX_BYTES) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Ukuran foto profil maksimal 2 MB.',
                    'errors' => [
                        'avatar' => ['Ukuran foto profil maksimal 2 MB.'],
                    ],
                ], 413);
            }
        }

        $validator = Validator::make($request->all(), [
            'name' => ['sometimes', 'required', 'string', 'max:100'],
            'phone' => ['nullable', 'string', 'max:30'],
            'city' => ['nullable', 'string', 'max:100'],
            'avatar_url' => ['nullable', 'string', 'max:500'],
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

        // Handle uploaded avatar file (compressed to WebP & stored in Supabase bucket)
        if ($request->hasFile('avatar')) {
            try {
                $user->avatar_url = $avatarStorage->uploadCompressedWebp(
                    $request->file('avatar'),
                    $user->id,
                    $user->avatar_url
                );
            } catch (\RuntimeException $e) {
                $status = in_array($e->getCode(), [413, 422, 502, 500], true) ? $e->getCode() : 500;
                return response()->json([
                    'status' => 'error',
                    'message' => $e->getMessage(),
                ], $status);
            }
        } elseif (array_key_exists('avatar_url', $validated) && !empty($validated['avatar_url'])) {
            $nextAvatarUrl = trim((string) $validated['avatar_url']);
            if ($user->avatar_url && $user->avatar_url !== $nextAvatarUrl) {
                $avatarStorage->deleteIfManagedSupabaseAvatar($user->avatar_url);
            }
            $user->avatar_url = $nextAvatarUrl;
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
     * Sync the authenticated user's travel preferences (categories & travel style).
     */
    public function updatePreferences(Request $request): JsonResponse
    {
        $user = $this->resolveAuthenticatedUser($request);

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Sesi autentikasi tidak valid atau telah berakhir. Silakan login kembali.',
            ], 401);
        }

        $validator = Validator::make($request->all(), [
            'interests' => ['present', 'array'],
            'interests.*' => ['required'],
            'travel_style' => ['nullable', 'string', 'in:healing,adventure,backpacker,family,culinary,staycation'],
        ], [
            'interests.present' => 'Daftar preferensi wisata wajib dikirimkan.',
            'interests.array' => 'Format preferensi wisata tidak valid.',
            'travel_style.in' => 'Gaya perjalanan tidak dikenali.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors(),
            ], 422);
        }

        $rawInterests = $request->input('interests', []);
        $numericIds = [];
        $slugs = [];

        foreach ($rawInterests as $item) {
            if (is_numeric($item)) {
                $numericIds[] = (int) $item;
            } elseif (is_string($item) && trim($item) !== '') {
                $slugs[] = trim($item);
            }
        }

        $categoryIds = Category::query()
            ->when(!empty($numericIds) || !empty($slugs), function ($query) use ($numericIds, $slugs) {
                $query->where(function ($q) use ($numericIds, $slugs) {
                    if (!empty($numericIds)) {
                        $q->orWhereIn('id', $numericIds);
                    }
                    if (!empty($slugs)) {
                        $q->orWhereIn('slug', $slugs);
                    }
                });
            }, function ($query) {
                $query->whereRaw('1 = 0');
            })
            ->pluck('id')
            ->all();

        DB::transaction(function () use ($user, $categoryIds, $request) {
            $user->categories()->sync($categoryIds);

            if ($request->filled('travel_style')) {
                $user->travel_style = $request->input('travel_style');
                $user->save();
            }
        });

        $preferences = $user->categories()
            ->get(['categories.id', 'categories.name', 'categories.slug']);

        return response()->json([
            'status' => 'success',
            'message' => 'Preferensi perjalanan berhasil disimpan.',
            'data' => [
                'travel_style' => $user->travel_style ?? 'healing',
                'preferences' => $preferences,
            ],
        ]);
    }

    /**
     * Toggle notifications_enabled for the authenticated user.
     */
    public function updateNotificationSetting(Request $request): JsonResponse
    {
        $user = $this->resolveAuthenticatedUser($request);

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Sesi autentikasi tidak valid atau telah berakhir. Silakan login kembali.',
            ], 401);
        }

        $validator = Validator::make($request->all(), [
            'notifications_enabled' => ['required', 'boolean'],
        ], [
            'notifications_enabled.required' => 'Status notifikasi wajib dikirimkan.',
            'notifications_enabled.boolean' => 'Status notifikasi harus berupa boolean.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors(),
            ], 422);
        }

        $user->notifications_enabled = (bool) $request->boolean('notifications_enabled');
        $user->save();

        return response()->json([
            'status' => 'success',
            'message' => $user->notifications_enabled
                ? 'Notifikasi aplikasi diaktifkan.'
                : 'Notifikasi aplikasi dinonaktifkan.',
            'data' => [
                'notifications_enabled' => (bool) $user->notifications_enabled,
            ],
        ]);
    }

    /**
     * Toggle app-level location_permission_enabled for the authenticated user.
     */
    public function updateLocationPermission(Request $request): JsonResponse
    {
        $user = $this->resolveAuthenticatedUser($request);

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Sesi autentikasi tidak valid atau telah berakhir. Silakan login kembali.',
            ], 401);
        }

        $validator = Validator::make($request->all(), [
            'location_permission_enabled' => ['required', 'boolean'],
        ], [
            'location_permission_enabled.required' => 'Status izin lokasi wajib dikirimkan.',
            'location_permission_enabled.boolean' => 'Status izin lokasi harus berupa boolean.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors(),
            ], 422);
        }

        $user->location_permission_enabled = (bool) $request->boolean('location_permission_enabled');
        $user->save();

        return response()->json([
            'status' => 'success',
            'message' => $user->location_permission_enabled
                ? 'Izin lokasi aplikasi diaktifkan.'
                : 'Izin lokasi aplikasi dinonaktifkan.',
            'data' => [
                'location_permission_enabled' => (bool) $user->location_permission_enabled,
            ],
        ]);
    }

    /**
     * Return FAQ items and official support contact info for Help Center.
     */
    public function helpCenter(): JsonResponse
    {
        $whatsapp = (string) config('services.support.whatsapp', '6285889662159');
        $email = (string) config('services.support.email', 'bantuan@jabarpleasure.id');

        return response()->json([
            'status' => 'success',
            'data' => [
                'support' => [
                    'whatsapp' => $whatsapp,
                    'email' => $email,
                ],
                'faqs' => [
                    [
                        'question' => 'Bagaimana cara menyimpan destinasi ke Wishlist?',
                        'answer' => 'Buka detail destinasi dari peta atau daftar eksplorasi, lalu ketuk ikon hati (Wishlist). Semua destinasi tersimpan dapat diakses melalui menu Profil atau header atas.',
                    ],
                    [
                        'question' => 'Bagaimana cara membuat Rencana Perjalanan (Itinerary)?',
                        'answer' => 'Pilih tab Rencana pada navigasi bawah, buat itinerary baru, lalu tambahkan destinasi favorit beserta tanggal kunjungan dan catatan pribadi Anda.',
                    ],
                    [
                        'question' => 'Mengapa rekomendasi peta membutuhkan izin lokasi (GPS)?',
                        'answer' => 'JabarPleasure menggunakan posisi GPS perangkat untuk menampilkan wisata terdekat (radius spasial) serta estimasi jarak tempuh dari lokasi Anda saat ini.',
                    ],
                    [
                        'question' => 'Apakah destinasi yang saya ajukan langsung tampil di peta?',
                        'answer' => 'Setiap pengajuan lokasi wisata baru akan ditinjau terlebih dahulu oleh tim kurator/admin JabarPleasure sebelum dipublikasikan ke peta utama.',
                    ],
                    [
                        'question' => 'Bagaimana jika saya lupa kata sandi akun?',
                        'answer' => 'Jika sudah masuk, Anda dapat mengganti kata sandi melalui menu Privasi & Keamanan di halaman Profil. Jika terkendala masuk, silakan hubungi tim bantuan kami via WhatsApp atau Email.',
                    ],
                ],
            ],
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

        return null;
    }
}

