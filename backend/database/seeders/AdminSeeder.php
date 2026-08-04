<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        // Only used when creating a NEW admin. Never overwrite an existing password on reseed.
        $defaultPassword = (string) env('ADMIN_SEED_PASSWORD', '123456');

        $this->seedAdmin(
            email: 'superadmin@fi2t.tn',
            first: 'Super',
            last: 'Admin',
            role: 'super-admin',
            password: $defaultPassword,
        );

        $this->seedAdmin(
            email: 'admin@fi2t.tn',
            first: 'FI2T',
            last: 'Admin',
            role: 'admin',
            password: $defaultPassword,
        );
    }

    private function seedAdmin(string $email, string $first, string $last, string $role, string $password): void
    {
        $user = User::query()->where('email', $email)->first();

        if (! $user) {
            $user = User::query()->create([
                'email'      => $email,
                'first_name' => $first,
                'last_name'  => $last,
                'password'   => $password,
                'is_active'  => true,
            ]);
        } else {
            $user->fill([
                'first_name' => $first,
                'last_name'  => $last,
                'is_active'  => true,
            ])->save();
        }

        $user->syncRoles([$role]);
    }
}
