<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthLoginTest extends TestCase
{
    public function test_user_can_login_with_correct_credentials(): void
    {
        $user = User::factory()->create([
            'email' => 'login.test@example.com',
            'password' => Hash::make('password123'),
            'is_blocked' => false,
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'login.test@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'message' => 'Berhasil masuk.',
            ])
            ->assertJsonStructure([
                'data' => [
                    'user' => ['id', 'name', 'email', 'role'],
                    'token',
                ],
            ]);

        $user->delete();
    }

    public function test_login_fails_with_invalid_password(): void
    {
        $user = User::factory()->create([
            'email' => 'wrongpass@example.com',
            'password' => Hash::make('password123'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'wrongpass@example.com',
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(401)
            ->assertJson([
                'status' => 'error',
                'message' => 'Email atau kata sandi yang Anda masukkan salah.',
            ]);

        $user->delete();
    }

    public function test_login_fails_for_blocked_user(): void
    {
        $user = User::factory()->create([
            'email' => 'blocked@example.com',
            'password' => Hash::make('password123'),
            'is_blocked' => true,
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'blocked@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(403)
            ->assertJson([
                'status' => 'error',
                'message' => 'Akun Anda sedang ditangguhkan/diblokir oleh sistem.',
            ]);

        $user->delete();
    }
}

