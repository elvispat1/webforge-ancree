// Lot service détail, sous-étape C (modèle fourmis/souris) — service punaises de lit.
// La page n'avait qu'un editorial nu + highlights + process dupliqué. On l'aligne sur
// le modèle validé:
//   trustBar > editorial riche > highlights (bénéfices) > faq par nuisible (PT,
//   maillage, visuel seulement) > process propre aux punaises > testimonials > ctaBand.
//
// Contenu PROPRE aux punaises (pas de copier-coller): signes, chaleur vs insecticides,
// préparation, traitement thermique et résiduel, contrôle de suivi. Editorial = UN
// aside équilibré (modèle souris), image paysage inspection-rempart (ratio respecté).
// Crée faqTheme-punaises-de-lit + 5 faqItems fr+en + translation.metadata. Pas de
// schéma neuf. Live (vrai ref) puis miroir seed (IMG:). Idempotent (saute si faq présent).
//
// Usage:  node studio/seed/migrate-punaises-detail.mjs [--dry-run]

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
const IMG_REAL = 'image-63ce3125380e4bf9994b4261b970c11d5b098d48-1200x896-jpg' // inspection-rempart (paysage)
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

const SLUG = 'punaises-de-lit'
const THEME = { fr: { title: 'Punaises de lit', slug: 'punaises-de-lit' }, en: { title: 'Bed bugs', slug: 'bed-bugs' } }
const ORDER = ['preparation', 'securite', 'delai', 'voyage', 'zone']

const ITEMS = {
  fr: {
    preparation: { q: "Comment préparer mon logement avant le traitement?", a: answer([{ text: "On vous remet une liste claire: laver et sécher à haute température la literie et les vêtements des chambres, désencombrer sans tout déménager, et dégager l'accès aux lits et aux plinthes. Une bonne préparation, c'est la moitié du résultat." }]) },
    securite: { q: "Le traitement est-il sûr pour les enfants et les animaux?", a: answer([{ text: "Oui. On privilégie la chaleur, qui ne laisse aucun résidu, et tout produit d'appoint est homologué Santé Canada, appliqué par un technicien certifié. On vous indique le délai avant de réintégrer la pièce." }]) },
    delai: { q: "Combien de visites avant d'en être débarrassé?", a: answer([{ text: "Souvent une à deux: le traitement, puis un contrôle de suivi deux à trois semaines plus tard pour confirmer qu'aucun œuf n'a survécu. La garantie écrite tient jusqu'à ce que ce soit réglé." }]) },
    voyage: { q: "D'où viennent les punaises de lit?", a: answer([{ text: "Le plus souvent d'un voyage, d'un meuble usagé ou d'une visite. Elles suivent les gens, pas la malpropreté. Au retour de voyage, inspectez les valises avant de les ranger." }]) },
    zone: { q: "Desservez-vous mon secteur sur la Rive-Nord?", a: answer([{ text: "Oui, de " }, { text: "Repentigny", ref: 'serviceCity-repentigny-fr' }, { text: " à " }, { text: "Blainville", ref: 'serviceCity-blainville-fr' }, { text: " et toute la couronne nord. Un technicien d'ici se déplace, souvent sous 24 à 48 h." }]) },
  },
  en: {
    preparation: { q: "How do I prepare my home before treatment?", a: answer([{ text: "We give you a clear checklist: wash and dry bedding and bedroom clothing on high heat, declutter without moving everything out, and clear access to the beds and baseboards. Good preparation is half the result." }]) },
    securite: { q: "Is the treatment safe for children and pets?", a: answer([{ text: "Yes. We rely on heat, which leaves no residue, and any backup product is Health Canada approved and applied by a certified technician. We tell you how long to wait before using the room again." }]) },
    delai: { q: "How many visits before they are gone?", a: answer([{ text: "Often one or two: the treatment, then a follow-up check two to three weeks later to confirm no egg survived. The written guarantee holds until it is solved." }]) },
    voyage: { q: "Where do bed bugs come from?", a: answer([{ text: "Most often from travel, second-hand furniture or a visit. They follow people, not poor hygiene. After a trip, inspect your luggage before storing it." }]) },
    zone: { q: "Do you serve my area on the North Shore?", a: answer([{ text: "Yes, from " }, { text: "Repentigny", ref: 'serviceCity-repentigny-en' }, { text: " to " }, { text: "Blainville", ref: 'serviceCity-blainville-en' }, { text: " and the whole north crown. A local technician heads out, often within 24 to 48 hours." }]) },
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
      eyebrow: 'Le nuisible en détail', heading: 'Comprendre une infestation de punaises de lit',
      lead: "Elles ne sont pas un signe de malpropreté: elles voyagent avec nous, se cachent le jour et piquent la nuit. S'en débarrasser demande de la méthode, pas un simple insecticide.",
      body: [
        para('e1', "Les punaises de lit se logent dans les coutures du matelas, le sommier, la tête de lit et les plinthes. Les signes ne trompent pas: des piqûres alignées au réveil, de petits points noirs sur les draps, parfois des mues le long des coutures. Elles passent d'une pièce à l'autre et résistent aux traitements faits maison."),
        para('e2h', "La chaleur, là où les insecticides échouent", 'h3'),
        para('e2', "Un produit de surface ne touche ni les œufs ni les punaises cachées dans leurs refuges. On traite par la chaleur, létale à toutes les étapes de vie, complétée d'un produit homologué rémanent aux endroits stratégiques. Avec une préparation soignée et un contrôle de suivi, on referme le cycle au complet."),
      ],
    },
    highlights: { heading: "Ce que comprend l'intervention", items: [
      { _key: 'benefit-0', _type: 'highlight', title: 'Garantie écrite, retour sans frais', body: "Si les punaises réapparaissent dans la période couverte, on retraite sans vous refacturer." },
      { _key: 'benefit-1', _type: 'highlight', title: 'Chaleur sans résidu, produits homologués', body: "La chaleur ne laisse aucun résidu; tout produit d'appoint est homologué Santé Canada, sûr pour les enfants et les animaux." },
      { _key: 'benefit-2', _type: 'highlight', title: 'Intervention sous 24 à 48 h', body: "Une vraie personne répond 7 jours sur 7 et un technicien d'ici part vers vous rapidement." },
      { _key: 'benefit-3', _type: 'highlight', title: 'Préparation guidée, rapport écrit', body: "Une liste de préparation claire avant la visite et un rapport de ce qui a été traité et des points à surveiller." },
    ] },
    faq: { _key: 'pb-faq', _type: 'faq', eyebrow: "Avant d'appeler", heading: 'Vos questions sur les punaises de lit' },
    process: { heading: 'Comment on traite une infestation de punaises de lit', lead: "On vise tout le cycle de vie, pas seulement les insectes visibles.", steps: [
      { _key: 's1', _type: 'processStep', title: 'Préparation et inspection ciblée', body: "On vous remet une liste de préparation, puis on inspecte les coutures, le sommier et les plinthes pour repérer tous les refuges." },
      { _key: 's2', _type: 'processStep', title: 'Traitement thermique et résiduel', body: "La chaleur atteint toutes les étapes de vie; un produit homologué rémanent ferme les refuges restants." },
      { _key: 's3', _type: 'processStep', title: 'Contrôle de suivi et garantie écrite', body: "Une seconde visite confirme qu'aucun œuf n'a survécu; la garantie tient jusqu'à ce que ce soit réglé." },
    ] },
    cta: { title: 'Des punaises de lit? On referme le cycle pour de bon.', subtitle: "Un appel, un technicien certifié évalue et planifie le traitement, souvent sous 24 à 48 h. Garantie écrite." },
  },
  en: {
    trustBar: { _key: 'pb-trust', _type: 'trustBar', items: [
      { _key: 't1', _type: 'proof', icon: 'lucide:award', value: 'ASTTQ member', label: 'Quebec pest management' },
      { _key: 't2', _type: 'proof', icon: 'lucide:leaf', value: 'Approved products', label: 'Health Canada, family-safe' },
      { _key: 't3', _type: 'proof', icon: 'lucide:clock', value: 'Within 24 to 48 h', label: 'service seven days a week' },
      { _key: 't4', _type: 'proof', icon: 'lucide:badge-check', value: 'Written guarantee', label: 'free return visit' },
    ] },
    editorial: {
      eyebrow: 'The pest in detail', heading: 'Understanding a bed bug infestation',
      lead: "They are not a sign of poor hygiene: they travel with us, hide by day and bite at night. Getting rid of them takes method, not a simple insecticide.",
      body: [
        para('e1', "Bed bugs settle into mattress seams, the box spring, the headboard and the baseboards. The signs are clear: bites in a line when you wake, small dark specks on the sheets, sometimes shed skins along the seams. They move from room to room and resist do-it-yourself treatments."),
        para('e2h', "Heat, where insecticides fall short", 'h3'),
        para('e2', "A surface product reaches neither the eggs nor the bugs tucked into their harbourages. We treat with heat, lethal at every life stage, backed by an approved residual product in the key spots. With careful preparation and a follow-up check, we close the whole cycle."),
      ],
    },
    highlights: { heading: "What the service includes", items: [
      { _key: 'benefit-0', _type: 'highlight', title: 'Written guarantee, free return visit', body: "If the bed bugs come back within the covered period, we re-treat at no extra charge." },
      { _key: 'benefit-1', _type: 'highlight', title: 'Residue-free heat, approved products', body: "Heat leaves no residue; any backup product is Health Canada approved and safe for children and pets." },
      { _key: 'benefit-2', _type: 'highlight', title: 'On site within 24 to 48 h', body: "A real person answers seven days a week and a local technician heads your way quickly." },
      { _key: 'benefit-3', _type: 'highlight', title: 'Guided preparation, written report', body: "A clear preparation checklist before the visit and a report of what was treated and what to watch." },
    ] },
    faq: { _key: 'pb-faq', _type: 'faq', eyebrow: 'Before you call', heading: 'Your questions about bed bugs' },
    process: { heading: 'How we treat a bed bug infestation', lead: "We target the whole life cycle, not just the bugs you can see.", steps: [
      { _key: 's1', _type: 'processStep', title: 'Preparation and targeted inspection', body: "We give you a preparation checklist, then inspect the seams, box spring and baseboards to find every harbourage." },
      { _key: 's2', _type: 'processStep', title: 'Heat and residual treatment', body: "Heat reaches every life stage; an approved residual product closes off the remaining harbourages." },
      { _key: 's3', _type: 'processStep', title: 'Follow-up check and written guarantee', body: "A second visit confirms no egg survived; the guarantee holds until it is solved." },
    ] },
    cta: { title: 'Bed bugs? We close the cycle for good.', subtitle: "One call and a certified technician assesses and plans the treatment, often within 24 to 48 hours. Written guarantee." },
  },
}

function editorial(lang, assetRef) {
  const e = BLOCKS[lang].editorial
  return {
    _key: 'pb-editorial', _type: 'editorial', eyebrow: e.eyebrow, heading: e.heading, lead: e.lead,
    segments: [
      { _key: 'seg0', _type: 'editorialSegment', disposition: 'aside', mediaSide: 'right', body: e.body, media: [{ _key: 'm1', _type: 'figure', image: { _type: 'image', asset: { _ref: assetRef, _type: 'reference' } } }] },
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
  console.log(`Sous-étape C, service punaises de lit (dataset ${client.config().dataset})`)
  await migrateLive()
  migrateSeed()
  console.log('Terminé.')
}
main().catch((e) => { console.error(e); process.exit(1) })
