# Suivi de construction, famille WebForge Ancrée

> Compte rendu du run autonome de construction de la deuxième famille de design
> WebForge (Ancrée) et de sa première démo, Rempart Extermination. Rédigé pour que
> Charles revienne, lise, regarde le site et commente. 18 juin 2026.

## 1. Résumé en une page

La famille **Ancrée** est en place et la démo **Rempart Extermination** est
**complète, bâtie et navigable en local**. Le scaffold de Minimaliste a été repris
à l'identique (structure, plomberie, contrats de blocs, Sanity, i18n, déploiement)
et seule la PEAU a changé, conformément à `DESIGN.md` et à `SQUELETTE-FAMILLE.md`.

- **Build de contrôle VERT**: `yarn generate` passe, **65 routes** prérendues
  bilingues (fr à la racine, en sous `/en`), **0 erreur**, 151 routes au total
  (pages + sitemaps + variantes d'images).
- **9 commits atomiques** conventionnels, lisibles en diff étape par étape.
- **Sanity** branché: project `5if00rwn`, schéma déployé, **159 documents** seedés
  (fr + en) avec paires de traduction, 3 images réelles uploadées.
- **Peau Ancrée** appliquée: crème/bleu nuit/bleu confiance/ambre, Plus Jakarta
  Sans + Source Sans 3, rayons 10 px, ombres douces, motion accordée. Contrastes
  WCAG AA vérifiés.
- **Blocs de conversion** de la famille ajoutés et câblés de bout en bout.
- **Déploiement**: config Cloudflare prête et vérifiée; reste la création des
  Workers (geste de tableau de bord, voir §6).

Vérifié au rendu (captures desktop + mobile pendant le run): l'accueil, les chips
de confiance, les blocs de conversion, la galerie avant/après et la barre d'appel
mobile sont conformes.

## 2. Décisions prises en autonomie

Aucune validation n'a été demandée (mode autonome). Voici toutes les décisions
structurantes, à revoir au besoin.

### 2.1 La compagnie fictive
- **Nom: Rempart Extermination.** Évoque la protection, la solidité, l'enracinement
  (« Ancrée »), sans le registre alarmiste poison/danger. Mot français réel,
  crédible pour une PME locale. **Distincte de Combat** (le vrai client) et de
  toute vraie entreprise.
- **Lieu: Lévis, QC** (Rive-Sud de Québec, Chaudière-Appalaches). Choisi
  délibérément DIFFÉRENT de la Montérégie d'Atelier Cormier et de la région de
  Combat, pour une démarcation géographique nette.
- **Fondée 2011** (« 15 ans » en 2026), indicatif **418**, téléphone fictif
  **418 555 0147**, domaine **rempartextermination.ca**, note Google fictive
  **4,9 (312 avis)**, fondateur fictif **Mathieu Bouchard** + équipe de six
  technicien·nes nommé·es. Tous les faits vivent dans la bible
  `docs/CONTENU-DEMO-REMPART.md`.

### 2.2 La peau (DESIGN.md)
- **Palette de base bleu-confiance** retenue (pas la variante éco-sauge, gardée
  disponible: elle ne change que `--accent-1` dans `app/brand/tokens.css`). Crème
  `#F5F0E8`, encre bleu nuit `#16243F`, ardoise `#5C6678`, accent bleu `#1E6FB0`,
  ambre `#FBBF24` réservé aux appels. Rouge banni du branding.
- **Contrastes WCAG AA** validés et documentés dans `app/brand/tokens.css` (encre
  13:1, ardoise 5,1:1, bleu lien 4,7:1, blanc/bleu 5,3:1, encre/ambre 9,3:1).
- **Deux fontes**: Plus Jakarta Sans (display, titres en 600-700, tracking adouci)
  + Source Sans 3 (corps, interlignage aéré). JetBrains Mono conservé pour la
  vitrine de style seulement.
- **Géométrie**: `--radius` à 10 px (vs 2 px Minimaliste), `--radius-lg` 16 px,
  `--radius-pill` pour les chips. Ombres douces teintées bleu nuit
  (`--shadow-sm/md/lg`) sur boutons, header collant, cartes image et témoignages.
- **Bouton d'appel ambre**: modifier `.wf-btn-call`, l'unique accent chaud à fort
  niveau.
- **Motion** (`motion.ts`): apparitions plus amples et plus lentes, cascade plus
  espacée, parallaxe un brin plus inerte. Accordée, pas réinventée (le polish fin
  est réservé à Charles).

### 2.3 Le téléphone est le héros (chrome de conversion)
- **Header collant** avec bouton d'appel ambre + numéro `tel:` **toujours
  visible**. Sur mobile, le bouton passe en icône seule (la place manque) et le
  numéro complet reste visible via la barre d'appel et le héros.
- **Barre d'appel collante** en bas sur mobile (`CallBar`), pleine largeur, cible
  tactile ≥ 48 px, zone sûre iOS respectée, pilotée par `@container site`.
- **Héros d'accueil** reskinné en « service + ville + bénéfice »: bouton d'appel
  ambre (CTA primaire `tel:`), 3 chips de confiance (note Google, licence, années,
  avec icône), photo réelle du technicien.

### 2.4 Quatre blocs de conversion ajoutés à la famille
Câblés sur toutes les couches (contenu, types, GROQ, transform, block-map, schéma
Studio, catalogue vitrine, CSS par tokens), bilingues, pilotés par Sanity:
- `reassurance`: chips (le jour même, urgence 24/7, estimation gratuite, prix ferme).
- `serviceArea`: bloc zone de service (Rive-Sud de Québec).
- `beforeAfter`: galerie avant/après (paires badgées « Avant »/« Après »).
- `quoteForm`: formulaire de soumission à 3 champs (nom, téléphone, type de
  problème), simulé côté client comme le bloc contact de la démo.
- **Barre de confiance** sous le header: livrée comme chips de confiance DANS le
  héros (note Google, licence, garantie). Voir §6 pour la variante bande dédiée.

### 2.5 Contenu et placement
- Composition des pages calquée sur Minimaliste, contenu Rempart. L'**accueil**
  présente les quatre nouveaux blocs (vitrine de conversion); services,
  interventions et one-pager portent les blocs pertinents.
- Volume: 5 services, 5 interventions avant/après, 6 témoignages, 3 catégories,
  8 thèmes FAQ, 9 questions, 6 articles, 2 pages légales. Slugs traduits par langue
  (`extermination-fourmis` / `ant-control`, etc.).
- « Projets » renommés **« Interventions »** dans la nav (études de cas avant/après),
  plus parlant pour le métier.

### 2.6 Images (set curé)
- **3 photos générées** (nano banana, Gemini 3 Pro Image), alignées DESIGN.md
  (chaleureux, pro, humain, local; AUCUN gros plan d'insecte alarmant): héros
  (technicien + camion), équipe (six technicien·nes), inspection (pourtour de
  maison). Câblées aux surfaces à plus forte valeur (héros accueil + À propos +
  portrait fondateur + bloc story).
- Le **reste des figures** (services, interventions, galerie avant/après, articles)
  reste en **placeholders soignés** du composant `<Image>`, conformément à la
  convention WebForge (set curé haute valeur, build navigable). Les nuisibles et
  les étapes restent en **icônes line-art lucide** (jamais de macro répugnante).

### 2.7 Hypothèses
- `siteSettings.brand.logo` omis → **repli wordmark texte** « Rempart Extermination »
  (Plus Jakarta Sans, propre). Un vrai lockup SVG pourra être ajouté.
- Le formulaire de soumission est **simulé côté client** (succès au submit), comme
  le bloc contact de la démo (statique pur, `contactDemo`).
- `theme-color` = bleu confiance `#1E6FB0`.

## 3. Ce qui est fait, par étape de la mission

1. **Scaffold**: établi à l'identique depuis `webforge-minimaliste` (sans contenu
   Atelier Cormier ni historique git), identités gravées. App démarre, build vert.
   Branches `staging` et `preview` créées.
2. **Peau Ancrée**: tokens marque + famille, fontes, typographie, ombres, motion,
   reskin des surfaces (boutons, header, cartes, témoignages, chips).
3. **Blocs de conversion**: les 4 nouveaux blocs + chrome (header, barre d'appel,
   héros).
4. **Sanity**: project `5if00rwn` identifié via MCP et gravé; schéma (existant +
   nouveaux blocs) déployé; seed bilingue de la démo.
5. **Démo fictive**: Rempart Extermination, contenu réaliste (services, zone,
   témoignages, FAQ, articles). Vitrine `/showcase` héritée (voir §6 pour le
   rebranding restant de ses échantillons).
6. **Images**: set curé généré et branché (§2.6).
7. **Déploiement**: config prête, branches poussées, étapes CF documentées (§6).

## 4. Build de contrôle

- Outils: Node **24.16.0** (`.nvmrc`), yarn **4.13.0**, même système que Minimaliste.
- `yarn install --immutable`: OK. `nuxt prepare` (postinstall): OK contre `5if00rwn`.
- `yarn generate`: **VERT**, 0 erreur, **65 pages** prérendues (fr + en), 151 routes
  au total. Aucune 404 silencieuse (le check de liens interne passe: 0/65 en échec).
- `node --check` + import de contrôle sur les 10 fichiers seed: OK. Intégrité des
  références vérifiée (106 docs de contenu, 0 référence pendante, paires fr/en
  complètes).
- Typecheck pur TS (types + transform) vert côté agent (exhaustivité `assertNever`
  confirmée). `typeCheck` reste à `false` au build (comme Minimaliste).

**Piège noté**: le build fetche Sanity via le CDN (`useCdn: true`). Après un reseed
d'images, **rebâtir** (lag de propagation du CDN, sinon le héros rend son
placeholder le temps que le CDN rattrape).

## 5. Comment regarder le site en local

```
nvm use                       # Node 24.16
yarn install
yarn generate                 # build statique (.output/public)
npx serve .output/public      # ou: config preview .claude/launch.json « ancree-static »
# Studio Sanity:
yarn studio:dev               # http://localhost:3333 (project 5if00rwn)
```

## 6. Ce qui reste (polish et déploiement)

### Création des Workers Cloudflare (geste de tableau de bord, Charles)
Le MCP Cloudflare est en lecture seule côté déploiement: créer les Workers reste
manuel. Suivre `docs/DEPLOY-CLOUDFLARE.md` (déjà adapté aux noms d'Ancrée). En bref,
le même modèle qu'Ancrée hérite de Minimaliste: un Worker par environnement.
1. **Prod**: Worker `webforge-ancree`, repo `elvispat1/webforge-ancree`, branche
   `main`, build `corepack enable && yarn install --immutable && yarn generate`,
   sortie `.output/public`, config `wrangler.jsonc`, domaine
   `webforge-ancree.patoinestudio.ca`, workers.dev coupé, variable
   `NUXT_PUBLIC_SITE_URL=https://webforge-ancree.patoinestudio.ca`.
2. **Staging**: même config, branche `staging`, déployé sous
   `--name webforge-ancree-staging`, domaine `…-staging.patoinestudio.ca`.
3. **Preview SSR**: Worker `webforge-ancree-preview`, branche `preview`, build
   `… && yarn build`, config `wrangler.preview.jsonc`, `nodejs_compat`, les TROIS
   variables (`SANITY_API_READ_TOKEN` Viewer, `NUXT_PUBLIC_STUDIO_URL`,
   `NUXT_PUBLIC_SITE_URL`), domaine `…-preview.patoinestudio.ca`.
4. **Studio** (scriptable): `yarn studio:deploy` (figera `deployment.appId` au 1er
   deploy) → `webforge-ancree.sanity.studio`. Puis CORS de l'origine preview (MCP
   Sanity) et webhook Sanity → Deploy Hook (rebuild prod à la publication).

### Polish créatif (réservé à Charles, DESIGN.md le prévoit)
- **Animations fines**: la motion a été accordée (durées, distances, cascade) mais
  pas chorégraphiée. Entrées de blocs, micro-interactions des chips et du bouton
  d'appel, transitions de la galerie avant/après: à fignoler ensemble.
- **Galerie avant/après**: les paires sont en placeholders. À remplacer par de
  vraies paires avant/après tasteful (sans macro d'insecte), idéalement un
  slider/comparateur.
- **Set d'images élargi**: covers de services et d'interventions, portraits
  individuels des techs, couvertures d'articles, et un **lockup SVG** de marque
  (le wordmark texte tient pour l'instant).
- **Variante « barre de confiance » dédiée** sous le header (bande mince licencié/
  assuré · avis Google · garantie): livrée pour l'instant comme chips dans le héros;
  une bande de chrome distincte est triviale à ajouter (composant `TrustBar` lisant
  `siteSettings`).
- **Variante éco-sauge**: un seul token (`--accent-1`) à basculer pour un client
  pest-control « sûr pour la famille et les animaux ».
- **Vitrine `/showcase`**: les blocs réels viennent de Sanity (déjà Rempart). Restent
  4 échantillons i18n (`showcase.samples.*`: media-text, cta-band, iframe,
  video-youtube) et quelques chaînes de styleguide encore rédigées pour Atelier
  Cormier (ébénisterie). Surface `noindex`, secondaire; à rebrander à Rempart.
- **`CLAUDE.md` / `ROADMAP.md`**: conservés comme référence Minimaliste; à réécrire
  pour Ancrée quand le pattern de famille se stabilise.

### Vérifications de discipline (toutes tenues)
- Aucune valeur design en dur (tout par tokens). Aucun texte d'interface en dur
  (i18n `a11y.*` / `ui.*`, parité fr/en). Aucun contenu en dur (Sanity). `alt`
  toujours présent (vide au pire), validation Studio en avertissement. Blog: articles
  et archives indexés, pagination `noindex`. Robots d'IA non bloqués. Typo des
  commits/docs sans tiret cadratin ni middle dot.
