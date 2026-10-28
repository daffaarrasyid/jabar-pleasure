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
        Schema::create('journal_media', function (Blueprint $table) {
            $table->id();
            $table->foreignId('check_in_id')->constrained('check_ins')->cascadeOnDelete();
            $table->string('file_path', 255);
            $table->string('media_type', 10);
            $table->integer('file_size_kb');
            $table->text('caption')->nullable();
            $table->timestamp('created_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('journal_media');
    }
};

