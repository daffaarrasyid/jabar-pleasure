<?php

namespace App\Http\Controllers;

use App\Models\Destination;
use App\Models\Itinerary;
use App\Models\ItineraryItem;
use App\Models\Notification;
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
        $user = $request->user() ?? auth('sanctum')->user();

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

        $user = $request->user() ?? auth('sanctum')->user();

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

            // Create notification record for this newly saved itinerary
            try {
                $hasScheduledDate = $request->filled('start_date') && $request->input('start_date') !== now()->toDateString();
                $dateFormatted = date('d M Y', strtotime($startDate));
                $notifTitle = $hasScheduledDate
                    ? 'Rencana Dijadwalkan: ' . $itinerary->title
                    : 'Rencana Tersimpan: ' . $itinerary->title;
                $notifMessage = $hasScheduledDate
                    ? "Rencana petualangan Anda dijadwalkan berangkat pada {$dateFormatted} dari titik awal \"{$departureName}\". Pengingat akan dikirim H-1 dan Hari-H."
                    : "Rencana perjalanan Anda dari \"{$departureName}\" berhasil disimpan dan siap dimulai kapan saja.";

                Notification::create([
                    'user_id' => $user->id,
                    'type' => $hasScheduledDate ? 'itinerary_scheduled' : 'itinerary_saved',
                    'title' => $notifTitle,
                    'message' => $notifMessage,
                    'data' => [
                        'itinerary_id' => $itinerary->id,
                        'title' => $itinerary->title,
                        'start_date' => $startDate,
                        'departure_name' => $departureName,
                        'destination_count' => count($destinations),
                    ],
                    'read_at' => null,
                ]);
            } catch (\Throwable $notifErr) {
                // Non-blocking notification error
            }

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
        $user = $request->user() ?? auth('sanctum')->user();

        $query = Itinerary::where('id', $id)
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

        if ($user) {
            $query->where('user_id', $user->id);
        }

        $itinerary = $query->first();

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
        $user = $request->user() ?? auth('sanctum')->user();

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'User tidak ditemukan atau belum diautentikasi.',
            ], 401);
        }

        $itinerary = Itinerary::where('id', $id)
            ->where('user_id', $user->id)
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
     * Update an existing itinerary (destinations, route, etc.)
     */
    public function update(Request $request, $id): JsonResponse
    {
        $user = $request->user() ?? auth('sanctum')->user();

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'User tidak ditemukan atau belum diautentikasi.',
            ], 401);
        }

        $itinerary = Itinerary::where('id', $id)
            ->where('user_id', $user->id)
            ->first();

        if (!$itinerary) {
            return response()->json([
                'status' => 'error',
                'message' => 'Rencana perjalanan tidak ditemukan.',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'nullable|string|max:150',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'departure_lat' => 'nullable|numeric',
            'departure_lng' => 'nullable|numeric',
            'departure_name' => 'nullable|string|max:150',
            'route_geojson' => 'nullable|array',
            'status' => 'nullable|string|max:30',
            'destinations' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validasi pembaruan rencana perjalanan gagal.',
                'errors' => $validator->errors(),
            ], 422);
        }

        DB::beginTransaction();
        try {
            if ($request->filled('title')) {
                $itinerary->title = $request->input('title');
            }
            if ($request->filled('start_date')) {
                $itinerary->start_date = $request->input('start_date');
            }
            if ($request->filled('end_date')) {
                $itinerary->end_date = $request->input('end_date');
            }
            if ($request->filled('status')) {
                $itinerary->status = $request->input('status');
            }

            $departureLat = $request->input('departure_lat');
            $departureLng = $request->input('departure_lng');
            if (is_numeric($departureLat) && is_numeric($departureLng)) {
                $itinerary->departure_location = DB::raw(
                    "ST_SetSRID(ST_MakePoint(" . (float) $departureLng . ", " . (float) $departureLat . "), 4326)"
                );
            }

            if ($request->has('route_geojson')) {
                $routeGeojson = $request->input('route_geojson');
                if ($routeGeojson && is_array($routeGeojson) && $request->filled('departure_name')) {
                    $routeGeojson['properties'] = array_merge(
                        $routeGeojson['properties'] ?? [],
                        ['departure_name' => $request->input('departure_name')]
                    );
                }
                $itinerary->route_geojson = $routeGeojson;
            }

            $itinerary->save();

            if ($request->has('destinations')) {
                $destinations = $request->input('destinations', []);
                ItineraryItem::where('itinerary_id', $itinerary->id)->delete();

                $order = 1;
                foreach ($destinations as $item) {
                    $destId = is_array($item) ? ($item['id'] ?? null) : $item;
                    $eta = is_array($item) ? ($item['estimated_time_arrival'] ?? null) : null;

                    if (!$destId) continue;
                    $exists = Destination::where('id', $destId)->exists();
                    if (!$exists) continue;

                    ItineraryItem::create([
                        'itinerary_id' => $itinerary->id,
                        'destination_id' => $destId,
                        'visit_order' => $order++,
                        'estimated_time_arrival' => $eta,
                    ]);
                }
            }

            DB::commit();

            $updatedItinerary = Itinerary::where('id', $itinerary->id)
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
                'message' => 'Rencana perjalanan berhasil diperbarui.',
                'data' => $updatedItinerary,
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal memperbarui rencana perjalanan: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete an itinerary.
     */
    public function destroy(Request $request, $id): JsonResponse
    {
        $user = $request->user() ?? auth('sanctum')->user();

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'User tidak ditemukan atau belum diautentikasi.',
            ], 401);
        }

        $itinerary = Itinerary::where('id', $id)
            ->where('user_id', $user->id)
            ->first();

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

    /**
     * Check upcoming itineraries and generate H-1 & Hari-H reminder notifications.
     */
    public function checkReminders(Request $request): JsonResponse
    {
        $today = now()->toDateString();
        $tomorrow = now()->addDay()->toDateString();

        $remindersCreated = 0;

        // 1. Check H-1 (Tomorrow)
        $h1Itineraries = Itinerary::where('start_date', $tomorrow)
            ->where('status', 'planned')
            ->get();

        foreach ($h1Itineraries as $itin) {
            $alreadyNotified = Notification::where('user_id', $itin->user_id)
                ->where('type', 'itinerary_reminder_h1')
                ->whereJsonContains('data->itinerary_id', $itin->id)
                ->exists();

            if (!$alreadyNotified) {
                Notification::create([
                    'user_id' => $itin->user_id,
                    'type' => 'itinerary_reminder_h1',
                    'title' => 'Pengingat H-1: ' . $itin->title,
                    'message' => 'Besok adalah hari keberangkatan rencana "' . $itin->title . '"! Pastikan persiapan perjalananmu sudah lengkap.',
                    'data' => [
                        'itinerary_id' => $itin->id,
                        'title' => $itin->title,
                        'start_date' => $itin->start_date,
                    ],
                    'read_at' => null,
                ]);
                $remindersCreated++;
            }
        }

        // 2. Check Hari-H (Today)
        $todayItineraries = Itinerary::where('start_date', $today)
            ->where('status', 'planned')
            ->get();

        foreach ($todayItineraries as $itin) {
            $alreadyNotified = Notification::where('user_id', $itin->user_id)
                ->where('type', 'itinerary_reminder_today')
                ->whereJsonContains('data->itinerary_id', $itin->id)
                ->exists();

            if (!$alreadyNotified) {
                Notification::create([
                    'user_id' => $itin->user_id,
                    'type' => 'itinerary_reminder_today',
                    'title' => 'Hari Ini Waktunya Berangkat!',
                    'message' => 'Rencana petualangan "' . $itin->title . '" dimulai hari ini! Buka panduan navigasi dan mulai perjalananmu sekarang.',
                    'data' => [
                        'itinerary_id' => $itin->id,
                        'title' => $itin->title,
                        'start_date' => $itin->start_date,
                    ],
                    'read_at' => null,
                ]);
                $remindersCreated++;
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => "Pengecekan pengingat selesai. {$remindersCreated} notifikasi baru dibuat.",
            'reminders_created' => $remindersCreated,
            'today' => $today,
            'tomorrow' => $tomorrow,
        ]);
    }
}

