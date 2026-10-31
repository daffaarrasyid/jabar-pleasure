<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Destination;
use App\Models\RegencyCity;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class DestinationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $csvPath = database_path('seeders/data/destinations_jabarpleasure.csv');

        if (!file_exists($csvPath)) {
            $this->command?->error("CSV file not found at: {$csvPath}");
            return;
        }

        $categories = Category::all()->keyBy(function ($item) {
            return strtolower(trim($item->name));
        });

        // Also index by slug
        $categoriesBySlug = Category::all()->keyBy('slug');

        $regencies = RegencyCity::all()->keyBy(function ($item) {
            return strtolower(trim($item->name));
        });

        if (($handle = fopen($csvPath, 'r')) === false) {
            $this->command?->error("Unable to open CSV file.");
            return;
        }

        // Read headers
        $rawHeaders = fgetcsv($handle, 4096, ',');
        if (!$rawHeaders) {
            fclose($handle);
            return;
        }

        // Strip UTF-8 BOM if present
        $rawHeaders[0] = preg_replace('/[\x00-\x1F\x80-\xFF]/', '', $rawHeaders[0]);
        $headers = array_map('trim', $rawHeaders);
        $headerMap = array_flip($headers);

        $now = now();
        $batch = [];
        $batchSize = 100;
        $totalProcessed = 0;
        $usedSlugs = [];

        // Disable query log for performance during bulk seed
        DB::disableQueryLog();

        while (($row = fgetcsv($handle, 4096, ',')) !== false) {
            if (empty(array_filter($row))) {
                continue;
            }

            $get = function ($key) use ($row, $headerMap) {
                if (!isset($headerMap[$key])) {
                    return null;
                }
                $val = trim($row[$headerMap[$key]] ?? '');
                return $val !== '' ? $val : null;
            };

            $osmId = $get('osm_id');
            $osmType = $get('osm_type');
            $name = $get('nama_destinasi') ?? 'Destinasi Wisata';
            $klaster = strtolower(trim($get('klaster_jabarpleasure') ?? ''));
            $kategoriOsm = $get('kategori_osm');
            $subKategoriOsm = $get('sub_kategori_osm');
            $tagTambahan = $get('tag_tambahan');
            $lat = (float) $get('latitude');
            $lon = (float) $get('longitude');
            $cityName = $get('kota_kabupaten_osm') ?? 'Jawa Barat';
            $address = $get('alamat');
            $postalCode = $get('kode_pos');
            $ele = $get('ele') ? (float) $get('ele') : null;
            $hours = $get('jam_operasional');
            $fee = $get('biaya_fee');
            $wheelchair = $get('wheelchair');
            $website = $get('website');
            $phone = $get('telepon');
            $wikidata = $get('wikidata');
            $operator = $get('operator');
            $description = $get('deskripsi');

            // Find or create category
            $category = $categories->get($klaster) ?? $categoriesBySlug->get(Str::slug($klaster));
            if (!$category) {
                $category = Category::firstOrCreate(
                    ['slug' => Str::slug($get('klaster_jabarpleasure') ?: 'lainnya')],
                    ['name' => $get('klaster_jabarpleasure') ?: 'Lainnya']
                );
                $categories->put(strtolower($category->name), $category);
                $categoriesBySlug->put($category->slug, $category);
            }

            // Find or create regency
            $cityKey = strtolower($cityName);
            $regency = $regencies->get($cityKey);
            if (!$regency) {
                $regency = RegencyCity::firstOrCreate(
                    ['name' => $cityName],
                    ['alt_name' => Str::slug($cityName), 'geom' => null]
                );
                $regencies->put($cityKey, $regency);
            }

            // Create unique slug
            $baseSlug = Str::slug($name . ' ' . $cityName);
            if (empty($baseSlug)) {
                $baseSlug = 'destinasi-' . Str::random(6);
            }

            $slug = $baseSlug;
            $counter = 1;
            while (isset($usedSlugs[$slug])) {
                $slug = "{$baseSlug}-" . ($counter++);
            }
            $usedSlugs[$slug] = true;

            // Facilities JSON
            $facilities = [];
            if ($tagTambahan) {
                $facilities = array_map('trim', explode(';', $tagTambahan));
            }

            $batch[] = [
                'regency_id' => $regency->id,
                'category_id' => $category->id,
                'osm_id' => $osmId,
                'osm_type' => $osmType,
                'kategori_osm' => $kategoriOsm,
                'sub_kategori_osm' => $subKategoriOsm,
                'tag_tambahan' => $tagTambahan,
                'name' => mb_substr($name, 0, 200),
                'slug' => mb_substr($slug, 0, 255),
                'description' => $description,
                'address' => $address,
                'postal_code' => $postalCode ? mb_substr($postalCode, 0, 20) : null,
                'elevation' => $ele,
                'price_range' => $fee ? mb_substr($fee, 0, 50) : null,
                'opening_hours' => $hours ? mb_substr($hours, 0, 100) : null,
                'website' => $website ? mb_substr($website, 0, 500) : null,
                'phone' => $phone ? mb_substr($phone, 0, 100) : null,
                'wheelchair' => $wheelchair ? mb_substr($wheelchair, 0, 50) : null,
                'wikidata_id' => $wikidata ? mb_substr($wikidata, 0, 50) : null,
                'operator_name' => $operator ? mb_substr($operator, 0, 255) : null,
                'facilities' => json_encode($facilities),
                'cover_image' => null,
                'location' => DB::raw("ST_SetSRID(ST_MakePoint({$lon}, {$lat}), 4326)"),
                'created_at' => $now,
                'updated_at' => $now,
            ];

            if (count($batch) >= $batchSize) {
                DB::table('destinations')->insert($batch);
                $totalProcessed += count($batch);
                $batch = [];
            }
        }

        if (!empty($batch)) {
            DB::table('destinations')->insert($batch);
            $totalProcessed += count($batch);
        }

        fclose($handle);

        $this->command?->info("Successfully seeded {$totalProcessed} destinations from CSV!");
    }
}

