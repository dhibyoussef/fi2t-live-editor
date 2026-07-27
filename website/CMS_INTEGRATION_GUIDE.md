# Guide d'intégration CMS — Website React

> **Pour le développeur React** qui recrée le site public (`website/`) avec un nouveau design et la consommation des APIs.

Ce document décrit **ce que tu dois conserver ou réimplémenter** pour que le **dashboard admin** (`frontend/`, port 3000), le **mode édition inline** et le **page builder** continuent de fonctionner normalement.

Tu es libre de refaire **100 % du style, du layout et des composants visuels**. En revanche, certains **contrats techniques** (APIs, clés de contenu, patterns, providers) sont obligatoires.

---

## Architecture — 3 applications

| App | Dossier | Port | Rôle |
|-----|---------|------|------|
| **Backend API** | `backend/` | `8000` | Laravel — données, CMS, auth |
| **Dashboard admin** | `frontend/` | `3000` | Backoffice — builder, contenu, gestion hôtel |
| **Site public** | `website/` | `3002` | Site vitrine — **ton périmètre** |

```text
Dashboard (3000)  ──API──►  Backend (8000)  ◄──API──  Website (3002)
       │                                              │
       └──── "Modifier le site" + builder iframe ─────┘
```

---

## Ce que tu peux changer librement

- Tous les styles CSS / design system
- Structure HTML des sections (tant que les **clés de contenu** restent les mêmes)
- Composants UI (header, footer, cartes, grilles…)
- Routing des pages **statiques** (`/chambres`, `/spa`, etc.)
- Animations, responsive, typographie, couleurs

## Ce que tu ne dois pas casser

| Contrat | Pourquoi |
|---------|----------|
| Proxy API `/api` → `localhost:8000` | Sans ça, aucune donnée ne charge |
| Port **3002** | Le dashboard et le builder pointent vers cette URL |
| `ContentProvider` + `EditModeProvider` | Mode édition + chargement des blocs |
| `EditableText` / `EditableImage` sur le contenu CMS | Édition inline depuis le site |
| `CmsDynamicPage` + route `/:slug` | Pages créées par l'admin dans le builder |
| `CmsSectionView` (ou équivalent) par `pattern` | Rendu des blocs insérés via le builder |
| Bridge `builder_preview` (postMessage) | Aperçu live dans le builder admin |
| `contentSync` (BroadcastChannel) | Sync dashboard ↔ site après sauvegarde |

---

## Configuration obligatoire

### Vite — port et proxy

Le fichier `vite.config.ts` doit garder :

```ts
server: {
  port: 3002,
  proxy: {
    '/api': { target: 'http://localhost:8000', changeOrigin: true },
    '/storage': { target: 'http://localhost:8000', changeOrigin: true },
  },
}
```

### Client API

```ts
// src/api/client.ts
const api = axios.create({ baseURL: '/api', headers: { Accept: 'application/json' } })
```

Les images uploadées via le CMS sont servies sous `/storage/...` — le proxy `/storage` est requis.

---

## APIs publiques à consommer (site)

### Contenu CMS par page

```http
GET /api/content/{page}?locale=fr
```

Réponse :

```json
{
  "page": "home",
  "locale": "fr",
  "blocks": {
    "hero.headline": "Bienvenue",
    "hero.intro": "Texte d'introduction",
    "rooms.cards": "[{\"name\":\"Suite\",...}]"
  }
}
```

**Format des clés :** `{section}.{key}`

- `section` = slug de la section CMS (ex. `hero`, `galerie_photos`)
- `key` = champ du bloc (ex. `title`, `desc`, `image`, `cards`)

### Page dynamique (sections + métadonnées)

```http
GET /api/pages/{slug}?locale=fr
Authorization: Bearer {token}   ← requis pour les pages en brouillon
```

Réponse :

```json
{
  "page": { "slug": "mariages", "title": "Mariages", "status": "published", ... },
  "sections": [
    {
      "slug": "banniere",
      "title": "Bannière Hero",
      "pattern": "hero",
      "blocks": { "headline": "...", "intro": "...", "slide_1": "https://..." }
    }
  ]
}
```

### Carousels & Galeries (collections d'images admin)

L'admin crée des collections dans le dashboard **Carousels & Galeries**. Chaque collection a un **slug** unique consommable par le site.

```http
GET /api/carousels/public/{slug}
GET /api/carousels/public?type=carousel|gallery
```

Exemple `GET /api/carousels/public/home-hero` :

```json
{
  "id": 1,
  "slug": "home-hero",
  "type": "carousel",
  "name": "Accueil Hero",
  "active_items": [
    {
      "id": 1,
      "image_url": "/storage/carousel/abc.jpg",
      "image_alt": "Piscine",
      "title": "Bienvenue",
      "subtitle": "Luxe & élégance",
      "description": null,
      "button_text": "Réserver",
      "button_link": "/contact",
      "text_position": "center",
      "overlay_opacity": 40,
      "layout": null,
      "sort_order": 0
    }
  ]
}
```

Exemple galerie `GET /api/carousels/public/home-gallery` — même structure, `type: "gallery"`. Les champs overlay/CTA sont souvent vides ; `layout` peut être `large` ou `wide` pour la grille.

**Slugs seedés par défaut :** `home-hero` (carousel), `home-gallery` (galerie).

```tsx
// Exemple consommation React
const { data } = await api.get('/carousels/public/home-gallery')
const photos = data.active_items.map(item => ({
  image: item.image_url,
  alt: item.image_alt,
  caption: item.title,
  large: item.layout === 'large',
  wide: item.layout === 'wide',
}))
```

### Autres APIs utiles (hors CMS)

| Endpoint | Usage |
|----------|-------|
| `GET /api/translations/{locale}` | Traductions UI statiques |
| `GET /api/auth/me` | Vérifier l'admin en mode édition |

---

## Modèle de données CMS

### Types de champs (`content_blocks.type`)

| Type | Locale | Description |
|------|--------|-------------|
| `text` | `fr`, `en`, `ar` | Texte multilingue |
| `image` | `_all` | URL image (toutes langues) |
| `json` | `_all` | Liste structurée (cartes, galerie, avis…) |

### Patterns de blocs (composants builder)

Définis côté backend dans `backend/app/Services/CmsBlockPatterns.php` :

| Pattern ID | Champs principaux |
|------------|-------------------|
| `heading` | `title` |
| `text` | `title`, `desc` |
| `image` | `image` |
| `text_image` | `title`, `desc`, `image` |
| `hero` | `headline`, `rating`, `intro`, `slide_1`, `slide_2`, `slide_3` |
| `rooms_cards` | `title`, `desc`, `cards` (json) |
| `restaurants_cards` | `title`, `desc`, `cards` (json) |
| `gallery` | `title`, `photos` (json) |
| `testimonials` | `title`, `subtitle`, `reviews` (json) |
| `simple_list` | `title`, `items` (json) |

**Important :** le builder admin lit cette liste via `GET /api/admin/content/patterns`.  
Un nouveau composant visuel **n'apparaît pas** dans le builder tant que le pattern n'est pas ajouté en backend **et** rendu dans le site.

---

## Infrastructure React à conserver (ou réimplémenter)

### Arborescence CMS actuelle

```text
website/src/cms/
├── ContentProvider.tsx      # Charge les blocs, gère les overrides preview
├── EditModeProvider.tsx     # Token admin via ?edit_token=
├── EditableText.tsx         # Texte éditable inline
├── EditableImage.tsx        # Image éditable inline
├── EditToolbar.tsx          # Barre sauvegarde mode édition
├── contentSync.ts           # Sync inter-onglets dashboard ↔ site
├── BuilderPreviewProvider.tsx  # Écoute postMessage du builder
├── builderPreview.ts        # Constantes preview
└── defaults/home.ts         # Fallbacks page d'accueil (optionnel)
```

### Providers — envelopper l'app

```tsx
// App.tsx (structure minimale requise)
<EditModeProvider>
  <BuilderPreviewProvider>
    <BrowserRouter>
      <Routes>...</Routes>
    </BrowserRouter>
  </BuilderPreviewProvider>
</EditModeProvider>
```

### ContentProvider — obligatoire sur chaque page éditable

```tsx
<ContentProvider page="home">
  <MaSection />
  <EditToolbar />
</ContentProvider>
```

`page` = slug CMS (`home`, `global`, ou slug de page dynamique).

---

## Mode édition inline

### Activation

Le dashboard ouvre le site avec :

```text
http://localhost:3002/?edit_token={JWT}
```

`EditModeProvider` :
1. Stocke le token en `sessionStorage` (`gc_edit_token`)
2. Appelle `GET /api/auth/me`
3. Active `isEditMode` si rôle `admin` ou `super-admin`

### Utilisation dans tes composants

```tsx
import EditableText from '../cms/EditableText'
import EditableImage from '../cms/EditableImage'

// page = slug CMS, blockKey = "section.key"
<EditableText
  page="home"
  blockKey="hero.headline"
  as="h1"
  className="mon-titre"
  multiline
  label="Titre principal"
/>

<EditableImage
  page="home"
  blockKey="hero.slide_1"
  className="hero-bg"
  alt=""
  label="Image hero"
/>
```

**Règles :**
- `blockKey` doit correspondre exactement aux clés en BDD (`section.key`)
- Ne pas hardcoder le texte final — toujours passer par `EditableText` / `useContent()` pour le contenu CMS
- `EditToolbar` doit être présent quand `ContentProvider` est actif (sauvegarde bulk)

### Sauvegarde depuis le site

```http
POST /api/admin/content/bulk
Authorization: Bearer {token}
{ "blocks": [{ "page", "section", "key", "locale", "type", "value" }] }
```

Puis appeler `notifyContentSaved(page, 'website')` pour sync le dashboard.

---

## Pages dynamiques (créées par l'admin)

### Route catch-all obligatoire

```tsx
<Route path="/:slug" element={<CmsDynamicPage />} />
```

Place cette route **en dernier** (après `/chambres`, `/spa`, etc.).

### CmsDynamicPage — comportement requis

1. `GET /api/pages/{slug}?locale={lang}`
2. Si `403` + pas en mode édition → message « page en brouillon »
3. Si `404` → page introuvable
4. Rendre chaque section via un renderer par `pattern`
5. Envelopper dans `ContentProvider page={slug}`

### CmsSectionView — renderer par pattern

Chaque `pattern` du backend doit avoir un `if` / `switch` correspondant :

```tsx
if (pattern === 'hero') { /* ton nouveau design hero */ }
if (pattern === 'gallery') { /* ta nouvelle galerie */ }
// etc.
```

**Attribut obligatoire pour le builder :**

```tsx
<section data-cms-section={section.slug} className={highlighted ? 'cms-section-highlight' : ''}>
```

Le builder utilise `data-cms-section` pour surligner et scroller vers la section sélectionnée.

---

## Aperçu live du builder (iframe)

Quand l'admin construit une page, le dashboard embarque le site :

```text
http://localhost:3002/{slug}?builder_preview=1&edit_token={token}
```

### Ce que le site doit implémenter

1. Détecter `?builder_preview=1` (`isBuilderEmbed()`)
2. Écouter `postMessage` type `gc-builder-preview` :

```ts
{
  type: 'gc-builder-preview',
  page: 'mariages',
  locale: 'fr',
  overrides: { 'hero.headline': 'Nouveau titre' },  // brouillon non sauvegardé
  highlightSection: 'hero',
  scrollToSection: 'hero'
}
```

3. Fusionner `overrides` dans `ContentProvider.get()` / `getJson()`
4. Masquer `EditToolbar` en mode embed
5. Répondre `gc-builder-preview-ready` au parent au chargement

Fichiers de référence : `cms/BuilderPreviewProvider.tsx`, `cms/builderPreview.ts`, `styles/cms-builder-embed.css`

---

## Sync dashboard ↔ site

Fichier : `cms/contentSync.ts`

- Canal : `BroadcastChannel('gc-content-sync')`
- Fallback : `localStorage` key `gc-content-sync`
- Message : `{ type: 'content-updated', page, source: 'website' | 'dashboard', at }`

**À faire après chaque sauvegarde** (site ou dashboard) :

```ts
notifyContentSaved('home', 'website')
```

**À écouter** pour recharger les blocs :

```ts
onContentUpdated((msg) => {
  if (msg.source === 'website') return  // ignorer ses propres messages
  if (msg.page === currentPage) refetchBlocks()
})
```

---

## i18n — 3 langues

Langues CMS : **fr**, **en**, **ar**

- `ContentProvider` charge les blocs selon `i18n.language`
- `EditableText` édite la locale active
- Le builder preview peut forcer la locale via postMessage

Les textes UI statiques (boutons, menu) peuvent venir de `GET /api/translations/{locale}` — séparés des blocs CMS.

---

## Workflow : ajouter un nouveau composant CMS

Quand tu crées un nouveau bloc visuel (ex. `spa_packages`), **4 endroits** doivent être alignés :

### 1. Backend — pattern (équipe backend ou toi)

`backend/app/Services/CmsBlockPatterns.php` :

```php
'spa_packages' => [
    'title'       => 'Forfaits Spa',
    'description' => 'Grille de forfaits spa',
    'category'    => 'listes',
    'blocks'      => [
        ['key' => 'title', 'type' => 'text', 'label' => 'Titre', 'locale' => 'fr', ...],
        ['key' => 'packages', 'type' => 'json', 'label' => 'Forfaits', 'locale' => '_all', 'value' => '[]', ...],
    ],
],
```

### 2. Website — renderer

`src/components/cms/CmsSectionView.tsx` (ou ton équivalent) :

```tsx
if (pattern === 'spa_packages') {
  const packages = getJson(blockKey(section.slug, 'packages'), [])
  return (
    <SectionShell slug={section.slug}>
      <EditableText page={page} blockKey={blockKey(section.slug, 'title')} as="h2" ... />
      {/* ton nouveau design */}
    </SectionShell>
  )
}
```

### 3. Website — données via ContentProvider

Utiliser `EditableText`, `EditableImage`, `getJson()` — **pas de fetch séparé** pour le contenu CMS éditable.

### 4. Dashboard admin — éditeur visuel JSON (si bloc `json`)

`frontend/src/pages/content/editors/JsonBlockEditor.tsx` — ajouter le type d'éditeur pour `packages`.

> Les points 1 et 4 sont souvent faits par l'équipe backend/admin. **Toi, tu es responsable du point 2 (rendu)** et du respect des clés.

---

## Workflow : types de pages

### Page 100 % CMS (recommandé pour landing / marketing)

- L'admin crée la page dans le dashboard (slug, titre, statut)
- **Pas de fichier React dédié** — seulement la route `/:slug`
- Tu designs les **patterns** dans `CmsSectionView`

### Page statique custom (ex. `/chambres` avec logique métier)

- Tu crées `ChambresPage.tsx` + route explicite
- Tu consommes les APIs métier (`/api/rooms`, etc.)
- Optionnel : branche `ContentProvider` pour les textes éditables

### Page d'accueil `/`

Actuellement hybride : sections hardcodées + blocs CMS `page=home`.  
Si tu refais la home, **deux options** :

1. **Garder `ContentProvider page="home"`** + `EditableText` sur chaque zone éditable
2. **Migrer vers 100 % dynamique** : home = page CMS avec sections via `CmsDynamicPage` (nécessite coordination)

---

## Checklist avant livraison

### Infrastructure

- [ ] Port `3002` et proxy `/api` + `/storage`
- [ ] `EditModeProvider` + `BuilderPreviewProvider` sur l'app
- [ ] Route `/:slug` → page dynamique CMS
- [ ] `contentSync` branché dans `ContentProvider`

### Mode édition

- [ ] `?edit_token=` active le mode admin
- [ ] `EditableText` / `EditableImage` sur tout contenu modifiable par l'admin
- [ ] `EditToolbar` visible en mode édition (masqué en `builder_preview`)
- [ ] Sauvegarde bulk + `notifyContentSaved`

### Builder

- [ ] Tous les patterns backend ont un renderer `CmsSectionView`
- [ ] `data-cms-section={slug}` sur chaque section
- [ ] `BuilderPreviewProvider` fusionne les `overrides` postMessage
- [ ] Pages brouillon accessibles avec Bearer token

### Contenu

- [ ] Clés `section.key` identiques entre site et BDD
- [ ] Support FR / EN / AR pour les champs `text`
- [ ] JSON validé pour listes (cards, photos, reviews, items)

---

## Tests manuels à faire

1. **Dashboard → Modifier le site** : le site s'ouvre en mode édition, texte cliquable
2. **Édition inline** : modifier un texte → Enregistrer → changement visible + sync dashboard
3. **Contenu du site → Builder** : créer page, ajouter blocs, aperçu live iframe fonctionne
4. **Brouillon** : page non publiée visible avec token admin uniquement
5. **Preview builder** : modification sans Enregistrer visible dans l'iframe
6. **Mobile** : le builder preview (tablet/mobile) affiche correctement

---

## Fichiers de référence (implémentation actuelle)

| Fichier | Rôle |
|---------|------|
| `website/src/App.tsx` | Routes + providers |
| `website/src/pages/CmsDynamicPage.tsx` | Pages CMS dynamiques |
| `website/src/components/cms/CmsSectionView.tsx` | Rendu par pattern |
| `website/src/cms/ContentProvider.tsx` | État blocs + overrides |
| `website/src/cms/EditModeProvider.tsx` | Auth mode édition |
| `website/src/cms/EditableText.tsx` | Édition inline texte |
| `website/src/cms/BuilderPreviewProvider.tsx` | Aperçu builder |
| `backend/app/Services/CmsBlockPatterns.php` | Catalogue des composants |
| `frontend/src/pages/content/builder/` | Page builder admin |

---

## Contact / coordination

| Besoin | Qui |
|--------|-----|
| Nouveau pattern dans le builder | Backend — `CmsBlockPatterns.php` |
| Éditeur visuel JSON admin | Frontend admin — `JsonBlockEditor.tsx` |
| Rendu site du pattern | **Toi** — `CmsSectionView` |
| Nouvelle API métier | Backend |

---

## Résumé en une phrase

> **Tu refais tout le design, mais chaque contenu éditable par l'admin doit passer par les clés CMS (`section.key`), les providers (`ContentProvider`, `EditModeProvider`, `BuilderPreviewProvider`), et un renderer par `pattern` — sinon le dashboard, le mode édition et le builder ne fonctionneront plus.**
