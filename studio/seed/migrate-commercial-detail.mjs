// Lot service détail, sous-étape C (modèle fourmis/souris) — service commercial.
// Cas B2B, distinct des nuisibles résidentiels: ce n'est pas UN nuisible, c'est un
// PROGRAMME préventif continu, documenté, pensé pour la conformité (MAPAQ, HACCP).
// Même séquence, contenu et angle propres au commercial:
//   trustBar (angle conformité) > editorial riche > highlights > faq commerciale (PT,
//   maillage, visuel seulement) > process programme > testimonials > ctaBand.
//
// Editorial = UN aside équilibré (modèle souris), image paysage inspection-rempart,
// eyebrow « Le service en détail » (pas « nuisible »). Crée faqTheme-commercial + 5
// faqItems fr+en + translation.metadata. Pas de schéma neuf. Live (vrai ref) puis
// miroir seed (IMG:). Idempotent (saute si faq présent).
//
// Usage:  node studio/seed/migrate-commercial-detail.mjs [--dry-run]

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

function answer(parts) {
  const children = []; const markDefs = []
  parts.forEach((p, i) => {
    if (p.ref) { const mk = `l${i}`; markDefs.push({ _key: mk, _type: 'link', type: 'internal', internalRef: ref(p.ref) }); children.push({ _key: `a0s${i}`, _type: 'span', marks: [mk], text: p.text }) }
    else children.push({ _key: `a0s${i}`, _type: 'span', marks: [], text: p.text })
  })
  return [{ _type: 'block', _key: 'a0', style: 'normal', markDefs, children }]
}
const para = (key, text, style = 'normal') => ({ _type: 'block', _key: key, style, markDefs: [], children: [{ _type: 'span', _key: key + 's', text, marks: [] }] })

const SLUG = 'commercial'
const THEME = { fr: { title: 'Gestion parasitaire commerciale', slug: 'gestion-commerciale' }, en: { title: 'Commercial pest management', slug: 'commercial-pest-management' } }
const ORDER = ['frequence', 'conformite', 'discretion', 'urgence', 'zone']

const ITEMS = {
  fr: {
    frequence: { q: "À quelle fréquence faut-il des visites?", a: answer([{ text: "Ça dépend du secteur et du risque: souvent aux mois pour un restaurant, plus espacé pour un bureau. On propose une fréquence adaptée, ajustée selon les saisons." }]) },
    conformite: { q: "Vos rapports suffisent-ils pour le MAPAQ et le HACCP?", a: answer([{ text: "Oui. Chaque visite produit un rapport daté des vérifications, des traitements et des recommandations, classé pour présenter à l'inspection ou à l'audit." }]) },
    discretion: { q: "Allez-vous déranger ma clientèle?", a: answer([{ text: "Non. On planifie les passages hors des heures d'achalandage et on applique des produits homologués avec discrétion, sans nuire à votre image." }]) },
    urgence: { q: "Et si un problème survient entre deux visites?", a: answer([{ text: "Un appel et un technicien d'ici se déplace, 7 jours sur 7, souvent sous 24 à 48 h. Les interventions d'urgence font partie du programme." }]) },
    zone: { q: "Desservez-vous mon secteur sur la Rive-Nord?", a: answer([{ text: "Oui, de " }, { text: "Laval", ref: 'serviceCity-laval-fr' }, { text: " à " }, { text: "Blainville", ref: 'serviceCity-blainville-fr' }, { text: " et toute la couronne nord. On dessert restaurants, commerces et immeubles." }]) },
  },
  en: {
    frequence: { q: "How often are visits needed?", a: answer([{ text: "It depends on the industry and the risk: often monthly for a restaurant, less frequent for an office. We propose a suitable frequency, adjusted with the seasons." }]) },
    conformite: { q: "Are your reports enough for MAPAQ and HACCP?", a: answer([{ text: "Yes. Every visit produces a dated report of the checks, treatments and recommendations, filed to present at the inspection or audit." }]) },
    discretion: { q: "Will you disturb my customers?", a: answer([{ text: "No. We schedule visits outside busy hours and apply approved products with discretion, without harming your image." }]) },
    urgence: { q: "What if a problem comes up between visits?", a: answer([{ text: "One call and a local technician heads out, seven days a week, often within 24 to 48 hours. Emergency visits are part of the program." }]) },
    zone: { q: "Do you serve my area on the North Shore?", a: answer([{ text: "Yes, from " }, { text: "Laval", ref: 'serviceCity-laval-en' }, { text: " to " }, { text: "Blainville", ref: 'serviceCity-blainville-en' }, { text: " and the whole north crown. We serve restaurants, shops and buildings." }]) },
  },
}

const BLOCKS = {
  fr: {
    trustBar: { _key: 'pb-trust', _type: 'trustBar', items: [
      { _key: 't1', _type: 'proof', icon: 'lucide:award', value: 'Membre ASTTQ', label: 'gestion parasitaire du Québec' },
      { _key: 't2', _type: 'proof', icon: 'lucide:clipboard-check', value: 'Conforme MAPAQ et HACCP', label: "rapports prêts pour l'inspection" },
      { _key: 't3', _type: 'proof', icon: 'lucide:clock', value: 'Sous 24 à 48 h', label: 'intervention 7 jours sur 7' },
      { _key: 't4', _type: 'proof', icon: 'lucide:leaf', value: 'Produits homologués', label: 'Santé Canada, appliqués avec discrétion' },
    ] },
    editorial: {
      eyebrow: 'Le service en détail', heading: "Un programme préventif, prêt pour l'inspection",
      lead: "En milieu commercial, le risque n'est pas qu'un nuisible: c'est une inspection ratée, un avis sur le mur, une réputation. On met en place un programme continu, documenté, pensé pour la conformité MAPAQ et HACCP.",
      body: [
        para('e1', "Un restaurant, une épicerie ou un immeuble n'a pas droit à l'erreur: une seule trace de nuisible peut coûter une inspection, une fermeture ou un client. La gestion parasitaire commerciale ne se règle pas en une visite, elle se gère en continu, avec des preuves à montrer à l'inspecteur."),
        para('e2h', "Un dossier déjà prêt le jour de l'inspection", 'h3'),
        para('e2', "On installe un réseau de stations de surveillance, on passe à intervalle régulier, et chaque visite produit un rapport daté: ce qui a été vérifié, traité et recommandé. Le jour de l'inspection MAPAQ ou de l'audit HACCP, le dossier est déjà prêt."),
      ],
    },
    highlights: { heading: "Ce que comprend le programme", items: [
      { _key: 'benefit-0', _type: 'highlight', title: 'Programme sur mesure, visites planifiées', body: "Une fréquence adaptée à votre commerce, sans interrompre vos opérations." },
      { _key: 'benefit-1', _type: 'highlight', title: "Rapports datés, prêts pour l'audit", body: "Chaque visite documentée: vérifications, traitements et recommandations, classés pour l'inspection." },
      { _key: 'benefit-2', _type: 'highlight', title: 'Intervention rapide entre les visites', body: "Un appel et un technicien d'ici se déplace, 7 jours sur 7, en cas d'urgence." },
      { _key: 'benefit-3', _type: 'highlight', title: 'Produits homologués, discrétion assurée', body: "Des produits homologués Santé Canada appliqués hors des heures d'achalandage, sans nuire à votre image." },
    ] },
    faq: { _key: 'pb-faq', _type: 'faq', eyebrow: "Avant d'appeler", heading: 'Vos questions sur la gestion parasitaire commerciale' },
    process: { heading: 'Comment fonctionne un programme commercial', lead: "On prévient et on documente, plutôt que de réagir.", steps: [
      { _key: 's1', _type: 'processStep', title: 'Évaluation et plan de conformité', body: "On visite les lieux, on repère les points de risque et on bâtit un plan adapté à votre secteur et à vos obligations." },
      { _key: 's2', _type: 'processStep', title: 'Surveillance et visites planifiées', body: "Stations de contrôle et passages réguliers, avec traitement ciblé dès qu'un signe apparaît." },
      { _key: 's3', _type: 'processStep', title: 'Rapports et suivi continu', body: "Un rapport daté à chaque visite et un dossier prêt pour l'inspection, ajusté au fil des saisons." },
    ] },
    cta: { title: 'Un commerce à protéger? On bâtit votre programme préventif.', subtitle: "Un appel, un technicien certifié évalue vos lieux et propose un plan conforme, souvent sous 24 à 48 h." },
  },
  en: {
    trustBar: { _key: 'pb-trust', _type: 'trustBar', items: [
      { _key: 't1', _type: 'proof', icon: 'lucide:award', value: 'ASTTQ member', label: 'Quebec pest management' },
      { _key: 't2', _type: 'proof', icon: 'lucide:clipboard-check', value: 'MAPAQ and HACCP ready', label: 'reports ready for inspection' },
      { _key: 't3', _type: 'proof', icon: 'lucide:clock', value: 'Within 24 to 48 h', label: 'service seven days a week' },
      { _key: 't4', _type: 'proof', icon: 'lucide:leaf', value: 'Approved products', label: 'Health Canada, applied with discretion' },
    ] },
    editorial: {
      eyebrow: 'The service in detail', heading: 'A preventive program, ready for inspection',
      lead: "In a commercial setting, the risk is not just a pest: it is a failed inspection, a notice on the wall, a reputation. We set up a continuous, documented program built for MAPAQ and HACCP compliance.",
      body: [
        para('e1', "A restaurant, a grocery store or a building has no room for error: a single sign of pests can cost an inspection, a closure or a customer. Commercial pest management is not solved in one visit, it is managed continuously, with proof to show the inspector."),
        para('e2h', "A file ready the day of the inspection", 'h3'),
        para('e2', "We set up a network of monitoring stations, visit on a regular schedule, and every visit produces a dated report: what was checked, treated and recommended. On the day of the MAPAQ inspection or the HACCP audit, the file is already ready."),
      ],
    },
    highlights: { heading: "What the program includes", items: [
      { _key: 'benefit-0', _type: 'highlight', title: 'Tailored program, scheduled visits', body: "A frequency suited to your business, without interrupting your operations." },
      { _key: 'benefit-1', _type: 'highlight', title: 'Dated reports, audit-ready', body: "Every visit documented: checks, treatments and recommendations, filed for inspection." },
      { _key: 'benefit-2', _type: 'highlight', title: 'Fast response between visits', body: "One call and a local technician heads out, seven days a week, in an emergency." },
      { _key: 'benefit-3', _type: 'highlight', title: 'Approved products, guaranteed discretion', body: "Health Canada approved products applied outside busy hours, without harming your image." },
    ] },
    faq: { _key: 'pb-faq', _type: 'faq', eyebrow: 'Before you call', heading: 'Your questions about commercial pest management' },
    process: { heading: 'How a commercial program works', lead: "We prevent and document, rather than react.", steps: [
      { _key: 's1', _type: 'processStep', title: 'Assessment and compliance plan', body: "We visit the site, map the risk points and build a plan suited to your industry and your obligations." },
      { _key: 's2', _type: 'processStep', title: 'Monitoring and scheduled visits', body: "Control stations and regular visits, with targeted treatment as soon as a sign appears." },
      { _key: 's3', _type: 'processStep', title: 'Reports and ongoing follow-up', body: "A dated report at every visit and a file ready for inspection, adjusted as the seasons change." },
    ] },
    cta: { title: 'A business to protect? We build your preventive program.', subtitle: "One call and a certified technician assesses your site and proposes a compliant plan, often within 24 to 48 hours." },
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
  console.log(`Sous-étape C, service commercial (dataset ${client.config().dataset})`)
  await migrateLive()
  migrateSeed()
  console.log('Terminé.')
}
main().catch((e) => { console.error(e); process.exit(1) })
