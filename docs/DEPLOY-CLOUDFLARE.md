# Branchement Cloudflare, démo WebForge Ancrée

Runbook du déploiement du démo Rempart Extermination sur Cloudflare. Calqué sur le
déploiement de la famille Minimaliste (même modèle: un Worker par environnement).
Le reste du document décrit la cible et les gestes; ci-dessous l'état RÉEL d'Ancrée.

## État actuel (18 juin 2026): config prête, Workers à créer

- **Config en place et vérifiée**: `wrangler.jsonc` (prod/staging, assets-only,
  sortie `.output/public`) et `wrangler.preview.jsonc` (preview SSR, `main` +
  binding ASSETS, `nodejs_compat`) portent les bons noms (`webforge-ancree`,
  `webforge-ancree-preview`). `yarn generate` est VERT (65 routes bilingues,
  statique pur), le site se sert proprement en local (`npx serve .output/public`).
- **Sanity**: project `5if00rwn` (« WebForge - Ancree », org Patoine Studio),
  dataset `production`, schéma déployé, contenu seedé (fr + en). Les ids sont
  gravés en constantes de code (zéro variable Sanity requise au build).
- **Git**: remote `origin` = `github.com/elvispat1/webforge-ancree`. Branches
  `main`, `staging`, `preview` poussées (preview suit main via
  `.github/workflows/sync-preview.yml`).
- **À FAIRE (geste de tableau de bord Cloudflare, le MCP CF est en lecture
  seule)**: créer les trois Workers (prod/staging/preview) connectés au repo
  GitHub, poser `NUXT_PUBLIC_SITE_URL` par Worker (+ les 3 variables du preview),
  brancher les domaines custom `*.patoinestudio.ca`, couper workers.dev. Le détail
  pas-à-pas suit; tout reste `noindex` (`site.indexable: false`).

## Modèle retenu: Workers, un Worker par environnement

On a tranché pour **Cloudflare Workers (static assets)**, pas Pages, et pour
**un Worker distinct par environnement** plutôt qu'un projet unique à
environnements par branche (le plan initial, conservé plus bas en historique).
Le motif est l'**isolation multi-familles**:

- Chaque Worker porte son propre **build watch path** `*` (tout le repo).
- Sur le Worker de prod, les **builds de branches non-prod sont coupés**.
- Conséquence: chaque famille vit dans son propre repo, donc un push d'une autre
  famille ne touche jamais ce Worker; chaque Worker ne construit que sa branche.

Le `wrangler.jsonc` à la racine déclare la topologie du Worker de prod
(`name: webforge-ancree`, assets-only, sortie `.output/public`). Le
Worker de **staging** réutilise la même config, build sur la branche `staging`,
et se déploie sous son propre nom (`wrangler deploy --config wrangler.jsonc
--name webforge-ancree-staging`).

### Build (yarn 4)

- **Root directory**: racine du repo (lockfile unique à la racine).
- **Build command**: `corepack enable && yarn install --immutable && yarn
  generate`. yarn 4.x vient du champ `packageManager`, sans variable.
- **Build output directory**: `.output/public`.
- **Node**: vient de `.nvmrc` (24.x), lu par l'image de build au même titre que
  yarn via `packageManager`. **Aucune variable `NODE_VERSION`** (retirée le
  15 juin 2026; l'image lit déjà les versions depuis les fichiers du repo, ça se
  confirme noir sur blanc dans le log du build suivant).
- **Build watch path**: `*` (tout le repo).

### Variables d'environnement

- **Sanity en constantes de code**: zéro variable `NUXT_PUBLIC_SANITY_*` requise
  (commit `refactor(minimaliste-demo): connexion Sanity en constantes de code`).
  Le build n'a plus besoin d'aucune variable Sanity.
- **Seule variable posée par Worker**: `NUXT_PUBLIC_SITE_URL` (l'URL canonique de
  l'environnement, prod vs staging).
- Aucun token Sanity ni `.env` committé.

## Phase 2: preview SSR (édition visuelle Sanity) — TERMINÉE (15 juin 2026)

**État: EN LIGNE.** Le Worker `webforge-ancree-preview` build la branche `preview`
en SSR (preset `cloudflare-module`, `nodejs_compat`, Startup ~53ms) et sert sur
`https://webforge-ancree-preview.patoinestudio.ca` (200, `x-powered-by: Nuxt`,
noindex). Build `corepack enable && yarn install --immutable && yarn build`, deploy
`npx wrangler deploy --config wrangler.preview.jsonc`, watch `*`, 3 vars de build posées
(`SANITY_API_READ_TOKEN`, `NUXT_PUBLIC_STUDIO_URL`, `NUXT_PUBLIC_SITE_URL`). Cycle
d'édition visuelle VALIDÉ depuis `webforge-ancree.sanity.studio` > Presentation
(iframe sur le domaine preview, résolution de document, overlays click-to-edit/stega,
images CDN Sanity). **Auto-sync**: `.github/workflows/sync-preview.yml` pousse `main` sur
`preview` à chaque push, donc le preview rebuild avec le même code que prod.

**Seul reste**: Cloudflare Access (Zero Trust) sur le domaine preview (Charles), puis
re-test du cycle à travers Access (tension iframe/cookie tiers, voir les gardes-fous).

La spec d'origine ci-dessous est conservée comme dossier de ce qui a été implémenté.

### Déjà en place (vérifié dans le code, 15 juin)

- **Pureté statique préservée**: `__WF_PREVIEW__` (constante de compilation)
  élimine le code mort preview du build statique; le hook `nitro:config` retire
  la clé `stega` hors preview. Prod et staging restent vierges (vérifié).
- **Fetch des drafts en preview branché** (`app/plugins/01.content.ts`): cookie
  de preview posé -> le contenu passe par `useSanityQuery` (token + perspective
  drafts + stega), sous la même clé payload, transform identique.
- **Studio**: le Presentation tool est complet (previewUrl + mainDocuments +
  locations dérivés du route-map partagé), `yarn studio:deploy` est prêt.
- **Studio PAS encore déployé**: `get_project_studios` renvoie « local only ».
  C'est un PREMIER déploiement. `sanity.cli.ts` n'a pas de `studioHost`: sans
  intervention le premier `sanity deploy` est interactif (choix du hostname).
- **Gating actuel**: `previewEnabled` est gaté sur la présence des deux variables
  (`SANITY_API_READ_TOKEN` + `NUXT_PUBLIC_STUDIO_URL`), nuxt.config.ts:60.

### À faire, code (en repo, inerte hors Worker preview)

1. **Ajouter le gating par branche** (décision Charles, 15 juin). En PLUS de la
   présence des variables, `previewEnabled` vérifie que la branche de build est
   `preview`. Couche de sécurité explicite: un token Viewer égaré sur le Worker
   prod ou staging n'allumerait PAS le preview. Mettre à jour le commentaire
   « décision tranchée #4 » de nuxt.config en conséquence.
   ```ts
   // WORKERS_CI_BRANCH: injecté au build par Cloudflare Workers Builds (confirmé
   // doc CF, changelog 10 juin 2025); undefined en dev local (alors permissif).
   const ciBranch = process.env.WORKERS_CI_BRANCH
   const onPreviewBranch = ciBranch === 'preview' || ciBranch === undefined
   const previewEnabled = onPreviewBranch
     && !!process.env.SANITY_API_READ_TOKEN
     && !!studioUrl
   ```
   Effet: dev local = preview si token + studioUrl posés (inchangé); Worker prod
   (`main`) et staging (`staging`) = jamais de preview, même avec un token; Worker
   preview (`preview`) = preview actif. La sécurité ne mord qu'au build sur
   Workers Builds (où `WORKERS_CI_BRANCH` est posé); en dev local, c'est la
   présence des variables qui reste le filet.

2. **Preset SSR gaté sur `previewEnabled`.** `nitro.preset` est figé à `'static'`.
   Le rendre conditionnel: SSR sur Workers quand `previewEnabled`, `'static'`
   sinon. Le Worker preview build avec `nuxt build`; prod/staging gardent
   `nuxt generate`. À VÉRIFIER au premier build du Worker preview: le nom exact du
   preset Workers (cloudflare-module ou équivalent Nitro courant) et le flag
   `nodejs_compat` (la stack React du visual editing en SSR a besoin de la compat
   Node sur workerd). Risque principal de la Phase 2, à valider tôt.

3. **Images en preview.** En statique, les variantes `/_ipx/` sont prérendues au
   build (sharp/Node). En SSR sur un Worker, sharp ne tourne pas. En preview,
   basculer @nuxt/image sur le **CDN Sanity** (les images du contenu sont déjà des
   assets cdn.sanity.io). Gaté sur `previewEnabled`; prod/staging inchangés. À
   valider: le fragment `<Image>` passe par l'abstraction provider de @nuxt/image,
   et le provider consomme bien le `src` (URL cdn.sanity.io complète) du contenu.

4. **`studioHost` figé** dans `sanity.cli.ts` (proposé `webforge-ancree` ->
   `webforge-ancree.sanity.studio`), pour que `yarn studio:deploy` soit
   reproductible et scriptable. À confirmer par Charles (c'est une URL).

5. **Branche `preview`**: la créer depuis `main` et la pousser (n'existe pas;
   seules `main` et `staging` existent).

Couplage à garder en tête: `previewEnabled` gate AUSSI le preset. Le Worker
preview ne build en SSR que si la branche est `preview` ET ses deux variables
sont posées au build. Token seul, ou mauvaise branche -> build statique.

### À faire, infra (qui fait quoi)

- **Token Viewer** (Charles): manage.sanity.io > project 5if00rwn > API > Tokens,
  rôle Viewer. Server-only, jamais commité.
- **Deploy du Studio** (assistant, scriptable une fois `studioHost` figé):
  `SANITY_STUDIO_PREVIEW_URL=https://webforge-ancree-preview.patoinestudio.ca yarn studio:deploy`.
  Produit `webforge-ancree.sanity.studio`. (Si le CLI local n'est pas
  authentifié: `sanity login` d'abord, côté Charles.)
- **Worker preview Cloudflare** (Charles, dashboard; MCP CF en lecture seule):
  Worker `webforge-ancree-preview`, Git sur `patoine-studio/webforge-ancree`,
  branche de prod `preview`, watch path `*` (tout le repo), config
  `wrangler.preview.jsonc` à la racine, build
  `corepack enable && yarn install --immutable && yarn build`,
  domaine custom `webforge-ancree-preview.patoinestudio.ca`, `nodejs_compat`
  au besoin. Variables (les TROIS, sinon build statique):
  `SANITY_API_READ_TOKEN` (Viewer),
  `NUXT_PUBLIC_STUDIO_URL=https://webforge-ancree.sanity.studio`,
  `NUXT_PUBLIC_SITE_URL=https://webforge-ancree-preview.patoinestudio.ca`.
- **CORS Sanity** (assistant, via MCP): ajouter l'origine
  `https://webforge-ancree-preview.patoinestudio.ca` aux origines CORS du
  project, allowCredentials.
- **Cloudflare Access** (Charles): sur `webforge-ancree-preview.patoinestudio.ca`
  (Zero Trust), comme staging.

### Ordre d'exécution

1. Code (1 à 5 ci-dessus) + check-in, sur `main` (inerte: tout gaté sur
   `previewEnabled`, faux partout sauf sur le Worker preview).
2. Pousser la branche `preview`.
3. Charles: créer le token Viewer.
4. Assistant: `yarn studio:deploy` (avec `SANITY_STUDIO_PREVIEW_URL`) ->
   `webforge-ancree.sanity.studio`.
5. Assistant: CORS de l'origine preview via MCP.
6. Charles: créer le Worker preview avec les TROIS variables (donc build SSR).
7. Charles: Access sur l'URL preview.
8. Vérifier le cycle complet (checklist).

### Vérification (cycle complet)

- Build du Worker preview vert (SSR, `nodejs_compat` OK), et `WORKERS_CI_BRANCH=preview`
  bien posé au build (sinon la sécurité par branche est inerte).
- Depuis `webforge-ancree.sanity.studio`, le Presentation tool charge le
  Worker preview en iframe; cookie posé via `/preview/enable`.
- Un draft non publié est visible au reload de l'iframe; overlays click-to-edit
  actifs; bannière de sortie présente.
- Les images s'affichent dans le preview (CDN Sanity).
- Re-grep après les changements code: prod et staging restent vierges (zéro
  `stega`, zéro route `/preview/*`, zéro React dans `.output/public`).

## Rebuild auto de la prod à la publication (webhook Sanity, 16 juin 2026)

La prod est statique (`nuxt generate`): le contenu publié n'apparaît qu'après un
rebuild. Branché le 16 juin pour rebuild automatique à chaque publication Sanity.

**Mécanisme: webhook Sanity -> Cloudflare Deploy Hook.** Depuis le 1er avril 2026,
**Workers Builds supporte les Deploy Hooks**: une URL unique par branche, un `POST`
dessus build et déploie cette branche. C'est le pattern natif CMS vers rebuild,
sans GitHub Action (le `sync-preview.yml` sert à autre chose: pousser main sur
preview).

```
Sanity (Publish) ──webhook POST──▶ Cloudflare Deploy Hook (branche main) ──▶ build webforge-ancree
```

Les deux pièces sont des gestes de tableau de bord (le MCP Cloudflare et le MCP
Sanity n'ont pas d'outil pour les créer).

### 1. Cloudflare Deploy Hook

Worker `webforge-ancree` > **Settings** > **Build** > **Deploy Hooks** >
**Add deploy hook**: nom `Sanity publish`, branche **main**. Copier l'URL générée
(`https://api.cloudflare.com/client/v4/workers/builds/deploy_hooks/<UUID>`).
**Cette URL est un secret** (quiconque l'a peut déclencher un build, risque faible).
Rate-limit 10 builds/min/worker, 100/min/compte. Cloudflare **déduplique** les
hooks en rafale (plusieurs publications d'un coup = 1 build).

### 2. Webhook Sanity (GROQ-powered)

manage.sanity.io > project `5if00rwn` > **API** > **Webhooks** > **Create webhook**:

| Champ | Valeur |
|---|---|
| Name | `Rebuild prod on publish` |
| URL | l'URL du Deploy Hook (étape 1) |
| Dataset | `production` |
| Trigger on | Create + Update + Delete |
| **Filter** | `!(_id in path("drafts.**"))` |
| HTTP method | `POST` |
| Drafts / Versions | décochés |
| Secret | vide (l'URL EST le secret; CF ne vérifie pas de signature) |

**Le piège, le seul réglage qui compte vraiment: le filtre
`!(_id in path("drafts.**"))`.** Sans lui, chaque sauvegarde automatique de
brouillon (à chaque frappe dans le Studio) déclencherait un build: gaspillage de
minutes de build et d'argent. Le filtre ne laisse passer que les mutations sur
documents **publiés**. Cliquer « Publish » met à jour le document publié (id sans
préfixe `drafts.`) et supprime le brouillon: ça build. Éditer un brouillon: ça ne
build pas.

### Vérification

Publier un changement, puis Worker `webforge-ancree` > **Builds**: un build
apparaît avec « Sanity publish » comme source, prod à jour ~1-2 min après.

### Hors scope

- **Preview** (SSR): pas de rebuild requis, il fetch les drafts en direct.
- **Staging** (statique comme prod): pourrait avoir son propre Deploy Hook + webhook
  de la même façon si on veut y tester du contenu; non posé.
- **Futures familles**: chaque repo de famille refait ces 2 mêmes pièces sur SON
  Worker prod et SON project Sanity.

## Gardes-fous

- Ne jamais committer de token ni de `.env`. `.env.example` tient les noms.
- Le statique de prod et de staging reste vierge: zéro stega, zéro token actif,
  zéro React du visual editing (gating par branche, vérifié par grep au build).
- Les environnements restent `noindex` tant que le démo est un gabarit. Un vrai
  client basculera `site.indexable: true` et complétera le sitemap des pages
  dynamiques (suivi en ROADMAP).
- Le MCP Cloudflare branché est en **lecture seule** côté déploiement: il ne crée
  pas de Worker, ne branche pas l'intégration Git, ne pose pas de variable. La
  mise en place reste une opération de tableau de bord.

## Historique: le plan initial (Pages, projet unique)

Le premier plan visait **Cloudflare Pages**, un seul projet, environnements
distingués par la branche (`CF_PAGES_BRANCH`), avec deux portées de variables
(Production et Preview). On a divergé vers Workers par-env pour l'isolation
multi-familles décrite plus haut. La logique de gating par branche du plan
initial reste valable (transposée de `CF_PAGES_BRANCH` à `WORKERS_CI_BRANCH`); le
reste (portées de variables Pages, `*.pages.dev`) est caduc.
