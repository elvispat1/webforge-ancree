# webforge-ancree

Famille de design **Ancrée** (WebForge, Patoine Studio). Nuxt 4 statique généré, déployé sur Cloudflare Workers.

**État: canvas vierge** (reset au 19 juin 2026). Seules la fondation technique et l'identité d'Ancrée subsistent; le design, les blocs, l'architecture Sanity et le contenu sont à rebâtir. Détails dans [CLAUDE.md](./CLAUDE.md), chantiers dans [ROADMAP.md](./ROADMAP.md).

## Démarrer

```bash
nvm use            # Node verrouillé par .nvmrc
yarn install
yarn dev           # app sur http://localhost:3000
yarn generate      # build statique -> .output/public
```

Le Studio Sanity vit dans `studio/` (workspace yarn):

```bash
yarn studio:dev    # Studio sur http://localhost:3333
```

## Structure

```
webforge-ancree/
├── app/              # srcDir Nuxt (coquille minimale: app.vue, layouts, pages, tokens)
├── i18n/             # locales fr / en
├── studio/           # Studio Sanity (schémas vides pour l'instant)
├── public/           # favicons
├── nuxt.config.ts    # modules + identité Ancrée
├── wrangler*.jsonc   # Workers Cloudflare (prod / preview)
└── package.json
```
