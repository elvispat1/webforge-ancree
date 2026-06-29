# webforge-ancree

Repo de la **famille de design Ancrée** (2e famille WebForge) de [Patoine Studio](https://patoinestudio.ca). Construit en Nuxt 4 statique généré. **Un repo par famille de design** (polyrepo): ce repo est la famille Ancrée; les autres familles vivent dans leurs propres repos.

## État

La famille Ancrée est largement bâtie. Démo: **Rempart Extermination** (extermination résidentielle, Rive-Nord de Montréal, fictif), le site qui démontre la famille. Le site reste `site.indexable: false` (gabarit noindex tant qu'aucun vrai site n'est en ligne).

- **Modules**: i18n (fr racine, en sous `/en`), Sanity (`@nuxtjs/sanity`), image, fonts, icon, seo (`@nuxtjs/seo`), pinia. Config dans `nuxt.config.ts`.
- **Identité**: package `webforge-ancree`, project Sanity `5if00rwn` (« WebForge - Ancrée », org Patoine Studio `o7R0d3u6V`), dataset `production`, déploiement Cloudflare Workers (`wrangler.jsonc` / `wrangler.preview.jsonc`, domaines `*.patoinestudio.ca`).
- **Design**: peau propre à Ancrée, base **BLANCHE** (la palette crème de DESIGN.md est surclassée), Bitter slab, grille **16 colonnes**, ombres chaudes, asymétrie posée, mouvement « s'ancre au sol ». Tokens dans `app/family/tokens.css` (famille) et `app/brand/tokens.css` (marque). Vitrine sur `/showcase`.
- **Modes**: multipage à la racine `/`, one-pager sous `/one-pager`, showcase sous `/showcase`. Routage = source unique `app/config/route-map.ts` (bilingue, customRoutes i18n, breadcrumbs).
- **Contenu (Sanity)**: architecture arrimée 1:1 sur Minimaliste (juin 2026). Dataset seedé (**129 docs** fr+en: siteSettings en groupes, 8 singletons de page, service, serviceCity, testimonial, faqItem, faqTheme, legalPage, category, article, plus translation.metadata). Schémas **éclatés** sous `studio/schemas/{documents,objects,objects/blocks,objects/article-blocks}/`. Desk custom (groupes, séparateurs, icônes, filtre FR, singletons verrouillés, groupe Villes), i18n par plugin `@sanity/document-internationalization`, presentation tool. Pipeline `app/queries/{fragments,pages,blocks}` + `app/sanity/transform.ts` (transform pur, **fail-fast**). i18n document-level (slug traduit par langue pour service, partagé pour serviceCity). **Le live fait foi**: le site se borde uniquement par les queries GROQ sur le live au build, aucune copie du dataset dans le repo. Sauvegarde ou clonage de dataset par `sanity dataset export`/`import` (CLI natif, hors repo) au besoin. Lecture de translation.metadata au build via token server-only (voir Conventions).
- **Blog**: complet (liste, archives de catégorie, articles, Portable Text riche, pagination numérotée dormante sous le seuil). `serviceCity` (`/villes/[slug]` fr, `/service-areas/[slug]` en) = moteur SEO local (remplace les projets, abandonnés).
- **SEO**: `usePageSeo` (graphe Schema.org site-wide), JSON-LD, sitemap dynamique avec alternates hreflang. Marque depuis Sanity.

**Reste à bâtir** (voir [ROADMAP.md](./ROADMAP.md) et [DESIGN.md](./DESIGN.md)): formulaire de contact réel (Turnstile + Resend), déploiement Cloudflare (poser `NUXT_SANITY_TOKEN` en secret de build, voir Conventions), retravail des blocs un à un. L'arrimage de l'architecture Sanity + back-end sur Minimaliste est fait (lots A à G, juin 2026).

## Vocabulaire WebForge

- **Système** = WebForge (système de produits PS pour PME).
- **Famille de design** = axe esthétique (Minimaliste, Ancrée, etc.). Une famille = preset de tokens + variantes typographiques + bibliothèque de variantes de blocs. **Une famille = un repo.**
- **Mode** = palier d'usage (One-Pager, Multipage, Builder avec CMS Sanity).
- **Démo** = site fictif qui démontre une famille (la démo d'Ancrée est Rempart Extermination).
- **Client** = site réel (repo séparé, consommera les packages WebForge plus tard).

## Les trois disciplines de code

1. **Aucune valeur design en dur.** Tout par tokens CSS ou props. Les valeurs hardcodées vivent uniquement dans les fichiers de tokens (`app/family/tokens.css`, `app/brand/tokens.css`). Jamais de `color: #xxx` dans un composant.
2. **Aucun texte d'interface en dur** (Nuxt i18n): a11y universelle + chrome produit générique.
3. **Aucun contenu en dur**: le contenu vit dans Sanity (requêtes GROQ par page au build, transformation pure, lecture synchrone par les composables). **Posture fail-fast** (arrimée sur Minimaliste, juin 2026): si un document ou un hero manque, le build échoue (`createError` fatal), jamais de site vide. Les `app/content/*.ts` sont des **contrats de type**, pas un repli runtime. La discipline « repli fixtures pour que le site rende toujours » est volontairement renversée. **Aucune copie du dataset Sanity dans le repo** (pas de seed ni de miroir un pour un): les seules données statiques en code sont les traductions d'interface i18n (discipline 2). Un changement de contenu se fait au Studio ou par script ad hoc qui patche le live, sans rien dupliquer.

## Conventions

- **Commits**: format conventionnel (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`), petits et atomiques, scope optionnel.
- **Layout**: CSS Grid par défaut; flex pour les petits éléments inline.
- **Typographie des textes** (docs, commits, communication): aucun tiret cadratin, aucun middle dot comme séparateur, français québécois soutenu et direct, sans buzzwords.
- **Jamais de numérotation** d'éléments, site-wide.
- **Token Sanity au build** (`NUXT_SANITY_TOKEN`, server-only, jamais `NUXT_PUBLIC_*`): requis au `nuxt generate` pour lire les docs `translation.metadata` (non exposés en lecture publique sur le dataset) et résoudre les alternates hreflang des pages à slug traduit. Sans lui, le build produit des alternates croisés cassés. Vérif: le token ne doit JAMAIS apparaître dans `.output` (ne pas utiliser l'option `token` du module `@nuxtjs/sanity`, qui fuit en config publique). En local: `NUXT_SANITY_TOKEN=<authToken CLI> npx nuxt generate`.

## Cadence

Charles tranche les décisions structurantes. Une action à la fois en série, check-in après chaque tâche significative, franchise totale.
