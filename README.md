# FI2T — Site + CMS

Simple guide for the FI2T project (public website + admin + API).

## The 3 parts

| Folder | What it is | Local URL |
|--------|------------|-----------|
| `website/` | Public FI2T website + live edit on the page | http://localhost:3002 |
| `frontend/` | Admin panel (login, content, users, translations) | http://localhost:3000 |
| `backend/` | Laravel API + database + image storage | http://localhost:8000 |

**Rule:** always run all three. The site and admin talk to the API. Without `:8000`, pages look empty and uploads fail.

---

## How each main thing works

### 1. Public website (`website/`)
- Visitors see Accueil, Qui sommes-nous, Organisation, Actualités, Contact, groupements, etc.
- Languages: **FR / EN / AR** (switcher in the header). Arabic uses RTL.
- Content comes from the API (database). If the API is down, you only see local fallbacks.

### 2. Admin panel (`frontend/`)
- Login → Dashboard → **Contenu du site**, Traductions, Users, Roles.
- **Contenu du site**: edit pages/sections, or open **Aperçu** of the live site.
- **Modifier le site** (live edit): opens the public site with an edit token so you can click text/images and save.

### 3. API + database (`backend/`)
- Stores all CMS text, JSON blocks, articles, users, roles.
- Serves uploaded images at `/storage/website/...`
- Auth uses Bearer tokens (Sanctum). Only logged-in admins can upload or change content.

### 4. Images / uploads
1. Admin (or live edit) picks an image.
2. File goes to `backend/storage/app/public/website/`.
3. Database saves a path like `/storage/website/xxxxx.png`.
4. Site shows it via `/storage/...` (proxied to Laravel in local dev).

Allowed: JPEG, PNG, WebP, GIF… (max ~2 MB). **SVG is blocked** (security).

Fixed site assets (heroes, icons) live in `website/public/images/` (in git).

### 5. Live edit (click-to-edit)
1. Log in on `:3000`.
2. Open Contenu du site → Aperçu (or “Modifier le site”).
3. Site opens on `:3002` with edit mode.
4. Click text or image → change → save. Changes go to the API.

---

## Start on your PC

```powershell
# Terminal 1 — API
cd backend
php artisan serve --host=127.0.0.1 --port=8000

# Terminal 2 — Admin
cd frontend
npm run dev

# Terminal 3 — Public site
cd website
npm run dev
```

Open: **http://localhost:3002** (site) and **http://localhost:3000** (admin).

### First time only

```powershell
cd backend
composer install
copy .env.example .env
# Edit .env → set DB_DATABASE, DB_USERNAME, DB_PASSWORD
php artisan key:generate
php artisan migrate --seed
php artisan storage:link

cd ../frontend
npm install

cd ../website
npm install
```

### Demo logins (change these before production)

- `admin@fi2t.tn` / `123456`
- `superadmin@fi2t.tn` / `123456`

---

## Before putting on the server (checklist)

1. **Passwords** — change admin accounts; set a strong `ADMIN_SEED_PASSWORD` only for first seed.
2. **`.env` (backend)**  
   - `APP_ENV=production`  
   - `APP_DEBUG=false`  
   - `APP_URL=https://your-domain.tn`  
   - Real `DB_*` credentials  
   - Real mail settings if Contact / Adhésion emails must send
3. **Build frontends**
   ```powershell
   cd frontend; npm run build
   cd ../website; npm run build
   ```
4. On the server: `composer install --no-dev`, `php artisan migrate --force`, `php artisan storage:link`, `php artisan config:cache`.
5. Point the web server so:
   - Public site serves `website/dist` (or your host setup)
   - Admin serves `frontend/dist`
   - `/api` and `/storage` go to Laravel
6. Use **HTTPS**. Keep uploads folder writable (`storage/app/public`).

Full guide (Docker containers): **[DEPLOYMENT.md](DEPLOYMENT.md)**  
Prodexo preprod (SFTP, `/fi2t/`): **[deploy/PREPROD-PRODEXO.md](deploy/PREPROD-PRODEXO.md)**

---

## Brand

- Teal `#00A98D` · Navy `#001E40` · Gold `#CDB48A`
- Font: Montserrat Alternates

Figma: https://www.figma.com/design/6p0kQYHjUAPj7QzeACxJRL/FI2T
