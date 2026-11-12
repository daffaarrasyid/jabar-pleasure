<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Notification;
use App\Models\User;
use App\Models\Wishlist;
use App\Models\Itinerary;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    public function test_unauthenticated_user_cannot_access_profile(): void
    {
        $response = $this->getJson('/api/user/profile');
        $response->assertStatus(401);
    }

    public function test_authenticated_user_can_get_profile_with_statistics(): void
    {
        $user = User::factory()->create([
            'name' => 'Fakhrie Saukia',
            'email' => 'fakhrie.test@example.com',
            'phone' => '081234567890',
            'city' => 'Bogor, Jawa Barat',
        ]);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/user/profile');

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'data' => [
                    'id' => $user->id,
                    'name' => 'Fakhrie Saukia',
                    'email' => 'fakhrie.test@example.com',
                    'phone' => '081234567890',
                    'city' => 'Bogor, Jawa Barat',
                    'initials' => 'FS',
                ],
            ])
            ->assertJsonStructure([
                'status',
                'data' => [
                    'id',
                    'name',
                    'email',
                    'phone',
                    'city',
                    'avatar_url',
                    'initials',
                    'role',
                    'statistics' => [
                        'trips_count',
                        'wishlist_count',
                        'itinerary_count',
                    ],
                    'preferences',
                    'created_at',
                ],
            ]);

        $user->delete();
    }

    public function test_authenticated_user_can_update_profile(): void
    {
        $user = User::factory()->create([
            'name' => 'Banu Original',
            'email' => 'banu.test@example.com',
            'city' => 'Bandung, Jawa Barat',
        ]);

        Sanctum::actingAs($user);

        $response = $this->putJson('/api/user/profile', [
            'name' => 'Banu Pandara Updated',
            'phone' => '08987654321',
            'city' => 'Bogor, Jawa Barat',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'data' => [
                    'name' => 'Banu Pandara Updated',
                    'phone' => '08987654321',
                    'city' => 'Bogor, Jawa Barat',
                    'initials' => 'BU',
                ],
            ]);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Banu Pandara Updated',
            'phone' => '08987654321',
        ]);

        $user->delete();
    }

    public function test_authenticated_user_can_sync_travel_preferences(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->putJson('/api/user/preferences', [
            'interests' => ['modern-lifestyle', 'wisata-alam-terbuka'],
            'travel_style' => 'adventure',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'data' => [
                    'travel_style' => 'adventure',
                ],
            ]);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'travel_style' => 'adventure',
        ]);

        $this->assertCount(2, $user->categories()->get());

        $user->categories()->detach();
        $user->delete();
    }

    public function test_authenticated_user_can_toggle_notifications_and_unread_count_respects_it(): void
    {
        $user = User::factory()->create(['notifications_enabled' => true]);
        Sanctum::actingAs($user);

        $notification = Notification::create([
            'user_id' => $user->id,
            'type' => 'new_destination',
            'title' => 'Test Notification',
            'message' => 'Test message',
            'data' => [],
        ]);

        $this->putJson('/api/user/notifications-setting', [
            'notifications_enabled' => false,
        ])->assertStatus(200)->assertJson([
            'status' => 'success',
            'data' => ['notifications_enabled' => false],
        ]);

        $this->getJson('/api/notifications/unread-count')
            ->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'unread_count' => 0,
                'notifications_enabled' => false,
            ]);

        $this->putJson('/api/user/notifications-setting', [
            'notifications_enabled' => true,
        ])->assertStatus(200)->assertJson([
            'status' => 'success',
            'data' => ['notifications_enabled' => true],
        ]);

        $this->getJson('/api/notifications/unread-count')
            ->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'unread_count' => 1,
                'notifications_enabled' => true,
            ]);

        $notification->delete();
        $user->delete();
    }

    public function test_authenticated_user_can_toggle_location_permission(): void
    {
        $user = User::factory()->create(['location_permission_enabled' => true]);
        Sanctum::actingAs($user);

        $this->putJson('/api/user/location-permission', [
            'location_permission_enabled' => false,
        ])->assertStatus(200)->assertJson([
            'status' => 'success',
            'data' => ['location_permission_enabled' => false],
        ]);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'location_permission_enabled' => false,
        ]);

        $user->delete();
    }

    public function test_authenticated_user_can_update_password(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('oldsecret123'),
        ]);
        Sanctum::actingAs($user);

        $this->putJson('/api/user/password', [
            'current_password' => 'oldsecret123',
            'new_password' => 'newsecret123',
            'new_password_confirmation' => 'newsecret123',
        ])->assertStatus(200)->assertJson([
            'status' => 'success',
        ]);

        $user->refresh();
        $this->assertTrue(Hash::check('newsecret123', $user->password));

        $user->delete();
    }

    public function test_avatar_upload_exceeding_2mb_returns_413(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $oversizedFile = UploadedFile::fake()->create('too_big.jpg', 2500, 'image/jpeg');

        $response = $this->post('/api/user/profile', [
            'name' => 'Oversized Test',
            'avatar' => $oversizedFile,
        ], ['Accept' => 'application/json']);

        $response->assertStatus(413);

        $user->delete();
    }

    public function test_avatar_upload_compresses_to_webp_and_uploads_to_supabase(): void
    {
        config([
            'services.supabase.url' => 'https://example.supabase.co',
            'services.supabase.key' => 'test-service-key',
            'services.supabase.bucket' => 'destinations',
        ]);

        Http::fake([
            'https://example.supabase.co/storage/v1/object/destinations/avatars/*' => Http::response(['Key' => 'ok'], 200),
        ]);

        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $imageFile = UploadedFile::fake()->image('avatar.png', 800, 600);

        $response = $this->post('/api/user/profile', [
            'name' => 'Avatar WebP Test',
            'avatar' => $imageFile,
        ], ['Accept' => 'application/json']);

        $response->assertStatus(200);
        $avatarUrl = $response->json('data.avatar_url');
        $this->assertNotEmpty($avatarUrl);
        $this->assertStringEndsWith('.webp', $avatarUrl);
        $this->assertStringContainsString('/storage/v1/object/public/destinations/avatars/', $avatarUrl);

        Http::assertSent(function ($request) {
            return $request->hasHeader('Content-Type', 'image/webp');
        });

        $user->delete();
    }

    public function test_help_center_returns_registered_support_contacts(): void
    {
        $response = $this->getJson('/api/help-center');

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'data' => [
                    'support' => [
                        'whatsapp' => '6285889662159',
                        'email' => 'bantuan@jabarpleasure.id',
                    ],
                ],
            ]);
    }
}

