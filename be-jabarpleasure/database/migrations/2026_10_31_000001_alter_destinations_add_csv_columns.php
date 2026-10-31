<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Change osm_id to VARCHAR(50) to support 'node/xxx', 'way/xxx', 'relation/xxx'
        DB::statement('ALTER TABLE destinations ALTER COLUMN osm_id TYPE VARCHAR(50) USING osm_id::varchar;');

        Schema::table('destinations', function (Blueprint $table) {
            $table->string('osm_type', 20)->nullable()->after('osm_id');
            $table->string('kategori_osm', 100)->nullable()->after('category_id');
            $table->string('sub_kategori_osm', 100)->nullable()->after('kategori_osm');
            $table->text('tag_tambahan')->nullable()->after('sub_kategori_osm');
            $table->decimal('elevation', 8, 2)->nullable()->after('address');
            $table->string('postal_code', 20)->nullable()->after('address');
            $table->string('website', 500)->nullable()->after('opening_hours');
            $table->string('phone', 100)->nullable()->after('website');
            $table->string('wheelchair', 50)->nullable()->after('phone');
            $table->string('wikidata_id', 50)->nullable()->after('wheelchair');
            $table->string('operator_name', 255)->nullable()->after('wikidata_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('destinations', function (Blueprint $table) {
            $table->dropColumn([
                'osm_type',
                'kategori_osm',
                'sub_kategori_osm',
                'tag_tambahan',
                'elevation',
                'postal_code',
                'website',
                'phone',
                'wheelchair',
                'wikidata_id',
                'operator_name',
            ]);
        });
    }
};

