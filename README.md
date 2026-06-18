# webforge-ancree

Repo de la famille **Ancrée** du système **WebForge** de [Patoine Studio](https://patoinestudio.ca). Un repo par famille de design: celui-ci porte la démo publique Ancrée (Atelier Cormier) à la racine, son Studio Sanity dans `studio/` (seul workspace yarn). Les autres familles (Cinématique, Éditoriale) vivent dans des repos séparés; le code partagé (`webforge-core`) deviendra des packages publiés à part.

Ce repo a deux usages: **gabarit de référence** copié pour amorcer chaque futur site client, et **matière éducative** pour la communication commerciale PS.

Voir `CLAUDE.md` pour le contexte produit complet (vocabulaire WebForge, paliers, familles de design, disciplines de code) et `ROADMAP.md` pour ce qui reste à faire.

## Prérequis

- **Node** 24 LTS (épinglé dans `.nvmrc`). `nvm use` pour aligner.
- **Yarn** 4 via corepack (le projet utilise `nodeLinker: node-modules`, jamais npm ni pnpm).

## Installation

```bash
corepack enable
nvm use
yarn install        # postinstall lance `nuxt prepare` -> ACCÈS RÉSEAU Sanity requis (voir Sanity)
yarn dev            # démo Ancrée sur http://localhost:3000
```

> Le `postinstall` (et `dev`/`build`/`generate`) fetchent le contenu sur Sanity: un
> `yarn install` hors ligne échoue. Voir la section **Sanity**.

## Structure

```
webforge-ancree/                # repo de la famille Ancrée, l'app Nuxt EST à la racine
├── app/                             # srcDir Nuxt (pages, composants, composables, family/, brand/, ...)
├── server/                          # routes Nitro (formulaire de contact, exit-preview)
├── public/                          # assets statiques (favicons, og-default, images)
├── i18n/locales/                    # locales fr/en
├── nuxt.config.ts                   # config (Sanity en top-level await, route-map, gating preview, sitemap)
├── studio/                          # Studio Sanity de la démo (workspace yarn, seed)
├── reference/                       # bundle de design partagé (lecture seule)
└── docs/                            # CONVENTIONS-CONTRACT, SANITY-SCHEMA-SPEC, DEPLOY-CLOUDFLARE, FORK-CLIENT, ...
```

Philosophie un-repo-par-famille et architecture détaillées dans `CLAUDE.md`.

## Scripts

**App (racine):**

```bash
yarn dev          # démo Ancrée en dev (HMR)
yarn build        # build serveur (utilisé en preview SSR)
yarn generate     # génération statique -> .output/public (prod/staging)
yarn preview      # prévisualisation locale du dernier build
```

**Studio Sanity (proxies racine + workspace):**

```bash
yarn studio:dev                                       # Studio local sur :3333
yarn studio:build                                     # build du Studio
yarn studio:deploy                                    # déploie le Studio hébergé (.sanity.studio)
yarn workspace webforge-ancree-studio schema:deploy   # déploie le schéma (requis après tout changement de schéma)
```

**Seed (reproductible, depuis `studio/`):**

```bash
cd studio
yarn sanity exec seed/run.mjs --with-user-token       # seed idempotent du contenu (FR + EN)
yarn sanity exec seed/verify.mjs --with-user-token    # vérifie comptes, références, images
```

> Le seed cible la démo (`5if00rwn`) par défaut et refuse de tourner sans
> `SEED_ALLOW_DEMO=1` (garde-fou). Un client forké pose `SANITY_STUDIO_PROJECT_ID` vers son
> propre project avant de seeder. Voir `docs/FORK-CLIENT.md`.

## Variables d'environnement

Copier `.env.example` en `.env` (Nuxt charge `.env` par défaut). Sur la démo, **aucune
variable n'est strictement requise**: la connexion Sanity vit en constantes de code.

La seule variable **par environnement** est `NUXT_PUBLIC_SITE_URL` (URL canonique:
`site.url` + `i18n.baseUrl`, donc canonical, hreflang, og:image absolu, sitemap). Sur
Cloudflare, elle est posée par Worker. Détail et bloc d'exemple dans `.env.example`.

Preview (édition visuelle Sanity) et formulaire de contact réel ont leurs propres variables,
toutes documentées dans `.env.example`.

## Sanity

Le contenu vit **dans Sanity** (project « WebForge - Ancrée », id `5if00rwn`, org
Patoine Studio), pas dans le code. La connexion (`projectId`/`dataset`/`apiVersion`) est en
**constantes de code** (`nuxt.config.ts`), avec override env optionnel: aucune variable
Sanity n'est requise, mais un **accès réseau à Sanity est obligatoire** pour `dev`, `build`,
`generate` et le `postinstall` (la config fetch les slugs des routes au chargement, et le
plugin de contenu fetch le graphe par langue).

- Schémas (la référence à amender d'abord): `docs/SANITY-SCHEMA-SPEC.md`.
- Convention d'organisation à deux régimes (interne PS vs vrai client): `CONVENTIONS-CONTRACT.md` §17.
- **Posture commerciale:** Sanity et i18n ne sont PAS mentionnés au client en paliers 1 et 2
  (outils internes PS); l'argument Sanity ne sort qu'à la bascule en palier 3 Builder.

## i18n

Bilingue, stratégie `prefix_except_default`: **FR à la racine**, **EN sous `/en`**. Les
segments d'URL traduits (`/about`, `/projects`, `/terms-of-use`, ...) viennent du route-map
(`app/config/route-map.ts`, source unique partagée app + Studio); les slugs de contenu sont
traduits par document. Strings d'interface (a11y + chrome produit générique) dans
`i18n/locales/{fr,en}.json`.

## Déploiement

Cloudflare **Workers** (PAS Pages), intégration Git native, **un Worker par environnement**,
chacun sur un domaine custom `patoinestudio.ca` (workers.dev coupé, tout `noindex`):

- **prod**: Worker `webforge-ancree`, branche `main`, statique pur (`nuxt generate`).
- **staging**: Worker `webforge-ancree-staging`, branche `staging`, même config statique.
- **preview**: Worker `webforge-ancree-preview`, branche `preview`, **SSR** (édition
  visuelle Sanity, `wrangler.preview.jsonc`).

Un webhook Sanity (publish) déclenche un Deploy Hook qui rebuild la prod (branche `main`).
Marche complète, variables par Worker, Access et webhook dans `docs/DEPLOY-CLOUDFLARE.md`.

## Architecture et disciplines de code

L'app est un projet Nuxt 4 unique (TypeScript strict), statique généré. Trois disciplines
non négociables (détail et API dans `docs/CONVENTIONS-CONTRACT.md`):

1. **Aucune valeur design en dur**: tout par tokens CSS (`var(--...)`) ou props. Les valeurs
   vivent dans les fichiers de tokens de famille/marque, jamais dans un composant.
2. **Aucun texte d'interface en dur**: accessibilité et chrome produit générique via i18n.
3. **Aucun contenu en dur**: le contenu vit dans Sanity, lu au build.

## Forker vers un vrai site client

Marche ordonnée (Sanity, connexion code, env, déploiement, branding, contenu, indexation,
licence), avec les pièges sans porte de sortie env: `docs/FORK-CLIENT.md`.

## Conventions

- **Commits** conventionnels (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`), petits et
  atomiques, scope optionnel (`feat(blog):`).
- **Typographie** (docs, READMEs, commits): aucun tiret cadratin, aucun middle dot comme
  séparateur, français québécois soutenu.
- Avant tout commit: vérifier les trois disciplines (aucune valeur design, aucun texte d'UI,
  aucun contenu en dur dans les composants).

## Documentation

- `CLAUDE.md`: contexte permanent du repo, à lire en premier.
- `ROADMAP.md`: chantiers V1 et V2 restants.
- `docs/CONVENTIONS-CONTRACT.md`: tokens, grille, typo, anatomie des blocs, primitives, disciplines.
- `docs/SANITY-SCHEMA-SPEC.md`: la référence des schémas Sanity (à amender d'abord).
- `docs/DEPLOY-CLOUDFLARE.md`: déploiement, 3 Workers, webhook, Access.
- `docs/FORK-CLIENT.md`: copier le gabarit vers un vrai client.
- `reference/webforge/`: bundle de design Claude Design (référence visuelle, lecture seule).
