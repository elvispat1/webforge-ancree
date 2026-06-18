// Seed Sanity: articles EN, lot 1 de 2. Miroir structurel exact de
// articles-fr-1.mjs: mêmes documents (_id en -en, clé canonique FR conservée),
// mêmes _key, mêmes marqueurs { _imagePath }, mêmes dates. Seuls les textes,
// slugs et labels changent de langue. Les références internes (category, cta)
// pointent les documents -en. Pas de champ order: le tri se fait par date.
//
// Conversion du body V1 vers Sanity: voir l'en-tête de articles-fr-1.mjs.
//
// Les marqueurs { _imagePath } sont remplacés par le runner après upload des assets.

export const docs = [
  {
    _id: 'article-prix-du-sur-mesure-en',
    _type: 'article',
    language: 'en',
    title: 'What custom work really costs',
    slug: { _type: 'slug', current: 'what-custom-work-really-costs' },
    excerpt: 'Talking price should not be taboo. Where the cost of a custom piece comes from, and why I quote firm prices.',
    cover: {
      _type: 'figure',
      image: { _imagePath: '/images/blog-prix.jpg' },
      alt: 'Wood species samples fanned out on a large solid wood planning table, folding rule and open notebook.',
      label: 'Planning table',
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
        text: "It's the question everyone has in mind on the first call, and the one nobody dares ask first. Might as well answer it plainly right here.",
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
              { _type: 'span', _key: 'span-1', text: 'The price of a custom piece comes from three things: material, time, installation. Material means the wood, but also its drying, which has to be paid for: kiln-dried ash does not cost what green ash costs. Shop time, for its part, cannot be compressed: a well-made joint takes the time it takes, and that is precisely what you are buying.', marks: [] },
            ],
          },
          {
            _type: 'block',
            _key: 'r1-b2',
            style: 'normal',
            markDefs: [],
            children: [
              { _type: 'span', _key: 'span-1', text: 'That is why two tables of the same size do not carry the same price. The species, the joinery and the finish change everything: a dovetailed walnut top, oiled by hand, and a maple top screwed together then varnished do not live in the same column of numbers.', marks: [] },
            ],
          },
        ],
      },
      {
        _type: 'articleQuote',
        _key: 'q1',
        quote: 'A firm price means I carry the risk, not you.',
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
              { _type: 'span', _key: 'span-1', text: 'What drives the bill up', marks: [] },
            ],
          },
          {
            _type: 'block',
            _key: 'r2-b2',
            style: 'normal',
            markDefs: [],
            children: [
              { _type: 'span', _key: 'span-1', text: 'Rare or imported species, curves (every bent piece needs its own jig), electrical integrations and recessed lighting. Nothing wrong with any of it: you just need to know that this is where the dollars go.', marks: [] },
            ],
          },
          {
            _type: 'block',
            _key: 'r2-b3',
            style: 'h2',
            markDefs: [],
            children: [
              { _type: 'span', _key: 'span-1', text: 'What brings it down', marks: [] },
            ],
          },
          {
            _type: 'block',
            _key: 'r2-b4',
            style: 'normal',
            markDefs: [],
            children: [
              { _type: 'span', _key: 'span-1', text: 'Dimensions that respect standard board widths, an oiled finish rather than a multi-coat varnish, and flexible timelines that let me slip your project in between two big jobs. If your budget is tight, say so from the start: that is often where we find the room.', marks: [] },
            ],
          },
        ],
      },
      {
        _type: 'articleCallout',
        _key: 'co1',
        tone: 'note',
        title: 'The quote is free, and so is the no',
        text: 'If the budget and the project do not line up, I tell you in the first conversation, not the last. It costs you nothing to find out, and you leave with a straight answer.',
      },
      {
        _type: 'articleInlineCta',
        _key: 'c1',
        text: 'Want a clear number for your project?',
        cta: {
          _type: 'link',
          label: 'Start a project',
          type: 'internal',
          internalRef: { _type: 'reference', _ref: 'contactPage-en' },
        },
      },
    ],
  },
  {
    _id: 'article-reparer-plutot-que-remplacer-en',
    _type: 'article',
    language: 'en',
    title: "Repair instead of replace: when it's worth it",
    slug: { _type: 'slug', current: 'repair-instead-of-replace' },
    excerpt: "A wobbly chair is not a chair that's done for. What can be repaired, what can't, and how I make the call.",
    cover: {
      _type: 'figure',
      image: { _imagePath: '/images/blog-reparer.jpg' },
      alt: 'Antique maple chair turned upside down on the workbench, joints taken apart, clamps and a pot of glue within reach.',
      label: 'Chair on the workbench',
      caption: 'Workshop, 16:9',
      ratio: '16/9',
    },
    category: { _type: 'reference', _ref: 'category-entretien-en' },
    date: '2025-04-28',
    author: 'Maxime Cormier',
    readingTime: 5,
    body: [
      {
        _type: 'articleLead',
        _key: 'l1',
        text: 'The modern reflex is to throw things out. Yet a solid wood piece can almost always be repaired, and often for less than a replacement of equal quality.',
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
              { _type: 'span', _key: 'span-1', text: 'What repairs well', marks: [] },
            ],
          },
          {
            _type: 'block',
            _key: 'r1-b2',
            style: 'normal',
            markDefs: [],
            children: [
              { _type: 'span', _key: 'span-1', text: "Loose joints, first of all: a wobbly chair is glue that has dried out, not a chair that's done for. You take it apart, clean it, reglue it, and the joint is good for decades more. Worn drawer slides get replaced, tired finishes get redone, lifted veneer gets glued back down.", marks: [] },
            ],
          },
          {
            _type: 'block',
            _key: 'r1-b3',
            style: 'h2',
            markDefs: [],
            children: [
              { _type: 'span', _key: 'span-1', text: "What can't be saved", marks: [] },
            ],
          },
          {
            _type: 'block',
            _key: 'r1-b4',
            style: 'normal',
            markDefs: [],
            children: [
              { _type: 'span', _key: 'span-1', text: 'Particleboard swollen with water: once the wood dust has risen, nothing brings it back down. Rotten wood, which has no structure left to offer. And furniture built not to last, where every repair calls for three more.', marks: [] },
            ],
          },
        ],
      },
      {
        _type: 'articleQuote',
        _key: 'q1',
        quote: 'A solid wood piece is never done for as long as the wood is sound.',
        attribution: 'Maxime Cormier',
      },
      {
        // Placeholder V1 volontaire (pas de src): champ image omis.
        _type: 'articleImage',
        _key: 'i1',
        image: {
          _type: 'figure',
          alt: 'Antique chair held in clamps after regluing, glue beading at the joints.',
          label: 'Regluing under clamps',
          caption: 'Workshop, 4:3',
          ratio: '4/3',
        },
      },
      {
        _type: 'articleCallout',
        _key: 'co1',
        tone: 'note',
        title: 'Before you call me',
        text: 'Three checks to run at home: is the piece solid wood or panel stock (look under the top, the edge never lies)? Is the wood sound, with no rot or swelling? Are all the parts there? Three yeses, and the repair is almost always worth it.',
      },
      {
        _type: 'articleInlineCta',
        _key: 'c1',
        text: 'A family piece to put back into service?',
        cta: {
          _type: 'link',
          label: 'See the Restoration service',
          type: 'internal',
          internalRef: { _type: 'reference', _ref: 'service-restauration-en' },
        },
      },
    ],
  },
  {
    _id: 'article-erreurs-de-mesure-en',
    _type: 'article',
    language: 'en',
    title: 'Measuring an old house: the traps that cost you',
    slug: { _type: 'slug', current: 'measuring-an-old-house' },
    excerpt: 'Nothing is straight in a pre-war house. The measuring mistakes I see most often, and how I avoid them.',
    cover: {
      _type: 'figure',
      image: { _imagePath: '/images/blog-mesure.jpg' },
      alt: 'Tape measure and laser level on the windowsill of an old house, a thin laser line cast across a plaster wall.',
      label: 'Window survey',
      caption: 'Site measure, 16:9',
      ratio: '16/9',
    },
    category: { _type: 'reference', _ref: 'category-atelier-en' },
    date: '2025-03-17',
    author: 'Maxime Cormier',
    readingTime: 4,
    body: [
      {
        _type: 'articleLead',
        _key: 'l1',
        text: 'The worst mistake in custom work does not happen in the shop: it happens during the site measure. A sixteenth of an inch missed in the wrong spot becomes a gaping seam on installation morning.',
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
              { _type: 'span', _key: 'span-1', text: 'The classics', marks: [] },
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
              { _type: 'span', _key: 'span-1', text: 'Measuring a wall in a single spot when it bellies at the centre. In a pre-war house, a wall can vary by half an inch over its length.', marks: [] },
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
              { _type: 'span', _key: 'span-1', text: 'Trusting the original plans. They describe the house as it was drawn, not as it was built, much less as it has moved since.', marks: [] },
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
              { _type: 'span', _key: 'span-1', text: 'Forgetting the thickness of baseboards, mouldings and casings, which eat up space at the foot of the wall.', marks: [] },
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
              { _type: 'span', _key: 'span-1', text: 'Ignoring a floor that is out of level. The cabinet will stand plumb, the floor will not, and the whole gap reads at a glance along the counter line.', marks: [] },
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
          alt: 'Laser level on the floor casting its line across an old plaster wall, the gap between line and wall visible to the eye.',
          label: 'The line that tells the truth',
          caption: 'Site measure, 4:3',
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
              { _type: 'span', _key: 'span-1', text: 'My method is simple and non-negotiable: three measurements per dimension, at the top, the centre and the bottom, and I keep the least forgiving one. A full laser survey of the room, electrical outlets and plumbing included. For impossible corners, a cardboard template cut on site beats any number.', marks: [] },
            ],
          },
          {
            _type: 'block',
            _key: 'r2-b2',
            style: 'normal',
            markDefs: [],
            children: [
              { _type: 'span', _key: 'span-1', text: 'Above all, the room for adjustment is planned at the drawing stage: filler panels, calculated clearances, scribe pieces fitted on site. Nothing is straight in an old house, and the piece has to be designed to absorb that truth, not to deny it.', marks: [] },
            ],
          },
        ],
      },
      {
        _type: 'articleInlineCta',
        _key: 'c1',
        text: 'A project in a house that has lived a little?',
        cta: {
          _type: 'link',
          label: "Let's talk",
          type: 'internal',
          internalRef: { _type: 'reference', _ref: 'contactPage-en' },
        },
      },
    ],
  },
  {
    _id: 'article-commander-sur-mesure-en',
    _type: 'article',
    language: 'en',
    title: 'What to expect when you order custom',
    slug: { _type: 'slug', current: 'ordering-custom-furniture' },
    excerpt: 'Timelines, price, back and forth: the honest course of a project, so nobody gets surprised.',
    cover: {
      _type: 'figure',
      image: { _imagePath: '/images/blog-commander.jpg' },
      alt: 'Wood species samples and two cups of coffee on a solid wood consultation table.',
      label: 'Consultation table',
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
        text: 'Ordering a custom piece is nothing like buying off the shelf. It takes longer, it is more personal, and the result looks like you. Here is what to expect.',
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
              { _type: 'span', _key: 'span-1', text: 'It all starts with a conversation, free, with no obligation. We talk about what you want and about your budget, and I tell you frankly whether I am the right person for the project.', marks: [] },
            ],
          },
          {
            _type: 'block',
            _key: 'r1-b2',
            style: 'normal',
            markDefs: [],
            children: [
              { _type: 'span', _key: 'span-1', text: 'Then comes the written quote: species, dimensions, schedule, firm price. No surprise at the end.', marks: [] },
            ],
          },
        ],
      },
      {
        _type: 'articleQuote',
        _key: 'q1',
        quote: 'I would rather tell you no at the start than disappoint you at the end. If your project is not for me, I will say so.',
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
              { _type: 'span', _key: 'span-1', text: 'The pace', marks: [] },
            ],
          },
          {
            _type: 'block',
            _key: 'r2-b2',
            style: 'normal',
            markDefs: [],
            children: [
              { _type: 'span', _key: 'span-1', text: 'A deposit starts the build. I keep you posted at the key stages, sometimes with a photo from the shop. Then I deliver and install. The balance is only due once the piece is in place and you are happy with it.', marks: [] },
            ],
          },
        ],
      },
      {
        _type: 'articleInlineCta',
        _key: 'c1',
        text: 'Ready to talk it over, no strings attached?',
        cta: {
          _type: 'link',
          label: 'Start a project',
          type: 'internal',
          internalRef: { _type: 'reference', _ref: 'contactPage-en' },
        },
      },
    ],
  },
  {
    _id: 'article-queue-d-aronde-en',
    _type: 'article',
    language: 'en',
    title: "The dovetail, and why I'm stubborn about it",
    slug: { _type: 'slug', current: 'dovetail-joint' },
    excerpt: 'A joint that takes longer to cut than driving two screws. Here is what it buys, and why I refuse to give it up.',
    cover: {
      _type: 'figure',
      image: { _imagePath: '/images/blog-dovetail.jpg' },
      alt: 'Hand sawing a board clamped in a vise, shavings hanging in the workshop air.',
      label: 'Hand sawing',
      caption: 'Workshop, 16:9',
      ratio: '16/9',
    },
    category: { _type: 'reference', _ref: 'category-atelier-en' },
    date: '2025-01-20',
    author: 'Maxime Cormier',
    readingTime: 6,
    body: [
      {
        _type: 'articleLead',
        _key: 'l1',
        text: 'People sometimes ask why I spend an hour on a joint a metal bracket could handle in two minutes. Short answer: because it holds for a hundred years.',
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
              { _type: 'span', _key: 'span-1', text: 'Dovetails are those fanned teeth you see at the corners of old drawers. Their shape makes the joint lock mechanically: the harder you pull, the tighter it grips.', marks: [] },
            ],
          },
          {
            _type: 'block',
            _key: 'r1-b2',
            style: 'h2',
            markDefs: [],
            children: [
              { _type: 'span', _key: 'span-1', text: 'What it replaces', marks: [] },
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
              { _type: 'span', _key: 'span-1', text: 'No screws, so nothing to rust or work loose.', marks: [] },
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
              { _type: 'span', _key: 'span-1', text: 'No structural glue required: the joint holds on its own.', marks: [] },
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
              { _type: 'span', _key: 'span-1', text: 'Full repairability fifty years from now.', marks: [] },
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
          alt: 'Dovetailed drawer, seen from the corner.',
          label: 'Assembled drawer',
          caption: 'Detail, 4:3',
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
              { _type: 'span', _key: 'span-1', text: 'Does the client see the difference at first glance? Not always. Will they feel it opening the drawer twenty years from now? Every single time.', marks: [] },
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
            alt: 'Marking out the dovetails with a marking gauge.',
            label: 'Marking out',
            caption: 'Step 1, 4:5',
            ratio: '4/5',
          },
          {
            _type: 'figure',
            _key: 'decoupe',
            image: { _imagePath: '/images/blog-aronde-decoupe.jpg' },
            alt: 'Cutting with a backsaw.',
            label: 'Cutting',
            caption: 'Step 2, 4:5',
            ratio: '4/5',
          },
          {
            _type: 'figure',
            _key: 'ajustement',
            image: { _imagePath: '/images/blog-aronde-ajustement.jpg' },
            alt: 'Final fitting with a chisel.',
            label: 'Fitting',
            caption: 'Step 3, 4:5',
            ratio: '4/5',
          },
        ],
      },
    ],
  },
  {
    _id: 'article-choisir-essence-bois-en',
    _type: 'article',
    language: 'en',
    title: 'Ash, maple or walnut: how I choose the wood',
    slug: { _type: 'slug', current: 'choosing-the-right-wood' },
    excerpt: 'Choosing wood is about more than colour. Here is what I look at before milling the first board.',
    cover: {
      _type: 'figure',
      image: { _imagePath: '/images/blog-kitchen-plan.jpg' },
      alt: 'Hands marking a pencil line on a pale wood board, plane shavings scattered around.',
      label: 'Pencil marking',
      caption: 'Workshop, 16:9',
      ratio: '16/9',
    },
    category: { _type: 'reference', _ref: 'category-le-bois-en' },
    date: '2024-11-12',
    author: 'Maxime Cormier',
    readingTime: 5,
    body: [
      {
        _type: 'articleLead',
        _key: 'l1',
        text: 'When a client tells me “I want pale wood”, I know we still have work to do. Pale runs from lively ash to milky maple, and those two do not behave the same way.',
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
              { _type: 'span', _key: 'span-1', text: 'Before thinking about tone, I look at three things: hardness, stability, and how the species ages. A kitchen table and a bookcase do not call for the same trade-offs.', marks: [] },
            ],
          },
          {
            _type: 'block',
            _key: 'r1-b2',
            style: 'h2',
            markDefs: [],
            children: [
              { _type: 'span', _key: 'span-1', text: 'Hardness, for daily use', marks: [] },
            ],
          },
          {
            _type: 'block',
            _key: 'r1-b3',
            style: 'normal',
            markDefs: [],
            children: [
              { _type: 'span', _key: 'span-1', text: 'Maple and oak take everyday knocks in stride. Walnut, softer, marks more easily, but its patina forgives those marks better than a pale wood does. For a work surface, I steer toward the hard species.', marks: [] },
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
          alt: 'Close-up of the grain on a freshly planed ash board.',
          label: 'Ash grain',
          caption: 'Planed ash, 4:3',
          ratio: '4/3',
        },
      },
      {
        _type: 'articleQuote',
        _key: 'q1',
        quote: 'The best wood for your project is rarely the most expensive. It is the one that will age well under the use you will give it.',
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
              { _type: 'span', _key: 'span-1', text: 'Stability, for the long run', marks: [] },
            ],
          },
          {
            _type: 'block',
            _key: 'r2-b2',
            style: 'normal',
            markDefs: [],
            children: [
              { _type: 'span', _key: 'span-1', text: 'All wood moves with humidity. Yellow birch and walnut move little once properly dried; some cuts of oak move a great deal. I choose the species AND the cut to suit the piece.', marks: [] },
            ],
          },
        ],
      },
      {
        _type: 'articleInlineCta',
        _key: 'c1',
        text: 'A project in mind but not sure about the wood?',
        cta: {
          _type: 'link',
          label: "Let's talk",
          type: 'internal',
          internalRef: { _type: 'reference', _ref: 'contactPage-en' },
        },
      },
    ],
  },
]
