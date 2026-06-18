// Seed FR: banques (témoignages, thèmes FAQ, FAQ) et pages légales.
//
// Transcrit depuis app/content/testimonials.ts, app/content/faq.ts et
// app/content/legal.ts (V1). Ids déterministes selon la convention de la spec
// (docs/SANITY-SCHEMA-SPEC.md, section 11). Les thèmes FAQ deviennent des
// documents faqTheme (un par valeur distincte de FaqItem.theme V1, spec 6.17),
// référencés par les faqItem; le champ order V1 disparaît (l'ordre appartient
// aux consommateurs, spec 6.15). Les dates des pages légales
// (effective, updated) sont OMISES: le seed n'invente aucune date, le champ
// vide porte la sémantique « à remplir par le client » (spec, section 6.16).

export const docs = [
  // ── Témoignages (banque, 6 documents) ─────────────────────────────────────
  {
    _id: 'testimonial-catherine-dufresne-fr',
    _type: 'testimonial',
    language: 'fr',
    quote: 'Refait notre cuisine en frêne en 2022. Trois ans plus tard, les portes ne bougent toujours pas. Le travail parle de lui-même.',
    name: 'Catherine Dufresne',
    context: 'Cuisine complète, Saint-Mathias-sur-Richelieu',
    service: { _type: 'reference', _ref: 'service-cuisines-fr' },
    project: { _type: 'reference', _ref: 'project-cuisine-frene-saint-mathias-fr' },
    featured: true,
    order: 1
  },
  {
    _id: 'testimonial-jean-philippe-rousseau-fr',
    _type: 'testimonial',
    language: 'fr',
    quote: "Une table de huit places en noyer pour les soixante-dix ans de mon père. Livrée trois mois après le premier croquis, exactement comme convenu.",
    name: 'Jean-Philippe Rousseau',
    context: 'Table de salle à manger, Chambly',
    service: { _type: 'reference', _ref: 'service-mobilier-fr' },
    project: { _type: 'reference', _ref: 'project-table-noyer-chambly-fr' },
    featured: true,
    order: 2
  },
  {
    _id: 'testimonial-marie-helene-belanger-fr',
    _type: 'testimonial',
    language: 'fr',
    quote: "J'avais hérité d'une commode de ma grand-mère qui se défaisait. Maxime l'a remise en état sans en effacer l'histoire.",
    name: 'Marie-Hélène Bélanger',
    context: 'Restauration, Carignan',
    service: { _type: 'reference', _ref: 'service-restauration-fr' },
    project: { _type: 'reference', _ref: 'project-commode-restauration-carignan-fr' },
    featured: true,
    order: 3
  },
  {
    _id: 'testimonial-sophie-tremblay-fr',
    _type: 'testimonial',
    language: 'fr',
    quote: "La bibliothèque suit le mur croche de notre vieux salon au millimètre. On dirait qu'elle a été bâtie avec la maison en 1910.",
    name: 'Sophie Tremblay',
    context: 'Bibliothèque intégrée, Longueuil',
    service: { _type: 'reference', _ref: 'service-bibliotheques-fr' },
    project: { _type: 'reference', _ref: 'project-bibliotheque-merisier-longueuil-fr' },
    featured: false,
    order: 4
  },
  {
    _id: 'testimonial-marc-andre-gagnon-fr',
    _type: 'testimonial',
    language: 'fr',
    quote: "Un buffet en érable qui devait juste être beau. Trois ans de soupers de famille plus tard, il n'a pas une marque qui dérange. Solide.",
    name: 'Marc-André Gagnon',
    context: 'Buffet sur mesure, Saint-Bruno',
    service: { _type: 'reference', _ref: 'service-mobilier-fr' },
    project: { _type: 'reference', _ref: 'project-buffet-erable-saint-bruno-fr' },
    featured: false,
    order: 5
  },
  {
    _id: 'testimonial-le-moulin-cafe-fr',
    _type: 'testimonial',
    language: 'fr',
    quote: "Notre comptoir encaisse trois cents cafés par jour depuis l'ouverture. Maxime a compris notre rythme avant nous. Du solide, et du beau.",
    name: 'Le Moulin, café',
    context: 'Agencement de commerce, Chambly',
    service: { _type: 'reference', _ref: 'service-commerces-fr' },
    project: { _type: 'reference', _ref: 'project-cafe-amenagement-chambly-fr' },
    featured: false,
    order: 6
  },

  // ── Thèmes FAQ (banque, 8 documents) ───────────────────────────────────────
  {
    _id: 'faqTheme-delais-fr',
    _type: 'faqTheme',
    language: 'fr',
    title: 'Délais',
    slug: { _type: 'slug', current: 'delais' }
  },
  {
    _id: 'faqTheme-zone-desservie-fr',
    _type: 'faqTheme',
    language: 'fr',
    title: 'Zone desservie',
    slug: { _type: 'slug', current: 'zone-desservie' }
  },
  {
    _id: 'faqTheme-estimation-et-devis-fr',
    _type: 'faqTheme',
    language: 'fr',
    title: 'Estimation et devis',
    slug: { _type: 'slug', current: 'estimation-et-devis' }
  },
  {
    _id: 'faqTheme-materiaux-fr',
    _type: 'faqTheme',
    language: 'fr',
    title: 'Matériaux',
    slug: { _type: 'slug', current: 'materiaux' }
  },
  {
    _id: 'faqTheme-garantie-fr',
    _type: 'faqTheme',
    language: 'fr',
    title: 'Garantie',
    slug: { _type: 'slug', current: 'garantie' }
  },
  {
    _id: 'faqTheme-prix-et-paiement-fr',
    _type: 'faqTheme',
    language: 'fr',
    title: 'Prix et paiement',
    slug: { _type: 'slug', current: 'prix-et-paiement' }
  },
  {
    _id: 'faqTheme-entretien-fr',
    _type: 'faqTheme',
    language: 'fr',
    title: 'Entretien',
    slug: { _type: 'slug', current: 'entretien' }
  },
  {
    _id: 'faqTheme-processus-fr',
    _type: 'faqTheme',
    language: 'fr',
    title: 'Processus',
    slug: { _type: 'slug', current: 'processus' }
  },

  // ── FAQ (banque, 9 documents, ordre V1 canonique) ──────────────────────────
  {
    _id: 'faqItem-delai-fr',
    _type: 'faqItem',
    language: 'fr',
    question: 'Quel est le délai typique pour un projet?',
    answer: "De six semaines pour une pièce simple à six mois pour une cuisine complète. Je préfère un échéancier honnête à une promesse rapide. Vous aurez la date de livraison par écrit dans le devis.",
    theme: { _type: 'reference', _ref: 'faqTheme-delais-fr' }
  },
  {
    _id: 'faqItem-zone-fr',
    _type: 'faqItem',
    language: 'fr',
    question: 'Travaillez-vous en dehors de la Montérégie?',
    answer: "Oui, sur la Rive-Sud, à Montréal et jusqu'en Estrie. Au-delà de 200 km, les coûts de transport rendent le projet moins intéressant pour vous, je vous référerai à un collègue ébéniste de votre région.",
    theme: { _type: 'reference', _ref: 'faqTheme-zone-desservie-fr' }
  },
  {
    _id: 'faqItem-estimation-fr',
    _type: 'faqItem',
    language: 'fr',
    question: "Comment se déroule l'estimation?",
    answer: "Une rencontre d'une heure, à l'atelier ou chez vous, gratuite et sans engagement. Vous recevez un devis détaillé par écrit dans la semaine, avec les essences, les dimensions et l'échéancier précis.",
    theme: { _type: 'reference', _ref: 'faqTheme-estimation-et-devis-fr' }
  },
  {
    _id: 'faqItem-essences-fr',
    _type: 'faqItem',
    language: 'fr',
    question: 'Quelles essences de bois proposez-vous?',
    answer: "Frêne, érable, merisier, noyer noir et chêne blanc en standard. Toutes sourcées au Québec et séchées en chambre. Pour les essences exotiques ou tropicales, je vous expliquerai pourquoi je préfère ne pas en utiliser.",
    theme: { _type: 'reference', _ref: 'faqTheme-materiaux-fr' }
  },
  {
    _id: 'faqItem-garantie-fr',
    _type: 'faqItem',
    language: 'fr',
    question: 'Offrez-vous une garantie?',
    answer: "À vie sur la structure et les assemblages. Si un tenon, une mortaise ou une queue d'aronde lâche à cause de la fabrication, je reprends la pièce sans frais, peu importe l'année. La finition, elle, s'entretient: je vous remets une fiche d'entretien avec chaque pièce.",
    theme: { _type: 'reference', _ref: 'faqTheme-garantie-fr' }
  },
  {
    _id: 'faqItem-prix-fr',
    _type: 'faqItem',
    language: 'fr',
    question: 'Combien coûte une pièce sur mesure?',
    answer: "Chaque projet est chiffré au cas par cas, mais pour donner un ordre de grandeur: une table de salle à manger commence autour de 3 500 $, une cuisine complète autour de 25 000 $. Le devis écrit est ferme, sans surprise à la livraison.",
    theme: { _type: 'reference', _ref: 'faqTheme-prix-et-paiement-fr' }
  },
  {
    _id: 'faqItem-acompte-fr',
    _type: 'faqItem',
    language: 'fr',
    question: 'Comment fonctionne le paiement?',
    answer: "Un acompte de 40 % confirme la commande et m'achète le bois, 30 % à mi-parcours, le solde à la livraison une fois que vous avez vu la pièce installée. Rien n'est dû tant que vous n'êtes pas satisfait du résultat final.",
    theme: { _type: 'reference', _ref: 'faqTheme-prix-et-paiement-fr' }
  },
  {
    _id: 'faqItem-entretien-fr',
    _type: 'faqItem',
    language: 'fr',
    question: 'Comment entretenir une pièce en bois massif?',
    answer: "Un linge humide pour le quotidien, et une couche d'huile-cire une à deux fois par an sur les surfaces qui travaillent. C'est tout. Je vous remets une petite fiche d'entretien avec chaque pièce, et le nécessaire pour la première année.",
    theme: { _type: 'reference', _ref: 'faqTheme-entretien-fr' }
  },
  {
    _id: 'faqItem-modifications-fr',
    _type: 'faqItem',
    language: 'fr',
    question: 'Puis-je modifier le projet en cours de route?',
    answer: "Avant la mise en fabrication, autant qu'on veut: c'est fait pour ça. Une fois le bois débité, les changements deviennent coûteux, alors on prend le temps de bien figer le dessin ensemble avant que je scie quoi que ce soit.",
    theme: { _type: 'reference', _ref: 'faqTheme-processus-fr' }
  },

  // ── Pages légales (2 documents) ────────────────────────────────────────────
  // effective et updated omis volontairement (spec 6.16: le seed n'invente
  // aucune date; les jetons V1 sont des consignes, pas des dates).
  {
    _id: 'legalPage-conditions-fr',
    _type: 'legalPage',
    language: 'fr',
    title: "Conditions d'utilisation",
    sections: [
      {
        _type: 'legalSection',
        _key: 'sec-champ-application',
        title: "Champ d'application",
        body: [
          {
            _type: 'legalParagraph',
            _key: 'p-1',
            text: "Les présentes conditions encadrent l'utilisation du site ateliercormier.ca et tout échange initié à partir du formulaire de contact. En naviguant sur le site, vous acceptez ces conditions. La version en vigueur est celle affichée sur la présente page, datée en haut du document."
          }
        ]
      },
      {
        _type: 'legalSection',
        _key: 'sec-utilisation',
        title: 'Utilisation du site',
        body: [
          {
            _type: 'legalParagraph',
            _key: 'p-1',
            text: "Le site est mis à votre disposition à titre informatif, pour présenter nos services et permettre une première prise de contact. En l'utilisant, vous vous engagez à :"
          },
          {
            _type: 'legalList',
            _key: 'list-1',
            items: [
              'en faire un usage légal et respectueux;',
              'ne pas nuire à sa sécurité ni à son fonctionnement;',
              'ne pas reproduire, distribuer ou modifier son contenu sans autorisation;',
              'fournir des renseignements exacts lorsque vous utilisez le formulaire de contact.'
            ]
          }
        ]
      },
      {
        _type: 'legalSection',
        _key: 'sec-propriete',
        title: 'Propriété intellectuelle',
        body: [
          {
            _type: 'legalParagraph',
            _key: 'p-1',
            text: "Les textes, photographies, croquis, designs, marques, éléments graphiques et le code source figurant sur le site sont notre propriété ou sont utilisés avec autorisation. Toute reproduction, distribution ou utilisation, totale ou partielle, sans autorisation écrite préalable est interdite."
          }
        ]
      },
      {
        _type: 'legalSection',
        _key: 'sec-formulaire',
        title: 'Formulaire de contact',
        body: [
          {
            _type: 'legalParagraph',
            _key: 'p-1',
            text: "Le formulaire de contact permet de nous transmettre une demande de renseignements. Son envoi ne constitue ni un contrat ni une confirmation de prestation. Toute entente relative à un service fait l'objet d'une communication distincte entre les parties."
          }
        ]
      },
      {
        _type: 'legalSection',
        _key: 'sec-exactitude',
        title: "Exactitude de l'information",
        body: [
          {
            _type: 'legalParagraph',
            _key: 'p-1',
            text: "Nous nous efforçons de garder les informations du site à jour et exactes, sans toutefois garantir qu'elles sont exemptes d'erreurs ou d'omissions. Elles sont fournies à titre indicatif et peuvent être modifiées sans préavis."
          }
        ]
      },
      {
        _type: 'legalSection',
        _key: 'sec-liens-externes',
        title: 'Liens vers des sites externes',
        body: [
          {
            _type: 'legalParagraph',
            _key: 'p-1',
            text: "Le site peut contenir des liens vers des sites tiers, par exemple des réseaux sociaux ou une plateforme de réservation, fournis pour votre commodité. Ces sites ne sont pas sous notre contrôle. Nous ne sommes pas responsables de leur contenu, de leurs pratiques ni de leurs politiques de confidentialité, et la présence d'un lien ne constitue pas une approbation de notre part. Nous vous invitons à consulter les conditions propres à chaque site que vous visitez."
          }
        ]
      },
      {
        _type: 'legalSection',
        _key: 'sec-responsabilite',
        title: 'Limitation de responsabilité',
        body: [
          {
            _type: 'legalParagraph',
            _key: 'p-1',
            text: "Dans les limites permises par la loi, nous ne pouvons être tenus responsables :"
          },
          {
            _type: 'legalList',
            _key: 'list-1',
            items: [
              "de tout dommage direct ou indirect lié à l'utilisation du site ou à l'impossibilité de l'utiliser;",
              "d'une interruption, d'une suspension ou d'une cessation du site;",
              'du contenu ou des pratiques des sites tiers accessibles par des liens;',
              "d'une perte de données liée à l'utilisation du site."
            ]
          },
          {
            _type: 'legalParagraph',
            _key: 'p-2',
            text: "Nous prenons des moyens raisonnables pour assurer la fiabilité et la sécurité du site, sans pouvoir garantir qu'il est exempt de tout défaut technique."
          }
        ]
      },
      {
        _type: 'legalSection',
        _key: 'sec-disponibilite',
        title: 'Disponibilité du site',
        body: [
          {
            _type: 'legalParagraph',
            _key: 'p-1',
            text: "Nous nous efforçons de garder le site accessible en tout temps, sans en garantir un fonctionnement ininterrompu. Il peut être temporairement indisponible en raison d'une maintenance, d'une mise à jour ou d'un problème technique."
          }
        ]
      },
      {
        _type: 'legalSection',
        _key: 'sec-droit',
        title: 'Droit applicable',
        body: [
          {
            _type: 'legalParagraph',
            _key: 'p-1',
            text: "Les présentes conditions sont régies par les lois en vigueur au Québec."
          },
          {
            _type: 'legalParagraph',
            _key: 'p-2',
            text: "Si une disposition des présentes conditions est jugée invalide ou inapplicable, les autres dispositions demeurent pleinement en vigueur."
          }
        ]
      },
      {
        _type: 'legalSection',
        _key: 'sec-traduction',
        title: 'Traduction',
        body: [
          {
            _type: 'legalParagraph',
            _key: 'p-1',
            text: "En cas de divergence d'interprétation entre la version française des présentes conditions et une traduction, la version française prévaut."
          }
        ]
      },
      {
        _type: 'legalSection',
        _key: 'sec-modifications',
        title: 'Modifications à ces conditions',
        body: [
          {
            _type: 'legalParagraph',
            _key: 'p-1',
            text: "Ces conditions peuvent être modifiées de temps à autre. Toute modification entre en vigueur dès sa publication sur cette page, avec mise à jour de la date indiquée en haut du document. En continuant d'utiliser le site, vous acceptez les conditions ainsi révisées."
          }
        ]
      }
    ]
  },
  {
    _id: 'legalPage-confidentialite-fr',
    _type: 'legalPage',
    language: 'fr',
    title: 'Politique de confidentialité',
    sections: [
      {
        _type: 'legalSection',
        _key: 'sec-consentement',
        title: 'Votre consentement',
        body: [
          {
            _type: 'legalParagraph',
            _key: 'p-1',
            text: "Lorsque nous recueillons, utilisons ou communiquons vos renseignements personnels, nous le faisons toujours dans des buts précis. Votre consentement est obtenu avant ou au moment de la collecte, sauf dans les cas prévus par la loi, et ne vaut que pour la durée nécessaire à ces buts."
          },
          {
            _type: 'legalParagraph',
            _key: 'p-2',
            text: "Ce consentement est explicite: vous le donnez en nous transmettant volontairement vos renseignements pour que nous puissions donner suite à votre demande, que ce soit par le formulaire de contact ou en communiquant directement avec nous. Si nous souhaitons utiliser vos renseignements à une autre fin, nous vous en demanderons le consentement, sauf si la loi l'autorise."
          }
        ]
      },
      {
        _type: 'legalSection',
        _key: 'sec-renseignements',
        title: 'Les renseignements que nous recueillons',
        body: [
          {
            _type: 'legalParagraph',
            _key: 'p-1',
            text: 'Lorsque vous remplissez le formulaire de contact, vous nous transmettez volontairement :'
          },
          {
            _type: 'legalList',
            _key: 'list-1',
            items: [
              'votre nom;',
              'votre adresse courriel;',
              'votre numéro de téléphone (facultatif);',
              'le contenu de votre message.'
            ]
          },
          {
            _type: 'legalParagraph',
            _key: 'p-2',
            text: "En naviguant sur le site, des données techniques sont aussi recueillies automatiquement par notre hébergeur : pages consultées, durée de la visite, type d'appareil et de navigateur, site de provenance, adresse IP tronquée et localisation approximative. Si un outil de mesure d'audience était activé sur le site, il recueillerait le même type de données."
          }
        ]
      },
      {
        _type: 'legalSection',
        _key: 'sec-utilisation',
        title: "L'utilisation de vos renseignements",
        body: [
          {
            _type: 'legalTodo',
            _key: 'todo-1',
            text: "À compléter : décrivez les fins pour lesquelles vous utilisez les renseignements reçus par le formulaire (par exemple répondre à une demande, préparer un devis, assurer le suivi d'un projet)."
          },
          {
            _type: 'legalParagraph',
            _key: 'p-1',
            text: "Les données de mesure d'audience, si un tel outil était activé, serviraient uniquement à comprendre la fréquentation du site et à l'améliorer. Vos renseignements ne sont utilisés qu'aux fins pour lesquelles ils ont été recueillis, sauf avec votre consentement ou si la loi l'autorise."
          }
        ]
      },
      {
        _type: 'legalSection',
        _key: 'sec-temoins',
        title: 'Témoins de connexion',
        body: [
          {
            _type: 'legalParagraph',
            _key: 'p-1',
            text: "Le site utilise des témoins nécessaires à son fonctionnement. Des témoins de mesure d'audience pourraient s'y ajouter : le cas échéant, ils ne seraient déposés qu'avec votre consentement. Lors de votre première visite, une bannière de consentement vous permet d'accepter ou de refuser les témoins non essentiels, et vous pouvez modifier votre choix en tout temps. Tant que vous n'avez pas accepté, aucun témoin de mesure n'est déposé."
          }
        ]
      },
      {
        _type: 'legalSection',
        _key: 'sec-tiers-hebergement',
        title: 'Communication à des tiers et hébergement',
        body: [
          {
            _type: 'legalParagraph',
            _key: 'p-1',
            text: "Pour faire fonctionner le site, certains renseignements peuvent être traités pour notre compte par des fournisseurs de services, regroupés dans les catégories suivantes :"
          },
          {
            _type: 'legalList',
            _key: 'list-1',
            items: [
              'services de technologie (hébergement du site, diffusion de contenu, stockage et sauvegarde);',
              "services d'acheminement de courriels et de protection contre les pourriels;",
              "services de mesure d'audience, le cas échéant."
            ]
          },
          {
            _type: 'legalTodo',
            _key: 'todo-1',
            text: "À compléter si applicable : ajoutez tout autre service que vous utilisez et qui touche des renseignements de vos clients (infolettre, logiciel de soumission, prise de rendez-vous)."
          },
          {
            _type: 'legalParagraph',
            _key: 'p-2',
            text: "Ces fournisseurs ne reçoivent que les renseignements nécessaires à l'exécution de leur mandat. Certaines de vos données peuvent être traitées ou conservées sur des serveurs situés à l'extérieur du Québec, où les lois sur la protection des renseignements personnels peuvent différer des nôtres. Nous prenons des moyens raisonnables pour qu'elles y demeurent protégées."
          }
        ]
      },
      {
        _type: 'legalSection',
        _key: 'sec-conservation',
        title: 'Conservation et destruction',
        body: [
          {
            _type: 'legalTodo',
            _key: 'todo-1',
            text: "À compléter : précisez combien de temps vous conservez les renseignements (par exemple, suppression des demandes sans suite après douze mois, conservation des dossiers de clients sept ans pour vos obligations fiscales)."
          },
          {
            _type: 'legalParagraph',
            _key: 'p-1',
            text: "Au terme de ces délais, les renseignements sont détruits ou anonymisés de façon sécuritaire."
          }
        ]
      },
      {
        _type: 'legalSection',
        _key: 'sec-acces-securite',
        title: 'Accès et sécurité',
        body: [
          {
            _type: 'legalTodo',
            _key: 'todo-1',
            text: "À compléter : indiquez qui, dans votre organisation, a accès aux renseignements recueillis (pour un travailleur autonome : « je suis la seule personne à y avoir accès »)."
          },
          {
            _type: 'legalParagraph',
            _key: 'p-1',
            text: "Le site est servi en HTTPS chiffré, et les soumissions du formulaire sont acheminées par courriel sans être stockées dans une base de données exposée publiquement. Aucune méthode de transmission sur Internet n'étant infaillible, nous ne pouvons garantir une sécurité absolue, mais nous appliquons des mesures reconnues. En cas d'incident de confidentialité présentant un risque de préjudice sérieux, nous prendrons les mesures requises par la loi."
          }
        ]
      },
      {
        _type: 'legalSection',
        _key: 'sec-droits',
        title: 'Vos droits',
        body: [
          {
            _type: 'legalParagraph',
            _key: 'p-1',
            text: 'Conformément à la Loi 25, vous pouvez en tout temps :'
          },
          {
            _type: 'legalList',
            _key: 'list-1',
            items: [
              'accéder aux renseignements que nous détenons sur vous;',
              'obtenir une copie des renseignements que vous nous avez fournis, dans un format numérique couramment utilisé;',
              'en demander la rectification ou la destruction;',
              'retirer votre consentement;',
              'déposer une plainte concernant leur traitement.'
            ]
          }
        ]
      },
      {
        _type: 'legalSection',
        _key: 'sec-responsable',
        title: 'Responsable de la protection des renseignements',
        body: [
          {
            _type: 'legalTodo',
            _key: 'todo-1',
            text: "À compléter : le nom de la personne responsable de la protection des renseignements personnels (par défaut, vous). C'est elle qui traite les demandes d'accès et les plaintes, et qui a approuvé la présente politique."
          },
          {
            _type: 'legalParagraph',
            _key: 'p-1',
            text: "Le contenu de la présente politique a été approuvé par cette personne. Pour exercer vos droits ou déposer une plainte, communiquez avec elle aux coordonnées indiquées ci-dessous. Nous traitons votre demande dans un délai de 30 jours."
          }
        ]
      },
      {
        _type: 'legalSection',
        _key: 'sec-modifications',
        title: 'Modifications à cette politique',
        body: [
          {
            _type: 'legalParagraph',
            _key: 'p-1',
            text: "Cette politique peut être modifiée de temps à autre. Toute modification entre en vigueur dès sa publication sur cette page, avec mise à jour de la date indiquée en haut du document."
          }
        ]
      }
    ]
  }
]
