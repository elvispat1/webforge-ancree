// Lot service détail, sous-étape C (réplique du modèle fourmis) — service souris/rats.
// Retour Charles: la « section en double au début » = l'editorial nu (sans en-tête
// ni image) qui ouvre la page. On le REMONTE en editorial riche (en-tête + image +
// structure), on retire la redite, et on aligne sur le modèle fourmis:
//   trustBar > editorial riche > highlights (bénéfices) > faq par nuisible (PT,
//   maillage, visuel seulement) > process propre aux rongeurs > testimonials > ctaBand.
//
// Crée faqTheme-souris + 5 faqItems fr+en + translation.metadata. Image editorial
// réutilisée: inspection-rempart (technicien aux points d'entrée). Pas de schéma neuf.
// Live (vrai ref) puis miroir seed (IMG:). Idempotent (saute si bloc faq présent).
//
// Usage:  node studio/seed/migrate-souris-detail.mjs [--dry-run]

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
const IMG_REAL = 'image-63ce3125380e4bf9994b4261b970c11d5b098d48-1200x896-jpg' // inspection-rempart
const IMG_SEED = 'IMG:inspection-rempart'

// Réponse PT (un bloc; parts = {text} ou {text, ref} pour un lien interne inline).
function answer(parts) {
  const children = []; const markDefs = []
  parts.forEach((p, i) => {
    if (p.ref) { const mk = `l${i}`; markDefs.push({ _key: mk, _type: 'link', type: 'internal', internalRef: ref(p.ref) }); children.push({ _key: `a0s${i}`, _type: 'span', marks: [mk], text: p.text }) }
    else children.push({ _key: `a0s${i}`, _type: 'span', marks: [], text: p.text })
  })
  return [{ _type: 'block', _key: 'a0', style: 'normal', markDefs, children }]
}
// Bloc PT simple (un paragraphe ou un h3) pour le corps editorial.
const para = (key, text, style = 'normal') => ({ _type: 'block', _key: key, style, markDefs: [], children: [{ _type: 'span', _key: key + 's', text, marks: [] }] })

const SLUG = 'souris-rats'
const THEME = { fr: { title: 'Souris et rats', slug: 'souris-rats' }, en: { title: 'Mice and rats', slug: 'mice-and-rats' } }
const ORDER = ['pieges', 'securite', 'delai', 'recidive', 'zone']

const ITEMS = {
  fr: {
    pieges: { q: 'Les pièges du commerce suffisent-ils?', a: answer([{ text: 'Ils attrapent quelques rongeurs, mais ne règlent pas la cause. Tant que les points d\'entrée restent ouverts, d\'autres prennent la place. On scelle d\'abord, puis on contrôle.' }]) },
    securite: { q: 'Les stations sont-elles sûres pour les enfants et les animaux?', a: answer([{ text: 'Oui. Les stations de contrôle sont verrouillées et posées hors de portée par un technicien certifié, avec des produits homologués Santé Canada.' }]) },
    delai: { q: 'Combien de temps avant que ce soit réglé?', a: answer([{ text: 'L\'activité chute vite une fois les accès scellés. On revient confirmer le résultat; la garantie écrite tient tant que ce n\'est pas réglé.' }]) },
    recidive: { q: 'Comment éviter qu\'elles reviennent?', a: answer([{ text: 'En fermant les ouvertures par où elles passent, pas seulement là où on les voit: tuyaux, fondation, garage. La garantie couvre un retour si elles reviennent.' }]) },
    zone: { q: 'Desservez-vous mon secteur sur la Rive-Nord?', a: answer([{ text: 'Oui, de ' }, { text: 'Mascouche', ref: 'serviceCity-mascouche-fr' }, { text: ' à ' }, { text: 'Blainville', ref: 'serviceCity-blainville-fr' }, { text: ' et toute la couronne nord. Un technicien d\'ici se déplace, souvent sous 24 à 48 h.' }]) },
  },
  en: {
    pieges: { q: 'Are store-bought traps enough?', a: answer([{ text: 'They catch a few rodents but do not fix the cause. As long as the entry points stay open, others take their place. We seal first, then control.' }]) },
    securite: { q: 'Are the stations safe for children and pets?', a: answer([{ text: 'Yes. The control stations are locked and placed out of reach by a certified technician, with Health Canada approved products.' }]) },
    delai: { q: 'How long before it is solved?', a: answer([{ text: 'Activity drops quickly once the access points are sealed. We return to confirm the result; the written guarantee holds until it is solved.' }]) },
    recidive: { q: 'How do I keep them from coming back?', a: answer([{ text: 'By closing the openings they use, not just where you see them: pipes, foundation, garage. The guarantee covers a return visit if they come back.' }]) },
    zone: { q: 'Do you serve my area on the North Shore?', a: answer([{ text: 'Yes, from ' }, { text: 'Mascouche', ref: 'serviceCity-mascouche-en' }, { text: ' to ' }, { text: 'Blainville', ref: 'serviceCity-blainville-en' }, { text: ' and the whole north crown. A local technician heads out, often within 24 to 48 hours.' }]) },
  },
}

const BLOCKS = {
  fr: {
    trustBar: { _key: 'pb-trust', _type: 'trustBar', items: [
      { _key: 't1', _type: 'proof', icon: 'lucide:award', value: 'Membre ASTTQ', label: 'gestion parasitaire du Québec' },
      { _key: 't2', _type: 'proof', icon: 'lucide:leaf', value: 'Produits homologués', label: 'Santé Canada, sûrs pour la famille' },
      { _key: 't3', _type: 'proof', icon: 'lucide:clock', value: 'Sous 24 à 48 h', label: 'intervention 7 jours sur 7' },
      { _key: 't4', _type: 'proof', icon: 'lucide:badge-check', value: 'Garantie écrite', label: 'retour sans frais' },
    ] },
    editorial: {
      eyebrow: 'Le nuisible en détail', heading: 'Comprendre une infestation de souris et de rats',
      lead: 'Ce n\'est pas qu\'une question de pièges. Tant que la maison reste ouverte, les rongeurs reviennent. Voici comment on ferme la porte pour de bon.',
      seg1: [
        para('e1', 'Une souris passe par une ouverture grande comme un dix sous. Une fois à l\'intérieur, elle se reproduit vite, contamine la nourriture et ronge le filage, un vrai risque d\'incendie. Les pièges seuls ne font que gérer les symptômes.'),
      ],
      seg2: [
        para('e2h', 'Fermer la maison, pas seulement piéger', 'h3'),
        para('e2', 'On inspecte de la cave au grenier, on scelle les points d\'entrée, puis on installe un contrôle adapté. Le but n\'est pas d\'en attraper quelques-unes, c\'est de fermer la maison pour de bon.'),
      ],
    },
    highlights: { heading: 'Ce que comprend l\'intervention', items: [
      { _key: 'benefit-0', _type: 'highlight', title: 'Garantie écrite, retour sans frais', body: 'Si les rongeurs reviennent dans la période couverte, on retraite sans vous refacturer.' },
      { _key: 'benefit-1', _type: 'highlight', title: 'Stations de contrôle sécurisées', body: 'Verrouillées et hors de portée des enfants et des animaux, posées par un technicien certifié.' },
      { _key: 'benefit-2', _type: 'highlight', title: 'Intervention sous 24 à 48 h', body: 'Une vraie personne répond 7 jours sur 7 et un technicien d\'ici part vers vous rapidement.' },
      { _key: 'benefit-3', _type: 'highlight', title: 'Points d\'entrée scellés, rapport écrit', body: 'Ce qu\'on a trouvé, scellé, et les accès à surveiller pour éviter une récidive.' },
    ] },
    faq: { _key: 'pb-faq', _type: 'faq', eyebrow: 'Avant d\'appeler', heading: 'Vos questions sur les souris et les rats' },
    process: { heading: 'Comment on règle une infestation de rongeurs', lead: 'On ferme la maison, pas seulement on piège.', steps: [
      { _key: 's1', _type: 'processStep', title: 'Inspection de la cave au grenier', body: 'On repère les points d\'entrée, les sentiers et l\'ampleur, du sous-sol au toit.' },
      { _key: 's2', _type: 'processStep', title: 'Scellement des accès', body: 'On ferme les ouvertures par où elles passent, pas juste là où on les voit.' },
      { _key: 's3', _type: 'processStep', title: 'Contrôle et garantie écrite', body: 'Stations sécurisées, suivi du résultat; la garantie tient si elles reviennent.' },
    ] },
    cta: { title: 'Des souris ou des rats dans la maison? On ferme la porte.', subtitle: 'Un appel, un technicien licencié se déplace, souvent sous 24 à 48 h. Garantie écrite.' },
  },
  en: {
    trustBar: { _key: 'pb-trust', _type: 'trustBar', items: [
      { _key: 't1', _type: 'proof', icon: 'lucide:award', value: 'ASTTQ member', label: 'Quebec pest management' },
      { _key: 't2', _type: 'proof', icon: 'lucide:leaf', value: 'Approved products', label: 'Health Canada, family-safe' },
      { _key: 't3', _type: 'proof', icon: 'lucide:clock', value: 'Within 24 to 48 h', label: 'service seven days a week' },
      { _key: 't4', _type: 'proof', icon: 'lucide:badge-check', value: 'Written guarantee', label: 'free return visit' },
    ] },
    editorial: {
      eyebrow: 'The pest in detail', heading: 'Understanding a mouse and rat infestation',
      lead: 'It is not just about traps. As long as the house stays open, rodents keep coming back. Here is how we close the door for good.',
      seg1: [
        para('e1', 'A mouse fits through a gap the size of a dime. Once inside, it breeds fast, contaminates food and chews on wiring, a real fire risk. Traps alone only manage the symptoms.'),
      ],
      seg2: [
        para('e2h', 'Closing the house, not just trapping', 'h3'),
        para('e2', 'We inspect from basement to attic, seal the entry points, then set up the right control. The goal is not to catch a few, it is to close the house for good.'),
      ],
    },
    highlights: { heading: 'What the service includes', items: [
      { _key: 'benefit-0', _type: 'highlight', title: 'Written guarantee, free return visit', body: 'If the rodents come back within the covered period, we re-treat at no extra charge.' },
      { _key: 'benefit-1', _type: 'highlight', title: 'Secure control stations', body: 'Locked and out of reach of children and pets, placed by a certified technician.' },
      { _key: 'benefit-2', _type: 'highlight', title: 'On site within 24 to 48 h', body: 'A real person answers seven days a week and a local technician heads your way quickly.' },
      { _key: 'benefit-3', _type: 'highlight', title: 'Entry points sealed, written report', body: 'What we found, sealed, and the access points to watch to avoid a return.' },
    ] },
    faq: { _key: 'pb-faq', _type: 'faq', eyebrow: 'Before you call', heading: 'Your questions about mice and rats' },
    process: { heading: 'How we clear a rodent infestation', lead: 'We close the house, not just set traps.', steps: [
      { _key: 's1', _type: 'processStep', title: 'Basement-to-attic inspection', body: 'We find the entry points, the runways and the scale, from the basement to the roof.' },
      { _key: 's2', _type: 'processStep', title: 'Sealing the access points', body: 'We close the openings they use, not just where you can see them.' },
      { _key: 's3', _type: 'processStep', title: 'Control and written guarantee', body: 'Secure stations, a follow-up on the result; the guarantee holds if they come back.' },
    ] },
    cta: { title: 'Mice or rats in the house? We close the door.', subtitle: 'One call and a licensed technician heads out, often within 24 to 48 hours. Written guarantee.' },
  },
}

function editorial(lang, assetRef) {
  const e = BLOCKS[lang].editorial
  return {
    _key: 'pb-editorial', _type: 'editorial', eyebrow: e.eyebrow, heading: e.heading, lead: e.lead,
    segments: [
      { _key: 'seg1', _type: 'editorialSegment', disposition: 'aside', mediaSide: 'right', body: e.seg1, media: [{ _key: 'm1', _type: 'figure', image: { _type: 'image', asset: { _ref: assetRef, _type: 'reference' } } }] },
      { _key: 'seg2', _type: 'editorialSegment', disposition: 'text', mediaSide: 'auto', body: e.seg2, media: [] },
    ],
  }
}
function faqBlock(lang) {
  const b = BLOCKS[lang].faq
  return { ...b, items: ORDER.map((k, i) => ({ ...ref(`faqItem-${SLUG}-${k}-${lang}`), _key: `fq${i}` })) }
}
function themeDoc(lang) { return { _id: `faqTheme-${SLUG}-${lang}`, _type: 'faqTheme', language: lang, title: THEME[lang].title, slug: { _type: 'slug', current: THEME[lang].slug } } }
function itemDoc(lang, k) { const it = ITEMS[lang][k]; return { _id: `faqItem-${SLUG}-${k}-${lang}`, _type: 'faqItem', language: lang, question: it.q, answer: it.a, theme: ref(`faqTheme-${SLUG}-${lang}`) } }
function tmDoc(id, schemaType, frId, enId) {
  const tval = (lang, vid) => ({ _key: lang, _type: 'internationalizedArrayReferenceValue', language: lang, value: { _type: 'reference', _ref: vid, _weak: true, _strengthenOnPublish: { type: schemaType } } })
  return { _id: id, _type: 'translation.metadata', schemaTypes: [schemaType], translations: [tval('fr', frId), tval('en', enId)] }
}

function rebuild(pb, lang, assetRef) {
  const B = BLOCKS[lang]
  const tm = pb.find((b) => b._type === 'testimonials')
  const hl = pb.find((b) => b._type === 'highlights')
  const proc = pb.find((b) => b._type === 'process')
  const cta = pb.find((b) => b._type === 'ctaBand')
  if (!tm || !hl || !proc || !cta) throw new Error(`${lang}: bloc attendu manquant.`)
  return [
    B.trustBar,
    editorial(lang, assetRef),
    { ...hl, heading: B.highlights.heading, items: B.highlights.items },
    faqBlock(lang),
    { ...proc, heading: B.process.heading, lead: B.process.lead, steps: B.process.steps },
    tm,
    { ...cta, title: B.cta.title, subtitle: B.cta.subtitle },
  ]
}

const LANGS = ['fr', 'en']

async function migrateLive() {
  const docs = []
  for (const lang of LANGS) { docs.push(themeDoc(lang)); for (const k of ORDER) docs.push(itemDoc(lang, k)) }
  docs.push(tmDoc(`translation-faqTheme-${SLUG}`, 'faqTheme', `faqTheme-${SLUG}-fr`, `faqTheme-${SLUG}-en`))
  for (const k of ORDER) docs.push(tmDoc(`translation-faqItem-${SLUG}-${k}`, 'faqItem', `faqItem-${SLUG}-${k}-fr`, `faqItem-${SLUG}-${k}-en`))
  if (DRY) { console.log(`  live: ${docs.length} doc(s) FAQ (DRY).`) }
  else { let tx = client.transaction(); for (const d of docs) tx = tx.createOrReplace(d); await tx.commit({ visibility: 'sync' }); console.log(`  live: ${docs.length} doc(s) FAQ créés/remplacés.`) }

  for (const lang of LANGS) {
    const id = `service-${SLUG}-${lang}`
    const doc = await client.getDocument(id)
    if (!doc) throw new Error(`introuvable: ${id}`)
    if ((doc.pageBuilder || []).some((b) => b._type === 'faq')) { console.log(`  ${id}: déjà migré, saut.`); continue }
    const next = rebuild(doc.pageBuilder || [], lang, IMG_REAL)
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
  push(tmDoc(`translation-faqTheme-${SLUG}`, 'faqTheme', `faqTheme-${SLUG}-fr`, `faqTheme-${SLUG}-en`), 'translation.metadata')
  for (const k of ORDER) push(tmDoc(`translation-faqItem-${SLUG}-${k}`, 'faqItem', `faqItem-${SLUG}-${k}-fr`, `faqItem-${SLUG}-${k}-en`), 'translation.metadata')

  let rebuilt = 0
  for (const d of seed.documents) {
    if (d.type !== 'service' || !`${d.content._id}`.startsWith(`service-${SLUG}-`)) continue
    if ((d.content.pageBuilder || []).some((b) => b._type === 'faq')) continue
    d.content.pageBuilder = rebuild(d.content.pageBuilder, d.content.language, IMG_SEED)
    rebuilt++
  }
  if (DRY) { console.log(`  seed: +${added} doc(s), ${rebuilt} pageBuilder(s) (DRY).`); return }
  writeFileSync(seedPath, JSON.stringify(seed, null, 2) + '\n')
  console.log(`  seed-content.json: +${added} doc(s), ${rebuilt} pageBuilder(s).`)
}

async function main() {
  console.log(`Sous-étape C, service souris/rats (dataset ${client.config().dataset})`)
  await migrateLive()
  migrateSeed()
  console.log('Terminé.')
}
main().catch((e) => { console.error(e); process.exit(1) })
