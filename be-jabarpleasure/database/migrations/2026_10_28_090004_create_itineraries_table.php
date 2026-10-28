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
        Schema::create('itineraries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('title', 150);
            $table->date('start_date');
            $table->date('end_date');
            $table->geometry('departure_location', subtype: 'Point', srid: 4326)->nullable();
            $table->jsonb('route_geojson')->nullable();
            $table->string('status', 30)->default('planned');
            $table->timestamps();

            $table->spatialIndex('departure_location', 'itineraries_departure_location_gist');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('itineraries');
    }
};

