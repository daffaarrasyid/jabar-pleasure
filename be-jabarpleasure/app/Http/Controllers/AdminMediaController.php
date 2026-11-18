<?php

namespace App\Http\Controllers;

use App\Models\JournalMedia;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminMediaController extends Controller
{
    /**
     * List user journal media for moderation (PRD F-14: Moderasi Media).
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = min((int) $request->input('per_page', 24), 60);
        $type = $request->input('type'); // 'photo' or 'video'

        $query = JournalMedia::with([
            'checkIn.user:id,name,email',
            'checkIn.destination:id,name,slug',
        ]);

        if ($type && in_array($type, ['photo', 'video'])) {
            $query->where('media_type', $type);
        }

        $mediaList = $query->orderBy('created_at', 'desc')->paginate($perPage);

        // Append computed public URL
        $items = collect($mediaList->items())->map(function ($item) {
            $itemArray = $item->toArray();
            $itemArray['url'] = $item->url;
            return $itemArray;
        });

        return response()->json([
            'status' => 'success',
            'data' => $items,
            'pagination' => [
                'current_page' => $mediaList->currentPage(),
                'last_page' => $mediaList->lastPage(),
                'per_page' => $mediaList->perPage(),
                'total' => $mediaList->total(),
            ],
        ]);
    }

    /**
     * Delete an illegal or policy-violating media file (PRD F-14).
     */
    public function destroy(int|string $id): JsonResponse
    {
        $media = JournalMedia::find($id);
        if (!$media) {
            return response()->json([
                'status' => 'error',
                'message' => 'File media jurnal tidak ditemukan.',
            ], 404);
        }

        $media->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Media jurnal berhasil dihapus dari sistem.',
        ]);
    }
}

