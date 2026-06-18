// Seed Sanity: articles FR, lot 1 de 2 (les 6 premiers du tableau ARTICLES de
// app/content/articles.ts, ordre antichronologique). Documents `article` complets:
// title, slug, excerpt, cover (figure, ratio V1 explicite), category (référence
// même langue quand présente), date, author, readingTime et body (7 types de blocs
// article). Pas de champ order: le tri se fait par date.
//
// Conversion du body V1 vers Sanity:
// - 'lead'       -> articleLead { text }
// - 'rich-text'  -> articleRichText { body: Portable Text }; paragraph -> block
//                   'normal', heading -> block 'h2', list -> un block par item
//                   (listItem 'bullet', level 1, style 'normal')
// - 'image'      -> articleImage { image: figure } (placeholders V1 sans src:
//                   champ image du figure OMIS, alt/label/caption/ratio gardés)
// - 'quote'      -> articleQuote { quote, attribution }
// - 'gallery'    -> articleGallery { images: [figures] }
// - 'callout'    -> articleCallout { tone, title, text }
// - 'inline-cta' -> articleInlineCta { text, cta: link } (href V1 -> référence interne)
//
// Les marqueurs { _imagePath } sont remplacés par le runner après upload des assets.

export const docs = [
  {
    _id: 'article-prix-du-sur-mesure-fr',
    _type: 'article',
    language: 'fr',
    title: 'Combien coûte le sur-mesure, vraiment',
    slug: { _type: 'slug', current: 'prix-du-sur-mesure' },
    excerpt: "Parler prix ne devrait pas être tabou. D'où vient le coût d'une pièce sur mesure, et pourquoi je donne des prix fermes.",
    cover: {
      _type: 'figure',
      image: { _imagePath: '/images/blog-prix.jpg' },
      alt: "Échantillons d'essences éventaillés sur une grande table de planification en bois massif, règle pliante et carnet ouvert.",
      label: 'Table de planification',
      caption: 'Consultation, 16:9',
      ratio: '16/9',
    },
    date: '2025-05-26',
    author: 'Maxime Cormier',
    readingTime: 6,
    body: [
      {
        _type: 'articleLead',
        _key: 'l1',
        text: "C'est la question que tout le monde a en tête au premier appel, et que personne n'ose poser en premier. Aussi bien y répondre franchement ici.",
      },
      {
        _type: 'articleRichText',
        _key: 'r1',
        body: [
          {
            _type: 'block',
            _key: 'r1-b1',
            style: 'normal',
            markDefs: [],
            children: [
              { _type: 'span', _key: 'span-1', text: "Le prix d'une pièce sur mesure vient de trois choses: la matière, le temps, la pose. La matière, c'est le bois, mais aussi son séchage, qui se paye: un frêne séché en chambre ne coûte pas le prix du frêne vert. Le temps d'atelier, lui, ne se compresse pas: un assemblage bien fait prend le temps qu'il prend, et c'est précisément ce que vous achetez.", marks: [] },
            ],
          },
          {
            _type: 'block',
            _key: 'r1-b2',
            style: 'normal',
            markDefs: [],
            children: [
              { _type: 'span', _key: 'span-1', text: "C'est pour ça que deux tables de même taille n'ont pas le même prix. L'essence, le type d'assemblage et la finition changent tout: un plateau de noyer à queues d'aronde, huilé main, et un plateau d'érable vissé puis verni n'habitent pas la même colonne de chiffres.", marks: [] },
            ],
          },
        ],
      },
      {
        _type: 'articleQuote',
        _key: 'q1',
        quote: 'Un prix ferme, c\'est moi qui porte le risque, pas vous.',
        attribution: 'Maxime Cormier',
      },
      {
        _type: 'articleRichText',
        _key: 'r2',
        body: [
          {
            _type: 'block',
            _key: 'r2-b1',
            style: 'h2',
            markDefs: [],
            children: [
              { _type: 'span', _key: 'span-1', text: 'Ce qui fait grimper la facture', marks: [] },
            ],
          },
          {
            _type: 'block',
            _key: 'r2-b2',
            style: 'normal',
            markDefs: [],
            children: [
              { _type: 'span', _key: 'span-1', text: "Les essences rares ou importées, les courbes (chaque pièce cintrée demande son gabarit), les intégrations électriques et l'éclairage encastré. Rien de mal là-dedans: il faut juste savoir que c'est là que les dollars s'en vont.", marks: [] },
            ],
          },
          {
            _type: 'block',
            _key: 'r2-b3',
            style: 'h2',
            markDefs: [],
            children: [
              { _type: 'span', _key: 'span-1', text: "Ce qui l'allège", marks: [] },
            ],
          },
          {
            _type: 'block',
            _key: 'r2-b4',
            style: 'normal',
            markDefs: [],
            children: [
              { _type: 'span', _key: 'span-1', text: "Des dimensions qui respectent les largeurs standard de planche, une finition huilée plutôt qu'un vernis multicouche, et des délais souples qui me laissent glisser votre projet entre deux gros chantiers. Si votre budget est serré, dites-le dès le départ: c'est souvent là qu'on trouve la marge.", marks: [] },
            ],
          },
        ],
      },
      {
        _type: 'articleCallout',
        _key: 'co1',
        tone: 'note',
        title: 'Le devis est gratuit, le non aussi',
        text: "Si le budget et le projet ne se rejoignent pas, je vous le dis à la première conversation, pas à la dernière. Vous ne payez rien pour l'apprendre, et vous repartez avec l'heure juste.",
      },
      {
        _type: 'articleInlineCta',
        _key: 'c1',
        text: "Envie d'un chiffre clair pour votre projet?",
        cta: {
          _type: 'link',
          label: 'Démarrer un projet',
          type: 'internal',
          internalRef: { _type: 'reference', _ref: 'contactPage-fr' },
        },
      },
    ],
  },
  {
    _id: 'article-reparer-plutot-que-remplacer-fr',
    _type: 'article',
    language: 'fr',
    title: 'Réparer plutôt que remplacer: quand ça vaut la peine',
    slug: { _type: 'slug', current: 'reparer-plutot-que-remplacer' },
    excerpt: "Une chaise branlante n'est pas une chaise finie. Ce qui se répare, ce qui ne se répare pas, et comment je tranche.",
    cover: {
      _type: 'figure',
      image: { _imagePath: '/images/blog-reparer.jpg' },
      alt: "Chaise ancienne en érable retournée sur l'établi, assemblages démontés, serres et pot de colle à portée de main.",
      label: "Chaise sur l'établi",
      caption: 'Atelier, 16:9',
      ratio: '16/9',
    },
    category: { _type: 'reference', _ref: 'category-entretien-fr' },
    date: '2025-04-28',
    author: 'Maxime Cormier',
    readingTime: 5,
    body: [
      {
        _type: 'articleLead',
        _key: 'l1',
        text: "Le réflexe moderne, c'est de jeter. Pourtant, un meuble en bois massif se répare presque toujours, et souvent pour moins cher qu'un remplacement de qualité égale.",
      },
      {
        _type: 'articleRichText',
        _key: 'r1',
        body: [
          {
            _type: 'block',
            _key: 'r1-b1',
            style: 'h2',
            markDefs: [],
            children: [
              { _type: 'span', _key: 'span-1', text: 'Ce qui se répare bien', marks: [] },
            ],
          },
          {
            _type: 'block',
            _key: 'r1-b2',
            style: 'normal',
            markDefs: [],
            children: [
              { _type: 'span', _key: 'span-1', text: "Les assemblages décollés, en premier: une chaise branlante, c'est de la colle qui a séché, pas une chaise finie. On démonte, on nettoie, on recolle, et l'assemblage repart pour des décennies. Les coulisses usées se remplacent, les finitions fatiguées se refont, les placages soulevés se recollent.", marks: [] },
            ],
          },
          {
            _type: 'block',
            _key: 'r1-b3',
            style: 'h2',
            markDefs: [],
            children: [
              { _type: 'span', _key: 'span-1', text: 'Ce qui condamne', marks: [] },
            ],
          },
          {
            _type: 'block',
            _key: 'r1-b4',
            style: 'normal',
            markDefs: [],
            children: [
              { _type: 'span', _key: 'span-1', text: "Les panneaux de particules gonflés d'eau: une fois que la poudre de bois a levé, rien ne la fait redescendre. Le bois pourri, qui n'a plus de structure à offrir. Et les meubles conçus pour ne pas durer, où chaque réparation en appelle trois autres.", marks: [] },
            ],
          },
        ],
      },
      {
        _type: 'articleQuote',
        _key: 'q1',
        quote: "Un meuble en bois massif n'est jamais fini tant que le bois est sain.",
        attribution: 'Maxime Cormier',
      },
      {
        // Placeholder V1 volontaire (pas de src): champ image omis.
        _type: 'articleImage',
        _key: 'i1',
        image: {
          _type: 'figure',
          alt: 'Chaise ancienne serrée dans les serres après recollage, la colle qui perle aux joints.',
          label: 'Recollage sous serres',
          caption: 'Atelier, 4:3',
          ratio: '4/3',
        },
      },
      {
        _type: 'articleCallout',
        _key: 'co1',
        tone: 'note',
        title: "Avant de m'appeler",
        text: "Trois vérifications à faire chez vous: le meuble est-il en bois massif ou en panneaux (regardez sous le plateau, la tranche ne ment pas)? Le bois est-il sain, sans pourriture ni gonflement? Les pièces sont-elles toutes là? Trois oui, et la réparation vaut presque toujours la peine.",
      },
      {
        _type: 'articleInlineCta',
        _key: 'c1',
        text: 'Un meuble de famille à remettre en service?',
        cta: {
          _type: 'link',
          label: 'Voir le service Restauration',
          type: 'internal',
          internalRef: { _type: 'reference', _ref: 'service-restauration-fr' },
        },
      },
    ],
  },
  {
    _id: 'article-erreurs-de-mesure-fr',
    _type: 'article',
    language: 'fr',
    title: 'Mesurer une vieille maison: les pièges qui coûtent cher',
    slug: { _type: 'slug', current: 'erreurs-de-mesure' },
    excerpt: "Rien n'est droit dans une maison d'avant-guerre. Les erreurs de relevé que je vois le plus souvent, et comment je les évite.",
    cover: {
      _type: 'figure',
      image: { _imagePath: '/images/blog-mesure.jpg' },
      alt: "Ruban à mesurer et niveau laser sur le rebord de fenêtre d'une vieille maison, fine ligne laser projetée sur un mur de plâtre.",
      label: 'Relevé de fenêtre',
      caption: 'Relevé, 16:9',
      ratio: '16/9',
    },
    category: { _type: 'reference', _ref: 'category-atelier-fr' },
    date: '2025-03-17',
    author: 'Maxime Cormier',
    readingTime: 4,
    body: [
      {
        _type: 'articleLead',
        _key: 'l1',
        text: "La pire erreur en sur mesure ne se fait pas à l'atelier: elle se fait au relevé. Un seize de pouce oublié au mauvais endroit devient un jour béant le matin de la pose.",
      },
      {
        _type: 'articleRichText',
        _key: 'r1',
        body: [
          {
            _type: 'block',
            _key: 'r1-b1',
            style: 'h2',
            markDefs: [],
            children: [
              { _type: 'span', _key: 'span-1', text: 'Les classiques', marks: [] },
            ],
          },
          {
            _type: 'block',
            _key: 'r1-b2',
            style: 'normal',
            listItem: 'bullet',
            level: 1,
            markDefs: [],
            children: [
              { _type: 'span', _key: 'span-1', text: "Mesurer un mur à un seul endroit, alors qu'il ventre au centre. Dans une maison d'avant-guerre, un mur peut varier d'un demi-pouce sur sa longueur.", marks: [] },
            ],
          },
          {
            _type: 'block',
            _key: 'r1-b3',
            style: 'normal',
            listItem: 'bullet',
            level: 1,
            markDefs: [],
            children: [
              { _type: 'span', _key: 'span-1', text: "Se fier aux plans d'origine. Ils décrivent la maison telle qu'elle a été dessinée, pas telle qu'elle a été bâtie, encore moins telle qu'elle a bougé depuis.", marks: [] },
            ],
          },
          {
            _type: 'block',
            _key: 'r1-b4',
            style: 'normal',
            listItem: 'bullet',
            level: 1,
            markDefs: [],
            children: [
              { _type: 'span', _key: 'span-1', text: "Oublier l'épaisseur des plinthes, des moulures et des cadrages, qui mangent l'espace au pied du mur.", marks: [] },
            ],
          },
          {
            _type: 'block',
            _key: 'r1-b5',
            style: 'normal',
            listItem: 'bullet',
            level: 1,
            markDefs: [],
            children: [
              { _type: 'span', _key: 'span-1', text: "Ignorer un plancher hors niveau. Le meuble sera d'aplomb, le plancher non, et tout l'écart se lit à l'œil sur la ligne du comptoir.", marks: [] },
            ],
          },
        ],
      },
      {
        // Placeholder V1 volontaire (pas de src): champ image omis.
        _type: 'articleImage',
        _key: 'i1',
        image: {
          _type: 'figure',
          alt: "Niveau laser au sol projetant sa ligne sur un mur de plâtre ancien, l'écart entre la ligne et le mur visible à l'œil.",
          label: 'La ligne qui dit la vérité',
          caption: 'Relevé, 4:3',
          ratio: '4/3',
        },
      },
      {
        _type: 'articleRichText',
        _key: 'r2',
        body: [
          {
            _type: 'block',
            _key: 'r2-b1',
            style: 'normal',
            markDefs: [],
            children: [
              { _type: 'span', _key: 'span-1', text: "Ma méthode est simple et non négociable: trois mesures par dimension, en haut, au centre, en bas, et je garde la plus défavorable. Relevé laser complet de la pièce, sorties électriques et plomberie comprises. Pour les recoins impossibles, un gabarit de carton taillé sur place vaut mieux que n'importe quel chiffre.", marks: [] },
            ],
          },
          {
            _type: 'block',
            _key: 'r2-b2',
            style: 'normal',
            markDefs: [],
            children: [
              { _type: 'span', _key: 'span-1', text: "Et surtout, la marge d'ajustement se prévoit dès le dessin: panneaux de remplissage, jeux calculés, pièces d'appoint scribées sur place. Rien n'est droit dans une vieille maison, et le meuble doit être conçu pour absorber cette vérité, pas pour la nier.", marks: [] },
            ],
          },
        ],
      },
      {
        _type: 'articleInlineCta',
        _key: 'c1',
        text: 'Un projet dans une maison qui a du vécu?',
        cta: {
          _type: 'link',
          label: 'Parlons-en',
          type: 'internal',
          internalRef: { _type: 'reference', _ref: 'contactPage-fr' },
        },
      },
    ],
  },
  {
    _id: 'article-commander-sur-mesure-fr',
    _type: 'article',
    language: 'fr',
    title: "À quoi s'attendre quand on commande sur mesure",
    slug: { _type: 'slug', current: 'commander-sur-mesure' },
    excerpt: "Délais, prix, allers-retours: le déroulement honnête d'un projet, pour que personne ne soit surpris.",
    cover: {
      _type: 'figure',
      image: { _imagePath: '/images/blog-commander.jpg' },
      alt: "Échantillons d'essences et deux tasses de café sur une table de consultation en bois massif.",
      label: 'Table de consultation',
      caption: 'Consultation, 16:9',
      ratio: '16/9',
    },
    date: '2025-02-10',
    author: 'Maxime Cormier',
    readingTime: 5,
    body: [
      {
        _type: 'articleLead',
        _key: 'l1',
        text: "Commander une pièce sur mesure, ce n'est pas comme acheter en magasin. C'est plus long, plus personnel, et le résultat vous ressemble. Voici à quoi vous attendre.",
      },
      {
        _type: 'articleRichText',
        _key: 'r1',
        body: [
          {
            _type: 'block',
            _key: 'r1-b1',
            style: 'normal',
            markDefs: [],
            children: [
              { _type: 'span', _key: 'span-1', text: "Tout commence par une conversation, gratuite et sans engagement. On parle de ce que vous voulez, de votre budget, et je vous dis franchement si je suis la bonne personne pour le projet.", marks: [] },
            ],
          },
          {
            _type: 'block',
            _key: 'r1-b2',
            style: 'normal',
            markDefs: [],
            children: [
              { _type: 'span', _key: 'span-1', text: "Ensuite vient le devis écrit: essences, dimensions, échéancier, prix ferme. Pas de surprise à la fin.", marks: [] },
            ],
          },
        ],
      },
      {
        _type: 'articleQuote',
        _key: 'q1',
        quote: "Je préfère vous dire non au début que vous décevoir à la fin. Si votre projet n'est pas pour moi, je vous le dirai.",
        attribution: 'Maxime Cormier',
      },
      {
        _type: 'articleRichText',
        _key: 'r2',
        body: [
          {
            _type: 'block',
            _key: 'r2-b1',
            style: 'h2',
            markDefs: [],
            children: [
              { _type: 'span', _key: 'span-1', text: 'Le rythme', marks: [] },
            ],
          },
          {
            _type: 'block',
            _key: 'r2-b2',
            style: 'normal',
            markDefs: [],
            children: [
              { _type: 'span', _key: 'span-1', text: "Un acompte lance la fabrication. Je vous tiens au courant aux étapes clés, parfois avec une photo de l'atelier. Puis je livre et j'installe. Le solde n'est dû qu'une fois la pièce en place et vous, satisfait.", marks: [] },
            ],
          },
        ],
      },
      {
        _type: 'articleInlineCta',
        _key: 'c1',
        text: 'Prêt à en discuter sans engagement?',
        cta: {
          _type: 'link',
          label: 'Démarrer un projet',
          type: 'internal',
          internalRef: { _type: 'reference', _ref: 'contactPage-fr' },
        },
      },
    ],
  },
  {
    _id: 'article-queue-d-aronde-fr',
    _type: 'article',
    language: 'fr',
    title: "La queue d'aronde, et pourquoi je m'entête",
    slug: { _type: 'slug', current: 'queue-d-aronde' },
    excerpt: "Un assemblage plus long à tailler que de poser deux vis. Voici ce qu'il achète, et pourquoi je refuse de l'abandonner.",
    cover: {
      _type: 'figure',
      image: { _imagePath: '/images/blog-dovetail.jpg' },
      alt: 'Sciage à la main d\'une planche serrée dans un étau, copeaux en suspension dans un atelier.',
      label: 'Sciage à la main',
      caption: 'Atelier, 16:9',
      ratio: '16/9',
    },
    category: { _type: 'reference', _ref: 'category-atelier-fr' },
    date: '2025-01-20',
    author: 'Maxime Cormier',
    readingTime: 6,
    body: [
      {
        _type: 'articleLead',
        _key: 'l1',
        text: "On me demande parfois pourquoi je passe une heure sur un assemblage qu'une équerre de métal ferait en deux minutes. Réponse courte: parce que ça tient cent ans.",
      },
      {
        _type: 'articleRichText',
        _key: 'r1',
        body: [
          {
            _type: 'block',
            _key: 'r1-b1',
            style: 'normal',
            markDefs: [],
            children: [
              { _type: 'span', _key: 'span-1', text: "La queue d'aronde, ce sont ces dents en éventail qu'on voit aux coins des tiroirs anciens. Leur forme fait que l'assemblage se verrouille mécaniquement: plus on tire, plus il serre.", marks: [] },
            ],
          },
          {
            _type: 'block',
            _key: 'r1-b2',
            style: 'h2',
            markDefs: [],
            children: [
              { _type: 'span', _key: 'span-1', text: 'Ce que ça remplace', marks: [] },
            ],
          },
          {
            _type: 'block',
            _key: 'r1-b3',
            style: 'normal',
            listItem: 'bullet',
            level: 1,
            markDefs: [],
            children: [
              { _type: 'span', _key: 'span-1', text: 'Aucune vis, donc rien qui rouille ou se desserre.', marks: [] },
            ],
          },
          {
            _type: 'block',
            _key: 'r1-b4',
            style: 'normal',
            listItem: 'bullet',
            level: 1,
            markDefs: [],
            children: [
              { _type: 'span', _key: 'span-1', text: "Aucune colle structurelle indispensable: l'assemblage tient seul.", marks: [] },
            ],
          },
          {
            _type: 'block',
            _key: 'r1-b5',
            style: 'normal',
            listItem: 'bullet',
            level: 1,
            markDefs: [],
            children: [
              { _type: 'span', _key: 'span-1', text: 'Une réparabilité totale dans cinquante ans.', marks: [] },
            ],
          },
        ],
      },
      {
        _type: 'articleImage',
        _key: 'i1',
        image: {
          _type: 'figure',
          image: { _imagePath: '/images/blog-aronde-tiroir.jpg' },
          alt: "Tiroir assemblé à queues d'aronde, vu de coin.",
          label: 'Tiroir assemblé',
          caption: 'Détail, 4:3',
          ratio: '4/3',
        },
      },
      {
        _type: 'articleRichText',
        _key: 'r2',
        body: [
          {
            _type: 'block',
            _key: 'r2-b1',
            style: 'normal',
            markDefs: [],
            children: [
              { _type: 'span', _key: 'span-1', text: "Est-ce que le client voit la différence au premier coup d'œil? Pas toujours. Est-ce qu'il la sentira en ouvrant le tiroir dans vingt ans? Chaque fois.", marks: [] },
            ],
          },
        ],
      },
      {
        _type: 'articleGallery',
        _key: 'g1',
        images: [
          {
            _type: 'figure',
            _key: 'tracage',
            image: { _imagePath: '/images/blog-aronde-tracage.jpg' },
            alt: "Traçage des queues d'aronde au trusquin.",
            label: 'Traçage',
            caption: 'Étape 1, 4:5',
            ratio: '4/5',
          },
          {
            _type: 'figure',
            _key: 'decoupe',
            image: { _imagePath: '/images/blog-aronde-decoupe.jpg' },
            alt: 'Découpe à la scie à dos.',
            label: 'Découpe',
            caption: 'Étape 2, 4:5',
            ratio: '4/5',
          },
          {
            _type: 'figure',
            _key: 'ajustement',
            image: { _imagePath: '/images/blog-aronde-ajustement.jpg' },
            alt: 'Ajustement final au ciseau.',
            label: 'Ajustement',
            caption: 'Étape 3, 4:5',
            ratio: '4/5',
          },
        ],
      },
    ],
  },
  {
    _id: 'article-choisir-essence-bois-fr',
    _type: 'article',
    language: 'fr',
    title: "Frêne, érable ou noyer: comment je choisis l'essence",
    slug: { _type: 'slug', current: 'choisir-essence-bois' },
    excerpt: "Le choix du bois n'est pas qu'une question de couleur. Voici ce que je regarde avant de débiter la première planche.",
    cover: {
      _type: 'figure',
      image: { _imagePath: '/images/blog-kitchen-plan.jpg' },
      alt: 'Mains traçant un repère au crayon sur une planche de bois clair, copeaux de rabotage autour.',
      label: 'Traçage au crayon',
      caption: 'Atelier, 16:9',
      ratio: '16/9',
    },
    category: { _type: 'reference', _ref: 'category-le-bois-fr' },
    date: '2024-11-12',
    author: 'Maxime Cormier',
    readingTime: 5,
    body: [
      {
        _type: 'articleLead',
        _key: 'l1',
        text: "Quand un client me dit « je veux du bois pâle », je sais qu'on a encore du travail. Le pâle, ça va du frêne nerveux à l'érable laiteux, et ces deux-là ne se comportent pas pareil.",
      },
      {
        _type: 'articleRichText',
        _key: 'r1',
        body: [
          {
            _type: 'block',
            _key: 'r1-b1',
            style: 'normal',
            markDefs: [],
            children: [
              { _type: 'span', _key: 'span-1', text: "Avant de penser à la teinte, je regarde trois choses: la dureté, la stabilité, et la façon dont l'essence vieillit. Une table de cuisine et une bibliothèque ne demandent pas les mêmes compromis.", marks: [] },
            ],
          },
          {
            _type: 'block',
            _key: 'r1-b2',
            style: 'h2',
            markDefs: [],
            children: [
              { _type: 'span', _key: 'span-1', text: "La dureté, pour l'usage", marks: [] },
            ],
          },
          {
            _type: 'block',
            _key: 'r1-b3',
            style: 'normal',
            markDefs: [],
            children: [
              { _type: 'span', _key: 'span-1', text: "L'érable et le chêne encaissent les chocs du quotidien. Le noyer, plus tendre, marque davantage, mais sa patine pardonne ces marques mieux qu'un bois clair. Pour un plan de travail, je pousse vers les essences dures.", marks: [] },
            ],
          },
        ],
      },
      {
        _type: 'articleImage',
        _key: 'i1',
        image: {
          _type: 'figure',
          image: { _imagePath: '/images/blog-essence-veinage.jpg' },
          alt: "Gros plan sur le veinage d'une planche de frêne fraîchement rabotée.",
          label: 'Veinage du frêne',
          caption: 'Frêne raboté, 4:3',
          ratio: '4/3',
        },
      },
      {
        _type: 'articleQuote',
        _key: 'q1',
        quote: "Le meilleur bois pour votre projet, c'est rarement le plus cher. C'est celui qui va bien vieillir à l'usage que vous en ferez.",
        attribution: 'Maxime Cormier',
      },
      {
        _type: 'articleRichText',
        _key: 'r2',
        body: [
          {
            _type: 'block',
            _key: 'r2-b1',
            style: 'h2',
            markDefs: [],
            children: [
              { _type: 'span', _key: 'span-1', text: 'La stabilité, pour la durée', marks: [] },
            ],
          },
          {
            _type: 'block',
            _key: 'r2-b2',
            style: 'normal',
            markDefs: [],
            children: [
              { _type: 'span', _key: 'span-1', text: "Tous les bois bougent avec l'humidité. Le merisier et le noyer bougent peu une fois bien séchés; certaines coupes de chêne bougent beaucoup. Je choisis l'essence ET la coupe en fonction de la pièce.", marks: [] },
            ],
          },
        ],
      },
      {
        _type: 'articleInlineCta',
        _key: 'c1',
        text: "Un projet en tête mais pas sûr de l'essence?",
        cta: {
          _type: 'link',
          label: 'Parlons-en',
          type: 'internal',
          internalRef: { _type: 'reference', _ref: 'contactPage-fr' },
        },
      },
    ],
  },
]
