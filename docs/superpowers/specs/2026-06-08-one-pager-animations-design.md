# Polissage des animations du one-pager Minimaliste

Spec de conception. Démo `apps/webforge-minimaliste-demo/`, route `/one-pager`.
Date 2026-06-08. Statut: approuvé par Charles, en implémentation.

## Objectif

Trois effets de polissage sur le one-pager Atelier Cormier, dans le respect des
trois disciplines WebForge (aucune valeur design en dur, aucun texte UI en dur,
aucun contenu en dur) et de `prefers-reduced-motion`:

1. **Survol accordéon (FAQ)** — affordance « c'est cliquable » sur l'en-tête.
2. **Parallaxe Image** — prop optionnelle pour une translation verticale au scroll.
3. **Scroll-reveal** — apparition des blocs à l'entrée dans le viewport.

## Décisions structurantes (tranchées par Charles)

- **Moteur: GSAP + ScrollTrigger.** Licence 100 % gratuite pour usage commercial
  depuis avril 2025 (acquisition de GreenSock par Webflow), donc livrable dans le
  code source client sans enjeu. Première lib d'animation du repo.
- **Intégration: plugin léger + abstractions WebForge minces.** GSAP ne fuit pas
  dans les composants: le reveal passe par une directive `v-reveal`, la parallaxe
  est encapsulée dans `Image.vue` derrière une prop. Tout reste déclaratif et
  portable vers `webforge-core` au 2e site.

## Architecture

### Couche tokens motion (source unique)

`prefers-reduced-motion` mis à part, les valeurs de motion vivent en deux faces
synchronisées, jamais en littéraux dans les composants:

- `app/family/motion.ts` — face JS pour GSAP (durées en secondes, eases, distances,
  positions de déclenchement). Expose `MOTION`, `registerGsap()` (idempotent,
  enregistre ScrollTrigger + CustomEase et crée l'ease « settle »),
  `prefersReducedMotion()`.
- `app/family/tokens.css` — face CSS pour les effets pilotés en CSS (survol
  accordéon): `--motion-duration-hover`, `--motion-ease-settle`.

Les deux faces partagent la même courbe **« settle » = `cubic-bezier(0.22, 1, 0.36, 1)`**
(la courbe bespoke déjà dominante du repo). Côté GSAP elle est reproduite à
l'identique via `CustomEase.create('settle', 'M0,0 C0.22,1 0.36,1 1,1')` (les points
de contrôle du bezier deviennent ceux du segment cubique SVG).

Le fichier `motion.ts` vit dans `app/family/` parce que la motion est une décision
de famille: il part avec la famille Minimaliste à l'extraction.

**Hors périmètre:** on ne refactore PAS les ~14 durées et 4 courbes littérales déjà
éparpillées dans `global.css`. Nettoyage séparé, pour ne pas empiler.

### Effet 1 — Survol accordéon (CSS pur)

Cible: `<button class="wf-accordion__trigger">` dans `accordion/index.vue` (seul
élément cliquable; le tiroir n'est pas un clic, l'affordance vit sur l'en-tête).
GSAP n'intervient pas: un hover est du ressort du CSS.

CSS dans `global.css` (bloc accordéon existant, ~826-909):
- On garde le virage couleur existant (texte + chevron vers `--accent-1`), durée
  tokenisée en `var(--motion-duration-hover)`.
- On ajoute un **filet d'accent vertical dans la gouttière gauche** (`::before`,
  2px `--accent-1`, hauteur 0 → 55 % au survol) et un **léger retrait du titre**
  (`translateX` ~8px).
- Gating: filet + couleur réservés au pointeur fin (`(hover: hover) and (pointer:
  fine)`) pour éviter le hover collant au tactile. Le retrait (mouvement) est en
  plus réservé à `prefers-reduced-motion: no-preference`. Sous reduced-motion, il
  reste la couleur et le filet (changements d'état, transitions neutralisées par
  le reset global).

Le traitement exact (filet vs teinte de fond vs nudge) sera ajusté en direct sur le
serveur de dev; le défaut implémenté est filet + retrait + couleur.

### Effet 2 — Parallaxe Image (prop + GSAP)

`app/components/fragments/images/Image.vue`:
- Nouvelle prop optionnelle `parallax?: boolean` (défaut `false`). Additive: la
  signature gelée `<Image :src :alt :ratio :loading />` ne bouge pas.
- Quand `parallax` ET `src`: variante avec cadre `.wf-image-parallax`
  (`overflow:hidden`, `aspect-ratio`) contenant une `<img>` surdimensionnée
  (`height:130%`, centrée) que ScrollTrigger translate verticalement. La géométrie
  de débordement est mécanique à l'effet (commentée), pas une valeur de design.
- Logique extraite dans `app/composables/useParallax.ts` (portable webforge-core):
  `gsap.fromTo(img, {yPercent: -travel}, {yPercent: travel, scrub})`, déclenché sur
  le cadre. Client-only (`onMounted`), no-op sous `prefersReducedMotion()`, nettoie
  son ScrollTrigger au démontage.

**Périmètre V1:** visuel **héros desktop seulement** (`hero/home.vue`, prop `parallax`
sur l'`<Image>` desktop). La photo About reste en `position:sticky` (ne pas combiner
sticky + parallaxe). Le floater Services reste exclu (déjà suivi-curseur JS). La prop
reste disponible pour réutilisation ailleurs.

### Effet 3 — Scroll-reveal (directive v-reveal + GSAP)

- `app/directives/reveal.ts` — directive `reveal`: `gsap.from(el, {opacity:0,
  y:distance, ease:settle, scrollTrigger:{start:'top 85%', toggleActions:'play none
  none none'}})`. Une seule fois à l'entrée. Enregistrée globalement par un plugin
  **universel** `app/plugins/reveal.ts` (pas `.client`) pour être résolue au
  SSR/prerender sans warning; ses hooks `mounted`/`unmounted` ne tournent qu'au
  client de toute façon.
- **Opt-in** via prop `reveal?: boolean` (défaut `false`) sur l'orchestrateur
  `page-builder/regular/index.vue`, appliquée en `v-reveal="reveal"` sur chaque
  `<component>` de la boucle. La page `/one-pager` passe `reveal`. Comme
  l'orchestrateur `regular` est partagé (futur multipage, catalogue de blocs dev),
  l'opt-in évite de révéler des blocs là où ce n'est pas voulu.
- Le héros, rendu hors boucle par la page, n'est pas affecté (voulu, above-the-fold).
- **Stagger** par `<li>` (Services, Témoignages): différé (YAGNI V1), la structure
  le permettra plus tard sans refonte.

### Accessibilité et reduced-motion

Principe transverse: **le contenu est toujours visible sans JS et sous
`prefers-reduced-motion: reduce`. Rien n'est jamais caché de façon permanente.**

- Reveal: la directive sort tôt sous `prefersReducedMotion()` → l'élément reste à
  son état naturel (visible). Le HTML statique rend aussi visible (les hooks ne
  tournent pas au SSR).
- Parallaxe: le composable sort tôt sous `prefersReducedMotion()` → aucune
  transformation JS (le reset CSS global ne couvre pas les transforms JS, d'où le
  garde explicite).
- Survol accordéon: voir effet 1.

## Fichiers

Nouveaux:
- `app/family/motion.ts`
- `app/directives/reveal.ts`
- `app/composables/useParallax.ts`
- `app/plugins/reveal.ts`

Modifiés:
- `app/family/tokens.css` (tokens motion CSS)
- `app/assets/css/global.css` (survol accordéon)
- `app/components/fragments/images/Image.vue` (prop parallax + variante + CSS)
- `app/components/page-builder/regular/index.vue` (prop `reveal` + `v-reveal`)
- `app/pages/one-pager/index.vue` (passe `reveal`)
- `app/components/hero/home.vue` (parallaxe héros desktop)
- `apps/webforge-minimaliste-demo/package.json` (dépendance `gsap`)

## Suivis (hors périmètre de ce chantier)

- Refactor des durées/courbes littérales existantes de `global.css` vers la couche
  tokens motion.
- Stagger par élément sur les blocs à liste (Services, Témoignages).
- Vignette motion au hub `/dev` (styleguide), si on veut documenter les effets.
- Réglage fin en direct de l'intensité parallaxe et du traitement de survol.
