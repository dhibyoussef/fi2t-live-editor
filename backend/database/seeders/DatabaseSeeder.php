<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RolesAndPermissionsSeeder::class,
            AdminSeeder::class,

            // FI2T website CMS (modifiable live content)
            CmsPageSeeder::class,
            TranslationSeeder::class,
            ContentBlockSeeder::class,
            FillAllContentLocalesSeeder::class,
            SiteNavSeeder::class,
        ]);
    }
}
