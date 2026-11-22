<?php

namespace App\Http\Controllers;

use App\Models\Feedback;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class FeedbackController extends Controller
{
    /**
     * Submit a new feedback / bug report / suggestion (User must be authenticated).
     */
    public function store(Request $request): JsonResponse
    {
        $userId = auth()->id();
        if (!$userId) {
            return response()->json([
                'status' => 'error',
                'message' => 'Pengguna wajib login untuk mengirimkan saran dan masukan.',
            ], 401);
        }

        $validator = Validator::make($request->all(), [
            'category' => 'required|string|in:bug,feature,question,other',
            'subject' => 'required|string|max:150',
            'message' => 'required|string|max:5000',
            'rating' => 'nullable|integer|min:1|max:5',
            'attachment' => 'nullable|file|mimes:jpeg,png,jpg,webp|max:2048',
        ], [
            'category.in' => 'Kategori harus berupa: bug, feature, question, atau other.',
            'subject.required' => 'Judul masukan wajib diisi.',
            'message.required' => 'Isi pesan masukan wajib diisi.',
            'attachment.max' => 'Ukuran file lampiran maksimal 2MB.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validasi gagal.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $attachmentPath = null;
        if ($request->hasFile('attachment')) {
            $attachmentPath = $request->file('attachment')->store('feedbacks', 'public');
        }

        $feedback = Feedback::create([
            'user_id' => $userId,
            'category' => $request->input('category'),
            'subject' => $request->input('subject'),
            'message' => $request->input('message'),
            'rating' => $request->input('rating'),
            'attachment_path' => $attachmentPath,
            'status' => 'unread',
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Saran dan masukan Anda berhasil dikirim. Terima kasih atas kontribusi Anda!',
            'data' => [
                'id' => $feedback->id,
                'category' => $feedback->category,
                'subject' => $feedback->subject,
                'message' => $feedback->message,
                'status' => $feedback->status,
                'created_at' => $feedback->created_at->toISOString(),
            ],
        ], 201);
    }

    /**
     * Get list of feedbacks submitted by current authenticated user.
     */
    public function myFeedbacks(Request $request): JsonResponse
    {
        $userId = auth()->id();
        if (!$userId) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthenticated',
            ], 401);
        }

        $feedbacks = Feedback::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json([
            'status' => 'success',
            'data' => $feedbacks->items(),
            'pagination' => [
                'current_page' => $feedbacks->currentPage(),
                'last_page' => $feedbacks->lastPage(),
                'per_page' => $feedbacks->perPage(),
                'total' => $feedbacks->total(),
            ],
        ]);
    }
}
