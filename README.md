# FI2T — Fédération Interprofessionnelle du Tourisme Tunisien

Nouveau projet CMS. On réutilise **uniquement** le live editor (pages → sections → blocs).

## Structure

| Dossier | Rôle | Port |
|---------|------|------|
| `backend/` | Laravel CMS API (auth + content) | `:8000` |
| `frontend/` | Admin FI2T (teal / navy) | `:3000` |
| `website/` | Site public + live editor | `:3002` |

## Brand (Figma)

- Teal `#00A98D` · Teal dark `#00696B`
- Gold `#CDB48A` · Navy `#001E40`
- Lilac bg `#FAF8FF`
- Font: Montserrat Alternates

## Start

```powershell
cd backend; php artisan serve --host=127.0.0.1 --port=8000
cd frontend; node ./node_modules/vite/bin/vite.js --port 3000 --strictPort
cd website; node ./node_modules/vite/bin/vite.js --port 3002 --strictPort
```

First time on a new PC:

```powershell
cd backend
composer install
copy .env.example .env   # then set DB_*
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
```

`storage:link` connects uploaded images. If the link fails on Windows, the API still serves `/storage/...` via a fallback route.

## Login

- `admin@fi2t.tn` / `123456`
- `superadmin@fi2t.tn` / `123456`

## Images (important for another PC / server)

| Kind | Where it lives | Shared how |
|------|----------------|------------|
| Site assets (heroes, icons…) | `website/public/images/` | In git |
| CMS uploads (Live Editor / admin) | `backend/storage/app/public/website/` | In git under `website/` — **commit after uploading** |
| Public URL | `/storage/website/<hash>.png` | Served by Laravel (`:8000`), proxied by Vite |

**Upload flow:** pick image in Aperçu or Contenu du site → file is stored in `backend/storage/app/public/website/` → DB saves the path `/storage/website/...` → on another PC, `git pull` + `php artisan storage:link` loads the same image.

After uploading new media on one machine:

```powershell
git add backend/storage/app/public/website
git commit -m "Add CMS uploaded images"
```

## Languages

Header switcher: **FR / EN / AR** (Arabic sets `dir=rtl`). Preference is stored in `localStorage` (`fi2t_lang`).

Figma : https://www.figma.com/design/6p0kQYHjUAPj7QzeACxJRL/FI2T
