<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('room_categories', function (Blueprint $table) {
            $table->unsignedSmallInteger('room_count')->default(0)->after('is_active');
            $table->unsignedSmallInteger('suite_count')->default(0)->after('room_count');
        });
    }

    public function down(): void
    {
        Schema::table('room_categories', function (Blueprint $table) {
            $table->dropColumn(['room_count', 'suite_count']);
        });
    }
};
