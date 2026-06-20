/* Contrat de contenu d'un article + fixtures de démo (Rempart Extermination).
 * Miroir de ce que la transformation Sanity produira; AUCUNE valeur design ici.
 * Le corps est une suite de blocs d'article (discriminés par _type), rendus par
 * l'ArticleBuilder. i18n document-level: un article par langue, slug partagé.
 * Aucune numérotation affichée, site-wide. */
import type { ArticleBlock } from '~/types/blocks'
import type { ArticleFigure, PortableTextBlock } from '~/content/article-blocks'

export interface ArticleCategoryRef {
  title: string
  slug: string
}

export interface ArticleContent {
  slug: string // partagé fr/en
  title: string
  excerpt: string
  cover: ArticleFigure
  date: string // ISO de publication
  author: string
  readingMinutes: number
  category?: ArticleCategoryRef
  body: ArticleBlock[]
}

/* Articles de démo. Bilingue, ton chaud et local, québécois soutenu. Les corps
 * exercent l'ensemble des blocs (amorce, texte riche, image, citation, galerie,
 * encadré, appel). Slugs partagés fr/en. */
export function articlesFixture(isEn: boolean): ArticleContent[] {
  // Petites fabriques de blocs Portable Text, clés uniques par appel.
  let n = 0
  const id = () => `pt${n++}`
  const span = (text: string, marks?: string[]) => ({ _type: 'span' as const, _key: id(), text, marks })
  const para = (text: string): PortableTextBlock => ({ _type: 'block', _key: id(), style: 'normal', children: [span(text)] })
  const h2 = (text: string): PortableTextBlock => ({ _type: 'block', _key: id(), style: 'h2', children: [span(text)] })
  const bullet = (text: string): PortableTextBlock => ({ _type: 'block', _key: id(), style: 'normal', listItem: 'bullet', level: 1, children: [span(text)] })
  let b = 0
  const bk = () => `blk${b++}`

  if (isEn) {
    return [
      {
        slug: 'prevenir-les-fourmis-charpentieres',
        title: 'Carpenter ants: stopping them before they reach the wood',
        excerpt: 'They rarely announce themselves. Here is how to read the early signs and keep a colony from settling into your home.',
        cover: { src: '/images/hero-technicien.jpg', alt: 'A Rempart technician inspecting the foundation of a house' },
        date: '2026-05-28',
        author: 'The Rempart team',
        readingMinutes: 6,
        category: { title: 'Prevention', slug: 'prevention' },
        body: [
          { _type: 'lead', _key: bk(), text: 'Carpenter ants do not eat wood, they hollow it out to nest. By the time you see them indoors, the colony is often already established nearby. The good news: a few habits keep them at bay.' },
          { _type: 'rich-text', _key: bk(), value: [
            h2('Where they come from'),
            para('Carpenter ants look for damp, softened wood: a leaking sill, a deck post, the edge of a flat roof. From there, a few scouts find their way inside along a baseboard or a heating pipe.'),
            { _type: 'block', _key: id(), style: 'normal', markDefs: [{ _key: 'l1', _type: 'link', href: '/en/services' }], children: [span('A '), span('targeted treatment', ['strong']), span(' solves the problem at the source rather than chasing workers one by one. See our '), span('services', ['l1']), span(' for what that looks like.')] },
            para('Watch for these signs around the house:'),
            bullet('Fine sawdust (frass) under a window frame or a beam'),
            bullet('A faint rustling inside a wall on a warm evening'),
            bullet('Large winged ants near a light in spring')
          ] },
          { _type: 'image', _key: bk(), image: { src: '/images/inspection-rempart.jpg', alt: 'Close inspection of a wooden frame', caption: 'A careful inspection finds the nest, not just the workers.' } },
          { _type: 'callout', _key: bk(), tone: 'note', title: 'Keep wood dry', text: 'Most carpenter ant problems start with moisture. Fix the leak first, and the wood stops being an invitation.' },
          { _type: 'quote', _key: bk(), quote: 'We do not just spray and leave. We find where the colony lives and treat it there.', attribution: 'A Rempart technician' },
          { _type: 'rich-text', _key: bk(), value: [
            h2('When to call'),
            para('If you see workers indoors two days in a row, or winged ants inside, it is worth a look. The earlier we find the nest, the smaller the treatment.')
          ] },
          { _type: 'inline-cta', _key: bk(), text: 'Not sure what you are seeing? Send us a photo and we will tell you.', cta: { label: 'Get a free estimate', href: '/en/contact' } }
        ]
      },
      {
        slug: 'reconnaitre-une-infestation-de-souris',
        title: 'Reading the signs of a mouse problem',
        excerpt: 'A mouse rarely travels alone. Learn to spot an infestation early, before it moves from the garage into the walls.',
        cover: { src: '/images/inspection-rempart.jpg', alt: 'A technician checking entry points along a foundation' },
        date: '2026-04-15',
        author: 'The Rempart team',
        readingMinutes: 5,
        category: { title: 'Knowing your pests', slug: 'nuisibles' },
        body: [
          { _type: 'lead', _key: bk(), text: 'Mice are quiet tenants. By the time you hear them, a small group has usually found food, water and a warm place to nest. The signs are easy to read once you know them.' },
          { _type: 'rich-text', _key: bk(), value: [
            h2('The early tells'),
            para('You will usually notice the traces before the mouse itself:'),
            bullet('Small dark droppings along a wall or inside a cupboard'),
            bullet('Gnaw marks on packaging or a corner of drywall'),
            bullet('A musky smell in a closed space like a pantry')
          ] },
          { _type: 'gallery', _key: bk(), items: [
            { src: '/images/inspection-rempart.jpg', alt: 'Sealing an entry point along the foundation' },
            { src: '/images/equipe-rempart.jpg', alt: 'The Rempart team beside the service van' }
          ] },
          { _type: 'callout', _key: bk(), tone: 'warning', title: 'Do not wait', text: 'A pair of mice becomes a dozen in a season. Acting in the first weeks keeps it simple.' }
        ]
      },
      {
        slug: 'punaises-de-lit-les-bons-reflexes',
        title: 'Bed bugs: the right reflexes after a trip',
        excerpt: 'Most bed bug problems come home in a suitcase. A few minutes of care at the door makes all the difference.',
        cover: { src: '/images/hero-rempart.jpg', alt: 'A bright, tidy bedroom' },
        date: '2026-03-02',
        author: 'The Rempart team',
        readingMinutes: 4,
        category: { title: 'Prevention', slug: 'prevention' },
        body: [
          { _type: 'lead', _key: bk(), text: 'Bed bugs are hitchhikers. They almost never appear out of nowhere: they arrive in luggage, a second-hand couch, a guest’s bag. The good news is that a careful habit at the door stops most of them.' },
          { _type: 'rich-text', _key: bk(), value: [
            para('When you come back from a trip, unpack in the bathroom or the garage, not on the bed. Run washable items through a hot dryer cycle, and keep the suitcase away from the bedroom for a few days.')
          ] },
          { _type: 'quote', _key: bk(), quote: 'Caught in the first week, a bed bug treatment is discreet and quick. Left for months, it is a different story.', attribution: 'A Rempart technician' }
        ]
      }
    ]
  }
  return [
    {
      slug: 'prevenir-les-fourmis-charpentieres',
      title: 'Fourmis charpentières: les arrêter avant qu’elles n’atteignent le bois',
      excerpt: 'Elles s’annoncent rarement. Voici comment lire les premiers signes et empêcher une colonie de s’installer chez vous.',
      cover: { src: '/images/hero-technicien.jpg', alt: 'Un technicien de Rempart inspecte la fondation d’une maison' },
      date: '2026-05-28',
      author: 'L’équipe Rempart',
      readingMinutes: 6,
      category: { title: 'Prévention', slug: 'prevention' },
      body: [
        { _type: 'lead', _key: bk(), text: 'La fourmi charpentière ne mange pas le bois, elle le creuse pour y nicher. Quand on la voit à l’intérieur, la colonie est souvent déjà établie tout près. La bonne nouvelle: quelques habitudes la tiennent à distance.' },
        { _type: 'rich-text', _key: bk(), value: [
          h2('D’où elles viennent'),
          para('La fourmi charpentière cherche le bois humide et ramolli: un seuil qui coule, un poteau de patio, le rebord d’un toit plat. De là, quelques éclaireuses trouvent le chemin de l’intérieur le long d’une plinthe ou d’un tuyau de chauffage.'),
          { _type: 'block', _key: id(), style: 'normal', markDefs: [{ _key: 'l1', _type: 'link', href: '/services' }], children: [span('Un '), span('traitement ciblé', ['strong']), span(' règle le problème à la source plutôt que de courir après les ouvrières une à une. Voyez nos '), span('services', ['l1']), span(' pour ce que ça implique.')] },
          para('Guettez ces signes autour de la maison:'),
          bullet('Une fine sciure (vermoulure) sous un cadre de fenêtre ou une poutre'),
          bullet('Un léger bruissement dans un mur par une soirée douce'),
          bullet('De grosses fourmis ailées près d’une lumière au printemps')
        ] },
        { _type: 'image', _key: bk(), image: { src: '/images/inspection-rempart.jpg', alt: 'Inspection rapprochée d’une charpente de bois', caption: 'Une inspection soignée trouve le nid, pas seulement les ouvrières.' } },
        { _type: 'callout', _key: bk(), tone: 'note', title: 'Gardez le bois au sec', text: 'La plupart des problèmes de fourmis charpentières commencent par l’humidité. Réglez la fuite d’abord, et le bois cesse d’être une invitation.' },
        { _type: 'quote', _key: bk(), quote: 'On ne fait pas qu’arroser et repartir. On trouve où vit la colonie et on la traite là.', attribution: 'Un technicien de Rempart' },
        { _type: 'rich-text', _key: bk(), value: [
          h2('Quand nous appeler'),
          para('Si vous voyez des ouvrières à l’intérieur deux jours de suite, ou des fourmis ailées dans la maison, ça vaut un coup d’œil. Plus tôt on trouve le nid, plus petit est le traitement.')
        ] },
        { _type: 'inline-cta', _key: bk(), text: 'Pas certain de ce que vous voyez? Envoyez-nous une photo et on vous le dira.', cta: { label: 'Obtenir une estimation gratuite', href: '/contact' } }
      ]
    },
    {
      slug: 'reconnaitre-une-infestation-de-souris',
      title: 'Lire les signes d’un problème de souris',
      excerpt: 'Une souris voyage rarement seule. Apprenez à repérer une infestation tôt, avant qu’elle ne passe du garage aux murs.',
      cover: { src: '/images/inspection-rempart.jpg', alt: 'Un technicien vérifie les points d’entrée le long d’une fondation' },
      date: '2026-04-15',
      author: 'L’équipe Rempart',
      readingMinutes: 5,
      category: { title: 'Connaître les nuisibles', slug: 'nuisibles' },
      body: [
        { _type: 'lead', _key: bk(), text: 'La souris est une locataire discrète. Quand on l’entend, un petit groupe a souvent déjà trouvé nourriture, eau et un coin chaud pour nicher. Les signes se lisent facilement une fois qu’on les connaît.' },
        { _type: 'rich-text', _key: bk(), value: [
          h2('Les premiers indices'),
          para('On remarque en général les traces avant la souris elle-même:'),
          bullet('De petites crottes sombres le long d’un mur ou dans une armoire'),
          bullet('Des marques de grignotage sur un emballage ou un coin de gypse'),
          bullet('Une odeur de musc dans un espace fermé comme le garde-manger')
        ] },
        { _type: 'gallery', _key: bk(), items: [
          { src: '/images/inspection-rempart.jpg', alt: 'Scellement d’un point d’entrée le long de la fondation' },
          { src: '/images/equipe-rempart.jpg', alt: 'L’équipe Rempart devant la camionnette de service' }
        ] },
        { _type: 'callout', _key: bk(), tone: 'warning', title: 'N’attendez pas', text: 'Deux souris deviennent une douzaine en une saison. Agir dans les premières semaines garde les choses simples.' }
      ]
    },
    {
      slug: 'punaises-de-lit-les-bons-reflexes',
      title: 'Punaises de lit: les bons réflexes au retour de voyage',
      excerpt: 'La plupart des problèmes de punaises rentrent dans une valise. Quelques minutes de soin à la porte changent tout.',
      cover: { src: '/images/hero-rempart.jpg', alt: 'Une chambre claire et bien rangée' },
      date: '2026-03-02',
      author: 'L’équipe Rempart',
      readingMinutes: 4,
      category: { title: 'Prévention', slug: 'prevention' },
      body: [
        { _type: 'lead', _key: bk(), text: 'La punaise de lit fait de l’auto-stop. Elle n’apparaît presque jamais de nulle part: elle arrive dans une valise, un divan d’occasion, le sac d’un invité. La bonne nouvelle, c’est qu’une habitude soignée à la porte en arrête la plupart.' },
        { _type: 'rich-text', _key: bk(), value: [
          para('Au retour d’un voyage, défaites les bagages dans la salle de bain ou le garage, pas sur le lit. Passez ce qui se lave à la sécheuse à cycle chaud, et gardez la valise loin de la chambre quelques jours.')
        ] },
        { _type: 'quote', _key: bk(), quote: 'Prise dès la première semaine, une intervention contre les punaises est discrète et rapide. Laissée des mois, c’est une autre histoire.', attribution: 'Un technicien de Rempart' }
      ]
    }
  ]
}
