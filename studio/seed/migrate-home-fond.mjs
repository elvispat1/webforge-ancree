// Migration FOND de l'accueil (chantier d'enrichissement E-E-A-T).
//
// Accueil (fr + en):
//  - trustBar: corrige « 15 ans d'expérience » (faux) -> « Depuis 2008 » (cohérence
//    site-wide, fondation réelle).
//  - services: passe d'auto (grille complète) à un APERÇU manual de 4 nuisibles
//    résidentiels vedettes (fourmis, souris, guêpes, punaises) avec un en-tête
//    distinct du héros et de la page /services, CTA conservé vers /services.
//  - insère un bloc process (méthode en 3 temps) après les services.
//  - about: corrige la stat « 10 villes » -> « 7 villes ».
//  - insère un bloc highlights (garanties) après le about.
//  - ctaBand: enrichit le sous-titre (disponibilité 7 jours sur 7).
//
// Séquence cible: trustBar > services(aperçu) > process > serviceCities > about >
//   highlights > testimonials > faq > ctaBand > contact.
//
// Le live fait foi: patches chirurgicaux sur le live, puis MIROIR seed-content.json.
// Idempotent: si 'home-process' existe déjà, on saute.
//
// Usage:  node studio/seed/migrate-home-fond.mjs [--dry-run]

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

const client = createClient({
  projectId: '5if00rwn',
  dataset: 'production',
  apiVersion: '2024-10-01',
  token: readToken(),
  useCdn: false,
})

const ref = (id, key) => ({ _type: 'reference', _ref: id, _key: key })

const MODS = {
  fr: {
    trustBarT2: { value: 'Depuis 2008', label: 'Ancrés sur la Rive-Nord' },
    services: {
      eyebrow: 'Ce qu\'on règle',
      heading: 'Les nuisibles qu\'on règle le plus souvent',
      lead: 'Un aperçu de nos interventions résidentielles. Voyez tous les services pour le commercial et les cas plus rares.',
      items: [
        ref('service-fourmis-charpentieres-fr', 'sv1'),
        ref('service-souris-rats-fr', 'sv2'),
        ref('service-guepes-frelons-fr', 'sv3'),
        ref('service-punaises-de-lit-fr', 'sv4'),
      ],
    },
    aboutStatS3: '7 villes',
    ctaSubtitle: 'Une vraie personne au bout du fil, 7 jours sur 7. Pas de longue attente, pas de surprise sur la facture, une garantie écrite.',
    process: {
      _key: 'home-process',
      _type: 'process',
      eyebrow: 'Notre méthode',
      heading: 'Comment on règle un nuisible, pour de bon',
      lead: 'Pas de mystère ni de pression: trois temps clairs, du premier appel à la garantie.',
      steps: [
        { _key: 'p1', _type: 'processStep', title: 'On inspecte et on identifie', body: 'On trouve d\'où vient le problème et quelle espèce vous visez, du sous-sol au toit, avant d\'agir.' },
        { _key: 'p2', _type: 'processStep', title: 'On traite à la source', body: 'Produits homologués Santé Canada, appliqués par un technicien certifié, avec un prix clair et aucune vente sous pression.' },
        { _key: 'p3', _type: 'processStep', title: 'On suit et on prévient', body: 'On scelle les points d\'entrée, on revient au besoin, et la garantie écrite tient: le nuisible ne doit pas revenir.' },
      ],
    },
    highlights: {
      _key: 'home-highlights',
      _type: 'highlights',
      eyebrow: 'Nos engagements',
      heading: 'Ce que vous obtenez avec Rempart',
      items: [
        { _key: 'h1', _type: 'highlight', title: 'Garantie de retour sans frais', body: 'Si le nuisible revient dans la période couverte, on revient le traiter sans vous refacturer.' },
        { _key: 'h2', _type: 'highlight', title: 'Rapport d\'inspection écrit', body: 'Remis après chaque visite: ce qu\'on a trouvé, ce qu\'on a traité et ce qu\'on recommande.' },
        { _key: 'h3', _type: 'highlight', title: 'Produits homologués Santé Canada', body: 'Choisis selon la situation, sûrs pour les enfants et les animaux de compagnie.' },
        { _key: 'h4', _type: 'highlight', title: 'Estimation gratuite, prix clair', body: 'Le prix est fixé avant qu\'on commence, sans vente sous pression ni surprise sur la facture.' },
      ],
    },
  },
  en: {
    trustBarT2: { value: 'Since 2008', label: 'Rooted on the North Shore' },
    services: {
      eyebrow: 'What we handle',
      heading: 'The pests we deal with most',
      lead: 'A look at our residential work. See all services for commercial jobs and rarer cases.',
      items: [
        ref('service-fourmis-charpentieres-en', 'sv1'),
        ref('service-souris-rats-en', 'sv2'),
        ref('service-guepes-frelons-en', 'sv3'),
        ref('service-punaises-de-lit-en', 'sv4'),
      ],
    },
    aboutStatS3: '7 cities',
    ctaSubtitle: 'A real person on the line, seven days a week. No long wait, no surprise on the bill, a guarantee in writing.',
    process: {
      _key: 'home-process',
      _type: 'process',
      eyebrow: 'Our method',
      heading: 'How we deal with a pest, for good',
      lead: 'No mystery, no pressure: three clear steps, from the first call to the guarantee.',
      steps: [
        { _key: 'p1', _type: 'processStep', title: 'We inspect and identify', body: 'We find where the problem starts and which species you are facing, from basement to roof, before doing anything.' },
        { _key: 'p2', _type: 'processStep', title: 'We treat at the source', body: 'Health Canada approved products, applied by a certified technician, with a clear price and no pressure selling.' },
        { _key: 'p3', _type: 'processStep', title: 'We follow up and prevent', body: 'We seal the entry points, come back if needed, and the written guarantee holds: the pest should not return.' },
      ],
    },
    highlights: {
      _key: 'home-highlights',
      _type: 'highlights',
      eyebrow: 'Our commitments',
      heading: 'What you get with Rempart',
      items: [
        { _key: 'h1', _type: 'highlight', title: 'Free return guarantee', body: 'If the pest comes back within the covered period, we come back to treat it at no extra charge.' },
        { _key: 'h2', _type: 'highlight', title: 'Written inspection report', body: 'Handed to you after every visit: what we found, what we treated and what we recommend.' },
        { _key: 'h3', _type: 'highlight', title: 'Health Canada approved products', body: 'Chosen for the situation, safe for children and pets.' },
        { _key: 'h4', _type: 'highlight', title: 'Free estimate, clear price', body: 'The price is set before we start, with no pressure selling and no surprise on the bill.' },
      ],
    },
  },
}

const DOCS = [
  { id: 'homePage-fr', lang: 'fr' },
  { id: 'homePage-en', lang: 'en' },
]

function setsFor(lang) {
  const m = MODS[lang]
  return {
    'pageBuilder[_key=="b1"].items[_key=="t2"].value': m.trustBarT2.value,
    'pageBuilder[_key=="b1"].items[_key=="t2"].label': m.trustBarT2.label,
    'pageBuilder[_key=="b2"].mode': 'manual',
    'pageBuilder[_key=="b2"].eyebrow': m.services.eyebrow,
    'pageBuilder[_key=="b2"].heading': m.services.heading,
    'pageBuilder[_key=="b2"].lead': m.services.lead,
    'pageBuilder[_key=="b2"].items': m.services.items,
    'pageBuilder[_key=="b4"].stats[_key=="s3"].value': m.aboutStatS3,
    'pageBuilder[_key=="b7"].subtitle': m.ctaSubtitle,
  }
}

async function migrateLive(id, lang) {
  const doc = await client.getDocument(id)
  if (!doc) throw new Error(`Document live introuvable: ${id}`)
  if ((doc.pageBuilder || []).some((b) => b._key === 'home-process')) {
    console.log(`  ${id}: déjà migré, saut.`)
    return
  }
  if (DRY) {
    console.log(`  ${id}: DRY (sets trustBar/services/about/cta + insert process après b2, highlights après b4)`)
    return
  }
  const m = MODS[lang]
  await client
    .patch(id)
    .set(setsFor(lang))
    .insert('after', 'pageBuilder[_key=="b2"]', [m.process])
    .commit({ visibility: 'sync' })
  await client
    .patch(id)
    .insert('after', 'pageBuilder[_key=="b4"]', [m.highlights])
    .commit({ visibility: 'sync' })
  console.log(`  ${id}: live patché.`)
}

function rebuildSeedPageBuilder(pb, lang) {
  const m = MODS[lang]
  const out = []
  for (const block of pb) {
    let b = block
    if (block._key === 'b1' && block._type === 'trustBar') {
      b = {
        ...block,
        items: block.items.map((i) =>
          i._key === 't2' ? { ...i, value: m.trustBarT2.value, label: m.trustBarT2.label } : i
        ),
      }
    } else if (block._key === 'b2' && block._type === 'services') {
      b = { ...block, mode: 'manual', eyebrow: m.services.eyebrow, heading: m.services.heading, lead: m.services.lead, items: m.services.items }
    } else if (block._key === 'b4' && block._type === 'about') {
      b = { ...block, stats: block.stats.map((s) => (s._key === 's3' ? { ...s, value: m.aboutStatS3 } : s)) }
    } else if (block._key === 'b7' && block._type === 'ctaBand') {
      b = { ...block, subtitle: m.ctaSubtitle }
    }
    out.push(b)
    if (block._key === 'b2') out.push(m.process)
    if (block._key === 'b4') out.push(m.highlights)
  }
  return out
}

function migrateSeed() {
  const seed = JSON.parse(readFileSync(seedPath, 'utf8'))
  let changed = 0
  for (const d of seed.documents) {
    if (d.type !== 'homePage') continue
    const lang = d.content.language
    if (!MODS[lang]) continue
    if ((d.content.pageBuilder || []).some((b) => b._key === 'home-process')) continue
    d.content.pageBuilder = rebuildSeedPageBuilder(d.content.pageBuilder, lang)
    changed++
  }
  if (DRY) {
    console.log(`  seed: ${changed} doc(s) seraient mis à jour (DRY).`)
    return
  }
  writeFileSync(seedPath, JSON.stringify(seed, null, 2) + '\n')
  console.log(`  seed-content.json: ${changed} doc(s) mis à jour (miroir).`)
}

async function main() {
  console.log(`Migration FOND accueil (dataset ${client.config().dataset})`)
  for (const { id, lang } of DOCS) await migrateLive(id, lang)
  migrateSeed()
  console.log('Terminé.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
