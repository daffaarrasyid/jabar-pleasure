<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthRegisterTest extends TestCase
{
    public function test_user_can_register_successfully_into_database(): void
    {
        $payload = [
            'name' => 'Banu Tester',
            'email' => 'banu.test@example.com',
            'password' => 'secret12345',
        ];

        // Clean up beforehand if exists
        User::where('email', $payload['email'])->delete();

        $response = $this->postJson('/api/register', $payload);

        $response->assertStatus(201)
            ->assertJson([
                'status' => 'success',
                'message' => 'Pendaftaran akun berhasil.',
            ])
            ->assertJsonStructure([
                'data' => [
                    'user' => ['id', 'name', 'email', 'role', 'created_at'],
                    'token',
                ],
            ]);

        // Check user saved into database
        $this->assertDatabaseHas('users', [
            'name' => 'Banu Tester',
            'email' => 'banu.test@example.com',
            'role' => 'user',
        ]);

        // Clean up
        User::where('email', $payload['email'])->delete();
    }

    public function test_registration_validation_fails_on_duplicate_email(): void
    {
        $user = User::factory()->create([
            'email' => 'duplicate@example.com',
        ]);

        $response = $this->postJson('/api/register', [
            'name' => 'Another User',
            'email' => 'duplicate@example.com',
            'password' => 'secret12345',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);

        $user->delete();
    }

    public function test_user_can_save_preferences_after_registration(): void
    {
        $user = User::factory()->create([
            'email' => 'preference.user@example.com',
        ]);

        $response = $this->actingAs($user)
            ->postJson('/api/user/preferences', [
                'interests' => ['modern-lifestyle', 'wisata-alam-terbuka'],
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success',
            ]);

        $this->assertDatabaseHas('user_preferences', [
            'user_id' => $user->id,
        ]);

        $user->delete();
    }
}

