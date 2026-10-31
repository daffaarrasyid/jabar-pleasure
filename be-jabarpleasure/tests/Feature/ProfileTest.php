<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\User;
use App\Models\Wishlist;
use App\Models\Itinerary;
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
}

