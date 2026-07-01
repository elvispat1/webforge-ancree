# Audit de finition, gabarit WebForge Ancrée (1er juillet 2026)

Passe de finition active avant promotion du staging. Démo Rempart Extermination, site
Nuxt 4 statique généré, volontairement `noindex` (gabarit non indexable). Méthode: build
statique réel (`nuxt generate` avec `NUXT_SANITY_TOKEN`), inspection du HTML produit dans
`.output/public`, puis fan-out de neuf sous-agents spécialisés (domaines A à I), synthèse,
correctifs sans risque appliqués par lots, arbitrages réservés.

## Verdict

**Le gabarit est prêt pour le staging.** Aucun bloquant. Les quatre défauts prioritaires de
l'audit Minimaliste sont réglés ou non reproduits, à une exception d'arbitrage près (le
CLS/`width`-`height`, MAJ-06). Points saillants:

- **SEO technique solide.** Graphe Schema.org complet et bien formé par type de page,
  `og:image` en crop 1200x630 avec dimensions, canoniques absolus, sitemap complet avec
  alternates hreflang à slugs traduits. `noindex` global vient uniquement de
  `site.indexable:false`, sans résidu codé en dur.
- **Infra de révélation exemplaire et SEO-safe.** Les trois mécanismes (directive `reveal`,
  `useEntrance`, `useParallax`) lisent tous les tokens `MOTION` centralisés, le contenu
  révélé est intégralement présent dans le HTML statique, l'unique masque `opacity:0` CSS
  (hero d'accueil) est correctement barré par `scripting`/`reduced-motion`/`wf-no-motion`.
- **Accessibilité aux fondamentaux tenus.** `lang` par locale, un seul `h1` par page,
  attribut `alt` présent sur les 162 images, `aria-current`, pièges de focus corrects,
  `prefers-reduced-motion` respecté en CSS et en JS.
- **Portabilité propre.** Connexion Sanity par constantes avec override env, couture preview
  SSR proprement gatée (statique de prod vérifié vierge de stega, React et token), wrangler
  en Workers sans référence Pages.
- **Six correctifs sans risque appliqués**, build de contrôle vert (69 pages, 0 erreur, 0
  avertissement Nitro, avertissement `faq.no_theme` disparu). **Quinze arbitrages réservés**
  à Charles, dont trois majeurs qui se gravent dans le gabarit.

## Journal des correctifs appliqués

Six lots, six commits atomiques sur `staging`. Aucune poussée distante. `app/family/tokens.css`
(WIP) et le fichier de prompt sont volontairement laissés hors des commits.

| Commit | Domaine | Correctif | Pourquoi sans risque |
|---|---|---|---|
| `124bc2a` | G (build) | `fix(i18n): ajoute la clé faq.no_theme manquante (fr + en)` | Clé consommée par `useFaq` mais absente des deux locales (avertissement build réel). Ajout de deux libellés, aucun effet de bord. |
| `7b270a1` | A (SEO) | `fix(seo): traite une description SEO vide comme absente (villes, services)` | `?? ''` laissait passer une meta description vide; `\|\| undefined` laisse jouer le repli CMS. Aligne sur la ligne `image` voisine. |
| `961b23c` | H (visuel) | `fix(ui): carte d'article ancrée au sol (retrait du soulèvement au survol)` | Harmonisation cosmétique vers une règle déjà établie et commentée (cartes de service et ville dé-liftées). Contenu à un seul bloc `:hover`. |
| `4215e29` | I (mouvement) | `refactor(motion): tokens de mouvement dans la coquille de la vitrine` | Remplace des littéraux `150ms/120ms/ease` par les tokens existants. Confiné à la vitrine (hors gabarit client). |
| `eafcd8c` | C (CMS) | `fix(studio): aperçu du bloc image d'article aligné sur le modèle asset` | Select de preview mort (champs `figure` supprimés). Titre par le nom de fichier de l'asset, comme `figure` et `article-gallery`. Aucun impact sur le build Nuxt. |
| `aa3fa49` | D (portabilité) | `docs(studio): .env.example pointe le projet Ancrée` | Fichier de référence copié de Minimaliste (`fesilwqf`); pointe désormais `5if00rwn`. Documentaire. |

### Validation

`nuxt generate` de contrôle après le lot complet: **build vert**, 69 pages HTML, 0 page en
échec sur 67, 0 erreur, 0 avertissement Nitro, link checker 0 erreur. L'avertissement
`[intlify] faq.no_theme` a disparu. Gates d'hygiène statique tous à 0 (fuite de token, stega,
React, routes preview). Vérifications ciblées dans le HTML produit: `translateY(-4px)` de la
carte d'article absent, `.acard:hover` réduit à `box-shadow:var(--elev-mid)`, littéraux
`150ms/120ms ease` de la vitrine disparus, meta description des villes intacte (les sept ont
une description Sanity, donc rendu inchangé; le correctif protège le futur client). La
validation est un unique build de contrôle couvrant les six lots (micro-correctifs
indépendants), pas un build par lot.

### Couture critique d'indexation (vérifiée par build de contrôle)

Flip de contrôle local `site.indexable: true` (puis retour à `false`): **build vert, couture
propre**. Les pages de contenu (accueil, service, ville, article, FAQ, contact, légales, et
leurs équivalents `/en`) passent à `robots: index, follow, max-image-preview:large, ...`; les
sous-arbres volontairement noindex (showcase et one-pager, fr et en, plus les légales du
one-pager) restent `noindex, nofollow` via leur `noindex` de niveau page (9 pages au total).
Aucun résidu de noindex codé en dur sur une page de contenu, aucune page de contenu bloquée.
Conclusion: lever `site.indexable` suffira à réindexer proprement tout le site le jour venu,
sans chasse aux noindex résiduels. `nuxt.config.ts` a été remis à `indexable: false`.

**Posture noindex durcie à trois couches (1er juillet, après signalement de Charles).** Le
gabarit de démo sert désormais trois signaux noindex concordants tant que `site.indexable`
reste `false`: (1) `robots.txt` `Disallow: /` (nuxt-robots); (2) `<meta name="robots"
content="noindex, nofollow">` sur chaque page; (3) un entête HTTP `X-Robots-Tag: noindex,
nofollow` servi par le Worker Static Assets via `public/_headers` (copié dans
`.output/public/_headers`, honoré nativement par Cloudflare Workers, confirmé par la doc). La
couche (3) couvre le cas d'un robot qui ignorerait `robots.txt` ou fetcherait une URL
directement, et s'applique aux réponses non-HTML. `public/_headers` porte une note « à retirer
quand un vrai site client passe indexable ». Note: sur le Worker preview (SSR, non assets-only),
l'entête `_headers` peut ne pas s'appliquer aux routes rendues par le code, mais la balise meta
noindex et le `robots.txt` couvrent le preview.

## Tableau de bord

23 constats. 0 bloquant, 7 majeurs, 11 mineurs, 5 voulu à confirmer.

| Domaine | Total | Corrigé | Confirmé (voulu) | Réservé (arbitrage) |
|---|---|---|---|---|
| A. SEO technique | 2 | 1 | 0 | 1 |
| B. Accessibilité | 3 | 0 | 1 | 2 |
| C. Structure CMS | 3 | 1 | 1 | 1 |
| D. Portabilité | 4 | 1 | 1 | 2 |
| E. Performance | 2 | 0 | 0 | 2 |
| F. i18n / hreflang | 1 | 0 | 0 | 1 |
| G. Santé du build | 2 | 1 | 1 | 0 |
| H. Cohérence visuelle | 4 | 1 | 0 | 3 |
| I. Révélations | 2 | 1 | 0 | 1 |
| **Total** | **23** | **6** | **4** | **13** |

Par sévérité: Majeur 7 (3 corrigés, 4 réservés), Mineur 11 (2 corrigés, 9 réservés), Voulu à
confirmer 5 (1 confirmé sans code, 4 réservés). Note: quatre constats sont des confirmations
de choix assumés (aucune action de code), comptés ici en « Confirmé ».

## Arbitrages réservés pour Charles

Le cœur du rapport. Chacun est une décision structurante que je n'ai pas touchée, formulée en
question tranchée. Je ne les ai pas corrigés parce qu'ils engagent une décision de design, de
modèle de contenu, de stratégie SEO, ou touchent `app/family/tokens.css` (ton WIP).

### Majeurs (se gravent dans le gabarit)

**R1. CLS: threader les dimensions Sanity jusqu'à `width`/`height`? (MAJ-06, le seul défaut
prioritaire Minimaliste encore ouvert)**
Contexte: sur les 162 images du build, 0 porte `width`/`height`. Le CLS est en pratique
maîtrisé autrement (aspect-ratio inline sur 156 images de contenu, conteneur à hauteur fixe
sur les 6 héros), donc l'esprit de MAJ-06 est respecté, mais Lighthouse continue de flaguer
« images without explicit width and height » et l'aspect-ratio est décidé par emplacement,
pas par la source réelle. Fichiers: `app/queries/fragments/figure.ts:21` (la projection ne
remonte jamais `image.asset->metadata.dimensions`), `app/components/fragments/images/Image.vue`
(aucune prop `width`/`height`), fragment hero.
Options: (A) statu quo, l'aspect-ratio réserve déjà l'espace, CLS réel faible; (B) ajouter
`"dimensions": image.asset->metadata.dimensions{width,height,aspectRatio}` à la projection,
les porter dans le contrat `ResolvedFigure`/`ArticleFigure` au transform, et poser
`width`/`height` sur `<NuxtImg>` (le ratio d'emplacement reste l'override CSS de rendu).
Recommandation: **B pour les images de contenu** (satisfait Lighthouse, dérive le ratio de la
source réelle, robustesse du gabarit), héros laissés tels quels. Réservé: modifie le contrat
`ResolvedFigure` et la signature du fragment `<Image>` partagé (effet de bord sur tous les
usages).

**R2. Contenu éditorial du hero d'accueil encore en i18n plutôt que dans Sanity (discipline 3)**
Contexte: le titre, le lead, le kicker et les preuves du hero d'accueil, plus `site.home_aria`
et `image_alt`, vivent en dur dans `i18n/locales/{fr,en}.json` (lignes ~167, 191, 196, 207).
Ce n'est pas du chrome produit générique: ce sont des phrases de contenu propres à Rempart
(raison sociale, territoire Rive-Nord, « 4,9 sur 5 sur plus de 600 avis Google »). Le bloc
contact a déjà migré ses libellés vers Sanity; le hero d'accueil ne l'a pas suivi. Un futur
client devra chasser ces chaînes à la main au lieu de tout piloter depuis le Studio.
Options: (A) migrer `hero.title/lead/kicker/proof` et `home.title/lead` vers le `homePage`
Sanity, ne garder en i18n que le chrome pur; (B) statu quo assumé et documenter l'écart dans
CLAUDE.md pour le hero d'accueil.
Recommandation: **A**, pour tenir la discipline 3 et faire du transfert client une opération
Studio. Réservé: engage le modèle de contenu (`homePage`) et le composable de rendu du hero.

**R3. Accordéon FAQ: chevron et fond ambre désynchronisés de la hauteur du panneau**
Contexte: `app/components/ui/accordion/index.vue:99` déclare `--acc-drawer-dur: 460ms` (et une
courbe asymétrique) commenté comme « miroir de `MOTION.drawer` », mais `app/family/motion.ts:8`
pose `duration.drawer: 0.2` (200ms, `power2.inOut`). La hauteur du panneau est animée en JS à
200ms (`AccordionPanel.vue`), le chevron et l'ambre en CSS à 460ms. Le panneau se pose, puis le
chrome continue de bouger: saccade visible sur chaque page FAQ. Le commentaire atteste
l'intention d'un miroir non tenu, donc c'est un vrai défaut, pas un choix.
Options: (A) aligner la face CSS sur `MOTION.drawer` (200ms), ce qui suppose de décider si
200ms est le bon tempo pour tout le tiroir ou s'il faut relever le token `MOTION.duration.drawer`;
(B) garder 460ms comme rythme CSS assumé et corriger le commentaire, mais la désync visuelle
demeure.
Recommandation: **A avec un token de tiroir unique** consommé des deux faces (idéalement en
relevant `MOTION.duration.drawer` vers un tempo qui va aussi à l'ouverture de hauteur).
Réservé: engage la valeur du token `MOTION.duration.drawer` (qui pilote aussi l'animation JS)
et `tokens.css` (ton WIP).

**R4. Précharger le Bitter du `h1` (texte LCP)**
Contexte: `@nuxt/fonts` ne précharge aucune police; aucun `<link rel="preload" as="font">`
sur les 69 pages. Le `h1` des héros est en Bitter 700/800 et constitue souvent l'élément LCP.
La chaîne critique est CSS puis `@font-face` puis fetch woff2 puis swap. Atténuation réelle en
place: `font-display:swap` et fallback à métriques ajustées.
Options: (A) activer un préchargement ciblé via l'option de `@nuxt/fonts` si la version
l'expose; (B) injecter manuellement un `<link rel="preload" as="font" type="font/woff2"
crossorigin>` limité à UNE graisse latine (Bitter 700); (C) statu quo.
Recommandation: **A sinon B, une seule graisse latine**. Surtout pas précharger les trois
graisses ni les plages cyrillique/vietnamien (un preload de trop dégrade au lieu d'améliorer).
Réservé: choix de stratégie de chargement de polices.

### Voulu à confirmer (choix assumés)

**R5. Pages villes sans `LocalBusiness`, seulement `Organization` + `ItemPage`**
Les `serviceCity` sont le moteur SEO local de la famille, mais n'émettent pas de balisage de
pertinence locale au-delà de l'`ItemPage` (la page Contact, elle, porte le `LocalBusiness`
complet). Options: (A) statu quo; (B) ajouter un `areaServed` = ville sur un nœud `Service`
rattaché à l'`ItemPage` (gain local sans dupliquer l'entité); (C) `LocalBusiness` complet par
ville (gain maximal, risque de N entités quasi identiques). Recommandation: **B**. Réservé:
décision de stratégie SEO, impact modèle Schema.org site-wide. Fichier:
`app/pages/villes/[slug].vue:64`.

**R6. Head hreflang inconditionnel vs sitemap presence-aware**
Le `<head>` déclare les deux locales même pour un doc mono-langue (repli sur le slug courant),
alors que le sitemap n'émet un alternate que si la traduction existe. Divergence connue et
commentée (`app/pages/blog/[...slug].vue:45`). Sans effet sur le build actuel (toutes les
collections sont bilingues 1:1), mais un futur client avec un doc publié dans une seule langue
émettrait un hreflang vers une 404. Options: (A) aligner le head sur le sitemap
(presence-aware, n'émettre l'alternate que si la traduction existe); (B) statu quo en
s'appuyant sur la discipline éditoriale. Recommandation: **A**, parce que le gabarit sera
copié à des clients dont on ne contrôle pas la discipline de traduction. Réservé: piège latent
de gabarit.

### Mineurs réservés

**R7. Contraste de l'ambre sur fond blanc (astérisque « requis » et icône de callout note)**
Deux marqueurs graphiques ambre sur blanc à 1.64:1, sous le seuil 3:1 de WCAG 1.4.11.
Atténués par un canal non coloré (astérisque: `aria-label="requis"` + `required` natif; icône
note: titre texte du callout). Fichiers: `app/components/ui/input/index.vue:126`,
`app/components/page-builder/article/block/callout.vue:53`. Options: (A) teindre en
`--accent-trust` (bleu, 5.21:1 sur blanc, conforme); (B) introduire un token ambre foncé pour
usage sur clair; (C) statu quo (renfort seulement). Recommandation: **A**, le bleu de confiance
est déjà le token d'accent sur clair. Réservé: choix de peau (l'ambre est la couleur d'appel
signature).

**R8. Tuile de pagination qui se soulève d'un pixel au survol**
`app/components/domain/collection/Pagination.vue:123`, `translateY(-1px)` explicitement
commenté comme micro-retour tactile. À trancher pour la cohérence stricte du geste de cartes
et tuiles, une fois la carte d'article corrigée (déjà faite). Recommandation: **retirer le
1px** pour un langage 100% « ancré au sol », ne renforcer que l'ombre. Réservé: micro-décision
de geste.

**R9. Anneau de focus des contrôles de formulaire dupliqué en quatre exemplaires**
Le motif `box-shadow: 0 0 0 3px color-mix(in oklch, var(--accent-trust) 24%, transparent)` est
recopié à l'identique dans `input`, `checkbox`, `switch`, `form-success`. Les valeurs dérivent
d'un token (discipline 1 respectée) mais le `3px`/`24%` n'est pas tokenisé, alors que l'anneau
d'outline des boutons l'est. Recommandation: extraire `--focus-ring-form` dans `family/tokens.css`
puis câbler les quatre composants. Réservé: touche la surface de tokens (ton WIP).

**R10. Deux tailles de titre d'affichage en `clamp()` bespoke hors échelle `wf-h*`**
`app/components/page-builder/regular/block/about.vue:124` et `app/components/hero/block/page.vue:253`
recalculent à la main des paliers qui doublent l'échelle typographique. Recommandation: aligner
sur le palier `wf-h*` le plus proche, ou documenter la dérogation si la taille est signature.
Réservé: peut modifier le rendu visuel de sections.

**R11. `width`/`height` explicites en plus de l'aspect-ratio (jumeau de R1)**
Même sujet que R1 vu sous l'angle a11y/CWV: l'anti-CLS repose sur `aspect-ratio` seul. Traité
avec R1; à trancher ensemble.

## Constats confirmés (choix assumés, aucune action)

- **Onglet SEO sur article, catégorie et pages légales**: décision de Charles bien implémentée
  (`studio/schemas/documents/{article,category,legal-page}.ts`, groups `content` + `seo`,
  override superposé proprement au transform). Libellé unifié « SEO » partout, plus lisible
  qu'un « Meta » pour l'article. À garder tel quel.
- **Couture preview SSR**: gating vérifié propre, aucune fuite dans le statique
  (`__WF_PREVIEW__` de compilation + gating par branche + hook `nitro:config` qui nettoie
  `stega`). Build statique vérifié vierge de preview, React et token.
- **Anti-CLS par `aspect-ratio`**: valide et moderne, l'espace vertical est réservé avant
  chargement (voir R1 pour l'angle Lighthouse).
- **Avertissement de bundle `UnheadSchemaOrg is not exported`**: bruit vendor de
  `@nuxtjs/seo`, sans effet, le JSON-LD se sérialise intégralement dans chaque page vérifiée.
  Aucune action côté repo.

## Checklist de transfert client (domaine D)

Marche ordonnée des points de contact pour passer de la démo Rempart à un nouveau client, du
plus structurant au cosmétique.

1. **Sanity.** Créer le project client et son dataset (manage.sanity.io). Poser
   `NUXT_PUBLIC_SANITY_PROJECT_ID` / `NUXT_PUBLIC_SANITY_DATASET` en override env, ou changer
   les défauts `nuxt.config.ts:35-36`. Côté Studio: aligner `studio/sanity.cli.ts`
   (projectId/dataset) ET `studioHost` + `deployment.appId` (obligatoire, sinon `sanity deploy`
   vise l'app de la démo), et confirmer `studio/.env.example` (corrigé ce jour vers `5if00rwn`).
2. **Contenu.** Créer le contenu client dans le nouveau dataset via le Studio ou un script ad
   hoc (aucune copie de dataset dans le repo, discipline 3). Migrer le contenu éditorial encore
   en i18n (hero d'accueil, voir R2) vers Sanity.
3. **Domaine et déploiement.** Renommer les Workers dans `wrangler.jsonc` et
   `wrangler.preview.jsonc` (`name`), poser `NUXT_PUBLIC_SITE_URL` par environnement, le secret
   de build `NUXT_SANITY_TOKEN` sur chaque Worker, et `SANITY_STUDIO_PREVIEW_URL` /
   `NUXT_PUBLIC_STUDIO_URL` pour la couture preview.
4. **Branding et tokens.** Réécrire `app/brand/tokens.css` (surfaces, texte, accent de la
   marque cliente) et, si la famille change, `app/family/tokens.css`. Régénérer les
   typographies au besoin (`nuxt.config` fonts).
5. **Légales.** Recréer les `legalPage` dans Sanity, vérifier la parité NAP (téléphone
   canonique fr/en).
6. **Assets.** Remplacer `public/og-rempart-extermination.png` (1200x630, référencé par
   `site.defaultOgImage`, `nuxt.config.ts:563`), `public/logo-rempart.svg`, `favicon.svg` /
   `icon-32.png` / `apple-touch-icon.png` (`nuxt.config` `app.head.link`).
7. **Nommage et indexation.** `package.json` `name` (racine et studio), `CLAUDE.md` / `README`,
   puis lever `site.indexable:false` (`nuxt.config.ts:565`) quand le vrai site est prêt.

## Annexe: méthode et limites

- Build réel `NUXT_SANITY_TOKEN=<token> nuxt generate` contre le project `5if00rwn`, dataset
  `production`. Token lu depuis `.env` local, jamais commité, absent de `.output/public`
  (vérifié).
- Neuf sous-agents d'audit en lecture seule (un par domaine), chaque constat avec preuve
  (fichier:ligne ou extrait du HTML produit).
- Contraste calculé directement depuis les hex des fichiers de tokens (aucun navigateur
  headless requis).
- Aucune poussée distante, aucun déploiement, aucun Worker créé. Le staging et la promotion
  restent la main de Charles.
