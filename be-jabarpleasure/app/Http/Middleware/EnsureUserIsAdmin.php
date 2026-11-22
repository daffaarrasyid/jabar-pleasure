<?php

namespace App\Http\Middleware;

use App\Models\User;
use Carbon\Carbon;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsAdmin
{
    /**
     * Handle an incoming request.
     * Ensure the user has the 'admin' role and that admin session has not been idle for >= 60 minutes.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Support dev mock token fallback if Sanctum token isn't in database
        if (!$user) {
            $authHeader = $request->header('Authorization', '');
            if (str_contains($authHeader, 'admin_mock_session_token_') || str_contains($authHeader, 'Bearer admin')) {
                $user = User::where('role', 'admin')->first();
                if ($user) {
                    $request->setUserResolver(fn () => $user);
                }
            }
        }

        if (!$user || $user->role !== 'admin') {
            return response()->json([
                'status' => 'error',
                'message' => 'Akses ditolak. Anda tidak memiliki izin hak akses Administrator (403 Forbidden).',
            ], 403);
        }

        if ($user->is_blocked) {
            return response()->json([
                'status' => 'error',
                'message' => 'Akun Administrator ini telah dinonaktifkan.',
            ], 403);
        }

        // 60-minute idle session timeout check for Administrator
        $token = $user->currentAccessToken();
        $tokenId = $token?->id ?? ('admin_' . $user->id);
        $cacheKey = 'admin_session_activity_' . $tokenId;
        $lastActivity = Cache::get($cacheKey);

        if ($lastActivity && Carbon::parse($lastActivity)->diffInMinutes(now()) >= 60) {
            if ($token) {
                $token->delete();
            }
            Cache::forget($cacheKey);

            return response()->json([
                'status' => 'error',
                'code' => 'SESSION_IDLE_TIMEOUT',
                'message' => 'Sesi Administrator telah kedaluwarsa karena tidak ada aktivitas selama 60 menit. Silakan login kembali.',
            ], 401);
        }

        // Refresh last active timestamp for 24 hours
        Cache::put($cacheKey, now()->toIso8601String(), now()->addDay());

        return $next($request);
    }
}

