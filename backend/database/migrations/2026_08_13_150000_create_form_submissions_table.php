<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('form_submissions', function (Blueprint $table) {
            $table->id();
            $table->string('type', 32); // contact | newsletter | adhesion
            $table->string('status', 20)->default('new'); // new | read | archived
            $table->string('name')->nullable();
            $table->string('email');
            $table->string('subject')->nullable();
            $table->json('payload')->nullable();
            $table->string('ip', 45)->nullable();
            $table->string('user_agent', 255)->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamp('mailed_at')->nullable();
            $table->string('mail_error', 500)->nullable();
            $table->timestamps();

            $table->index(['type', 'status']);
            $table->index('created_at');
            $table->index('email');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('form_submissions');
    }
};
