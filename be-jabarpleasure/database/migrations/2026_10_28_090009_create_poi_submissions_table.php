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
        Schema::create('poi_submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedInteger('category_id');
            $table->foreign('category_id')->references('id')->on('categories')->restrictOnDelete();
            $table->unsignedInteger('regency_id')->nullable();
            $table->foreign('regency_id')->references('id')->on('regencies_cities')->nullOnDelete();
            $table->string('name', 200);
            $table->text('description');
            $table->string('price_range', 50)->nullable();
            $table->string('opening_hours', 100)->nullable();
            $table->geometry('proposed_location', subtype: 'Point', srid: 4326);
            $table->string('evidence_image', 255)->nullable();
            $table->string('status', 20)->default('pending');
            $table->text('admin_note')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();

            $table->spatialIndex('proposed_location', 'poi_submissions_location_gist');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('poi_submissions');
    }
};

