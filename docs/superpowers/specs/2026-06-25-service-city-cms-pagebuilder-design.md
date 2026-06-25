# Refonte CMS: service et serviceCity vers Contenu + pageBuilder

Date: 2026-06-25
Statut: RÉALISÉ (non commité). Schéma + Studio déployés, 24 docs live migrés, `nuxt
generate` vert (210 routes). Reste: miroir `studio/seed-content.json` + commit.
Famille: Ancrée (WebForge), démo Rempart Extermination
Project Sanity: 5if00rwn, dataset production

## Objectif

Rendre l'édition d'un `service` (collection) et d'un `serviceCity` (collection) aussi simple
et logique qu'un singleton: deux onglets seulement, Contenu et Référencement, où le corps de
la page se compose en sections via un pageBuilder (comme l'accueil ou à propos). Retirer la
complexité actuelle (objets de détail figés, onglets multiples, relations par service mortes),
corriger les erreurs rouges du Studio, offrir un sélecteur d'icônes visuel, puis déployer le
schéma et migrer le contenu live.

## Décisions tranchées (Charles, 2026-06-25)

1. Composition: héros[1] + pageBuilder (parité de structure avec les singletons), pas un héros
   dérivé des champs.
2. Villes: parité complète. `serviceCity` reçoit pageBuilder + Référencement; la page ville se
   rend via PageBuilder (nouveau composable de blocs).
3. Sections du corps: blocs distincts. « Processus » devient un bloc de plein droit. « Points
   forts » reçoit un traitement visuel différent (plus une seconde grille de tuiles).
4. Héros détail: masthead conservé. Le héros[1] est un masthead (surtitre, titre, accroche,
   appel, fil d'Ariane dérivé), sans image pleine. Le look actuel des pages détail et ville
   reste intact. Aucune image requise pour les villes.

## Diagnostic des erreurs rouges (vérifié sur le dataset)

Trois sources distinctes, pas une seule.

1. Slug des villes en rouge (capture Laval). Les deux Laval (fr et en) partagent
   `slug.current = "laval"` (`sameSlugCount: 2`), et le champ slug n'a aucun `isUnique` sur
   mesure (`studio/schemas/documents/service-city.ts:30-42`). La vérif d'unicité par défaut de
   Sanity voit deux docs au même slug et marque rouge. Les services ne rougissent pas parce que
   leurs slugs sont traduits, donc différents par langue.
2. Onglet « Page de détail » des villes en rouge. Le champ `body` est déclaré
   `array of [{ type: 'text' }]` (`service-city.ts:69-75`), mais la donnée live contient des
   blocs Portable Text (`bodyMemberTypes: ["block","block","block"]`). Type inattendu, rouge.
3. Services en rouge (fourmis charpentières, hors capture mais réel). Le schéma déployé ne
   connaît pas encore le type `editorial` ni le champ `service.detail.editorial`, alors que la
   donnée live le porte. Champ inconnu, rouge.

Correctifs: (1) un `isUnique` qui ignore la traduction jumelle; (2) le champ `body` disparaît au
profit du pageBuilder; (3) déploiement du schéma. Aucun draft en cause, aucun champ requis
manquant, donnée saine partout.

## Modèle cible

### service: deux onglets

Onglet Contenu (`content`, défaut):
- `language` (string, hidden, piloté par le plugin i18n)
- `icon` (string, branché sur `LucideIconInput`) [carte]
- `title` (string, requis) [carte, listes, fil d'Ariane, preview]
- `slug` (slug, requis, traduit par langue, `isUnique` scopé par langue)
- `summary` (text, requis) [carte]
- `image` (figure 4:3, requis) [carte]
- `order` (number, requis) [tri de la grille] (déplacé depuis Relations et tri)
- `featured` (boolean) [grille] (déplacé depuis Relations et tri)
- `hero` (array verrouillé à 1 `detailHero`, requis, `maxItemsInput(1)`) [masthead de la page]
- `pageBuilder` (array de blocs) [corps de la page]

Onglet Référencement (`seo`):
- `seo` (type `seo`) [nouveau sur service; aujourd'hui le SEO est dérivé en code]

Retraits sur service: l'objet `detail` complet, les champs `meta` (fondu dans
`hero.eyebrow`), `intro` (migré en bloc éditorial), `benefits` (migré en bloc points forts),
`related` (mort au rendu).

### serviceCity: deux onglets

Onglet Contenu (`content`, défaut):
- `language` (string, hidden)
- `city` (string, requis) [carte, titre, preview]
- `slug` (slug, requis, partagé fr/en, `isUnique` scopé par langue)
- `region` (string) [carte]
- `note` (string) [carte]
- `order` (number, requis) [tri de la grille] (déplacé depuis Relations et tri)
- `featured` (boolean) [grille] (déplacé depuis Relations et tri)
- `hero` (array verrouillé à 1 `detailHero`, requis) [masthead]
- `pageBuilder` (array de blocs) [corps]

Onglet Référencement (`seo`):
- `seo` (type `seo`) [déjà présent]

Retraits sur serviceCity: les onglets « Page de détail » (`heading`, `lead`, `body`) et
« Relations et tri ». `heading`/`lead` sont fondus dans le héros[1]; `body` est migré en bloc
éditorial.

### Nouveau type Studio: detailHero (masthead)

Type objet `detailHero` (titre FR « En-tête de page »), membre unique du champ `hero` des
collections. Aligné sur l'esprit de `pageHero` mais sans image pleine.

Champs:
- `eyebrow` (string) [surtitre; ex. le « Repère » du service, ou « Villes » pour une ville]
- `title` (string, requis) [H1 de la page]
- `lead` (text, rows 3) [accroche]
- `cta` (link, optionnel) [bouton; par défaut l'appel direct est rendu en code si absent]
- `tone` (string, liste clair/foncé, optionnel) [préserve le masthead clair des services et
  foncé des villes; initialValue par type]

Le fil d'Ariane n'est pas stocké (dérivé du route-map au rendu, comme `pageHero`).

Côté front: le composant `app/components/hero` rend déjà `hero-page`. On branche `detailHero`
sur la même sortie masthead (ou on conserve `hero-page` comme forme de rendu, alimentée par le
transform). Le masthead clair (service) et foncé (ville) restent atteignables via `tone`.

### Bloc promu: process

`process` (étapes posées) devient un bloc de pageBuilder de plein droit, au lieu d'un
sous-objet de `detail`. Le composant `app/components/page-builder/regular/block/process.vue`
et `transformProcess` sont réutilisés. À ajouter: schéma Studio `process` (bloc), entrée dans
`pageBuilderField` (`of:`), `PAGE_BLOCK_TYPE_MAP`, `ANCHOR_KEY`, `SanityRawBlock`, projection
dans `queries/blocks/page-builder.ts`.

### Bloc nouveau: points forts (highlights)

Bloc `highlights` pour « ce que vous obtenez », visuellement distinct du processus (plus une
grille de trois tuiles à pastille ambre). Champs: `eyebrow` (optionnel), `heading` (optionnel),
`items` (array de `{ title, body }`). Traitement visuel à définir au build (piste: liste posée
deux colonnes, ou bandeau aligné, base blanche, sans pastille jumelle du processus).

### Correctif slug: isUnique scopé par langue

Helper de slug partagé avec un `isUnique` qui considère unique un slug dont le seul homonyme est
sa traduction (même `slug.current`, langue différente). Appliqué à `serviceCity.slug` (partagé,
cause directe du rouge) et à `service.slug` (traduit, sans effet négatif, par cohérence). Forme:
`isUnique` qui filtre par `_type` et exclut les documents de l'autre langue, ou scope l'unicité
par `_type && language`.

### Sélecteur d'icônes

Brancher le composant existant `studio/components/lucideIconInput.tsx` (grille visuelle +
recherche, stocke `lucide:nom`) sur `service.icon`, exactement comme `studio/schemas/objects/proof.ts:20`.
Deux lignes (import + `components: { input: LucideIconInput }`). Aucun impact sur le transform
(`app/sanity/transform.ts:1254`, passe-plat) ni sur le front (`services-grid/index.vue:27`,
`block/services.vue:36`). Optionnel: ajouter `@iconify-json/lucide` en devDependency du studio
pour ne plus dépendre du hoisting de workspace.

## Pipeline front

### Projection GROQ
- `app/queries/blocks/page-builder.ts`: ajouter la projection du bloc `process` et du bloc
  `highlights`; le bloc `editorial` y est déjà.
- `app/queries/pages/_shared.ts` (`collections()`): projeter `hero` (via la projection héros),
  `pageBuilder` (via `PAGE_BUILDER_PROJECTION`) et `seo` sur `service` et `serviceCity`.
- `app/queries/fragments/detail.ts`: supprimer (ou réduire à néant). `SERVICE_DETAIL_PROJECTION`
  et l'import `EDITORIAL_FIELDS` n'ont plus lieu d'être. Vérifier le point d'injection sur
  `services[]`.
- `PROCESS_PROJECTION` (`queries/fragments/cta.ts:24-30`): migré dans la projection du bloc
  process.

### Transform (`app/sanity/transform.ts`)
- Supprimer `ServiceDetailPayload` et `transformServiceDetail`.
- `transformService`: remplacer la composition `detail` par `hero: asPageHero(...)` (masthead),
  `pageBuilder: transformPageBuilder(raw.pageBuilder, ...)`, `seo: resolveSeo(...)`. Retirer
  `related`.
- `transformServiceCity`: ajouter `hero`, `pageBuilder`, conserver `seo`. Retirer `heading`,
  `lead`, `body`.
- `transformProcess`/`ProcessPayload`: migrer dans `transformBlock` (switch des blocs) +
  ajouter au mapping de types et d'ancres.
- Ajouter `transformHighlights` + le type bloc correspondant.
- Le masthead: introduire le rendu via `hero-page` alimenté par `detailHero` (eyebrow/title/
  lead/cta/tone), fil d'Ariane dérivé au composant de page.

### Types
- `app/types/sanity.ts`: supprimer `SanityServiceDetail`; ajouter `pageBuilder`, `hero` sur
  `SanityService` et `SanityServiceCity`; retirer `body`/`heading`/`lead` de `SanityServiceCity`.
- `app/types/blocks.ts`: ajouter les blocs `process` et `highlights` aux unions `PageBlock` et
  au mapping; le bloc `editorial` y est déjà.

### Composables (`app/composables/usePageBlocks.ts`)
- `useServiceBlocks`: réécrire en `computed(() => resolveBlocks(service.pageBuilder))`, aligné
  sur `useAboutBlocks`/`useHomeBlocks`. Supprimer la composition code (push editorial/process/
  testimonials/cta) et le helper `testimonialsBlock`.
- Ajouter `useCityBlocks` (nouveau), symétrique, sur `serviceCity.pageBuilder`.
- `resolveBlocks`: ajouter la résolution des nouveaux blocs si nécessaire (process et highlights
  sont autonomes, donc passe-plat).

### Pages
- `app/pages/services/[slug].vue`: le héros vient du masthead `service.hero` (via `<Hero>`);
  retirer le markup `intro` + `highlights` (devenus blocs) et leur CSS; `blocks` = `useServiceBlocks`.
  Le SEO passe par `service.seo` (resolveSeo) avec repli sur title/summary/image.
- `app/pages/villes/[slug].vue`: remplacer le `city__head` codé et le markup `body` + section
  services par `<Hero :hero="city.hero" />` + `<PageBuilder :blocks="useCityBlocks(city)" reveal />`.
  Le SEO conserve sa logique (titre complet Sanity vs gabarit).

## Migration du contenu live

Fail-fast: le build casse tant que le live n'est pas au nouveau modèle. La migration précède la
vérif de build. Via Sanity MCP (query, patch, publish), puis miroir dans `studio/seed-content.json`.

Volume: 5 services x 2 langues (10 docs) + 7 villes x 2 langues (14 docs) = 24 documents.

Correspondance service (ancien vers nouveau pageBuilder, dans l'ordre de rendu actuel):
- masthead: `hero[0]` = { eyebrow = ancien `meta`, title = `title`, lead = `summary`, cta = appel }
- `intro` (paragraphes) -> bloc `editorial` (un segment, texte seul)
- `benefits` -> bloc `highlights` (items = {title, body})
- `detail.editorial` (si présent, fourmis charpentières) -> bloc `editorial`
- `detail.process` -> bloc `process`
- `detail.testimonials` -> bloc `testimonials` (bloc intelligent, copie + sélection)
- `detail.cta` -> bloc `ctaBand`

Correspondance ville (ancien vers nouveau):
- masthead: `hero[0]` = { eyebrow = « Villes » (i18n figé au contenu), title = `heading` ou
  `city`, lead = `lead`, cta = appel }
- `body` (paragraphes) -> bloc `editorial` (un segment, texte seul)
- la grille services x lieu -> bloc `services`

Chaque bloc et chaque item reçoit un `_key`. Le miroir `seed-content.json` est mis à jour après
coup (le live fait foi; respecter le format de refs d'images du seed).

## Déploiement du schéma

Après migration et vérif de build: déployer le schéma + le Studio hébergé (skill
`sanity:deploy-schema` puis `sanity deploy`). Cela enregistre `editorial`, `detailHero`,
`process` (bloc), `highlights`, le branchement de l'icône, et fait disparaître les erreurs
rouges. Tester un `sanity build` complet (les imports d'icônes ne sont validés qu'au bundle
complet, pas au `schema deploy`).

## Ordre des lots (fail-fast)

1. Schémas Studio: `detailHero`, bloc `process`, bloc `highlights`, refonte `service.ts` et
   `service-city.ts` (deux onglets), `isUnique` partagé, branchement `LucideIconInput`,
   ajout `seo` sur service. Validation TypeScript du studio.
2. Pipeline front: projections, transform, types, composables, pages. `nuxt typecheck` vert.
3. Migration du contenu live (24 docs) via MCP, puis vérif `nuxt generate` avec
   `NUXT_SANITY_TOKEN`.
4. Miroir `seed-content.json`.
5. Déploiement schéma + Studio.
6. Mise à jour mémoire et, sur demande, commits par lot.

Note: les lots 1 et 2 sont indissociables côté build (le typecheck et le generate ne passent
qu'ensemble), comme l'arrimage précédent. Le generate ne passe qu'après la migration (lot 3).

## Sous-décisions tranchées (Charles délègue, 2026-06-25)

1. Double titre: garder `title` au niveau document (cartes, listes, preview, fil d'Ariane) en
   plus de `hero[0].title` (H1), pour ne pas fragiliser les listes. Parité singleton assumée.
2. Points forts: bloc `highlights` dédié, traitement visuel distinct du processus.
3. Tonalité du masthead: champ `tone` clair/foncé sur `detailHero`, initialValue par type
   (service clair, ville foncé), pour préserver le look actuel.
4. Bloc prose: réutiliser `editorial` (un segment, sans image) pour les paragraphes intro/body.

## Vérification

- `npx nuxt typecheck` vert après le lot 2.
- `NUXT_SANITY_TOKEN=<authToken> npx nuxt generate` vert après le lot 3 (toutes routes service
  et ville prérendues, fail-fast satisfait).
- Studio: rouvrir une ville (Laval) et un service (fourmis charpentières) après déploiement; plus
  aucun bandeau rouge; le slug n'est plus marqué non unique; le champ icône affiche le sélecteur
  visuel.
- Charles valide l'UI au navigateur (aucune vérif navigateur de ma part).

## Hors périmètre

- Le formulaire de contact réel (Turnstile + Resend), le déploiement Cloudflare.
- Le retravail esthétique des autres blocs.
- La pagination du blog.

## Registre

Implémentation au registre du skill « impeccable » (craft de marque), disciplines CLAUDE.md
(zéro valeur, texte ou contenu en dur; fail-fast; grille 16 colonnes et utilitaires `.wf-*`).
Commits et push seulement sur demande.
