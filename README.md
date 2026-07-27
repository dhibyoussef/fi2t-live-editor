# FI2T — Fédération Interprofessionnelle du Tourisme Tunisien

Nouveau projet CMS. On réutilise **uniquement** le live editor (pages → sections → blocs).

## Structure

| Dossier | Rôle | Port |
|---------|------|------|
| `backend/` | Laravel CMS API (auth + content) | `:8000` |
| `frontend/` | Admin FI2T (teal / navy) | `:3000` |
| `website/` | Site public + live editor | `:3002` |
| `fi2t/` | Proto Next.js (référence UI) | — |

## Brand (Figma)

- Teal `#00A98D` · Teal dark `#00696B`
- Gold `#CDB48A` · Navy `#001E40`
- Lilac bg `#FAF8FF`
- Font: Montserrat Alternates

## Start

```powershell
cd backend; php artisan serve
cd frontend; node ./node_modules/vite/bin/vite.js --port 3000 --strictPort
cd website; node ./node_modules/vite/bin/vite.js --port 3002 --strictPort
```

## Login

- `admin@fi2t.tn` / `123456`
- `superadmin@fi2t.tn` / `123456`

Figma : https://www.figma.com/design/6p0kQYHjUAPj7QzeACxJRL/FI2T
