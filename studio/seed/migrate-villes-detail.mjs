// Enrichit les pages VILLE détail (/villes/[slug]). Avant: editorial nu (sans en-tête,
// image ni lien) + services en mode auto (catalogue identique partout). Cible par ville:
//   detailHero > editorial (savoir local + maillage) > highlights (promesses) >
//   services (manual, sous-ensemble + en-tête de ville) > testimonials (mode city) > ctaBand
//
// On REECRIT l'editorial en gardant le savoir local fort (ajout en-tête, image partagee
// inspection-rempart, h3, liens internes inline), on deplace les promesses generiques
// vers highlights (commun), on passe services en manual avec un sous-ensemble pertinent,
// on ancre les temoignages a CETTE ville (mode city), on ferme par un ctaBand contextualise.
//
// NB vedette: la carte vedette navy de la grille suit le flag `featured` GLOBAL du service
// (fourmis), pas l'ordre des items manuels; une vraie vedette par ville exigerait un champ
// de schema (hors FOND). La differentiation par ville passe donc par le sous-ensemble +
// l'en-tete. Aucun doc neuf ici (pas de faq; les temoignages de ville existent deja, sauf
// Saint-Eustache, traite a la replication). Live (vrais refs) puis miroir seed (IMG:).
// Idempotent (saute si highlights present). CITIES grandit a la replication.
//
// Usage:  node studio/seed/migrate-villes-detail.mjs [--dry-run]

import { createClient } from '@sanity/client'
import { readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const DRY = process.argv.includes('--dry-run')
const here = dirname(fileURLToPath(import.meta.url))
const seedPath = join(here, '..', 'seed-content.json')

function readToken() {
  if (process.env.SANITY_AUTH_TOKEN) return process.env.SANITY_AUTH_TOKEN
  const cfg = JSON.parse(readFileSync(join(homedir(), '.config', 'sanity', 'config.json'), 'utf8'))
  if (cfg.authToken) return cfg.authToken
  throw new Error('Aucun token Sanity.')
}

const client = createClient({ projectId: '5if00rwn', dataset: 'production', apiVersion: '2024-10-01', token: readToken(), useCdn: false })
const ref = (id) => ({ _type: 'reference', _ref: id })
const IMG_INSPECTION_REAL = 'image-63ce3125380e4bf9994b4261b970c11d5b098d48-1200x896-jpg' // inspection-rempart
const IMG_INSPECTION_SEED = 'IMG:inspection-rempart'

function block(key, parts, style = 'normal') {
  const children = []; const markDefs = []
  parts.forEach((p, i) => {
    if (p.ref) { const mk = `${key}l${i}`; markDefs.push({ _key: mk, _type: 'link', type: 'internal', internalRef: ref(p.ref) }); children.push({ _key: `${key}s${i}`, _type: 'span', marks: [mk], text: p.text }) }
    else children.push({ _key: `${key}s${i}`, _type: 'span', marks: [], text: p.text })
  })
  return { _type: 'block', _key: key, style, markDefs, children }
}
const svc = (slug, lang, key) => ({ ...ref(`service-${slug}-${lang}`), _key: key })

// Promesses COMMUNES (highlights) + libellés partagés, par langue.
const COMMON = {
  fr: {
    hlHeading: "Ce qu'on vous garantit",
    highlights: [
      { _key: 'benefit-0', _type: 'highlight', title: 'Garantie écrite, retour sans frais', body: "Si le nuisible revient dans la période couverte, on retraite sans vous refacturer." },
      { _key: 'benefit-1', _type: 'highlight', title: 'Produits homologués, sûrs pour la famille', body: "Des produits homologués Santé Canada, appliqués par un technicien certifié." },
      { _key: 'benefit-2', _type: 'highlight', title: 'Souvent le jour même', body: "Une vraie personne répond 7 jours sur 7 et un technicien d'ici part vite vers vous." },
      { _key: 'benefit-3', _type: 'highlight', title: 'Estimation gratuite, rapport écrit', body: "On évalue sans frais et on remet un rapport de ce qui a été traité." },
    ],
    svcEyebrow: 'Nos interventions', svcCta: 'Voir tous les services',
    tmEyebrow: 'Sur le terrain', call: 'Appeler maintenant', estimate: 'Obtenir une estimation',
  },
  en: {
    hlHeading: 'What we guarantee',
    highlights: [
      { _key: 'benefit-0', _type: 'highlight', title: 'Written guarantee, free return visit', body: "If the pest comes back within the covered period, we re-treat at no extra charge." },
      { _key: 'benefit-1', _type: 'highlight', title: 'Approved products, family-safe', body: "Health Canada approved products, applied by a certified technician." },
      { _key: 'benefit-2', _type: 'highlight', title: 'Often the same day', body: "A real person answers seven days a week and a local technician heads your way fast." },
      { _key: 'benefit-3', _type: 'highlight', title: 'Free estimate, written report', body: "We assess at no charge and provide a report of what was treated." },
    ],
    svcEyebrow: 'Our work', svcCta: 'See all services',
    tmEyebrow: 'On the ground', call: 'Call now', estimate: 'Get an estimate',
  },
}

// Contenu PAR VILLE (savoir local propre, maillage). La table grandit a la replication.
const CITIES = {
  terrebonne: {
    items: ['fourmis-charpentieres', 'souris-rats', 'guepes-frelons', 'coquerelles'],
    fr: {
      edEyebrow: 'Notre territoire', edHeading: "L'extermination à Terrebonne, par une équipe d'ici",
      edLead: "Terrebonne, c'est notre cour arrière: une partie de l'équipe y habite. On connaît ses boisés, sa rivière et les nuisibles qu'ils amènent.",
      edBody: [
        block('e1', [{ text: 'Les boisés qui longent les nouveaux développements poussent les ' }, { text: 'fourmis charpentières', ref: 'service-fourmis-charpentieres-fr' }, { text: " jusqu'aux fondations. Au bord de la rivière des Mille Îles, l'humidité attire les " }, { text: 'coquerelles', ref: 'service-coquerelles-fr' }, { text: ' et, dès les premiers froids, les ' }, { text: 'souris', ref: 'service-souris-rats-fr' }, { text: ' cherchent la chaleur des sous-sols.' }]),
        block('e2h', [{ text: "On part d'ici, souvent chez vous dans l'heure" }], 'h3'),
        block('e2', [{ text: "Parce qu'on connaît le secteur, on traite la source, on scelle les accès et on revient vérifier que tout tient. Le même technicien d'une visite à l'autre." }]),
      ],
      svcHeading: 'Nos services à Terrebonne', svcLead: "Les nuisibles qu'on traite le plus souvent dans le secteur.",
      tmHeading: 'Des clients satisfaits à Terrebonne',
      ctaTitle: "Un nuisible à Terrebonne? On part d'ici.", ctaSubtitle: "Un appel, un technicien d'ici se déplace, souvent le jour même. Garantie écrite.",
    },
    en: {
      edEyebrow: 'Our territory', edHeading: 'Pest control in Terrebonne, by a local crew',
      edLead: "Terrebonne is our backyard: part of the crew lives here. We know its woodlots, its river and the pests they bring.",
      edBody: [
        block('e1', [{ text: 'The woodlots along the new developments push ' }, { text: 'carpenter ants', ref: 'service-fourmis-charpentieres-en' }, { text: ' right to the foundations. Along the Mille Iles river, the damp draws ' }, { text: 'cockroaches', ref: 'service-coquerelles-en' }, { text: ', and at the first cold snap ' }, { text: 'mice', ref: 'service-souris-rats-en' }, { text: ' seek the warmth of basements.' }]),
        block('e2h', [{ text: 'We are based here, often at your door within the hour' }], 'h3'),
        block('e2', [{ text: 'Because we know the area, we treat the source, seal the access points and come back to check it holds. The same technician from one visit to the next.' }]),
      ],
      svcHeading: 'Our services in Terrebonne', svcLead: 'The pests we treat most often in the area.',
      tmHeading: 'Happy clients in Terrebonne',
      ctaTitle: 'A pest in Terrebonne? We are based here.', ctaSubtitle: 'One call and a local technician heads out, often the same day. Written guarantee.',
    },
  },
}

function editorialBlock(city, lang, assetRef) {
  const c = CITIES[city][lang]
  return { _key: 'pb-editorial', _type: 'editorial', eyebrow: c.edEyebrow, heading: c.edHeading, lead: c.edLead, segments: [{ _key: 'seg0', _type: 'editorialSegment', disposition: 'aside', mediaSide: 'right', body: c.edBody, media: [{ _key: 'm1', _type: 'figure', image: { _type: 'image', asset: { _ref: assetRef, _type: 'reference' } } }] }] }
}
function servicesBlock(city, lang) {
  const c = CITIES[city][lang], K = COMMON[lang]
  return { _key: 'pb-svc', _type: 'services', eyebrow: K.svcEyebrow, heading: c.svcHeading, lead: c.svcLead, mode: 'manual', items: CITIES[city].items.map((s, i) => svc(s, lang, `sv${i}`)), cta: { _type: 'link', type: 'internal', label: K.svcCta, internalRef: ref(`servicesPage-${lang}`) } }
}
function testimonialsBlock(city, lang) {
  const c = CITIES[city][lang], K = COMMON[lang]
  return { _key: 'pb-tm', _type: 'testimonials', eyebrow: K.tmEyebrow, heading: c.tmHeading, mode: 'city', city: ref(`serviceCity-${city}-${lang}`), limit: 3 }
}
function ctaBlock(city, lang) {
  const c = CITIES[city][lang], K = COMMON[lang]
  return { _key: 'pb-cta', _type: 'ctaBand', title: c.ctaTitle, subtitle: c.ctaSubtitle, primaryCta: { _type: 'link', label: K.call, type: 'tel' }, secondaryCta: { _type: 'link', anchor: 'contact', internalRef: ref(`contactPage-${lang}`), label: K.estimate, type: 'anchor' } }
}
function rebuild(city, lang, assetRef) {
  return [editorialBlock(city, lang, assetRef), { _key: 'pb-hl', _type: 'highlights', heading: COMMON[lang].hlHeading, items: COMMON[lang].highlights }, servicesBlock(city, lang), testimonialsBlock(city, lang), ctaBlock(city, lang)]
}

const LANGS = ['fr', 'en']
const TARGET = Object.keys(CITIES)

async function migrateLive() {
  for (const city of TARGET) {
    for (const lang of LANGS) {
      const id = `serviceCity-${city}-${lang}`
      const doc = await client.getDocument(id)
      if (!doc) throw new Error(`introuvable: ${id}`)
      if ((doc.pageBuilder || []).some((b) => b._type === 'highlights')) { console.log(`  ${id}: déjà migré, saut.`); continue }
      const next = rebuild(city, lang, IMG_INSPECTION_REAL)
      if (DRY) { console.log(`  ${id}: DRY -> ${next.map((b) => b._type).join(' > ')}`); continue }
      await client.patch(id).set({ pageBuilder: next }).commit({ visibility: 'sync' })
      console.log(`  ${id}: pageBuilder reconstruit (live).`)
    }
  }
}

function migrateSeed() {
  const seed = JSON.parse(readFileSync(seedPath, 'utf8'))
  let rebuilt = 0
  for (const d of seed.documents) {
    if (d.type !== 'serviceCity') continue
    const m = /^serviceCity-(.+)-(fr|en)$/.exec(d.content._id)
    if (!m || !TARGET.includes(m[1])) continue
    if ((d.content.pageBuilder || []).some((b) => b._type === 'highlights')) continue
    d.content.pageBuilder = rebuild(m[1], m[2], IMG_INSPECTION_SEED)
    rebuilt++
  }
  if (DRY) { console.log(`  seed: ${rebuilt} pageBuilder(s) (DRY).`); return }
  writeFileSync(seedPath, JSON.stringify(seed, null, 2) + '\n')
  console.log(`  seed-content.json: ${rebuilt} pageBuilder(s).`)
}

async function main() {
  console.log(`Villes détail [${TARGET.join(', ')}] (dataset ${client.config().dataset})`)
  await migrateLive()
  migrateSeed()
  console.log('Terminé.')
}
main().catch((e) => { console.error(e); process.exit(1) })
