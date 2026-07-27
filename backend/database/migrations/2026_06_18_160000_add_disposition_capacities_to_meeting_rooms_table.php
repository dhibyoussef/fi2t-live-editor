<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('meeting_rooms', function (Blueprint $table) {
            $table->integer('capacity_en_u')->nullable()->after('capacity_boardroom');
            $table->integer('capacity_conference')->nullable()->after('capacity_en_u');
            $table->integer('capacity_cabaret')->nullable()->after('capacity_conference');
        });

        $rooms = DB::table('meeting_rooms')
            ->whereNotNull('capacity_boardroom')
            ->get(['id', 'capacity_boardroom']);

        foreach ($rooms as $room) {
            DB::table('meeting_rooms')->where('id', $room->id)->update([
                'capacity_en_u'       => $room->capacity_boardroom,
                'capacity_conference' => $room->capacity_boardroom,
            ]);
        }
    }

    public function down(): void
    {
        Schema::table('meeting_rooms', function (Blueprint $table) {
            $table->dropColumn(['capacity_en_u', 'capacity_conference', 'capacity_cabaret']);
        });
    }
};
