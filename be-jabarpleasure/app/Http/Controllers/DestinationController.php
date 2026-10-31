<?php

namespace App\Http\Controllers;

use App\Models\Destination;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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

        $query = Destination::with(['category:id,name,slug', 'regency:id,name'])
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
            $query->selectRaw(
                "ST_Distance(location::geography, ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography) / 1000.0 as distance_km",
                [(float) $lng, (float) $lat]
            )->orderBy('distance_km', 'asc');
        } else {
            $query->orderBy('id', 'asc');
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
     */
    public function featured(Request $request): JsonResponse
    {
        $limit = min((int) $request->input('limit', 4), 12);
        $category = $request->input('category');
        $lat = $request->input('lat', -6.9175);
        $lng = $request->input('lng', 107.6191);

        $query = Destination::with(['category:id,name,slug', 'regency:id,name'])
            ->withCoordinates();

        if ($category) {
            $query->filterCategory($category);
        }

        // Calculate distance from reference point
        $query->selectRaw(
            "ROUND((ST_Distance(location::geography, ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography) / 1000.0)::numeric, 1) as distance_km",
            [(float) $lng, (float) $lat]
        );

        // Prefer destinations that have cover images or descriptions first
        $items = $query->orderByRaw("CASE WHEN cover_image IS NOT NULL THEN 0 ELSE 1 END")
            ->orderBy('id', 'asc')
            ->limit($limit)
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $items,
        ]);
    }

    /**
     * Get nearby recommendations based on user coordinates ("Rekomendasi Terdekat").
     */
    public function nearby(Request $request): JsonResponse
    {
        $lat = (float) $request->input('lat', -6.9175);
        $lng = (float) $request->input('lng', 107.6191);
        $radiusKm = (float) $request->input('radius', 5.0);
        $limit = min((int) $request->input('limit', 6), 20);
        $category = $request->input('category');

        $query = Destination::with(['category:id,name,slug', 'regency:id,name'])
            ->withCoordinates()
            ->nearby($lat, $lng, $radiusKm);

        if ($category) {
            $query->filterCategory($category);
        }

        $items = $query->limit($limit)->get();

        // If radius is strict (5km) and returns fewer than 3 items, expand search slightly to provide helpful recommendations
        if ($items->count() < 3 && $radiusKm <= 5.0) {
            $fallbackQuery = Destination::with(['category:id,name,slug', 'regency:id,name'])
                ->withCoordinates()
                ->nearby($lat, $lng, 25.0);

            if ($category) {
                $fallbackQuery->filterCategory($category);
            }

            $items = $fallbackQuery->limit($limit)->get();
        }

        // Map distance to km string format
        $items->transform(function ($item) {
            $distanceKm = isset($item->distance_meters) ? round($item->distance_meters / 1000, 1) : null;
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
            ->withCoordinates();

        if (!empty($queryText)) {
            $query->search($queryText);
        }

        if (!empty($category)) {
            $query->filterCategory($category);
        }

        if (is_numeric($lat) && is_numeric($lng)) {
            $query->selectRaw(
                "ROUND((ST_Distance(location::geography, ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography) / 1000.0)::numeric, 1) as distance_km",
                [(float) $lng, (float) $lat]
            )->orderBy('distance_km', 'asc');
        } else {
            $query->orderBy('id', 'asc');
        }

        $results = $query->limit($limit)->get();

        return response()->json([
            'status' => 'success',
            'data' => $results,
        ]);
    }
}

