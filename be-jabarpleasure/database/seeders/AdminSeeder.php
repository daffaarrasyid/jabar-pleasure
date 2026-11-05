<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin123@jabarpleasure.id'],
            [
                'name' => 'admin123',
                'password' => Hash::make('adminganteng'),
                'phone' => '081299998888',
                'city' => 'Bandung, Jawa Barat',
                'role' => 'admin',
                'is_blocked' => false,
            ]
        );

        $this->command->info('Admin account seeded: username=admin123 (email: admin123@jabarpleasure.id), password=adminganteng');
    }
}

