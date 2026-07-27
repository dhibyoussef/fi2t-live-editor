<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('room_amenities', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('icon')->nullable();
            $table->enum('category', ['BATHROOM', 'BED', 'TECH', 'CLIMATE', 'VIEW', 'KITCHEN', 'ACCESSIBILITY']);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('room_amenities');
    }
};
