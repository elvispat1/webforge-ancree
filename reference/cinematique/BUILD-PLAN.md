# Plan de build — WebForge famille Cinématique (démo Strate)

> Séquence d'attaque pour la session Claude Code, à lancer après que le Minimaliste soit terminé. Le principe directeur: cloner le squelette du Minimaliste à l'identique (conventions, câblage, outillage `/dev`), ne réécrire que la peau. Minimalisme sans être minimaliste.
>
> Intrants déjà prêts: `reference/cinematique/DESIGN.md` (la peau), `docs/SQUELETTE-FAMILLE.md` (la structure), `CLAUDE.md` (le câblage et les conventions), et les artifacts Claude Design validés (référence visuelle: planche système, accueil Strate, guide 3a/3b/3c).
>
> Cadence: une action à la fois, revue de Charles à chaque bloc dans `/dev` avant d'assembler les pages.

## Phase 0, prérequis (prep)

- [ ] Récupérer les artifacts Claude Design dans `reference/cinematique/` comme compagnon visuel du `DESIGN.md` (l'équivalent du `preview.html`). À faire avant le build pour que Claude Code ait la référence sous la main.

## Phase 1, scaffold (ça compile, vide de style)

- [ ] Cloner la structure de `apps/webforge-minimaliste-demo/` vers `apps/webforge-cinematique-demo/`: mêmes dossiers, même câblage, même outillage `/dev`, mêmes conventions de nommage.
- [ ] Ajuster les configs au nouveau workspace (`package.json`, `nuxt.config.ts`, nom de l'app, route-map).
- [ ] Contenu en TS d'abord (comme la V1 du Minimaliste), Sanity reporté. Décision à confirmer: TS d'abord, ou brancher Sanity tout de suite. Recommandation, TS d'abord pour avancer vite sur la peau.
- [ ] Vérifier que `yarn dev` tourne et que l'app compile, sans style.

## Phase 2, couche famille (la peau)

- [ ] Écrire `app/brand/tokens.css` et `app/family/tokens.css` à partir du `DESIGN.md`: les 5 surfaces sombres, `--accent` ambre `#E9A23C` et ses dérivés en `color-mix`, couleurs de texte (titre, corps, discret) et le vert positif; `--font-display` Saira Condensed, `--font-body` IBM Plex Sans; espacement base 8 et rythme entre blocs; rayons, filets; tokens de motion.
- [ ] Relever les valeurs exactes (les 5 surfaces, l'échelle clamp typo) verbatim de la planche système Claude Design.
- [ ] Brancher les polices via `@nuxt/fonts` (Saira Condensed, IBM Plex Sans).
- [ ] Écrire `typography.css` avec l'échelle complète (h1 à h5, corps, lead, petit, étiquette).

## Phase 3, outillage /dev d'abord

- [ ] Recréer les pages `/dev` du Minimaliste: `styleguide`, `blocs/heros`, `blocs/reguliers`, `blocs/articles`, `formulaire`. C'est la surface de revue. Gating dev seulement (404 en prod), comme le Minimaliste.

## Phase 4, blocs cluster par cluster (revue à chaque)

Construire et valider dans `/dev` avant d'assembler. Charles donne ses recommandations par bloc.

- [ ] Atomes: boutons primaire et ghost, lien à filet, badges, étiquettes, champ de base, avec tous les états (repos, survol, focus, désactivé).
- [ ] Héros, les 4 types: home, page, detail, article.
- [ ] Blocs réguliers signatures d'abord: `process` (strates), `projects-preview` (avant-après), `jumbotron`, `stats` (compteurs), `faq` (accordéon).
- [ ] Reste des blocs réguliers: about, services, testimonials, contact, media-text, cta-band, highlights, logos, blog-preview.
- [ ] Formulaire de contact avec tous ses états: repos, focus, erreur de champ, bannière d'erreur, chargement, succès.
- [ ] Blocs d'article (7) en mode lecture éditoriale: lead, rich-text, image, quote, gallery, callout, inline-cta.

## Phase 5, assemblage des pages

- [ ] One-pager (assembleur, navigation par ancres).
- [ ] Multipage (assembleurs par page): accueil, services et détails, projets et détails, à propos, blog (liste, pagination, article), contact, légales. Chaque page assemble les blocs plus son héros imposé.

## Phase 6, passe qualité

- [ ] Vérifier les 3 disciplines sur chaque composant (aucune valeur design en dur, aucun texte d'interface en dur, aucun contenu en dur).
- [ ] Container queries sur le conteneur `site`, aucune media query viewport de largeur.
- [ ] Contraste AA sur fond sombre, `prefers-reduced-motion` respecté, cibles tactiles 44 px.
- [ ] Typecheck `vue-tsc` vert, rendu mobile, audit Lighthouse.

## Phase 7, plus tard

- [ ] Sanity V2 (mêmes signatures, swap de la source dans la couche d'assemblage).
- [ ] Extraction vers `packages/webforge-cinematique` au deuxième consommateur.
- [ ] Déploiement Cloudflare Pages (statique, `.output/public`).

## Règle d'or tout le long

Les artifacts Claude Design sont la référence visuelle, jamais du code à coller. On réimplémente en tokens et composants Vue. On mire le Minimaliste pour le câblage (les cinq pièces par bloc). Tout vit dans `app/family/` et `app/brand/`, jamais dans `webforge-core`.
