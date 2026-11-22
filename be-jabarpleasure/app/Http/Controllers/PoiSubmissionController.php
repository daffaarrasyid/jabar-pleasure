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
        $user = $request->user() ?? auth('sanctum')->user();
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
            'latitude' => 'nullable|numeric|between:-11.0,6.0',
            'longitude' => 'nullable|numeric|between:95.0,141.0',
            'evidence_image' => 'nullable|string|max:500',
            'image' => 'nullable|image|max:2048',
        ]);

        $lng = !empty($validated['longitude']) ? (float) $validated['longitude'] : 107.6191;
        $lat = !empty($validated['latitude']) ? (float) $validated['latitude'] : -6.9175;

        // Resolve category strictly from existing categories in database (4 official clusters)
        $categoryId = $validated['category_id'] ?? null;
        if ($categoryId && !Category::where('id', $categoryId)->exists()) {
            $categoryId = null;
        }

        if (!$categoryId && !empty($validated['category_name'])) {
            $cat = Category::where('name', 'ILIKE', "%{$validated['category_name']}%")
                ->orWhere('slug', 'ILIKE', '%' . Str::slug($validated['category_name']) . '%')
                ->first();
            $categoryId = $cat?->id;
        }

        if (!$categoryId) {
            return response()->json([
                'status' => 'error',
                'message' => 'Kategori yang dipilih tidak valid. Destinasi harus diklasifikasikan ke dalam salah satu dari 4 kategori resmi yang tersedia di JabarPleasure.',
            ], 422);
        }

        // Resolve regency if not provided, find closest regency in West Java
        $regencyId = $validated['regency_id'] ?? null;
        if (!$regencyId) {
            $closestRegency = RegencyCity::select('id')
                ->whereNotNull('geom')
                ->orderByRaw(
                    "ST_Distance(geom::geography, ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography) ASC",
                    [$lng, $lat]
                )
                ->first();
            $regencyId = $closestRegency?->id ?? RegencyCity::first()?->id ?? 1;
        }

        $evidenceImage = $validated['evidence_image'] ?? null;
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('submissions', 'public');
            $evidenceImage = "/storage/{$path}";
        }

        $submission = new PoiSubmission();
        $submission->user_id = $user->id;
        $submission->category_id = $categoryId;
        $submission->regency_id = $regencyId;
        $submission->name = $validated['name'];
        $submission->description = $validated['description'] ?? "Destinasi diajukan oleh pengguna {$user->name}";
        $submission->price_range = $validated['price_range'] ?? 'Gratis / Menyesuaikan';
        $submission->opening_hours = $validated['opening_hours'] ?? 'Setiap Hari';
        $submission->evidence_image = $evidenceImage;
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

        if ($status && in_array($status, ['pending', 'approved', 'rejected'])) {
            $query->where('status', $status);
        }

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ILIKE', "%{$search}%")
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('name', 'ILIKE', "%{$search}%");
                  });
            });
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

        if ($request->filled('latitude') && $request->filled('longitude')) {
            $lat = (float) $request->input('latitude');
            $lng = (float) $request->input('longitude');
            $submission->proposed_location = DB::raw("ST_SetSRID(ST_MakePoint({$lng}, {$lat}), 4326)");
        } else {
            $lng = (float) ($submission->longitude ?? 107.6191);
            $lat = (float) ($submission->latitude ?? -6.9175);
        }

        $submission->status = 'approved';
        $submission->admin_note = $adminNote;
        $submission->reviewed_by = $admin?->id;
        $submission->reviewed_at = now();
        $submission->save();

        // Ensure regency_id satisfies not-null constraint
        $regencyId = $submission->regency_id;
        if (!$regencyId) {
            $closestRegency = RegencyCity::select('id')
                ->whereNotNull('geom')
                ->orderByRaw(
                    "ST_Distance(geom::geography, ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography) ASC",
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
