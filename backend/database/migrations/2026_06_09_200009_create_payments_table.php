<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reservation_id')->constrained('reservations')->cascadeOnDelete();
            $table->decimal('amount', 10, 3);
            $table->enum('method', ['CARD', 'CASH', 'TRANSFER', 'ONLINE']);
            $table->string('card_last4', 4)->nullable();
            $table->string('card_holder')->nullable();
            $table->string('card_expiry', 5)->nullable();
            $table->enum('status', ['PENDING', 'PAID', 'REFUNDED', 'FAILED'])->default('PENDING');
            $table->string('transaction_id')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
