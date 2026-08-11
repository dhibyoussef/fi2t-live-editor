# FI2T — Container Deployment Layout

## Architecture: 3 containers + 1 DB

```
┌─────────────────────────────────────────────────────┐
│                      Nginx                          │
│              (reverse proxy + SSL)                  │
│                   port 80/443                       │
│                                                     │
│  /api/*  ──────►  PHP-FPM container (:9000)         │
│  /storage/* ───►  PHP-FPM container (static files)  │
│  /admin/* ─────►  static files (frontend build)     │
│  /* ───────────►  static files (website build)      │
└─────────────────────────────────────────────────────┘

┌──────────────────┐  ┌──────────────────┐  ┌─────────────┐
│   php-fpm        │  │     nginx        │  │   mysql      │
│   (backend)      │  │  (proxy+static)  │  │   8.0+      │
│                  │  │                  │  │             │
│ Laravel API      │  │ serves frontend/ │  │  fi2t DB    │
│ queue:work       │  │ serves website/  │  │             │
│ storage/         │  │ proxies /api     │  │             │
└──────────────────┘  └──────────────────┘  └─────────────┘
        ▲                                        ▲
        └────────────── network ─────────────────┘
```

## Container breakdown

| # | Container | Image base | Role | Persistent volume |
|---|-----------|-----------|------|-------------------|
| 1 | **php-fpm** | `php:8.3-fpm` | Laravel API + queue worker | `storage/app/public` (uploads) |
| 2 | **nginx** | `nginx:alpine` | Reverse proxy, serve static frontend + website builds, proxy `/api` to php-fpm | Nginx config only |
| 3 | **mysql** | `mysql:8.0` | Database | `/var/lib/mysql` |
| 4 *(optional)* | **queue-worker** | Same as php-fpm | Dedicated `php artisan queue:work` | Shares storage volume |

## Build step (not a running container)

Both `frontend/` and `website/` are **built once** with Node, then the output (`dist/`) is copied into the Nginx container:

```
node:20 → npm run build (frontend)  → dist/ → copied to nginx
node:20 → npm run build (website)   → dist/ → copied to nginx
```

## Volumes (persistent data)

| Volume | Mounted in | Purpose |
|--------|-----------|---------|
| `db_data` | mysql → `/var/lib/mysql` | Database files |
| `storage` | php-fpm → `/app/backend/storage/app/public` | CMS uploaded images |

## Nginx routing summary

| URL pattern | Destination |
|-------------|-------------|
| `/api/*` | → php-fpm `:9000` (Laravel) |
| `/storage/*` | → php-fpm storage (or shared volume) |
| `/admin/*` | → static `frontend/dist/` |
| `/*` (everything else) | → static `website/dist/` |

## Environment variables (php-fpm `.env`)

Key values to set:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.tn

DB_HOST=mysql          # container name
DB_DATABASE=fi2t
DB_USERNAME=fi2t_user
DB_PASSWORD=<strong_password>

QUEUE_CONNECTION=database
SANCTUM_STATEFUL_DOMAINS=yourdomain.tn
```

## Summary

- **No running Node process** — frontends are pre-built static files
- **3 containers minimum** (nginx, php-fpm, mysql), optionally 4 with a separate queue worker
- **2 volumes** for persistence (DB + uploads)
- **Single domain** with Nginx routing by path

---

## How to run (files in `deploy/`)

| File | Role |
|------|------|
| `deploy/docker-compose.yml` | nginx + php-fpm + mysql + queue-worker |
| `deploy/Dockerfile.php` | PHP 8.3-FPM image |
| `deploy/Dockerfile.nginx` | Builds both frontends, serves them |
| `deploy/nginx.conf` | Path routing (`/api`, `/storage`, `/admin`, `/`) |
| `deploy/env.backend.docker.example` | Copy → `backend/.env` for Docker |

### 1. Backend `.env`

```bash
cd backend
cp .env.example .env
# Or use deploy/env.backend.docker.example as a starting point
```

Set at least:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.tn
APP_KEY=   # php artisan key:generate

DB_HOST=mysql
DB_DATABASE=fi2t
DB_USERNAME=fi2t_user
DB_PASSWORD=<strong_password>

QUEUE_CONNECTION=database
SANCTUM_STATEFUL_DOMAINS=yourdomain.tn
```

### 2. Build & start

From the **repo root**:

```bash
# Optional: pass your public URL into the frontend/website builds
export APP_URL=https://yourdomain.tn

docker compose -f deploy/docker-compose.yml up -d --build
```

First time only (seed CMS + admins):

```bash
docker compose -f deploy/docker-compose.yml exec php-fpm php artisan migrate --force
docker compose -f deploy/docker-compose.yml exec php-fpm php artisan db:seed --force
docker compose -f deploy/docker-compose.yml exec php-fpm php artisan storage:link
```

Open:

- Site → `http://localhost/` (or your domain)
- Admin → `http://localhost/admin/`
- API → `http://localhost/api/...`

### 3. HTTPS

Put TLS in front of Nginx (host Certbot, Cloudflare, or load balancer). Keep `APP_URL=https://yourdomain.tn`.

---

## Local development (unchanged)

Still use the 3 local processes from [README.md](README.md) — no Docker required for day-to-day work:

- website `:3002` · frontend `:3000` · backend `:8000`
