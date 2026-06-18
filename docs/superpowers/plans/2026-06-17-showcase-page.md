# Page Showcase (chantier B) — plan d'implémentation

> **Pour les workers agentiques :** SOUS-SKILL REQUISE : `superpowers:subagent-driven-development` (recommandé) ou `superpowers:executing-plans` pour exécuter ce plan tâche par tâche. Les étapes utilisent des cases `- [ ]`.

**Goal :** Transformer l'outil dev `/dev/*` en **une seule page client-facing `/showcase`** (bilingue fr/en, noindex, hors navigation, prérendue), pilotée 100 % par le code : 5 sections (héros, blocs réguliers, blocs d'article, formulaire, système visuel) rendues via les block-maps existantes, barre latérale `SgNav` + badges `_type` + onglets de variantes conservés. Suppression complète du sous-système `/dev` interne (stack/versions + liens d'environnements retirés).

**Architecture :** On **réutilise la machinerie de vitrine existante** (`useBlockCatalog` → 3 catégories, `BlockShowcase`/`BlockShowcaseItem` avec badges + onglets, `SgNav` slot + scroll-spy, composants styleguide) et on la **compose dans une page unique**. La page devient une **vraie route** (entrée dans `app/config/route-map.ts` → customRoutes i18n + prérendu auto des deux locales), sans le `throw 404 import.meta.dev`, marquée `noindex` par `usePageSeo`. Le contenu des blocs est **déjà bilingue** (payload Sanity scopé par locale) ; on rend bilingues le **chrome** (i18n `showcase.*`), les **6 samples** de blocs et la **section héros** (locale propagée). La section styleguide est **allégée** (prose interne PS retirée) puis bilingue.

**Tech stack :** Nuxt 4, Vue 3 (`<script setup>` TS strict), `@nuxtjs/i18n` (customRoutes via route-map), `@nuxtjs/seo` (`usePageSeo`), payload Sanity (composables terminaux), aucun framework de test. Vérification = `vue-tsc` (0 erreur) + `nuxt generate` vert (prérendu de `/showcase` ET `/en/showcase`) + lecture du HTML généré. **QA de rendu via `nuxt generate`** (le dev server :3000 de Charles sert un AUTRE projet ; pas de curl localhost à moins que Charles rebranche son serveur, auquel cas le MCP `Claude_Preview` sert).

**Décisions tranchées par Charles (17 juin 2026) :**
1. **Page unique** scrollable (5 sections + 1 barre latérale `SgNav`), pas de structure multi-route.
2. **Retirer entièrement** le sous-système `/dev` interne (stack/versions + page « sites » supprimées ; la stack vit dans `package.json`, les environnements dans `docs/DEPLOY-CLOUDFLARE.md`). Aucune page interne gated ne subsiste.
3. **Bilingue curaté fr/en** : `/showcase` + `/en/showcase`, route-map, prérendu des deux, chrome + samples fr/en.
4. **Styleguide allégé + bilingue** : on **retire la prose interne PS** (chemins de fichiers, « Tier X », rationale CSS) et on garde des libellés/légendes **courts et bilingues** sur les spécimens visuels (~30-40 chaînes au lieu de ~158). Aligné sur l'esprit B.4 (pas de documentation verbeuse par bloc).

**Conventions non négociables :** tokens (aucune valeur design en dur), i18n (aucun texte UI/chrome en dur), contenu Sanity, classes typo `wf-*`, CSS Grid, `.vue` = script/template/style. **Imports RELATIFS** dans la fermeture de `nuxt.config.ts` (`config/route-map.ts`, etc.) — pas d'alias `~`.

---

## Carte des fichiers

**Créés :**
- `app/pages/showcase/index.vue` — la page unique (SgNav 5 sections + intro + rendu des catégories/SgForms/styleguide).
- `app/layouts/showcase.vue` — coquille minimale client-facing (`.wf-site` = conteneur `site` + skip link, sans Header/Footer/nav).

**Modifiés :**
- `app/config/route-map.ts` — ajout de l'entrée `showcase` dans `ROUTES` (auto-câble customRoutes i18n + `PRERENDER_ROUTES`).
- `i18n/locales/fr.json`, `i18n/locales/en.json` — namespace `showcase.*` (chrome, samples, styleguide).
- `nuxt.config.ts` — `sitemap.exclude`/`robots`/`prerender.ignore` : retirer `/dev`, ajouter `/showcase` ; commentaire `components.ignore`.
- `app/composables/useBlockCatalog.ts` — locale-aware (`useWfLocale` + `useI18n`), samples via builders i18n, héros sans chaîne FR en dur.
- `app/content/{media-text,cta-band,projects-preview,blog-preview,iframe,video-youtube}.ts` — chaque `*_SAMPLE` const devient un builder `*Sample(t)` (texte via i18n, scaffolding technique inline).
- `app/components/styleguide/{typography,tokens,atoms,forms}.vue` — allégés (prose interne retirée) + bilingues (i18n `showcase.styleguide.*`).
- Commentaires résiduels `/dev` dans les fichiers touchés (`useBlockCatalog.ts:127`, `hero/block-map.ts:2`, `Image.vue:71`, `form-success/index.vue:19`, `app.vue:5`) → mettre à jour vers `/showcase` au passage (cosmétique).

**Supprimés :**
- `app/pages/dev/` (les 7 fichiers : `index.vue`, `styleguide.vue`, `formulaire.vue`, `sites.vue`, `blocs/{reguliers,articles,heros}.vue`).
- `app/layouts/dev.vue`.
- `app/components/styleguide/dev-tabs.vue`.
- `app/composables/useProjectStack.ts` (utilisé uniquement par `dev/index.vue`).

---

## Phase 1 — Page /showcase en place (ungated, chrome bilingue, prérendue)

À la fin de la phase : `/showcase` et `/en/showcase` existent comme vraies pages prérendues, chrome bilingue, contenu des blocs bilingue (payload). `/dev` coexiste encore (supprimé en Phase 2). Samples et styleguide restent FR-only (Phases 3-4).

### Task 1 : Entrée `showcase` dans le route-map

**Files :**
- Modify : `app/config/route-map.ts`

- [ ] **Step 1 : Ajouter l'entrée `showcase` à `ROUTES`** — après l'entrée `privacy` (avant la fermeture `} as const satisfies ...`, ligne ~106). Pas de `parent` (page autonome, aucun fil d'Ariane rendu) :

```typescript
  privacy: {
    path: { fr: '/politique-confidentialite', en: '/privacy-policy' },
    label: { fr: 'Politique de confidentialité', en: 'Privacy Policy' },
    parent: 'home',
    pageName: 'politique-confidentialite'
  },
  // Page Showcase (chantier B): vraie route client-facing, noindex, hors nav
  // principale (la nav vit dans siteSettings.nav, pas ici). Présente dans ROUTES
  // pour câbler automatiquement les customRoutes i18n (buildI18nPages) et le
  // prérendu des deux locales (staticPagePaths -> PRERENDER_ROUTES). URL
  // identique fr/en (/showcase et /en/showcase). Pas de parent: aucun fil
  // d'Ariane n'est rendu pour elle (label vestigial, requis par le type).
  showcase: {
    path: { fr: '/showcase', en: '/showcase' },
    label: { fr: 'Showcase', en: 'Showcase' },
    pageName: 'showcase/index'
  }
```

- [ ] **Step 2 : Vérifier qu'aucun consommateur ne casse** — `buildI18nPages()` itère `ROUTES` (pageName non null) → ajoute `showcase/index: { fr:'/showcase', en:'/showcase' }`. `staticPagePaths(locale)` itère `Object.keys(ROUTES)` → ajoute `/showcase` (fr) et `/en/showcase` (en) au prérendu. `DOC_ROUTES`/`buildStudioMainDocuments` n'itèrent PAS `ROUTES` (pas d'impact Studio). Lire mentalement ces trois builders pour confirmer. Aucune autre modification requise dans ce fichier.

- [ ] **Step 3 : Typecheck** — `export PATH="$HOME/.nvm/versions/node/v24.16.0/bin:$PATH"; yarn dlx -q -p typescript -p vue-tsc vue-tsc --noEmit -p .nuxt/tsconfig.json` → 0 erreur. (Si `.nuxt/tsconfig.json` absent : `yarn nuxi prepare` d'abord, avec le même PATH.)

- [ ] **Step 4 : Commit** — `git add app/config/route-map.ts && git commit -m "feat(showcase): route /showcase bilingue dans le route-map (customRoutes + prérendu auto)"`

### Task 2 : Chrome i18n `showcase.*` (SEO, intro, nav, sections)

**Files :**
- Modify : `i18n/locales/fr.json`, `i18n/locales/en.json`

- [ ] **Step 1 : Ajouter le namespace `showcase` à `fr.json`** — au niveau racine (à côté de `a11y`, `ui`, `consent`). Valeurs FR exactes :

```json
"showcase": {
  "seo": {
    "title": "Guide des composants",
    "description": "Tout ce qu'un site WebForge multipage comprend : héros, blocs de page, blocs d'article, formulaire et système visuel. Rendu en direct, depuis le contenu réel."
  },
  "intro": {
    "eyebrow": "WebForge Multipage",
    "title": "Guide des composants",
    "lead": "Tout ce qu'un site WebForge multipage comprend : héros, blocs de page, blocs d'article, formulaire et système visuel. Rendu en direct, depuis le contenu réel."
  },
  "nav": {
    "heros": "Héros",
    "reguliers": "Blocs de page",
    "articles": "Blocs d'article",
    "formulaire": "Formulaire",
    "styleguide": "Système visuel"
  },
  "sections": {
    "heros": "Le bandeau d'ouverture, imposé par type de page.",
    "reguliers": "Les blocs modulaires du constructeur de page.",
    "articles": "Les blocs de corps d'article.",
    "formulaire": "Champs, contrôles et états de formulaire.",
    "styleguide": "Typographie, couleurs, tokens et atomes."
  }
}
```

- [ ] **Step 2 : Ajouter le namespace `showcase` à `en.json`** — mêmes clés, valeurs EN :

```json
"showcase": {
  "seo": {
    "title": "Component guide",
    "description": "Everything a WebForge multipage site includes: heroes, page blocks, article blocks, form, and visual system. Rendered live from the real content."
  },
  "intro": {
    "eyebrow": "WebForge Multipage",
    "title": "Component guide",
    "lead": "Everything a WebForge multipage site includes: heroes, page blocks, article blocks, form, and visual system. Rendered live from the real content."
  },
  "nav": {
    "heros": "Heroes",
    "reguliers": "Page blocks",
    "articles": "Article blocks",
    "formulaire": "Form",
    "styleguide": "Visual system"
  },
  "sections": {
    "heros": "The opening banner, set by page type.",
    "reguliers": "The modular blocks of the page builder.",
    "articles": "The article body blocks.",
    "formulaire": "Form fields, controls and states.",
    "styleguide": "Typography, colours, tokens and atoms."
  }
}
```

- [ ] **Step 3 : Valider le JSON** — les deux fichiers parsent (pas de virgule pendante ni de clé dupliquée). `export PATH="$HOME/.nvm/versions/node/v24.16.0/bin:$PATH"; node -e "JSON.parse(require('fs').readFileSync('i18n/locales/fr.json','utf8')); JSON.parse(require('fs').readFileSync('i18n/locales/en.json','utf8')); console.log('JSON OK')"`

- [ ] **Step 4 : Commit** — `git add i18n/locales/fr.json i18n/locales/en.json && git commit -m "feat(showcase): chrome i18n showcase.* (seo, intro, nav, sections) fr+en"`

### Task 3 : Layout `showcase.vue`

**Files :**
- Create : `app/layouts/showcase.vue`

- [ ] **Step 1 : Écrire le layout** — coquille minimale client-facing. `.wf-site` établit le conteneur nommé `site` (via global.css ligne ~132) requis par `SgNav` et les blocs ; skip link ; pas de Header/Footer/Consent (page hors site). Pas de `<style>` (classes globales) :

```vue
<script setup lang="ts">
/* Coquille de la page /showcase (client-facing, hors site). Fournit le conteneur
 * nommé `site` (via .wf-site, global.css) dont dépendent SgNav et les blocs
 * (container queries), plus le skip link. Pas de Header/Footer/nav: la page n'est
 * pas une page du site, c'est le guide des composants WebForge. */
const { t } = useI18n()
</script>

<template>
  <div class="wf-site">
    <a :href="'#main'" class="wf-skip">{{ t('a11y.skip_to_content') }}</a>
    <main id="main">
      <slot />
    </main>
  </div>
</template>
```

- [ ] **Step 2 : Typecheck** → 0 erreur.
- [ ] **Step 3 : Commit** — `git add app/layouts/showcase.vue && git commit -m "feat(showcase): layout showcase (conteneur site + skip link, sans chrome de site)"`

### Task 4 : Page `showcase/index.vue` (5 sections, chrome bilingue)

**Files :**
- Create : `app/pages/showcase/index.vue`

Contexte : `useBlockCatalog()` retourne 3 catégories (`heros`, `reguliers`, `articles`). `BlockShowcase` prend `:category` et rend chaque bloc via `BlockShowcaseItem` (badges + onglets). `SgNav` prend `:items="{id,label}[]"` + `label`, rend la barre latérale sticky + scroll-spy et enveloppe le contenu (slot). Les composants styleguide (`SgForms`, `SgTypography`, `SgTokens`, `SgAtoms`) sont importés explicitement (auto-import désactivé pour `styleguide/`).

- [ ] **Step 1 : Écrire la page** — PAS de `throw 404 import.meta.dev` (vraie page). `usePageSeo` `noindex: true`. SgNav avec 5 entrées de SECTION (pas une par bloc). Intro visible + 5 `<section :id>` correspondant aux entrées :

```vue
<script setup lang="ts">
/* /showcase — guide client-facing de tout ce qu'un site WebForge multipage
 * comprend (héros, blocs réguliers, blocs d'article, formulaire, système visuel).
 * Page unique pilotée par le code: les sections se remplissent depuis les
 * block-maps via useBlockCatalog (ajouter un bloc = il apparaît tout seul).
 * Vraie route (route-map), noindex, hors navigation principale. Bilingue. */
import SgNav from '~/components/styleguide/nav.vue'
import BlockShowcase from '~/components/styleguide/block-showcase.vue'
import SgForms from '~/components/styleguide/forms.vue'
import SgTypography from '~/components/styleguide/typography.vue'
import SgTokens from '~/components/styleguide/tokens.vue'
import SgAtoms from '~/components/styleguide/atoms.vue'

const { t } = useI18n()

definePageMeta({ layout: 'showcase' })

usePageSeo({
  title: t('showcase.seo.title'),
  description: t('showcase.seo.description'),
  titleTemplate: '%s, WebForge Minimaliste',
  noindex: true
})

const catalog = useBlockCatalog()
const heros = catalog.find((c) => c.id === 'heros')!
const reguliers = catalog.find((c) => c.id === 'reguliers')!
const articles = catalog.find((c) => c.id === 'articles')!

// Les 5 sections de la barre latérale (scroll-spy sur ces ids).
const sections = [
  { id: 'heros', label: t('showcase.nav.heros') },
  { id: 'reguliers', label: t('showcase.nav.reguliers') },
  { id: 'articles', label: t('showcase.nav.articles') },
  { id: 'formulaire', label: t('showcase.nav.formulaire') },
  { id: 'styleguide', label: t('showcase.nav.styleguide') }
]
</script>

<template>
  <SgNav :items="sections" :label="t('showcase.intro.title')">
    <div class="wf-showcase">
      <header class="wf-container wf-showcase__intro">
        <p class="wf-showcase__eyebrow">{{ t('showcase.intro.eyebrow') }}</p>
        <h1 class="wf-h2 wf-showcase__title">{{ t('showcase.intro.title') }}</h1>
        <p class="wf-body-1 wf-showcase__lead">{{ t('showcase.intro.lead') }}</p>
      </header>

      <section id="heros" class="wf-showcase__section">
        <div class="wf-container wf-showcase__section-head">
          <h2 class="wf-h3 wf-showcase__section-title">{{ t('showcase.nav.heros') }}</h2>
          <p class="wf-caption-1 wf-showcase__section-sub">{{ t('showcase.sections.heros') }}</p>
        </div>
        <BlockShowcase :category="heros" />
      </section>

      <section id="reguliers" class="wf-showcase__section">
        <div class="wf-container wf-showcase__section-head">
          <h2 class="wf-h3 wf-showcase__section-title">{{ t('showcase.nav.reguliers') }}</h2>
          <p class="wf-caption-1 wf-showcase__section-sub">{{ t('showcase.sections.reguliers') }}</p>
        </div>
        <BlockShowcase :category="reguliers" />
      </section>

      <section id="articles" class="wf-showcase__section">
        <div class="wf-container wf-showcase__section-head">
          <h2 class="wf-h3 wf-showcase__section-title">{{ t('showcase.nav.articles') }}</h2>
          <p class="wf-caption-1 wf-showcase__section-sub">{{ t('showcase.sections.articles') }}</p>
        </div>
        <BlockShowcase :category="articles" />
      </section>

      <section id="formulaire" class="wf-showcase__section">
        <div class="wf-container wf-showcase__section-head">
          <h2 class="wf-h3 wf-showcase__section-title">{{ t('showcase.nav.formulaire') }}</h2>
          <p class="wf-caption-1 wf-showcase__section-sub">{{ t('showcase.sections.formulaire') }}</p>
        </div>
        <SgForms />
      </section>

      <section id="styleguide" class="wf-showcase__section">
        <div class="wf-container wf-showcase__section-head">
          <h2 class="wf-h3 wf-showcase__section-title">{{ t('showcase.nav.styleguide') }}</h2>
          <p class="wf-caption-1 wf-showcase__section-sub">{{ t('showcase.sections.styleguide') }}</p>
        </div>
        <SgTypography />
        <SgTokens />
        <SgAtoms />
      </section>
    </div>
  </SgNav>
</template>

<style scoped>
/* Rythme de la page showcase: intro + 5 sections séparées par un filet. Tokens
 * seulement (aucune valeur en dur). Le centrage/largeur vient de .wf-sg__sheet
 * (SgNav) et de .wf-container par section. */
.wf-showcase {
  padding-bottom: calc(var(--spacing-unit) * 8);
}
.wf-showcase__intro {
  padding-block: calc(var(--spacing-unit) * 4) calc(var(--spacing-unit) * 2);
}
.wf-showcase__eyebrow {
  font-family: var(--font-mono);
  font-size: 1.1rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  margin: 0 0 calc(var(--spacing-unit) * 1);
}
.wf-showcase__title {
  margin: 0 0 calc(var(--spacing-unit) * 1.5);
}
.wf-showcase__lead {
  max-width: 70ch;
  color: var(--text-muted);
  margin: 0;
}
.wf-showcase__section {
  padding-block: calc(var(--spacing-unit) * 5);
  border-top: var(--line-hair);
  scroll-margin-top: 2rem;
}
.wf-showcase__section-head {
  margin-bottom: calc(var(--spacing-unit) * 3);
}
.wf-showcase__section-title {
  margin: 0 0 calc(var(--spacing-unit) * 0.75);
}
.wf-showcase__section-sub {
  color: var(--text-muted);
  margin: 0;
}
</style>
```

(Note exécutant : confirmer que `wf-h2`/`wf-h3`/`wf-body-1`/`wf-caption-1` existent dans `typography.css` ; ce sont les classes typo standard du repo. `--line-hair`, `--spacing-unit`, `--font-mono`, `--text-muted` sont des tokens existants — vérifiables dans `family/tokens.css`/`brand/tokens.css`.)

- [ ] **Step 2 : Typecheck** → 0 erreur.

- [ ] **Step 3 : Rendu via `nuxt generate`** — `export PATH="$HOME/.nvm/versions/node/v24.16.0/bin:$PATH"; yarn generate` → build vert. Vérifier que `.output/public/showcase/index.html` ET `.output/public/en/showcase/index.html` existent. `grep -l 'wf-showcase__section' .output/public/showcase/index.html .output/public/en/showcase/index.html` → les deux présents. Vérifier dans le HTML FR : 5 sections, l'intro, et que les blocs rendent (chercher `wf-bs__bar`, `wf-hero`). Vérifier dans le HTML EN : le chrome est en anglais (`Heroes`, `Page blocks`, `Component guide`), le contenu des blocs en anglais (payload EN). 0 erreur SSR à la génération.

- [ ] **Step 4 : Commit** — `git add app/pages/showcase/index.vue && git commit -m "feat(showcase): page unique (5 sections + SgNav), chrome bilingue, ungated + prérendue"`

---

## Phase 2 — Suppression complète de `/dev`

À la fin de la phase : `/dev/*`, le layout dev, DevTabs et `useProjectStack` n'existent plus ; `nuxt.config` référence `/showcase` (noindex/sitemap) et plus `/dev`.

### Task 5 : Supprimer la surface `/dev`

**Files :**
- Delete : `app/pages/dev/` (7 fichiers), `app/layouts/dev.vue`, `app/components/styleguide/dev-tabs.vue`, `app/composables/useProjectStack.ts`

- [ ] **Step 1 : Confirmer l'absence de référence vivante** — `grep -rn "useProjectStack\|dev-tabs\|DevTabs\|layout: 'dev'\|layout: \"dev\"" app/` → après suppression il ne doit rester AUCUN usage (les seuls usages actuels sont dans les fichiers supprimés). `grep -rn "to=\"/dev\|to='/dev\|/dev/styleguide\|/dev/blocs\|/dev/formulaire" app/` → aucun lien `NuxtLink` vivant vers `/dev` (vérifié au plan : seulement des commentaires).

- [ ] **Step 2 : Supprimer les fichiers** :
```bash
git rm -r app/pages/dev
git rm app/layouts/dev.vue app/components/styleguide/dev-tabs.vue app/composables/useProjectStack.ts
```

- [ ] **Step 3 : Typecheck** → 0 erreur (aucun import orphelin vers les fichiers supprimés). Si une erreur signale un import résiduel, le corriger (il ne devrait pas y en avoir).

- [ ] **Step 4 : Commit** — `git add -A && git commit -m "refactor(showcase): supprime le sous-système /dev (pages, layout, DevTabs, useProjectStack)"`

### Task 6 : `nuxt.config` — `/showcase` au lieu de `/dev` + commentaires

**Files :**
- Modify : `nuxt.config.ts`

- [ ] **Step 1 : `sitemap.exclude`** (ligne ~503-505) — retirer `/dev/**` et `/en/dev/**`, ajouter `/showcase` et `/en/showcase` (la page est noindex et hors sitemap, comme le one-pager) :

```typescript
  sitemap: {
    exclude: ['/showcase', '/en/showcase', '/one-pager/**', '/en/one-pager/**']
  },
```

- [ ] **Step 2 : `robots`** (ligne ~506-508) — `/dev` n'existe plus ; `/showcase` suit le pattern du one-pager (PAS de disallow, pour que le crawler voie le `noindex` plutôt que d'être bloqué). Le démo entier est déjà `indexable: false` (couvre le blocage global). Retirer le bloc `robots` :

```typescript
  // (bloc robots supprimé: plus de /dev à bloquer; /showcase et /one-pager sont
  // noindex au niveau page + exclus du sitemap, comme le veut le pattern « voir
  // le noindex plutôt que bloquer le crawl ». Le démo entier reste non indexable
  // via site.indexable:false.)
```

- [ ] **Step 3 : `prerender.ignore`** (ligne ~573) — retirer `/dev` et `/en/dev`, garder `/en/sitemap.xml`. `/showcase` n'est PAS ignoré (on le prérend via `PRERENDER_ROUTES`) :

```typescript
      ignore: ['/en/sitemap.xml']
```

Mettre à jour le commentaire au-dessus (lignes ~554-573) pour retirer les explications `/dev` devenues caduques (garder l'explication `/en/sitemap.xml`).

- [ ] **Step 4 : Commentaires** — (a) bloc de commentaire au-dessus de `sitemap` (lignes ~493-502) : remplacer la justification `/dev/**` par `/showcase` (vraie page noindex hors nav). (b) `components` (ligne ~417) : le commentaire mentionne « importé explicitement par `pages/styleguide.vue` » — corriger en « importé explicitement par `pages/showcase/index.vue` ». L'`ignore: ['**/styleguide/**']` RESTE (les composants styleguide sont importés explicitement par la page showcase).

- [ ] **Step 5 : Rendu via `nuxt generate`** — `export PATH="$HOME/.nvm/versions/node/v24.16.0/bin:$PATH"; yarn generate` → vert. Confirmer : `/showcase` et `/en/showcase` prérendues (présentes dans `.output/public/`), `/dev` absent, build sans 404 résiduelle.

- [ ] **Step 6 : Commit** — `git add nuxt.config.ts && git commit -m "chore(showcase): nuxt.config cible /showcase (sitemap/prerender), retire /dev"`

---

## Phase 3 — Samples bilingues + catalogue locale-aware

À la fin de la phase : la section « Blocs de page » (6 samples) et la section « Héros » rendent correctement en EN sur `/en/showcase`.

### Task 7 : Convertir les 4 `*_SAMPLE` restants en builders i18n

> **Déviation Phase 1 (commit `5114729`)** : `projects-preview` et `blog-preview` ne sont PLUS des samples. La vitrine les rend depuis le payload RÉEL (`pickBlock(homeBlocks, ...)`, comme about/services/testimonials), donc déjà bilingues (payload scopé par locale) et avec des liens valides vers des pages prérendues. Forcé par le crawler de prérendu (les slugs de détail bidon des samples faisaient 404 et cassaient `nuxt generate`). Les consts `PROJECTS_PREVIEW_SAMPLE`/`BLOG_PREVIEW_SAMPLE` ont été supprimées. Il ne reste donc que **4 samples** à convertir.

**Files :**
- Modify : `app/content/media-text.ts`, `cta-band.ts`, `iframe.ts`, `video-youtube.ts`
- Modify : `i18n/locales/fr.json`, `i18n/locales/en.json` (sous-namespace `showcase.samples.*`)

Principe : le **texte** de chaque sample passe en i18n (`showcase.samples.<bloc>.*`), le **scaffolding technique** (ratio, src, href, `mediaSide`, `videoId`, `url`, `date`, `slug`) reste inline. Chaque `*_SAMPLE` const devient une **fonction builder** `<bloc>Sample(t)` qui prend la fonction de traduction. `useBlockCatalog` (Task 8) appellera ces builders.

- [ ] **Step 1 : `media-text.ts` (exemple complet de référence)** — remplacer la const `MEDIA_TEXT_SAMPLE` par :

```typescript
/** Fonction de traduction minimale (clé -> chaîne), compatible avec useI18n().t. */
type Tr = (key: string) => string

/** Échantillon de démonstration du bloc media-text pour la vitrine /showcase
 * (jamais consommé en production). Texte via i18n (showcase.samples.media_text.*),
 * scaffolding technique inline. */
export function mediaTextSample(t: Tr): MediaTextContent {
  return {
    heading: t('showcase.samples.media_text.heading'),
    body: [
      t('showcase.samples.media_text.body_1'),
      t('showcase.samples.media_text.body_2')
    ],
    mediaSide: 'right',
    image: {
      ratio: '4/5',
      src: '/images/about.jpg',
      alt: t('showcase.samples.media_text.image_alt'),
      label: t('showcase.samples.media_text.image_label'),
      caption: t('showcase.samples.media_text.image_caption')
    },
    cta: {
      label: t('showcase.samples.media_text.cta_label'),
      href: '/a-propos'
    }
  }
}
```

Et ajouter à `fr.json` sous `showcase`, clé `samples.media_text` (texte = valeurs ACTUELLES de la const) :
```json
"samples": {
  "media_text": {
    "heading": "Le bois choisi avant même le premier trait de crayon.",
    "body_1": "<corps 1 actuel de la const>",
    "body_2": "<corps 2 actuel de la const>",
    "image_alt": "<alt actuel>",
    "image_label": "Planches de frêne en attente de séchage",
    "image_caption": "Réserve de bois, atelier de Chambly, 4:5",
    "cta_label": "Voir comment je travaille"
  }
}
```
Et à `en.json` la traduction EN de chaque clé.

- [ ] **Step 2 : Appliquer le même pattern aux 5 autres** — `ctaBandSample(t)`, `projectsPreviewSample(t)`, `blogPreviewSample(t)`, `iframeSample(t)`, `videoYoutubeSample(t)`. Pour chacun : lire la const actuelle, déplacer les champs TEXTE listés ci-dessous vers `showcase.samples.<bloc>.*` (fr = valeur actuelle, en = traduction), garder le scaffolding technique inline. Champs texte par bloc :
  - `cta_band` : `title`, `subtitle`, `primaryCta.label`, `secondaryCta.label`.
  - `projects_preview` : `heading`, `lead`, pour chaque item `title`/`excerpt`/`service`/`cover.alt`/`cover.label`/`cover.caption`, `ctaLabel`. (Garder `slug`, `cover.ratio`, `cover.src`, `ctaHref` inline.)
  - `blog_preview` : `heading`, `lead`, pour chaque item `title`/`excerpt`/`category`/`cover.alt`/`cover.label`/`cover.caption`, `ctaLabel`. (Garder `href`, `date`, `cover.ratio`, `cover.src`, `ctaHref` inline.)
  - `iframe` : `title`, `caption`. (Garder `url`, `ratio`.)
  - `video_youtube` : `poster.alt`, `poster.label`, `poster.caption`, `title`. (Garder `videoId`, `posterMode`, `poster.ratio`, `poster.src`.)

  Pour les items en tableau (projects_preview, blog_preview), nommer les clés `item_1_title`, `item_1_excerpt`, … `item_3_caption` (1-indexé), et le builder reconstruit le tableau en lisant ces clés.

- [ ] **Step 3 : Valider le JSON** — `node -e "JSON.parse(require('fs').readFileSync('i18n/locales/fr.json','utf8')); JSON.parse(require('fs').readFileSync('i18n/locales/en.json','utf8')); console.log('OK')"` (PATH v24).

- [ ] **Step 4 : Typecheck** → 0 erreur. (Les builders ne sont pas encore consommés ; `useBlockCatalog` est mis à jour en Task 8. Si le typecheck remonte « `MEDIA_TEXT_SAMPLE` introuvable » depuis `useBlockCatalog`, c'est attendu — faire Task 8 avant le typecheck final, ou committer Task 7+8 ensemble.)

- [ ] **Step 5 : Commit** — `git add app/content i18n/locales && git commit -m "feat(showcase): samples de blocs en builders i18n (texte fr/en, scaffolding inline)"`

> **Revue Charles (EN)** : les traductions EN des samples (texte marketing fictif Atelier Cormier) sont à faire relire par Charles avant le merge final. Les regrouper pour la revue de Phase 5.

### Task 8 : `useBlockCatalog` locale-aware (samples + héros)

**Files :**
- Modify : `app/composables/useBlockCatalog.ts`

- [ ] **Step 1 : Injecter `t` et la locale** — en tête de `useBlockCatalog()` (après la ligne ~124) :

```typescript
export function useBlockCatalog(): CatalogCategory[] {
  const { t } = useI18n()
  const locale = useWfLocale()
  // ... (le reste suit)
```

- [ ] **Step 2 : Remplacer les imports/usages de `*_SAMPLE` par les builders** — remplacer les imports (lignes ~24-29) :

```typescript
import { mediaTextSample } from '~/content/media-text'
import { ctaBandSample } from '~/content/cta-band'
import { projectsPreviewSample } from '~/content/projects-preview'
import { blogPreviewSample } from '~/content/blog-preview'
import { iframeSample } from '~/content/iframe'
import { videoYoutubeSample } from '~/content/video-youtube'
```

Et dans les `props` des items concernés (lignes ~277, 283, 315, 321, 327, 333-343), remplacer les spreads `...MEDIA_TEXT_SAMPLE` par `...mediaTextSample(t)`, `...CTA_BAND_SAMPLE` par `...ctaBandSample(t)`, etc. Le `video-youtube` a deux variantes (youtube/custom) : appeler `videoYoutubeSample(t)` dans les deux et surcharger `posterMode` comme aujourd'hui.

- [ ] **Step 3 : Rendre la section héros locale-aware** — dans la catégorie `id: 'heros'` (lignes ~180-234), propager `locale` et retirer la chaîne FR en dur :
  - **Hero Page** (ligne ~197) : `breadcrumbs: breadcrumbsFor('services', undefined, locale)`.
  - **Hero Detail** (lignes ~204-210) : `breadcrumbs: breadcrumbsFor('projects', { label: sampleProject.title }, locale)`. Pour `eyebrow: 'Projet'` (ligne ~206) : **lire `app/components/hero/block/detail.vue`** — d'après le chantier A ses props sont `HeroDetailBlock & { breadcrumbs?: Crumb[] }`, SANS `eyebrow` (donc `eyebrow: 'Projet'` est un attribut de fallthrough non affiché). Confirmer et **retirer** la ligne `eyebrow`. (Si, contre toute attente, `detail.vue` consomme un `eyebrow`, le remplacer par `t('showcase.heros.detail_eyebrow')` et ajouter la clé `showcase.heros.detail_eyebrow` = fr « Projet » / en « Project » aux deux locales.)
  - **Hero Article** (lignes ~217-232) : remplacer `DEFAULT_LOCALE` par `locale` dans `breadcrumbsFromTrail(...)`, `routeLabel('blog', ...)`, `routePath('blog', ...)` ; et le lien catégorie (ligne ~225) : ``to: `${routePath('blog', locale)}/${sampleArticleCat.slug}` `` au lieu de `/blog/${sampleArticleCat.slug}`.
  - Retirer `DEFAULT_LOCALE` de l'import (ligne ~31) s'il n'est plus utilisé.

- [ ] **Step 4 : Mettre à jour le commentaire de tête** (ligne ~1-9 et ~127) — remplacer « vitrine /dev » / « Catalogue /dev » par « vitrine /showcase ».

- [ ] **Step 5 : Typecheck** → 0 erreur.

- [ ] **Step 6 : Rendu via `nuxt generate`** — `yarn generate` (PATH v24) → vert. Dans `.output/public/en/showcase/index.html` : vérifier que les samples rendent en anglais (chercher un fragment EN traduit d'un sample, ex. le `heading` EN de media-text) et que le héros article EN porte des liens `/en/blog/...` (pas `/blog/...`). Dans `.output/public/showcase/index.html` : héros + samples en français, inchangés visuellement.

- [ ] **Step 7 : Commit** — `git add app/composables/useBlockCatalog.ts && git commit -m "feat(showcase): catalogue locale-aware (samples i18n + héros locale propagée)"`

---

## Phase 4 — Styleguide allégé + bilingue

À la fin de la phase : les 4 sous-composants styleguide sont **allégés** (prose interne PS retirée) et **bilingues** (i18n `showcase.styleguide.*`). **Check-in Charles** sur le contenu allégé + traductions avant de clore la phase.

**Règle d'allègement (appliquée aux 4 composants) :**
- **GARDER** : les titres de groupe courts (ex. « Familles de police », « Couleurs marque », « Button », « Champs texte »), les spécimens visuels (échelle typo, swatches, atomes/champs rendus), et **une légende d'une ligne** par spécimen quand elle aide vraiment l'œil.
- **RETIRER** : les chemins de fichiers (`components/input/index.vue`…), le jargon PS (« Tier 3 au besoin »), la rationale d'architecture CSS multi-phrases (« brand/tokens.css change d'un client à l'autre… »), et toute note didactique longue. Si un client a une question, il la pose à Charles (esprit B.4).
- **i18n** : tout texte visible CONSERVÉ passe par `t('showcase.styleguide.<composant>.<clé>')` (fr = texte allégé, en = traduction). Les **données de démonstration** (noms/courriels/messages pré-remplis dans `forms.vue`) peuvent rester inline (ce sont des fixtures, pas du chrome) — les laisser tels quels sauf si triviales à localiser.

> **Note exécutant** : ces 4 tâches comportent un jugement éditorial (quoi couper). Faire un premier passage selon la règle, puis **check-in Charles** (Task 13/Step final) avant de figer. Ne pas surinvestir avant la validation.

### Task 9 : `typography.vue` — alléger + i18n

**Files :**
- Modify : `app/components/styleguide/typography.vue`
- Modify : `i18n/locales/fr.json`, `en.json` (`showcase.styleguide.typography.*`)

- [ ] **Step 1 : Lire le composant** et repérer les ~19 chaînes (surtout dans les arrays `fontWeights`/`fontFamilies`/`specials` au script + titres h3 au template).
- [ ] **Step 2 : Alléger** — couper les descriptions longues/internes (ex. la note « Famille Minimaliste: display et body pointent vers la même valeur… pour permettre à d'autres familles de diverger sans toucher aux composants » → couper ou réduire à une ligne neutre type « Display et corps : Archivo. »). Garder titres de groupe + spécimens.
- [ ] **Step 3 : i18n** — ajouter `useI18n()` au script, remplacer les chaînes conservées par `t('showcase.styleguide.typography.<clé>')`, ajouter les clés à `fr.json`/`en.json`. Nommer les clés de façon lisible (`weight_regular_use`, `family_display_use`, `group_families`, `group_weights`, `group_headings`, `group_body`, `group_captions`, `group_specials`, `group_colors`, `figcap_sample`, `sample_sentence`, …).
- [ ] **Step 4 : Typecheck** → 0 erreur. **Valider JSON.**
- [ ] **Step 5 : Commit** — `git add app/components/styleguide/typography.vue i18n/locales && git commit -m "feat(showcase): typography styleguide allégé + bilingue"`

### Task 10 : `tokens.vue` — alléger + i18n

**Files :**
- Modify : `app/components/styleguide/tokens.vue`
- Modify : `i18n/locales/fr.json`, `en.json` (`showcase.styleguide.tokens.*`)

- [ ] **Step 1 : Lire** et repérer les ~26 chaînes (arrays `colorGroups`/`spacingMultiples`/`blockSpaces` + titres h3).
- [ ] **Step 2 : Alléger** — couper la rationale interne (« brand/tokens.css change d'un client Minimaliste à l'autre. Quatre groupes… », « Le 700 existe au catalogue mais… »). Garder labels de groupe (Base, Backgrounds, Text, Accent, Géométrie, Échelle d'espacement, Rythme vertical) + descriptions d'usage COURTES d'une ligne (ex. « Fond principal du site »).
- [ ] **Step 3 : i18n** — `useI18n()`, remplacer les chaînes conservées par `t('showcase.styleguide.tokens.<clé>')`, ajouter clés fr/en.
- [ ] **Step 4 : Typecheck** → 0 erreur. **Valider JSON.**
- [ ] **Step 5 : Commit** — `git add app/components/styleguide/tokens.vue i18n/locales && git commit -m "feat(showcase): tokens styleguide allégé + bilingue"`

### Task 11 : `atoms.vue` — alléger + i18n

**Files :**
- Modify : `app/components/styleguide/atoms.vue`
- Modify : `i18n/locales/fr.json`, `en.json` (`showcase.styleguide.atoms.*`)

- [ ] **Step 1 : Lire** et repérer les ~21 chaînes (array `buttonProps` au script + titres/notes/liens au template, certaines avec balises HTML inline `<code>`/`<NuxtLink>`).
- [ ] **Step 2 : Alléger** — couper les notes citant des chemins de fichiers (`components/button/index.vue — …`) et les descriptions longues. Garder titres de groupe (Button, Link, Icon), les spécimens (boutons rendus, lien « Survolez ce lien », icône), et une légende d'une ligne max par spécimen.
- [ ] **Step 3 : i18n** — `useI18n()`, `t('showcase.styleguide.atoms.<clé>')`. Pour les rares chaînes conservées qui contiennent du HTML inline (ex. un lien dans une phrase) : préférer une chaîne SANS balise (couper le HTML) ou découper en segments ; ne pas mettre de balises HTML dans les valeurs JSON.
- [ ] **Step 4 : Typecheck** → 0 erreur. **Valider JSON.**
- [ ] **Step 5 : Commit** — `git add app/components/styleguide/atoms.vue i18n/locales && git commit -m "feat(showcase): atoms styleguide allégé + bilingue"`

### Task 12 : `forms.vue` — alléger + i18n

**Files :**
- Modify : `app/components/styleguide/forms.vue`
- Modify : `i18n/locales/fr.json`, `en.json` (`showcase.styleguide.forms.*`)

C'est le plus gros (~92 chaînes), mais l'allègement le réduit fortement : on **coupe** toutes les notes didactiques longues (« components/input/index.vue — champ à label flottant… », « La validation vit dans le formulaire… ») et on **garde** : les titres de section (Champs texte, Sélection, Saisie avancée, Rétroaction, Exemple complet), les titres de groupe (Input, Checkbox, Select…), les **labels de champs** (Nom, Adresse courriel, Téléphone, Province…), les **legends** (Type de projet, Forfait…), les **messages d'erreur** d'exemple, et les textes de **rétroaction** (bannière d'erreur, écran de succès).

- [ ] **Step 1 : Lire** `forms.vue` (721 lignes) et classer chaque chaîne : (a) données de démo (noms/courriels/messages pré-remplis — LAISSER inline), (b) chrome conservé (labels, legends, titres, messages, rétroaction — i18n), (c) prose interne longue (COUPER).
- [ ] **Step 2 : Alléger** — supprimer les notes (b)-descriptions verbeuses et les « texte d'usage » multi-phrases sous chaque spécimen. Garder un sous-titre d'une ligne par groupe au plus si utile.
- [ ] **Step 3 : i18n** — `useI18n()`, déplacer les chaînes conservées vers `t('showcase.styleguide.forms.<clé>')`, ajouter clés fr/en. Pour les options de `RadioGroup`/`Select`/`CheckboxGroup` (arrays au script), traduire les `label`/description via `t()` dans le builder de l'array.
- [ ] **Step 4 : Typecheck** → 0 erreur. **Valider JSON.**
- [ ] **Step 5 : Commit** — `git add app/components/styleguide/forms.vue i18n/locales && git commit -m "feat(showcase): forms styleguide allégé + bilingue"`

### Task 13 : Check-in Charles + rendu styleguide bilingue

- [ ] **Step 1 : Rendu via `nuxt generate`** — `yarn generate` (PATH v24) → vert. Dans `.output/public/en/showcase/index.html` : la section « Visual system » est en anglais (titres de groupe, labels de champs, légendes). Dans `.output/public/showcase/index.html` : en français, allégé (plus de chemins de fichiers ni de « Tier 3 »).
- [ ] **Step 2 : CHECK-IN CHARLES** — présenter à Charles : (a) le contenu allégé (ce qui a été coupé/gardé dans les 4 composants), (b) les traductions EN du styleguide ET des samples (Task 7). Charles valide ou ajuste avant le merge final. **Ne pas considérer la Phase 4 close sans ce go.**

---

## Phase 5 — QA de bout en bout + récap

### Task 14 : QA finale

- [ ] **Step 1 : Typecheck complet** — `export PATH="$HOME/.nvm/versions/node/v24.16.0/bin:$PATH"; yarn dlx -q -p typescript -p vue-tsc vue-tsc --noEmit -p .nuxt/tsconfig.json` → 0 erreur.
- [ ] **Step 2 : `nuxt generate` final** — `yarn generate` → build vert (gate routes). Confirmer :
  - `/showcase` et `/en/showcase` prérendues ; `/dev/*` absent du build.
  - Les 5 sections présentes dans les deux HTML, chrome bilingue correct.
  - Les blocs rendent (héros + réguliers + articles + formulaire + styleguide), samples bilingues, héros article avec liens `/en/blog/...` côté EN.
  - Aucune occurrence de `/dev` résiduelle qui casserait (grep `.output/public` pour `/dev/` → rien d'attendu hors éventuels textes).
- [ ] **Step 3 : Vérif visuelle** — si Charles rebranche son dev server sur webforge, vérifier `/showcase` et `/en/showcase` à l'œil via le MCP `Claude_Preview` (sidebar 5 sections, scroll-spy, badges `_type`, onglets de variantes fonctionnels, bascule de langue). Sinon, revue du HTML généré + capture demandée à Charles.
- [ ] **Step 4 : Régression preview/live editing** — confirmer que le démo (pages réelles) n'est pas affecté : `/showcase` est hors du flux preview Sanity (aucune query de page Sanity ; rendu depuis le payload existant). Rien à changer côté preview ; juste confirmer que `nuxt build` (preset preview) ne casse pas si déclenché — non bloquant pour le merge, mais le noter.
- [ ] **Step 5 : Récap pour Charles** — diff complet, points de QA, captures, et rappel de la **séquence go-live A+B groupée** (ci-dessous).

---

## Séquence go-live (A + B groupés, sur validation de Charles)

Le chantier A (héros en blocs) est déjà sur `staging`, non poussé. Ce chantier B s'empile dessus. À la fin, **un seul** déploiement porte les deux :

1. Pousser `staging` (les Workers `staging` buildent A+B en auto) ; valider sur l'env staging.
2. `SANITY_STUDIO_PREVIEW_URL=https://webforge-minimaliste-preview.patoinestudio.ca yarn studio:deploy` (schéma `hero` en array du chantier A ; le showcase n'ajoute pas de schéma Sanity).
3. `cd studio && export PATH="$HOME/.nvm/versions/node/v24.16.0/bin:$PATH"; npx sanity exec migrations/2026-06-17-hero-to-array.mjs --with-user-token` (migration contenu hero objet→tableau, chantier A ; idempotente).
4. Vérifier le Studio (héros éditables en array) + un rebuild prod vert.
5. Merge `staging` → `main` (push) → déploiement prod de A+B.
6. Mettre à jour les mémoires : `project_hero_not_a_block` (périmée), `project_heros_en_blocs` (go-live fait), créer/mettre à jour une mémoire showcase.

---

## Auto-revue (faite à la rédaction)

- **Couverture spec B** : B.1 (route /showcase, ungated, noindex, hors nav, SgNav conservée) → T1/T3/T4/T6 ; pages internes RETIRÉES (décision Charles) → T5 (pas de page interne gated). B.2 (5 sections code-driven) → T4 + catégories existantes + SgForms + styleguide. B.3 (gardé : sidebar, badges `_type`, onglets de variantes, styleguide ; changé : route, dégating, section héros, rapatriement form+styleguide ; retiré : stack + env links) → T4/T5. B.4 (polish, pas de doc par bloc) → règle d'allègement Phase 4. Bilingue curaté (décision) → T2/T7/T8 + Phase 4.
- **Placeholders** : les seules consignes « lire le fichier X » concernent (a) la confirmation mécanique de `detail.vue` (eyebrow vestigial, T8) et (b) l'allègement éditorial du styleguide (Phase 4, jugement explicitement renvoyé à un check-in Charles) — pas du design non tranché. Les chaînes de chrome (T2) et le pattern de samples (T7, exemple media-text complet) sont concrets ; les traductions EN en masse (samples + styleguide) sont du contenu renvoyé à la revue Charles (T13).
- **Cohérence des types/noms** : `showcase` (route-map), `showcase.*` (i18n), `mediaTextSample`/`ctaBandSample`/… (builders), `useWfLocale`/`useI18n` (locale + t). Section ids (`heros`/`reguliers`/`articles`/`formulaire`/`styleguide`) identiques entre `SgNav :items` et les `<section :id>`. Catégories `useBlockCatalog` (`heros`/`reguliers`/`articles`) inchangées.
- **Disciplines** : tokens only (CSS du `wf-showcase` en `var()`), i18n pour tout le chrome conservé, contenu des blocs en Sanity (payload), classes `wf-*` réutilisées, `.vue` script/template/style, imports relatifs dans nuxt.config (T1 ne touche pas la fermeture ; T6 modifie sitemap/robots/prerender, pas les imports).
