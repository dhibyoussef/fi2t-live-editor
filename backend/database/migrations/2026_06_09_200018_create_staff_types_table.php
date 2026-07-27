<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('staff_types', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('department', ['KITCHEN', 'FRONT_DESK', 'HOUSEKEEPING', 'SPA', 'EVENTS', 'BAR', 'MANAGEMENT', 'SECURITY', 'MAINTENANCE']);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('staff_types');
    }
};
