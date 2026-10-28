<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\User;
use App\Models\UserPreference;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Laravel\Sanctum\Sanctum;

class AuthController extends Controller
{
    /**
     * Handle user registration.
     */
    public function register(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'string', 'email', 'max:150', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'interests' => ['nullable', 'array'],
            'interests.*' => ['string'],
        ], [
            'name.required' => 'Nama lengkap tidak boleh kosong.',
            'name.max' => 'Nama lengkap maksimal 100 karakter.',
            'email.required' => 'Email tidak boleh kosong.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email ini sudah terdaftar. Silakan gunakan email lain atau masuk ke akun Anda.',
            'password.required' => 'Kata sandi tidak boleh kosong.',
            'password.min' => 'Kata sandi minimal 8 karakter.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors(),
            ], 422);
        }

        $validated = $validator->validated();

        try {
            DB::beginTransaction();

            $user = User::create([
                'name' => trim($validated['name']),
                'email' => strtolower(trim($validated['email'])),
                'password' => Hash::make($validated['password']),
                'role' => 'user',
                'is_blocked' => false,
            ]);

            // Save interests if provided during registration
            if (!empty($validated['interests'])) {
                $this->attachInterests($user, $validated['interests']);
            }

            // Generate token using Laravel Sanctum
            $token = $user->createToken('auth_token')->plainTextToken;

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Pendaftaran akun berhasil.',
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'role' => $user->role,
                        'created_at' => $user->created_at,
                    ],
                    'token' => $token,
                ],
            ], 201);
        } catch (\Throwable $e) {
            DB::rollBack();

            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan sistem saat memproses registrasi. Silakan coba kembali.',
                'debug' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Handle user login.
     */
    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ], [
            'email.required' => 'Email tidak boleh kosong.',
            'email.email' => 'Format email tidak valid.',
            'password.required' => 'Kata sandi tidak boleh kosong.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors(),
            ], 422);
        }

        $email = strtolower(trim($request->input('email')));
        $user = User::where('email', $email)->first();

        if (!$user || !Hash::check($request->input('password'), $user->password)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Email atau kata sandi yang Anda masukkan salah.',
                'errors' => [
                    'email' => ['Email atau kata sandi salah.'],
                ],
            ], 401);
        }

        if ($user->is_blocked) {
            return response()->json([
                'status' => 'error',
                'message' => 'Akun Anda sedang ditangguhkan/diblokir oleh sistem.',
            ], 403);
        }

        // Generate Sanctum Bearer token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'status' => 'success',
            'message' => 'Berhasil masuk.',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'created_at' => $user->created_at,
                ],
                'token' => $token,
            ],
        ]);
    }

    /**
     * Handle user logout.
     */
    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();
        if ($user) {
            $user->currentAccessToken()?->delete();
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Berhasil keluar sesi.',
        ]);
    }

    /**
     * Save onboarding user preferences.
     */
    public function savePreferences(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'user_id' => ['nullable', 'exists:users,id'],
            'interests' => ['required', 'array', 'min:1'],
            'interests.*' => ['string'],
        ], [
            'interests.required' => 'Pilih minimal satu minat.',
            'interests.min' => 'Pilih minimal satu minat.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors(),
            ], 422);
        }

        // Authenticate user via Sanctum token, auth context, or passed user_id
        $user = null;
        if ($bearer = $request->bearerToken()) {
            $tokenModel = Sanctum::$personalAccessTokenModel;
            $foundToken = $tokenModel::findToken($bearer);
            if ($foundToken) {
                $user = $foundToken->tokenable;
            }
        }

        if (!$user && $request->user()) {
            $user = $request->user();
        }

        if (!$user && $request->filled('user_id')) {
            $user = User::find($request->input('user_id'));
        }

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Pengguna tidak ditemukan atau sesi autentikasi tidak valid.',
            ], 401);
        }

        $interests = $request->input('interests');
        $this->attachInterests($user, $interests);

        return response()->json([
            'status' => 'success',
            'message' => 'Preferensi minat berhasil disimpan.',
            'data' => [
                'user_id' => $user->id,
                'preferences' => $user->categories()->get(['categories.id', 'categories.name', 'categories.slug']),
            ],
        ]);
    }

    /**
     * List master categories.
     */
    public function categories(): JsonResponse
    {
        $categories = Category::all(['id', 'name', 'slug', 'icon_url']);

        return response()->json([
            'status' => 'success',
            'data' => $categories,
        ]);
    }

    /**
     * Helper to attach category interests to a user.
     */
    private function attachInterests(User $user, array $interests): void
    {
        foreach ($interests as $interest) {
            $category = Category::where('slug', $interest)
                ->orWhere('name', $interest)
                ->orWhere('id', is_numeric($interest) ? $interest : null)
                ->first();

            if ($category) {
                UserPreference::firstOrCreate([
                    'user_id' => $user->id,
                    'category_id' => $category->id,
                ], [
                    'created_at' => now(),
                ]);
            }
        }
    }
}
