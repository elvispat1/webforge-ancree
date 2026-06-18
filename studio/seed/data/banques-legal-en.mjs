// Seed EN: content banks (testimonials, FAQ themes, FAQ) and legal pages.
//
// English mirror of banques-legal-fr.mjs: same documents with -en ids, same
// _key values, same structure, same order, refs pointing to the -en documents.
// Deterministic ids per the spec convention (docs/SANITY-SCHEMA-SPEC.md,
// section 11): the _id keeps the canonical FR-based key (faqTheme ids use the
// FR slug; the slug field itself is per-language). FAQ themes are faqTheme
// documents (one per distinct V1 FaqItem.theme value, spec 6.17) referenced by
// the faqItem documents; the V1 order field is gone (ordering belongs to the
// consumers, spec 6.15). Legal page dates (effective, updated) are OMITTED:
// the seed invents no date, the empty field carries the "to be filled in by
// the client" semantics (spec, section 6.16).

export const docs = [
  // ── Testimonials (bank, 6 documents) ───────────────────────────────────────
  {
    _id: 'testimonial-catherine-dufresne-en',
    _type: 'testimonial',
    language: 'en',
    quote: "Rebuilt our ash kitchen in 2022. Three years later, the doors still haven't moved. The work speaks for itself.",
    name: 'Catherine Dufresne',
    context: 'Complete kitchen, Saint-Mathias-sur-Richelieu',
    service: { _type: 'reference', _ref: 'service-cuisines-en' },
    project: { _type: 'reference', _ref: 'project-cuisine-frene-saint-mathias-en' },
    featured: true,
    order: 1
  },
  {
    _id: 'testimonial-jean-philippe-rousseau-en',
    _type: 'testimonial',
    language: 'en',
    quote: "An eight-seat walnut table for my father's seventieth birthday. Delivered three months after the first sketch, exactly as agreed.",
    name: 'Jean-Philippe Rousseau',
    context: 'Dining table, Chambly',
    service: { _type: 'reference', _ref: 'service-mobilier-en' },
    project: { _type: 'reference', _ref: 'project-table-noyer-chambly-en' },
    featured: true,
    order: 2
  },
  {
    _id: 'testimonial-marie-helene-belanger-en',
    _type: 'testimonial',
    language: 'en',
    quote: "I had inherited a dresser from my grandmother that was falling apart. Maxime brought it back to life without erasing its history.",
    name: 'Marie-Hélène Bélanger',
    context: 'Restoration, Carignan',
    service: { _type: 'reference', _ref: 'service-restauration-en' },
    project: { _type: 'reference', _ref: 'project-commode-restauration-carignan-en' },
    featured: true,
    order: 3
  },
  {
    _id: 'testimonial-sophie-tremblay-en',
    _type: 'testimonial',
    language: 'en',
    quote: "The bookcase follows the crooked wall of our old living room to the millimetre. It looks like it was built with the house in 1910.",
    name: 'Sophie Tremblay',
    context: 'Built-in bookcase, Longueuil',
    service: { _type: 'reference', _ref: 'service-bibliotheques-en' },
    project: { _type: 'reference', _ref: 'project-bibliotheque-merisier-longueuil-en' },
    featured: false,
    order: 4
  },
  {
    _id: 'testimonial-marc-andre-gagnon-en',
    _type: 'testimonial',
    language: 'en',
    quote: "A maple sideboard that just had to be beautiful. Three years of family dinners later, there isn't a mark worth mentioning. Solid.",
    name: 'Marc-André Gagnon',
    context: 'Custom sideboard, Saint-Bruno',
    service: { _type: 'reference', _ref: 'service-mobilier-en' },
    project: { _type: 'reference', _ref: 'project-buffet-erable-saint-bruno-en' },
    featured: false,
    order: 5
  },
  {
    _id: 'testimonial-le-moulin-cafe-en',
    _type: 'testimonial',
    language: 'en',
    quote: "Our counter has taken three hundred coffees a day since opening day. Maxime understood our pace before we did. Solid work, and beautiful too.",
    name: 'Le Moulin, café',
    context: 'Commercial millwork, Chambly',
    service: { _type: 'reference', _ref: 'service-commerces-en' },
    project: { _type: 'reference', _ref: 'project-cafe-amenagement-chambly-en' },
    featured: false,
    order: 6
  },

  // ── FAQ themes (bank, 8 documents) ─────────────────────────────────────────
  {
    _id: 'faqTheme-delais-en',
    _type: 'faqTheme',
    language: 'en',
    title: 'Timelines',
    slug: { _type: 'slug', current: 'timelines' }
  },
  {
    _id: 'faqTheme-zone-desservie-en',
    _type: 'faqTheme',
    language: 'en',
    title: 'Service area',
    slug: { _type: 'slug', current: 'service-area' }
  },
  {
    _id: 'faqTheme-estimation-et-devis-en',
    _type: 'faqTheme',
    language: 'en',
    title: 'Estimates and quotes',
    slug: { _type: 'slug', current: 'estimates-and-quotes' }
  },
  {
    _id: 'faqTheme-materiaux-en',
    _type: 'faqTheme',
    language: 'en',
    title: 'Materials',
    slug: { _type: 'slug', current: 'materials' }
  },
  {
    _id: 'faqTheme-garantie-en',
    _type: 'faqTheme',
    language: 'en',
    title: 'Warranty',
    slug: { _type: 'slug', current: 'warranty' }
  },
  {
    _id: 'faqTheme-prix-et-paiement-en',
    _type: 'faqTheme',
    language: 'en',
    title: 'Pricing and payment',
    slug: { _type: 'slug', current: 'pricing-and-payment' }
  },
  {
    _id: 'faqTheme-entretien-en',
    _type: 'faqTheme',
    language: 'en',
    title: 'Care',
    slug: { _type: 'slug', current: 'care' }
  },
  {
    _id: 'faqTheme-processus-en',
    _type: 'faqTheme',
    language: 'en',
    title: 'Process',
    slug: { _type: 'slug', current: 'process' }
  },

  // ── FAQ (bank, 9 documents, canonical V1 order) ────────────────────────────
  {
    _id: 'faqItem-delai-en',
    _type: 'faqItem',
    language: 'en',
    question: 'What is the typical timeline for a project?',
    answer: "From six weeks for a simple piece to six months for a complete kitchen. I would rather give you an honest schedule than a quick promise. Your delivery date is set out in writing in the quote.",
    theme: { _type: 'reference', _ref: 'faqTheme-delais-en' }
  },
  {
    _id: 'faqItem-zone-en',
    _type: 'faqItem',
    language: 'en',
    question: 'Do you work outside the Montérégie?',
    answer: "Yes, on the South Shore, in Montreal and as far as the Eastern Townships. Beyond 200 km, transport costs make the project less worthwhile for you, so I will refer you to a fellow cabinetmaker in your area.",
    theme: { _type: 'reference', _ref: 'faqTheme-zone-desservie-en' }
  },
  {
    _id: 'faqItem-estimation-en',
    _type: 'faqItem',
    language: 'en',
    question: 'How does the estimate work?',
    answer: "A one-hour meeting, at the shop or at your place, free, with no obligation. You receive a detailed written quote within the week, with the wood species, the dimensions and a precise schedule.",
    theme: { _type: 'reference', _ref: 'faqTheme-estimation-et-devis-en' }
  },
  {
    _id: 'faqItem-essences-en',
    _type: 'faqItem',
    language: 'en',
    question: 'Which wood species do you offer?',
    answer: "Ash, maple, yellow birch, black walnut and white oak as standard. All sourced in Quebec and kiln-dried. As for exotic or tropical species, I will gladly explain why I prefer not to use them.",
    theme: { _type: 'reference', _ref: 'faqTheme-materiaux-en' }
  },
  {
    _id: 'faqItem-garantie-en',
    _type: 'faqItem',
    language: 'en',
    question: 'Do you offer a warranty?',
    answer: "Lifetime coverage on the structure and the joinery. If a tenon, a mortise or a dovetail fails because of the workmanship, I take the piece back and repair it at no charge, no matter the year. The finish, on the other hand, needs upkeep: I provide a care sheet with every piece.",
    theme: { _type: 'reference', _ref: 'faqTheme-garantie-en' }
  },
  {
    _id: 'faqItem-prix-en',
    _type: 'faqItem',
    language: 'en',
    question: 'How much does a custom piece cost?',
    answer: "Every project is priced case by case, but to give you a rough idea: a dining table starts around $3,500, a complete kitchen around $25,000. The written quote is firm, with no surprises at delivery.",
    theme: { _type: 'reference', _ref: 'faqTheme-prix-et-paiement-en' }
  },
  {
    _id: 'faqItem-acompte-en',
    _type: 'faqItem',
    language: 'en',
    question: 'How does payment work?',
    answer: "A 40% deposit confirms the order and pays for the wood, 30% at the halfway point, and the balance at delivery once you have seen the piece installed. Nothing is owed until you are satisfied with the final result.",
    theme: { _type: 'reference', _ref: 'faqTheme-prix-et-paiement-en' }
  },
  {
    _id: 'faqItem-entretien-en',
    _type: 'faqItem',
    language: 'en',
    question: 'How do I care for a solid wood piece?',
    answer: "A damp cloth for everyday cleaning, and a coat of hardwax oil once or twice a year on the surfaces that see heavy use. That is all. I provide a short care sheet with every piece, along with everything you need for the first year.",
    theme: { _type: 'reference', _ref: 'faqTheme-entretien-en' }
  },
  {
    _id: 'faqItem-modifications-en',
    _type: 'faqItem',
    language: 'en',
    question: 'Can I change the project along the way?',
    answer: "Before production starts, as much as you like: that is what the design phase is for. Once the wood is cut, changes get expensive, so we take the time to lock down the drawing together before I saw anything.",
    theme: { _type: 'reference', _ref: 'faqTheme-processus-en' }
  },

  // ── Legal pages (2 documents) ──────────────────────────────────────────────
  // effective and updated deliberately omitted (spec 6.16: the seed invents
  // no date; the V1 tokens are instructions, not dates).
  {
    _id: 'legalPage-conditions-en',
    _type: 'legalPage',
    language: 'en',
    title: 'Terms of Use',
    sections: [
      {
        _type: 'legalSection',
        _key: 'sec-champ-application',
        title: 'Scope',
        body: [
          {
            _type: 'legalParagraph',
            _key: 'p-1',
            text: "These terms govern the use of the ateliercormier.ca website and any exchange initiated through the contact form. By browsing the site, you accept these terms. The version in force is the one displayed on this page, dated at the top of the document."
          }
        ]
      },
      {
        _type: 'legalSection',
        _key: 'sec-utilisation',
        title: 'Use of the site',
        body: [
          {
            _type: 'legalParagraph',
            _key: 'p-1',
            text: "The site is made available to you for information purposes, to present our services and allow an initial point of contact. By using it, you agree to:"
          },
          {
            _type: 'legalList',
            _key: 'list-1',
            items: [
              'use it lawfully and respectfully;',
              'refrain from harming its security or its operation;',
              'refrain from reproducing, distributing or modifying its content without authorization;',
              'provide accurate information when using the contact form.'
            ]
          }
        ]
      },
      {
        _type: 'legalSection',
        _key: 'sec-propriete',
        title: 'Intellectual property',
        body: [
          {
            _type: 'legalParagraph',
            _key: 'p-1',
            text: "The texts, photographs, sketches, designs, trademarks, graphic elements and source code appearing on the site are our property or are used with permission. Any reproduction, distribution or use, in whole or in part, without prior written authorization is prohibited."
          }
        ]
      },
      {
        _type: 'legalSection',
        _key: 'sec-formulaire',
        title: 'Contact form',
        body: [
          {
            _type: 'legalParagraph',
            _key: 'p-1',
            text: "The contact form allows you to send us a request for information. Submitting it does not constitute a contract or a confirmation of service. Any agreement relating to a service is the subject of a separate communication between the parties."
          }
        ]
      },
      {
        _type: 'legalSection',
        _key: 'sec-exactitude',
        title: 'Accuracy of information',
        body: [
          {
            _type: 'legalParagraph',
            _key: 'p-1',
            text: "We strive to keep the information on the site accurate and up to date, without guaranteeing that it is free of errors or omissions. It is provided for guidance only and may be changed without notice."
          }
        ]
      },
      {
        _type: 'legalSection',
        _key: 'sec-liens-externes',
        title: 'Links to external sites',
        body: [
          {
            _type: 'legalParagraph',
            _key: 'p-1',
            text: "The site may contain links to third-party sites, such as social media platforms or a booking platform, provided for your convenience. These sites are not under our control. We are not responsible for their content, their practices or their privacy policies, and the presence of a link does not constitute an endorsement on our part. We encourage you to review the terms of each site you visit."
          }
        ]
      },
      {
        _type: 'legalSection',
        _key: 'sec-responsabilite',
        title: 'Limitation of liability',
        body: [
          {
            _type: 'legalParagraph',
            _key: 'p-1',
            text: "To the extent permitted by law, we cannot be held liable for:"
          },
          {
            _type: 'legalList',
            _key: 'list-1',
            items: [
              'any direct or indirect damage related to the use of the site or the inability to use it;',
              'an interruption, suspension or discontinuation of the site;',
              'the content or practices of third-party sites accessible through links;',
              'any loss of data related to the use of the site.'
            ]
          },
          {
            _type: 'legalParagraph',
            _key: 'p-2',
            text: "We take reasonable measures to ensure the reliability and security of the site, without being able to guarantee that it is free of any technical defect."
          }
        ]
      },
      {
        _type: 'legalSection',
        _key: 'sec-disponibilite',
        title: 'Site availability',
        body: [
          {
            _type: 'legalParagraph',
            _key: 'p-1',
            text: "We strive to keep the site accessible at all times, without guaranteeing uninterrupted operation. It may be temporarily unavailable due to maintenance, an update or a technical issue."
          }
        ]
      },
      {
        _type: 'legalSection',
        _key: 'sec-droit',
        title: 'Governing law',
        body: [
          {
            _type: 'legalParagraph',
            _key: 'p-1',
            text: "These terms are governed by the laws in force in Quebec."
          },
          {
            _type: 'legalParagraph',
            _key: 'p-2',
            text: "If any provision of these terms is found to be invalid or unenforceable, the remaining provisions remain in full force and effect."
          }
        ]
      },
      {
        _type: 'legalSection',
        _key: 'sec-traduction',
        title: 'Translation',
        body: [
          {
            _type: 'legalParagraph',
            _key: 'p-1',
            text: "In the event of a discrepancy in interpretation between the French version of these terms and a translation, the French version prevails."
          }
        ]
      },
      {
        _type: 'legalSection',
        _key: 'sec-modifications',
        title: 'Changes to these terms',
        body: [
          {
            _type: 'legalParagraph',
            _key: 'p-1',
            text: "These terms may be amended from time to time. Any amendment takes effect upon publication on this page, with an update to the date shown at the top of the document. By continuing to use the site, you accept the terms as revised."
          }
        ]
      }
    ]
  },
  {
    _id: 'legalPage-confidentialite-en',
    _type: 'legalPage',
    language: 'en',
    title: 'Privacy Policy',
    sections: [
      {
        _type: 'legalSection',
        _key: 'sec-consentement',
        title: 'Your consent',
        body: [
          {
            _type: 'legalParagraph',
            _key: 'p-1',
            text: "When we collect, use or disclose your personal information, we always do so for specific purposes. Your consent is obtained before or at the time of collection, except in the cases provided for by law, and is valid only for the time needed to fulfill those purposes."
          },
          {
            _type: 'legalParagraph',
            _key: 'p-2',
            text: "This consent is explicit: you give it by voluntarily providing your information so that we can follow up on your request, whether through the contact form or by contacting us directly. If we wish to use your information for another purpose, we will ask for your consent, unless the law allows otherwise."
          }
        ]
      },
      {
        _type: 'legalSection',
        _key: 'sec-renseignements',
        title: 'The information we collect',
        body: [
          {
            _type: 'legalParagraph',
            _key: 'p-1',
            text: 'When you fill out the contact form, you voluntarily provide us with:'
          },
          {
            _type: 'legalList',
            _key: 'list-1',
            items: [
              'your name;',
              'your email address;',
              'your phone number (optional);',
              'the content of your message.'
            ]
          },
          {
            _type: 'legalParagraph',
            _key: 'p-2',
            text: "As you browse the site, technical data is also collected automatically by our hosting provider: pages viewed, length of visit, device and browser type, referring site, truncated IP address and approximate location. If an analytics tool were enabled on the site, it would collect the same type of data."
          }
        ]
      },
      {
        _type: 'legalSection',
        _key: 'sec-utilisation',
        title: 'How your information is used',
        body: [
          {
            _type: 'legalTodo',
            _key: 'todo-1',
            text: "To be completed: describe the purposes for which you use the information received through the form (for example, responding to a request, preparing a quote, following up on a project)."
          },
          {
            _type: 'legalParagraph',
            _key: 'p-1',
            text: "Analytics data, if such a tool were enabled, would be used solely to understand how the site is visited and to improve it. Your information is used only for the purposes for which it was collected, except with your consent or where the law allows."
          }
        ]
      },
      {
        _type: 'legalSection',
        _key: 'sec-temoins',
        title: 'Cookies',
        body: [
          {
            _type: 'legalParagraph',
            _key: 'p-1',
            text: "The site uses cookies necessary for its operation. Analytics cookies may be added at some point: if so, they would only be set with your consent. On your first visit, a consent banner lets you accept or decline non-essential cookies, and you can change your choice at any time. Until you have accepted, no analytics cookie is set."
          }
        ]
      },
      {
        _type: 'legalSection',
        _key: 'sec-tiers-hebergement',
        title: 'Disclosure to third parties and hosting',
        body: [
          {
            _type: 'legalParagraph',
            _key: 'p-1',
            text: "To operate the site, some information may be processed on our behalf by service providers, grouped into the following categories:"
          },
          {
            _type: 'legalList',
            _key: 'list-1',
            items: [
              'technology services (site hosting, content delivery, storage and backup);',
              'email delivery and spam protection services;',
              'analytics services, where applicable.'
            ]
          },
          {
            _type: 'legalTodo',
            _key: 'todo-1',
            text: "To be completed if applicable: add any other service you use that handles your clients' information (newsletter, quoting software, appointment booking)."
          },
          {
            _type: 'legalParagraph',
            _key: 'p-2',
            text: "These providers receive only the information needed to carry out their mandate. Some of your data may be processed or stored on servers located outside Quebec, where privacy laws may differ from ours. We take reasonable measures to ensure it remains protected there."
          }
        ]
      },
      {
        _type: 'legalSection',
        _key: 'sec-conservation',
        title: 'Retention and destruction',
        body: [
          {
            _type: 'legalTodo',
            _key: 'todo-1',
            text: "To be completed: specify how long you keep the information (for example, deleting inquiries that go nowhere after twelve months, keeping client files for seven years to meet your tax obligations)."
          },
          {
            _type: 'legalParagraph',
            _key: 'p-1',
            text: "Once these periods expire, the information is securely destroyed or anonymized."
          }
        ]
      },
      {
        _type: 'legalSection',
        _key: 'sec-acces-securite',
        title: 'Access and security',
        body: [
          {
            _type: 'legalTodo',
            _key: 'todo-1',
            text: 'To be completed: state who, within your organization, has access to the information collected (for a self-employed person: "I am the only person with access to it").'
          },
          {
            _type: 'legalParagraph',
            _key: 'p-1',
            text: "The site is served over encrypted HTTPS, and form submissions are forwarded by email without being stored in a publicly exposed database. Since no method of transmission over the Internet is foolproof, we cannot guarantee absolute security, but we apply recognized measures. In the event of a confidentiality incident presenting a risk of serious harm, we will take the measures required by law."
          }
        ]
      },
      {
        _type: 'legalSection',
        _key: 'sec-droits',
        title: 'Your rights',
        body: [
          {
            _type: 'legalParagraph',
            _key: 'p-1',
            text: 'In accordance with Law 25, you may at any time:'
          },
          {
            _type: 'legalList',
            _key: 'list-1',
            items: [
              'access the information we hold about you;',
              'obtain a copy of the information you have provided to us, in a commonly used digital format;',
              'request its correction or destruction;',
              'withdraw your consent;',
              'file a complaint about how it is handled.'
            ]
          }
        ]
      },
      {
        _type: 'legalSection',
        _key: 'sec-responsable',
        title: 'Person in charge of the protection of personal information',
        body: [
          {
            _type: 'legalTodo',
            _key: 'todo-1',
            text: "To be completed: the name of the person in charge of the protection of personal information (by default, you). This person handles access requests and complaints, and approved this policy."
          },
          {
            _type: 'legalParagraph',
            _key: 'p-1',
            text: "The content of this policy has been approved by this person. To exercise your rights or file a complaint, contact them at the contact details provided below. We respond to your request within 30 days."
          }
        ]
      },
      {
        _type: 'legalSection',
        _key: 'sec-modifications',
        title: 'Changes to this policy',
        body: [
          {
            _type: 'legalParagraph',
            _key: 'p-1',
            text: "This policy may be amended from time to time. Any amendment takes effect upon publication on this page, with an update to the date shown at the top of the document."
          }
        ]
      }
    ]
  }
]
