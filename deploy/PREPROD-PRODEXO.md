# FI2T — Prodexo preproduction (`/fi2t/`)

Deploy on **Prodexo** server via **SFTP** (not Docker on your PC).  
Containers/nginx are already configured by the host — you upload code + built `dist/`.

| | |
|--|--|
| **Site** | https://preprod2026.prodexo.agency/fi2t/ |
| **Admin** | https://preprod2026.prodexo.agency/fi2t/admin/ |
| **API** | https://preprod2026.prodexo.agency/fi2t/api |
| **SFTP** | `sftp youssef@137.74.88.16` (SSH key) |

Web login (basic auth): see your personal `acces-youssef-dhib.md` (do **not** commit that file).

---

## What you do (Youssef)

### 1. Build with `/fi2t/` prefix (on your PC)

```powershell
cd deploy
.\build-preprod.ps1
```

Or manually:

```powershell
# Website
cd website
copy ..\\deploy\\env.website.preprod.example .env.production
$env:VITE_BASE="/fi2t/"
npm run build

# Admin
cd ..\frontend
copy ..\\deploy\\env.frontend.preprod.example .env.production
$env:VITE_BASE="/fi2t/admin/"
npm run build
```

This produces `website/dist/` and `frontend/dist/` with correct asset paths.

### 2. Upload via SFTP

Connect: `sftp youssef@137.74.88.16`

You land in chroot `fi2t/` with three folders:

| Upload | Contents |
|--------|----------|
| `backend/` | Full Laravel app (no `vendor/` — Nidhal runs `composer install`) |
| `frontend/` | Source + **`frontend/dist/`** after build |
| `website/` | Source + **`website/dist/`** after build |

Also upload `backend/.env` — use `deploy/env.backend.preprod.example` as template (passwords from your acces doc).

### 3. Tell Nidhal

After upload, ask **Nidhal** to run on the server:

```bash
composer install --no-dev
php artisan key:generate    # first time only
php artisan migrate --force
php artisan db:seed --force # first time only
php artisan storage:link
php artisan config:cache
# + start queue worker
```

You have **SFTP only** — no shell unless Nidhal grants container SSH.

### 4. Verify

- https://preprod2026.prodexo.agency/fi2t/ — home page  
- https://preprod2026.prodexo.agency/fi2t/admin/ — login  
- https://preprod2026.prodexo.agency/fi2t/api/content — JSON  

---

## Backend `.env` (preprod)

Copy `deploy/env.backend.preprod.example` → `backend/.env` and fill secrets from your acces doc:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://preprod2026.prodexo.agency/fi2t

DB_HOST=fi2t-mysql
DB_DATABASE=fi2t
DB_USERNAME=fi2t_user
DB_PASSWORD=<from acces doc>

QUEUE_CONNECTION=database
SANCTUM_STATEFUL_DOMAINS=preprod2026.prodexo.agency
```

---

## Important: `/fi2t/` prefix

The app is **not** at domain root. Builds must use:

| App | Vite `base` |
|-----|-------------|
| `website/` | `/fi2t/` |
| `frontend/` | `/fi2t/admin/` |
| API calls | `/fi2t/api` (via `VITE_APP_PREFIX=/fi2t`) |

Local dev (`:3000` / `:3002` / `:8000`) is unchanged — no prefix.

---

## Do NOT commit

- `acces-youssef-dhib.md` (passwords)
- `backend/.env` with real passwords
- `node_modules/`, `vendor/`, `dist/` (rebuild after pull)

---

## Docker vs Prodexo

| | Local Docker (`deploy/docker-compose.yml`) | Prodexo preprod |
|--|--|--|
| Who runs containers | You / server admin | **Nidhal / Prodexo** |
| URL | `/` or `/admin/` | **`/fi2t/`** |
| Deploy | `docker compose up` | **SFTP upload** |

See also: [DEPLOYMENT.md](../DEPLOYMENT.md) for container layout reference.
