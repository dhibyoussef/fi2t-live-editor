<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('meeting_room_availability', function (Blueprint $table) {
            $table->id();
            $table->foreignId('meeting_room_id')->constrained('meeting_rooms')->cascadeOnDelete();
            $table->date('date');
            $table->time('slot_start');
            $table->time('slot_end');
            $table->boolean('is_available')->default(true);
            $table->foreignId('event_reservation_id')->nullable()->constrained('event_reservations')->nullOnDelete();
            $table->timestamps();

            $table->index(['meeting_room_id', 'date', 'slot_start']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('meeting_room_availability');
    }
};
