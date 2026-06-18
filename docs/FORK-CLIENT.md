# Forker le gabarit vers un vrai site client

Marche ordonnée pour copier ce repo (gabarit de la famille Minimaliste, démo Atelier
Cormier) vers un nouveau site client, sans résidu de la démo. Les points marqués **PIÈGE**
n'ont pas de porte de sortie automatique: ce sont les plus faciles à oublier.

Référence de la convention à deux régimes Sanity: [CONVENTIONS-CONTRACT.md §17](./CONVENTIONS-CONTRACT.md).

## 1. Repo et nommage

- Créer le repo du client (ex. `patoine-studio/<client>-site`) à partir de ce gabarit.
- `package.json` (`name`), `studio/package.json` (`name`), titre du Studio
  (`studio/sanity.config.ts`, champ `title`).

## 2. Sanity, organisation et project

- Régime **vrai client** (transférable): créer une **organisation Sanity dédiée au nom du
  client**, et un project dedans. Noter le nouveau `projectId` et le `dataset`.
- À la livraison, transférer l'organisation entière au client.

## 3. Connexion dans le code

- `nuxt.config.ts`: défaut `projectId` (constante `sanityProjectId`) et défaut `siteUrl`
  (constante `siteUrl`).
- **PIÈGE** `studio/sanity.cli.ts`: `studioHost` et `appId` n'ont PAS d'override env
  (commentés « À CHANGER au transfert client »). Oubliés, `sanity deploy` / `schema:deploy`
  viseraient la démo. `projectId`/`dataset` y acceptent l'override env (`SANITY_STUDIO_*`).
- **PIÈGE** `studio/seed/run.mjs` et `verify.mjs`: `PROJECT_ID`/`DATASET` via override env.
  `run.mjs` refuse de seeder `fesilwqf` (la démo) sans `SEED_ALLOW_DEMO=1`: poser
  `SANITY_STUDIO_PROJECT_ID` vers le project du client AVANT de seeder.

## 4. Variables d'environnement

- Copier `.env.example` en `.env`.
- Poser `NUXT_PUBLIC_SITE_URL` **par Worker** (prod / staging / preview).
- Poser le token Viewer (`SANITY_API_READ_TOKEN`) sur le Worker **preview** seulement, et
  passer `SANITY_STUDIO_PREVIEW_URL` au `studio:deploy`.
- Formulaire de contact en prod: `runtimeConfig.public.contactDemo` à `false`, plus
  `RESEND_API_KEY` / `CONTACT_FROM_EMAIL` / `CONTACT_TO_EMAIL` et les clés Turnstile.

## 5. Déploiement

- Renommer Workers et domaines dans `wrangler.jsonc` / `wrangler.preview.jsonc`.
- Adapter `.github/workflows/sync-preview.yml`.
- Recréer le webhook Sanity publish -> Deploy Hook prod (filtre
  `!(_id in path("drafts.**"))` pour ne pas builder à chaque autosave de brouillon).
- CORS Sanity pour le nouveau domaine Studio + preview/prod; Cloudflare Access sur
  staging/preview. Détail dans [DEPLOY-CLOUDFLARE.md](./DEPLOY-CLOUDFLARE.md).

## 6. Branding et tokens

- Remplacer `app/brand/tokens.css` (palette du client) et resynchroniser le snapshot de
  `app/components/styleguide/tokens.vue`.
- Lockup logo + favicons (`public/`) + `public/og/og-default.jpg` (1200 x 630).

## 7. Contenu (seed)

- Adapter le seed avec le vrai NAP (nom, adresse, téléphone), courriel et légales.
- Neutraliser les échantillons de `/showcase` (specimen et faux formulaire) et le repli
  d'alt de `serviceImage` si du contenu créé au Studio laisse un alt vide.

## 8. Indexation

- Basculer `site.indexable` à `true` dans `nuxt.config.ts`.
- Vérifier que les `noindex` de page voulus tiennent (one-pager, showcase, et les pages
  légales du one-pager) par un build de contrôle.
- Confirmer que le sitemap liste bien toutes les pages indexables (accueil inclus) et que
  `robots.txt` est allow-all avec une ligne `Sitemap:`.

## 9. Nettoyage

- Généraliser ou retirer les commentaires de la démo dans le code livré.
- Sortir les artefacts de travail (briefs, prompts d'audit) du repo livré.
- `rm` le symlink `dist` local s'il pointe encore vers un ancien chemin.

## 10. Licence et régime de droits

- **À statuer (DEC-09):** le régime de droits du code livré au client (cession pure?
  licence avec réserve pour les parties destinées à `webforge-core`?) n'est pas encore
  tranché. Tant qu'il ne l'est pas, aucun fichier `LICENSE` n'est posé et `package.json`
  ne porte pas de champ `license`. À régler avant la première livraison réelle.
