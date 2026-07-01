# Branchement Cloudflare, démo WebForge Ancrée

Runbook du déploiement du démo Rempart Extermination sur Cloudflare. Plan vivant,
à amender au fil de l'exécution. Topologie calquée sur webforge-minimaliste (repo
frère, déjà en ligne), avec une seule vraie divergence: le secret de build
`NUXT_SANITY_TOKEN` est requis sur prod ET staging (pas seulement sur le preview).

**État (1 juillet 2026): LES TROIS ENVIRONNEMENTS EN LIGNE ET VÉRIFIÉS.** Phase 1
(statique: prod + staging) ET Phase 2 (preview SSR, édition visuelle Sanity) complètes. Prod
(`webforge-ancree` sur `main`, `webforge-ancree.patoinestudio.ca`) et staging
(`webforge-ancree-staging` sur `staging`, `webforge-ancree-staging.patoinestudio.ca`)
déployés via Workers Builds; secret de build `NUXT_SANITY_TOKEN` + variable
`NUXT_PUBLIC_SITE_URL` par environnement; builds des branches non-prod coupés;
`workers.dev` off; vérifiés en live (200, hreflang slug-traduit correct, canonical
par environnement, noindex, zéro fuite du token). `origin/staging` a été
fast-forwardé sur `main`. La **Phase 2 (preview SSR)** est faite et vérifiée (détail
plus bas). Les trois branches
(`main`, `staging`, `preview`) sont poussées sur `patoine-studio/webforge-ancree`. Les deux fichiers
`wrangler.jsonc` et `wrangler.preview.jsonc` sont prêts (noms échangés depuis
Minimaliste, workers.dev et preview_urls coupés). Le site reste `noindex`
(`site.indexable: false`, gabarit non indexable tant qu'aucun vrai site n'est en
ligne).

## Coordonnées

- **Compte Cloudflare**: `Patoine Studio` (`27f4f9d60c66b323730888a958b513a6`).
- **Zone**: `patoinestudio.ca` (déjà gérée par le compte, Minimaliste y sert ses
  domaines custom).
- **Repo GitHub**: `patoine-studio/webforge-ancree`.
- **Project Sanity**: `5if00rwn` (« WebForge - Ancrée », org Patoine Studio),
  dataset `production`.
- **Auth wrangler**: OAuth `charles@patoinestudio.ca`, token large (workers
  write, zone read). `wrangler whoami` confirme. Aucune variable
  `CLOUDFLARE_API_TOKEN` requise en local.

## Modèle retenu: Workers Builds, un Worker par environnement

On copie le modèle Minimaliste: **Cloudflare Workers Builds (intégration Git
native)**, pas GitHub Actions pour le déploiement, pas wrangler manuel en régime
permanent. Chaque environnement est un Worker distinct, branché sur sa branche;
un push déclenche son build. Motif: isolation multi-familles (un repo par
famille, chaque Worker ne build que sa branche, watch path `*`).

La seule GitHub Action du repo (`.github/workflows/sync-preview.yml`, déjà
présente) ne déploie rien: elle force-push `main` vers `preview` pour que le
Worker preview rebuild avec le même code que prod.

Le **MCP Cloudflare est en lecture seule côté déploiement**: il n'crée pas de
Worker, ne branche pas Git, ne pose pas de variable ni de domaine. La création
des Workers, le branchement Git, les variables, les secrets et les domaines
custom sont des **gestes de tableau de bord** (faits par Charles, ou pilotés via
le MCP Chrome sous sa supervision).

## Topologie cible

| Env | Worker | Branche | Domaine | Preset | Build | Deploy |
|---|---|---|---|---|---|---|
| Prod | `webforge-ancree` | `main` | `webforge-ancree.patoinestudio.ca` | static | `corepack enable && yarn install --immutable && yarn generate` | `npx wrangler deploy` |
| Staging | `webforge-ancree-staging` | `staging` | `webforge-ancree-staging.patoinestudio.ca` | static | idem | `npx wrangler deploy --config wrangler.jsonc --name webforge-ancree-staging` |
| Preview | `webforge-ancree-preview` | `preview` | `webforge-ancree-preview.patoinestudio.ca` | cloudflare-module (SSR) | `corepack enable && yarn install --immutable && yarn build` | `npx wrangler deploy --config wrangler.preview.jsonc` |

Notes communes à tous les Workers:
- **Root directory**: racine du repo (lockfile unique).
- **Node**: depuis `.nvmrc` (`24.16.0`). **Yarn**: depuis `packageManager`
  (`yarn@4.13.0`). Aucune variable `NODE_VERSION` (l'image de build lit les
  versions dans les fichiers du repo).
- **Build watch path**: `*` (tout le repo).
- **Build des branches non-prod: coupé** sur chaque Worker (chacun ne build que
  sa branche de prod).
- **workers.dev et preview URLs: coupés** (déjà dans les `wrangler*.jsonc`). Le
  site ne sert que sur son domaine `patoinestudio.ca`.

Prod et staging partagent `wrangler.jsonc` (`name: webforge-ancree`). Le staging
surcharge le nom au déploiement via `--name webforge-ancree-staging`, sinon il
écraserait la prod.

## Variables et secrets, par Worker

| Variable | Prod | Staging | Preview | Nature |
|---|---|---|---|---|
| `NUXT_PUBLIC_SITE_URL` | URL prod | URL staging | URL preview | Texte (publique) |
| `NUXT_SANITY_TOKEN` | requis | requis | requis | **Secret** (server-only) |
| `NUXT_PUBLIC_STUDIO_URL` | absent | absent | URL du Studio | Texte (publique) |

### Le point qui diffère de Minimaliste: `NUXT_SANITY_TOKEN` sur prod et staging

`nuxt.config.ts` et `app/plugins/01.content.ts` lisent un token de LECTURE
server-only pour résoudre `translation.metadata` (les slugs traduits par langue,
non exposés en lecture publique sur ce dataset). Sans lui, le build PASSE mais
sort des alternates hreflang croisés cassés (ex. catégorie « nuisibles » qui
pointe vers elle-même au lieu de « pests »). Le démo étant `noindex`, l'impact
SEO est nul aujourd'hui, mais on veut la sortie correcte: on pose le secret sur
prod et staging.

Garde-fou dur: le token est server-only et **ne doit JAMAIS apparaître dans
`.output/public`**. On n'utilise PAS l'option `token` du module `@nuxtjs/sanity`
(qui fuit en config publique); le token transite par `runtimeConfig` privé et un
client dédié importé sous `import.meta.server`. Vérification obligatoire après
build: `grep` de la valeur du token dans `.output/public` doit renvoyer 0.

Subtilité fail-fast (à connaître pour la vérif): `01.content.ts` rend
`createError` fatal si le fetch de contenu échoue. Donc un token **invalide**
fait ÉCHOUER le build (401 au fetch de contenu), alors qu'un token **absent** le
laisse passer en mode dégradé (hreflang croisés cassés). Conséquence: le test de
fuite local exige un token VALIDE pour produire un `.output/public` à inspecter.

## Plan d'exécution

Ordonnancement recommandé: livrer prod + staging (prêts au code, statiques)
d'abord, puis le preview (qui demande l'activation du code SSR). Les trois
arrivent au bout; on valide le pipeline sur le cas statique simple avant le cas
SSR.

### Étape 0: repo (assistant)

- [ ] Documenter `NUXT_SANITY_TOKEN` et les variables preview dans `.env.example`
  (le fichier date du reset et ne les mentionne pas).
- [ ] Ce runbook (`docs/DEPLOY-CLOUDFLARE.md`).
- Commit conventionnel `docs(deploy): ...`. Ne touche pas `app/family/tokens.css`
  (WIP forme).

### Phase 1: prod + staging (statique)

- [ ] **Charles**: créer un token de lecture Sanity (manage.sanity.io > project
  `5if00rwn` > API > Tokens, rôle **Viewer**). Server-only, jamais commité. Le
  poser en local dans un `.env` (gitignoré) sous `NUXT_SANITY_TOKEN=...` pour la
  vérif, et le garder pour le secret Cloudflare.
- [ ] **Assistant**: vérif locale.
  - `npx nuxt generate` (avec le token dans `.env`): build vert.
  - **Gate fuite**: `grep -rF "<valeur du token>" .output/public` renvoie 0.
  - Hygiène statique: pas de `stega`, pas de chunk React, pas de route
    `/preview/` dans `.output/public`.
  - Contrôle hreflang: les alternates des pages à slug traduit (services,
    catégories, articles) pointent le bon slug de l'autre langue.
- [ ] **Dashboard**: créer le Worker `webforge-ancree` (Import a repository >
  `patoine-studio/webforge-ancree`), branche de prod `main`, build et deploy de
  la table ci-dessus, watch `*`, builds non-prod coupés. Variables:
  `NUXT_PUBLIC_SITE_URL=https://webforge-ancree.patoinestudio.ca`, secret
  `NUXT_SANITY_TOKEN`. Domaine custom `webforge-ancree.patoinestudio.ca`.
  workers.dev coupé.
- [ ] **Dashboard**: créer le Worker `webforge-ancree-staging`, branche de prod
  `staging`, même build, deploy avec `--name webforge-ancree-staging`. Variables:
  `NUXT_PUBLIC_SITE_URL=https://webforge-ancree-staging.patoinestudio.ca`, secret
  `NUXT_SANITY_TOKEN`. Domaine `webforge-ancree-staging.patoinestudio.ca`.
- [ ] **Vérif**: les deux builds verts dans Workers Builds; les deux domaines
  répondent 200; `noindex` présent; aucune fuite de token (fetch d'une page +
  grep). `WORKERS_CI_BRANCH` bien posé par l'image de build (sinon la garde de
  branche du preview serait inerte plus tard).
- [ ] **Optionnel**: rebuild auto de la prod à la publication Sanity. Deploy Hook
  Cloudflare (Worker prod > Settings > Build > Deploy Hooks, branche `main`) +
  webhook Sanity (project `5if00rwn` > API > Webhooks) avec le filtre
  `!(_id in path("drafts.**"))`. Deux gestes de tableau de bord.

### Phase 2: preview (SSR, édition visuelle Sanity) — FAITE (1 juillet 2026)

Worker `webforge-ancree-preview` sur `webforge-ancree-preview.patoinestudio.ca`.
Activation portée 1:1 de Minimaliste, une seule vraie adaptation: le gate lit le
token composite d'Ancrée (`sanityReadToken = NUXT_SANITY_TOKEN || SANITY_API_READ_TOKEN`,
déjà déclaré) plutôt qu'un `SANITY_API_READ_TOKEN` séparé. Commit `fd37364` sur `main`.

- [x] **Code (`nuxt.config.ts`)**: `previewEnabled` (branche `preview` + `sanityReadToken`
  + `NUXT_PUBLIC_STUDIO_URL`); `__WF_PREVIEW__` = `previewEnabled`; preset
  `previewEnabled ? 'cloudflare-module' : 'static'`; bloc `sanity.visualEditing`
  (mode `live-visual-editing`, `token: sanityReadToken`, studioUrl, stega); `vite.optimizeDeps`
  React (preview seulement); hook `nitro:config` (neutralise le prérendu en preview,
  garde le retrait de `stega` hors preview); `image.provider = 'none'` en preview;
  `htmlAttrs class wf-no-motion` en preview; `public.studioUrl`.
- [x] **Anti-flash du hero**: Ancrée coupe le mouvement en JS via `__WF_PREVIEW__`
  (`app/family/motion.ts`), MAIS le masque anti-flash du hero d'accueil
  (`app/components/hero/block/home.vue`, `opacity:0` sur `[data-reveal]`) est du CSS
  media-query pur qui ne voit pas `__WF_PREVIEW__` → en preview le hero resterait
  invisible (le JS de révélation est coupé). Fix (calque Mini): classe `wf-no-motion`
  posée sur `<html>` en preview + masque gaté `html:not(.wf-no-motion)`. Sortie
  statique inchangée au bit près (classe absente hors preview).
- [x] **Deps**: `react`, `react-dom`, `styled-components`, `@sanity/image-url`
  (+ `@types/react`, `@types/react-dom`), versions verbatim de Minimaliste.
- [x] **Vérif locale SSR**: `WORKERS_CI_BRANCH=preview NUXT_PUBLIC_STUDIO_URL=… npx nuxt build`
  → preset `cloudflare-module`, `.output/server/index.mjs` produit; token ABSENT de
  `.output/public`. Build statique (`nuxt generate`, sans env preview) → `.output/public`
  vierge (0 token/stega/react/route preview; `wf-no-motion` présent SEULEMENT comme
  sélecteur CSS, jamais appliqué sur `<html>`).
- [x] **Studio**: `studioHost` + `appId` déjà figés. Déployé avec
  `SANITY_STUDIO_PREVIEW_URL=https://webforge-ancree-preview.patoinestudio.ca yarn studio:deploy`
  (le presentationTool était déjà câblé). Token Viewer = le même qu'en Phase 1.
- [x] **Dashboard**: Worker `webforge-ancree-preview`, branche **`preview`**, build
  `corepack enable && yarn install --immutable && yarn build`, deploy
  `npx wrangler deploy --config wrangler.preview.jsonc`, root `/`, builds non-prod coupés,
  watch `*`, API token « webforge-minimaliste-demo build token » (seul token du compte).
  3 vars de BUILD: `NUXT_PUBLIC_SITE_URL=https://webforge-ancree-preview.patoinestudio.ca`,
  `NUXT_PUBLIC_STUDIO_URL=https://webforge-ancree.sanity.studio`, secret chiffré
  `NUXT_SANITY_TOKEN`. Domaine custom `webforge-ancree-preview.patoinestudio.ca`,
  `workers.dev` + `preview_urls` off. `nodejs_compat` + compat date appliqués par
  `wrangler.preview.jsonc` au deploy.
- [x] **CORS Sanity**: origine `https://webforge-ancree-preview.patoinestudio.ca`
  ajoutée (allowCredentials) via MCP Sanity `add_cors_origin`.
- [x] **Vérif du cycle**: live 200 SSR, noindex, `<html class="wf-no-motion">` (hero
  visible), stega + client visual-editing présents, zéro fuite token, images cdn.sanity.io,
  routes /en //services //villes en 200. Depuis `webforge-ancree.sanity.studio` >
  Presentation: l'iframe charge le Worker en perspective `drafts`, hero + sections
  rendent, `mainDocuments` mappe `/` → Accueil FR (éditeur synchro), overlays
  click-to-edit actifs, zéro erreur console liée au preview. Prod + staging
  re-vérifiés vierges.
- [x] **PreviewBanner**: porté de Minimaliste, adapté au style Ancrée (bandeau « mode
  preview » + bouton « Quitter » qui ramène au site publié via
  `server/api/exit-preview.get.ts` et `prodHostFromPreviewHost`).
- [ ] **Charles (optionnel)**: Cloudflare Access (Zero Trust) sur les domaines
  preview et staging. Le preview sert des brouillons à qui a l'URL (noindex mais public).

## Pièges rencontrés (Phase 1, tableau de bord)

- **Compte GitHub à sélectionner**: le wizard part sur `elvispat1` (perso, aucun
  repo). Basculer sur **`patoine-studio`** pour voir `webforge-ancree`.
- **Premier build « à vide »**: le wizard crée le Worker et lance un premier build
  SANS les variables. On pose ensuite `NUXT_PUBLIC_SITE_URL` + le secret
  `NUXT_SANITY_TOKEN` dans Settings > Build > Variables and secrets, puis on relance
  (build history > **Retry build**). Ce premier build est invisible (pas de domaine
  attaché, site noindex), on branche le domaine seulement après le build correct.
- **Staging, branche de prod**: le wizard crée le Worker sur la branche par défaut
  (`main`). Mettre la production branch à **`staging`** dans Settings > Build >
  Branch control APRÈS création. Le combobox exige de VRAIES frappes clavier (taper
  « staging » puis cliquer l'option), un simple remplissage programmatique ne
  s'enregistre pas.
- **Notice de renommage `wrangler.jsonc`**: sur le Worker staging, Cloudflare affiche
  « renomme wrangler.jsonc en webforge-ancree-staging » et peut ouvrir une PR.
  **À IGNORER / fermer**: prod et staging partagent volontairement `wrangler.jsonc`
  (name `webforge-ancree`), staging surcharge via `--name` dans sa commande de deploy;
  renommer casserait la prod.

## Gardes-fous

- Ne jamais committer de token ni de `.env`. `.env.example` tient les noms.
- Le statique de prod et staging reste vierge: zéro `stega`, zéro token dans
  `.output/public`, zéro React du visual editing (vérifié par grep au build).
- Les environnements restent `noindex` tant que le démo est un gabarit.
- Action outward-facing ou irréversible (création de Worker, domaine, Git,
  webhook): confirmer avant d'exécuter. Une action à la fois, check-in après
  chaque étape.

## Prérequis à confirmer au démarrage

- L'app GitHub de Cloudflare a accès au repo `webforge-ancree` (déjà installée
  sur l'org pour Minimaliste; il reste à étendre l'accès au nouveau repo, geste
  de la création du premier Worker).
- Méthode des gestes de tableau de bord: Charles les fait depuis un runbook, ou
  l'assistant pilote via le MCP Chrome (à activer) sous supervision.
