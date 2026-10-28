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
        Schema::create('check_ins', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('destination_id')->constrained('destinations')->cascadeOnDelete();
            $table->foreignId('itinerary_id')->nullable()->constrained('itineraries')->nullOnDelete();
            $table->geometry('check_in_coord', subtype: 'Point', srid: 4326);
            $table->decimal('distance_deviation', 8, 2);
            $table->timestamp('checked_in_at');
            $table->boolean('is_synced_from_offline')->default(false);
            $table->timestamp('created_at')->nullable();

            $table->spatialIndex('check_in_coord', 'check_ins_coord_gist');
            $table->index('destination_id', 'check_ins_destination_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('check_ins');
    }
};

