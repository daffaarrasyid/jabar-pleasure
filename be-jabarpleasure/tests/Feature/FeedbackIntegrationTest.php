<?php

namespace Tests\Feature;

use App\Models\Feedback;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class FeedbackIntegrationTest extends TestCase
{
    use DatabaseTransactions;

    /**
     * Test user submitting feedback, admin replying with notification dispatch, and hard delete.
     */
    public function test_feedback_full_lifecycle(): void
    {
        // 1. Create submitter user and admin user
        $user = User::factory()->create([
            'role' => 'user',
            'notifications_enabled' => true,
        ]);

        $admin = User::factory()->create([
            'role' => 'admin',
        ]);

        // 2. Submit feedback as user
        $response = $this->actingAs($user)->postJson('/api/feedbacks', [
            'category' => 'feature',
            'subject' => 'Usulan Jalur Sepeda Lembang',
            'message' => 'Mohon tambahkan filter rute gowes di Lembang.',
            'rating' => 5,
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'status' => 'success',
                'data' => [
                    'category' => 'feature',
                    'subject' => 'Usulan Jalur Sepeda Lembang',
                    'status' => 'unread',
                ],
            ]);

        $feedbackId = $response->json('data.id');
        $this->assertDatabaseHas('feedbacks', [
            'id' => $feedbackId,
            'user_id' => $user->id,
            'status' => 'unread',
        ]);

        // 3. Admin fetches feedbacks list
        $listResponse = $this->actingAs($admin)->getJson('/api/admin/feedbacks');
        $listResponse->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'data',
                'pagination',
            ]);

        // 4. Admin replies to the feedback
        $replyResponse = $this->actingAs($admin)->postJson("/api/admin/feedbacks/{$feedbackId}/reply", [
            'admin_reply' => 'Terima kasih atas masukannya! Fitur rute gowes sedang dikaji tim GIS.',
            'status' => 'resolved',
        ]);

        $replyResponse->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'data' => [
                    'id' => $feedbackId,
                    'status' => 'resolved',
                    'admin_reply' => 'Terima kasih atas masukannya! Fitur rute gowes sedang dikaji tim GIS.',
                ],
            ]);

        // 5. Verify notification was created for submitter
        $this->assertDatabaseHas('notifications', [
            'user_id' => $user->id,
            'type' => 'feedback_reply',
        ]);

        $notification = Notification::where('user_id', $user->id)
            ->where('type', 'feedback_reply')
            ->first();
        $this->assertNotNull($notification);
        $this->assertStringContainsString('Tanggapan atas Saran', $notification->title);

        // 6. Admin deletes the feedback (hard delete)
        $deleteResponse = $this->actingAs($admin)->deleteJson("/api/admin/feedbacks/{$feedbackId}");
        $deleteResponse->assertStatus(200)
            ->assertJson([
                'status' => 'success',
            ]);

        // Verify hard delete
        $this->assertDatabaseMissing('feedbacks', [
            'id' => $feedbackId,
        ]);
    }
}
