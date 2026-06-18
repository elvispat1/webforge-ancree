# Héros en blocs + page Showcase — design

- **Date** : 2026-06-17
- **Statut** : en revue (avant plan d'implémentation)
- **Branche de travail** : `staging` (staging-first; merge `main` à la fin sur ton go)
- **Famille** : Minimaliste (démo Atelier Cormier)

## Contexte

Aujourd'hui :
- Les **héros ne sont pas des blocs** : ils sont imposés par type de page (`components/hero/{home,page,detail,article}.vue`), hors des deux page-builders (régulier + article). Décision délibérée d'origine.
- La **vitrine des blocs** vit sous `/dev/blocs/{reguliers,articles,heros}`, est gated dev (404 en prod), et est pilotée par le code (`useBlockCatalog` + `BlockShowcase`/`BlockShowcaseItem` + barre latérale `SgNav`), avec des samples locaux et des blocs piochés du payload réel.
- `/dev` contient aussi : le **styleguide** (tokens/typo/couleurs), une page **formulaire** (atomes de form), une page **stack** (versions composants/packages via `useProjectStack`), une page **sites** (liens d'environnements).

Deux évolutions décidées avec Charles :

- **Chantier A — Builder de blocs de héros** : transformer les héros en blocs, et exposer dans Sanity un mini page-builder de héros **verrouillé à 1 bloc**, pour pouvoir **interchanger le héros d'une page depuis le CMS** sans toucher au code. Portée : **tous** les contextes de héros (auto-portants + dérivés de collection).
- **Chantier B — Page Showcase** : `/dev` devient **`/showcase`**, une page **client-facing** (« guide de tout ce que WebForge multipage comprend »), **100 % pilotée par le code** (zéro entretien), couvrant héros + blocs réguliers + blocs d'article + formulaire + styleguide. `/dev` en tant que tel disparaît; seules deux pages purement internes (stack/versions, liens d'environnements) restent gated, hors de la page client.

B dépend de A (le showcase doit savoir rendre les héros en blocs).

## Objectifs

1. Pouvoir **changer le héros d'une page depuis Sanity** (sélection d'un bloc de héros), verrouillé par PS, sans changement de code.
2. Une page **Showcase client-facing**, toujours complète et sans entretien, qui présente l'ensemble des blocs et du système.
3. **Aucune régression visuelle** : les héros migrés gardent leur look actuel (les blocs par défaut = l'existant).
4. Respect des trois disciplines (tokens, i18n a11y/chrome, contenu Sanity) et du `.vue` script/template/style.

## Non-objectifs (hors scope de cette livraison)

- **Dessiner de nouvelles mises en page de héros** (split, pleine image, etc.). On livre le **mécanisme + la migration** des héros actuels comme blocs par défaut. Les variantes visuelles s'ajoutent ensuite, comme on ajoute un bloc.
- RBAC Sanity (verrouillage par rôle payant). Le « verrouillage » est structurel (voir A.7).
- Toute refonte des blocs réguliers/article existants.

---

## Chantier A — Builder de blocs de héros

### A.1 Principe

On **réplique la mécanique éprouvée des blocs réguliers** pour les héros, plutôt que d'inventer un 2e système :

- `components/hero/block/` (composants de blocs de héros) + `heroBlockMap` (`_type` → composant), miroirs de `components/page-builder/regular/block/` + `regularBlockMap`.
- Un champ `hero` sur chaque document de page = **array verrouillé à 1 élément** (`validation.max(1)`), `of:` les types de héros offerts pour ce contexte.
- Projection GROQ discriminée par `_type` + `transformHeroBlock`, calqués sur le pageBuilder. Types miroirs dans `app/types/sanity.ts`, union `HeroBlock` dans `app/types/blocks.ts`.
- La page rend `heroBlockMap[hero._type]`, comme l'orchestrateur de blocs rend `regularBlockMap[block._type]`.

### A.2 Types de blocs de héros (cette itération)

Deux familles, selon d'où viennent les données :

**Auto-portants** (le contenu vit dans le bloc) :
- `heroHome` — migré de `hero/home.vue` : kicker, titre, lead, 2 CTA, méta, double visuel (desktop + mobile). Contexte : accueil, one-pager.
- `heroPage` — migré de `hero/page.vue` : titre, lead, CTA optionnel, image optionnelle; fil d'Ariane dérivé de la route. Contexte : pages fixes (services, projets, à propos, blog, FAQ, contact).

**Dérivés d'une collection** (lisent les données du document courant) :
- `heroDetail` — migré de `hero/detail.vue` : lit titre/eyebrow/méta (lieu, année)/couverture du **projet ou service** courant. Contexte : documents `project`, `service`.
- `heroArticle` — migré de `hero/article.vue` : lit catégorie/titre/date/auteur/temps de lecture/couverture de l'**article** courant. Contexte : document `article`.

Chaque type a, pour l'instant, **une seule variante** (le look actuel). Le `of:` de chaque champ `hero` accueillera les futures variantes sans autre changement structurel.

### A.3 Champ `hero` par document

| Document | `of:` (types offerts) | Donnée |
|---|---|---|
| `homePage`, `onePager` | `heroHome` | dans le bloc |
| `servicesPage`, `projectsPage`, `aboutPage`, `blogPage`, `faqPage`, `contactPage` | `heroPage` | dans le bloc |
| `project`, `service` | `heroDetail` | lue du document |
| `article` | `heroArticle` | lue du document |

- Le champ `hero` remplace les champs `hero` actuels de type `heroHome`/`pageHero` (sur les docs de page), et **ajoute** un champ `hero` sur `project`/`service`/`article` (qui n'en avaient pas : leur héros était construit par le gabarit).
- `validation: (R) => R.required().max(1).min(1)` (exactement 1 héros).

### A.4 Rendu, GROQ, transform, types

- **GROQ** : `app/queries/fragments/hero.ts` (déjà existant pour `heroHome`/`pageHero`) évolue en `HERO_BLOCK_PROJECTION` discriminée par `_type` (heroHome, heroPage, heroDetail, heroArticle). Pour `heroDetail`/`heroArticle`, la projection se limite au choix de variante (les données viennent déjà du document de collection projeté ailleurs).
- **Transform** : `transformHeroBlock(raw, …)` produit un `HeroBlock` (union discriminée). Réutilise `resolveFigure` (nettoyage stega du ratio) et `linkPair`. Pour heroDetail/heroArticle, le transform compose les données du document (comme `useServiceBlocks`/`useProjectBlocks`/page article le font aujourd'hui) avec le `_type` du bloc choisi.
- **Types** : `HeroBlock` (union) dans `app/types/blocks.ts`; types miroirs `SanityHeroBlock*` + union dans `app/types/sanity.ts`.
- **Composables** : `useHeroContent`/`usePageHero` deviennent « lire le bloc héros du payload » et retourner le `HeroBlock`. Les pages rendent un orchestrateur `components/hero/index.vue` (`heroBlockMap[hero._type]`), comme `page-builder/regular/index.vue`.
- **Preview / stega** : conserver `motionDisabled` en preview et le nettoyage stega des ratios (piège connu héros). Aucune régression du live editing.

### A.5 Migration (look inchangé)

- Les 4 composants `hero/{home,page,detail,article}.vue` deviennent les composants de blocs par défaut (déplacés/réexposés sous `hero/block/`), **markup et styles inchangés** → zéro régression visuelle attendue.
- Les ratios par défaut (`RATIOS.heroVisual`, `pageHero`, etc.) restent les mêmes.

### A.6 Cohérence des données détail/article

- `heroDetail`/`heroArticle` ne dupliquent pas le contenu : ils **lisent** le document de collection (titre, couverture, méta…). Le « bloc » sert à choisir la **mise en page** (une seule pour l'instant) + d'éventuelles surcharges optionnelles minimales (à n'ajouter que si un besoin réel apparaît; par défaut, aucune).
- C'est le point qui justifie d'avoir des **types de héros distincts par contexte** plutôt qu'un héros unique interchangeable partout (un héros d'accueil n'a pas de données sur une page projet).

### A.7 Verrouillage

- « Verrouillé par nous » = (1) `max(1)` sur le champ, (2) **on contrôle le `of:`** (quels types de héros sont offerts par contexte), (3) option `readOnly`/`hidden` activable par projet client si on veut figer le héros chez un client. Pas de RBAC.

### A.8 Seed

- Tous les champs `hero` (8 docs de page + items `project`/`service`/`article`) seedés **fr/en** avec leur bloc par défaut (= look actuel). Seed idempotent, comme l'existant.

---

## Chantier B — Page Showcase

### B.1 Route et accès

- `/dev/*` (vitrine blocs + styleguide + formulaire) → **`/showcase`**. La page n'est plus gated dev : c'est une **vraie page**, **noindex**, **hors navigation principale**, accessible par URL. Destinée à accompagner chaque site WebForge multipage (futur élément de `webforge-core`).
- **Barre latérale gauche conservée** (`SgNav`).
- **Pages purement internes conservées mais gated** (404 en prod, hors `/showcase`) : **stack/versions** (`useProjectStack`) et **liens d'environnements** (« sites »). Elles restent à un chemin interne gated (ex. `/dev` réduit à ces deux outils, ou route équivalente — détail tranché au plan). Elles ne sont **pas** client-facing. Point à confirmer en revue : si tu préfères zéro page interne (l'info vit dans `package.json`/le code), on les retire complètement.

### B.2 Sections (100 % pilotées par le code)

Via les block-maps + contenu d'exemple, **auto-complètes** (ajouter un bloc = il apparaît tout seul) :

1. **Héros** — via le nouveau `heroBlockMap` (chantier A), avec les **onglets de variantes** quand plusieurs variantes existeront.
2. **Blocs réguliers** — via `regularBlockMap` (inclut iframe + vidéo YouTube déjà livrés).
3. **Blocs d'article** — via `articleBlockMap`.
4. **Formulaire** — le bloc contact (le vrai formulaire).
5. **Styleguide** — gardé (tokens/typo/couleurs/atomes). C'est le guide de référence qu'on regarde.

### B.3 Ce qu'on garde / ce qui change

- **Gardé** : barre latérale, **badges de `_type`**, **onglets de bascule de variantes** (Charles veut voir les types et basculer les variations), le styleguide.
- **Changé** : la route (`/showcase`), le dégating (client-facing), l'ajout de la section Héros (blocs), le rapatriement du formulaire et du styleguide sous `/showcase`.
- **Retiré de la page client** : la stack/versions et les liens d'environnements (restent gated ailleurs).

### B.4 Polish

- Présentation soignée (page montrable à un client). Le chrome de repère (badge `_type`, onglets de variantes) est **conservé** car utile et voulu.
- **Aucune documentation par bloc** : si un client a une question sur un bloc, il la pose directement à Charles.

---

## Disciplines (rappel, non négociable)

1. **Aucune valeur design en dur** : tout par tokens (réutiliser `--ratio-video`, `--space-block-*`, etc.; nouveaux tokens famille au besoin).
2. **Aucun texte d'interface en dur** : i18n pour a11y/chrome (ex. libellés du showcase, aria du builder de héros si applicable).
3. **Aucun contenu en dur** : le contenu des héros vit dans Sanity; les samples du showcase restent des consts de démo (`*_SAMPLE`), jamais consommées en prod.
4. **Classes typo réutilisées** (`wf-h*`/`wf-body-*`/`wf-caption`), **CSS Grid** par défaut, snappé aux 12 colonnes.
5. **`.vue`** : script, puis template, puis style.

## Plan de QA

- `vue-tsc` 0 erreur (typecheck app).
- Rendu SSR de **chaque type de page** vérifié (héros migrés identiques au look actuel) via le dev server de Charles (jamais spawn de serveur).
- Rendu de `/showcase` : les 5 sections présentes, héros + réguliers + article + formulaire + styleguide, onglets de variantes fonctionnels.
- Preview/live editing non régressé (motion off, stega nettoyé).
- Build `nuxt generate` vert (gate routes), après seed.

## Risques

- **Refactor des héros sur tout le site** (chaque page change sa façon de rendre son héros) : le risque principal. Mitigation : défauts = look actuel, QA héros page par page, staging-first.
- **Détail/article** : ajouter un champ `hero` sur les docs de collection + faire lire les données par le bloc = la partie la plus délicate. Mitigation : `heroDetail`/`heroArticle` lisent le doc, pas de duplication, une seule variante au départ.
- **Showcase client-facing en ligne** : page noindex, hors nav; vérifier qu'aucun lien interne ne l'expose involontairement.

## Séquence proposée

1. Chantier A (builder de héros) : mécanisme + migration + seed + QA.
2. Chantier B (showcase) : route + sections + dégating + QA.
3. Sur ton go : merge `main` + `studio:deploy`.
