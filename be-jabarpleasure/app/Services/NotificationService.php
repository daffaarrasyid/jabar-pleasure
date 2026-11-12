<?php

namespace App\Services;

use App\Models\Destination;
use App\Models\Notification;
use App\Models\PoiSubmission;
use App\Models\User;

class NotificationService
{
    /**
     * Send confirmation notification to submitter when their destination submission is approved or rejected.
     */
    public function sendSubmissionConfirmation(PoiSubmission $submission, string $status, ?string $adminNote = null): ?Notification
    {
        $recipient = User::find($submission->user_id);
        if ($recipient && $recipient->notifications_enabled === false) {
            return null;
        }

        $isApproved = strtolower($status) === 'approved';

        $title = $isApproved
            ? 'Pengajuan Destinasi Disetujui! 🎉'
            : 'Pengajuan Destinasi Belum Disetujui';

        $message = $isApproved
            ? "Selamat! Destinasi '{$submission->name}' yang Anda ajukan telah disetujui kurator dan resmi dipublikasikan di peta JabarPleasure."
            : "Mohon maaf, pengajuan destinasi '{$submission->name}' belum dapat disetujui." . ($adminNote ? " Catatan kurator: {$adminNote}" : '');

        return Notification::create([
            'user_id' => $submission->user_id,
            'type' => $isApproved ? 'submission_approved' : 'submission_rejected',
            'title' => $title,
            'message' => $message,
            'data' => [
                'submission_id' => $submission->id,
                'destination_name' => $submission->name,
                'status' => $status,
                'admin_note' => $adminNote,
            ],
        ]);
    }

    /**
     * Broadcast notification to all registered users when a new destination is added or approved.
     */
    public function broadcastNewDestination(Destination $destination): int
    {
        $destination->loadMissing(['regency', 'category']);
        $cityName = $destination->regency?->name;

        $title = 'Destinasi Baru Menanti di Jabar! 🌟';
        $message = "Destinasi baru '{$destination->name}'"
            . ($cityName ? " di {$cityName}" : '')
            . " kini telah hadir. Yuk jelajahi dan masukkan ke rencana liburanmu!";

        $payload = json_encode([
            'destination_id' => $destination->id,
            'slug' => $destination->slug,
            'name' => $destination->name,
            'category' => $destination->category?->name,
            'regency' => $cityName,
            'cover_image' => $destination->cover_image_url ?? $destination->cover_image,
        ]);

        $userIds = User::where('notifications_enabled', true)->pluck('id');
        if ($userIds->isEmpty()) {
            return 0;
        }

        $now = now();
        $batch = [];

        foreach ($userIds as $userId) {
            $batch[] = [
                'user_id' => $userId,
                'type' => 'new_destination',
                'title' => $title,
                'message' => $message,
                'data' => $payload,
                'read_at' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        foreach (array_chunk($batch, 200) as $chunk) {
            Notification::insert($chunk);
        }

        return count($batch);
    }
}

