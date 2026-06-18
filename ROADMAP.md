# Roadmap

État au commit `75b50da`: site statique avec les 6 blocs noyau rendus (Hero, About, Services, Testimonials, Faq, Contact), header sticky, footer, formulaire Contact en validation client + soumission simulée. Sanity reportée en V2.

Le repo est un projet unique (un repo par famille de design): l'app Nuxt vit à la racine, le Studio Sanity dans `studio/` (seul workspace yarn). Les chemins ci-dessous sont relatifs à la racine du repo sauf mention contraire.

Ce document liste ce qui reste à faire, organisé par priorité.

## V1, à compléter avant le branchement Sanity

### Refonte de l'arborescence interne de l'app

Calquage sur le projet de référence `nuxt-sanity-test`. Détails à statuer en session dédiée.

- [ ] Créer `app/layouts/landing.vue` (one-pager) et `app/layouts/default.vue` (multipage).
- [ ] Déplacer le one-pager actuel à `app/pages/one-pager.vue` (route `/one-pager`, layout landing).
- [ ] Préparer `app/pages/index.vue` pour le multipage (vide pour l'instant).
- [ ] Créer la structure cible `app/queries/`, `app/types/`, `app/config/route-map.ts` (vides au début).
- [ ] Refondre `app/components/blocks/` en `app/components/page-builder/regular/` avec orchestrateur typé.

### Pages légales (tâche 12)

- [ ] Créer `app/content/legal.ts` avec deux entrées (`conditions`, `privacy`), chacune contenant: `breadcrumb`, `eyebrow`, `title`, `updated`, `sections[]` (chaque section: `n`, `title`, `body[]`), `contactBlock` (texte + email).
- [ ] Étendre `useContent()` avec la clé `legal`.
- [ ] Créer `app/pages/conditions-utilisation.vue` avec breadcrumb, en-tête, sections numérotées (§01, §02, ...) et bloc contact final.
- [ ] Créer `app/pages/politique-confidentialite.vue`, même structure.
- [ ] Sur ces pages, ajouter la classe `wf-legal` sur le wrapper pour que le Header passe en mode non sticky (CSS déjà prêt).
- [ ] Reprendre le contenu placeholder du bundle de référence (`reference/webforge/project/webforge/legal.jsx`, à la racine du repo), section `CONDITIONS_DATA` et `PRIVACY_DATA`.
- [ ] Posture explicite dans une note de bas de page: gabarit fourni, contenu et validité juridique à la charge du client.

### Passe finale V1 (tâche 13)

- [ ] Vérifier les 3 disciplines sur chaque composant (aucune valeur design en dur, aucun texte d'interface en dur, contenu via `useContent()`).
- [ ] Tester les 4 états du formulaire Contact (idle, loading, success, error).
- [ ] Tester l'accordéon FAQ (un seul ouvert à la fois, accessible au clavier).
- [ ] Tester le scroll-detection du Header (classe `is-scrolled` au-delà de 24px).
- [ ] Tester les 6 ancres de la nav (`#about`, `#services`, `#testimonials`, `#faq`, `#contact`, `#top`).
- [ ] Vérifier le rendu mobile (sous 760px, nav cachée, blocs en mono-colonne).
- [ ] Vérifier Schema.org FAQPage dans le HTML rendu (markup `itemscope`/`itemprop` présent).
- [ ] Audit Lighthouse (performance, a11y, best practices, SEO).

### Menu hamburger mobile

Caveat noté dans CLAUDE.md, à implémenter quand on coderait en Nuxt:

- [ ] Ajouter un bouton burger dans `Header.vue`, visible sous 760px (la nav existante est déjà cachée à ce breakpoint).
- [ ] État réactif `isMenuOpen` (ref).
- [ ] Drawer plein écran ou overlay avec les mêmes liens que la nav desktop.
- [ ] ARIA: `aria-expanded`, `aria-controls`, focus trap.
- [ ] Fermer le menu sur clic d'un lien d'ancre.
- [ ] Reprendre les strings `a11y.toggle_menu_open` et `a11y.toggle_menu_close` déjà dans `i18n/locales/`.

### Brancher l'API Contact (tâche 17)

- [ ] Créer `server/api/contact.post.ts`:
  - Valider le token Turnstile via POST à `https://challenges.cloudflare.com/turnstile/v0/siteverify`.
  - Revalider les champs côté serveur (anti-bypass).
  - Envoyer via l'API REST Resend (`$fetch` vers `api.resend.com`, sans le SDK npm: compatible runtime Cloudflare Workers).
- [ ] Ajouter le widget Turnstile côté client dans `Contact.vue`:
  - Charger le script `https://challenges.cloudflare.com/turnstile/v0/api.js` (via `useHead`).
  - Conteneur avec `data-sitekey` et callback qui set le token dans le state du formulaire.
- [ ] Remplacer la soumission simulée par un `$fetch('/api/contact', { method: 'POST', body: { ...vals, turnstileToken } })`.
- [ ] Créer `.env.example` avec:
  - `RESEND_API_KEY`
  - `TURNSTILE_SECRET_KEY`
  - `NUXT_PUBLIC_TURNSTILE_SITE_KEY`
  - `CONTACT_TO_EMAIL`
  - `CONTACT_FROM_EMAIL`
- [ ] Tester le flow complet en local avec une vraie clé Turnstile (siteverify ne mock pas).

### Renommer le repo et architecture (fait)

- [x] Repo GitHub renommé en `patoine-studio/webforge-minimaliste-demo` (mai 2026).
- [x] Repo GitHub renommé en `patoine-studio/webforge` (mai 2026).
- [x] Repo GitHub renommé en `patoine-studio/webforge-minimaliste` (juin 2026, pivot un-repo-par-famille).
- [x] Pivot d'un monorepo multi-familles vers un repo unique par famille: l'app Nuxt remontée à la racine, `studio/` gardé comme seul workspace yarn, `apps/` et `packages/` supprimés.
- [x] Workspace racine renommé `webforge-minimaliste`.
- [x] `git remote set-url origin` mis à jour vers la nouvelle URL.
- [x] `CLAUDE.md`, `README.md`, `ROADMAP.md` mis à jour.

## V2, après que V1 soit propre

### Brancher Sanity (tâche 15) — TERMINÉ le 10 juin 2026

- [x] Convention d'organisation amendée (10 juin 2026): tout l'interne PS vit dans l'org **Patoine Studio** (`o7R0d3u6V`), un project Sanity par démo ou projet; chaque vrai client garde son organisation dédiée transférable.
- [x] Project **« WebForge - Minimaliste Demo »** (`fesilwqf`) créé dans l'org Patoine Studio, dataset `production`.
- [x] Studio Sanity à `studio/` (workspace yarn, lockfile racine unique). 45 schémas (spec exhaustive: `docs/SANITY-SCHEMA-SPEC.md`), desk structure dans l'ordre du site, one-pager démarqué, i18n par document (`@sanity/document-internationalization`, fr/en), schéma déployé.
- [x] Seed bilingue: 104 documents (fr transposé fidèlement, en rédigé), 52 paires de traduction, 37 images uploadées en assets. Scripts idempotents dans `studio/seed/` (`yarn sanity exec seed/run.mjs --with-user-token`).
- [x] Swap au build (T2a): GROQ + couche transform pure, payload par locale lu en synchrone, signatures et composants intacts, texte rendu bit-identique à la V1.
- [x] Front bilingue (T2b): `prefix_except_default` (fr racine, en sous `/en`, segments et slugs traduits via le route-map partagé), switcher de langue, prérendu doublé, hreflang croisés.
- [x] Preview (T2c): plomberie nuxt-sanity-test gated par env (token + studioUrl absents = statique pur vierge), Presentation tool branché sur le route-map, bannière de preview. D23 exécutée (héros home en `picture`/`source media`).
- [x] Variables d'env documentées dans `.env.example` (app et studio).

### Suivis post-branchement Sanity

- [ ] **Branchement Cloudflare Workers**: root directory à la racine du repo, build output `.output/public`. Sanity vit en constantes de code (zéro variable `NUXT_PUBLIC_SANITY_*` requise au build). Créer la branche `preview` (déploiement SSR, noindex, token Viewer + studioUrl posés en env) pour le Presentation tool en ligne. Détails dans `docs/DEPLOY-CLOUDFLARE.md`.
- [ ] **Token Viewer local**: créer un token API rôle Viewer (manage.sanity.io > fesilwqf > API) et le poser dans `.env` pour activer le Presentation tool en dev (localhost:3000).
- [ ] **Sitemap au passage `indexable: true`** (vrais clients): les sitemaps par langue ne listent que les pages fixes; ajouter les détails dynamiques (services, projets, articles, catégories) à ce moment.
- [ ] **LangSwitcher**: repose sur la clé interne `nuxtI18nInternal` de @nuxtjs/i18n v10 pour détecter les params posés; à revalider au prochain bump majeur du module.
- [ ] **Upgrades futurs assumés** (parité V1 stricte pour l'instant): marks du Portable Text aplaties dans le bloc rich-text (un rendu @portabletext/vue serait un changement de composant), hotspot/crop Sanity non honorés (le crop reste CSS `object-fit`).

### Mode Multipage (tâche 16)

Une fois le mode One-Pager solide, compléter la famille Minimaliste avec le mode Multipage **dans le même repo** (l'app à la racine).

- [x] One-pager isolé à `/one-pager` avec son propre layout (`landing.vue`).
- [x] Gabarits de pages multipages: Accueil, Services + détails, Projets + détails, À propos, Blog (liste, pagination, archives de catégorie, articles), FAQ, Contact, légales. Le multipage occupe `/`, l'aiguillage interne déménagé sous `/dev/sites`.
- [x] Prerender: `nitro.prerender.routes` généré depuis les collections (services, projets, articles, catégories, paginations) en tête de `nuxt.config.ts`. Toutes les routes dynamiques sont seedées, le build échoue sur tout 404 crawlé (gate effectif). 33 routes prérendues, build vert.
- [x] Réutiliser les mêmes blocs dans différents arrangements (assembleurs par page dans `composables/usePageBlocks.ts`).
- [x] Nav du Header mode-aware (`site.nav.landing` ancres / `site.nav.multipage` routes), bug Footer multipage corrigé.
- [x] Passe qualité complète (9-10 juin 2026): audit multi-agents 7 lentilles, 74 findings corrigés (a11y, perf, espacements, cohérence, disciplines, responsive, SEO), rapport dans `docs/AUDIT-MULTIPAGE-2026-06-09.md`, contrat amendé. Multipage déclaré TERMINÉ. Lighthouse formel optionnel (les axes qu'il mesure ont été audités et corrigés).
- [x] Pipeline image branché: `<Image>` rend `<NuxtImg>` webp responsive (srcset + sizes), provider `ipxStatic` (génération au build), servi en statique sur Cloudflare Workers.
- [x] Blocs ajoutés: 8 réguliers (media-text, cta-band, process, stats, projects-preview, blog-preview, highlights, logos) + 7 d'article (lead, rich-text, image, quote, gallery, callout, inline-cta) + 3 héros (page, detail, article).

### Mode Multipage: points en suspens (mis à jour après la passe qualité des 9-10 juin 2026)

La passe qualité (74 findings) a réglé la quasi-totalité des points qui restaient. État:

- [x] **Revue visuelle**: faite (audit multi-agents + œil de Charles), retouches appliquées (carte projet partagée `ProjectCard`, tags de catégorie sur les covers, « Blogue » partout, pagination respirée).
- [x] **Rendu mobile**: audité et corrigé; la grille de page est passée en container queries (`@container site`), désynchronisation 1024px éliminée.
- [ ] **Logo en mode multipage**: vise `#top` (scroll vers le haut). Trancher si on préfère qu'il ramène à l'accueil `/` (petit ajustement de `Logo.vue` + Header/Footer/MobileMenu).
- [x] **Config Cloudflare Workers**: build output directory `.output/public`. Phase 1 (prod + staging, statique) en ligne depuis le 15 juin 2026, voir `docs/DEPLOY-CLOUDFLARE.md`.
- [x] **Typecheck**: vue-tsc VERT au complet (les 3 erreurs pré-existantes corrigées + tout le strict). Règle apprise: tout fichier dans la fermeture de `nuxt.config.ts` utilise des imports relatifs, jamais l'alias `~`.
- [x] **Galeries de projets**: toutes imagées (24 générations nano-banana, 16 images passées en 4K via Topaz Gigapixel). 5 placeholders volontaires restent dans les corps des nouveaux articles de blogue.
- [x] **srcset mobile**: chaînes `sizes` réécrites partout avec clés nommées jusqu'à `xxl` (contrat §8).
- [x] **Blogue**: 12 articles (9 par page + pagination), couche SEO centralisée dans `usePageSeo`, démo entier non indexable (gabarit, `site.indexable: false`).

### Variantes de blocs Minimaliste

À brainstormer dans une session dédiée.

- [ ] Exemples envisagés: Hero centré, Hero split (actuel), Hero pleine image.
- [ ] Vivront dans `app/families/minimaliste/blocks/` quand créées (futur: package `webforge-minimaliste` publié à part, au moment où un deuxième consommateur apparaît).
- [ ] Système pour choisir une variante au niveau de la page (prop ou config).

## Blocs à ajouter au catalogue (socle vivant)

Le catalogue de squelette (`docs/SQUELETTE-FAMILLE.md`) est un socle vivant: d'une famille ou d'un type de site à l'autre, on ajoute ou on retranche des blocs. Deux manques identifiés le 10 juin 2026, à ajouter d'abord dans Minimaliste puis à propager au socle.

### Bloc `video` (embed YouTube par ID)

- [ ] Interface `VideoContent` dans `app/content/`: `{ provider?: 'youtube'; id: string; title: string; ratio?: string; caption? }`. `id` = ID YouTube seul, jamais une URL complète. `title` requis (a11y de l'`<iframe>`).
- [ ] Type `VideoBlock = BlockBase<'video'> & VideoContent`, ajouté à l'union `PageBlock`.
- [ ] Composant `page-builder/regular/block/video.vue`, entrée `video` dans `regular/block-map.ts`.
- [ ] **Façade click-to-load** (cohérent avec le blocage dur Loi 25): on rend une vignette (poster) plus un bouton lecture, l'`<iframe>` YouTube ne s'injecte qu'au clic. Domaine `youtube-nocookie.com`. Évite de charger un témoin tiers avant l'action de l'usager.
- [ ] Ratio par défaut 16:9, tokenisé, container query.

### Bloc `embed` (iframe générique)

- [ ] Interface `EmbedContent`: `{ src: string; title: string; ratio?: string; allow?: string; caption? }`. Pour un snippet, une carte, un calendrier, tout contenu tiers. `title` requis (a11y).
- [ ] Type `EmbedBlock = BlockBase<'embed'> & EmbedContent`, ajouté à `PageBlock`, composant plus entrée block-map.
- [ ] Sécurité: attribut `sandbox` sur l'`<iframe>`, `src` validé contre une liste de domaines de confiance, considération consentement si le tiers dépose des témoins.

## Hors session, à faire à un moment

### Extraction progressive vers des packages publiés

Le code partagé (`webforge-core`, et plus tard `webforge-minimaliste`) deviendra des packages publiés à part (GitHub Packages, semver, opt-in), PAS un dossier `packages/` dans ce repo. On extrait **dès qu'un deuxième consommateur apparaît**.

- [ ] Identifier le premier candidat à extraire vers `webforge-core` (probablement le composable de formulaire de contact, quand une deuxième famille en a besoin).
- [ ] Identifier le premier candidat à extraire vers `webforge-minimaliste` (probablement `tokens.css`, quand un client réel Minimaliste démarre).
- [ ] Publication sur GitHub Packages (inclus dans le plan Team PS) quand les premiers consommateurs externes apparaissent.

### Famille Cinématique (active depuis le 10 juin 2026)

Deuxième famille, esthétique cinématique et immersive (références figure.ai, starlink.com). Démo « Strate », firme fictive de réhabilitation des sols à Sorel-Tracy. Principe directeur, le cinéma sans la vidéo (échelle, grade sombre, retenue), la vidéo reste une variante haut de gamme. Voir `docs/SQUELETTE-FAMILLE.md` et la note vault Architecture WebForge.

- [ ] Brief de style Cinématique pour Claude Design (en cours).
- [ ] Créer un repo séparé `patoine-studio/webforge-cinematique` (peau de la famille, câblage répliqué depuis Minimaliste).

Éditoriale sera la famille suivante. Chaleureuse, envisagée un temps, a été retirée du plan le 10 juin 2026.

### Pricing paliers 2 et 3

Session dédiée Tarification du Plan de construction PS.

### Flot administratif WebForge

Session dédiée: paiement, signature, questionnaire client qui remplace la Découverte du Custom.

## État de la task list (référence rapide)

Au commit `75b50da` (avant la migration monorepo):

- **Complétées**: 1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 14.
- **Pending V1**: 12 (légales), 13 (passe finale), 17 (API Contact), plus menu hamburger mobile, plus refonte de l'arborescence interne (calquage sur `nuxt-sanity-test`).
- **Pending V2**: 15 (Sanity), 16 (Multipages).
