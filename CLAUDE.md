# webforge-ancree

Repo de la **famille de design Ancrée** (2e famille WebForge) de [Patoine Studio](https://patoinestudio.ca). Construit en Nuxt 4 statique généré. **Un repo par famille de design** (polyrepo): ce repo est la famille Ancrée; les autres familles vivent dans leurs propres repos.

## État: canvas vierge

Ce repo a été remis à un **canvas Nuxt minimal** le 19 juin 2026 (reset au scaffold, puis réduction). La première construction (un reskin trop proche de Minimaliste) a été jetée. Il ne reste que la fondation technique et l'identité d'Ancrée:

- **Modules**: i18n (fr racine, en sous `/en`), Sanity (`@nuxtjs/sanity`), image, fonts, icon, seo, pinia. Config dans `nuxt.config.ts`.
- **Identité**: package `webforge-ancree`, project Sanity `5if00rwn` (« WebForge - Ancrée », org Patoine Studio `o7R0d3u6V`), dataset `production` (vide), déploiement Cloudflare Workers (`wrangler.jsonc` / `wrangler.preview.jsonc`, domaines `*.patoinestudio.ca`).
- **App**: une coquille (`app/app.vue`, `layouts/default.vue`, `pages/index.vue` placeholder, `error.vue`), tokens minimaux (`app/family/tokens.css`, `app/brand/tokens.css`), `app/assets/css/main.css`.
- **Studio** (`studio/`): config minimale, **schémas vides** (`studio/schemas/index.ts`).

**Tout est à rebâtir**: design de la famille, blocs, dispositions, architecture Sanity, contenu. Voir [ROADMAP.md](./ROADMAP.md) et [DESIGN.md](./DESIGN.md).

## Vocabulaire WebForge

- **Système** = WebForge (système de produits PS pour PME).
- **Famille de design** = axe esthétique (Minimaliste, Ancrée, etc.). Une famille = preset de tokens + variantes typographiques + bibliothèque de variantes de blocs. **Une famille = un repo.**
- **Mode** = palier d'usage (One-Pager, Multipage, Builder avec CMS Sanity).
- **Démo** = site fictif qui démontre une famille (la démo d'Ancrée est à redéfinir).
- **Client** = site réel (repo séparé, consommera les packages WebForge plus tard).

## Les trois disciplines de code (intactes)

1. **Aucune valeur design en dur.** Tout par tokens CSS ou props. Les valeurs hardcodées vivent uniquement dans les fichiers de tokens (`app/family/tokens.css`, `app/brand/tokens.css`). Jamais de `color: #xxx` dans un composant.
2. **Aucun texte d'interface en dur** (Nuxt i18n): a11y universelle + chrome produit générique.
3. **Aucun contenu en dur**: le contenu vit dans Sanity (queries au build, transformation pure, lecture synchrone par les composables). L'architecture est à refaire.

## Conventions

- **Commits**: format conventionnel (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`), petits et atomiques, scope optionnel.
- **Layout**: CSS Grid par défaut; flex pour les petits éléments inline.
- **Typographie des textes** (docs, commits, communication): aucun tiret cadratin, aucun middle dot comme séparateur, français québécois soutenu et direct, sans buzzwords.
- **Jamais de numérotation** d'éléments, site-wide.

## Cadence

Charles tranche les décisions structurantes. Une action à la fois en série, check-in après chaque tâche significative, franchise totale.
