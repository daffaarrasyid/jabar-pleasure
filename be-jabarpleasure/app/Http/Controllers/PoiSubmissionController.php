<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Destination;
use App\Models\PoiSubmission;
use App\Models\RegencyCity;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PoiSubmissionController extends Controller
{
    protected NotificationService $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    /**
     * Submit a new destination for admin review (User action).
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user() ?? User::first();
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Silakan login terlebih dahulu untuk mengajukan destinasi.',
            ], 401);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:200',
            'category_id' => 'nullable|integer',
            'category_name' => 'nullable|string',
            'regency_id' => 'nullable|integer',
            'description' => 'nullable|string',
            'price_range' => 'nullable|string|max:50',
            'opening_hours' => 'nullable|string|max:100',
            'latitude' => 'required|numeric|between:-11.0,6.0',
            'longitude' => 'required|numeric|between:95.0,141.0',
            'evidence_image' => 'nullable|string|max:255',
        ]);

        // Resolve category
        $categoryId = $validated['category_id'] ?? null;
        if (!$categoryId && !empty($validated['category_name'])) {
            $cat = Category::where('name', 'ILIKE', "%{$validated['category_name']}%")->first();
            $categoryId = $cat?->id;
        }
        if (!$categoryId) {
            $categoryId = Category::first()?->id ?? 1;
        }

        // Resolve regency if not provided, find closest regency in West Java
        $regencyId = $validated['regency_id'] ?? null;
        if (!$regencyId) {
            $closestRegency = RegencyCity::select('id')
                ->whereNotNull('boundary')
                ->orderByRaw(
                    "ST_Distance(boundary::geography, ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography) ASC",
                    [(float) $validated['longitude'], (float) $validated['latitude']]
                )
                ->first();
            $regencyId = $closestRegency?->id;
        }

        $lng = (float) $validated['longitude'];
        $lat = (float) $validated['latitude'];

        $submission = new PoiSubmission();
        $submission->user_id = $user->id;
        $submission->category_id = $categoryId;
        $submission->regency_id = $regencyId;
        $submission->name = $validated['name'];
        $submission->description = $validated['description'] ?? "Destinasi diajukan oleh pengguna {$user->name}";
        $submission->price_range = $validated['price_range'] ?? 'Gratis / Menyesuaikan';
        $submission->opening_hours = $validated['opening_hours'] ?? 'Setiap Hari';
        $submission->evidence_image = $validated['evidence_image'] ?? null;
        $submission->status = 'pending';
        $submission->proposed_location = DB::raw("ST_SetSRID(ST_MakePoint({$lng}, {$lat}), 4326)");
        $submission->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Pengajuan destinasi berhasil dikirim dan akan segera ditinjau oleh kurator.',
            'data' => [
                'id' => $submission->id,
                'name' => $submission->name,
                'status' => $submission->status,
                'latitude' => $lat,
                'longitude' => $lng,
            ],
        ], 201);
    }

    /**
     * List submissions for admin inspection or moderation.
     */
    public function index(Request $request): JsonResponse
    {
        $status = $request->input('status'); // 'pending', 'approved', 'rejected', or null for all
        $perPage = min((int) $request->input('per_page', 20), 50);

        $query = PoiSubmission::with([
            'user:id,name,email',
            'category:id,name',
            'regency:id,name',
            'reviewer:id,name',
        ])->withCoordinates();

        if ($status) {
            $query->where('status', $status);
        }

        $submissions = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'status' => 'success',
            'data' => $submissions->items(),
            'pagination' => [
                'current_page' => $submissions->currentPage(),
                'last_page' => $submissions->lastPage(),
                'per_page' => $submissions->perPage(),
                'total' => $submissions->total(),
            ],
        ]);
    }

    /**
     * Approve a POI submission.
     * 1. Updates submission status to 'approved'.
     * 2. Publishes new Destination to the database.
     * 3. Sends confirmation notification to the submitter.
     * 4. Broadcasts new destination notification to ALL users.
     */
    public function approve(Request $request, int|string $id): JsonResponse
    {
        $admin = $request->user() ?? User::where('role', 'admin')->first() ?? User::first();

        $submission = PoiSubmission::withCoordinates()->find($id);
        if (!$submission) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data pengajuan destinasi tidak ditemukan.',
            ], 404);
        }

        if ($submission->status === 'approved') {
            return response()->json([
                'status' => 'error',
                'message' => 'Pengajuan ini sudah pernah disetujui sebelumnya.',
            ], 422);
        }

        $adminNote = $request->input('admin_note', 'Disetujui dan telah memenuhi kriteria kurasi lokasi.');

        $submission->update([
            'status' => 'approved',
            'admin_note' => $adminNote,
            'reviewed_by' => $admin?->id,
            'reviewed_at' => now(),
        ]);

        // Generate a unique slug
        $baseSlug = Str::slug($submission->name);
        $slug = $baseSlug;
        $counter = 1;
        while (Destination::where('slug', $slug)->exists()) {
            $slug = "{$baseSlug}-{$counter}";
            $counter++;
        }

        $lng = (float) ($submission->longitude ?? 107.6191);
        $lat = (float) ($submission->latitude ?? -6.9175);

        // Ensure regency_id satisfies not-null constraint
        $regencyId = $submission->regency_id;
        if (!$regencyId) {
            $closestRegency = RegencyCity::select('id')
                ->whereNotNull('boundary')
                ->orderByRaw(
                    "ST_Distance(boundary::geography, ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography) ASC",
                    [$lng, $lat]
                )
                ->first();
            $regencyId = $closestRegency?->id ?? RegencyCity::first()?->id ?? 1;
        }

        // Create new published destination
        $destination = new Destination();
        $destination->name = $submission->name;
        $destination->slug = $slug;
        $destination->category_id = $submission->category_id;
        $destination->regency_id = $regencyId;
        $destination->description = $submission->description;
        $destination->price_range = $submission->price_range ?? 'Menyesuaikan';
        $destination->opening_hours = $submission->opening_hours ?? 'Setiap Hari';
        $destination->cover_image = $submission->evidence_image;
        $destination->location = DB::raw("ST_SetSRID(ST_MakePoint({$lng}, {$lat}), 4326)");
        $destination->save();

        // 1. Send confirmation to the submitter
        $this->notificationService->sendSubmissionConfirmation($submission, 'approved', $adminNote);

        // 2. Broadcast new destination notification to all users
        $broadcastCount = $this->notificationService->broadcastNewDestination($destination);

        return response()->json([
            'status' => 'success',
            'message' => "Pengajuan '{$submission->name}' berhasil disetujui, dipublikasikan ke peta, dan notifikasi disiarkan ke {$broadcastCount} pengguna.",
            'data' => [
                'submission' => $submission,
                'destination' => $destination->load(['category', 'regency']),
                'broadcast_count' => $broadcastCount,
            ],
        ]);
    }

    /**
     * Reject a POI submission.
     * 1. Updates submission status to 'rejected' with admin note.
     * 2. Sends confirmation notification to the submitter explaining the rejection.
     */
    public function reject(Request $request, int|string $id): JsonResponse
    {
        $admin = $request->user() ?? User::where('role', 'admin')->first() ?? User::first();

        $submission = PoiSubmission::find($id);
        if (!$submission) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data pengajuan destinasi tidak ditemukan.',
            ], 404);
        }

        $adminNote = $request->input('admin_note', 'Tidak memenuhi kriteria kurasi lokasi atau koordinat tidak valid.');

        $submission->update([
            'status' => 'rejected',
            'admin_note' => $adminNote,
            'reviewed_by' => $admin?->id,
            'reviewed_at' => now(),
        ]);

        // Send confirmation notification to submitter
        $this->notificationService->sendSubmissionConfirmation($submission, 'rejected', $adminNote);

        return response()->json([
            'status' => 'success',
            'message' => "Pengajuan '{$submission->name}' telah ditolak dan notifikasi konfirmasi dikirim ke pengaju.",
            'data' => [
                'submission' => $submission,
            ],
        ]);
    }
}
