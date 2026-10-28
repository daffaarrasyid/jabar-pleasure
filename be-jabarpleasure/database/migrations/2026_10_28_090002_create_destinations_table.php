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
        Schema::create('destinations', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('regency_id');
            $table->foreign('regency_id')->references('id')->on('regencies_cities')->restrictOnDelete();
            $table->unsignedInteger('category_id');
            $table->foreign('category_id')->references('id')->on('categories')->restrictOnDelete();
            $table->bigInteger('osm_id')->nullable();
            $table->string('name', 200);
            $table->string('slug', 255)->unique();
            $table->text('description')->nullable();
            $table->text('address')->nullable();
            $table->string('price_range', 50)->nullable();
            $table->string('opening_hours', 100)->nullable();
            $table->jsonb('facilities')->nullable();
            $table->string('cover_image', 255)->nullable();
            $table->geometry('location', subtype: 'Point', srid: 4326);
            $table->timestamps();

            $table->spatialIndex('location', 'destinations_location_gist');
            $table->index(['category_id', 'regency_id'], 'destinations_cat_reg_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('destinations');
    }
};

