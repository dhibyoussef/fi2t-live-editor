<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('event_reservations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('clients')->cascadeOnDelete();
            $table->foreignId('meeting_room_id')->constrained('meeting_rooms')->cascadeOnDelete();
            $table->string('event_name');
            $table->enum('event_type', ['CONFERENCE', 'WEDDING', 'BIRTHDAY', 'CORPORATE', 'GALA', 'OTHER']);
            $table->date('event_date');
            $table->time('start_time');
            $table->time('end_time');
            $table->integer('guests_count');
            $table->decimal('total_price', 10, 3);
            $table->enum('status', ['PENDING', 'CONFIRMED', 'CANCELLED'])->default('PENDING');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_reservations');
    }
};
