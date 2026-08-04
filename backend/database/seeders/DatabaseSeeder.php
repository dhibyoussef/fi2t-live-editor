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
            CustomGroupementPageSeeder::class,
            // Align Structure de la page with the live markers after content exists.
            PageStructureSeeder::class,
            FillAllContentLocalesSeeder::class,
            SiteNavSeeder::class,
        ]);
    }
}
