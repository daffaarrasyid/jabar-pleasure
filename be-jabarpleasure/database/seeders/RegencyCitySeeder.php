<?php

namespace Database\Seeders;

use App\Models\RegencyCity;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class RegencyCitySeeder extends Seeder
{
    /**
     * 27 Standard Regencies & Cities of West Java
     */
    protected array $allWestJavaRegencies = [
        'Kabupaten Bandung',
        'Kabupaten Bandung Barat',
        'Kabupaten Bekasi',
        'Kabupaten Bogor',
        'Kabupaten Ciamis',
        'Kabupaten Cianjur',
        'Kabupaten Cirebon',
        'Kabupaten Garut',
        'Kabupaten Indramayu',
        'Kabupaten Karawang',
        'Kabupaten Kuningan',
        'Kabupaten Majalengka',
        'Kabupaten Pangandaran',
        'Kabupaten Purwakarta',
        'Kabupaten Subang',
        'Kabupaten Sukabumi',
        'Kabupaten Sumedang',
        'Kabupaten Tasikmalaya',
        'Kota Bandung',
        'Kota Banjar',
        'Kota Bekasi',
        'Kota Bogor',
        'Kota Cimahi',
        'Kota Cirebon',
        'Kota Depok',
        'Kota Sukabumi',
        'Kota Tasikmalaya',
    ];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $regencies = collect($this->allWestJavaRegencies);

        // Also check if CSV has any additional variation
        $csvPath = database_path('seeders/data/destinations_jabarpleasure.csv');
        if (file_exists($csvPath) && ($handle = fopen($csvPath, 'r')) !== false) {
            $headers = fgetcsv($handle, 4096, ',');
            $cityIndex = array_search('kota_kabupaten_osm', $headers);

            if ($cityIndex !== false) {
                while (($data = fgetcsv($handle, 4096, ',')) !== false) {
                    $cityName = trim($data[$cityIndex] ?? '');
                    if (!empty($cityName)) {
                        $regencies->push($cityName);
                    }
                }
            }
            fclose($handle);
        }

        $uniqueRegencies = $regencies->unique()->filter()->values();

        foreach ($uniqueRegencies as $name) {
            RegencyCity::firstOrCreate(
                ['name' => $name],
                [
                    'alt_name' => Str::slug($name),
                    'geom' => null,
                ]
            );
        }

        $this->command?->info("Seeded {$uniqueRegencies->count()} regencies & cities.");
    }
}

