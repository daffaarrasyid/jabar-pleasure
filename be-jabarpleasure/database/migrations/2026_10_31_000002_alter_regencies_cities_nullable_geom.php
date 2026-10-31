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
        // In PostgreSQL with PostGIS, drop NOT NULL constraint on geom
        DB::statement('ALTER TABLE regencies_cities ALTER COLUMN geom DROP NOT NULL;');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('ALTER TABLE regencies_cities ALTER COLUMN geom SET NOT NULL;');
    }
};

