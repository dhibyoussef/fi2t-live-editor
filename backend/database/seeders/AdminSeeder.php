<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        $superAdmin = User::updateOrCreate(
            ['email' => 'superadmin@fi2t.tn'],
            [
                'first_name' => 'Super',
                'last_name'  => 'Admin',
                'password'   => '123456',
                'is_active'  => true,
            ]
        );
        $superAdmin->syncRoles(['super-admin']);

        $admin = User::updateOrCreate(
            ['email' => 'admin@fi2t.tn'],
            [
                'first_name' => 'FI2T',
                'last_name'  => 'Admin',
                'password'   => '123456',
                'is_active'  => true,
            ]
        );
        $admin->syncRoles(['admin']);
    }
}
