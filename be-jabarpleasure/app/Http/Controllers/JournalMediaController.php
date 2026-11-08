<?php

namespace App\Http\Controllers;

use App\Models\CheckIn;
use App\Models\Destination;
use App\Models\Itinerary;
use App\Models\JournalMedia;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;

class JournalMediaController extends Controller
{
    /**
     * Upload compressed media (WebP/WebM) to Supabase Storage and persist journal record.
     */
    public function upload(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|max:10240', // Max 10MB
            'caption' => 'nullable|string|max:1000',
            'destination_id' => 'nullable',
            'itinerary_id' => 'nullable',
            'media_type' => 'nullable|in:photo,video',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validasi file gagal.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $file = $request->file('file');
        $user = $this->resolveAuthenticatedUser($request);

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Sesi autentikasi tidak valid atau telah berakhir. Silakan login kembali.',
            ], 401);
        }

        $userId = $user->id;

        $mime = $file->getMimeType() ?: '';
        $isVideo = str_starts_with($mime, 'video/') || $request->input('media_type') === 'video';
        $mediaType = $isVideo ? 'video' : 'photo';

        // PRD capacity checks: Photo <= 2MB, Video <= 10MB
        $fileSizeKb = (int) round($file->getSize() / 1024);
        if (!$isVideo && $fileSizeKb > 2048) {
            return response()->json([
                'status' => 'error',
                'message' => 'Ukuran foto melebihi batas 2MB.',
            ], 422);
        }

        if ($isVideo && $fileSizeKb > 10240) {
            return response()->json([
                'status' => 'error',
                'message' => 'Ukuran video melebihi batas 10MB.',
            ], 422);
        }

        // Determine destination & itinerary IDs
        $destId = $request->input('destination_id');
        $itineraryId = $request->input('itinerary_id');

        // Resolve destination record safely
        $destination = null;
        if ($destId) {
            if (is_numeric($destId)) {
                $destination = Destination::find((int) $destId);
            }
            if (!$destination && is_string($destId)) {
                $destination = Destination::where('slug', $destId)
                    ->orWhere('name', 'ilike', "%{$destId}%")
                    ->first();
            }
        }

        $destSlug = $destination ? Str::slug($destination->name, '-') : (is_string($destId) ? Str::slug($destId, '-') : 'destinasi');
        $targetDestId = $destination ? $destination->id : (Destination::value('id') ?? 1);

        // Validate itinerary_id for PostgreSQL foreign key (check_ins.itinerary_id is bigint)
        $validItineraryId = null;
        if ($itineraryId && is_numeric($itineraryId)) {
            $exists = Itinerary::where('id', (int) $itineraryId)->exists();
            if ($exists) {
                $validItineraryId = (int) $itineraryId;
            }
        }

        $extension = $file->getClientOriginalExtension();
        if (!$extension) {
            $extension = $isVideo ? 'webm' : 'webp';
        }

        // Unique filename: user{userId}_{itinTag}_{destSlug}_{timestamp}_{randomHex}.{ext}
        $timestamp = time();
        $randomHex = Str::lower(Str::random(6));
        $itinTag = $itineraryId ? Str::slug((string) $itineraryId, '-') : 'general';
        $filename = "user{$userId}_{$itinTag}_{$destSlug}_{$timestamp}_{$randomHex}.{$extension}";

        // Structured storage path: journals/user_{userId}/itinerary_{itinTag}/{filename}
        $storagePath = "journals/user_{$userId}/itinerary_{$itinTag}/{$filename}";

        // Upload to Supabase Storage via REST API using configured service role key
        $supabaseUrl = rtrim(config('services.supabase.url', 'https://nruydgxivzixylaxoced.supabase.co'), '/');
        $supabaseKey = config('services.supabase.key');
        $bucket = config('services.supabase.bucket', 'destinations');

        $publicUrl = "{$supabaseUrl}/storage/v1/object/public/{$bucket}/{$storagePath}";

        if ($supabaseKey) {
            try {
                $uploadUrl = "{$supabaseUrl}/storage/v1/object/{$bucket}/{$storagePath}";
                $fileContents = file_get_contents($file->getRealPath());

                $response = Http::withHeaders([
                    'Authorization' => 'Bearer ' . $supabaseKey,
                    'apiKey' => $supabaseKey,
                    'Content-Type' => $mime ?: ($isVideo ? 'video/webm' : 'image/webp'),
                    'x-upsert' => 'true',
                ])->withBody($fileContents, $mime ?: ($isVideo ? 'video/webm' : 'image/webp'))
                  ->post($uploadUrl);

                if ($response->failed()) {
                    Log::warning('Supabase storage upload returned error: ' . $response->body());
                    // Fallback to storing locally if Supabase upload failed
                    $file->storeAs("public/journals/{$itinTag}", $filename);
                    $publicUrl = asset("storage/journals/{$itinTag}/{$filename}");
                }
            } catch (\Throwable $e) {
                Log::error('Supabase storage upload exception: ' . $e->getMessage());
                $file->storeAs("public/journals/{$itinTag}", $filename);
                $publicUrl = asset("storage/journals/{$itinTag}/{$filename}");
            }
        } else {
            // Local fallback if SUPABASE_KEY is missing
            $file->storeAs("public/journals/{$itinTag}", $filename);
            $publicUrl = asset("storage/journals/{$itinTag}/{$filename}");
        }

        // Find or create CheckIn record safely without invalid bigint cast
        $checkInQuery = CheckIn::where('user_id', $userId)
            ->where('destination_id', $targetDestId);

        if ($validItineraryId) {
            $checkInQuery->where('itinerary_id', $validItineraryId);
        }

        $checkIn = $checkInQuery->latest('checked_in_at')->first();

        if (!$checkIn) {
            // Create default check-in for record tracking
            $checkIn = new CheckIn();
            $checkIn->user_id = $userId;
            $checkIn->destination_id = $targetDestId;
            $checkIn->itinerary_id = $validItineraryId;
            $checkIn->check_in_coord = DB::raw("ST_SetSRID(ST_MakePoint(106.8058, -6.6009), 4326)");
            $checkIn->distance_deviation = 0.00;
            $checkIn->checked_in_at = now();
            $checkIn->is_synced_from_offline = false;
            $checkIn->created_at = now();
            $checkIn->save();
        }

        // Create JournalMedia entry
        $journalMedia = JournalMedia::create([
            'check_in_id' => $checkIn->id,
            'file_path' => $storagePath,
            'media_type' => $mediaType,
            'file_size_kb' => $fileSizeKb,
            'caption' => $request->input('caption'),
            'created_at' => now(),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Media jurnal berhasil diunggah ke brankas.',
            'data' => [
                'id' => $journalMedia->id,
                'check_in_id' => $checkIn->id,
                'file_path' => $storagePath,
                'public_url' => $publicUrl,
                'media_type' => $mediaType,
                'file_size_kb' => $fileSizeKb,
                'caption' => $journalMedia->caption,
                'destination_id' => $targetDestId,
                'itinerary_id' => $validItineraryId,
                'created_at' => $journalMedia->created_at,
            ],
        ], 201);
    }

    /**
     * Get media items for a given itinerary.
     */
    public function getByItinerary(Request $request, $itineraryId): JsonResponse
    {
        $validItineraryId = is_numeric($itineraryId) ? (int) $itineraryId : null;
        if (!$validItineraryId) {
            return response()->json([
                'status' => 'success',
                'data' => [],
            ]);
        }

        $checkIns = CheckIn::where('itinerary_id', $validItineraryId)
            ->with(['destination'])
            ->get();

        $checkInIds = $checkIns->pluck('id');

        $media = JournalMedia::whereIn('check_in_id', $checkInIds)
            ->latest('created_at')
            ->get()
            ->map(function ($item) use ($checkIns) {
                $checkIn = $checkIns->firstWhere('id', $item->check_in_id);
                return [
                    'id' => $item->id,
                    'check_in_id' => $item->check_in_id,
                    'destination_id' => $checkIn ? $checkIn->destination_id : null,
                    'destination_name' => $checkIn && $checkIn->destination ? $checkIn->destination->name : null,
                    'file_path' => $item->file_path,
                    'url' => $item->url,
                    'media_type' => $item->media_type,
                    'file_size_kb' => $item->file_size_kb,
                    'caption' => $item->caption,
                    'created_at' => $item->created_at,
                ];
            });

        return response()->json([
            'status' => 'success',
            'data' => $media,
        ]);
    }

    /**
     * Helper to resolve the authenticated User instance via Sanctum.
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

