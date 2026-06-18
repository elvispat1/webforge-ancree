# Contrat de conventions — WebForge Minimaliste, mode Multipage

> Base commune de tous les sous-agents de construction. Source de vérité pour la
> session multipage. Rédigé après la Phase 1 d'analyse du repo (8 juin 2026).
> Tout ce qui suit est tiré du code réel, pas d'hypothèses.
>
> Amendé à la suite de la passe qualité multipage (audit du 9 juin 2026,
> décisions D6, D7, D9, D23): voir les passages marqués « amendement ».
> Amendé au démarrage de la session Sanity V2 (10 juin 2026): convention
> d'organisation Sanity à deux régimes et rails du branchement, voir §17.
> L'écart D19 (politique de confidentialité au conditionnel pour les témoins
> de mesure, aucun analytique installé sur le démo) est documenté dans
> `app/content/legal.ts` et `app/content/consent.ts`.
>
> **Règle d'or**: tu construis les composants **propres à la famille Minimaliste**.
> Ce qui voyage d'une famille à l'autre, c'est la nomenclature et le rôle, pas le
> fichier. Tout vit dans la couche famille/app, jamais dans `webforge-core`.

Chemins relatifs à la racine du repo sauf mention contraire.

---

## 0. Les rails durs (non négociables)

1. **Aucune valeur design en dur** dans un composant. Couleur, typo, rayon,
   espacement, filet: tout par `var(--token)` ou utilitaire Tailwind aligné sur
   `--spacing`. Valeur manquante → on l'ajoute aux tokens famille ou marque, jamais
   au composant.
2. **Aucune chaîne d'interface en dur**: a11y et chrome produit générique via i18n
   (`a11y.*`, `consent.*`). Le contenu propre au site (Atelier Cormier) vit dans
   `content/`, jamais dans i18n.
3. **Aucun contenu en dur dans les composants**: chaque bloc a son interface +
   const dans `content/`, son type discriminé dans `types/blocks.ts`, son composant,
   son entrée block-map. Signature stable pour le swap Sanity V2.
4. **Container queries partout** (`@container site`): blocs, `.section-grid`
   (grid.css), padding de `.wf-container`. Une seule source de vérité de largeur,
   le conteneur `site`; aucune media query viewport de largeur. L'exception
   historique `.section-grid` est levée (amendement du 9 juin 2026, D7).
   Exceptions tolérées: les gates de capacités (`hover` / `pointer`), le clamp
   typographique racine (`<html>` est l'ancêtre de tout conteneur),
   `.wf-skip:focus`, et tout cas justifié commenté sur place (ex. le padding-top
   des héros, déclenché par la hauteur du viewport, non interrogeable sur un
   conteneur inline-size).
5. **Nomenclature anglaise** partout dans le code (composants, types, `_type`,
   fichiers, variables, props, clés). Commentaires en français.
6. **Ordre DOM logique** quand l'image alterne: le DOM reste constant (texte puis
   média), le flip visuel passe par `grid-column` en CSS, jamais en réordonnant le
   DOM. Clavier et lecteur d'écran ne se désynchronisent pas.
7. **Typographie de contenu**: aucun tiret cadratin, aucun middle dot séparateur.
   Français québécois naturel.
8. **Pas d'eyebrow réflexe**: le surtitre (`wf-caption`) se mérite. Varier les
   ouvertures de section.

---

## 1. Tokens (référence)

### Marque (`app/brand/tokens.css`)
`--white #FAFAF7`, `--black #1A1A1A`, `--bg-base` (=white), `--bg-alt #F2EFE9`,
`--text-base` (=black), `--text-muted #6B675F`, `--accent-1 #2D4A3E` (accent
**UNIQUE**, pas de accent-2), `--error #C0453B`, `--error-soft`.

### Famille (`app/family/tokens.css`)
- Fonts: `--font-display` / `--font-body` = Archivo, `--font-mono` = JetBrains Mono.
- Géométrie: `--radius 0.2rem`, `--header-height 8rem`.
- Espacement: `--spacing` (Tailwind, 0.5rem, source de vérité) ; `--spacing-unit`
  (= `--spacing * 2`, alias historique 10px @1440 pour le CSS `.wf-*`).
- **Rythme entre blocs**: `--space-block-tight 4rem` / `--space-block-default 8rem`.
- **Rythme typo interne**: `--space-title-lead 20px` (titre → lead),
  `--space-lead-cta 40px` (lead → CTA).
- Filets: `--line-hair`, `--line-soft`. Voile: `--scrim`. Modal: `--modal-panel-side`,
  `--modal-panel-center`.
- Motion CSS: `--motion-duration-hover 150ms`, `--motion-duration-line 240ms` (révélation
  de trait au survol, partagée par `.wf-link` et `.wf-rule-link`), `--motion-ease-settle cubic-bezier(0.22,1,0.36,1)`.

### Motion JS (`app/family/motion.ts`)
Objet `MOTION as const`: `duration.reveal 0.6`, `ease.settle 'settle'`,
`reveal {distance 24, start 'top 85%', stagger 0.08}`, `parallax {travel 1.5, scrub 1.2}`,
`entrance {distance 20, duration 0.7, stagger 0.09, delay 0.15}`. Helpers:
`registerGsap()`, `prefersReducedMotion()`. Ne jamais écrire de littéral de motion;
consommer `MOTION`.

---

## 2. Typographie (`app/assets/css/typography.css`)

Réutiliser ces classes pour TOUT texte. Ne jamais inventer une échelle.

- Titres: `wf-h1` `wf-h2` `wf-h3` `wf-h4` `wf-h5` (tous fluides via `clamp()`,
  `font-display`). Titre de section = toujours `<h2 class="wf-h2">`. Pas de `wf-h6`.
- Corps: `wf-body-1` (1.8rem), `wf-body-2` (1.6rem), `wf-body-3` (1.4rem muted).
- Surtitre / label: `wf-caption` (uppercase, muted). **C'est l'eyebrow.** Pas de
  `wf-eyebrow` ni `wf-kicker`.
- Légende d'image: `wf-figcap` (muted, non-uppercase, sur le `<figcaption>`).
- Modificateurs couleur composables: `wf-text-muted`, `wf-text-base`, `wf-text-accent`.
- **Lead / intro**: pas de classe dédiée. Combo canonique = `wf-body-1` ou
  `wf-body-2` + `wf-text-muted`.

CSS structurel bespoke autorisé (placement, filets, grilles internes) mais la typo
de base passe TOUJOURS par les classes ci-dessus.

---

## 3. Grille (`app/assets/css/grid.css`)

- `.section-grid`: 4 colonnes sous 1024px (gap 1.6rem), 12 colonnes au-dessus
  (gap 4.8rem). Bascule par **`@container site`**, le même mécanisme que les
  placements de blocs (amendement du 9 juin 2026, D7: l'ancienne media query
  viewport se désynchronisait des placements de blocs avec les scrollbars
  classiques). Prérequis: tout consommateur de `.section-grid` vit sous un
  conteneur nommé `site` (`.wf-site`, `.wf-dev-layout`, `.wf-dev-grid`).
- `.subgrid`: à poser sur un enfant multi-colonnes pour réexposer les pistes.
- `col-span-N` / `col-span-full` (Tailwind v4) restent utilisables pour un span
  statique. Les variantes viewport (`md:col-span-*`, `lg:col-span-*`) sont
  PROSCRITES: elles basculent au viewport pendant que la grille bascule au
  conteneur (amendement du 9 juin 2026, D7).
- **Convention de placement observée**: les blocs combinent `.section-grid` avec une
  classe bespoke (`section-grid wf-foo-grid`) et placent les colonnes en CSS via
  `grid-column` sous `@container site`, PAS via `col-span-*` dans le template.
  L'ancienne exception du hero (`col-span-full lg:col-span-7` dans le template)
  est résorbée: lui aussi place ses colonnes via `grid-column` sous
  `@container site`. Pour un nouveau bloc: suivre la convention CSS `grid-column`
  (dominante). DevGrid: Ctrl+G.

---

## 4. Anatomie d'un bloc régulier

### Les 4 fichiers à créer pour un bloc `foo`
1. `app/content/foo.ts` → `export interface FooContent {...}` + `export const FOO_CONTENT: FooContent = {...}`.
2. `app/types/blocks.ts` → `import type { FooContent } from '~/content/foo'`, puis
   `export type FooBlock = BlockBase<'foo'> & FooContent`, puis `| FooBlock` dans l'union `PageBlock`.
3. `app/components/page-builder/regular/block/foo.vue`.
4. `app/components/page-builder/regular/block-map.ts` → import + entrée `foo: Foo`.

### SFC (ordre verrouillé: script, template, [style])
```vue
<script setup lang="ts">
import type { FooBlock } from '~/types/blocks'
const foo = defineProps<FooBlock>()  // typé contre FooBlock, PAS FooContent
</script>

<template>
  <section class="wf-section wf-foo" id="foo">
    <div class="wf-container">
      <div class="section-grid wf-foo-grid">
        <div class="wf-foo-copy" data-reveal-stagger>
          <div class="wf-caption">{{ foo.eyebrow }}</div>
          <h2 class="wf-h2">{{ foo.heading }}</h2>
          <p class="wf-body-2 wf-text-muted">{{ foo.lead }}</p>
        </div>
        <figure class="wf-foo-photo" data-reveal>
          <Image :src="foo.photo.src" :alt="foo.photo.alt" :ratio="foo.photo.ratio" tone="base" />
          <figcaption class="wf-figcap">{{ foo.figcaption }}</figcaption>
        </figure>
      </div>
    </div>
  </section>
</template>
```
- `defineProps` assigné à une const nommée d'après le bloc (`foo`), jamais `props`.
- **Pas de `<style scoped>`** dans un bloc. Tout le CSS structurel va dans
  `global.css` sous une bannière de section (voir §5).
- Placement responsive en CSS via `grid-column` + `@container site`:
```css
.wf-foo-photo { grid-column: 1 / -1; margin: 0; }
.wf-foo-copy  { grid-column: 1 / -1; }
@container site (min-width: 1024px) {
  .wf-foo-photo { grid-column: 1 / span 5; }
  .wf-foo-copy  { grid-column: 6 / -1; }
}
```
- Rythme vertical du bloc: `.wf-section` porte déjà `padding-block: var(--space-block-default)`.
  Pour le palier serré, surcharger `padding-block: var(--space-block-tight)` dans la
  classe bespoke. Jamais de padding-block en px/rem en dur.
- En-tête de section: composant **`<SectionHead>`** (props `eyebrow?`, `heading`,
  `lead?`, `ctas?`). Disposition automatique selon le contenu: split (titre à gauche,
  description + CTA à droite) dès qu'il y a une description ou un CTA; titre seul élargi
  (8 cols) sinon. Règle CTA encapsulée (CTA en flux): 1 = lien à filet,
  2 = boutons; exception surfaces de conversion au §8. Posé sur
  `.section-grid`, CSS `.wf-shead`. La base `.wf-section-head` (empilé, 56ch) subsiste
  pour faq, MediaGallery et les en-têtes d'articles connexes.
- Adaptation de shape pour piloter une primitive: en `computed` dans le script (ex.
  faq.vue mappe `{q,a}` → `{title,content}` pour `<Accordion>`), jamais dans le contenu.

### Types (`app/types/blocks.ts`)
```ts
type BlockBase<T extends string> = { _type: T; _key: string }
export type FooBlock = BlockBase<'foo'> & FooContent
export type PageBlock = AboutBlock | ServicesBlock | ... | FooBlock
```

### Block-map (`.../regular/block-map.ts`)
```ts
import Foo from './block/foo.vue'
export const regularBlockMap = { about: About, /* ... */ foo: Foo } as const
```
Clé = littéral `_type` (anglais, lowercase). `as const` obligatoire. Le héros n'y
figure JAMAIS.

---

## 5. CSS des blocs: où et comment

- Le CSS structurel des blocs vit dans `app/assets/css/global.css`, sous une bannière
  de section (`/* ─── FOO ─── */`), en cohérence avec la carte de migration du fichier
  (destination `webforge-minimaliste`). **Décision retenue: on continue dans
  global.css** (bundle famille unique, extractible tel quel). Si la lisibilité
  souffre, on scindera plus tard; pas de `<style scoped>` dans les blocs.
- Uniquement des tokens. Container queries `@container site`. Filets via `--line-*`.

---

## 6. Anatomie d'un bloc d'article

Dossier `app/components/page-builder/article/block/`, registré dans
`article/block-map.ts`. Même mécanique que le régulier, orchestrateur
`article/index.vue` déjà en place. Type local actuel:
`ArticleBlock = { _type: keyof typeof articleBlockMap; _key: string }`.

Quand on remplit l'article: typer chaque bloc proprement (interfaces `XContent` dans
`content/` ou un `content/article-blocks.ts` dédié), enrichir `articleBlockMap`, et
décider si on promeut un type `ArticleBlock` discriminé dans `types/blocks.ts` (à
faire dès qu'il y a 2+ blocs article, pour la sécurité du dispatch). Les blocs
article restent serrés et lisibles (chapô, corps riche, image, citation, galerie,
encadré, CTA en ligne).

---

## 7. Héros (imposés par type de page, hors block-map)

Dossier `app/components/hero/`. Le héros coiffe la page, le page-builder rend le
reste. Le héros n'a PAS de wrapper `_type`/`_key`: il consomme son contenu en props
étalées.
```ts
const hero = withDefaults(defineProps<PageHeroContent>(), { eyebrow: undefined })
```
`withDefaults(..., { champOptionnel: undefined })` est OBLIGATOIRE pour tout champ
optionnel (sinon le compiler infère `required: true`).

Héros à créer: `page` (pages niveau 2), `detail` (service/projet), `article` (blog).
`home` existe, ne pas toucher. Chacun: structure `.wf-hero*` sur `.section-grid`,
typo `wf-*`, `data-reveal`/`data-reveal-stagger`, `useEntrance(heroRef)` au montage,
`<Image loading="eager">` pour le visuel above-the-fold.

Contenu des héros: étendre la couche `useHeroContent` pour qu'elle soit indexée par
page (le commentaire du fichier annonce déjà `useHeroContent(key)`).

---

## 8. Primitives réutilisables (API exactes + pièges)

Réutiliser, ne jamais réinventer. Auto-import Nuxt.

### `<Image>` (`fragments/images/Image.vue`)
Rend un `<NuxtImg>` responsive (srcset + sizes, webp). En statique pur, @nuxt/image
résout seul `ipxStatic` au build (génère les `/_ipx/`) et `ipx` en dev (sert les
images): NE PAS forcer `image.provider` (le forcer casse les images en dev).
Sans `src` → placeholder visuel
élégant (mode démo). Props: `src?` `alt?` `ratio?` (défaut `'4/3'`, chaîne CSS libre)
`sizes?` `label?` `caption?` `tone?` (`'alt'|'base'`, défaut `'alt'`) `loading?`
(`'eager'|'lazy'`, défaut `'lazy'`) `parallax?` (défaut **true**).
- **Prop `sizes`** (défaut `'sm:100vw md:100vw lg:50vw xl:50vw xxl:50vw'`): syntaxe
  @nuxt/image avec alias d'écran (`sm:` `md:` `lg:` `xl:` `xxl:`). **PIÈGE (vérifié
  dans la source `getSizes`): @nuxt/image ne génère une largeur candidate QUE pour les
  clés d'écran NOMMÉES dans la chaîne, pas pour tous les `screens` configurés.** Deux
  conséquences: (1) une entrée nue sans clé (`100vw` seul) dégénère en `1w, 2w` (junk
  inutile); (2) si on ne nomme pas les hauts breakpoints (`xl`, `xxl`), le plafond du
  srcset reste à la plus haute clé nommée. Ex.: `"100vw lg:50vw"` plafonne à 50% × 1024
  = 512px (×densité 2 = 1024px), donc l'image ramollit sur grand écran et Retina.
  Toujours nommer les écrans jusqu'à `xxl`. Selon la colonne occupée:
  pleine largeur `"sm:100vw md:100vw lg:100vw xl:100vw xxl:100vw"`; split 5/7 ou 6/6
  `"sm:100vw md:100vw lg:50vw xl:50vw xxl:50vw"`; tiers (galerie)
  `"sm:100vw md:50vw lg:33vw xl:33vw xxl:33vw"`; quart
  `"sm:50vw md:50vw lg:25vw xl:25vw xxl:25vw"`; largeur fixe (image de corps d'article,
  mesure ~72ch) `"sm:100vw md:768px"`. Les densités `[1,2]` sont déjà actives par
  défaut de @nuxt/image (elles fournissent le 2x): inutile de les configurer.
- Image décorative: `:parallax="false"`. Above-the-fold: `loading="eager"`.
- **Texte alternatif: attribut toujours présent, texte facultatif.** Le champ
  `figure.alt` du Studio est RECOMMANDÉ mais jamais bloquant (validation
  `.warning()`, contrairement à `label`/`caption` qui sont `.required()`): choix
  délibéré, sur l'avis d'une spécialiste en accessibilité. Au rendu, `<Image>`
  émet TOUJOURS l'attribut `alt` sur le `<img>`, vide au pire (`alt=""`). Un
  attribut `alt` absent est un échec WCAG 1.1.1; un `alt` vide, lui, marque
  correctement une image décorative pour les lecteurs d'écran. Conséquence: pas de
  champ « décorative » distinct, une image décorative se déclare en laissant `alt`
  vide. `transform.ts` (`resolveFigure`: `alt: figure.alt ?? ''`) et `Image.vue`
  (prop `alt` défaut `''`) garantissent la présence de l'attribut.

### `<Button>` (`button/index.vue`)
Props: `href?` `kind?` (`'internal'|'external'|'anchor'`) `variant?`
(`'primary'|'ghost'`, défaut primary) `size?` (`'default'|'sm'`) `type?`
(`'button'|'submit'`) `disabled?` `icon?` (nom Iconify ou `false`).
- **PIÈGE: pas de variant `secondary`**. C'est `primary` / `ghost`.
- Rendu auto: pas de `href` → `<button>`; `kind="internal"` → `<NuxtLink>`;
  `kind="external"` → `<a target=_blank rel=noopener>`; `kind="anchor"`/absent → `<a>`.
- Label = slot par défaut.

### `<LinkAnchor>` / `<LinkInternal>` / `<LinkExternal>` (`link/*`)
Liens TEXTE (classe `wf-link`), distincts de `<Button>`.
- `<LinkAnchor>` prop **`href`**: ancre `#...` même page.
- `<LinkInternal>` prop **`to`** (pas `href`!): route interne `/...`. ← le cas multipage.
- `<LinkExternal>` prop **`href`**: URL externe (ajoute icône + sécurité auto).

### `<Accordion>` (`accordion/index.vue`)
Props: `items: {title,content}[]` `mode?` (`'single'` défaut = un seul ouvert)
`defaultOpen?` (indices) `headingLevel?` (2-6, défaut 3) `numbered?` `faqSchema?`.
Slots `#title` / `#content` (scope `{item,index}`) pour contenu riche. A11y complète
gérée dedans (clavier, aria, focus). Pas de `v-model`. **`faqSchema` n'active le
balisage Schema.org FAQPage que si c'est une vraie FAQ.**

### `<Modal>` (`modal/index.vue`)
Piloté par `useOverlayStore()` (`open(id)` / `isActive(id)` / `close()`), PAS de
`v-model`. Props: `id` `label` (i18n) `placement?` `size?` `backdrop?`
`closeOnBackdrop?` `closeOnEscape?`. Un seul overlay ouvert globalement.

### Formulaire / contact
Réutiliser le bloc `contact` existant + `useContactForm()` (états `idle`/`loading`/
`success`/`error`, honeypot + Turnstile injectés). Backend `server/api/contact.post.ts`
en mode démo (succès simulé sans clé Resend). Ne pas refactorer les couleurs en dur
du HTML courriel (exception justifiée).

### CTA: pattern à filet vs boutons (mémoire)
- **1 CTA** = lien à filet `.wf-rule-link` (trait fin + libellé + chevron). Au survol,
  un trait d'accent se révèle de gauche à droite (et sort par la droite au départ), et
  le chevron glisse légèrement.
- **2 CTA** = deux `<Button>` style hero (primary + ghost).
- Pour les en-têtes de section, ce pattern est encapsulé dans **`<SectionHead>`** (§4).
- **Exception surfaces de conversion** (amendement du 9 juin 2026, D9): une
  surface de conversion (`cta-band`, `inline-cta` d'article, CTA de héros) rend
  des `<Button>` même avec un seul CTA. Le lien à filet reste le pattern des CTA
  en flux (SectionHead, fins de blocs comme media-text).

---

## 9. Couche contenu et assemblage

### Pattern de contenu
Chaque fichier `content/x.ts`: `export interface XContent {...}` (PascalCase, suffixe
`Content`) + `export const X_CONTENT: XContent` (SCREAMING_SNAKE). Clés en anglais,
valeurs en français. Images = `{ ratio, src?, alt?, label, caption }` (src string en
V1).

### Source unique de site (`content/site.ts` via `useContent('site')`)
`useContent<K>(key)` expose 3 clés: `'site'`, `'legal'`, `'consent'` (synchrone). Tout
ce qui a besoin des coordonnées DÉRIVE de `SITE_CONTENT` (ex. contact.ts l'importe),
jamais de redéclaration.

### Banques vs collections (distinction critique)
- **Banques actuelles** (faq, testimonials): `{ eyebrow, heading, items[] }`, items
  SANS clé stable, rendus en bloc dans l'ordre. Suffisant pour une section unique.
- **Le brief demande plus**: sélection par référence (témoignages «vedette» ou par
  service/projet; FAQ par thème), et **collections adressables** (services détail,
  projets, articles, catégories) avec page de détail et relations. Ces dernières
  EXIGENT un `slug: string` (clé d'URL stable, anglais) et un `id`/référence pour les
  relations. À introduire (voir §10 et le plan).

### Assembleur de page (pattern `useOnePagerBlocks`, à calquer)
```ts
export function useXPageBlocks(): PageBlock[] {
  return [
    { _type: 'mediaText', _key: 'x-page-intro', ...SOME_CONTENT },
    { _type: 'cta-band',  _key: 'x-page-cta',   ...CTA_CONTENT },
  ]
}
```
- `_key` préfixé par la page, unique dans le tableau.
- Le héros n'y figure jamais (rendu à part par la page).
- Signature `(): PageBlock[]` synchrone (l'async Sanity vivra dans l'implémentation V2,
  signature stable).
- Résolution image (asset → URL) se fera ici en V2; les blocs voient toujours une string.

### Page (pattern `pages/one-pager/index.vue`, à calquer)
```vue
<script setup lang="ts">
import HeroPage from '~/components/hero/page.vue'
import PageBuilder from '~/components/page-builder/regular/index.vue'
definePageMeta({ layout: 'default' })
usePageSeo({ title: '...', description: '...' })
const hero = useHeroContent('services')
const blocks = useServicesPageBlocks()
</script>
<template>
  <HeroPage v-bind="hero" />
  <PageBuilder :blocks="blocks" reveal />
</template>
```
Multipage = `layout: 'default'`. `reveal` activé (opt-in scroll-reveal).

### SEO de page: `usePageSeo`, couche unique (amendement du 9 juin 2026)
Chaque page appelle `usePageSeo()` (`app/composables/usePageSeo.ts`) au lieu
d'empiler `useSeoMeta` / `useHead` / `useSchemaOrg`. Il couvre: titre SANS nom
de site (le gabarit du module @nuxtjs/seo ajoute « | {site.name} »),
description, og:image en URL absolue avec repli `/og/og-default.jpg`, métas
d'article (`type: 'article'`), option `noindex`, et le graphe Schema.org
centralisé (Organization, WebSite assaini, WebPage sous-typé, BreadcrumbList,
Article, LocalBusiness, FAQPage). Aucune page n'appelle ces primitives en
direct. Le composable est agnostique de la famille (aucun import Minimaliste ni
contenu de site): destination `webforge-core` au deuxième consommateur.

---

## 10. Routing, nav et prérendu (LE piège)

### Conflit racine à résoudre
- `/` = aujourd'hui une page d'aiguillage interne (`pages/index.vue`, noindex).
- `/multipage` = coquille placeholder.
- `/one-pager` = le seul site assemblé (à NE PAS toucher).
Objectif: le multipage occupe `/`. Réconciliation tranchée par Charles (voir §15).

### Nav mode-aware
`site.nav.primary` porte `anchor` (one-pager) ET `route` (multipage) par entrée. Mais
la nav one-pager (À propos/Services/Témoignages/FAQ) DIFFÈRE de la nav multipage
voulue (Services/Projets/À propos/Blog/Contact, FAQ au pied). On introduit une nav
spécifique au mode dans `site.ts` (ex. `nav.landing` conserve l'existant pour le
one-pager intact; `nav.multipage` porte les nouvelles routes). Le Header choisit selon
`mode`. **Corriger le bug Footer**: en multipage il rend `link.anchor`, il doit rendre
`link.route`.

### Prérendu (Cloudflare Workers statique)
`nitro.prerender = { crawlLinks: true, routes: ['/'] }`. Une route n'est générée que
si **liée par un lien crawlable depuis `/`** OU **listée dans `nitro.prerender.routes`**.
Sinon 404 statique silencieuse, sans erreur de build.
- Les routes nav (Header) et footer doivent rendre de vrais `<NuxtLink :to="route">`.
- **Pages non liées dans la nav** (détails service/projet, articles, archives de
  catégorie, pagination, FAQ au pied) DOIVENT être ajoutées explicitement à
  `nitro.prerender.routes`, générées depuis le route-map + les collections.
- **Gate de fin**: un check post-build vérifie que chaque route attendue existe dans
  `dist/`. Aucun 404 silencieux toléré.

### Couche d'assemblage des routes
- `app/config/route-map.ts`: déclare routes, libellés, fils d'Ariane. Source de la nav
  et des breadcrumbs.
- Assembleurs par page (composables) typés contre `types/blocks.ts`.
- Collections en `content/` (services, projets, articles, catégories), requêtées par
  les pages collection/détail.

### Schéma d'URL du blog (court, entériné par amendement du 9 juin 2026)
- `/blog`, `/blog/page/[n]`: liste paginée.
- `/blog/[categorie]`: archive de catégorie, au même niveau que les billets.
  Le segment `categorie` n'est PLUS réservé; le seul segment réservé sous
  `/blog` est `page` (racine de la pagination).
- `/blog/[article]`: article SANS catégorie (1 segment).
- `/blog/[categorie]/[article]`: article AVEC catégorie (2 segments).
- **Un article a 0 ou 1 catégorie. Jamais plusieurs.** Implémenté via attrape-tout
  `/blog/[...slug]` résolu (1 ou 2 segments) contre l'index de contenu au build;
  le résolveur priorise l'archive de catégorie sur un billet sans catégorie de
  même slug.
- La cohabitation est sécurisée par la garde de build `app/content/guards.ts`
  (`assertBlogCollections`, appelée depuis `nuxt.config.ts`: dev, build et
  generate échouent avant de produire quoi que ce soit): collisions de slugs
  (catégorie/catégorie, billet/catégorie, billet/billet), segment réservé
  `page`, et plafond d'archive à `ARTICLES_PER_PAGE` billets par catégorie tant
  que la pagination d'archive (`/blog/[categorie]/page/[n]`) n'existe pas.
  Échec de build clair plutôt que 404 silencieuse.
- `ARTICLES_PER_PAGE` (source unique: `app/content/articles.ts`) démarre bas (3)
  pour tester la pagination avec 6 articles.

**Politique d'indexation du blog (décision Charles):**
- **Articles** (`/blog/[article]` ou `/blog/[categorie]/[article]`): INDEXÉS et au
  sitemap.
- **Archives de catégorie** (`/blog/[categorie]`): INDEXÉES et au sitemap. Chaque
  page porte un contenu propre (titre + description de la catégorie via le héros,
  plus la liste de ses billets), donc pas de thin content. La description de
  catégorie est requise au Studio: la garder substantielle.
- **Pagination** (`/blog/page/[n]`): `noindex` au niveau page (`usePageSeo({
  noindex: true })` dans `pages/blog/page/[n].vue`) et HORS sitemap (contenu mince,
  dupliqué de la liste). Reste prérendue et atteignable par les liens internes.
- Le sitemap n'est PAS alimenté par découverte: il liste explicitement
  articles + catégories (jamais la pagination) via `SITEMAP_DYNAMIC_URLS` dans
  `nuxt.config.ts`, même source de slugs que le prérendu.

---

## 11. i18n

`strategy: 'prefix_except_default'` depuis T2b (amendement du 10 juin 2026,
conséquence de la décision 5 du §17): le français vit à la racine (URLs
inchangées), l'anglais sous `/en` avec segments et slugs traduits
(customRoutes générés par `app/config/route-map.ts`). Avant T2b:
`no_prefix`. `defaultLocale: 'fr'`, locales fr-CA / en-CA. Fichiers
`i18n/locales/{fr,en}.json`.
- Namespaces: `a11y.*` (chaînes assistives: skip link, aria, nav), `consent.*`
  (bannière de témoins) et `ui.*` (chrome produit VISIBLE réutilisable d'un site
  à l'autre: filtres, pagination, page d'erreur, libellés de cartes comme
  « Voir le projet » ou « En savoir plus »). Le namespace `ui.*` est officialisé
  par amendement du 9 juin 2026 (D6).
- **Toute nouvelle chaîne d'interface**: assistive → `a11y.*`; chrome visible
  réutilisable → `ui.*`. Toujours ajoutée AUX DEUX locales (parité fr/en stricte).
- Le contenu Atelier Cormier ne touche JAMAIS les JSON i18n.

---

## 12. Scroll-reveal et motion

- `v-reveal` est posé par l'orchestrateur sur le composant racine du bloc (prop
  `reveal` opt-in, défaut false). Ne pas le remettre dans le bloc.
- Dans le bloc, marquer les groupes en cascade: attribut `data-reveal-stagger` (sur
  header, grilles, colonnes; révèle les enfants directs) ou `data-reveal` (élément
  seul). Attributs HTML nus.
- Héros: `useEntrance(heroRef)` au montage (mêmes marqueurs).
- `<Image parallax>` (défaut) anime via `useParallax`. `prefers-reduced-motion`
  respecté par garde JS dans chaque hook.
- **Vitrine dev: pas de reveal** (`v-reveal="false"`). Le hero rejoue quand même son
  `useEntrance` (intrinsèque, non contournable).

---

## 13. Vitrine dev (`useBlockCatalog` + `BlockShowcase`)

Ajouter chaque nouveau bloc/héros à `app/composables/useBlockCatalog.ts`. Catégories,
`id` EXACTS: `'heros'`, `'reguliers'`, `'articles'`. Chaque item:
`{ label, type, variant?, component, props }`. Réutiliser le `regularBlockMap` et les
contenus locaux (props `{ _type, _key: 'showcase-x', ...CONTENT }`). `BlockShowcase`
enveloppe chaque bloc dans `.wf-site` (OBLIGATOIRE pour les `@container site`). Pages:
`pages/dev/blocs/{reguliers,articles,heros}.vue`.

---

## 14. Intention de design (cadrée)

Vrai design opiniâtre, esprit Minimaliste: Archivo, accent vert forêt, beaucoup de
blanc, lignes fines, retenue. Conversion d'abord: chaque page mène quelque part,
hiérarchie claire, preuve sociale bien placée. **Variété de mise en page** d'un bloc à
l'autre (asymétrie de la grille 12 cols, décalage, pleine largeur ponctuelle). Pas de
gabarit empilé monotone. Eyebrow avec parcimonie. Les en-têtes de section, eux, sont
**uniformes** via le composant `<SectionHead>` (intro cohérente d'un bloc à l'autre): la
variété de mise en page se joue dans le corps des blocs, pas dans l'en-tête.

---

## 15. Décisions structurantes (tranchées par Charles, 8 juin 2026) — FIGÉES

1. **Racine `/`**: l'aiguillage interne déménage sous `/dev` (route `/dev/sites`,
   gated noindex comme les autres pages dev). Le multipage occupe `/`. Le placeholder
   `/multipage` est supprimé. Les légales racine (`/conditions-utilisation`,
   `/politique-confidentialite`) servent le contexte multipage; le sous-arbre
   `/one-pager/*` reste intact.
2. **Images Nano Banana**: set curé. On génère un set cohérent haute valeur (héros des
   pages clés, portrait du fondateur, quelques projets vedettes, quelques couvertures
   de blog). Le reste pointe vers des chemins d'images rendus en placeholders soignés
   du composant `<Image>`. Build complet et navigable.
3. **Cadence**: tout d'un trait, rapport final. Construction autonome complète, un seul
   rapport de fin (build vert + routes prérendues + résultats de vérif). Build gardé
   vert de façon incrémentale.
4. **Art direction du héros home, reportée en V2** (amendement du 9 juin 2026,
   D23): les deux cadrages du héros home (desktop portrait, mobile paysage)
   passeront à un `<picture>` avec `<source media>` au branchement Sanity V2,
   quand les deux sources divergeront réellement. Dérogation documentée:
   `source media` est un attribut HTML résolu par le préchargeur du navigateur,
   qui ignore les container queries; la media query viewport y est acceptée (le
   héros home est plein viewport de toute façon). NuxtPicture ne gère pas
   l'art direction multi-sources: prévoir un `picture` manuel alimenté par
   `useImage().getSizes()`, encapsulé dans le fragment `Image.vue` ou un
   fragment dédié. D'ici là, les deux `<Image loading="eager">` togglés en CSS
   restent en place (mêmes sources en V1, le navigateur dédoublonne le fetch).
   À exécuter pendant la session Sanity V2.

---

## 16. Inventaire de construction (cible)

**Blocs réguliers à ajouter** (8): `media-text`, `cta-band`, `process`, `stats`,
`projects-preview`, `blog-preview`, `highlights`, `logos`.
**Blocs d'article** (7): `lead`, `rich-text`, `image`, `quote`, `gallery`, `callout`,
`inline-cta`.
**Héros** (3): `page`, `detail`, `article`.
**Gabarits de page** (11 + 2 légales): `/`, `/services`, `/services/[slug]`,
`/projets`, `/projets/[slug]`, `/a-propos`, `/blog`, `/blog/page/[n]`,
`/blog/[...slug]` (archives de catégorie et articles, schéma court du §10),
`/faq`, `/contact`, + `/conditions-utilisation`,
`/politique-confidentialite`.
**Couche assemblage**: `config/route-map.ts`, assembleurs par page, collections
`content/{projects,articles,categories}.ts` (+ détails services), banques enrichies
(slug/id + sélection).
**Contenu Atelier Cormier**: 4-6 services, 5-8 projets, 6 articles / 3 catégories,
banque FAQ, banque témoignages.

---

## 17. Sanity V2: conventions de branchement (amendement du 10 juin 2026)

### Convention d'organisation à deux régimes (AMENDÉE, remplace celle d'avant)
- **Interne PS** (démos WebForge, projets Patoine Studio, jamais transféré): tout
  vit dans **l'organisation Patoine Studio** (id `o7R0d3u6V`), un project Sanity
  par démo ou projet. Pour ce démo: project **« WebForge - Minimaliste Demo »**
  (id `fesilwqf`), dataset `production`. Le nom fictif Atelier Cormier reste dans
  le contenu et le code, jamais dans l'arborescence Sanity.
- **Vrai client** (transférable): organisation dédiée au nom du client, project
  dedans. À la livraison, on transfère l'organisation entière au client.

### Rails du branchement
- **Signatures stables, composants intacts**: `useContent`, `useHeroContent`,
  les assembleurs `usePageBlocks` et les collections (`useArticles`,
  `useProjects`, `useServices`, `useCategories`) changent d'implémentation
  interne (GROQ au build), pas de signature. Aucun composant de bloc ne bouge.
  Les blocs continuent de voir les images en `src` string (résolution
  asset → URL dans la couche composable, jamais dans les blocs).
- **Statique pur conservé**: `generate` + prérendu restent le mode de
  production. Les routes de prérendu, la garde de build du blogue
  (`app/content/guards.ts`) et le gate de routes consomment Sanity au build.
- **Référence technique**: la plomberie (packages, config, preview) se calque
  sur `nuxt-sanity-test` (project Sanity « Nuxt Sanity Test », id `7ydmagn8`),
  adaptée à l'architecture WebForge; on ne réinvente pas ce qui marche.
- **Secrets**: tokens et ids sensibles dans `.env` jamais commité,
  `.env.example` tenu à jour.
- **Posture commerciale inchangée**: Sanity reste un outil interne PS, jamais
  mentionné aux clients des paliers 1 et 2.

### Décisions tranchées par Charles (10 juin 2026)
1. **Studio**: vit à `studio/`, déclaré workspace yarn (seul workspace du repo,
   AUCUN lockfile séparé). Le couple app + studio est le gabarit transposable aux
   repos clients. Nuxt l'ignore (`ignore: ['studio/**']`). Un studio par
   repo/famille. Les schémas migreront vers le package publié `webforge-minimaliste`
   au deuxième consommateur.
2. **Composition des pages dans Sanity**: chaque page fixe = un document avec
   son array `pageBuilder` (seedé pour reproduire l'assemblage actuel). Les
   blocs « intelligents » (services, testimonials, faq, projects-preview,
   blog-preview) stockent copie + paramètres de sélection (vedettes, par
   service, manuel par références, limite); la résolution des items vit dans
   la couche composable (GROQ). Le héros reste un champ dédié HORS du
   pageBuilder.
3. **One-pager**: document singleton dédié `onePager`, même héros home et même
   bibliothèque de blocs (zéro schéma dupliqué), section démarquée
   « One-Pager (palier 1) » dans le desk.
4. **Preview / statique**: production `main` = statique pur, AUCUN visual
   editing dans le build statique (ni stega ni token). Preview = dev local
   (Presentation tool → localhost:3000) maintenant; au branchement Cloudflare,
   branche `preview` déployée en SSR, noindex, dédiée au Presentation tool.
   Même code sur les deux branches: la divergence passe par variables
   d'environnement seulement, jamais par du code de branche.
5. **Démo bilingue fr/en**: contenu seedé dans LES DEUX langues via
   `@sanity/document-internationalization` (un document par langue,
   `translation.metadata`, slugs indépendants par langue). Le front suit
   (Temps 2): URLs françaises à la racine, anglaises sous `/en`
   (`prefix_except_default`, pattern nuxt-sanity-test), switcher de langue.
   Seed: copie FR auditée conservée et enrichie où mince; EN rédigé au même
   niveau de qualité.
```
