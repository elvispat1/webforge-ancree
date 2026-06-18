# DESIGN.md, famille WebForge Ancrée

> Version 1, 18 juin 2026. Peau de la deuxième famille WebForge, **Ancrée**, destinée aux métiers de service local grand public (premier cas, une démo fictive d'extermination). Base bleu-confiance actée, cohérente avec le logo de Combat Extermination (vrai client) et avec la recherche, jamais copiée : la démo reste une compagnie fictive. À déposer comme `DESIGN.md` à la racine du repo `webforge-ancree`.

## Intention

Une famille pour les PME de service local que le client cherche en situation de besoin ou d'urgence et qu'il veut joindre tout de suite : extermination, lavage de vitres, plomberie, CVAC, déneigement, ramonage. Le site est une machine à inspirer confiance et à faire sonner le téléphone. Parti pris visuel : chaleureux, accessible, rassurant et humain, mais propre et professionnel. La ligne de crête à tenir : de la chaleur sans jamais glisser vers le cheap ni la mascotte.

On se démarque du WordPress d'exterminateur typique (chargé, daté, carrousels, stock) par la retenue, la clarté et la confiance mise en avant.

## Principes directeurs

1. Une seule tâche par écran. Au-dessus de la ligne de flottaison : quel service, quelle zone, comment appeler.
2. Le téléphone est le héros. Click-to-call partout, barre d'appel collante sur mobile.
3. La confiance est montrée, pas affirmée : avis Google, licence et assurance, garantie, années d'expérience, vraies photos.
4. La chaleur passe par la couleur, la photo et le ton, jamais par un personnage dessiné.
5. Rapidité : LCP sous 2,5 s sur mobile, c'est un multiplicateur de conversion.

## Palette (recommandée)

Base de confiance bleue (cohérente avec l'identité de Combat et avec le standard du créneau), réchauffée par un crème et un accent ambré.

- `--bg-base` crème chaud `#F5F0E8` (jamais de blanc pur en grand fond, stérile et clinique)
- `--bg-alt` `#FBF8F2`
- `--text-base` bleu nuit `#16243F` (plus chaud qu'un noir pur)
- `--text-muted` ardoise `#5C6678`
- `--accent-1` bleu confiance `#1E6FB0` (rappel du logo, liens et éléments de marque)
- `--accent-warm` ambre `#FBBF24` (boutons d'appel, à petite dose, texte foncé dessus)
- `--error` rouge réservé au micro-signal d'erreur seulement

Garde-fous : un seul accent chaud à fort niveau, bleu en masse pour porter la confiance, crème en fond, rouge banni du branding (il réactive le registre poison et danger qu'on veut désamorcer). Contrastes à valider en WCAG AA au moment de figer.

**Variante éco** (à dégainer pour un client pest-control qui veut l'angle « sûr pour la famille et les animaux ») : remplacer `--accent-1` par un sauge ou forest `#5E8C61`, garder le crème et l'ambre. C'est le différenciateur le plus fort selon la recherche, mais plus spécifique au métier ; gardé en variante plutôt qu'en base pour que la famille reste universelle.

## Typographie

- `--font-display` Plus Jakarta Sans (titres) : chaleur géométrique, moderne sans être froid.
- `--font-body` Source Sans 3 (corps) : ultra-lisible, signal de confiance institutionnel.
- Option « âme artisanale » : Fraunces en display si on veut un caractère plus métier.
- Sans-serifs humanistes seulement. À bannir : Comic Sans (le piège du « amical » mal compris), Poppins et Montserrat en masse (overusés).

## Formes et matière

- Rayons doux, arrondis mais pas bulle : `--radius` autour de 10 px. C'est une signature qui contraste nettement avec le 2 px tranchant de Minimaliste.
- Ombres subtiles, jamais lourdes. Aucun gradient criard, aucun effet 3D ou glossy.
- Whitespace généreux et délibéré, qui guide l'oeil vers une seule chose par section.

## Imagerie

- L'humain en vraie photo : technicien souriant en uniforme près du camion brandé, équipe alignée, crew en pleine job, avant et après. Présenter les techs par leur nom.
- Le problème et le process en icônes line-art sobres : les nuisibles (fourmi, souris, coquerelle) en pictos propres plutôt qu'en macros répugnantes, les étapes (inspection, traitement, suivi, garantie) en icônes simples.
- À bannir : stock cliché (poignée de main souriante), gros plans alarmants d'insectes en héros, font icons dépassées.

## Composants de conversion gravés dans la famille

À ajouter au catalogue de blocs, réutilisables par tout client de la famille :

- Header collant avec numéro `tel:` toujours visible.
- Barre d'appel collante en bas sur mobile (cible tactile 48 px minimum).
- Héros « service + ville + bénéfice », bouton d'appel, trois chips de confiance (note Google, licence, années), une vraie photo du crew.
- Barre de confiance sous le header : licencié et assuré, avis Google, garantie.
- Formulaire de soumission à 3 champs (nom, téléphone, type de service), jamais plus de 5.
- Chips de réassurance : même jour, 24/7, estimation gratuite, prix ferme.
- Bloc zone de service.
- Galerie avant et après.

## Ton éditorial

Direct, humain, rassurant, local. Franc et affirmé (« on règle ton problème »), sans agressivité ni alarme. On parle au client, pas à un jury de design.

## Décisions actées

- Nom de la famille : **Ancrée** (solide, enracinée, locale, fiable ; se tient à côté de Minimaliste et Cinématique).
- Palette de base : bleu-confiance, universelle et cohérente avec le logo. La variante éco-sauge reste disponible pour un client pest-control qui veut l'angle « sûr pour la famille et les animaux ».
- La démo est une compagnie fictive d'extermination québécoise, à nommer au moment de bâtir, distincte de Combat (le vrai client) et de toute vraie entreprise.
