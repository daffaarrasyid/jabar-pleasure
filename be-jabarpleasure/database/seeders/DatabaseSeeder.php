<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            CategorySeeder::class,
            RegencyCitySeeder::class,
            DestinationSeeder::class,
        ]);

        // Seed or update sample user Nabila Putri
        $nabila = User::firstOrCreate(
            ['email' => 'nabila.putri@gmail.com'],
            [
                'name' => 'Nabila Putri',
                'password' => Hash::make('password123'),
                'phone' => '081234567890',
                'city' => 'Bogor, Jawa Barat',
                'role' => 'user',
                'is_blocked' => false,
            ]
        );

        $nabila->update([
            'phone' => '081234567890',
            'city' => 'Bogor, Jawa Barat',
        ]);

        // Ensure existing users have city and phone
        User::whereNull('city')->update(['city' => 'Bogor, Jawa Barat']);
        User::whereNull('phone')->update(['phone' => '081234567890']);
    }
}
