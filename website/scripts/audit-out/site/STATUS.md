# Site-wide design audit

Regenerate with:

```bash
node scripts/audit-site.mjs             # per-page MAE vs Figma artboard
node scripts/audit-offsets.mjs          # hero vs content vertical alignment
node scripts/audit-groupement-tree.mjs  # hub/leaf routes, photos, breadcrumbs
```

Both expect the dev server on `http://localhost:3002` (override with `AUDIT_BASE`).
MAE is the mean absolute pixel difference at 1440px width against the artboard
exports in `Untitled (1)/`. Font anti-aliasing between Figma's renderer and
Chrome puts the practical floor around **2.0**, so ~2.0–2.5 means "pixel
identical apart from text rasterisation".

## Current state

| Page | MAE | Content MAE | Height live/design | Assessment |
|------|-----|-------------|--------------------|------------|
| `/actualites` | **1.84** | — | 2635 / 2635 | at floor |
| `/tourisme-aventure` | **2.46** | — | 3072 / 3072 | at floor (Figma-locked) |
| `/tourisme-automobile` | **2.60** | — | 2860 / 2860 | at floor (Figma-locked) |
| `/tourisme-affaire` | 3.55 | — | 3980 / 3968 | 12px too tall |
| `/contact` | 3.94 | — | 1597 / 1596 | needs polish |
| `/organisation` | 4.71 | — | 3252 / 3252 | needs work |
| `/qui-sommes-nous` | 4.77 | — | 2827 / 2827 | needs work |
| `/agences-de-voyages` | 5.51 | — | 4002 / 4001 | needs work |
| `/tourisme-culturel` | 5.44 | — | 3092 / 3090 | needs work |
| `/` (home) | 5.71 | — | 5450 / 5450 | needs work |
| `/hebergements-alternatifs` | 6.65 | — | 3821 / 3821 | banner live-title (+0.33 vs baked) |
| `/tourisme-plaisance` | 10.99 | **2.48** | 3819 / 3819 | photo swap (intentional) |
| `/tourisme-thermal` | 11.12 | **3.15** | 3521 / 3521 | photo swap (intentional) |
| `/tourisme-medical` | 12.08 | **3.17** | 3323 / 3323 | photo swap (intentional) |
| `/tourisme-golfique` | 12.30 | **3.78** | 3348 / 3348 | photo swap (intentional) |
| `/thalassotherapie` | 13.52 | **4.29** | 3655 / 3655 | photo swap (intentional) |
| `/tourisme-senior` | 13.53 | **5.76** | 3520 / 3521 | photo swap (intentional) |

The six health / sport / nautical children intentionally replace the artboard
banner. Every design reuses the same desert-and-camel placeholder, so there is
no topical photograph in the Figma files. Live banners now carry a descriptive
photo (clinic, thalasso pool, thermal springs, seaside terrace, golf course,
marina) with the title rendered as live text at the artboard metrics (40px,
64×4 accent). Content below the banner is unchanged — the whole MAE jump sits
in the banner rows. Score those pages on **Content MAE**, not overall MAE.

The six hub children also carry a breadcrumb back to their hub. It is
**overlaid on the banner** (absolutely positioned, bottom-left of the content
column) rather than stacked above the content: as a block it added 49px and
pushed every Figma-locked section down, taking those pages from ~3.7 to ~11
MAE. Overlaid it costs ~0.03.

## Pages with no artboard (excluded from MAE)

`tourisme-de-sante`, `tourisme-sportif`, `tourisme-nautique` (hubs) and
`tourisme-ecologique`, `tourisme-aeronautique`, `tourisme-subaquatique` (new
leaves) have no Figma design. They use a shared editorial layout — photo banner,
intro, key-figures band, pillars, then filière cards (hubs) or défis/actions
(leaves), and a closing CTA. Verify them with `audit-groupement-tree.mjs`.

Their photography lives in `public/images/groupement-photos/`.

Intentional deviations, excluded from "needs work" judgements:

- **Header** — the live header carries FR/EN/AR switchers the artboards lack.
- **Footer** — one shared footer, not the per-artboard variants.

## Systematic 1px banner offset (fixed for the Figma-locked layouts)

Every artboard places the banner at rows **110–502 (393px)**. The sticky header
is 111px (110px inner + 1px border), so every hero rendered 1px low.

`audit-offsets.mjs` exposed this as `heroShift=1` on all pages. On the five
Figma-locked groupement layouts the hero is now pulled up 1px
(`.fi2t-gl--{aventure,affaire,golf,plaisance,auto} > .fi2t-page-hero--groupement-baked`)
and their stages sit flush instead of using a compensating `margin-top: -1px`.
Those banners now match the design exactly (hero band MAE **0.00**).

The remaining pages still render the banner 1px low. Correcting it globally by
trimming the header to 110px also shifts their content up 1px, and those pages
were tuned against the 111px header — their content then measured `contShift=-1`.
Fixing them needs per-page verification rather than one global change.

## Unmapped designs

- `Grandes problématiques.png` — no route renders this; no `grandes-problematiques`
  slug exists.
- `Article.png` — `/actualites/:slug`, not covered by the audit (needs a slug).
- `Vector.png` — an asset, not a page.

## Live editor (CMS) coverage

Content is keyed as `(page, section.key, locale)`. The main FI2T pages, the
header logo and the footer use `Editable*` wrappers, which also stamp
`data-cms-page` / `data-cms-block` on the DOM.

The seventeen Figma-custom groupement layouts cannot carry per-string wrappers
— their exact markup is what keeps the artboard on the grid. They are edited
through the `Structure de la page` dock instead (`CustomPageEditor`), one panel
per band, backed by one `<band>.data` JSON block each.

Also note: Accueil slug `tourisme-affaire` (Figma leaf); legacy `tourisme-affaires` redirects.

## "Structure de la page" is derived, never hand-written

Two seeders keep the back-office list identical to the rendered page:

- `PageStructureSeeder` reads `page-structure.json`, produced by
  `node scripts/export-page-structure.mjs`, which crawls the running site and
  records every `data-cms-block` in document order. It prunes bands the page no
  longer renders and backfills defaults for fields the database is missing.
- `CustomGroupementPageSeeder` reads `custom-groupement-pages.json`, produced by
  `node scripts/export-custom-groupement-pages.mjs`, whose bands come from
  `groupement-page-schema.ts`.

The schema groups the layouts' flat `sections` bag by key prefix
(`atoutsTitle`, `atoutsSub`, `atouts` → the Atouts band). A handful of keys do
not follow the prefix rule and are folded in explicitly via `FOLD_INTO`:
`probs` is the card list of Grandes Problématiques, `eyebrow` and `lead` sit in
the intro block, and `hubSlug` / `discoverCta` drive the filières grid. Without
that they surface as bands of their own — a junk "Probs" entry, and a surtitle
listed after the closing CTA rather than at the top where it renders.

A band's position comes from the first key that *natively* belongs to it, so a
folded key never drags its host band up the page.

## Never store a number an editor cannot change

The home objectives cards used to hold their `01`–`04` in the content
(`objectifs.items[].num`). Editing it did nothing useful and deleting a card
left a gap in the sequence, so the number is now rendered from the item's
position and the field is gone from the CMS.

## Accordion bands must stay content-driven

`/agences-de-voyages` renders its défis and propositions bands as accordions with
the first row open, which is the state the artboard shows. Both bands used to
pin that state with `min-height` (1182px and 1032px). The artboard heights are
reached by the content alone when the first row is open, so the pins only took
effect once a visitor collapsed a row — the band held its full height and left
381px / 259px of empty lavender. They are now content-driven (the propositions
band carries its artboard trailing space as `padding-bottom` instead). Default
geometry is untouched: bands 1182px / 1032px, page 4002px, MAE 5.42.

Don't reintroduce a fixed height on a band whose content collapses.

## Never erase baked text by thresholding a photo

`/agences-de-voyages` had its title baked into the banner, so it could not translate.
The first attempt masked "bright, low-chroma" pixels and ran `cv2.inpaint`; the hazy
sky in that strip sits at the same luminance as the glyphs, so the mask caught 67% of
the band and the inpaint smeared edge colours across it.

The banner is recoverable without inventing pixels: the groupement artboards
(`Agences de voyages`, `Tourisme automobile`, `Tourisme culturel`, `Tourisme des
Sénior`, `Tourisme golfique`, `Tourisme medical`, `Tourisme thermal`) share this
desert photo *pixel-identically* and differ only in the centred title, so a per-pixel
minimum across the seven drops every glyph and keeps the real background. Only the
accent bar (same spot in all seven, 745px) needs inpainting. The banner rect inside a
1440-wide artboard is `y110–502`, not `y0`; the artboards carry a white header band on
top. `scripts/_build-agences-hero.py` in git history has the recipe.

This page renders the plate with **no scrim** — it is the artboard's own photo, so the
scrim used by hub/leaf editorial heroes darkened it to `banner` MAE 50. Without it the
banner is 3.42 and the page is 5.51 overall, against 5.42 when the title was baked.

## Organisation — regional map card and bureau list

The map card asset (`org-regional-map-card.png`, copied from `tunisia-map-bg.png`) is
the artboard crop with the tri-fold icon and the "11 Bureaux Régionaux" text removed;
it is pixel-identical to the design outside those two bands. Both are live DOM
(`.fi2t-org-regional__map-icon`, `regional.map_label`) positioned at the artboard
offsets — icon glyph y88–131, label glyph band y156–177 — so the label translates.
Don't re-bake text into that asset.

The bureau list shows 8 rows (the artboard's 4×2 grid) and only renders the expand
chevron when the list is longer than that; the artboard draws a chevron because it
claims 11 offices while the data holds 8. The `.fi2t-org-regional__more` slot keeps
its 59px whether or not the arrow renders, which is what holds the page at 3252px.
Edit mode always shows every row so inline editing can reach them.
