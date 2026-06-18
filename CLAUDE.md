# webforge-minimaliste

Repo du site **WebForge Minimaliste** (famille Minimaliste, démo Atelier Cormier) de [Patoine Studio](https://patoinestudio.ca). **Un repo par famille de design** (polyrepo): ce repo est la famille Minimaliste; les autres familles vivent dans leurs propres repos. Construit en Nuxt 4 statique généré.

Le repo sert deux usages: gabarit de référence pour tous les futurs sites livrés à de vrais clients, et matière éducative pour la communication commerciale PS.

## Vocabulaire WebForge

- **Système** = WebForge (le système global de produits PS pour PME).
- **Famille de design** = axe esthétique (Minimaliste, Cinématique en cours, Éditoriale à venir). Une famille = preset de design tokens + variantes typographiques + bibliothèque de variantes de blocs propres à la famille. **Une famille = un repo.**
- **Mode** = palier d'usage. Palier 1 One-Pager (1 500 $), palier 2 Multipage statique, palier 3 Builder avec CMS Sanity exposé au client.
- **Variante de bloc** = alternative au sein d'un même bloc dans une famille (Hero centré, Hero split, Hero pleine image).
- **Démo** = site fictif qui démontre une famille dans un mode (ce repo: Atelier Cormier démontre Minimaliste).
- **Client** = site réel (vit dans un repo séparé, consommera plus tard les packages WebForge).

Un vrai client signe en disant « je veux la famille Cinématique, en mode Multipage, avec le Hero pleine image ». Trois choix, une livraison.

## Architecture: un repo par famille (polyrepo)

**Pivot tranché le 15 juin 2026: abandon du monorepo, un repo par famille.** Avant, toutes les familles vivaient dans un seul monorepo yarn (`apps/` + `packages/`). Maintenant chaque famille est son propre repo, un projet Nuxt unique. Raison: le monorepo portait toute une mécanique d'isolation (watch paths, branche de prod par worker) UNIQUEMENT pour simuler des repos séparés, alors que son vrai bénéfice (partage de code source) restait inutilisé (le partage passe par des packages versionnés opt-in, qui marchent entre repos séparés) et que les vrais clients sont déjà des repos séparés. Détail et rationale en mémoire `project-polyrepo-migration`.

Ce repo (`webforge-minimaliste`) est un projet Nuxt unique. Structure:

```
webforge-minimaliste/                 # racine = l'app Nuxt
├── app/                              # srcDir Nuxt (pages, composants, composables, family/, brand/, ...)
├── server/                          # routes Nitro (formulaire de contact, exit-preview)
├── public/                          # assets statiques (favicons, images du site)
├── i18n/                            # locales fr/en
├── nuxt.config.ts                   # config (Sanity en top-level await, route-map, gating preview)
├── wrangler.jsonc                   # Worker prod (assets-only)
├── wrangler.preview.jsonc           # Worker preview (SSR, édition visuelle Sanity)
├── studio/                          # Studio Sanity (workspace yarn d'un seul membre)
├── reference/                       # bundle de design partagé (lecture seule)
├── package.json                     # name webforge-minimaliste, workspaces: ["studio"]
├── yarn.lock
├── .yarnrc.yml                      # nodeLinker: node-modules
└── .nvmrc                           # version Node verrouillée
```

**Autres familles = autres repos.** `webforge-cinematique`, `webforge-editoriale`, et ainsi de suite, chacun son repo, créé à partir de celui-ci.

**Code partagé = packages versionnés (futurs).** `webforge-core` (commun à toutes les familles) et `webforge-<famille>` (tokens, variantes, schemas d'une famille) deviendront des packages publiés (GitHub Packages, semver), consommés par les repos de famille et les clients. Convention de remplissage: on extrait un élément **dès qu'un deuxième consommateur apparaît** (par exemple, à la création de la 2e famille, on extrait le scaffold commun dans `webforge-core` publié et on fait consommer les deux). Tant qu'un seul consommateur existe, on garde dans l'app pour éviter l'abstraction prématurée. Pas encore extraits.

**Vrais clients.** Vivent dans des repos séparés (`patoine-studio/<client>-site` par exemple). Ils consommeront les packages WebForge via GitHub Packages quand on sera prêts à publier (les packages restent `private: true` jusque-là).

## Stratégie d'exécution: une famille à la fois

1. Minimaliste One-Pager (Atelier Cormier).
2. Minimaliste Multipage dans le même repo. Le one-pager vit à la route `/one-pager`, le multipage occupe `/` et le reste.
3. Variantes de blocs au sein de la famille Minimaliste.
4. Démarrer la famille Cinématique dans un **nouveau repo** (`webforge-cinematique`), créé à partir de celui-ci. C'est le « 2e consommateur »: extraire le scaffold commun dans `webforge-core` publié et faire consommer les deux.
5. Au moment où le pattern est stable: publication des packages sur GitHub Packages pour consommation par les repos clients.

## Modèle d'affaires

Site vendu, propriété au client à la livraison. Maintenance optionnelle via grille mensuelle PS. Pas de site loué, pas d'abonnement obligatoire post-livraison. Le code source est livré au client.

## Les trois disciplines de code

**1. Aucune valeur design en dur.** Tout par tokens CSS variables ou props paramétrables. Les valeurs hardcodées vivent uniquement dans les fichiers de tokens de famille (actuellement `app/family/tokens.css`, futur package `webforge-minimaliste`). Aucun `color: #2D4A3E` dans un composant: tout passe par `var(--accent-1)`.

**2. Aucun texte d'interface affiché en dur** (Nuxt i18n). En V1, i18n couvre deux familles de strings: (a) les strings d'accessibilité universelles (skip link, aria-labels, landmarks), et (b) le **chrome produit générique** réutilisable d'un site à l'autre, écrit une fois et destiné à `webforge-core` (ex: la bannière de consentement aux témoins, `consent.*`). Le contenu propre au site (textes d'Atelier Cormier) reste géré par la discipline 3, pas par i18n.

**3. Aucun contenu en dur** (Sanity localizable + queries build).
- **V2 (actuel, branchée le 10 juin 2026)**: le contenu vit dans Sanity (project `fesilwqf`, documents par langue via `@sanity/document-internationalization`, fr et en). L'app fetch un graphe de contenu par locale au build (GROQ dans `app/queries/`, transformation pure dans `app/sanity/transform.ts`, payload lu en synchrone par les composables): les signatures (`useContent`, assembleurs, collections) n'ont pas bougé au swap, les composants non plus. Le Studio vit à `studio/` (workspace yarn), la spec des 45 schémas dans `docs/SANITY-SCHEMA-SPEC.md`, le seed reproductible dans `studio/seed/`. `app/content/` ne garde que les interfaces de types, les samples de la vitrine /dev, `consent.ts` et `ARTICLES_PER_PAGE`.
- L'assouplissement V1 (contenu hardcodé en TS) est terminé.

  Convention Sanity à deux régimes (amendée le 10 juin 2026):
  - **Interne PS** (démos WebForge, projets Patoine Studio, jamais transféré): tout vit dans **l'organisation Patoine Studio** (id `o7R0d3u6V`), un project Sanity par démo ou projet. La gestion (membres, facturation) se centralise à un seul endroit. Pour ce site: project « WebForge - Minimaliste » (id `fesilwqf`). Le nom fictif Atelier Cormier reste dans le contenu et le code, jamais dans l'arborescence Sanity.
  - **Vrai client** (transférable): organisation dédiée au nom du client, project dedans (ex: org « Urgence Calfeutrage » + project « Site web 2026 »). Au moment de la livraison, on transfère l'organisation entière au client.

Si la discipline 1 ou 2 glisse, refactor coûteux. La discipline 3 a un assouplissement V1 contrôlé et un plan V2 explicite.

## Stack technique

- **Yarn 4 workspaces** avec `nodeLinker: node-modules` (PnP désactivé, incompatible avec `nuxt prepare`). La racine du repo EST l'app; `studio/` est un workspace d'un seul membre. Une seule `yarn.lock`.
- **Node LTS** verrouillé via `.nvmrc` à la racine.
- **Nuxt 4** + Vue 3 + **TypeScript strict**.
- **Modules Nuxt actifs**: `@nuxtjs/i18n` (`prefix_except_default`: fr à la racine, en sous `/en`, customRoutes générés par `app/config/route-map.ts`), `@nuxtjs/sanity`, `@nuxt/image` (variantes ipx au build, `domains: ['cdn.sanity.io']`), `@nuxt/fonts`, `@nuxt/icon`, `@nuxtjs/seo`, `@pinia/nuxt` (Tailwind v4 passe par le plugin Vite).
- **Sanity**: `nuxt.config.ts` consomme Sanity au chargement (top-level await, routes de prérendu + garde du blogue): projectId/dataset/apiVersion sont des **constantes de code** (override env optionnel, aucune variable Sanity requise), mais un accès réseau à Sanity est REQUIS pour `dev`, `build`, `generate` et le postinstall. Le preview (visual editing) ne s'active que si `SANITY_API_READ_TOKEN` + `NUXT_PUBLIC_STUDIO_URL` sont posés ET que la branche de build est `preview`: le statique de production reste vierge (ni stega ni React). Même code sur toutes les branches; la branche `preview` (SSR, noindex) ne diverge que par env.
- **Formulaire de contact**: le démo est en **statique pur**, donc le formulaire simule le succès côté client (`useContactForm` + flag `runtimeConfig.public.contactDemo: true`). Le pattern serveur (`resend` + Cloudflare Turnstile via `server/api/contact.post.ts`) reste dans le code, inerte en démo, et sert les vrais sites clients (qui mettent `contactDemo` à false et déploient avec un runtime serveur).
- **Déploiement**: Cloudflare **Workers** (static assets), intégration Git native, **statique pur** (`nitro.preset: 'static'`, sortie `.output/public`, aucun code à l'exécution: le Worker sert directement les fichiers prérendus par `nuxt generate`). **Un Worker par environnement**, chacun sur son domaine custom `patoinestudio.ca` (workers.dev coupé partout, tout reste `noindex`): prod = Worker `webforge-minimaliste`, branche `main`, `webforge-minimaliste.patoinestudio.ca`; staging = Worker `webforge-minimaliste-staging`, branche `staging`, `webforge-minimaliste-staging.patoinestudio.ca` (même config `wrangler.jsonc`, déployé via `wrangler deploy --name`); preview = Worker `webforge-minimaliste-preview`, branche `preview`, SSR (`wrangler.preview.jsonc`). Chaque Worker coupe les builds de branches non-prod et porte un build watch path `*` (le repo entier = l'app). **Variables**: Sanity vit en constantes de code (zéro variable Sanity requise), seule `NUXT_PUBLIC_SITE_URL` est posée par Worker (+ le token Viewer sur le Worker preview); Node vient de `.nvmrc` (pas de `NODE_VERSION`). Détail dans `docs/DEPLOY-CLOUDFLARE.md`.

## Conventions

**Commits.** Format conventionnel (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`). Petits commits atomiques. Scope optionnel selon la zone touchée (`feat(blog):`, `fix(studio):`, `chore(deploy):`).

**Layout.** CSS Grid par défaut pour les colonnes et structures de section. Flex réservé aux petits éléments inline (boutons côte à côte, header row, kicker avec dot). Voir feedback en mémoire pour le détail.

**Typographie des textes (CLAUDE.md, READMEs, commits, communication avec Charles).** Aucun tiret cadratin. Aucun middle dot comme séparateur. Français québécois soutenu, direct, sans buzzwords.

**Validation des disciplines.** Avant tout commit, vérifier: aucune valeur design en dur dans les composants, aucun texte d'interface UI en dur (a11y via i18n), aucun contenu en dur dans les composants (V1: contenu vit dans la couche choisie, pas dans les composants).

## Posture commerciale

- **Sanity et i18n ne sont pas mentionnés au client** en paliers 1 et 2. Outils internes PS.
- **Argument Sanity** dégainé seulement à la bascule en palier 3 Builder.
- **Argument multilingue** dégainé seulement si le client le demande.
- **Pages légales**: gabarit fourni, contenu et validité juridique à la charge du client.

## Références

**Bundle de design** (référence visuelle, pas du code source à reprendre tel quel):
- `reference/webforge/project/WebForge Palier 1 - standalone.html`
- `reference/webforge/project/webforge/styles.css` (CSS canonique avec tous les tokens et composants)
- `reference/webforge/project/webforge/sections.jsx` (composants React de référence, à transposer en Vue)
- `reference/webforge/project/webforge/legal.jsx` (template pages légales)
- `reference/webforge/chats/chat1.md` (intent utilisateur côté Claude Design)

**Vault Obsidian de Charles** (source canonique):
- `/Users/charlespatoine/Google Drive/06 - Obsidian/ideaverse/CLAUDE.md` (résumé global PS)
- `02 - Travail/Patoine Studio/Playbook/Architecture WebForge.md` (note canonique, sections *Familles de design* et *Sanity reporté en V2* importantes; note: la note décrit encore l'ancien monorepo, on est passés à un repo par famille, voir mémoire `project-polyrepo-migration`)
- `CC-Session-Logs/26-05-2026-16_10-cadrage-webforge-3-paliers-architecture-package.md`

## Cadence de travail

Charles tranche les décisions structurantes lui-même. Une action à la fois en série, pas d'empilement. Check-in après chaque tâche significative. Franchise totale: si une idée est mauvaise ou cache un piège, le dire.

## Ce qui reste à faire

Voir **[ROADMAP.md](./ROADMAP.md)** à la racine pour la liste des chantiers V1 et V2, organisés par priorité avec sous-étapes concrètes.

## Questions reportées

- Structure interne des blocs (à calquer sur le projet de référence `nuxt-sanity-test`, exploration faite, plan à exécuter).
- Délimitation repo de famille vs packages partagés (`webforge-core`): quoi vit où, et quand on extrait du premier vers les seconds.
- Flot administratif WebForge (paiement, signature, questionnaire client).
- Contenu type des pages légales.
- Pricing des paliers 2 et 3.
