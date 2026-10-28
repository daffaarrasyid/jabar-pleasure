<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('regencies_cities', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name', 100);
            $table->string('alt_name', 100)->nullable();
            $table->geometry('geom', subtype: 'MultiPolygon', srid: 4326);
            $table->timestamps();

            $table->spatialIndex('geom', 'regencies_cities_geom_gist');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('regencies_cities');
    }
};

