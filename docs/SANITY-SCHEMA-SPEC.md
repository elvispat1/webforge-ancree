# Spécification des schémas Sanity (démo WebForge Minimaliste)

Ce document est LA référence d'implémentation et de documentation durable du CMS du
démo Atelier Cormier. Il décrit chaque type Sanity au champ près: l'implémenteur ne
prend aucune décision, il transcrit. Toute divergence d'implémentation doit être
amendée ici d'abord.

- **Organisation**: Patoine Studio (id `o7R0d3u6V`), régime « interne PS » du contrat
  ([CONVENTIONS-CONTRACT.md §17](./CONVENTIONS-CONTRACT.md)). Le nom fictif Atelier
  Cormier vit dans le contenu, jamais dans l'arborescence Sanity.
- **Project**: « WebForge - Minimaliste », id `fesilwqf`. **Dataset**: `production`.
- **Studio**: `studio/` (à la racine du repo), workspace yarn (`workspaces: ["studio"]`),
  aucun lockfile séparé, ignoré par Nuxt (`ignore: ['studio/**']`).
- **Référence technique**: la plomberie calque `nuxt-sanity-test`
  (`/Users/charlespatoine/dev/projects/nuxt-sanity-test/studio/`), adaptée aux choix
  ci-dessous.
- **Portée**: Temps 1 = schémas + Studio + seed. Temps 2 = branchement front
  (composables GROQ, route-map, resolvers Presentation). Les notes Temps 2 sont en §12.

---

## 1. Conventions transverses (s'appliquent à TOUS les types)

1. **i18n par document** via `@sanity/document-internationalization` (fr, en). TOUS les
   documents sont localisés. Chaque document porte le champ:
   ```ts
   defineField({ name: 'language', type: 'string', readOnly: true, hidden: true })
   ```
   (rattaché au premier group du document quand il y a des groups).
2. **Slugs et références**: TOUS portent `options.documentInternationalization:
   { exclude: true }` (pas copiés à la création d'une traduction).
3. **Références vers des documents localisés**: TOUTES portent
   ```ts
   options.filter: ({ document }) => ({
     filter: 'language == $language',
     params: { language: (document as { language?: string })?.language ?? 'fr' },
   })
   ```
4. **Rigueur de syntaxe**: `defineType` à la racine, `defineField` pour chaque champ,
   `defineArrayMember` pour chaque membre d'array. Aucune exception.
5. **Icônes**: chaque document et chaque bloc importe une icône de `@sanity/icons`
   (listées type par type ci-dessous).
6. **Preview**: chaque document et chaque bloc définit `preview` avec `select` +
   `prepare` et des fallbacks (« (sans titre) », etc.). Aucun preview par défaut.
7. **Validation**: `required()` là où le front l'exige (interfaces de
   `app/content/*.ts`, champ non optionnel = required), `.max(n).warning()` sur les
   extraits et résumés, `.unique()` sur tous les arrays de références.
8. **Langue du Studio**: titres et descriptions en français québécois soutenu. AUCUN
   tiret cadratin ni middle dot, dans les titres, les descriptions, les options.list
   et les previews. Écrire « Bloc: texte et image ». Séparateurs autorisés:
   deux-points, virgule, parenthèses.
9. **Fichiers**: kebab-case, un seul const exporté par fichier, nommé comme le fichier
   en camelCase (`site-settings.ts` exporte `siteSettings`). Arborescence en §9.
10. **Nommage des types**: camelCase, JAMAIS de tiret dans un nom de type Sanity. Le
    pont avec les `_type` Vue (kebab-case) se fait par la table de mapping (§2).
11. **Images**: l'objet partagé `figure` (§3.1) PARTOUT où le contenu a la shape
    `{ ratio, src?, alt, label, caption }`. L'alt vit par usage sur `figure`, PAS sur
    l'asset: divergence assumée avec la référence `nuxt-sanity-test`.
12. **Liens**: tous les CTA et liens de navigation passent par l'objet `link` (§3.2).
13. **Ordre des collections**: les numérotations affichées (`service.n` « S/01 »,
    `diffs[].n` « 01 », `process.steps[].n ») NE SONT PAS stockées: dérivées de l'index
    au front. Pour que l'index soit déterministe, les collections ordonnées portent un
    champ `order` (number) trié par GROQ `| order(order asc)`.

---

## 2. Tables de mapping

### 2.1 Blocs réguliers: `_type` Sanity ↔ `_type` Vue (union `PageBlock`, 15 blocs)

| `_type` Sanity (camelCase) | `_type` Vue (`app/types/blocks.ts`) | Interface de contenu |
|---|---|---|
| `about` | `'about'` | `AboutContent` |
| `services` | `'services'` | `ServicesContent` |
| `testimonials` | `'testimonials'` | `TestimonialsContent` |
| `faq` | `'faq'` | `FaqContent` |
| `contact` | `'contact'` | `ContactContent` |
| `mediaText` | `'media-text'` | `MediaTextContent` |
| `ctaBand` | `'cta-band'` | `CtaBandContent` |
| `process` | `'process'` | `ProcessContent` |
| `stats` | `'stats'` | `StatsContent` |
| `highlights` | `'highlights'` | `HighlightsContent` |
| `logos` | `'logos'` | `LogosContent` |
| `projectsPreview` | `'projects-preview'` | `ProjectsPreviewContent` |
| `blogPreview` | `'blog-preview'` | `BlogPreviewContent` |
| `iframe` | `'iframe'` | `IframeContent` |
| `videoYoutube` | `'video-youtube'` | `VideoYoutubeContent` |

### 2.2 Blocs d'article: `_type` Sanity ↔ `_type` Vue (union `ArticleBlock`, 7 blocs)

| `_type` Sanity | `_type` Vue | Interface de contenu |
|---|---|---|
| `articleLead` | `'lead'` | `ArticleLeadContent` |
| `articleRichText` | `'rich-text'` | `ArticleRichTextContent` |
| `articleImage` | `'image'` | `ArticleImageContent` |
| `articleQuote` | `'quote'` | `ArticleQuoteContent` |
| `articleGallery` | `'gallery'` | `ArticleGalleryContent` |
| `articleCallout` | `'callout'` | `ArticleCalloutContent` |
| `articleInlineCta` | `'inline-cta'` | `ArticleInlineCtaContent` |

La traduction `_type` Sanity → `_type` Vue se fait dans la couche composable au
Temps 2 (transformation au fetch, les block-maps Vue ne bougent pas).

### 2.3 Documents ↔ sources de contenu V1

| Document Sanity | Cardinalité | Source V1 (`app/content/`) |
|---|---|---|
| `siteSettings` | singleton | `site.ts` (`SiteContent`) |
| `homePage` | singleton | `home.ts` + `hero.ts` (`HERO_CONTENT` + CTA de `HOME_PAGE_CONTENT.hero`) |
| `servicesPage` | singleton | `services-page.ts` + `page-heroes.ts` (`services`) |
| `projectsPage` | singleton | `projects-page.ts` + `page-heroes.ts` (`projects`) |
| `aboutPage` | singleton | `about-page.ts` + `page-heroes.ts` (`about`) |
| `blogPage` | singleton | `blog-page.ts` + `page-heroes.ts` (`blog`) |
| `faqPage` | singleton | `faq.ts` (`FaqPageContent`) + `page-heroes.ts` (`faq`) |
| `contactPage` | singleton | `contact.ts` (via bloc `contact`) + `page-heroes.ts` (`contact`) |
| `onePager` | singleton | `hero.ts` (`HERO_CONTENT`) + composition `useOnePagerBlocks` |
| `service` | collection | `services.ts` (`Service`) |
| `project` | collection | `projects.ts` (`Project`) |
| `article` | collection | `articles.ts` (`Article`) |
| `category` | collection | `categories.ts` (`Category`) |
| `testimonial` | banque | `testimonials.ts` (`Testimonial`) |
| `faqItem` | banque | `faq.ts` (`FaqItem`) |
| `faqTheme` | banque | `faq.ts` (valeurs distinctes de `FaqItem.theme`) |
| `legalPage` | 2 instances par langue | `legal.ts` (`LegalDoc`, conditions + confidentialite) |

---

## 3. Objets partagés

### 3.1 `figure` (objets partagés, `objects/figure.ts`)

Titre Studio: « Image ». Icône: `ImageIcon`. Type: `object`.

Réutilisé partout où le contenu V1 a la shape `{ ratio, src?, alt, label, caption }`.
`image` est optionnel: absent, le front rend le placeholder soigné du fragment
`<Image>` (jamais une 404), exactement comme `src?` absent en V1.

| Champ | Type | Titre | Détails |
|---|---|---|---|
| `image` | `image` | Fichier image | `options: { hotspot: true }`. Optionnel. Description: « Optionnelle: sans image, le site affiche un placeholder soigné. » |
| `alt` | `string` | Texte alternatif | Description: « Décrit l'image pour les lecteurs d'écran. Défini ici, par usage. » Validation: `R.custom((alt, ctx) => { const p = ctx.parent as { image?: { asset?: unknown } }; if (p?.image?.asset && !alt) return 'Texte alternatif recommandé quand une image est présente'; return true }).warning()` |
| `label` | `string` | Étiquette | `R.required()` (shape V1 non optionnelle, §1.7). Description: « Courte mention affichée sur ou sous l'image (ex. Atelier, plan de travail en frêne). » |
| `caption` | `string` | Légende | `R.required()` (shape V1 non optionnelle, §1.7). Description: « Légende descriptive (ex. Photo atelier, 4:5). » |
| `ratio` | `string` | Ratio d'affichage | Optionnel. `options: { list: [{ title: '4:5 (portrait)', value: '4/5' }, { title: '3:4 (portrait)', value: '3/4' }, { title: '4:3 (paysage)', value: '4/3' }, { title: '3:2 (paysage)', value: '3/2' }, { title: '16:9 (large)', value: '16/9' }, { title: '2:1 (panoramique)', value: '2/1' }], layout: 'dropdown' }`. Description: « Vide: le site applique le ratio par défaut de l'emplacement. » La table des ratios par défaut par usage vit en §12.6 (le seed stocke toujours le ratio V1 explicite). |

Preview: `select: { label: 'label', caption: 'caption', ratio: 'ratio', media: 'image' }`;
`prepare`: `title: label || caption || '(image sans étiquette)'`,
`subtitle: ratio ? 'Ratio ' + ratio : 'Ratio par défaut du bloc'`, `media`.

### 3.2 `link` (`objects/link.ts`)

Titre Studio: « Lien ». Icône: `LinkIcon`. Type: `object`.

Calqué sur la référence `nuxt-sanity-test/studio/schemas/objects/link.ts`, SANS le
type `file` (aucun téléchargement dans le démo, pas de champ orphelin). Le
comportement « nouvel onglet » est dérivé du type au front (internal/anchor = même
onglet, external = nouvel onglet): pas de champ `openInNewTab`.

| Champ | Type | Titre | Détails |
|---|---|---|---|
| `label` | `string` | Libellé | `R.required()` |
| `type` | `string` | Type de lien | `options: { list: [{ title: 'Page interne (référence)', value: 'internal' }, { title: 'URL externe', value: 'external' }, { title: 'Ancre (#section)', value: 'anchor' }], layout: 'radio' }`, `initialValue: 'internal'`, `R.required()` |
| `internalRef` | `reference` | Page interne | `to:` les 13 types routables: `homePage`, `servicesPage`, `projectsPage`, `aboutPage`, `blogPage`, `faqPage`, `contactPage`, `onePager`, `service`, `project`, `article`, `category`, `legalPage`. `hidden: ({ parent }) => parent?.type !== 'internal' && parent?.type !== 'anchor'`. Options: filtre langue (§1.3) + `documentInternationalization: { exclude: true }`. Validation custom: requis si `type === 'internal'`; OPTIONNEL si `anchor` (vide = ancre sur la page courante). Description: « Pour le type Ancre, laisser vide signifie page courante. » |
| `externalUrl` | `url` | URL externe | `hidden: ({ parent }) => parent?.type !== 'external'`. Validation: `R.uri({ scheme: ['http', 'https', 'mailto', 'tel'] }).custom(requis si type external)` |
| `anchor` | `string` | Ancre | Description: « Sans le #, ex: contact ». `hidden: ({ parent }) => parent?.type !== 'anchor'`. Validation custom: requis si `type === 'anchor'`; refuse `#` et les espaces (`/^[a-z0-9][a-z0-9-]*$/`) |

Preview: `select: { title: 'label', subtitle: 'type', external: 'externalUrl', anchor: 'anchor' }`;
`prepare`: `title: label || '(sans libellé)'`; subtitle: external → `'Vers ' + externalUrl`,
anchor → `'Vers #' + anchor`, sinon `'Vers page interne'`.

### 3.3 `seo` (`objects/seo.ts`)

Titre Studio: « SEO de la page ». Icône: `SearchIcon`. Type: `object`,
`options: { collapsible: true, collapsed: true }`.

Présent UNIQUEMENT sur les pages fixes et `onePager`. Les collections (service,
projet, article, catégorie) dérivent leur SEO de leurs champs (titre, extrait,
couverture) via `usePageSeo`: pas d'objet seo dessus, zéro orphelin.

| Champ | Type | Titre | Détails |
|---|---|---|---|
| `title` | `string` | Titre SEO | Optionnel. Description: « Remplace le titre du héros dans la balise title. Le suffixe de marque est ajouté automatiquement, sauf sur l'accueil et le one-pager. » Le suffixe vient de `siteSettings.seo.titleSuffix` (§6.1). Sémantique spéciale `homePage` et `onePager`: le code y neutralise le gabarit de marque (`titleTemplate: null`), le champ porte donc le titre COMPLET (voir seed §6.2 et §6.9). |
| `description` | `text` (rows 2) | Description SEO | Optionnel. `R.max(160).warning('Plus de 160 caractères: risque de troncature dans Google')`. Replis si vide: texte d'amorce du héros (`hero.lead`), sinon `siteSettings.seo.defaultDescription` (§12.10). |
| `ogImage` | `image` | Image de partage | `options: { hotspot: true }`. Optionnel (replis: `siteSettings.seo.defaultOgImage`, puis le repli code `/og/og-default.jpg`, §12.10). Description: « Affichée au partage sur les réseaux. Format 1200 x 630. » |

Pas de preview (objet de feuille, jamais listé).

### 3.4 `heroHome` (`objects/hero-home.ts`)

Titre Studio: « Héros d'accueil ». Icône: `SparklesIcon`. Type: `object`,
`options: { collapsible: true, collapsed: true }`.

Champ héros dédié de `homePage` ET `onePager`, HORS pageBuilder. Fieldsets (pas de
groups: c'est un objet):

```ts
fieldsets: [
  { name: 'content', title: 'Contenu textuel', options: { collapsible: false } },
  { name: 'actions', title: 'Boutons d\'action', options: { collapsible: true, collapsed: true } },
  { name: 'metrics', title: 'Repères chiffrés', options: { collapsible: true, collapsed: true } },
  { name: 'visual', title: 'Visuels', options: { collapsible: true, collapsed: true } },
]
```

| Champ | Type | Titre | Fieldset | Détails |
|---|---|---|---|---|
| `kicker` | `string` | Surtitre | content | Optionnel |
| `title` | `string` | Titre | content | `R.required()` |
| `lead` | `text` (rows 3) | Texte d'amorce | content | `R.required()` |
| `primaryCta` | `link` | Bouton principal | actions | `R.required()` |
| `secondaryCta` | `link` | Bouton secondaire | actions | `R.required()` |
| `meta` | `array` of objet inline `heroMetaItem` | Repères | metrics | Membres: `{ label: string (Libellé, R.required()), value: string (Valeur, R.required()) }`, preview membre `title: value, subtitle: label`. Validation: `(R) => [R.required().min(1), R.max(3).warning('Trois repères maximum pour la mise en page du héros')]` |
| `visual` | `figure` | Visuel (bureau, portrait) | visual | `R.required()`. Description: « Cadrage portrait 4:5 affiché en écran large. » |
| `visualMobile` | `figure` | Visuel (mobile, paysage) | visual | `R.required()`. Description: « Cadrage paysage 4:3 affiché en mobile (art direction D23). Peut pointer la même image avec un autre ratio. » |

Preview: `select: { title: 'title', kicker: 'kicker' }`;
`prepare`: `title: title || '(héros sans titre)'`, `subtitle: kicker ? 'Héros d\'accueil, ' + kicker : 'Héros d\'accueil'`.

### 3.5 `pageHero` (`objects/page-hero.ts`)

Titre Studio: « Héros de page ». Icône: `StarIcon`. Type: `object`,
`options: { collapsible: true, collapsed: false }`.

Champ héros dédié des pages fixes de niveau 2 (`servicesPage`, `projectsPage`,
`aboutPage`, `blogPage`, `faqPage`, `contactPage`). Le fil d'Ariane n'est PAS stocké
(dérivé du route-map au rendu). Les héros detail et article DÉRIVENT des documents de
collection: aucun schéma héros pour eux.

```ts
fieldsets: [
  { name: 'content', title: 'Contenu textuel', options: { collapsible: false } },
  { name: 'visual', title: 'Visuel', options: { collapsible: true, collapsed: true } },
]
```

| Champ | Type | Titre | Fieldset | Détails |
|---|---|---|---|---|
| `title` | `string` | Titre | content | `R.required()` |
| `lead` | `text` (rows 3) | Texte d'amorce | content | Optionnel |
| `cta` | `link` | Bouton (optionnel) | content | Optionnel |
| `image` | `figure` | Image phare | visual | Optionnel. Description: « Absente: héros texte seul, colonne large. Ratio recommandé 2:1. » |

Preview: `select: { title: 'title' }`; `prepare`: `title: title || '(héros sans titre)'`,
`subtitle: 'Héros de page'`.

### 3.6 Objets légaux

#### `legalParagraph` (`objects/legal-paragraph.ts`)
Titre: « Paragraphe ». Icône: `BlockContentIcon`. Type: `object`.

| Champ | Type | Titre | Détails |
|---|---|---|---|
| `text` | `text` (rows 4) | Texte | `R.required()` |

Preview: `select: { text: 'text' }`; `prepare`: `title: text ? text.slice(0, 80) : '(paragraphe vide)'`, `subtitle: 'Paragraphe'`.

#### `legalList` (`objects/legal-list.ts`)
Titre: « Liste à puces ». Icône: `UlistIcon`. Type: `object`.

| Champ | Type | Titre | Détails |
|---|---|---|---|
| `items` | `array` of `string` | Éléments | `R.required().min(1)` |

Preview: `select: { items: 'items' }`; `prepare`: `title: items?.[0] || '(liste vide)'`,
`subtitle: 'Liste, ' + (items?.length ?? 0) + ' éléments'`.

#### `legalTodo` (`objects/legal-todo.ts`)
Titre: « Zone à compléter (client) ». Icône: `WarningOutlineIcon`. Type: `object`.

| Champ | Type | Titre | Détails |
|---|---|---|---|
| `text` | `text` (rows 3) | Consigne | `R.required()`. Description: « Contenu à fournir par le client. Rendu dans un encadré distinctif sur le site. » |

Preview: `select: { text: 'text' }`; `prepare`: `title: text ? text.slice(0, 80) : '(consigne vide)'`, `subtitle: 'À compléter par le client'`.

#### `legalSection` (`objects/legal-section.ts`)
Titre: « Section ». Icône: `ListIcon`. Type: `object`.

| Champ | Type | Titre | Détails |
|---|---|---|---|
| `title` | `string` | Titre de section | `R.required()` |
| `body` | `array` | Contenu | `of: [defineArrayMember({ type: 'legalParagraph' }), defineArrayMember({ type: 'legalList' }), defineArrayMember({ type: 'legalTodo' })]`, `R.required().min(1)` |

Preview: `select: { title: 'title', body: 'body' }`; `prepare`:
`title: title || '(section sans titre)'`, `subtitle: (body?.length ?? 0) + ' éléments'`.

### 3.7 `articlePortableText` (`objects/article-blocks/article-portable-text.ts`)

PAS un type enregistré: un const de configuration Portable Text réutilisé dans les
`of: [...]` (pattern `simpleBlock` de la référence, étendu aux titres et listes).
Absent de `index.ts`.

```ts
export const articlePortableText = {
  type: 'block' as const,
  styles: [
    { title: 'Paragraphe', value: 'normal' },
    { title: 'Titre de section', value: 'h2' },
    { title: 'Sous-titre', value: 'h3' },
  ],
  lists: [
    { title: 'Liste à puces', value: 'bullet' },
    { title: 'Liste numérotée', value: 'number' },
  ],
  marks: {
    decorators: [
      { title: 'Gras', value: 'strong' },
      { title: 'Italique', value: 'em' },
    ],
    annotations: [
      {
        name: 'link',
        type: 'object' as const,
        title: 'Lien',
        fields: [
          defineField({
            name: 'href',
            title: 'URL',
            type: 'url',
            validation: (R) =>
              R.required().uri({ scheme: ['http', 'https', 'mailto', 'tel'] }),
          }),
        ],
      },
    ],
  },
}
```

La transformation Portable Text → `RichTextEntry[]` (interface front actuelle) se fait
dans la couche composable au Temps 2 (§12.1).

---

## 4. Blocs réguliers (`objects/blocks/`, 15 fichiers)

Tous: type `object`, inline dans les arrays `pageBuilder` (jamais des documents
référencés). `_key` auto-généré par Sanity, jamais défini dans le schéma. Les blocs
« intelligents » (`services`, `testimonials`, `projectsPreview`, `blogPreview`)
stockent copie + paramètres de sélection; le bloc `faq` est en sélection manuelle
pure (copie + refs, §4.4): la résolution des items vit en GROQ côté app (Temps 2).
L'exclusion contextuelle (ex. exclure le projet courant des similaires) n'est PAS
stockée: paramètre d'assemblage code.

### 4.1 `about` (`about.ts`)
Titre: « Bloc: à propos ». Icône: `UserIcon`.

| Champ | Type | Titre | Détails |
|---|---|---|---|
| `eyebrow` | `string` | Surtitre | `R.required()` |
| `heading` | `string` | Titre | `R.required()` |
| `body` | `array` of `text` (rows 4) | Paragraphes | `R.required().min(1)` |
| `photo` | `figure` | Photo | `R.required()` |
| `figcaption` | `string` | Légende sous la photo | `R.required()` |
| `diffs` | `array` of objet inline `aboutDiff` | Différenciateurs | Membres: `{ title: string (Titre, R.required()), body: text rows 3 (Texte, R.required()) }`, preview membre `title`. Validation: `R.required().min(1)`. Description: « Le numéro 01, 02 est dérivé de la position au rendu. » |

Preview: `select: { heading: 'heading', media: 'photo.image' }`;
`prepare`: `title: heading || '(sans titre)'`, `subtitle: 'Bloc: à propos'`, `media`.

### 4.2 `services` (`services.ts`)
Titre: « Bloc: services ». Icône: `WrenchIcon`. Bloc intelligent.

| Champ | Type | Titre | Détails |
|---|---|---|---|
| `eyebrow` | `string` | Surtitre | `R.required()` |
| `heading` | `string` | Titre | `R.required()` |
| `lead` | `text` (rows 3) | Texte d'amorce | `R.required()` |
| `cta` | `link` | Lien de section | `R.required()` |
| `mode` | `string` | Mode de sélection | `options: { list: [{ title: 'Toute la banque (ordre de la collection)', value: 'auto' }, { title: 'Sélection manuelle', value: 'manual' }], layout: 'radio' }`, `initialValue: 'auto'`, `R.required()` |
| `items` | `array` of `reference` to `service` | Services choisis | `hidden: ({ parent }) => parent?.mode !== 'manual'`. Refs: filtre langue + i18n exclude. Validation: `R.unique().custom(requis non vide si mode manual)` |
| `limit` | `number` | Limite | `hidden: ({ parent }) => parent?.mode === 'manual'`. Optionnel. `R.integer().positive()`. Description: « Vide: tous les services. » |
| `withDetailLinks` | `boolean` | Lier les cartes aux pages de détail | `initialValue: true`. Description: « Désactiver sur le one-pager (pas de pages de détail). » |

Preview: `select: { heading: 'heading', mode: 'mode', limit: 'limit' }`; `prepare`:
`title: heading || '(sans titre)'`, `subtitle: 'Bloc: services (' + (mode === 'manual' ? 'manuel' : limit ? 'auto, ' + limit : 'auto') + ')'`.

### 4.3 `testimonials` (`testimonials.ts`)
Titre: « Bloc: témoignages ». Icône: `CommentIcon`. Bloc intelligent.

| Champ | Type | Titre | Détails |
|---|---|---|---|
| `eyebrow` | `string` | Surtitre | `R.required()` |
| `heading` | `string` | Titre | `R.required()` |
| `mode` | `string` | Mode de sélection | `options: { list: [{ title: 'Vedettes', value: 'featured' }, { title: 'Par service', value: 'service' }, { title: 'Par projet', value: 'project' }, { title: 'Sélection manuelle', value: 'manual' }], layout: 'radio' }`, `initialValue: 'featured'`, `R.required()` |
| `service` | `reference` to `service` | Service | `hidden: ({ parent }) => parent?.mode !== 'service'`. Filtre langue + i18n exclude. Validation custom: requis si mode service |
| `project` | `reference` to `project` | Projet | `hidden: ({ parent }) => parent?.mode !== 'project'`. Filtre langue + i18n exclude. Validation custom: requis si mode project |
| `items` | `array` of `reference` to `testimonial` | Témoignages choisis | `hidden: ({ parent }) => parent?.mode !== 'manual'`. Filtre langue + i18n exclude. `R.unique().custom(requis non vide si manual)` |
| `limit` | `number` | Limite | Optionnel. `R.integer().positive()` |

Le paramètre `pad` (compléter avec des vedettes jusqu'à la limite) reste un paramètre
d'assemblage code des pages de détail, non stocké.

Preview: `select: { heading: 'heading', mode: 'mode' }`; `prepare`:
`title: heading || '(sans titre)'`, `subtitle: 'Bloc: témoignages (' + mode + ')'`.

### 4.4 `faq` (`faq.ts`)
Titre: « Bloc: FAQ ». Icône: `HelpCircleIcon`. Sélection manuelle PURE: PAS de champ
`mode` ni `limit` (la page FAQ a ses propres sections par thème, §6.7). INCHANGÉ par
le passage de la page FAQ aux sections.

| Champ | Type | Titre | Détails |
|---|---|---|---|
| `eyebrow` | `string` | Surtitre | `R.required()` |
| `heading` | `string` | Titre | `R.required()` |
| `items` | `array` of `reference` to `faqItem` | Questions choisies | Filtre langue + i18n exclude. `R.required().min(1).unique()` |

Le flag `faqSchema` (émission du JSON-LD FAQPage) reste un flag d'assemblage côté code
(le one-pager le pose, le multipage le porte sur la page /faq via `usePageSeo`): PAS un
champ.

Preview: `select: { heading: 'heading', items: 'items' }`; `prepare`:
`title: heading || '(sans titre)'`, `subtitle: 'Bloc: FAQ, ' + (items?.length ?? 0) + ' questions'`.

### 4.5 `contact` (`contact.ts`)
Titre: « Bloc: contact ». Icône: `EnvelopeIcon`.

Les coordonnées affichées (téléphone, courriel, atelier, heures) NE SONT PAS stockées
ici: join sur `siteSettings.contact` à la résolution (Temps 2, §12.4). Seuls les
libellés des coordonnées et la copie du formulaire vivent dans le bloc. Les flags
`required` des champs du formulaire (nom et courriel obligatoires) restent en code.

| Champ | Type | Titre | Détails |
|---|---|---|---|
| `eyebrow` | `string` | Surtitre | `R.required()` |
| `heading` | `string` | Titre | `R.required()` |
| `lead` | `text` (rows 3) | Texte d'amorce | `R.required()` |
| `metaLabels` | `object` | Libellés des coordonnées | `options: { collapsible: true, collapsed: true }`. Description: « Les valeurs (numéro, courriel, adresse, heures) viennent des Globales. » Sous-champs, tous `string` `R.required()`: `phone` (Libellé téléphone), `email` (Libellé courriel), `address` (Libellé atelier), `hours` (Libellé heures) |
| `form` | `object` | Formulaire | `options: { collapsible: true, collapsed: true }`. Sous-champs ci-dessous |
| `success` | `object` | Message de succès | Sous-champs: `title` string `R.required()`, `body` text rows 2 `R.required()` |

Sous-champs de `form` (tous `defineField` imbriqués):

| Champ | Type | Titre | Détails |
|---|---|---|---|
| `labels` | `object` | Libellés des champs | `name`, `email`, `phone`, `message`: 4 strings `R.required()` |
| `errors` | `object` | Messages d'erreur | `nameRequired`, `emailInvalid`, `privacyRequired`: 3 strings `R.required()` |
| `submit` | `object` | Bouton d'envoi | `idle` (Libellé au repos), `loading` (Libellé pendant l'envoi): strings `R.required()` |
| `errorBanner` | `object` | Bandeau d'échec | `title` string `R.required()`; `body` text rows 2 `R.required()`, description: « Le jeton {email} est remplacé par le courriel des Globales. » |
| `privacy` | `object` | Consentement | `text` string `R.required()` (texte avant le lien); `link` type `link` `R.required()` (lien interne vers la politique de confidentialité) |

Preview: `select: { heading: 'heading' }`; `prepare`: `title: heading || '(sans titre)'`,
`subtitle: 'Bloc: contact'`.

### 4.6 `mediaText` (`media-text.ts`)
Titre: « Bloc: texte et image ». Icône: `SplitHorizontalIcon`.

| Champ | Type | Titre | Détails |
|---|---|---|---|
| `eyebrow` | `string` | Surtitre | Optionnel |
| `heading` | `string` | Titre | `R.required()` |
| `body` | `array` of `text` (rows 4) | Paragraphes | `R.required().min(1)` |
| `mediaSide` | `string` | Côté du média | `options: { list: [{ title: 'À gauche', value: 'left' }, { title: 'À droite', value: 'right' }], layout: 'radio' }`, `initialValue: 'right'`, `R.required()` |
| `image` | `figure` | Image | `R.required()` |
| `cta` | `link` | Bouton (optionnel) | Optionnel |

Preview: `select: { heading: 'heading', eyebrow: 'eyebrow', media: 'image.image' }`;
`prepare`: `title: heading || '(sans titre)'`,
`subtitle: eyebrow ? 'Bloc: texte et image, ' + eyebrow : 'Bloc: texte et image'`, `media`.

### 4.7 `ctaBand` (`cta-band.ts`)
Titre: « Bloc: bandeau CTA ». Icône: `LaunchIcon`.

| Champ | Type | Titre | Détails |
|---|---|---|---|
| `title` | `string` | Titre | `R.required()` |
| `subtitle` | `text` (rows 2) | Sous-titre | Optionnel |
| `primaryCta` | `link` | Bouton principal | `R.required()` |
| `secondaryCta` | `link` | Bouton secondaire | Optionnel |

Preview: `select: { title: 'title' }`; `prepare`: `title: title || '(sans titre)'`,
`subtitle: 'Bloc: bandeau CTA'`.

### 4.8 `process` (`process.ts`)
Titre: « Bloc: processus ». Icône: `OlistIcon`. Le const exporté s'appelle `process`
(aucune référence à `process.env` dans le fichier, le shadowing est sans effet).

| Champ | Type | Titre | Détails |
|---|---|---|---|
| `eyebrow` | `string` | Surtitre | Optionnel |
| `heading` | `string` | Titre | Optionnel |
| `lead` | `text` (rows 3) | Texte d'amorce | Optionnel |
| `cta` | `link` | Bouton (optionnel) | Optionnel |
| `steps` | `array` of objet inline `processStep` | Étapes | Membres: `{ title: string (Titre, R.required()), body: text rows 3 (Texte, R.required()) }`, preview membre `title`. Validation: `R.required().min(1)`. Description: « Le numéro d'étape est dérivé de la position au rendu. » |

Preview: `select: { heading: 'heading', steps: 'steps' }`; `prepare`:
`title: heading || 'Processus'`, `subtitle: 'Bloc: processus, ' + (steps?.length ?? 0) + ' étapes'`.

### 4.9 `stats` (`stats.ts`)
Titre: « Bloc: chiffres clés ». Icône: `BarChartIcon`.

| Champ | Type | Titre | Détails |
|---|---|---|---|
| `eyebrow` | `string` | Surtitre | Optionnel |
| `heading` | `string` | Titre | Optionnel |
| `items` | `array` of objet inline `statItem` | Chiffres | Membres: `{ value: string (Valeur, ex. 140+, R.required()), label: string (Libellé, R.required()) }`, preview membre `title: value, subtitle: label`. Validation: `R.required().min(1)` |

Preview: `select: { heading: 'heading', items: 'items' }`; `prepare`:
`title: heading || 'Chiffres clés'`, `subtitle: 'Bloc: chiffres clés, ' + (items?.length ?? 0) + ' items'`.

### 4.10 `highlights` (`highlights.ts`)
Titre: « Bloc: points forts ». Icône: `SparklesIcon`.

| Champ | Type | Titre | Détails |
|---|---|---|---|
| `eyebrow` | `string` | Surtitre | Optionnel |
| `heading` | `string` | Titre | Optionnel |
| `lead` | `text` (rows 3) | Texte d'amorce | Optionnel |
| `items` | `array` of objet inline `highlightItem` | Points forts | Membres: `{ icon: string (Icône, optionnel, description: « Nom Iconify lucide, ex. lucide:ruler »), title: string (Titre, R.required()), body: text rows 3 (Texte, R.required()) }`, preview membre `title`. Validation: `R.required().min(1)` |

Preview: `select: { heading: 'heading', items: 'items' }`; `prepare`:
`title: heading || 'Points forts'`, `subtitle: 'Bloc: points forts, ' + (items?.length ?? 0) + ' items'`.

### 4.11 `logos` (`logos.ts`)
Titre: « Bloc: mentions ». Icône: `ThLargeIcon`.

| Champ | Type | Titre | Détails |
|---|---|---|---|
| `eyebrow` | `string` | Surtitre | Optionnel |
| `heading` | `string` | Titre | Optionnel |
| `items` | `array` of objet inline `logoItem` | Mentions | Membres: `{ label: string (Libellé, R.required()) }`, preview membre `title: label`. Validation: `R.required().min(1)` |

Le champ image de logo par item (TODO documenté en V1) n'est PAS ajouté: aucun
consommateur front. À ajouter le jour où le composant le rend.

Preview: `select: { heading: 'heading', items: 'items' }`; `prepare`:
`title: heading || 'Mentions'`, `subtitle: 'Bloc: mentions, ' + (items?.length ?? 0) + ' items'`.

### 4.12 `projectsPreview` (`projects-preview.ts`)
Titre: « Bloc: aperçu de projets ». Icône: `ImagesIcon`. Bloc intelligent.

| Champ | Type | Titre | Détails |
|---|---|---|---|
| `eyebrow` | `string` | Surtitre | Optionnel |
| `heading` | `string` | Titre | `R.required()` |
| `lead` | `text` (rows 3) | Texte d'amorce | Optionnel |
| `cta` | `link` | Lien de section | Optionnel |
| `mode` | `string` | Mode de sélection | `options: { list: [{ title: 'Projets vedettes', value: 'featured' }, { title: 'Par service', value: 'service' }, { title: 'Sélection manuelle', value: 'manual' }], layout: 'radio' }`, `initialValue: 'featured'`, `R.required()` |
| `service` | `reference` to `service` | Service | `hidden: ({ parent }) => parent?.mode !== 'service'`. Filtre langue + i18n exclude. Validation custom: requis si mode service |
| `items` | `array` of `reference` to `project` | Projets choisis | `hidden: ({ parent }) => parent?.mode !== 'manual'`. Filtre langue + i18n exclude. `R.unique().custom(requis non vide si manual)` |
| `limit` | `number` | Limite | `initialValue: 3`. `R.integer().positive()` |

L'exclusion du projet courant (pages de détail) n'est pas stockée: paramètre code.

Preview: `select: { heading: 'heading', mode: 'mode', limit: 'limit' }`; `prepare`:
`title: heading || '(sans titre)'`, `subtitle: 'Bloc: aperçu de projets (' + mode + (limit ? ', ' + limit : '') + ')'`.

### 4.13 `blogPreview` (`blog-preview.ts`)
Titre: « Bloc: aperçu du blogue ». Icône: `BookIcon`. Bloc intelligent (toujours les
derniers billets par date décroissante, pas de mode).

| Champ | Type | Titre | Détails |
|---|---|---|---|
| `eyebrow` | `string` | Surtitre | Optionnel |
| `heading` | `string` | Titre | `R.required()` |
| `lead` | `text` (rows 3) | Texte d'amorce | Optionnel |
| `cta` | `link` | Lien de section | Optionnel |
| `limit` | `number` | Nombre de billets | `initialValue: 3`. `R.required().integer().positive()` |

Preview: `select: { heading: 'heading', limit: 'limit' }`; `prepare`:
`title: heading || '(sans titre)'`, `subtitle: 'Bloc: aperçu du blogue, ' + (limit ?? 3) + ' billets'`.

### 4.14 `iframe` (`iframe.ts`)
Titre: « Bloc: intégration (iframe) ». Icône: `EarthGlobeIcon`. Intègre une page ou un
service tiers (carte, formulaire, calendrier) dans un cadre au ratio choisi. LIVE en prod
depuis le 17 juin 2026.

| Champ | Type | Titre | Détails |
|---|---|---|---|
| `url` | `url` | URL à intégrer | `R.required().uri({ scheme: ['http', 'https'] })` |
| `title` | `string` | Titre accessible | `R.required()`. Décrit le contenu pour les lecteurs d'écran, non affiché |
| `ratio` | `string` | Ratio du cadre | Liste 16/9, 4/3, 1/1, 3/4, 2/1. `initialValue: '16/9'` |
| `caption` | `string` | Légende | Optionnelle, affichée sous le cadre |

Preview: `select: { title: 'title', url: 'url' }`; `prepare`: `title: title || '(sans titre)'`,
`subtitle: url ? 'Iframe, ' + url : 'Bloc: intégration (iframe)'`.

### 4.15 `videoYoutube` (`video-youtube.ts`)
Titre: « Bloc: vidéo YouTube ». Icône: `PlayIcon`. Vidéo en façade (affiche + bouton de
lecture, iframe nocookie au clic). L'identifiant 11 caractères est extrait de l'URL au
transform (`youtubeId`). LIVE en prod depuis le 17 juin 2026.

| Champ | Type | Titre | Détails |
|---|---|---|---|
| `source` | `string` | Vidéo YouTube (URL ou identifiant) | `R.required()`. URL watch / youtu.be / shorts / embed, ou identifiant brut |
| `posterMode` | `string` | Affiche avant lecture | Radio: `youtube` (vignette YouTube) / `custom` (image personnalisée). `initialValue: 'youtube'`, `R.required()` |
| `poster` | `figure` | Image personnalisée | Caché sauf `posterMode === 'custom'`; requis dans ce mode (validation custom) |
| `title` | `string` | Titre / légende | Optionnel: légende sous la vidéo + étiquette du bouton de lecture |

Preview: `select: { title: 'title', source: 'source', media: 'poster.image' }`; `prepare`:
`title: title || 'Vidéo YouTube'`, `subtitle: source ? 'YouTube, ' + source : 'Bloc: vidéo YouTube'`.

---

## 5. Blocs d'article (`objects/article-blocks/`, 7 fichiers)

Tous: type `object`, inline dans l'array `body` du document `article` (constraint:
deux builders distincts, pas de bloc régulier dans un article ni l'inverse).

### 5.1 `articleLead` (`article-lead.ts`)
Titre: « Article: amorce ». Icône: `TextIcon`.

| Champ | Type | Titre | Détails |
|---|---|---|---|
| `text` | `text` (rows 3) | Texte d'amorce | `R.required()` |

Preview: `select: { text: 'text' }`; `prepare`: `title: text ? text.slice(0, 80) : '(amorce vide)'`, `subtitle: 'Article: amorce'`.

### 5.2 `articleRichText` (`article-rich-text.ts`)
Titre: « Article: texte riche ». Icône: `BlockContentIcon`.

| Champ | Type | Titre | Détails |
|---|---|---|---|
| `body` | `array` | Contenu | `of: [articlePortableText]` (§3.7). `R.required().min(1)`. Description: « Paragraphes, titres de section, listes, gras, italique et liens. » |

Preview: `select: { body: 'body' }`; `prepare`: extraire le texte du premier block
(`body?.[0]?.children?.map((c) => c.text).join('')`), `title:` 60 premiers caractères
ou `'(texte vide)'`, `subtitle: 'Article: texte riche'`.

### 5.3 `articleImage` (`article-image.ts`)
Titre: « Article: image ». Icône: `ImageIcon`.

| Champ | Type | Titre | Détails |
|---|---|---|---|
| `image` | `figure` | Image | `R.required()` |

Preview: `select: { label: 'image.label', caption: 'image.caption', media: 'image.image' }`;
`prepare`: `title: label || caption || '(image sans étiquette)'`, `subtitle: 'Article: image'`, `media`.

### 5.4 `articleQuote` (`article-quote.ts`)
Titre: « Article: citation ». Icône: `BlockquoteIcon`.

| Champ | Type | Titre | Détails |
|---|---|---|---|
| `quote` | `text` (rows 3) | Citation | `(R) => [R.required(), R.max(500).warning('Plus de 500 caractères: citation très longue pour la mise en page')]` (le front n'impose pas de limite dure: warning, pas erreur) |
| `attribution` | `string` | Attribution | Optionnel |

Preview: `select: { quote: 'quote', attribution: 'attribution' }`; `prepare`:
`title: quote ? quote.slice(0, 80) : '(citation vide)'`,
`subtitle: attribution ? 'Citation de ' + attribution : 'Article: citation'`.

### 5.5 `articleGallery` (`article-gallery.ts`)
Titre: « Article: galerie ». Icône: `ImagesIcon`.

| Champ | Type | Titre | Détails |
|---|---|---|---|
| `images` | `array` of `figure` | Images | `R.required().min(2)`. Description: « Pour une seule image, utiliser le bloc Article: image. » |

Preview: `select: { images: 'images', media: 'images.0.image' }`; `prepare`:
`title: 'Galerie, ' + (images?.length ?? 0) + ' images'`, `subtitle: 'Article: galerie'`, `media`.

### 5.6 `articleCallout` (`article-callout.ts`)
Titre: « Article: encadré ». Icône: `BulbOutlineIcon`.

| Champ | Type | Titre | Détails |
|---|---|---|---|
| `tone` | `string` | Ton | `options: { list: [{ title: 'Note', value: 'note' }, { title: 'Avertissement', value: 'warning' }], layout: 'radio' }`, `initialValue: 'note'` |
| `title` | `string` | Titre | Optionnel |
| `text` | `text` (rows 3) | Texte | `R.required()` |

Preview: `select: { title: 'title', text: 'text', tone: 'tone' }`; `prepare`:
`title: title || (text ? text.slice(0, 60) : '(encadré vide)')`,
`subtitle: tone === 'warning' ? 'Encadré: avertissement' : 'Encadré: note'`.

### 5.7 `articleInlineCta` (`article-inline-cta.ts`)
Titre: « Article: appel à l'action ». Icône: `LaunchIcon`.

| Champ | Type | Titre | Détails |
|---|---|---|---|
| `text` | `text` (rows 2) | Texte | `R.required()` |
| `cta` | `link` | Bouton | `R.required()` |

Preview: `select: { text: 'text', label: 'cta.label' }`; `prepare`:
`title: text ? text.slice(0, 60) : '(texte vide)'`,
`subtitle: label ? 'CTA: ' + label : 'Article: appel à l\'action'`.

---

## 6. Documents (`documents/`, 17 fichiers)

Convention pageBuilder, identique sur chaque page fixe et `onePager`:

```ts
defineField({
  name: 'pageBuilder',
  title: 'Sections de la page',
  type: 'array',
  group: 'content',
  options: {
    insertMenu: {
      views: [
        { name: 'list' },
        { name: 'grid', previewImageUrl: (typeName) => `/static/block-previews/${typeName}.svg` },
      ],
      filter: true,
    },
  },
  of: [
    defineArrayMember({ type: 'about' }),
    defineArrayMember({ type: 'services' }),
    defineArrayMember({ type: 'testimonials' }),
    defineArrayMember({ type: 'faq' }),
    defineArrayMember({ type: 'contact' }),
    defineArrayMember({ type: 'mediaText' }),
    defineArrayMember({ type: 'ctaBand' }),
    defineArrayMember({ type: 'process' }),
    defineArrayMember({ type: 'stats' }),
    defineArrayMember({ type: 'highlights' }),
    defineArrayMember({ type: 'logos' }),
    defineArrayMember({ type: 'projectsPreview' }),
    defineArrayMember({ type: 'blogPreview' }),
  ],
})
```

Mêmes `options.insertMenu` sur `article.body` (§6.12, vignettes des 7 blocs article).
Les vignettes wireframe vivent dans `studio/static/block-previews/`, un SVG par
`_type` Sanity (§8, §9).

### 6.1 `siteSettings` (`site-settings.ts`), singleton « Globales »
Icône: `CogIcon`. Groups: `brand` « Marque » (default), `contact` « Coordonnées »,
`nav` « Navigation », `footer` « Pied de page », `seo` « SEO ».

| Champ | Type | Titre | Group | Détails |
|---|---|---|---|---|
| `language` | `string` | | brand | readOnly, hidden |
| `brand` | `object` | Marque | brand | Sous-champs, dans cet ordre: `name` string `R.required()` (Nom); `logo` image SANS hotspot `R.required()` (Logo, description: « Logo affiché dans l'entête et le pied de page. », seed: l'asset SVG `studio/seed/assets/logo-atelier-cormier.svg`); `homeAriaLabel` string `R.required()` (Libellé d'accessibilité du lien logo, description: « Lu par les lecteurs d'écran sur le lien de retour à l'accueil. », placé DIRECTEMENT sous le logo); `tagline` string `R.required()` (Devise); `foundedYear` number `R.required().integer()` (Année de fondation). Le champ `monogram` V1 est SUPPRIMÉ: le logo le remplace |
| `contact` | `object` | Coordonnées | contact | Sous-champs: `phone` string `R.required()` (Téléphone affiché, ex. 450 555 0188); `email` string `R.required().email()` (Courriel); `address` object (Adresse) avec `line1`, `cityProv` (Ville et province affichées), `city`, `region`, `country`, `postal`: 6 strings `R.required()`, description sur city/region/country/postal: « Champs structurés pour le Schema.org PostalAddress. »; `areaServed` array of string `R.required().min(1)` (Zone desservie); `hours` object (Horaires) avec `weekdays` et `weekend`: strings `R.required()`. Le format E.164 n'est PAS stocké: dérivé en code depuis `phone` (§12.13) |
| `nav` | `object` | Navigation | nav | Sous-champs: `landing` object (Nav du one-pager) avec `primary` array of `link` `R.required().min(1)` (Liens principaux, description: « Liens de type Ancre, scrollspy du one-pager. ») et `cta` `link` `R.required()` (Bouton d'appel); `multipage` object (Nav du multipage) avec `primary` array of `link` `R.required().min(1)` et `cta` `link` `R.required()` |
| `footer` | `object` | Pied de page | footer | Sous-champs: `primary` array of `link` `R.required().min(1)` (Liens primaires, description: « Liens principaux du pied de page. »): le Footer ne lit PLUS `nav.multipage.primary`, seed: les mêmes 5 liens que la nav multipage (Services, Projets, À propos, Blogue, Contact); `socials` array of objet inline `socialLink` `R.required().min(1).unique()` avec `{ label: string R.required(), href: url R.required(), icon: string R.required() (description: « Nom Iconify, ex. ri:instagram-fill. ») }`, preview membre `title: label, subtitle: href`; `utility` array of `link` (Liens utilitaires, ex. FAQ), optionnel: vide ou absent, normalisé en `[]` à la résolution (§12.12); `pageLinks` array of `link` (Liens légaux), optionnel: même normalisation; `copyright` string `R.required()` (Mention de copyright, description: « Le jeton {year} est remplacé par l'année courante au build. »); `credit` object (Crédit studio) avec `label`, `studio`, `product`: strings `R.required()` et `studioUrl`: url `R.required()` |
| `seo` | `object` | SEO | seo | Sous-champs: `titleSuffix` string `R.required()` (Suffixe des titres, description: « Ajouté à la fin du titre de chaque page, sauf l'accueil et le one-pager qui portent leur titre complet. », seed: « Atelier Cormier »); `defaultDescription` text rows 2 (Description par défaut, description: « Repli quand la page n'a pas de description. », seed: la description SEO de l'accueil, §6.2); `defaultOgImage` image avec hotspot (Image de partage par défaut, description: « Repli og:image global. Format 1200 x 630. », seed: ABSENT, le repli code `/og/og-default.jpg` suffit, §12.10) |

Preview: `select: { name: 'brand.name', language: 'language' }`; `prepare`:
`title: 'Globales' + (language ? ' (' + language.toUpperCase() + ')' : '')`,
`subtitle: name || 'Configuration du site'`.

### 6.2 `homePage` (`home-page.ts`), singleton « Accueil »
Icône: `HomeIcon`. Groups: `content` « Contenu » (default), `seo` « SEO ».

| Champ | Type | Titre | Group | Détails |
|---|---|---|---|---|
| `language` | `string` | | content | readOnly, hidden |
| `hero` | `heroHome` | Héros d'accueil | content | `R.required()`. CTA en routes internes (seed). |
| `pageBuilder` | `array` (15 blocs) | Sections de la page | content | Seed: highlights, projectsPreview (featured, 3), services (auto, liens), stats, mediaText (story), testimonials (featured), blogPreview (3), ctaBand |
| `seo` | `seo` | SEO de la page | seo | Seed: `title` « Atelier Cormier \| Ébénisterie sur mesure à Chambly » (titre COMPLET: gabarit de marque neutralisé en code sur l'accueil, `titleTemplate: null`); `description` « Ébénisterie sur mesure à Chambly, Québec. Cuisines, mobilier et restauration en bois massif local. Atelier indépendant établi en 2014. » |

Preview: `select: { language: 'language' }`; `prepare`:
`title: 'Accueil' + (language ? ' (' + language.toUpperCase() + ')' : '')`.

### 6.3 `servicesPage` (`services-page.ts`), singleton « Page Services »
Icône: `WrenchIcon`. Groups: `content` « Contenu » (default), `seo` « SEO ».

La copie des pages de détail ne vit PLUS ici: l'objet `serviceDetail` est SUPPRIMÉ.
Ses champs déménagent sur CHAQUE document `service` (objet `detail`, group « Page de
détail », §6.10), préremplis par `initialValue` avec la copie FR du gabarit.

| Champ | Type | Titre | Group | Détails |
|---|---|---|---|---|
| `language` | `string` | | content | readOnly, hidden |
| `hero` | `pageHero` | Héros de page | content | `R.required()` |
| `pageBuilder` | `array` (15 blocs) | Sections de la page | content | Seed: services (auto, liens), process, testimonials (featured), faq (4 questions: délais, estimation, essences, garantie, dans cet ordre), ctaBand |
| `seo` | `seo` | SEO de la page | seo | Seed: `title` « Services »; `description` « Cuisines sur mesure, mobilier, bibliothèques intégrées, restauration et agencements de commerce en bois massif local, atelier de Chambly. » |

Preview: comme homePage avec `title: 'Page Services'`.

### 6.4 `projectsPage` (`projects-page.ts`), singleton « Page Projets »
Icône: `ProjectsIcon`. Groups: `content` (default), `seo`.

La copie des pages de détail ne vit PLUS ici: l'objet `projectDetail` est SUPPRIMÉ.
Ses champs déménagent sur CHAQUE document `project` (objet `detail`, group « Page de
détail », §6.11), préremplis par `initialValue` avec la copie FR du gabarit.

| Champ | Type | Titre | Group | Détails |
|---|---|---|---|---|
| `language` | `string` | | content | readOnly, hidden |
| `hero` | `pageHero` | Héros de page | content | `R.required()` |
| `pageBuilder` | `array` (15 blocs) | Sections de la page | content | Seed: ctaBand (la grille de projets est rendue par la page, hors builder) |
| `seo` | `seo` | SEO de la page | seo | Seed: `title` « Projets »; `description` « Réalisations en ébénisterie sur mesure: cuisines, mobilier, bibliothèques et restauration en bois massif local, en Montérégie. » |

Preview: `title: 'Page Projets'`.

### 6.5 `aboutPage` (`about-page.ts`), singleton « À propos »
Icône: `UserIcon`. Groups: `content` (default), `seo`.

| Champ | Type | Titre | Group | Détails |
|---|---|---|---|---|
| `language` | `string` | | content | readOnly, hidden |
| `hero` | `pageHero` | Héros de page | content | `R.required()` |
| `pageBuilder` | `array` (15 blocs) | Sections de la page | content | Seed: about, highlights, stats, logos, testimonials (featured), ctaBand |
| `seo` | `seo` | SEO de la page | seo | Seed: `title` « À propos »; `description` « Un ébéniste solo à Chambly depuis 2014. Du dessin à la livraison, bois locaux et joinage traditionnel. » |

Preview: `title: 'À propos'`.

### 6.6 `blogPage` (`blog-page.ts`), singleton « Page Blogue »
Icône: `BookIcon`. Groups: `content` (default), `seo`.

Le listing, les filtres et la pagination sont rendus par le code. Les trois bandeaux
CTA sont des champs dédiés parce qu'ils servent trois gabarits de route différents
(liste, archive de catégorie, article) qui partagent ce document.

| Champ | Type | Titre | Group | Détails |
|---|---|---|---|---|
| `language` | `string` | | content | readOnly, hidden |
| `hero` | `pageHero` | Héros de page | content | `R.required()` (sans image: héros texte seul) |
| `listCta` | `ctaBand` | Bandeau CTA (liste du blogue) | content | `R.required()` |
| `categoryCta` | `ctaBand` | Bandeau CTA (archives de catégorie) | content | `R.required()` |
| `articleCta` | `ctaBand` | Bandeau CTA (fin d'article) | content | `R.required()` |
| `related` | `object` | Section articles reliés | content | `heading` string `R.required()` |
| `pageBuilder` | `array` (15 blocs) | Sections de la page | content | Seed: vide. Rendu sur /blog après la liste, disponible pour des sections futures |
| `seo` | `seo` | SEO de la page | seo | Seed: `title` « Blogue »; `description` « Le blogue d'Atelier Cormier: le bois, les techniques et les coulisses des projets de l'atelier. » |

Preview: `title: 'Page Blogue'`.

### 6.7 `faqPage` (`faq-page.ts`), singleton « Page FAQ »
Icône: `HelpCircleIcon`. Groups: `content` (default), `seo`.

La page est composée de sections par thème: le champ `questions` (liste plate de
références) est REMPLACÉ par `sections`. Chaque section pointe un `faqTheme` et
choisit ses questions (mode automatique ou sélection manuelle). Le rendu reste groupé
par thème, dans l'ordre des sections (§12.15).

| Champ | Type | Titre | Group | Détails |
|---|---|---|---|---|
| `language` | `string` | | content | readOnly, hidden |
| `hero` | `pageHero` | Héros de page | content | `R.required()` (sans image) |
| `sections` | `array` of objet inline `faqSection` | Questions par thème | content | Membres: voir table ci-dessous. Validation: `R.required().min(1)` + custom d'unicité du thème (deux sections ne peuvent pas pointer le même thème; `R.unique()` n'a pas de sens sur des objets inline, le custom compare les `theme._ref`). Description: « La page FAQ se compose ici, une section par thème. » Seed: 8 sections en mode manuel, une par thème dans l'ordre de première apparition V1 (Délais, Zone desservie, Estimation et devis, Matériaux, Garantie, Prix et paiement, Entretien, Processus), `items` = les questions du thème dans l'ordre V1 (Prix et paiement porte prix puis acompte): reproduit la page V1 à l'identique |
| `pageBuilder` | `array` (15 blocs) | Sections de la page | content | Seed: ctaBand (l'actuel `FAQ_PAGE_CONTENT.cta`), rendu après le listing |
| `seo` | `seo` | SEO de la page | seo | Seed: `title` « Foire aux questions »; `description` « Matériaux, délais, prix, entretien, garantie et processus: les réponses honnêtes aux questions fréquentes, avant même qu'on se parle. » |

Membres `faqSection` (objet inline, jamais enregistré dans `index.ts`):

| Champ | Type | Titre | Détails |
|---|---|---|---|
| `theme` | `reference` to `faqTheme` | Thème | `R.required()`. Filtre langue (§1.3) + i18n exclude (§1.2) |
| `mode` | `string` | Mode de sélection | `options: { list: [{ title: 'Automatique: toutes les questions du thème, ordre alphabétique', value: 'auto' }, { title: 'Sélection manuelle', value: 'manual' }], layout: 'radio' }`, `initialValue: 'manual'`, `R.required()` |
| `items` | `array` of `reference` to `faqItem` | Questions choisies | `hidden: ({ parent }) => parent?.mode !== 'manual' \|\| !parent?.theme?._ref`: le champ n'apparaît qu'en mode manuel ET quand le thème est posé. La garde sur le thème est obligatoire: `mode` a `initialValue: 'manual'`, donc sans elle la liste serait visible dès la création de la section et la recherche de référence s'exécuterait avec `$themeId` undefined (param GROQ référencé mais non fourni, requête en erreur). Le `R.required()` sur `theme` guide l'éditeur vers le bon ordre de saisie. Options: i18n exclude + filtre combiné MÊME langue ET thème de la section: `filter: 'language == $language && theme._ref == $themeId'`, `params: { language, themeId }`. Résolution de `$themeId` dans le callback `options.filter`: pour une reference membre d'array, `parent` EST l'array `items` (fait vérifié dans la version installée: `ReferenceFilterResolverContext.parent` est typé `Record \| Record[]`), donc `parent.theme._ref` retournerait un `undefined` silencieux; la section porteuse = la valeur dans `document` au `parentPath` amputé de son dernier segment, et `$themeId` = son `theme._ref`. Validation: `R.unique()` + custom: requis et non vide quand `mode === 'manual'` |

Conséquence assumée: une question sans thème (§6.15) reste sélectionnable par le bloc
`faq` du page builder, mais jamais par les sections de la page FAQ (le filtre exige le
thème).

Preview du membre `faqSection`: `select: { theme: 'theme.title', mode: 'mode', items: 'items' }`;
`prepare`: `title: theme || '(sans thème)'`,
`subtitle: mode === 'auto' ? 'Automatique' : n + (n === 1 ? ' question' : ' questions')`
avec `n = items?.length ?? 0` (accord singulier/pluriel).

Preview: `title: 'Page FAQ'`.

### 6.8 `contactPage` (`contact-page.ts`), singleton « Contact »
Icône: `EnvelopeIcon`. Groups: `content` (default), `seo`.

| Champ | Type | Titre | Group | Détails |
|---|---|---|---|---|
| `language` | `string` | | content | readOnly, hidden |
| `hero` | `pageHero` | Héros de page | content | `R.required()` (sans image) |
| `pageBuilder` | `array` (15 blocs) | Sections de la page | content | Seed: contact (tout `CONTACT_CONTENT` vit dans ce bloc) |
| `seo` | `seo` | SEO de la page | seo | Seed: `title` « Contact »; `description` « Démarrer un projet d'ébénisterie sur mesure à Chambly. Écrivez-moi ou appelez l'atelier. Première rencontre gratuite et sans engagement. » |

Preview: `title: 'Contact'`.

### 6.9 `onePager` (`one-pager.ts`), singleton « One-Pager (palier 1) »
Icône: `PresentationIcon`. Groups: `content` (default), `seo`.

Page dédiée palier 1, MÊMES blocs que le multipage, zéro schéma dupliqué. Le noindex
du one-pager reste en code (`usePageSeo({ noindex: true })`).

| Champ | Type | Titre | Group | Détails |
|---|---|---|---|---|
| `language` | `string` | | content | readOnly, hidden |
| `hero` | `heroHome` | Héros d'accueil | content | `R.required()`. CTA en ancres (seed: #contact, #services) |
| `pageBuilder` | `array` (15 blocs) | Sections de la page | content | Seed: about, services (auto, limite 4, sans liens de détail), testimonials (featured), faq (les 5 premières questions de l'ordre V1), contact |
| `seo` | `seo` | SEO de la page | seo | Seed: `title` « Atelier Cormier \| Ébénisterie sur mesure à Chambly » (titre COMPLET, gabarit de marque neutralisé en code comme sur l'accueil); `description` « Ébénisterie sur mesure à Chambly, Québec. Établi en 2014. » |

Preview: `title: 'One-Pager (palier 1)'`.

### 6.10 `service` (`service.ts`), collection « Service »
Icône: `WrenchIcon`. Groups, dans cet ordre: `content` « Contenu » (default),
`detail` « Page de détail », `relations` « Relations et tri » (lecture naturelle: le
contenu du service d'abord, sa page de détail ensuite, les relations et le tri à la
fin).

| Champ | Type | Titre | Group | Détails |
|---|---|---|---|---|
| `language` | `string` | | content | readOnly, hidden |
| `title` | `string` | Titre | content | `R.required()` |
| `slug` | `slug` | Slug (URL) | content | `options: { source: 'title', maxLength: 96, documentInternationalization: { exclude: true } }`, `R.required()`. Description: « Accessible à /services/<slug>. » |
| `summary` | `text` (rows 3) | Résumé | content | `(R) => [R.required(), R.max(280).warning('Plus de 280 caractères: la carte de la grille devient trop dense')]` |
| `meta` | `string` | Repère (délai) | content | `R.required()`. Description: « Affiché sur la carte et le héros de détail, ex. 6 à 16 semaines. » |
| `image` | `figure` | Image | content | `R.required()`. Description: « Ratio 4:3 dans la grille et le détail. » |
| `intro` | `array` of `text` (rows 4) | Paragraphes d'introduction | content | `R.required().min(1)`. Description: « Rendus dans le bloc texte et image de la page de détail. » |
| `benefits` | `array` of objet inline `serviceBenefit` | Bénéfices | content | Membres: `{ title: string R.required(), body: text rows 3 R.required() }`, preview membre `title`. `R.required().min(1)`. Description: « Rendus en points forts sur la page de détail. » |
| `detail` | `object` | Page de détail | detail | `R.required()`. Sous-champs ci-dessous (ceux qu'avait `servicesPage.serviceDetail`). Description: « Copie de la page /services/<slug> de ce service. Préremplie à la création, ajustable section par section. » Seed: l'objet complet sur chaque document, copie du gabarit V1 (identique d'un service à l'autre, FR et EN) |
| `related` | `array` of `reference` to `project` | Projets reliés | relations | Filtre langue + i18n exclude. `R.unique()`. Optionnel |
| `order` | `number` | Ordre | relations | `R.required().integer().positive()`. Description: « Position dans la collection (1 = premier). Détermine l'ordre d'affichage et le compteur S/01 dérivé au rendu. » |

Sous-champs de `detail` (mêmes noms que l'ancien `servicesPage.serviceDetail`: ils
restent regroupés dans l'objet `detail` parce que `benefits` existe déjà au niveau du
document). Chaque champ porte un `initialValue` avec la copie FR actuelle du gabarit
partagé: un nouveau service naît avec la base complète, ajustable document par
document. Les membres d'array des `initialValue` (étapes du processus) s'écrivent
sans `_key`: le Studio les génère à la résolution.

| Champ | Type | Titre | Détails et initialValue |
|---|---|---|---|
| `benefits` | `object` | Section bénéfices | `heading` string `R.required()`, initialValue « Ce que vous obtenez »; `cta` `link` `R.required()`, initialValue `{ _type: 'link', label: 'Demander un devis', type: 'internal', internalRef: { _type: 'reference', _ref: 'contactPage-fr' } }` |
| `included` | `object` | Section inclusions | `heading` string `R.required()`, initialValue « Inclus dans chaque mandat » |
| `process` | `process` | Bloc processus | Réutilise le type bloc `process` tel quel (même pattern que `cta` avec `ctaBand`). Rendu sur la page /services/[slug] par la composition code (`useServiceBlocks`). Description: « Processus affiché sur la page de détail de ce service. La page Services a son propre bloc processus dans ses sections. » initialValue: `PROCESS_CONTENT` complet: `eyebrow` « Le déroulement »; `heading` « Comment se déroule un mandat »; `lead` « Du premier appel à la pose finale, un seul interlocuteur: moi. »; `cta` lien interne « Me contacter » vers `contactPage-fr`; `steps`: les 4 étapes V1 (« La rencontre », « Le devis et le dessin », « La fabrication », « La livraison et la pose ») avec leurs textes V1 |
| `projects` | `object` | Section projets reliés | `eyebrow` string optionnel (sans initialValue); `heading` string `R.required()`, initialValue « Réalisations dans ce service »; `lead` text rows 2 optionnel, initialValue « Des pièces récentes livrées dans ce service, du croquis à la pose. »; `cta` `link` optionnel, initialValue lien interne « Tous les projets » vers `projectsPage-fr`. Description: « Les items viennent des projets reliés du service. » |
| `testimonials` | `object` | Section témoignages | `eyebrow` string `R.required()`, initialValue « Témoignages »; `heading` string `R.required()`, initialValue « Ce qu'en disent mes clients » |
| `cta` | `ctaBand` | Bandeau CTA de fin | Réutilise le type bloc `ctaBand` tel quel. initialValue: `title` « Discutons de votre projet »; `subtitle` « Un devis détaillé et honnête, sans engagement. »; `primaryCta` lien interne « Démarrer un projet » vers `contactPage-fr` |

**Limite des initialValue de références.** Les `cta` internes des `initialValue`
visent les ids FR (`contactPage-fr`, `projectsPage-fr`): cohérent avec le filtre de
templates (§8, création en FR seulement). À la création d'une traduction EN, le
plugin documentInternationalization EXCLUT les champs reference de la copie (§1.2):
les liens internes de l'objet `detail` copié arrivent sans référence et se
re-choisissent à la main dans le document EN (le reste de la copie est repris tel
quel, à traduire).

Orderings: `{ title: 'Ordre de la collection', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }`.

Preview: `select: { title: 'title', slug: 'slug.current', language: 'language', media: 'image.image' }`;
`prepare`: `title: title || '(sans titre)'`,
`subtitle: '/services/' + (slug || '?') + (language ? ' (' + language.toUpperCase() + ')' : '')`, `media`.

### 6.11 `project` (`project.ts`), collection « Projet »
Icône: `ImagesIcon`. Groups, dans cet ordre: `content` « Contenu » (default),
`caseStudy` « Étude de cas », `detail` « Page de détail », `relations` « Relations
et tri » (lecture naturelle: le contenu du projet d'abord, étude de cas comprise, sa
page de détail ensuite, les relations et le tri à la fin).

| Champ | Type | Titre | Group | Détails |
|---|---|---|---|---|
| `language` | `string` | | content | readOnly, hidden |
| `title` | `string` | Titre | content | `R.required()` |
| `slug` | `slug` | Slug (URL) | content | `options: { source: 'title', maxLength: 96, documentInternationalization: { exclude: true } }`, `R.required()`. Description: « Accessible à /projets/<slug>. » |
| `excerpt` | `text` (rows 3) | Extrait | content | `(R) => [R.required(), R.max(280).warning('Plus de 280 caractères: extrait trop long pour les cartes')]` |
| `cover` | `figure` | Couverture | content | `R.required()` |
| `gallery` | `array` of `figure` | Galerie | content | `R.required().min(1)` |
| `location` | `string` | Lieu | content | `R.required()` (ex. Chambly) |
| `year` | `string` | Année | content | `R.required().regex(/^\d{4}$/)` |
| `challenge` | `text` (rows 4) | Défi | caseStudy | `R.required()` |
| `solution` | `text` (rows 4) | Solution | caseStudy | `R.required()` |
| `result` | `text` (rows 4) | Résultat | caseStudy | `R.required()` |
| `stats` | `array` of objet inline `projectStat` | Chiffres du projet | caseStudy | Membres: `{ label: string R.required(), value: string R.required() }`, preview membre `title: value, subtitle: label`. Optionnel |
| `detail` | `object` | Page de détail | detail | `R.required()`. Sous-champs ci-dessous (ceux qu'avait `projectsPage.projectDetail`). Description: « Copie de la page /projets/<slug> de ce projet. Préremplie à la création, ajustable section par section. » Seed: l'objet complet sur chaque document, copie du gabarit V1 (identique d'un projet à l'autre, FR et EN) |
| `service` | `reference` to `service` | Service | relations | `R.required()`. Filtre langue + i18n exclude |
| `testimonial` | `reference` to `testimonial` | Témoignage associé | relations | Optionnel. Filtre langue + i18n exclude |
| `featured` | `boolean` | Projet vedette | relations | `initialValue: false`. Description: « Sélectionné par les blocs aperçu de projets en mode vedettes. » |
| `order` | `number` | Ordre | relations | `R.required().integer().positive()`. Description: « Position dans la grille des projets (1 = premier). » |

Sous-champs de `detail` (mêmes noms que l'ancien `projectsPage.projectDetail`: ils
restent regroupés dans l'objet `detail` parce que `gallery` et `testimonial` existent
déjà au niveau du document). Chaque champ porte un `initialValue` avec la copie FR
actuelle du gabarit partagé: un nouveau projet naît avec la base complète, ajustable
document par document. La même limite des `initialValue` de références qu'au §6.10
s'applique (refs FR, re-choisies à la main dans la traduction EN).

| Champ | Type | Titre | Détails et initialValue |
|---|---|---|---|
| `gallery` | `object` | Section galerie | `heading` string `R.required()`, initialValue « En images » |
| `caseStudy` | `object` | Étude de cas | `eyebrow` string `R.required()`, initialValue « L'étude de cas »; `heading` string `R.required()`, initialValue « Le défi, la solution, le résultat »; `challengeLabel`, `solutionLabel`, `resultLabel`: 3 strings `R.required()` (libellés des trois volets), initialValue « Le défi », « La solution », « Le résultat » |
| `testimonial` | `object` | Section témoignage | `eyebrow` string `R.required()`, initialValue « Témoignages »; `heading` string `R.required()`, initialValue « Le mot du client » |
| `similar` | `object` | Section projets similaires | `eyebrow` string optionnel (sans initialValue); `heading` string `R.required()`, initialValue « Projets similaires »; `lead` text rows 2 optionnel (sans initialValue: absent du gabarit V1); `cta` `link` optionnel, initialValue lien interne « Tous les projets » vers `projectsPage-fr` |
| `cta` | `ctaBand` | Bandeau CTA de fin | Réutilise le type bloc `ctaBand` tel quel. initialValue: `title` « Un projet comme celui-ci? »; `subtitle` « Chaque pièce est unique. Parlons de la vôtre. »; `primaryCta` lien interne « Démarrer un projet » vers `contactPage-fr` |

Orderings: `orderAsc` (order asc), `yearDesc` (year desc).

Preview: `select: { title: 'title', year: 'year', location: 'location', language: 'language', media: 'cover.image' }`;
`prepare`: `title: title || '(sans titre)'`,
`subtitle: [year, location].filter(Boolean).join(', ') + (language ? ' (' + language.toUpperCase() + ')' : '')`, `media`.

### 6.12 `article` (`article.ts`), collection « Article »
Icône: `DocumentTextIcon`. Groups: `content` « Contenu » (default), `meta`
« Métadonnées ».

Le corps d'article est l'array des 7 blocs article, directement sur le document
(deuxième builder, distinct du pageBuilder).

| Champ | Type | Titre | Group | Détails |
|---|---|---|---|---|
| `language` | `string` | | content | readOnly, hidden |
| `title` | `string` | Titre | content | `(R) => [R.required(), R.max(120).warning('Plus de 120 caractères: titre long pour les cartes et la balise title')]` (le front n'impose pas de limite dure: warning, pas erreur) |
| `slug` | `slug` | Slug (URL) | content | `options: { source: 'title', maxLength: 96, documentInternationalization: { exclude: true } }`. Validation: `R.required().custom(slug => slug?.current === 'page' ? 'Le segment « page » est réservé à la pagination du blogue' : true)`. Description: « Accessible à /blog/<slug> ou /blog/<catégorie>/<slug>. » |
| `excerpt` | `text` (rows 3) | Extrait | content | `(R) => [R.required(), R.max(280).warning('Plus de 280 caractères: extrait trop long pour les cartes')]` |
| `cover` | `figure` | Couverture | content | `R.required()` |
| `category` | `reference` to `category` | Catégorie | content | Optionnel (0 ou 1, jamais plusieurs). Filtre langue + i18n exclude. Description: « Détermine le segment d'URL parent. Sans catégorie: /blog/<slug>. » |
| `body` | `array` (7 blocs article) | Corps de l'article | content | `of:` les 7 types §5. `R.required().min(1)`. Mêmes `options.insertMenu` que la convention pageBuilder (§6): vues liste + grille (vignettes `/static/block-previews/<type>.svg`), `filter: true` |
| `date` | `date` | Date de publication | meta | `R.required()`, `initialValue: () => new Date().toISOString().slice(0, 10)` |
| `author` | `string` | Auteur | meta | `R.required()` |
| `readingTime` | `number` | Minutes de lecture | meta | `R.required().integer().positive()`. Description: « Affichées au héros d'article. » |

Orderings: `{ title: 'Date de publication (plus récent)', name: 'dateDesc', by: [{ field: 'date', direction: 'desc' }] }`.

Preview: `select: { title: 'title', date: 'date', categoryTitle: 'category.title', language: 'language', media: 'cover.image' }`;
`prepare`: `title: title || '(sans titre)'`, `subtitle:` date formatée
`toLocaleDateString('fr-CA', { year: 'numeric', month: 'short', day: 'numeric' })`
(fallback `'Brouillon'`), suivie de `, categoryTitle` si présent et de
`(' + language.toUpperCase() + ')'`, `media`.

### 6.13 `category` (`category.ts`), collection « Catégorie »
Icône: `TagIcon`. Pas de groups.

| Champ | Type | Titre | Détails |
|---|---|---|---|
| `language` | `string` | | readOnly, hidden |
| `title` | `string` | Titre | `R.required()` |
| `slug` | `slug` | Slug (URL) | `options: { source: 'title', maxLength: 96, documentInternationalization: { exclude: true } }`. Validation: `R.required().custom(slug => slug?.current === 'page' ? 'Le segment « page » est réservé à la pagination du blogue' : true)`. Description: « Archive accessible à /blog/<slug>. » |
| `description` | `text` (rows 3) | Description | `R.required()`. Description: « Texte d'amorce de l'archive de catégorie. » |
| `order` | `number` | Ordre | `R.required().integer().positive()`. Description: « Position dans le filtre de catégories du blogue. » |

Orderings: `orderAsc`. Preview: `select: { title: 'title', slug: 'slug.current', language: 'language' }`;
`prepare`: `title: title || '(sans titre)'`,
`subtitle: '/blog/' + (slug || '?') + (language ? ' (' + language.toUpperCase() + ')' : '')`.

### 6.14 `testimonial` (`testimonial.ts`), banque « Témoignage »
Icône: `CommentIcon`. Pas de groups. Pas de slug (pas de route propre).

| Champ | Type | Titre | Détails |
|---|---|---|---|
| `language` | `string` | | readOnly, hidden |
| `quote` | `text` (rows 4) | Citation | `R.required()` |
| `name` | `string` | Nom | `R.required()` |
| `context` | `string` | Contexte | `R.required()` (ex. Cuisine complète, Chambly) |
| `service` | `reference` to `service` | Service associé | Optionnel. Filtre langue + i18n exclude |
| `project` | `reference` to `project` | Projet associé | Optionnel. Filtre langue + i18n exclude. Les deux références peuvent coexister |
| `featured` | `boolean` | Témoignage vedette | `initialValue: false`. Description: « Sélectionné par les blocs témoignages en mode vedettes. » |
| `order` | `number` | Ordre | `R.required().integer().positive()` |

Orderings: `orderAsc`. Preview: `select: { name: 'name', context: 'context', featured: 'featured', language: 'language' }`;
`prepare`: `title: name || '(sans nom)'`,
`subtitle: (featured ? 'Vedette, ' : '') + (context || '') + (language ? ' (' + language.toUpperCase() + ')' : '')`.

### 6.15 `faqItem` (`faq-item.ts`), banque « Question FAQ »
Icône: `HelpCircleIcon`. Pas de groups. PAS de champ `order` (exception assumée à
§1.13): l'ordre d'affichage appartient aux consommateurs (les sections de
`faqPage.sections` pour la page FAQ: ordre des `items` en mode manuel, tri
alphabétique sur `question` en mode auto, §12.15; l'ordre des refs `items` pour les
blocs `faq`).

| Champ | Type | Titre | Détails |
|---|---|---|---|
| `language` | `string` | | readOnly, hidden |
| `question` | `string` | Question | `R.required()` (champ V1: `q`) |
| `answer` | `text` (rows 4) | Réponse | `R.required()` (champ V1: `a`) |
| `theme` | `reference` to `faqTheme` | Thème | Optionnel (même logique que la catégorie d'article, §6.12). Filtre langue + i18n exclude. Description: « Regroupe les questions sur la page FAQ. Une question sans thème ne peut pas être choisie par les sections de la page FAQ. » (conséquence assumée, §6.7) |

Pas d'orderings (l'ordering `orderAsc` disparaît avec le champ `order`; le desk trie
`question asc`, §7). Preview: `select: { question: 'question', theme: 'theme.title', language: 'language' }`;
`prepare`: `title: question || '(sans question)'`,
`subtitle: (theme || 'Sans thème') + (language ? ' (' + language.toUpperCase() + ')' : '')`.

### 6.16 `legalPage` (`legal-page.ts`), « Page légale »
Icône: `ClipboardIcon`. Pas de groups. Exactement 2 instances par langue, ids
déterministes (`legalPage-conditions-<lang>`, `legalPage-confidentialite-<lang>`),
créées par le seed: le type est exclu du bouton « + » (voir §8, templates). Pas de
slug: les routes sont connues et résolues par le route-map sur `_id`.

| Champ | Type | Titre | Détails |
|---|---|---|---|
| `language` | `string` | | readOnly, hidden |
| `title` | `string` | Titre | `R.required()` |
| `effective` | `date` | Date d'entrée en vigueur | Optionnel. Description: « À fournir par le client. Vide: le site affiche une zone à compléter encadrée à la place de la date. » |
| `updated` | `date` | Dernière mise à jour | Optionnel. Description: « À fournir par le client. Vide: le site affiche une zone à compléter encadrée à la place de la date. » |
| `sections` | `array` of `legalSection` | Sections | `R.required().min(1)` |

Seed: `title` et `sections` transcrits de `LEGAL_CONTENT`; `effective` et `updated`
laissés VIDES. Les valeurs V1 sont des jetons todo inline (`[date d'entrée en
vigueur, ex. 1er janvier 2026]`), pas des dates: le seed n'invente aucune date, la
sémantique « à remplir par le client » est portée par le champ vide. Formatage
fr-CA et rendu todo à la résolution: §12.11.

Preview: `select: { title: 'title', updated: 'updated', language: 'language' }`;
`prepare`: `title: title || '(sans titre)'`,
`subtitle: 'Mise à jour ' + (updated || 'à compléter') + (language ? ' (' + language.toUpperCase() + ')' : '')`.

### 6.17 `faqTheme` (`faq-theme.ts`), banque « Thème FAQ »
Icône: `BookmarkIcon`. Pas de groups. Localisé comme tous les documents (§1.1), rangé
sous le dossier FAQ du desk (§7).

| Champ | Type | Titre | Détails |
|---|---|---|---|
| `language` | `string` | | readOnly, hidden |
| `title` | `string` | Titre | `R.required()` |
| `slug` | `slug` | Slug (ancre) | `options: { source: 'title', maxLength: 96, documentInternationalization: { exclude: true } }`, `R.required()`. Description: « Sert d'ancre sur la page FAQ. » |

Seed: les 8 thèmes distincts de la banque V1 (Délais, Zone desservie, Estimation et
devis, Matériaux, Garantie, Prix et paiement, Entretien, Processus), traduits en EN.

Preview: `select: { title: 'title', slug: 'slug.current', language: 'language' }`;
`prepare`: `title: title || '(sans titre)'`,
`subtitle: '#' + (slug || '?') + (language ? ' (' + language.toUpperCase() + ')' : '')`.

---

## 7. Desk structure (`structureTool`)

Ordre de navigation du site, pas ordre des types. Helper singleton (le doc FR est la
porte d'entrée, le switch FR/EN passe par le panneau Translations du plugin):

```ts
const singleton = (S: StructureBuilder, id: string, title: string, icon: ComponentType) =>
  S.listItem()
    .title(title)
    .id(id)
    .icon(icon)
    .child(S.document().schemaType(id).documentId(`${id}-fr`).title(title))
```

Helper collection: TOUTES les listes de collections (`service`, `project`, `article`,
`category`, `testimonial`, `faqItem`, `faqTheme`, `legalPage`) sont des
`S.documentList` filtrées `language == "fr"` avec tri par défaut: un seul document par
item affiché (la version FR), la bascule FR/EN se fait DANS le document via le
sélecteur de langue du plugin documentInternationalization.

```ts
const collection = (
  S: StructureBuilder,
  type: string,
  title: string,
  by: { field: string; direction: 'asc' | 'desc' }[],
) =>
  S.documentTypeListItem(type)
    .title(title)
    .child(
      S.documentList()
        .title(title)
        .schemaType(type)
        .filter('_type == $type && language == "fr"')
        .params({ type })
        .defaultOrdering(by),
    )
```

Structure complète:

```ts
structure: (S) =>
  S.list()
    .title('Contenu')
    .items([
      singleton(S, 'siteSettings', 'Globales', CogIcon),
      S.divider(),

      singleton(S, 'homePage', 'Accueil', HomeIcon),

      S.listItem().title('Services').icon(WrenchIcon).child(
        S.list().title('Services').items([
          singleton(S, 'servicesPage', 'Page Services', WrenchIcon),
          S.divider(),
          collection(S, 'service', 'Services (collection)', [{ field: 'order', direction: 'asc' }]),
        ]),
      ),

      S.listItem().title('Projets').icon(ProjectsIcon).child(
        S.list().title('Projets').items([
          singleton(S, 'projectsPage', 'Page Projets', ProjectsIcon),
          S.divider(),
          collection(S, 'project', 'Projets (collection)', [{ field: 'order', direction: 'asc' }]),
        ]),
      ),

      S.listItem().title('Blogue').icon(BookIcon).child(
        S.list().title('Blogue').items([
          singleton(S, 'blogPage', 'Page Blogue', BookIcon),
          S.divider(),
          collection(S, 'article', 'Articles', [{ field: 'date', direction: 'desc' }]),
          collection(S, 'category', 'Catégories', [{ field: 'order', direction: 'asc' }]),
        ]),
      ),

      singleton(S, 'aboutPage', 'À propos', UserIcon),

      S.listItem().title('FAQ').icon(HelpCircleIcon).child(
        S.list().title('FAQ').items([
          singleton(S, 'faqPage', 'Page FAQ', HelpCircleIcon),
          S.divider(),
          collection(S, 'faqItem', 'Banque de questions', [{ field: 'question', direction: 'asc' }]),
          collection(S, 'faqTheme', 'Thèmes', [{ field: 'title', direction: 'asc' }]),
        ]),
      ),

      singleton(S, 'contactPage', 'Contact', EnvelopeIcon),
      S.divider(),

      S.listItem().title('Banques').icon(DatabaseIcon).child(
        S.list().title('Banques').items([
          collection(S, 'testimonial', 'Témoignages', [{ field: 'order', direction: 'asc' }]),
        ]),
      ),
      collection(S, 'legalPage', 'Pages légales', [{ field: 'title', direction: 'asc' }]),
      S.divider(),

      // Section démarquée: le palier 1 vit à part, après tout le multipage.
      singleton(S, 'onePager', 'One-Pager (palier 1)', PresentationIcon),
      S.divider(),

      // Auto-listing de sécurité: tout nouveau type oublié apparaît quand même.
      // media.tag (type document du plugin sanity-plugin-media) est exclu: il se
      // gère par l'onglet Media, pas par le desk (trou présent dans la référence,
      // corrigé ici).
      ...S.documentTypeListItems().filter((item) => {
        const id = item.getId()
        return (
          !!id &&
          !SINGLETON_TYPES.has(id) &&
          !NESTED_TYPES.has(id) &&
          id !== 'translation.metadata' &&
          id !== 'media.tag'
        )
      }),
    ])
```

---

## 8. `sanity.config.ts` et `sanity.cli.ts`

### Constantes de tête de fichier

```ts
const SUPPORTED_LANGUAGES = [
  { id: 'fr', title: 'Français' },
  { id: 'en', title: 'English' },
]

// TOUS les documents sont localisés.
const I18N_SCHEMA_TYPES = [
  'siteSettings', 'homePage', 'servicesPage', 'projectsPage', 'aboutPage',
  'blogPage', 'faqPage', 'contactPage', 'onePager',
  'service', 'project', 'article', 'category',
  'testimonial', 'faqItem', 'faqTheme', 'legalPage',
]

const SINGLETON_TYPES = new Set([
  'siteSettings', 'homePage', 'servicesPage', 'projectsPage', 'aboutPage',
  'blogPage', 'faqPage', 'contactPage', 'onePager',
])

// Instances fixes créées par le seed (ids déterministes), pas de création libre.
const FIXED_INSTANCE_TYPES = new Set(['legalPage'])

// Actions conservées sur les singletons ET les instances fixes (legalPage):
// garde les 2 actions du plugin i18n, retire Duplicate et Delete.
const SINGLETON_ACTIONS = new Set([
  'publish', 'discardChanges', 'restore',
  'createTranslationAction', 'translationsAction',
])

// Types rangés manuellement dans la structure, exclus de l'auto-listing.
const NESTED_TYPES = new Set([
  'service', 'project', 'article', 'category',
  'testimonial', 'faqItem', 'faqTheme', 'legalPage',
])

const PREVIEW_ORIGIN = process.env.SANITY_STUDIO_PREVIEW_URL || 'http://localhost:3000'
```

### Config

```ts
export default defineConfig({
  name: 'default',
  title: 'WebForge - Minimaliste Demo',
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'fesilwqf',
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',

  plugins: [
    structureTool({ structure }),            // §7
    documentInternationalization({
      supportedLanguages: SUPPORTED_LANGUAGES,
      schemaTypes: I18N_SCHEMA_TYPES,
    }),
    presentationTool({
      previewUrl: {
        initial: PREVIEW_ORIGIN,
        previewMode: { enable: '/preview/enable' },
      },
      // Temps 2: resolve.mainDocuments + resolve.locations seront générés depuis
      // le route-map partagé (app/config/route-map.ts), pattern nuxt-sanity-test
      // (buildStudioMainDocuments / buildLocationsConfig). Config minimale d'ici là.
    }),
    media(),
    visionTool(),
    // Studio en français (libellés du shell, dont le bouton « Add item » des
    // arrays). Package @sanity/locale-fr-fr, déjà installé.
    frFRLocale(),
  ],

  schema: {
    types: schemaTypes,
    // Création en FR seulement; singletons, instances fixes et media.tag (plugin
    // sanity-plugin-media) exclus du bouton +.
    templates: (templates) =>
      templates.filter((template) => {
        if (SINGLETON_TYPES.has(template.schemaType)) return false
        if (FIXED_INSTANCE_TYPES.has(template.schemaType)) return false
        if (template.schemaType === 'media.tag') return false
        if (I18N_SCHEMA_TYPES.includes(template.schemaType)) {
          return template.id === `${template.schemaType}-fr`
        }
        return true
      }),
  },

  document: {
    // Même jeu d'actions pour les singletons ET les instances fixes (legalPage):
    // pas de Duplicate (id aléatoire orphelin du route-map) ni de Delete, pour
    // préserver l'invariant « exactement 2 instances par langue » de §6.16.
    actions: (input, context) =>
      SINGLETON_TYPES.has(context.schemaType) || FIXED_INSTANCE_TYPES.has(context.schemaType)
        ? input.filter(({ action }) => action && SINGLETON_ACTIONS.has(action))
        : input,
  },

  form: {
    // Retire le picker du plugin media des champs image (l'onglet Media global reste).
    image: { assetSources: (prev) => prev.filter((s) => s.name !== 'media') },
    // Symétrie littérale avec la référence, qui filtre aussi les champs file.
    // Aucun champ file au schéma du démo: sans effet aujourd'hui, mais le calque
    // reste complet si un champ file apparaît un jour.
    file: { assetSources: (prev) => prev.filter((s) => s.name !== 'media') },
  },
})
```

Et: `import './styles/studio.css'` en tête de fichier. Le fichier `styles/studio.css`
copie les sélecteurs de la référence (`nuxt-sanity-test/studio/styles/studio.css`) qui
cachent l'onglet « All fields » auto-injecté dès qu'un type a des groups.

**Convention insertMenu (PB1).** TOUS les arrays `pageBuilder` (§6) et `article.body`
(§6.12) portent les mêmes options:

```ts
options: {
  insertMenu: {
    views: [
      { name: 'list' },
      { name: 'grid', previewImageUrl: (typeName) => `/static/block-previews/${typeName}.svg` },
    ],
    filter: true,
  },
}
```

Les vignettes wireframe vivent dans `studio/static/block-previews/`, un SVG par
`_type` Sanity (15 blocs réguliers + 7 blocs article = 22 fichiers), servies par le
Studio sous `/static/`.

### `sanity.cli.ts`

```ts
export default defineCliConfig({
  api: { projectId: 'fesilwqf', dataset: 'production' },
  // deployment.appId à figer après le premier `sanity deploy` (déploiement non interactif).
})
```

---

## 9. Arborescence des fichiers

```
studio/
├── package.json                  # workspace yarn (pas de lockfile local)
├── sanity.config.ts
├── sanity.cli.ts
├── styles/studio.css             # cache l'onglet All fields
├── static/block-previews/        # 22 vignettes SVG wireframe (15 blocs + 7 blocs article), §8
├── seed/
│   ├── assets/                   # logo-atelier-cormier.svg et autres assets seedés
│   ├── data/                     # contenu seed par locale (site-pages, collections, articles, banques-legal)
│   ├── run.mjs                   # script de seed
│   └── verify.mjs                # vérification post-seed
└── schemas/
    ├── index.ts                  # export const schemaTypes = [...] (46 types)
    ├── documents/
    │   ├── site-settings.ts      # siteSettings
    │   ├── home-page.ts          # homePage
    │   ├── services-page.ts      # servicesPage
    │   ├── projects-page.ts      # projectsPage
    │   ├── about-page.ts         # aboutPage
    │   ├── blog-page.ts          # blogPage
    │   ├── faq-page.ts           # faqPage
    │   ├── contact-page.ts       # contactPage
    │   ├── one-pager.ts          # onePager
    │   ├── service.ts            # service
    │   ├── project.ts            # project
    │   ├── article.ts            # article
    │   ├── category.ts           # category
    │   ├── testimonial.ts        # testimonial
    │   ├── faq-item.ts           # faqItem
    │   ├── faq-theme.ts          # faqTheme
    │   └── legal-page.ts         # legalPage
    └── objects/
        ├── figure.ts             # figure
        ├── link.ts               # link
        ├── seo.ts                # seo
        ├── hero-home.ts          # heroHome
        ├── page-hero.ts          # pageHero
        ├── legal-section.ts      # legalSection
        ├── legal-paragraph.ts    # legalParagraph
        ├── legal-list.ts         # legalList
        ├── legal-todo.ts         # legalTodo
        ├── blocks/
        │   ├── about.ts          ├── services.ts       ├── testimonials.ts
        │   ├── faq.ts            ├── contact.ts        ├── media-text.ts
        │   ├── cta-band.ts       ├── process.ts        ├── stats.ts
        │   ├── highlights.ts     ├── logos.ts          ├── projects-preview.ts
        │   └── blog-preview.ts
        └── article-blocks/
            ├── article-portable-text.ts   # config PT, PAS dans index.ts
            ├── article-lead.ts            ├── article-rich-text.ts
            ├── article-image.ts           ├── article-quote.ts
            ├── article-gallery.ts         ├── article-callout.ts
            └── article-inline-cta.ts
```

Types enregistrés dans `index.ts`: 17 documents + 9 objets partagés + 15 blocs
réguliers + 7 blocs article = 48. Les objets inline nommés (`heroMetaItem`,
`socialLink`, `aboutDiff`, `processStep`, `statItem`, `highlightItem`, `logoItem`,
`serviceBenefit`, `projectStat`, `faqSection`) restent inline, jamais enregistrés.

---

## 10. Matrice de couverture (zéro orphelin)

Chaque interface de `app/content/*.ts` est mappée OU exclue avec justification.
Réciproquement, chaque champ de schéma a un consommateur front identifié (les champs
`order` et les paramètres de sélection des blocs intelligents sont consommés par les
queries GROQ de la couche composable au Temps 2).

| Source V1 | Élément | Destination Sanity ou exclusion |
|---|---|---|
| `site.ts` | `SiteContent.brand` | `siteSettings.brand`; `monogram` SUPPRIMÉ du CMS, remplacé par le champ `logo` (image, asset seedé depuis `studio/seed/assets/logo-atelier-cormier.svg`, résolu en src par la transform, §12.14) |
| | `SiteContent.contact` | `siteSettings.contact` (mêmes sous-champs SAUF `phoneE164`: non stocké, dérivé en code depuis `phone`, §12.13) |
| | `SiteContent.nav.landing` / `.multipage` | `siteSettings.nav.landing` / `.multipage`; `{label, anchor}` et `{label, route}` deviennent des `link` (type anchor / internal) |
| | `SiteContent.footer` | `siteSettings.footer`; `utility`/`pageLinks` `{href, label}` deviennent des `link`; les liens primaires du pied (V1: le Footer lisait `nav.multipage.primary`) deviennent `footer.primary` (seed: les mêmes 5 liens); jeton `{year}` du copyright reste résolu par Footer.vue |
| `hero.ts` | `HeroContent` | `heroHome` (objet). `HERO_CONTENT` seedé sur `onePager.hero` (CTA ancres) ET `homePage.hero` (CTA routes fusionnés de `HOME_PAGE_CONTENT.hero`) |
| | `HeroVisual` | `figure` |
| `page-heroes.ts` | `PageHero` | `pageHero` (objet) |
| | `PAGE_HEROES.{services,projects,about,blog,faq,contact}` | champ `hero` des 6 singletons correspondants |
| | `PageHeroKey` | EXCLU: disparaît (un champ par document, plus de registre par clé) |
| `services.ts` | `Service` | document `service` |
| | `Service.n` | EXCLU: dérivé de la position (`order`) au rendu (S/01) |
| | `serviceImage()` | EXCLU: dérivation remplacée par le champ `service.image` (figure) stocké |
| | `ServicesContent` / `SERVICES_CONTENT` | bloc `services` (copie + mode/limit/withDetailLinks); `items` résolus en GROQ; `items[].href` dérivé de `withDetailLinks` |
| `projects.ts` | `Project` / `ProjectImage` | document `project` / `figure` |
| | `Project.service` (slug) | `project.service` (reference) |
| | `Project.testimonial` (id) | `project.testimonial` (reference) |
| `articles.ts` | `Article` | document `article` (`category` slug → reference; `body` → array des 7 blocs) |
| | `ARTICLES_PER_PAGE` | EXCLU: config code (pagination + prérendu), contrainte d'architecture |
| `article-blocks.ts` | `ArticleImage` | `figure` |
| | `ArticleLeadContent` … `ArticleInlineCtaContent` (7) | les 7 blocs `article*` (§5); `ArticleInlineCtaContent.ctaLabel/ctaHref` → `cta: link` |
| | `RichTextEntry` | EXCLU comme stockage: le Portable Text est la source, la transformation PT → `RichTextEntry[]` vit dans la couche composable (§12.1) |
| `categories.ts` | `Category` | document `category` |
| `testimonials.ts` | `Testimonial` | document `testimonial` (`id` → `_id` déterministe; `service`/`project` slugs → references) |
| | `TestimonialsContent` / `TESTIMONIALS_CONTENT` | bloc `testimonials` (copie + sélection); `items` résolus en GROQ |
| `faq.ts` | `FaqItem` | document `faqItem` (`id` → `_id`; `q` → `question`; `a` → `answer`; `theme` string → reference vers `faqTheme`) |
| | `FaqItem.theme` (valeurs distinctes) | document `faqTheme` (`title` + `slug` ancre, §6.17) |
| | `FaqContent` / `FAQ_CONTENT` | bloc `faq` (copie + sélection manuelle pure, §4.4) |
| | `FaqPageContent.cta` | `faqPage.pageBuilder` (bloc `ctaBand` seedé) |
| | sélection et ordre de la page /faq | `faqPage.sections` (§6.7): une section par thème (mode auto ou sélection manuelle), rendu dans l'ordre des sections (§12.15) |
| | ancre de thème (useFaqByTheme) | `faqTheme.slug` (stockée, plus dérivée du libellé au rendu) |
| `contact.ts` | `ContactContent` | bloc `contact` (seedé dans `contactPage.pageBuilder` et `onePager.pageBuilder`) |
| | `ContactContent.meta` (valeurs) | EXCLUES: join sur `siteSettings.contact` à la résolution (§12.4); les libellés vivent dans `contact.metaLabels` |
| | `form.fields.*.required` | EXCLUS: logique de validation du formulaire, code |
| | `errorBanner.body` (interpolation courriel) | jeton `{email}` stocké, remplacé à la résolution |
| `about.ts` | `AboutContent` | bloc `about` |
| | `diffs[].n` | EXCLU: dérivé de la position au rendu |
| `media-text.ts` | `MediaTextContent` | bloc `mediaText` (`cta` → `link`) |
| | `MEDIA_TEXT_SAMPLE` | EXCLU: vitrine /dev, reste en code |
| `cta-band.ts` | `CtaBandContent` | bloc `ctaBand` |
| | `CTA_BAND_SAMPLE` | EXCLU: vitrine /dev |
| `process.ts` | `ProcessContent` / `PROCESS_CONTENT` | bloc `process`, présent à DEUX endroits: `servicesPage.pageBuilder` (page /services, seedé) ET `service.detail.process` sur CHAQUE document service (initialValue + seed, lu par la composition code de la page /services/[slug], §6.10); `steps[].n` EXCLU (dérivé) |
| `stats.ts` | `StatsContent` / `STATS_CONTENT` | bloc `stats` |
| `highlights.ts` | `HighlightsContent` / `HIGHLIGHTS_CONTENT` | bloc `highlights` |
| `logos.ts` | `LogosContent` / `LOGOS_CONTENT` | bloc `logos`; champ image de logo futur EXCLU (aucun consommateur) |
| `projects-preview.ts` | `ProjectsPreviewContent` | bloc `projectsPreview` (copie + sélection); `items` résolus; `PROJECTS_PREVIEW_SAMPLE` EXCLU (dev) |
| `blog-preview.ts` | `BlogPreviewContent` | bloc `blogPreview` (copie + limit); `items` résolus (`href`, `category` titre, `date`); `BLOG_PREVIEW_SAMPLE` EXCLU (dev) |
| `home.ts` | `HomePageContent` | `homePage`: `hero` (CTA fusionnés), le reste = blocs seedés du `pageBuilder`; `story.image` (dérivée de `ABOUT_CONTENT.photo`) seedée en figure pointant le même asset |
| `services-page.ts` | `ServicesPageContent` | `servicesPage.pageBuilder` (blocs seedés) |
| | `ServiceDetailContent` / `SERVICE_DETAIL_CONTENT` | `service.detail` sur CHAQUE document service (group Page de détail, copie préremplie par initialValue, §6.10); la composition des pages /services/[slug] reste en CODE |
| `projects-page.ts` | `ProjectsPageContent` | `projectsPage.pageBuilder` (bloc ctaBand seedé) |
| | `ProjectDetailContent` / `PROJECT_DETAIL_CONTENT` | `project.detail` sur CHAQUE document projet (group Page de détail, copie préremplie par initialValue, §6.11); composition des pages /projets/[slug] en CODE |
| `about-page.ts` | `AboutPageContent` | `aboutPage.pageBuilder` (blocs seedés) |
| `blog-page.ts` | `BlogPageContent` | `blogPage.listCta` / `.categoryCta` / `.articleCta` / `.related.heading` |
| `legal.ts` | `LegalBlock` (string / list / todo) | `legalParagraph` / `legalList` / `legalTodo` |
| | `LegalDoc.effective` / `updated` (jetons todo `[...]` en V1) | champs `date` OPTIONNELS de `legalPage`, seedés vides (le seed n'invente aucune date); formatage fr-CA et rendu todo à la résolution (§12.11) |
| | `LegalSection` / `LegalDoc` | `legalSection` / document `legalPage` |
| | `LegalContent` (conditions + confidentialite) | éclaté en 2 documents `legalPage` par langue, ids déterministes |
| `consent.ts` | `ConsentConfig` | EXCLU: reste en CODE (décision d'architecture; la bannière est du chrome produit destiné à webforge-core) |
| `guards.ts` | `assertBlogCollections` | EXCLU des schémas: garde de build, consommera Sanity au build (§12.7) |
| (transverse) | modes `service` et `project` du bloc `testimonials` (§4.3), mode `service` du bloc `projectsPreview` (§4.12) | ASSUMÉS sans usage seedé: capacité CMS offerte au client (les pages de détail composent en code avec leurs propres queries, le client peut s'en servir dans tout pageBuilder); la résolution GROQ de ces modes est couverte au Temps 2 (§12.8) |
| (transverse) | fils d'Ariane, libellés de routes | EXCLUS: `app/config/route-map.ts` (code), source unique partagée app + studio au Temps 2 |
| (transverse) | strings i18n `a11y.*`, `consent.*`, `ui.*` | EXCLUES: Nuxt i18n, hors Sanity (discipline 2) |
| (transverse) | gabarit de title, repli de description, repli og:image | `siteSettings.seo` (`titleSuffix`, `defaultDescription`, `defaultOgImage`); le repli code `/og/og-default.jpg` (`OG_FALLBACK_IMAGE`) reste en dernier recours (§12.10) |
| (transverse) | noindex | EXCLU: code (`usePageSeo`, nuxt.config) |

---

## 11. Convention d'ids déterministes (seed)

Le seed (pattern `nuxt-sanity-test/scripts/seed-fpo.mjs`: phases ordonnées par
dépendances de refs, `createOrReplace` idempotent par transaction) utilise:

| Type | Pattern d'id | Exemples |
|---|---|---|
| Singletons (9) | `<type>-<lang>` | `siteSettings-fr`, `homePage-en`, `onePager-fr` |
| Collections à slug | `<type>-<cleFR>-<lang>` où `cleFR` = slug FR canonique, IDENTIQUE pour les deux langues (le champ slug, lui, diffère par langue) | `service-cuisines-fr`, `service-cuisines-en`, `project-cuisine-st-bruno-fr`, `article-huile-ou-vernis-en`, `category-le-bois-fr` |
| `testimonial` | `testimonial-<id>-<lang>` (ids V1 conservés) | `testimonial-catherine-dufresne-fr` |
| `faqItem` | `faqItem-<id>-<lang>` (ids V1 conservés) | `faqItem-delai-fr`, `faqItem-garantie-en` |
| `faqTheme` | `faqTheme-<slugFR>-<lang>` (slug FR canonique, identique pour les deux langues) | `faqTheme-materiaux-fr`, `faqTheme-prix-et-paiement-en` |
| `legalPage` | `legalPage-<doc>-<lang>`, `doc` ∈ {`conditions`, `confidentialite`} | `legalPage-conditions-fr`, `legalPage-confidentialite-en` |

Dernière phase du seed: création des documents `translation.metadata` liant chaque
paire FR/EN (structure documentInternationalization v6: entries
`_type: 'internationalizedArrayReferenceValue'` avec `language` au niveau de l'entry,
refs `_weak: true` + `_strengthenOnPublish: { type: <schemaType> }`). Les 8 thèmes
FAQ (§6.17) ajoutent 8 paires de traduction à cette phase.

---

## 12. Notes Temps 2 (transformations à la résolution, hors schémas)

Ces transformations vivent dans la couche composable (signatures stables, composants
intacts) et dans la fermeture de `nuxt.config.ts`. Rien ici ne change les schémas.

1. **Portable Text → `RichTextEntry[]`**: le composable transforme `articleRichText.body`
   en `{ kind: 'paragraph' | 'heading' | 'list', text?, items? }` (les marks
   strong/em/link sont sérialisés dans le texte selon le rendu actuel du bloc).
2. **Numérotations synthétisées**: `service.n` (« S/01 » depuis la position
   `order asc`), `about.diffs[].n` (« 01 »), `process.steps[].n`: dérivées de l'index,
   jamais stockées.
3. **Mapping `_type`**: la couche composable traduit les `_type` Sanity (camelCase)
   vers les `_type` Vue (kebab-case) selon les tables §2.1 et §2.2 avant de retourner
   les `PageBlock[]` / `ArticleBlock[]` aux block-maps existants.
4. **Join contact**: les valeurs de `contact.meta` (téléphone, courriel, atelier,
   heures, avec `href` tel:/mailto:) sont assemblées depuis `siteSettings.contact` +
   les libellés `contact.metaLabels`; le jeton `{email}` de `errorBanner.body` est
   remplacé par `siteSettings.contact.email`.
5. **Résolution des liens et `useLinkResolver`**: `link` → `href` string via le
   route-map partagé (`app/config/route-map.ts`): internal → route du doc référencé,
   anchor → `#ancre` (ou `/route#ancre` si ref), external → URL telle quelle. Côté
   composants, le nouveau composable `app/composables/useLinkResolver.ts` (API
   calquée sur `nuxt-sanity-test/app/composables/useLinkResolver.ts`: `setLink(ref, targetLocale?)`
   pour une référence interne résolue (le `targetLocale` optionnel sert au
   lang-switcher pour bâtir l'URL de la version traduite), `linkHref(link)` pour un objet `link`,
   helpers par page) expose cette résolution: mince couche au-dessus du route-map
   (`ROUTES`, `DOC_ROUTES`), AUCUNE duplication du mapping; la couche transform
   utilise le composable ou partage les mêmes fonctions. Vérifié dans
   `app/config/route-map.ts`: les segments d'URL des hubs sont entièrement
   configurables par locale via `ROUTES` (`/services`, `/projets` vs `/projects`,
   `/a-propos` vs `/about`, `/blog`, `/faq`, `/contact`, segments légaux traduits)
   et via `DOC_ROUTES` pour les patterns de détail (`/projets/[slug]` vs
   `/projects/[slug]`, etc.). Les resolvers `mainDocuments`/`locations` du
   presentationTool se branchent sur le même route-map.
6. **Résolution des images**: `figure` → `{ ratio, src?, alt, label, caption }` avec
   `src` string (urlFor + hotspot), `figure.image` absent → `src` absent (placeholder).
   Art direction du héros home (D23, `<picture>` manuel) à exécuter ici.
   `figure.ratio` vide → ratio par défaut de l'usage, calé sur les valeurs V1
   dominantes: `heroHome.visual` 4/5, `heroHome.visualMobile` 4/3, `pageHero.image`
   2/1, `about.photo` 3/4, `mediaText.image` 4/5, `service.image` 4/3,
   `project.cover` 4/3, items de `project.gallery` 4/5, `article.cover` 16/9,
   `articleImage` et items d'`articleGallery` 4/3. Le seed stocke TOUJOURS le ratio
   V1 explicite: ces défauts ne servent qu'au contenu créé ensuite dans le Studio
   (les interfaces front exigent un `ratio` string, jamais `undefined`).
7. **Coutures de build**: `nuxt.config.ts` (PRERENDER_ROUTES + `assertBlogCollections`
   depuis une query GROQ exécutée au chargement de la config), `router.options.ts`
   (slugs de catégories), pages avec imports directs de consts (à faire passer par la
   couche d'assemblage).
8. **Résolution des blocs intelligents**: GROQ applique mode/limit/refs +
   `order asc` (services, testimonials, projectsPreview) et `date desc`
   (blogPreview); le bloc `faq` (sélection manuelle pure, §4.4) résout ses refs
   dans l'ordre de l'array; `pad` et l'exclusion contextuelle restent des
   paramètres code des pages de détail.
9. **Sélections dérivées des collections**: cartes (`articleCard`,
   `useBlogFilterOptions` avec compteurs, option « Tous », héros detail/article)
   continuent d'être synthétisées par les composables depuis les documents.
10. **Replis SEO des pages fixes et globaux**: le gabarit de titre vient du CMS:
    `siteSettings.seo.titleSuffix` est ajouté à la fin du titre de chaque page,
    sauf l'accueil et le one-pager qui portent leur titre complet (le code y
    neutralise le gabarit, `titleTemplate: null`, §6.2 et §6.9). `seo.title` vide →
    titre du héros; `seo.description` vide → texte d'amorce du héros (`hero.lead`),
    sinon `siteSettings.seo.defaultDescription` (repli global). Chaîne og:image:
    `seo.ogImage` de la page → `siteSettings.seo.defaultOgImage` (repli CMS global)
    → `/og/og-default.jpg` (repli code, dernier recours; le seed laisse
    `defaultOgImage` absent). Les autres options de `usePageSeo` (breadcrumbs, faq,
    localBusiness, webPageType, noindex) restent du code.
11. **Dates légales**: `legalPage.effective` et `updated` (type `date`, ISO) sont
    formatées en fr-CA au rendu (« 1er janvier 2026 »). Champ vide → l'assemblage
    fournit un jeton todo (`[date d'entrée en vigueur]` / `[date de dernière mise à
    jour]`) que le gabarit `legal-page/index.vue` rend encadré inline via la
    mécanique `inlineParts` actuelle (segments `[...]`), inchangée.
12. **Normalisation du footer**: `siteSettings.footer.utility` et `.pageLinks`
    vides ou absents → normalisés en `[]` par la couche composable (les interfaces
    front les exigent non optionnels). Les liens principaux du pied viennent de
    `footer.primary` (§6.1): le Footer ne lit plus `nav.multipage.primary`.
13. **Téléphone E.164 dérivé**: le format machine (liens `tel:`, Schema.org) n'est
    PAS stocké. La transform le dérive de `siteSettings.contact.phone`: retirer
    tout caractère non numérique, préfixer `+1` quand le résultat compte
    10 chiffres.
14. **Logo résolu en src**: `siteSettings.brand.logo` (asset image, SVG pour le
    démo) est résolu en `src` string par la transform (URL d'asset, sans hotspot
    ni recadrage), consommé par le Header et le Footer à la place du
    monogramme V1.
15. **useFaqByTheme via `faqPage.sections`**: le composable lit `faqPage.sections`
    et rend un groupe par section, dans l'ordre des sections. Mode `auto`: toutes
    les questions du thème, triées alphabétiquement sur `question` (comparaison
    locale de la langue du payload, `localeCompare` fr ou en); mode `manual`:
    l'ordre des refs `items`. L'ancre de thème n'est plus dérivée du libellé:
    c'est `faqTheme.slug` (§6.17).
16. **Copie de détail lue sur l'item**: `useServiceBlocks` et `useProjectBlocks`
    lisent la copie des pages de détail sur le DOCUMENT de collection lui-même
    (`service.detail`, `project.detail`, §6.10 et §6.11), plus sur les hubs: la
    query de détail rapporte le document complet, la composition code assemble
    les blocs avec cette copie. Chaque page de détail peut donc diverger du
    gabarit document par document.
