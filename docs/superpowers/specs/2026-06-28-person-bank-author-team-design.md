# Banque de personnes: unifier auteurs d'articles et membres d'équipe

Date: 2026-06-28
Statut: SPEC (rien implémenté). Priorité #1 du reste du chantier FOND, avant de finir le blog.
Famille: Ancrée (WebForge), démo Rempart Extermination
Project Sanity: 5if00rwn, dataset production

## Objectif

Faire des quatre personnes de Rempart (Martin, Julie, Samuel, Nadia) une banque réutilisable:
un seul document `person` par personne et par langue, référencé à la fois par l'auteur d'un
article et par le bloc équipe de la page À propos. Aujourd'hui la même personne est saisie deux
fois, dans deux formes qui ne se parlent pas; la banque fait de l'identité une source unique.

## Diagnostic de l'état réel (audité: live + schémas + pipeline + seed)

1. Auteur d'article: `article.author` est un `string` requis, nom et rôle collés en une chaîne
   libre (`studio/schemas/documents/article.ts`, champ author). Projeté brut, transformé en
   pass-through (`author: raw.author ?? ''`, `app/sanity/transform.ts`), rendu comme un seul
   jeton texte dans la ligne meta du hero d'article (`app/components/hero/block/article.vue`,
   metaItems: date, auteur, lecture), réinjecté tel quel dans le JSON-LD (`author.name`,
   `app/composables/usePageSeo.ts`). Live: punaises = « Julie Caron, technicienne... »; fourmis
   et souris = « L'équipe Rempart » / « The Rempart team » (pas encore nommés).
2. Bloc équipe: `studio/schemas/objects/blocks/team.ts` porte `members[]` d'objets inline
   `teamMember` (name requis, role requis, bio optionnelle, photo = figure), ordre manuel,
   dupliqués en entier dans `aboutPage-fr` et `aboutPage-en`. Rendu en cartes portrait riches
   (`app/components/page-builder/regular/block/team.vue`: portrait, nom slab, rôle bleu confiance,
   bio).
3. Aucun lien entre les deux représentations. Aucun document `person`/`teamMember`/`author`
   (17 types document, aucun n'est une personne). i18n strictement document-level partout
   (`@sanity/document-internationalization`, `I18N_SCHEMA_TYPES` inclut aboutPage et article);
   seul l'alt du portrait est déjà partagé entre langues (au niveau de l'asset).

Conséquence: le byline d'un article ne peut pas montrer le rôle ni le portrait, parce que la
donnée n'existe pas sur l'article. La banque corrige ça à la racine.

## Décisions tranchées (Charles, 2026-06-28)

1. Type document: `person` (neutre, sert l'auteur ET le team).
2. i18n: jumeaux fr/en document-level, paire `translation.metadata`, exactement comme
   service / serviceCity / testimonial. Référence par langue, transform inchangé côté résolution.
3. Champs: nom, rôle, bio, portrait (figure). Pas de credentials (retirés à dessein du team),
   pas de slug (aucune page perso dans la démo).
4. Byline article: nom + rôle dans la ligne meta actuelle (FOND, zéro nouvelle forme), plus un
   JSON-LD `schema.org/Person` enrichi. Pas de carte portrait (FORME, différée).
5. Person est référencé, pas une page: aucune route, aucun impact sitemap.

## Modèle de données

### Document `person`
- `language`: injecté par le plugin document-internationalization.
- `name`: string requis. Identique entre jumeaux fr/en (nom propre, langue-neutre par nature).
- `role`: string requis. Traduit (ex. « Technicien rongeurs et exclusion » / « Rodent and
  exclusion technician »).
- `bio`: text optionnelle. Traduite. Affichée par les cartes équipe; sert aussi de
  `Person.description` au JSON-LD si présente.
- `photo`: figure (portrait). Asset partagé entre les deux jumeaux; l'alt vit sur l'asset
  (bilingue), comme aujourd'hui.

Aperçu Studio: title = name, subtitle = role, media = photo.image (calqué sur l'objet team
actuel). Le document est rangé dans le desk avec les collections, filtre FR, icône users.

### Référence depuis le bloc équipe
- `team.members[]` devient un tableau de **références** vers `person`, ordre manuel conservé.
  Le bloc garde `eyebrow`, `heading`, `lead` (copie par langue). L'objet inline `teamMember`
  est retiré.
- Filtre du sélecteur de référence: même langue que le document parent (voir Filtre de langue).

### Référence depuis l'article
- `article.author` passe de `string` à **référence** requise vers `person`. Même filtre de langue.

### Filtre de langue (référence cohérente)
Le sélecteur de référence (article.author et team.members) filtre par la langue du document
hôte: `options.filter` renvoie `{ filter: 'language == $lang', params: { lang:
props.document?.language } }`. Ainsi un article fr ne propose et ne stocke que des `person-*-fr`,
et l'aboutPage fr ne pointe que vers des `person-*-fr`. Le `CONTENT_GRAPH_QUERY` tournant par
langue, la déréférence résout naturellement la bonne personne dans la bonne langue.

## Schéma Studio (studio/)

- Nouveau `studio/schemas/documents/person.ts` (defineType document, champs ci-dessus).
- `studio/schemas/index.ts`: importer + enregistrer `person` (groupe collections).
- Desk (`studio/` structure): ajouter `person` à la liste des collections, filtre FR, icône.
- `studio/sanity.config.ts`: ajouter `'person'` à `I18N_SCHEMA_TYPES`.
- `studio/schemas/objects/blocks/team.ts`: `members[]` → `of: [{ type: 'reference', to: [{ type:
  'person' }], options: { filter } }]`; retirer l'objet inline `teamMember`.
- `studio/schemas/documents/article.ts`: `author` → `type: 'reference', to: [{ type: 'person' }],
  validation requis, options: { filter }`.

## Pipeline Nuxt (app/)

- Requêtes:
  - `app/queries/blocks/page-builder.ts`, cas team: `members[]->{ name, role, bio, "photo": photo
    <FIGURE_PROJECTION> }` (déréférence).
  - `app/queries/fragments/cards.ts`, `ARTICLE_CARD_FIELDS`: `author->{ name, role, "portrait":
    photo <FIGURE_PROJECTION> }` (déréférence). La projection détail réutilise les champs carte.
- Transform (`app/sanity/transform.ts`):
  - `transformTeam`: le map des membres reste identique (déjà `{ name, role, bio?, photo:{src,alt}
    }`); posture fail-fast si une référence ne résout pas.
  - `transformArticle`: `author` devient un objet `{ name, role, portraitSrc?, portraitAlt? }`
    (fail-fast si absent), au lieu d'une chaîne.
- Types:
  - `app/types/sanity.ts`: `SanityArticle.author` et `SanityTeamBlock.members` reflètent la forme
    dérefée.
  - `app/content/articles.ts`: nouveau type `ArticleAuthor { name; role; portraitSrc?;
    portraitAlt? }`; `Article.author: ArticleAuthor`.
  - `app/content/hero.ts`: `HeroArticleContent.author` porte `{ name, role }` (le composant compose
    l'affichage).
  - `app/content/team.ts` et `app/types/blocks.ts`: inchangés (la forme app du membre est déjà
    `{ name, role, bio, photo }`).
- Composants et assemblage:
  - `app/components/hero/block/article.vue`: le byline lit `author.{name, role}` et pousse
    « name, role » dans `metaItems`. Rendu visuel identique à aujourd'hui (un seul jeton texte).
    Le rôle garde sa casse stockée (capitalisée, ex. « Technicienne... »); si tu veux retrouver
    exactement la minuscule actuelle de la chaîne punaises, on minusculise l'initiale du rôle dans
    le composant. Détail à confirmer au moment du rendu.
  - `app/components/page-builder/regular/block/team.vue`: inchangé.
  - `app/pages/blog/[...slug].vue`: passe l'objet author au hero et au SEO.
  - `app/composables/usePageSeo.ts`: émet un `schema.org/Person` (name, jobTitle = role, image =
    portrait si présent, description = bio si présente) à la place du `author.name` plat.
  - Carte d'article du listing blog: vérifier si elle affiche l'auteur; si oui, consommer la forme
    dérefée; sinon rien à faire.

## Migration (studio/seed/)

`studio/seed/migrate-person-bank.mjs` (lit le token CLI `~/.config/sanity/config.json`, patch
live, idempotent):
1. Lire le bloc team live (`aboutPage-fr` et `aboutPage-en`) pour sourcer name/role/bio et le ref
   d'asset du portrait, par personne et par langue (le live fait foi, pas de transcription).
2. Créer 8 documents `person` (`person-{martin,julie,samuel,nadia}-{fr,en}`) avec language, name,
   role, bio, photo (figure pointant l'asset existant).
3. Créer 4 `translation.metadata` (format v6 cloné du live, une paire par personne).
4. Repointer `team.members[]`: `aboutPage-fr` → refs `*-fr`, `aboutPage-en` → refs `*-en`; garder
   eyebrow/heading/lead. Conserver l'ordre Martin, Julie, Samuel, Nadia.
5. Repointer `article.author` (référence par langue): punaises → Julie, fourmis → Martin,
   souris → Samuel.
6. createOrReplace + publish, écarter les brouillons. Garde idempotente (saute si déjà migré).

Miroir `studio/seed-content.json`: ajouter les 8 docs `person` (portrait en `IMG:team-*`), changer
les membres du bloc team en références par `_id` de person, changer `article.author` en référence
par `_id`. `studio/seed/seed.mjs`: aucun changement d'asset (les clés `team-*` sont déjà dans
`IMAGES` et `ALT_TEXT`); s'assurer que les person sont créées avant la résolution des références
au publish.

## Validation

- `sanity schema validate`: 0 erreur.
- `sanity schema deploy` (manifeste) puis `sanity deploy` (Studio hébergé). Charles a autorisé
  d'avance les deploys quand le schéma change.
- `NUXT_SANITY_TOKEN=$(node -p "require(require('os').homedir()+'/.config/sanity/config.json').authToken") npx nuxt generate`:
  vert, 0 lien cassé, 0 erreur, 0 avertissement; vérifier que le token est ABSENT de `.output`.
- Vérif au rendu SSR: byline fourmis/souris/punaises = « nom, rôle » fr et en; bloc équipe de
  /a-propos inchangé (mêmes 4 cartes); JSON-LD `Person` présent sur un article.

## Hors périmètre (étapes suivantes, pas cette passe)

- Carte byline avec portrait (FORME, via le skill impeccable, si Charles le veut).
- Champ credential sur person.
- Slug person, pages auteur ou équipe, routes dédiées.
- Les 2 articles neufs (« Souris à l'automne » par Samuel, « Guêpes et frelons » par Martin) et le
  reciblage du maillage fourmis et souris vers les pages de service précises: c'est l'étape blog
  suivante, qui consomme la banque.
- One-pager et pages légales.
