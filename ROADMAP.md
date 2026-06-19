# ROADMAP — webforge-ancree

Point de départ: **canvas Nuxt minimal** (reset au 19 juin 2026). Tout le travail de famille est devant.

## Reconstruction (prompt à venir)

- **Langage de design Ancrée**: établir une direction distincte de Minimaliste (dispositions, typographie, mouvement, palette). À tracher avec Charles. Voir [DESIGN.md](./DESIGN.md).
- **Architecture Sanity**: repenser au complet les schémas (documents, objets, blocs, internationalisation des documents). Le dataset `5if00rwn`/`production` est vide.
- **Bibliothèque de blocs**: nouveaux blocs et nouvelles dispositions propres à la famille.
- **Contenu de démo**: définir la démo d'Ancrée (métier de service local) et la seeder.
- **Preview / visual editing**: recâbler le mode preview Sanity (retiré au reset) quand le contenu existe.

## Déploiement (indépendant)

- Config `wrangler` prête (workers `webforge-ancree` / `-staging` / `-preview`, domaines `*.patoinestudio.ca`, `noindex`). Création des Workers Cloudflare: geste manuel de tableau de bord, à faire quand le site a du contenu.

## Disciplines à tenir (voir CLAUDE.md)

Aucune valeur design en dur, aucun texte d'interface en dur (i18n), aucun contenu en dur (Sanity). Jamais de numérotation.
