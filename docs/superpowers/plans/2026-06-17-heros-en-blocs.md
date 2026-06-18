# Héros en blocs (chantier A) — plan d'implémentation

> **Pour les workers agentiques :** SOUS-SKILL REQUISE : `superpowers:subagent-driven-development` (recommandé) ou `superpowers:executing-plans` pour exécuter ce plan tâche par tâche. Les étapes utilisent des cases `- [ ]`.

**Goal :** Transformer les héros en blocs rendus via un `heroBlockMap`, et exposer dans Sanity un mini-builder de héros verrouillé à 1 bloc sur les pages auto-portantes (accueil + pages fixes), sans régression visuelle.

**Architecture :** On calque la mécanique des blocs réguliers (block-map + GROQ discriminé + transform + `_type` kebab) pour les héros. Les 4 composants héros actuels deviennent des composants de blocs (look inchangé). Les héros auto-portants reçoivent un champ `hero` = `array` max 1 (migration objet→tableau du contenu live). Les héros détail/article deviennent des blocs **côté code** (pas de champ CMS tant qu'il n'y a qu'une variante).

**Tech stack :** Nuxt 4, Vue 3 (`<script setup>` TS strict), `@nuxtjs/sanity` + GROQ, transform pur (`app/sanity/transform.ts`), Studio Sanity (`studio/`), seed `.mjs`. Aucun framework de test : la vérification = `vue-tsc` (0 erreur), rendu SSR vérifié par `curl` sur le dev server de Charles (jamais spawn de serveur), `nuxt generate` vert.

**Raffinements vs spec (à valider par Charles) :**
- Détail/article = blocs côté code maintenant, champ CMS différé jusqu'à une 2e variante (évite un bloc Sanity vide).
- Le champ `hero` passe d'objet à `array(max 1)` → migration du contenu live (tâche dédiée, sur go de Charles).

**Conventions non négociables :** tokens (aucune valeur design en dur), i18n (aucun texte UI en dur), contenu Sanity, classes typo `wf-*`, CSS Grid, `.vue` = script/template/style. Imports RELATIFS dans la fermeture nuxt.config (`types/*`, `content/*`, `queries/*`, `sanity/transform.ts`).

---

## Carte des fichiers

**Créés :**
- `app/components/hero/block/home.vue`, `page.vue`, `detail.vue`, `article.vue` (déplacés depuis `app/components/hero/`)
- `app/components/hero/block-map.ts` (`heroBlockMap`)
- `app/components/hero/index.vue` (orchestrateur, rend `heroBlockMap[hero._type]`)
- `app/content/hero-blocks.ts` (interfaces `DetailHeroContent`, `ArticleHeroContent` + helpers de composition détail/article)
- `studio/seed/` : mise à jour des données (champ `hero` en tableau)
- `studio/migrations/2026-06-17-hero-to-array.mjs` (script de migration contenu live)

**Modifiés :**
- `app/types/blocks.ts` (union `HeroBlock` + types de blocs héros)
- `app/queries/fragments/hero.ts` (`HERO_BLOCK_PROJECTION` discriminée)
- `app/queries/pages/*.ts` + `documents.ts` (projeter `hero[0]` au lieu de `hero`)
- `app/sanity/transform.ts` (`transformHeroBlock`, lecture `hero[0]`, payload `heroes`/`pages.*.hero` en `HeroBlock`)
- `app/composables/useHeroContent.ts`, `usePageHero.ts` (retournent un `HeroBlock`)
- `app/types/sanity.ts` (le champ `hero` brut devient `SanityRawHeroBlock[]`)
- Les pages : `app/pages/index.vue`, `one-pager/index.vue`, `services/index.vue`, `projets/index.vue`, `a-propos.vue`, `blog/index.vue`, `faq.vue`, `contact.vue`, `services/[slug].vue`, `projets/[slug].vue`, `blog/[...slug].vue`
- `studio/schemas/documents/{home-page,one-pager,services-page,projects-page,about-page,blog-page,faq-page,contact-page}.ts` (champ `hero` → `array` max 1)
- `app/composables/useBlockCatalog.ts` (la section Héros consomme `heroBlockMap` — recoupe le chantier B; ici on garde la vitrine fonctionnelle)

---

## Phase 1 — Types et interfaces (fondation, zéro rendu)

### Task 1 : Interfaces de contenu des blocs héros détail/article

**Files :**
- Create : `app/content/hero-blocks.ts`

- [ ] **Step 1 : Écrire les interfaces** (les blocs détail/article portent les données dérivées de la collection; `breadcrumbs` reste calculé au rendu, hors stockage)

```typescript
// Interfaces des blocs héros dérivés d'une collection (détail projet/service,
// article). Le contenu vient du document de collection (titre, couverture…),
// composé en HeroBlock côté code; pas de champ Sanity tant qu'il n'y a qu'une
// variante (cf. plan, raffinement YAGNI).
import type { HeroFigure } from './hero'

// Miroir de la figure consommée par les héros (alias de la shape resolveFigure).
export interface DetailHeroContent {
  title: string
  lead?: string
  meta?: string[]
  image: HeroFigure
}

export interface ArticleHeroContent {
  category?: { label: string; to: string }
  title: string
  date: string
  author: string
  readingTime: number
  cover: HeroFigure
}
```

- [ ] **Step 2 : Exposer `HeroFigure` depuis `content/hero.ts`** (la shape `{ ratio, src?, alt?, label, caption }` y vit déjà sous `HeroVisual`; ajouter un alias `HeroFigure` réutilisable, ou réutiliser le type des images détail). Lire `app/content/hero.ts` et `app/content/page-heroes.ts` : si une shape figure commune existe, l'exporter en `HeroFigure`; sinon, définir `export interface HeroFigure { ratio: string; src?: string; alt?: string; label: string; caption: string }` dans `content/hero.ts` et l'utiliser dans `page-heroes.ts`/`hero-blocks.ts`.

- [ ] **Step 3 : Vérifier le typecheck** — `export PATH="$HOME/.nvm/versions/node/v24.16.0/bin:$PATH"; yarn dlx -q -p typescript -p vue-tsc vue-tsc --noEmit -p .nuxt/tsconfig.json` → 0 erreur (les nouveaux types ne sont pas encore consommés).

- [ ] **Step 4 : Commit** — `git add app/content/hero-blocks.ts app/content/hero.ts app/content/page-heroes.ts && git commit -m "feat(hero): interfaces de contenu des blocs héros détail/article"`

### Task 2 : Union `HeroBlock` et types de blocs

**Files :**
- Modify : `app/types/blocks.ts`

- [ ] **Step 1 : Ajouter les imports + l'union** (après les blocs réguliers; `Crumb` se calcule au rendu, pas stocké → les blocs héros ne le portent pas dans leur type de contenu)

```typescript
import type { HeroContent } from '../content/hero'
import type { PageHero } from '../content/page-heroes'
import type { DetailHeroContent, ArticleHeroContent } from '../content/hero-blocks'

// Blocs héros: le héros devient un bloc discriminé par _type, rendu via
// heroBlockMap (composants/hero/block-map.ts), comme PageBlock pour les blocs
// réguliers. _type kebab côté Vue.
export type HeroHomeBlock    = BlockBase<'hero-home'>    & HeroContent
export type HeroPageBlock    = BlockBase<'hero-page'>    & PageHero
export type HeroDetailBlock  = BlockBase<'hero-detail'>  & DetailHeroContent
export type HeroArticleBlock = BlockBase<'hero-article'> & ArticleHeroContent

export type HeroBlock =
  | HeroHomeBlock
  | HeroPageBlock
  | HeroDetailBlock
  | HeroArticleBlock
```

- [ ] **Step 2 : Typecheck** (commande Task 1 Step 3) → 0 erreur.
- [ ] **Step 3 : Commit** — `git add app/types/blocks.ts && git commit -m "feat(hero): union HeroBlock (types des blocs héros)"`

---

## Phase 2 — Composants de blocs + block-map + orchestrateur (rendu côté code)

### Task 3 : Migrer les 4 composants héros sous `hero/block/`

**Files :**
- Create (move) : `app/components/hero/block/{home,page,detail,article}.vue` (depuis `app/components/hero/{home,page,detail,article}.vue`)

- [ ] **Step 1 : Déplacer les 4 fichiers** — `git mv app/components/hero/home.vue app/components/hero/block/home.vue` (idem page, detail, article). Markup et style **inchangés**.

- [ ] **Step 2 : Typer chaque composant contre son type de bloc** — dans chaque fichier déplacé, remplacer le `defineProps` actuel par le type de bloc, en gardant les défauts. Exemples :
  - `block/home.vue` : `const hero = withDefaults(defineProps<HeroHomeBlock>(), { kicker: undefined })` avec `import type { HeroHomeBlock } from '~/types/blocks'`. (Le template lit `hero.title` etc. : le `_type`/`_key` ajoutés sont ignorés.)
  - `block/page.vue` : `defineProps<HeroPageBlock & { breadcrumbs?: Crumb[] }>()` (breadcrumbs reste une prop de rendu passée par la page/orchestrateur, hors du type stocké). Conserver l'import `Crumb` existant.
  - `block/detail.vue` : `defineProps<HeroDetailBlock & { breadcrumbs?: Crumb[] }>()`.
  - `block/article.vue` : `defineProps<HeroArticleBlock & { breadcrumbs?: Crumb[] }>()`.

- [ ] **Step 3 : Mettre à jour les imports des composants déplacés** — corriger les chemins relatifs cassés par le déplacement (ex. `~/components/...` reste valide; vérifier tout import relatif `./` ou `../`). Lire chaque fichier après `git mv` et ajuster.

- [ ] **Step 4 : Typecheck** → 0 erreur.
- [ ] **Step 5 : Commit** — `git add -A app/components/hero && git commit -m "refactor(hero): déplace les 4 héros sous hero/block/, typés par bloc"`

### Task 4 : `heroBlockMap` + orchestrateur `hero/index.vue`

**Files :**
- Create : `app/components/hero/block-map.ts`
- Create : `app/components/hero/index.vue`

- [ ] **Step 1 : Écrire le block-map** (calque de `regular/block-map.ts`)

```typescript
// Table _type -> composant pour les héros (calque de regular/block-map.ts).
// Partagée par l'orchestrateur de héros et la vitrine /showcase.
import HeroHome from './block/home.vue'
import HeroPage from './block/page.vue'
import HeroDetail from './block/detail.vue'
import HeroArticle from './block/article.vue'

export const heroBlockMap = {
  'hero-home': HeroHome,
  'hero-page': HeroPage,
  'hero-detail': HeroDetail,
  'hero-article': HeroArticle
} as const

export type HeroBlockType = keyof typeof heroBlockMap
```

- [ ] **Step 2 : Écrire l'orchestrateur** (calque de `regular/index.vue`; `breadcrumbs` passé en plus pour les héros qui en ont)

```vue
<script setup lang="ts">
import type { HeroBlock } from '~/types/blocks'
import type { Crumb } from '~/config/route-map'
import { heroBlockMap } from './block-map'

defineProps<{ hero: HeroBlock; breadcrumbs?: Crumb[] }>()
</script>

<template>
  <component :is="heroBlockMap[hero._type]" v-bind="hero" :breadcrumbs="breadcrumbs" />
</template>
```
(Note exécutant : confirmer l'emplacement du type `Crumb` via la source des héros actuels — ils l'importent déjà; réutiliser le même chemin.)

- [ ] **Step 3 : Typecheck** → 0 erreur.
- [ ] **Step 4 : Commit** — `git add app/components/hero/block-map.ts app/components/hero/index.vue && git commit -m "feat(hero): heroBlockMap + orchestrateur hero/index.vue"`

---

> **Fait vérifié sur le contenu live (2026-06-17)** : `hero` est stocké comme un **objet portant `_type`** (`heroHome`/`pageHero`), pas un tableau. La lecture GROQ utilise donc `coalesce(hero[0], hero)` : tolérante à l'objet (actuel) ET au tableau (après migration), les deux portant `_type`. Conséquence : **le rendu ne casse jamais** pendant tout le refactor (dev server vert en continu). La migration objet→tableau (Task 12) ne sert qu'à l'**édition dans le Studio** (le champ array s'affiche peuplé), pas au rendu.

## Phase 3 — Builder CMS des héros auto-portants (accueil + pages fixes)

### Task 5 : Schéma — champ `hero` en `array(max 1)` sur les 8 documents de page

**Files :**
- Modify : `studio/schemas/documents/{home-page,one-pager}.ts` (of: `heroHome`)
- Modify : `studio/schemas/documents/{services-page,projects-page,about-page,blog-page,faq-page,contact-page}.ts` (of: `pageHero`)

- [ ] **Step 1 : home-page.ts et one-pager.ts** — remplacer le champ `hero` (type `heroHome`) par :

```typescript
defineField({
  name: 'hero',
  title: 'Héros',
  type: 'array',
  group: 'content',
  of: [defineArrayMember({ type: 'heroHome' })],
  validation: (R) => R.required().length(1),
}),
```
(`defineArrayMember` déjà importé dans ces fichiers.)

- [ ] **Step 2 : les 6 pages fixes** — même remplacement avec `of: [defineArrayMember({ type: 'pageHero' })]`.

- [ ] **Step 3 : Pas de typecheck app ici** (schéma Studio). Vérification = build Studio plus tard (Task 12). Commit — `git add studio/schemas/documents && git commit -m "feat(hero): champ hero en array(max 1) sur les 8 documents de page"`

### Task 6 : GROQ — projeter le héros en bloc (tolérant objet/tableau)

**Files :**
- Modify : `app/queries/fragments/hero.ts`
- Modify : les requêtes de page qui projettent `hero` (lire `app/queries/pages/*.ts` et `documents.ts` pour localiser `"hero": hero { ... }` ou `hero ${HERO_..._PROJECTION}`)

- [ ] **Step 1 : Ajouter une projection discriminée par `_type`** dans `fragments/hero.ts`, qui sort `_type` + `_key` + les champs selon le type. Conserver les projections existantes comme briques :

```typescript
// Bloc héros (1er et unique élément du tableau hero). Discrimine par _type;
// _type kebab côté Vue produit au transform (heroHome -> hero-home, etc.).
export const HERO_BLOCK_PROJECTION = /* groq */ `{
  _type,
  _key,
  _type == "heroHome" => ${HERO_HOME_PROJECTION_BODY},
  _type == "pageHero" => ${PAGE_HERO_PROJECTION_BODY}
}`
```
(Extraire le corps `{...}` de `HERO_HOME_PROJECTION`/`PAGE_HERO_PROJECTION` en `_BODY` sans accolades externes, ou inliner. Lire le fichier et refactorer proprement.)

- [ ] **Step 2 : Mettre à jour les requêtes de page (tolérant)** — partout où une page projette son héros, passer de `"hero": hero ${HERO_HOME_PROJECTION}` à `"hero": coalesce(hero[0], hero) ${HERO_BLOCK_PROJECTION}`. Le `coalesce` rend la lecture tolérante : `hero[0]` (tableau migré) sinon `hero` (objet actuel) — les deux portent `_type`. Lire `app/queries/pages/{home,one-pager,services,projects,about,blog,faq,contact}.ts` (ou `documents.ts`) et ajuster chacune.

- [ ] **Step 3 : Typecheck** → 0 erreur (les types Sanity bruts changent en Task 7; faire Task 7 avant le typecheck si nécessaire, ou les committer ensemble).

- [ ] **Step 4 : Commit** — `git add app/queries && git commit -m "feat(hero): GROQ projette hero[0] en bloc discriminé"`

### Task 7 : Types Sanity bruts + transform `hero` -> `HeroBlock`

**Files :**
- Modify : `app/types/sanity.ts`
- Modify : `app/sanity/transform.ts`

- [ ] **Step 1 : Types bruts** — dans `types/sanity.ts`, ajouter le bloc héros brut et changer les docs de page pour porter `hero: SanityRawHeroBlock[]` :

```typescript
export type SanityRawHeroBlock =
  | (SanityBlockBase<'heroHome'> & SanityHeroHome)
  | (SanityBlockBase<'pageHero'> & SanityPageHero)
```
Puis sur `SanityHomePage`, `SanityOnePager`, `SanityFixedPage` (et dérivés blog/faq) : `hero: SanityRawHeroBlock` (UN bloc, déjà résolu par le `coalesce` GROQ — pas un tableau côté brut) au lieu de `hero: SanityHeroHome`/`SanityPageHero`.

- [ ] **Step 2 : transform** — ajouter `transformHeroBlock` et faire lire `hero[0]` partout :

```typescript
const HERO_BLOCK_TYPE_MAP = { heroHome: 'hero-home', pageHero: 'hero-page' } as const

function transformHeroBlock(raw: SanityRawHeroBlock, locale: WfLocale): HeroBlock {
  switch (raw._type) {
    case 'heroHome':
      return { _type: 'hero-home', _key: raw._key, ...transformHeroHomeBody(raw, locale) }
    case 'pageHero':
      return { _type: 'hero-page', _key: raw._key, ...transformPageHeroBody(raw, locale) }
    default:
      return assertNever(raw)
  }
}

// Garde de robustesse: héros absent (null) = contenu incomplet -> erreur claire.
function requireHero(raw: Maybe<SanityRawHeroBlock>, name: string): SanityRawHeroBlock {
  if (!raw) throw new Error(`Document « ${name} » sans bloc héros (seed/contenu incomplet).`)
  return raw
}
```
Le `coalesce(hero[0], hero)` GROQ livre déjà UN bloc (objet actuel ou élément du tableau migré), donc le transform reçoit un bloc unique, pas un tableau. Renommer le corps des `transformHeroHome`/`transformPageHero` actuels en `transformHeroHomeBody`/`transformPageHeroBody` (mêmes retours `HeroContent`/`PageHero`), et les appeler depuis `transformHeroBlock`. Dans `transformGraph`, remplacer `transformHeroHome(homePage.hero, …)` par `transformHeroBlock(requireHero(homePage.hero, 'homePage'), …)`, idem onePager et les 6 héros de page.

- [ ] **Step 3 : Adapter le payload** — `ContentPayload.heroes.{home,onePager}` et `pages.*.hero` deviennent `HeroBlock` (au lieu de `HeroContent`/`PageHero`). Mettre à jour les interfaces `HomePagePayload`/`FixedPagePayload`/etc.

- [ ] **Step 4 : Typecheck** → 0 erreur (le typecheck va remonter les consommateurs : composables Task 8, pages Task 9).

- [ ] **Step 5 : Commit** — `git add app/types/sanity.ts app/sanity/transform.ts && git commit -m "feat(hero): transform hero[0] -> HeroBlock (heroHome/pageHero)"`

### Task 8 : Composables `useHeroContent` / `usePageHero` retournent un `HeroBlock`

**Files :**
- Modify : `app/composables/useHeroContent.ts`, `app/composables/usePageHero.ts`

- [ ] **Step 1 : `useHeroContent`** → `ComputedRef<HeroBlock>` (le payload `heroes.home`/`onePager` est déjà un HeroBlock après Task 7). Changer le type de retour et le commentaire; le corps `usePayload().heroes...` reste.
- [ ] **Step 2 : `usePageHero`** → `ComputedRef<HeroBlock>` (lit `useFixedPage(key).hero`, désormais un HeroBlock).
- [ ] **Step 3 : Typecheck** → 0 erreur (sauf les pages, Task 9).
- [ ] **Step 4 : Commit** — `git add app/composables/useHeroContent.ts app/composables/usePageHero.ts && git commit -m "feat(hero): composables héros retournent un HeroBlock"`

### Task 9 : Câbler les pages auto-portantes sur l'orchestrateur

**Files :**
- Modify : `app/pages/index.vue`, `one-pager/index.vue`, `services/index.vue`, `projets/index.vue`, `a-propos.vue`, `blog/index.vue`, `faq.vue`, `contact.vue`

- [ ] **Step 1 : Accueil + one-pager** — remplacer `<HeroHome v-bind="hero" />` par `<Hero :hero="hero" />` (où `<Hero>` = `app/components/hero/index.vue`, auto-importé `Hero` ou importé explicitement; confirmer le nom auto-import). `hero` = `useHeroContent()` (déjà un HeroBlock).
- [ ] **Step 2 : Pages fixes** — remplacer `<HeroPage v-bind="hero" :breadcrumbs="breadcrumbs" />` par `<Hero :hero="hero" :breadcrumbs="breadcrumbs" />`. `hero` = `usePageHero(key)`.
- [ ] **Step 3 : Vérif SSR de CHAQUE page** sur le dev server (jamais spawn) :
  - `curl -s localhost:3000/ | grep -o 'wf-hero[^"]*'` (accueil), idem `/services`, `/projets`, `/a-propos`, `/blog`, `/faq`, `/contact`, `/one-pager`. Attendu : le héros rend comme avant (mêmes classes, mêmes textes). HTTP 200, zéro erreur SSR.
  - Comparaison visuelle (capture) : héros identique au look actuel.
- [ ] **Step 4 : Typecheck** → 0 erreur.
- [ ] **Step 5 : Commit** — `git add app/pages && git commit -m "feat(hero): pages auto-portantes rendues via l'orchestrateur héros"`

---

## Phase 4 — Héros détail/article en blocs côté code

### Task 10 : Composer HeroDetailBlock / HeroArticleBlock et rendre via l'orchestrateur

**Files :**
- Create : helpers dans `app/content/hero-blocks.ts` (ou un composable `app/composables/useDetailHero.ts`)
- Modify : `app/pages/services/[slug].vue`, `projets/[slug].vue`, `blog/[...slug].vue`

- [ ] **Step 1 : Helpers de composition** — fonctions pures qui produisent le bloc depuis la donnée de collection (le `_type` est figé tant qu'il n'y a qu'une variante) :

```typescript
import type { HeroDetailBlock, HeroArticleBlock } from '~/types/blocks'
import { serviceImage } from './services'
import type { Service } from './services'
import type { Project } from './projects'
import type { Article } from './articles'

export function serviceHeroBlock(s: Service): HeroDetailBlock {
  return { _type: 'hero-detail', _key: `hero-${s.slug}`, title: s.title, lead: s.summary, image: serviceImage(s) }
}
export function projectHeroBlock(p: Project): HeroDetailBlock {
  return { _type: 'hero-detail', _key: `hero-${p.slug}`, title: p.title, lead: p.excerpt, meta: [p.location, p.year], image: p.cover }
}
export function articleHeroBlock(a: Article, category?: { label: string; to: string }): HeroArticleBlock {
  return { _type: 'hero-article', _key: `hero-${a.slug}`, category, title: a.title, date: a.date, author: a.author, readingTime: a.readingTime, cover: a.cover }
}
```
(Lire les interfaces `Service`/`Project`/`Article` pour confirmer les noms de champs; ils correspondent au mapping de l'agent : service.summary, project.excerpt/location/year/cover, article.date/author/readingTime/cover.)

- [ ] **Step 2 : Câbler les pages détail/article** — remplacer les `<HeroDetail .../>` et `<HeroArticle .../>` à props manuelles par `<Hero :hero="..." :breadcrumbs="..." />`, en passant le bloc composé (`projectHeroBlock(project)`, `serviceHeroBlock(service)`, `articleHeroBlock(article, chip)`). Garder les `breadcrumbs` existants.

- [ ] **Step 3 : Vérif SSR** : `curl` une page projet, une page service, une page article → héros identique à avant. HTTP 200, zéro erreur.
- [ ] **Step 4 : Typecheck** → 0 erreur.
- [ ] **Step 5 : Commit** — `git add app/content/hero-blocks.ts app/pages && git commit -m "feat(hero): héros détail/article composés en blocs (rendu via orchestrateur)"`

---

## Phase 5 — Migration du contenu + seed

### Task 11 : Mettre à jour le seed (champ `hero` en tableau)

**Files :**
- Modify : `studio/seed/data/site-pages-fr.mjs`, `site-pages-en.mjs`

- [ ] **Step 1 : Envelopper chaque `hero` de page dans un tableau** — pour les 8 documents (homePage, onePager, 6 fixes) fr+en : `hero: { ...heroHome/pageHero... }` devient `hero: [{ _type: 'heroHome'|'pageHero', _key: 'hero', ...mêmes champs }]`. Lire les fichiers seed pour la forme exacte.
- [ ] **Step 2 : Vérifier le seed à blanc** (sans pousser) — `node studio/seed/verify.mjs` si applicable, ou relire visuellement. (Le seed ne tourne PAS contre le live ici; il sert au re-seed sur go de Charles.)
- [ ] **Step 3 : Commit** — `git add studio/seed && git commit -m "feat(hero): seed du champ hero en array(max 1)"`

### Task 12 : Script de migration du contenu live (exécuté sur go de Charles)

**Files :**
- Create : `studio/migrations/2026-06-17-hero-to-array.mjs`

- [ ] **Step 1 : Écrire le script** — pour chaque document de page (publié + brouillon, fr+en) dont `hero` est un OBJET, le réécrire en `[{ ...hero, _type: <heroHome|pageHero>, _key: 'hero' }]`. Utiliser `getCliClient()` (cf. mémoire `reference_sanity_mcp_unset_schema_validation` : mutation brute via `sanity exec <script> --with-user-token`). Idempotent : ne touche pas un `hero` déjà tableau.

```javascript
import { getCliClient } from 'sanity/cli'
const client = getCliClient()
const PAGE_TYPES = { homePage: 'heroHome', onePager: 'heroHome', servicesPage: 'pageHero', projectsPage: 'pageHero', aboutPage: 'pageHero', blogPage: 'pageHero', faqPage: 'pageHero', contactPage: 'pageHero' }
const docs = await client.fetch(`*[_type in $types]{_id, _type, hero}`, { types: Object.keys(PAGE_TYPES) })
let tx = client.transaction()
for (const d of docs) {
  if (Array.isArray(d.hero) || !d.hero) continue
  const t = PAGE_TYPES[d._type]
  tx = tx.patch(d._id, (p) => p.set({ hero: [{ ...d.hero, _type: t, _key: 'hero' }] }))
}
await tx.commit()
console.log('Migration hero -> array terminée')
```

- [ ] **Step 2 : NE PAS exécuter sans go de Charles.** Le rendu ne dépend PAS de cette migration (GROQ tolérant `coalesce`), donc rien ne presse côté site; elle sert uniquement à ce que le **Studio** affiche le champ héros (array) peuplé et éditable. Documenter la commande : `export PATH=".../v24/bin:$PATH"; cd studio && npx sanity exec migrations/2026-06-17-hero-to-array.mjs --with-user-token`. À lancer APRÈS `studio:deploy` du nouveau schéma.
- [ ] **Step 3 : Commit** — `git add studio/migrations && git commit -m "chore(hero): script de migration contenu hero objet -> tableau"`

---

## Phase 6 — Vitrine + QA finale

### Task 13 : Maintenir la vitrine des héros fonctionnelle

**Files :**
- Modify : `app/composables/useBlockCatalog.ts`

- [ ] **Step 1 : Adapter la section Héros** — la vitrine construit aujourd'hui les props héros à la main (HeroHome/HeroPage/HeroDetail/HeroArticle). La faire rendre via `heroBlockMap` avec des blocs (`{ _type:'hero-home', ... }`, etc.), depuis le payload (`useHeroContent`, `usePageHero`) et des échantillons de collection (projet/article) composés via les helpers Task 10. (Le polish client-facing complet = chantier B; ici on garde la vitrine verte.)
- [ ] **Step 2 : Vérif SSR** `curl localhost:3000/dev/blocs/heros` → les 4 héros rendent.
- [ ] **Step 3 : Typecheck** → 0 erreur.
- [ ] **Step 4 : Commit** — `git add app/composables/useBlockCatalog.ts && git commit -m "refactor(hero): vitrine héros via heroBlockMap"`

### Task 14 : QA de bout en bout

- [ ] **Step 1 : Typecheck complet** → 0 erreur.
- [ ] **Step 2 : SSR de toutes les pages** (curl) : accueil, one-pager, 6 pages fixes, 1 projet, 1 service, 1 article, vitrine héros. HTTP 200, héros identiques au look actuel, zéro erreur SSR.
- [ ] **Step 3 : `nuxt generate` local** (gate routes) sur go — `export PATH=".../v24/bin:$PATH"; yarn generate` → build vert (nécessite réseau Sanity; le contenu live doit être migré OU on teste après le re-seed).
- [ ] **Step 4 : Récap pour Charles** — diff, points de QA, et la séquence go-live (deploy schéma -> migration contenu -> re-seed/publish -> merge main).

---

## Séquence go-live (sur validation de Charles, après le code)

1. Merge `staging` (déjà QA) — pas encore `main`.
2. `studio:deploy` du nouveau schéma (champ hero en tableau) : `SANITY_STUDIO_PREVIEW_URL=... yarn studio:deploy`.
3. Migration du contenu live : `sanity exec migrations/2026-06-17-hero-to-array.mjs --with-user-token`.
4. Vérifier le Studio (héros éditables en tableau) + un rebuild prod vert.
5. Merge `main`.

## Auto-revue (à faire après rédaction)

- Couverture spec : A.1–A.9 → tâches 1–14. A.6 (détail/article lisent le doc) = Task 10. A.7 (verrouillage max 1) = Task 5. A.8 (seed) = Task 11. Migration (non explicite dans le spec) = Task 12 (raffinement signalé).
- Cohérence des types : `HeroBlock`/`heroBlockMap`/`HERO_BLOCK_TYPE_MAP`/`transformHeroBlock` nommés identiquement partout.
- Placeholders : aucun « TBD »; les rares « lire le fichier X » concernent des déplacements mécaniques (git mv) et des refactors locaux, pas du design non tranché.
