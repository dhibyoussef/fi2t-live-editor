# FI2T — Laravel CMS Backend

API Laravel pour le **CMS / live editor** du site FI2T  
(Fédération Interprofessionnelle du Tourisme Tunisien).

Pas de modules hôtel (chambres, spa, réservations, etc.).

## Stack

- Laravel 13 + PHP 8.3
- Sanctum (auth token)
- Spatie Permission (`super-admin`, `admin`)
- MySQL (`fi2t`)

## Setup

```bash
composer install
cp .env.example .env
php artisan key:generate
```

`.env` :

```env
APP_NAME=FI2T
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=fi2t
DB_USERNAME=root
DB_PASSWORD=
```

```bash
php artisan migrate
php artisan db:seed
php artisan serve
```

## Comptes

| Rôle | Email | Password |
|------|-------|----------|
| super-admin | superadmin@fi2t.tn | 123456 |
| admin | admin@fi2t.tn | 123456 |

## API (CMS only)

Base : `http://localhost:8000/api`

**Public**
- `GET /content`, `/content/{page}`
- `GET /pages/{slug}`
- `GET /site-nav`
- `GET /translations/...`

**Auth**
- `POST /auth/login|logout`, `GET /auth/me`

**Admin** (`Bearer` + role admin)
- Content matrix / bulk / upload / pages / patterns / sections
- Site nav CRUD
- Users & roles
- Translations

## Live editor

Le site public (`website/` port 3002) consomme ces endpoints.  
L’admin (`frontend/` port 3000) ouvre le live edit via `?edit_token=…`.
