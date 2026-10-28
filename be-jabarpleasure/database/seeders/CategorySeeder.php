<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Modern & Lifestyle',
                'slug' => 'modern-lifestyle',
                'icon_url' => null,
            ],
            [
                'name' => 'Wisata Alam & Terbuka',
                'slug' => 'wisata-alam-terbuka',
                'icon_url' => null,
            ],
            [
                'name' => 'Publik & Edukasi',
                'slug' => 'publik-edukasi',
                'icon_url' => null,
            ],
            [
                'name' => 'Rekreasi Keluarga',
                'slug' => 'rekreasi-keluarga',
                'icon_url' => null,
            ],
        ];

        foreach ($categories as $category) {
            Category::updateOrCreate(
                ['slug' => $category['slug']],
                $category
            );
        }
    }
}

