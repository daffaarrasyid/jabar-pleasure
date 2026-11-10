<?php

namespace App\Http\Controllers;

use App\Models\Destination;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class DestinationController extends Controller
{
    /**
     * Get paginated destinations with optional filters.
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = min((int) $request->input('per_page', 10), 50);
        $category = $request->input('category');
        $regency = $request->input('regency');
        $search = $request->input('search');
        $lat = $request->input('lat');
        $lng = $request->input('lng');
        $radius = $request->input('radius');
        $sortBy = $request->input('sort_by'); // 'visitors' | 'popular' | 'distance' | 'default'

        $query = Destination::with(['category:id,name,slug', 'regency:id,name'])
            ->withCount('checkIns')
            ->withCoordinates();

        if ($category) {
            $query->filterCategory($category);
        }

        if ($regency) {
            $query->whereHas('regency', function ($q) use ($regency) {
                $q->where('name', 'ILIKE', "%{$regency}%")
                  ->orWhere('id', is_numeric($regency) ? $regency : null);
            });
        }

        if ($search) {
            $query->search($search);
        }

        if (is_numeric($lat) && is_numeric($lng)) {
            if (is_numeric($radius)) {
                $query->whereRaw(
                    "ST_DWithin(location::geography, ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography, ?)",
                    [(float) $lng, (float) $lat, (float) $radius * 1000]
                );
            }

            $query->selectRaw(
                "ROUND((ST_Distance(location::geography, ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography) / 1000.0)::numeric, 1) as distance_km",
                [(float) $lng, (float) $lat]
            );

            if ($sortBy === 'visitors' || $sortBy === 'popular') {
                $query->orderBy('check_ins_count', 'desc')
                      ->orderBy('distance_km', 'asc');
            } else {
                $query->orderBy('distance_km', 'asc');
            }
        } else {
            if ($sortBy === 'visitors' || $sortBy === 'popular') {
                $query->orderBy('check_ins_count', 'desc')
                      ->orderBy('id', 'asc');
            } else {
                $query->orderBy('id', 'asc');
            }
        }

        $destinations = $query->paginate($perPage);

        return response()->json([
            'status' => 'success',
            'data' => $destinations->items(),
            'pagination' => [
                'current_page' => $destinations->currentPage(),
                'last_page' => $destinations->lastPage(),
                'per_page' => $destinations->perPage(),
                'total' => $destinations->total(),
            ],
        ]);
    }

    /**
     * Get featured destinations for Home screen ("Tempat Hiburan untuk Anda").
     * Displays destinations matching user's registered preferences from user_preferences,
     * ordered by highest visitor count (check_ins_count DESC).
     */
    public function featured(Request $request): JsonResponse
    {
        $limit = min((int) $request->input('limit', 5), 20);
        $category = $request->input('category');
        $lat = (float) $request->input('lat', -6.9175);
        $lng = (float) $request->input('lng', 107.6191);

        $user = $request->user() ?? User::first();

        $query = Destination::with(['category:id,name,slug', 'regency:id,name'])
            ->withCount('checkIns')
            ->withCoordinates();

        // 1. Filter by explicit category if selected on frontend
        if ($category && $category !== 'Semua') {
            $query->filterCategory($category);
        } elseif ($user) {
            // 2. Otherwise filter by user's registered preferences from user_preferences
            $preferredCategoryIds = $user->categories()->pluck('categories.id')->toArray();
            if (!empty($preferredCategoryIds)) {
                $query->whereIn('category_id', $preferredCategoryIds);
            }
        }

        // Calculate distance from reference point
        $query->selectRaw(
            "ROUND((ST_Distance(location::geography, ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography) / 1000.0)::numeric, 1) as distance_km",
            [(float) $lng, (float) $lat]
        );

        // Urutkan dari pengunjung terbanyak (check_ins_count DESC)
        $items = $query->orderBy('check_ins_count', 'desc')
            ->orderBy('id', 'asc')
            ->limit($limit)
            ->get();

        // Fallback jika belum ada destinasi pada kategori preferensi user
        if ($items->isEmpty()) {
            $fallbackQuery = Destination::with(['category:id,name,slug', 'regency:id,name'])
                ->withCount('checkIns')
                ->withCoordinates()
                ->selectRaw(
                    "ROUND((ST_Distance(location::geography, ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography) / 1000.0)::numeric, 1) as distance_km",
                    [(float) $lng, (float) $lat]
                )
                ->orderBy('check_ins_count', 'desc')
                ->orderBy('id', 'asc')
                ->limit($limit);

            if ($category && $category !== 'Semua') {
                $fallbackQuery->filterCategory($category);
            }

            $items = $fallbackQuery->get();
        }

        return response()->json([
            'status' => 'success',
            'data' => $items,
        ]);
    }

    /**
     * Get nearby recommendations based on user coordinates ("Rekomendasi Terdekat").
     * Uses highest radius (25km) and ordered from closest to farthest (distance ASC).
     */
    public function nearby(Request $request): JsonResponse
    {
        $lat = (float) $request->input('lat', -6.9175);
        $lng = (float) $request->input('lng', 107.6191);
        $radiusKm = (float) $request->input('radius', 25.0); // Radius tertinggi 25km
        $limit = min((int) $request->input('limit', 5), 20); // Default 5, bisa 10
        $category = $request->input('category');

        $query = Destination::with(['category:id,name,slug', 'regency:id,name'])
            ->withCount('checkIns')
            ->withCoordinates()
            ->nearby($lat, $lng, $radiusKm);

        if ($category && $category !== 'Semua') {
            $query->filterCategory($category);
        }

        // Ordered from closest to farthest (distance_meters ASC)
        $items = $query->limit($limit)->get();

        // Fallback if no destinations within immediate radius
        if ($items->isEmpty()) {
            $fallbackQuery = Destination::with(['category:id,name,slug', 'regency:id,name'])
                ->withCount('checkIns')
                ->withCoordinates()
                ->selectRaw(
                    "ROUND((ST_Distance(location::geography, ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography) / 1000.0)::numeric, 1) as distance_km",
                    [(float) $lng, (float) $lat]
                )
                ->selectRaw(
                    "ST_Distance(location::geography, ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography) as distance_meters",
                    [(float) $lng, (float) $lat]
                )
                ->orderBy('distance_meters', 'asc');

            if ($category && $category !== 'Semua') {
                $fallbackQuery->filterCategory($category);
            }

            $items = $fallbackQuery->limit($limit)->get();
        }

        // Map distance to km string format
        $items->transform(function ($item) {
            $distanceKm = isset($item->distance_km)
                ? $item->distance_km
                : (isset($item->distance_meters) ? round($item->distance_meters / 1000, 1) : null);
            $item->distance_km = $distanceKm;
            return $item;
        });

        return response()->json([
            'status' => 'success',
            'data' => $items,
        ]);
    }

    /**
     * Show single destination by slug or ID.
     */
    public function show(string $slugOrId): JsonResponse
    {
        $query = Destination::with(['category', 'regency'])
            ->withCount('checkIns')
            ->withCoordinates();

        if (is_numeric($slugOrId)) {
            $destination = $query->where('id', $slugOrId)->first();
        } else {
            $destination = $query->where('slug', $slugOrId)->first();
        }

        if (!$destination) {
            return response()->json([
                'status' => 'error',
                'message' => 'Destinasi wisata tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $destination,
        ]);
    }

    /**
     * Search destinations by name, cluster, or city.
     */
    public function search(Request $request): JsonResponse
    {
        $queryText = trim($request->input('q', $request->input('search', '')));
        $category = $request->input('category');
        $lat = $request->input('lat');
        $lng = $request->input('lng');
        $limit = min((int) $request->input('limit', 20), 50);

        if (empty($queryText) && empty($category)) {
            return response()->json([
                'status' => 'success',
                'data' => [],
            ]);
        }

        $query = Destination::with(['category:id,name,slug', 'regency:id,name'])
            ->withCount('checkIns')
            ->withCoordinates();

        if (!empty($queryText)) {
            $query->search($queryText);
        }

        if (!empty($category)) {
            $query->filterCategory($category);
        }

        $sortBy = $request->input('sort_by');

        if (is_numeric($lat) && is_numeric($lng)) {
            $query->selectRaw(
                "ROUND((ST_Distance(location::geography, ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography) / 1000.0)::numeric, 1) as distance_km",
                [(float) $lng, (float) $lat]
            );

            if ($sortBy === 'visitors' || $sortBy === 'popular') {
                $query->orderBy('check_ins_count', 'desc')
                      ->orderBy('distance_km', 'asc');
            } else {
                $query->orderBy('distance_km', 'asc');
            }
        } else {
            if ($sortBy === 'visitors' || $sortBy === 'popular') {
                $query->orderBy('check_ins_count', 'desc')
                      ->orderBy('id', 'asc');
            } else {
                $query->orderBy('id', 'asc');
            }
        }

        $results = $query->limit($limit)->get();

        return response()->json([
            'status' => 'success',
            'data' => $results,
        ]);
    }

    /**
     * Store a new destination directly (Admin action) and broadcast to all users.
     */
    public function store(Request $request, NotificationService $notificationService): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:200',
            'category_id' => 'required|integer|exists:categories,id',
            'regency_id' => 'nullable|integer|exists:regencies_cities,id',
            'description' => 'nullable|string',
            'address' => 'nullable|string',
            'price_range' => 'nullable|string|max:50',
            'opening_hours' => 'nullable|string|max:100',
            'latitude' => 'required|numeric|between:-11.0,6.0',
            'longitude' => 'required|numeric|between:95.0,141.0',
            'cover_image' => 'nullable|string|max:255',
        ]);

        $baseSlug = Str::slug($validated['name']);
        $slug = $baseSlug;
        $counter = 1;
        while (Destination::where('slug', $slug)->exists()) {
            $slug = "{$baseSlug}-{$counter}";
            $counter++;
        }

        $lng = (float) $validated['longitude'];
        $lat = (float) $validated['latitude'];

        $destination = new Destination();
        $destination->name = $validated['name'];
        $destination->slug = $slug;
        $destination->category_id = $validated['category_id'];
        $destination->regency_id = $validated['regency_id'] ?? null;
        $destination->description = $validated['description'] ?? null;
        $destination->address = $validated['address'] ?? null;
        $destination->price_range = $validated['price_range'] ?? 'Menyesuaikan';
        $destination->opening_hours = $validated['opening_hours'] ?? 'Setiap Hari';
        $destination->cover_image = $validated['cover_image'] ?? null;
        $destination->location = DB::raw("ST_SetSRID(ST_MakePoint({$lng}, {$lat}), 4326)");
        $destination->save();

        // Broadcast to all users
        $broadcastCount = $notificationService->broadcastNewDestination($destination);

        return response()->json([
            'status' => 'success',
            'message' => "Destinasi '{$destination->name}' berhasil ditambahkan dan disiarkan ke {$broadcastCount} pengguna.",
            'data' => $destination->load(['category', 'regency']),
        ], 201);
    }
}

