# Réorganisation du projet en coquilles de sites — design

**Date:** 2026-05-31
**Projet:** `apps/webforge-minimaliste-demo`
**Type:** migration de structure (arborescence + routing), non destructive du rendu

## Contexte

Le repo `webforge` est une librairie de projets. Chaque projet (ex.
`webforge-minimaliste-demo`) est isolé dans `apps/`. À l'intérieur d'un projet
vivent plusieurs **types de site** (one-pager, multipage) qui partagent les
mêmes blocs, plus l'outillage dev. La racine du repo pourra devenir un index de
la librairie plus tard (hors scope).

Aujourd'hui l'organisation interne est hétéroclite: le one-pager à `/one-pager`,
un placeholder multipage à `/`, l'outil dev sous `/webforge-minimaliste-demo/…`
(préfixe redondant avec le nom de l'app), le héros encore dans le page-builder.

## Objectif de cette session

Poser la structure en **coquilles symétriques** + sortir le héros du
page-builder. Aucune création de contenu multipage, aucune couche queries.

### Dans le scope
- Coquilles `one-pager/`, `multipage/`, `dev/` dans `pages/`.
- Héros déplacé de `components/page-builder/regular/block/hero.vue` vers
  `components/hero/home.vue`, retiré du dispatch page-builder.
- Légal (`conditions-utilisation`, `politique-confidentialite`) reste partagé à
  la racine du projet.
- Aplatir la couche famille: `families/minimaliste/` → `family/` (pas de
  re-nommage redondant dans le contexte déjà nommé).
- Mise à jour de toutes les références de routes.

### Hors scope (déféré)
- **Couche `queries/` / architecture Sanity.** `useOnePagerBlocks` reste tel
  quel. La bonne façon Sanity sera étudiée plus tard à partir du projet test.
- **Contenu des pages multipage** (Services, À propos, Contact): on ne crée que
  l'accueil multipage minimal comme coquille; le reste viendra en session dédiée.
- Index de la librairie à la racine du repo.
- Renommage des blocs (évoqué, pas tranché).

## Structure cible

```
apps/webforge-minimaliste-demo/app/
├── pages/
│   ├── index.vue                    →  /                accueil projet (liens vers sites + dev)
│   ├── one-pager/
│   │   └── index.vue                →  /one-pager       (layout landing)
│   ├── multipage/
│   │   └── index.vue                →  /multipage       accueil multipage (layout default)
│   ├── conditions-utilisation.vue   →  /conditions-utilisation     (légal partagé)
│   ├── politique-confidentialite.vue→  /politique-confidentialite  (légal partagé)
│   └── dev/
│       ├── styleguide.vue           →  /dev/styleguide
│       └── blocs/
│           ├── heros.vue            →  /dev/blocs/heros
│           ├── reguliers.vue        →  /dev/blocs/reguliers
│           └── articles.vue         →  /dev/blocs/articles
│
├── brand/
│   └── tokens.css                   (couche marque — déjà sans sous-dossier nommé)
├── family/                          ← était families/minimaliste/
│   └── tokens.css                   (couche famille — repli, plus de nom redondant)
│
├── components/
│   ├── hero/
│   │   └── home.vue                 ← ancien page-builder/regular/block/hero.vue
│   └── page-builder/
│       ├── regular/                 ← blocs partagés (about, services, témoignages, faq, contact)
│       └── article/
```

### Principes
1. **Coquilles symétriques.** `one-pager/` et `multipage/` sont deux types de
   site côte à côte, chacun avec sa coquille. Pas de hiérarchie.
2. **Blocs partagés.** `page-builder/regular/` sert les deux types de site.
3. **Dev hors préfixe redondant.** `/dev/…` au lieu de `/webforge-minimaliste-demo/…`.
4. **Héros = composant par type de page**, pas un bloc modulaire.
5. **Pas de re-catégorisation par nom dans le contexte nommé.** On est déjà dans
   `webforge-minimaliste-demo`: inutile de répéter « minimaliste » dans les
   sous-dossiers. La couche famille s'aplatit en `family/`, par parallélisme
   avec `brand/` (déjà sans nom). Idem côté pages: dev sous `/dev`, pas
   `/webforge-minimaliste-demo`.

## Plan de migration (ordre d'exécution)

### Étape 1 — Sortir le héros du page-builder
- Déplacer `components/page-builder/regular/block/hero.vue` →
  `components/hero/home.vue` (l'auto-import le nommera `<HeroHome>`).
- `block-map.ts` (regular): retirer l'entrée `hero` et son import.
- `useOnePagerBlocks.ts`: retirer le bloc `hero` du tableau (le hero ne sera
  plus dispatché par l'orchestrateur).
- `one-pager/index.vue`: rendre `<HeroHome>` explicitement AVANT le
  `<PageBuilder>` (le hero coiffe la page, le builder rend le reste).
- `types/blocks.ts`: retirer `HeroBlock` de l'union `PageBlock` et sa
  définition. `HeroContent` reste (consommé par le composant hero).
- `useBlockCatalog.ts`: la catégorie `heros` pointe désormais vers
  `components/hero/home.vue` (import direct) au lieu de `regularBlockMap.hero`.
- **Vérif scrollspy:** le hero garde `id="top"`. Le Header observe
  `section[id]`; le hero reste une `<section id="top">`, donc le scrollspy
  continue de fonctionner (le hero n'est jamais une cible nav active, cf.
  `noNavSectionActive`). Aucun changement Header attendu.

### Étape 2 — Coquille one-pager
- Créer `pages/one-pager/index.vue` (contenu de l'actuel `pages/one-pager.vue`
  + rendu explicite du `<HeroHome>`).
- Supprimer `pages/one-pager.vue`.
- Route inchangée: `/one-pager` (dossier + index.vue = même URL).

### Étape 3 — Coquille multipage
- Créer `pages/multipage/index.vue`: accueil multipage minimal, layout
  `default`. Coquille seulement (titre + note « multipage à venir »), pas de
  vrais blocs arrangés. Réutilise le Header en mode multipage.
- (Le placeholder actuel de `pages/index.vue` est recyclé pour l'accueil projet,
  cf. étape 5.)

### Étape 4 — Déplacer le dev sous /dev
- `pages/webforge-minimaliste-demo/styleguide.vue` → `pages/dev/styleguide.vue`.
- `pages/webforge-minimaliste-demo/blocs/*` → `pages/dev/blocs/*`.
- Supprimer le dossier `pages/webforge-minimaliste-demo/`.
- `dev-tabs.vue`: `base` passe de `/webforge-minimaliste-demo` à `/dev`.
- **Note gating:** les pages dev gardent leur garde `if (!import.meta.dev)
  throw createError(404)`. Le commentaire « 404 en prod » reste valide.

### Étape 5 — Aplatir la couche famille (families/minimaliste/ → family/)
- Déplacer `app/families/minimaliste/tokens.css` → `app/family/tokens.css`.
- Supprimer le dossier `app/families/`.
- `nuxt.config.ts:72`: `'~/families/minimaliste/tokens.css'` → `'~/family/tokens.css'`.
- Rafraîchir les commentaires qui mentionnent l'ancien chemin (références, pas
  des imports): `app/brand/tokens.css`, `components/styleguide/tokens.vue`,
  `assets/css/global.css` (2 occurrences).
- **Note extraction package:** le repli ne casse pas la migration future vers
  `packages/webforge-minimaliste/`. On copiera `app/family/tokens.css` vers le
  package; le nom du dossier dans l'app n'a pas à matcher le nom du package
  (déjà vrai pour `brand/`). À refléter dans CLAUDE.md.
- Mettre à jour CLAUDE.md: les deux mentions de
  `app/families/minimaliste/tokens.css` → `app/family/tokens.css`.

### Étape 6 — Accueil projet
- `pages/index.vue`: remplacer le placeholder « multipage à venir » par un
  accueil de projet qui liste les deux sites (`/one-pager`, `/multipage`) et un
  lien vers l'outil dev (`/dev/styleguide`). Style sobre, réutilise les classes
  placeholder existantes ou un layout simple.

### Étape 7 — Mettre à jour les références de routes
- `components/styleguide/atoms.vue:179`: `LinkInternal to="/one-pager"` reste
  valide (route inchangée). Vérifier seulement.
- Tout lien `to="/webforge-minimaliste-demo/…"` → `/dev/…`.
- `nuxt.config.ts`: `prerender.routes: ['/']` — vérifier que le crawl atteint
  les nouvelles routes (crawlLinks suit les NuxtLink; les pages dev sont 404 en
  prod donc non prérendues, attendu).

### Étape 8 — Vérification live (Chrome MCP)
- `/one-pager`: hero + blocs rendus, scrollspy OK, aucune régression.
- `/multipage`: coquille s'affiche.
- `/`: accueil projet liste les sites.
- `/dev/styleguide`, `/dev/blocs/reguliers`: onglets pointent vers `/dev/…`,
  vitrine OK.
- Console serveur propre (pas de warning de route non matchée).

## Risques et points d'attention
- **Imports cassés** après déplacement du hero: le grep de migration doit être
  exhaustif (3 consommateurs connus: `useOnePagerBlocks`, `useBlockCatalog`,
  `block-map`, `types/blocks`).
- **Dev server à redémarrer** après déplacement de pages (les routes Nuxt sont
  régénérées au changement de structure `pages/`).
- **Auto-import du hero:** `components/hero/home.vue` → `<HeroHome>` (pathPrefix
  false sur `~/components`). Vérifier qu'aucune collision de nom n'existe.
- Migration faite par petits commits atomiques pour faciliter le rollback.

## Critères de succès
- Les routes reflètent les coquilles: `/one-pager`, `/multipage`, `/dev/*`.
- Le héros vit dans `components/hero/`, n'est plus un bloc page-builder.
- Le one-pager rend exactement comme avant (zéro régression visuelle).
- La vitrine dev fonctionne sous `/dev/*`.
- Console propre.
