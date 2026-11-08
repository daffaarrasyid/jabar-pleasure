<?php

namespace App\Http\Controllers;

use App\Models\Destination;
use App\Models\Itinerary;
use App\Models\ItineraryItem;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class ItineraryController extends Controller
{
    /**
     * Get list of user's saved itineraries.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user() ?? User::first();

        if (!$user) {
            return response()->json([
                'status' => 'success',
                'data' => [],
            ]);
        }

        $status = $request->query('status');

        $query = Itinerary::where('user_id', $user->id)
            ->select([
                'itineraries.*',
                DB::raw('ST_Y(departure_location::geometry) as departure_lat'),
                DB::raw('ST_X(departure_location::geometry) as departure_lng'),
            ])
            ->with([
                'items.destination' => function ($q) {
                    $q->withCoordinates()->withCount('checkIns');
                },
            ]);

        if ($status) {
            $query->where('status', $status);
        }

        $itineraries = $query->latest()->get();

        return response()->json([
            'status' => 'success',
            'data' => $itineraries,
        ]);
    }

    /**
     * Store a newly created itinerary in database.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:150',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'departure_lat' => 'nullable|numeric',
            'departure_lng' => 'nullable|numeric',
            'departure_name' => 'nullable|string|max:150',
            'route_geojson' => 'nullable|array',
            'status' => 'nullable|string|max:30',
            'destinations' => 'required|array|min:1',
            'destinations.*' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validasi data rencana perjalanan gagal.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user() ?? User::first();

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'User tidak ditemukan atau belum diautentikasi.',
            ], 401);
        }

        $startDate = $request->input('start_date', now()->toDateString());
        $endDate = $request->input('end_date', now()->toDateString());
        $departureLat = $request->input('departure_lat');
        $departureLng = $request->input('departure_lng');
        $departureName = $request->input('departure_name', 'Titik Keberangkatan');
        $routeGeojson = $request->input('route_geojson');
        $destinations = $request->input('destinations', []);

        // Include departure name inside route_geojson metadata if available
        if ($routeGeojson && is_array($routeGeojson)) {
            $routeGeojson['properties'] = array_merge(
                $routeGeojson['properties'] ?? [],
                [
                    'departure_name' => $departureName,
                    'destination_count' => count($destinations),
                ]
            );
        }

        DB::beginTransaction();
        try {
            $itinerary = new Itinerary();
            $itinerary->user_id = $user->id;
            $itinerary->title = $request->input('title');
            $itinerary->start_date = $startDate;
            $itinerary->end_date = $endDate;
            $itinerary->status = $request->input('status', 'planned');
            $itinerary->route_geojson = $routeGeojson;

            if (is_numeric($departureLat) && is_numeric($departureLng)) {
                $itinerary->departure_location = DB::raw(
                    "ST_SetSRID(ST_MakePoint(" . (float) $departureLng . ", " . (float) $departureLat . "), 4326)"
                );
            }

            $itinerary->save();

            // Insert itinerary items
            $order = 1;
            foreach ($destinations as $item) {
                $destId = is_array($item) ? ($item['id'] ?? null) : $item;
                $eta = is_array($item) ? ($item['estimated_time_arrival'] ?? null) : null;

                if (!$destId) continue;

                // Check if destination exists in database
                $exists = Destination::where('id', $destId)->exists();
                if (!$exists) continue;

                ItineraryItem::create([
                    'itinerary_id' => $itinerary->id,
                    'destination_id' => $destId,
                    'visit_order' => $order++,
                    'estimated_time_arrival' => $eta,
                ]);
            }

            DB::commit();

            // Load complete itinerary with items and destinations
            $savedItinerary = Itinerary::where('id', $itinerary->id)
                ->select([
                    'itineraries.*',
                    DB::raw('ST_Y(departure_location::geometry) as departure_lat'),
                    DB::raw('ST_X(departure_location::geometry) as departure_lng'),
                ])
                ->with([
                    'items.destination' => function ($q) {
                        $q->withCoordinates()->withCount('checkIns');
                    },
                ])
                ->first();

            return response()->json([
                'status' => 'success',
                'message' => 'Rencana perjalanan berhasil disimpan.',
                'data' => $savedItinerary,
            ], 201);
        } catch (\Throwable $e) {
            DB::rollBack();

            return response()->json([
                'status' => 'error',
                'message' => 'Gagal menyimpan rencana perjalanan: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Show a single itinerary.
     */
    public function show(Request $request, $id): JsonResponse
    {
        $itinerary = Itinerary::where('id', $id)
            ->select([
                'itineraries.*',
                DB::raw('ST_Y(departure_location::geometry) as departure_lat'),
                DB::raw('ST_X(departure_location::geometry) as departure_lng'),
            ])
            ->with([
                'items.destination' => function ($q) {
                    $q->withCoordinates()->withCount('checkIns');
                },
            ])
            ->first();

        if (!$itinerary) {
            return response()->json([
                'status' => 'error',
                'message' => 'Rencana perjalanan tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $itinerary,
        ]);
    }

    /**
     * Mark an itinerary as completed.
     */
    public function complete(Request $request, $id): JsonResponse
    {
        $user = $request->user() ?? User::first();
        $itinerary = Itinerary::where('id', $id)
            ->when($user, function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })
            ->first();

        if (!$itinerary) {
            return response()->json([
                'status' => 'error',
                'message' => 'Rencana perjalanan tidak ditemukan.',
            ], 404);
        }

        $itinerary->status = 'completed';
        $itinerary->end_date = now()->toDateString();
        $itinerary->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Perjalanan berhasil diselesaikan dan dipindahkan ke Riwayat.',
            'data' => $itinerary,
        ]);
    }

    /**
     * Delete an itinerary.
     */
    public function destroy(Request $request, $id): JsonResponse
    {
        $itinerary = Itinerary::find($id);

        if (!$itinerary) {
            return response()->json([
                'status' => 'error',
                'message' => 'Rencana perjalanan tidak ditemukan.',
            ], 404);
        }

        $itinerary->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Rencana perjalanan berhasil dihapus.',
        ]);
    }
}

