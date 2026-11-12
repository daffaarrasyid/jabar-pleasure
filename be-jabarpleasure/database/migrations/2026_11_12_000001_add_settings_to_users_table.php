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
        Schema::table('users', function (Blueprint $table) {
            $table->string('travel_style', 50)->nullable()->default('healing')->after('avatar_url');
            $table->boolean('notifications_enabled')->default(true)->after('travel_style');
            $table->boolean('location_permission_enabled')->default(true)->after('notifications_enabled');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['travel_style', 'notifications_enabled', 'location_permission_enabled']);
        });
    }
};

