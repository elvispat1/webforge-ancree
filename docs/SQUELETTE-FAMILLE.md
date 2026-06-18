# Squelette de famille: WebForge (family-agnostic)

> Catalogue du squelette commun à toutes les familles WebForge. Décrit les rôles,
> les modes, l'architecture de pages et le contrat de contenu de chaque bloc,
> indépendamment de l'apparence. Extrait du code réel de la famille Minimaliste
> (10 juin 2026), pas d'hypothèses.
>
> **À quoi ça sert.** Deux lecteurs:
> 1. **Claude Design** reçoit ce doc pour inventer la peau d'une nouvelle famille.
>    Il sait exactement quels blocs existent, leur rôle, ce qu'ils portent. Il
>    dessine, il n'invente pas la structure.
> 2. **Claude Code** reçoit ce doc plus la famille Minimaliste comme implémentation
>    de référence. Il scaffolde la nouvelle app en gardant la même nomenclature,
>    les mêmes signatures, le même câblage, et n'écrit que la peau de la famille.
>
> Le contrat technique détaillé (tokens, rails, câblage Sanity) vit dans
> `docs/CONVENTIONS-CONTRACT.md`. Ce doc-ci est le catalogue des rôles.

---

## 1. Le principe de famille

Une famille WebForge se commande en trois choix: **famille** (esthétique),
**mode** (palier d'usage), **variante de bloc** (alternative au sein d'un bloc).

Ce qui **voyage** d'une famille à l'autre: la nomenclature des blocs, leur rôle,
leur contrat de contenu (`_type`, champs, signatures), le câblage (interface +
`content/` + type discriminé + block-map), l'architecture de pages, les deux modes.

Ce qui est **propre** à la famille: les tokens de design (couleurs, typo, géométrie,
rythme, motion), les classes CSS, le rendu visuel de chaque composant, les variantes
de blocs spécifiques. Tout ça vit dans la couche `app/family/` et `app/brand/`,
jamais dans `webforge-core`.

Règle d'or: **on garde le squelette, on refait la peau.** Un nouveau bloc ne se crée
que si un rôle manque réellement, jamais par réflexe esthétique.

Le catalogue est un **socle vivant**: d'une famille ou d'un type de site à l'autre, on
ajoute ou on retranche des blocs selon le besoin. Le socle de base décrit ici reste
constant, les ajouts planifiés sont listés en §11.

---

## 2. Les rails durs (résumé du contrat)

Tout repris de `docs/CONVENTIONS-CONTRACT.md §0`. Non négociables pour toute famille:

1. **Aucune valeur design en dur** dans un composant. Tout par `var(--token)`. Valeur
   manquante: on l'ajoute aux tokens famille ou marque, jamais au composant.
2. **Aucune chaîne d'interface en dur**: a11y et chrome produit générique via i18n
   (`a11y.*`, `consent.*`). Le contenu propre au site vit dans `content/`.
3. **Aucun contenu en dur dans les composants**: chaque bloc a son interface, sa const
   dans `content/`, son type discriminé dans `types/blocks.ts`, son composant, son
   entrée block-map. Signature stable pour le swap Sanity V2.
4. **Container queries partout** (`@container site`), aucune media query viewport de
   largeur.
5. **Nomenclature anglaise** partout dans le code. Commentaires en français.
6. **Ordre DOM logique** quand l'image alterne: le DOM reste constant, le flip passe
   par `grid-column` en CSS.
7. **Typographie de contenu**: aucun tiret cadratin, aucun middle dot séparateur.
8. **Pas d'eyebrow réflexe**: le surtitre se mérite, on varie les ouvertures.

---

## 3. Les deux modes

| Mode | Route | Rôle | Composition |
|------|-------|------|-------------|
| **One-pager** | `/one-pager` | Le plus simple. Navigation par ancres, une seule page. Palier 1 (1 500 $). | Héros `home` puis une pile de blocs réguliers (about, services, testimonials, faq, contact). Pages légales propres au one-pager. |
| **Multipage** | `/` et le reste | Plus complexe. Vraie arborescence, une page par intention. Palier 2. | Plusieurs types de pages, chacun avec son héros imposé et sa composition de blocs. |

Le one-pager assemble les mêmes blocs réguliers que le multipage, simplement empilés
sur une page unique avec des CTA en ancres plutôt qu'en routes.

Ordre observé du one-pager Minimaliste: `hero(home)` → `about` → `services` →
`testimonials` → `faq` (avec `faqSchema: true`) → `contact`.

---

## 4. Architecture de pages (mode multipage)

| Page | Route | Héros | Composition typique |
|------|-------|-------|---------------------|
| Accueil | `/` | `home` | Pile de blocs preview: projets, services, story (media-text), témoignages, blog, cta-band. |
| À propos | `/a-propos` | `page` | Contenu éditorial, about, highlights, process, stats. |
| Services (liste) | `/services` | `page` | Grille de services (collection). |
| Service (détail) | `/services/[slug]` | `detail` | Intro, highlights (bénéfices), projets liés (projects-preview filtré), cta-band. |
| Projets (liste) | `/projets` | `page` | Grille de projets (collection) avec filtres. |
| Projet (détail) | `/projets/[slug]` | `detail` | Étude de cas, media-text, galerie, témoignage rattaché. |
| Blog (liste) | `/blog`, `/blog/page/[n]` | `page` | Liste d'articles paginée (collection). |
| Article | `/blog/[...slug]` | `article` | Page-builder d'article (corps de billet). |
| Contact | `/contact` | `page` | Bloc contact (formulaire + coordonnées). |
| FAQ | `/faq` | `page` | FAQ regroupée par thème, cta-band. Porte le balisage Schema.org FAQPage. |
| Légales | `/politique-confidentialite`, `/conditions-utilisation` | aucun | Gabarit légal (composant dédié). |

Les héros sont **imposés par le type de page**, ce ne sont pas des blocs de
page-builder. Clés de sélection du héros de page (`usePageHero`): `about`, `services`,
`projects`, `blog`, `faq`, `contact`.

---

## 5. Héros (4 types, imposés par type de page)

Le héros est un composant unique par type de page, pas un bloc. Il vit dans
`components/hero/`. Quatre types:

### `home`: accueil et one-pager
Champs: `kicker?`, `title`, `lead`, `primaryCta {label, href}`,
`secondaryCta {label, href}`, `meta [{label, value}]`, `visual` (art direction
desktop), `visualMobile` (art direction mobile). Chaque visuel: `{ratio, src?, alt?,
label, caption}`. C'est le seul héros à double art direction (cadrage desktop vs mobile).

### `page`: pages de liste et éditoriales
Champs: `title`, `lead?`, `cta? {label, href}`, `image?` (split desktop, empilée mobile;
absente = héros texte seul, colonne large). Image: `{ratio, src?, alt, label, caption}`.

### `detail`: fiches service et projet
Porte l'identité de l'item (titre, résumé, visuel principal). Câblé sur la donnée de
l'item (un Service ou un Projet), pas sur une const de héros dédiée.

### `article`: billet de blog
En-tête du billet (titre, méta, chapô visuel). Précède le page-builder d'article.

---

## 6. Blocs réguliers (page-builder, 13)

Dispatchés par `_type` via `regularBlockMap`. Chaque bloc: une interface `XContent`,
une const dans `content/`, un type `XBlock = BlockBase<'x'> & XContent`, un composant,
une entrée block-map. `BlockBase<T> = { _type: T; _key: string }`.

| `_type` | Rôle | Contrat de contenu (champs) |
|---------|------|------------------------------|
| `about` | Présentation de l'entreprise, photo + différenciateurs. | `eyebrow`, `heading`, `body string[]`, `photo {ratio, src?, alt, label, caption}`, `figcaption`, `diffs [{n, title, body}]`. |
| `services` | Aperçu de l'offre, grille de services. | `eyebrow`, `heading`, `lead`, `ctaLabel`, `ctaHref`, `items [{n, title, body, meta, image, href?}]`. |
| `testimonials` | Preuve sociale, citations clients. | `eyebrow`, `heading`, `items [{quote, name, context}]`. |
| `faq` | Questions fréquentes. Peut porter le Schema.org FAQPage (`faqSchema?`). | `eyebrow`, `heading`, `items [{q, a}]`. |
| `contact` | Coordonnées + formulaire. | `eyebrow`, `heading`, `lead`, `meta [{label, value?, href?, lines?}]`, `form {fields, errors, submit, errorBanner, privacy}`, `success {title, body}`. |
| `media-text` | Bloc image + texte alterné (story, mise en valeur). | `eyebrow?`, `heading`, `body string[]`, `mediaSide 'left'\|'right'`, `image {ratio, src?, alt, label, caption}`, `cta? {label, href}`. |
| `cta-band` | Bande d'appel à l'action de fin de page. | `title`, `subtitle?`, `primaryCta {label, href}`, `secondaryCta? {label, href}`. |
| `process` | Méthode en étapes numérotées (3 à 5). | `eyebrow?`, `heading?`, `lead?`, `cta? {label, href}`, `steps [{n, title, body}]`. |
| `stats` | Bande de chiffres clés (2 à 4). | `eyebrow?`, `heading?`, `items [{value, label}]`. |
| `highlights` | Différenciateurs ou engagements (3 à 4), icône optionnelle. | `eyebrow?`, `heading?`, `lead?`, `items [{icon?, title, body}]`. `icon` = nom Iconify. |
| `logos` | Preuves d'affiliation, certifications (3 à 6). | `eyebrow?`, `heading?`, `items [{label}]`. Évolution prévue: champ `logo? {src, alt}`. |
| `projects-preview` | Aperçu de projets, renvoi vers la collection. | `eyebrow?`, `heading`, `lead?`, `items [{slug, title, excerpt, service?, cover}]`, `ctaLabel?`, `ctaHref?`. |
| `blog-preview` | Aperçu d'articles récents. | `eyebrow?`, `heading`, `lead?`, `items [{title, excerpt, href, date, category?, cover}]`, `ctaLabel?`, `ctaHref?`. |

Note récurrente sur les images: en V1 `src` est un chemin string, en V2 ce sera un
asset Sanity résolu en URL dans la couche d'assemblage. La signature du composant ne
change pas.

---

## 7. Blocs d'article (page-builder d'article, 7)

Corps de billet de blog. Dispatchés par `_type` via `articleBlockMap`. Même mécanique
que les blocs réguliers, union discriminée distincte (`ArticleBlock`).

| `_type` | Rôle | Contrat de contenu |
|---------|------|--------------------|
| `lead` | Chapô d'ouverture du billet. | `text`. |
| `rich-text` | Corps riche: paragraphes, sous-titres, listes. | `blocks [{kind 'paragraph'\|'heading'\|'list', text?, items?}]`. |
| `image` | Image pleine dans le flux. | `image {ratio, src?, alt, label, caption}`. |
| `quote` | Citation mise en exergue. | `quote`, `attribution?`. |
| `gallery` | Galerie d'images. | `images [{ratio, src?, alt, label, caption}]`. |
| `callout` | Encadré accentué (note ou avertissement). | `tone? 'note'\|'warning'`, `title?`, `text`. |
| `inline-cta` | Appel à l'action en ligne dans l'article. | `text`, `ctaLabel`, `ctaHref`. |

---

## 8. Collections et chrome

Composants de présentation des collections (pas des blocs page-builder, câblés sur la
donnée de liste): `ProjectCard`, `ProjectGrid`, `ArticleCard`, `ArticleGrid`,
`BlogListSection`, `FilterBar`, `MediaGallery`, `Pagination`.

Chrome de site (présent sur toutes les pages, propre à la famille pour la peau):
`Header`, `Footer`, `MobileMenu`.

---

## 9. La couche de contenu (câblage d'un bloc)

Pour ajouter ou répliquer un bloc dans une famille, cinq pièces, toujours les mêmes:

1. **Interface** `XContent` dans `app/content/x.ts` (le contrat de champs).
2. **Const de contenu** `X_CONTENT: XContent` dans le même fichier (la donnée V1).
3. **Type discriminé** `XBlock = BlockBase<'x'> & XContent` dans `app/types/blocks.ts`,
   ajouté à l'union `PageBlock` ou `ArticleBlock`.
4. **Composant** `app/components/page-builder/{regular|article}/block/x.vue`, typé
   contre son `XBlock`, qui ne lit que des tokens et des classes de famille.
5. **Entrée block-map** dans `regular/block-map.ts` ou `article/block-map.ts`
   (`x: X`).

L'orchestrateur (`page-builder/{regular|article}/index.vue`) dispatche par `_type` via
la block-map. La donnée transite par les composables d'assemblage (`useOnePagerBlocks`,
`usePageBlocks`). Le héros, lui, passe par `useHeroContent` et `usePageHero`, jamais
par l'orchestrateur de blocs.

En V2, seule l'implémentation interne de la couche d'assemblage change (lecture Sanity
au build). Les signatures de composants et les `_type` restent identiques.

---

## 10. Ce que produit chaque maillon

**Claude Design** reçoit ce catalogue. Il produit la direction visuelle d'une nouvelle
famille: système typographique, palette et tokens de marque, géométrie, rythme entre
blocs et interne, motion, traitement de chaque bloc et de chaque type de héros, variantes
de blocs propres à la famille. Il ne touche ni à la nomenclature, ni aux `_type`, ni au
câblage.

**Claude Code** reçoit ce catalogue plus la famille Minimaliste comme implémentation de
référence et la direction de Claude Design. Il crée le nouveau repo `webforge-<famille>`
à partir de celui-ci (un repo par famille, app à la racine, pas de monorepo `apps/`),
réplique le câblage à l'identique, et n'écrit que `app/family/`, `app/brand/`, les CSS et
le rendu des composants selon la peau de la nouvelle famille. La vitrine `/showcase` se
régénère pour la nouvelle famille comme produit de sortie, elle devient la vérification
visuelle de chaque bloc.

---

## 11. Blocs à venir (socle vivant, mis à jour 2026-06-10)

Le catalogue n'est pas figé. Deux blocs manquent au socle et seront ajoutés d'abord dans
la famille Minimaliste, puis propagés aux suivantes. La spec de build vit dans
`ROADMAP.md`.

| `_type` | Rôle | Contrat | Note |
|---------|------|---------|------|
| `video` | Embed vidéo YouTube par ID. | `id`, `title` (requis a11y), `ratio?`, `caption?`. | Façade click-to-load: poster plus bouton lecture, iframe injectée au clic, domaine `youtube-nocookie.com`. Cohérent avec le blocage dur Loi 25. |
| `embed` | Iframe générique: snippet, carte, calendrier, tout contenu tiers. | `src`, `title` (requis a11y), `ratio?`, `allow?`, `caption?`. | Attribut `sandbox`, `src` restreint à des domaines de confiance, consentement si le tiers dépose des témoins. |

D'autres rôles pourront apparaître au fil des familles et des types de site. La règle
tient: un bloc s'ajoute quand un rôle manque réellement, pas par réflexe.
