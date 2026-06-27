// Enrichit le HUB villes (/villes), la page la plus maigre: entre le pageHero et la
// conversion, on ajoute une intro de zone (editorial + maillage inline), de la
// crédibilité (trustBar), de la preuve sociale multi-villes (testimonials featured) et
// des objections de zone (faq). Séquence cible:
//   pageHero > editorial > serviceCities > trustBar > testimonials > faq > ctaBand > contact
// On RÉUTILISE serviceCities + ctaBand + contact existants; on insère le reste.
//
// Crée faqTheme-zone + 4 faqItems fr+en + translation.metadata. Editorial = un aside
// (image hero-vanHood: camionnette de quartier, ancrage local), maillage inline vers
// services et villes. Live (vrais refs) puis miroir seed (IMG:). Idempotent (saute si
// editorial présent).
//
// Usage:  node studio/seed/migrate-villes-hub.mjs [--dry-run]

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
const figure = (assetRef) => ({ _type: 'figure', image: { _type: 'image', asset: { _ref: assetRef, _type: 'reference' } } })
const IMG_SEED = 'IMG:hero-vanHood'

// Bloc Portable Text (un paragraphe / h3), `parts` = {text} ou {text, ref} (lien
// interne inline). Sert au corps editorial ET aux réponses faq.
function block(key, parts, style = 'normal') {
  const children = []; const markDefs = []
  parts.forEach((p, i) => {
    if (p.ref) { const mk = `${key}l${i}`; markDefs.push({ _key: mk, _type: 'link', type: 'internal', internalRef: ref(p.ref) }); children.push({ _key: `${key}s${i}`, _type: 'span', marks: [mk], text: p.text }) }
    else children.push({ _key: `${key}s${i}`, _type: 'span', marks: [], text: p.text })
  })
  return { _type: 'block', _key: key, style, markDefs, children }
}
const answer = (parts) => [block('a0', parts)]

const THEME = { fr: { title: 'Zone desservie', slug: 'zone-desservie' }, en: { title: 'Service area', slug: 'service-area' } }
const ORDER = ['couverture', 'delai', 'urgence', 'nuisibles']

const ITEMS = {
  fr: {
    couverture: { q: 'Desservez-vous ma ville?', a: answer([{ text: 'Oui, toute la couronne nord, de ' }, { text: 'Laval', ref: 'serviceCity-laval-fr' }, { text: ' à ' }, { text: 'Terrebonne', ref: 'serviceCity-terrebonne-fr' }, { text: ' et au-delà: Repentigny, Blainville, Mascouche, Boisbriand, Saint-Eustache. La mosaïque ci-dessous mène à votre ville.' }]) },
    delai: { q: 'En combien de temps pouvez-vous venir?', a: answer([{ text: "Souvent sous 24 à 48 h, parfois le jour même selon le secteur. Une vraie personne répond 7 jours sur 7." }]) },
    urgence: { q: 'Intervenez-vous en urgence?', a: answer([{ text: "Oui. Un nid de guêpes près d'une porte, une infestation qui s'aggrave: on priorise. Appelez, on évalue tout de suite." }]) },
    nuisibles: { q: 'Quels nuisibles traitez-vous dans ma région?', a: answer([{ text: 'Tous les courants de la Rive-Nord: ' }, { text: 'fourmis charpentières', ref: 'service-fourmis-charpentieres-fr' }, { text: ', ' }, { text: 'souris et rats', ref: 'service-souris-rats-fr' }, { text: ', ' }, { text: 'punaises de lit', ref: 'service-punaises-de-lit-fr' }, { text: ', ' }, { text: 'guêpes et frelons', ref: 'service-guepes-frelons-fr' }, { text: ', ' }, { text: 'coquerelles', ref: 'service-coquerelles-fr' }, { text: ' et la ' }, { text: 'gestion commerciale', ref: 'service-commercial-fr' }, { text: '.' }]) },
  },
  en: {
    couverture: { q: 'Do you serve my city?', a: answer([{ text: 'Yes, the whole north crown, from ' }, { text: 'Laval', ref: 'serviceCity-laval-en' }, { text: ' to ' }, { text: 'Terrebonne', ref: 'serviceCity-terrebonne-en' }, { text: ' and beyond: Repentigny, Blainville, Mascouche, Boisbriand, Saint-Eustache. The mosaic below leads to your city.' }]) },
    delai: { q: 'How soon can you come?', a: answer([{ text: 'Often within 24 to 48 hours, sometimes the same day depending on the area. A real person answers seven days a week.' }]) },
    urgence: { q: 'Do you handle emergencies?', a: answer([{ text: "Yes. A wasp nest near a door, an infestation getting worse: we prioritize it. Call us and we assess right away." }]) },
    nuisibles: { q: 'Which pests do you treat in my area?', a: answer([{ text: 'All the common North Shore ones: ' }, { text: 'carpenter ants', ref: 'service-fourmis-charpentieres-en' }, { text: ', ' }, { text: 'mice and rats', ref: 'service-souris-rats-en' }, { text: ', ' }, { text: 'bed bugs', ref: 'service-punaises-de-lit-en' }, { text: ', ' }, { text: 'wasps and hornets', ref: 'service-guepes-frelons-en' }, { text: ', ' }, { text: 'cockroaches', ref: 'service-coquerelles-en' }, { text: ' and ' }, { text: 'commercial pest management', ref: 'service-commercial-en' }, { text: '.' }]) },
  },
}

const BLOCKS = {
  fr: {
    editorial: {
      eyebrow: 'Notre territoire', heading: 'On connaît la Rive-Nord, secteur par secteur',
      lead: "Depuis 2008, au départ de Terrebonne, on traite les nuisibles de toute la couronne nord. Bâti des années 1970, sous-sols humides, terrains boisés: chaque secteur a ses habitués.",
      body: [
        block('e1', [{ text: 'Les ' }, { text: 'fourmis charpentières', ref: 'service-fourmis-charpentieres-fr' }, { text: " arrivent par les arbres matures, les souris cherchent la chaleur des fondations dès l'automne, les guêpes nichent sous les galeries tout l'été. On connaît la saison de chaque nuisible et on intervient vite." }]),
        block('e2h', [{ text: 'Une équipe déjà dans votre secteur' }], 'h3'),
        block('e2', [{ text: "On ne part pas de loin: nos techniciens couvrent " }, { text: 'Laval', ref: 'serviceCity-laval-fr' }, { text: ', ' }, { text: 'Terrebonne', ref: 'serviceCity-terrebonne-fr' }, { text: " et toute la couronne nord au quotidien. Voir " }, { text: 'tous nos services', ref: 'servicesPage-fr' }, { text: ' ou trouvez votre ville plus bas.' }]),
      ],
    },
    trustBar: { _key: 'pb-trust', _type: 'trustBar', items: [
      { _key: 't1', _type: 'proof', icon: 'lucide:award', value: 'Membre ASTTQ', label: 'gestion parasitaire du Québec' },
      { _key: 't2', _type: 'proof', icon: 'lucide:leaf', value: 'Produits homologués', label: 'Santé Canada, sûrs pour la famille' },
      { _key: 't3', _type: 'proof', icon: 'lucide:clock', value: 'Sous 24 à 48 h', label: 'intervention 7 jours sur 7' },
      { _key: 't4', _type: 'proof', icon: 'lucide:badge-check', value: 'Depuis 2008', label: 'au départ de Terrebonne' },
    ] },
    testimonials: { _key: 'pb-tm', _type: 'testimonials', eyebrow: 'Sur le terrain', heading: 'Des clients dans toute la couronne nord', mode: 'featured', limit: 3 },
    faq: { _key: 'pb-faq', _type: 'faq', eyebrow: 'Avant d\'appeler', heading: 'Vos questions sur la zone desservie' },
  },
  en: {
    editorial: {
      eyebrow: 'Our territory', heading: 'We know the North Shore, area by area',
      lead: "Since 2008, working out of Terrebonne, we treat pests across the whole north crown. 1970s housing stock, damp basements, wooded lots: every area has its regulars.",
      body: [
        block('e1', [{ text: 'The ' }, { text: 'carpenter ants', ref: 'service-fourmis-charpentieres-en' }, { text: ' come in from mature trees, mice seek the warmth of foundations in the fall, wasps nest under decks all summer. We know each pest season and we move fast.' }]),
        block('e2h', [{ text: 'A crew already in your area' }], 'h3'),
        block('e2', [{ text: 'We do not come from far: our technicians cover ' }, { text: 'Laval', ref: 'serviceCity-laval-en' }, { text: ', ' }, { text: 'Terrebonne', ref: 'serviceCity-terrebonne-en' }, { text: ' and the whole north crown every day. See ' }, { text: 'all our services', ref: 'servicesPage-en' }, { text: ' or find your city below.' }]),
      ],
    },
    trustBar: { _key: 'pb-trust', _type: 'trustBar', items: [
      { _key: 't1', _type: 'proof', icon: 'lucide:award', value: 'ASTTQ member', label: 'Quebec pest management' },
      { _key: 't2', _type: 'proof', icon: 'lucide:leaf', value: 'Approved products', label: 'Health Canada, family-safe' },
      { _key: 't3', _type: 'proof', icon: 'lucide:clock', value: 'Within 24 to 48 h', label: 'service seven days a week' },
      { _key: 't4', _type: 'proof', icon: 'lucide:badge-check', value: 'Since 2008', label: 'based in Terrebonne' },
    ] },
    testimonials: { _key: 'pb-tm', _type: 'testimonials', eyebrow: 'On the ground', heading: 'Clients across the north suburbs', mode: 'featured', limit: 3 },
    faq: { _key: 'pb-faq', _type: 'faq', eyebrow: 'Before you call', heading: 'Your questions about our service area' },
  },
}

function editorialBlock(lang, assetRef) {
  const e = BLOCKS[lang].editorial
  return { _key: 'pb-editorial', _type: 'editorial', eyebrow: e.eyebrow, heading: e.heading, lead: e.lead, segments: [{ _key: 'seg0', _type: 'editorialSegment', disposition: 'aside', mediaSide: 'right', body: e.body, media: [{ _key: 'm1', _type: 'figure', image: { _type: 'image', asset: { _ref: assetRef, _type: 'reference' } } }] }] }
}
function faqBlock(lang) {
  const b = BLOCKS[lang].faq
  return { ...b, items: ORDER.map((k, i) => ({ ...ref(`faqItem-zone-${k}-${lang}`), _key: `fq${i}` })) }
}
function themeDoc(lang) { return { _id: `faqTheme-zone-${lang}`, _type: 'faqTheme', language: lang, title: THEME[lang].title, slug: { _type: 'slug', current: THEME[lang].slug } } }
function itemDoc(lang, k) { const it = ITEMS[lang][k]; return { _id: `faqItem-zone-${k}-${lang}`, _type: 'faqItem', language: lang, question: it.q, answer: it.a, theme: ref(`faqTheme-zone-${lang}`) } }
function tmDoc(id, schemaType, frId, enId) {
  const tval = (lang, vid) => ({ _key: lang, _type: 'internationalizedArrayReferenceValue', language: lang, value: { _type: 'reference', _ref: vid, _weak: true, _strengthenOnPublish: { type: schemaType } } })
  return { _id: id, _type: 'translation.metadata', schemaTypes: [schemaType], translations: [tval('fr', frId), tval('en', enId)] }
}

function rebuild(pb, lang, assetRef) {
  const B = BLOCKS[lang]
  const sc = pb.find((b) => b._type === 'serviceCities')
  const cta = pb.find((b) => b._type === 'ctaBand')
  const ct = pb.find((b) => b._type === 'contact')
  if (!sc || !cta || !ct) throw new Error(`${lang}: bloc attendu manquant (serviceCities/ctaBand/contact).`)
  return [editorialBlock(lang, assetRef), sc, B.trustBar, B.testimonials, faqBlock(lang), cta, ct]
}

const LANGS = ['fr', 'en']

async function migrateLive() {
  // Réf live de hero-vanHood: le masthead de villesPage le porte déjà.
  const vp = await client.getDocument('villesPage-fr')
  const vanRef = vp?.hero?.[0]?.image?.image?.asset?._ref
  if (!vanRef) throw new Error('Réf hero-vanHood introuvable sur villesPage-fr.')

  const docs = []
  for (const lang of LANGS) { docs.push(themeDoc(lang)); for (const k of ORDER) docs.push(itemDoc(lang, k)) }
  docs.push(tmDoc('translation-faqTheme-zone', 'faqTheme', 'faqTheme-zone-fr', 'faqTheme-zone-en'))
  for (const k of ORDER) docs.push(tmDoc(`translation-faqItem-zone-${k}`, 'faqItem', `faqItem-zone-${k}-fr`, `faqItem-zone-${k}-en`))
  if (DRY) console.log(`  live: ${docs.length} doc(s) FAQ (DRY) | vanRef ${vanRef}`)
  else { let tx = client.transaction(); for (const d of docs) tx = tx.createOrReplace(d); await tx.commit({ visibility: 'sync' }); console.log(`  live: ${docs.length} doc(s) FAQ créés/remplacés.`) }

  for (const lang of LANGS) {
    const id = `villesPage-${lang}`
    const doc = await client.getDocument(id)
    if (!doc) throw new Error(`introuvable: ${id}`)
    if ((doc.pageBuilder || []).some((b) => b._type === 'editorial')) { console.log(`  ${id}: déjà migré, saut.`); continue }
    const next = rebuild(doc.pageBuilder || [], lang, vanRef)
    if (DRY) { console.log(`  ${id}: DRY -> ${next.map((b) => b._type).join(' > ')}`); continue }
    await client.patch(id).set({ pageBuilder: next }).commit({ visibility: 'sync' })
    console.log(`  ${id}: pageBuilder reconstruit (live).`)
  }
}

function migrateSeed() {
  const seed = JSON.parse(readFileSync(seedPath, 'utf8'))
  const have = new Set(seed.documents.map((d) => d.content?._id).filter(Boolean))
  let added = 0
  const push = (content, type) => { if (have.has(content._id)) return; seed.documents.push({ type, content }); have.add(content._id); added++ }
  for (const lang of LANGS) { push(themeDoc(lang), 'faqTheme'); for (const k of ORDER) push(itemDoc(lang, k), 'faqItem') }
  push(tmDoc('translation-faqTheme-zone', 'faqTheme', 'faqTheme-zone-fr', 'faqTheme-zone-en'), 'translation.metadata')
  for (const k of ORDER) push(tmDoc(`translation-faqItem-zone-${k}`, 'faqItem', `faqItem-zone-${k}-fr`, `faqItem-zone-${k}-en`), 'translation.metadata')

  let rebuilt = 0
  for (const d of seed.documents) {
    if (d.type !== 'villesPage') continue
    if ((d.content.pageBuilder || []).some((b) => b._type === 'editorial')) continue
    d.content.pageBuilder = rebuild(d.content.pageBuilder, d.content.language, IMG_SEED)
    rebuilt++
  }
  if (DRY) { console.log(`  seed: +${added} doc(s), ${rebuilt} pageBuilder(s) (DRY).`); return }
  writeFileSync(seedPath, JSON.stringify(seed, null, 2) + '\n')
  console.log(`  seed-content.json: +${added} doc(s), ${rebuilt} pageBuilder(s).`)
}

async function main() {
  console.log(`Hub villes /villes (dataset ${client.config().dataset})`)
  await migrateLive()
  migrateSeed()
  console.log('Terminé.')
}
main().catch((e) => { console.error(e); process.exit(1) })
