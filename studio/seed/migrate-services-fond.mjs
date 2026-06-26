// Migration FOND de l'index /services (servicesPage, fr + en).
//
// Cible (mandat): une SEULE grille de services, puis un différenciateur (pourquoi
// Rempart), puis la preuve, puis les zones en clôture.
//   services(grille, en-tête réécrit) > process(méthode 4 temps) > highlights(garanties)
//   > testimonials(preuve sociale) > serviceCities(zones, déplacé en clôture) > ctaBand > contact
//
// L'en-tête actuel du bloc services paraphrase le héros: réécrit. serviceCities passe
// de la 2e position à la clôture. process/highlights/testimonials instanciés.
//
// Live: lecture du doc, reconstruction du pageBuilder, set. Miroir seed. Idempotent.
//
// Usage:  node studio/seed/migrate-services-fond.mjs [--dry-run]

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

const MODS = {
  fr: {
    servicesHead: {
      eyebrow: 'Notre catalogue',
      heading: 'Chaque nuisible, un traitement ciblé',
      lead: 'Du résidentiel au commercial, voici tout ce qu\'on traite sur la Rive-Nord, toujours avec la même méthode et la même garantie écrite.',
    },
    process: {
      _key: 'sv-process', _type: 'process',
      eyebrow: 'Notre méthode',
      heading: 'La même méthode rigoureuse, pour chaque nuisible',
      lead: 'Pas de mystère ni de pression, du premier appel à la garantie.',
      steps: [
        { _key: 'p1', _type: 'processStep', title: 'Inspection et identification', body: 'On confirme l\'espèce et on trouve la source, du sous-sol au toit, avant d\'agir.' },
        { _key: 'p2', _type: 'processStep', title: 'Plan et estimation claire', body: 'On explique le plan et le prix avant de commencer, sans vente sous pression.' },
        { _key: 'p3', _type: 'processStep', title: 'Traitement ciblé', body: 'Un technicien certifié applique des produits homologués Santé Canada, sûrs pour la famille et les animaux.' },
        { _key: 'p4', _type: 'processStep', title: 'Suivi et garantie', body: 'On scelle les points d\'entrée, on revient au besoin, et la garantie écrite tient.' },
      ],
    },
    highlights: {
      _key: 'sv-highlights', _type: 'highlights',
      eyebrow: 'Nos engagements',
      heading: 'Pourquoi nous confier votre maison',
      items: [
        { _key: 'h1', _type: 'highlight', title: 'Garantie de retour sans frais', body: 'Si le nuisible revient dans la période couverte, on revient le traiter sans vous refacturer.' },
        { _key: 'h2', _type: 'highlight', title: 'Produits homologués Santé Canada', body: 'Choisis selon la situation, sûrs pour les enfants et les animaux.' },
        { _key: 'h3', _type: 'highlight', title: 'Intervention souvent sous 24 à 48 h', body: 'Une vraie personne répond, 7 jours sur 7, et un technicien part vers vous rapidement.' },
        { _key: 'h4', _type: 'highlight', title: 'Rapport d\'inspection écrit', body: 'Remis après chaque visite: ce qu\'on a trouvé, traité et recommandé.' },
      ],
    },
    testimonials: {
      _key: 'sv-testimonials', _type: 'testimonials',
      eyebrow: 'Ce qu\'on dit de nous',
      heading: 'La Rive-Nord nous fait confiance',
      mode: 'featured', limit: 3,
    },
  },
  en: {
    servicesHead: {
      eyebrow: 'Our catalogue',
      heading: 'Each pest, a targeted treatment',
      lead: 'From homes to businesses, here is everything we treat on the North Shore, always with the same method and the same written guarantee.',
    },
    process: {
      _key: 'sv-process', _type: 'process',
      eyebrow: 'Our method',
      heading: 'The same rigorous method, for every pest',
      lead: 'No mystery, no pressure, from the first call to the guarantee.',
      steps: [
        { _key: 'p1', _type: 'processStep', title: 'Inspection and identification', body: 'We confirm the species and find the source, basement to roof, before acting.' },
        { _key: 'p2', _type: 'processStep', title: 'Plan and clear estimate', body: 'We explain the plan and the price before starting, no pressure selling.' },
        { _key: 'p3', _type: 'processStep', title: 'Targeted treatment', body: 'A certified technician applies Health Canada approved products, safe for family and pets.' },
        { _key: 'p4', _type: 'processStep', title: 'Follow-up and guarantee', body: 'We seal the entry points, come back if needed, and the written guarantee holds.' },
      ],
    },
    highlights: {
      _key: 'sv-highlights', _type: 'highlights',
      eyebrow: 'Our commitments',
      heading: 'Why trust us with your home',
      items: [
        { _key: 'h1', _type: 'highlight', title: 'Free return guarantee', body: 'If the pest comes back within the covered period, we come back to treat it at no extra charge.' },
        { _key: 'h2', _type: 'highlight', title: 'Health Canada approved products', body: 'Chosen for the situation, safe for children and pets.' },
        { _key: 'h3', _type: 'highlight', title: 'Often on site within 24 to 48 h', body: 'A real person answers, seven days a week, and a technician heads your way quickly.' },
        { _key: 'h4', _type: 'highlight', title: 'Written inspection report', body: 'Handed over after every visit: what we found, treated and recommend.' },
      ],
    },
    testimonials: {
      _key: 'sv-testimonials', _type: 'testimonials',
      eyebrow: 'What people say',
      heading: 'The North Shore trusts us',
      mode: 'featured', limit: 3,
    },
  },
}

const DOCS = [
  { id: 'servicesPage-fr', lang: 'fr' },
  { id: 'servicesPage-en', lang: 'en' },
]

// services(b1, en-tête réécrit) > process > highlights > testimonials > [reste: serviceCities, ctaBand, contact]
function rebuild(pb, lang) {
  const m = MODS[lang]
  const out = []
  for (const b of pb) {
    if (b._type === 'services') {
      out.push({ ...b, eyebrow: m.servicesHead.eyebrow, heading: m.servicesHead.heading, lead: m.servicesHead.lead })
      out.push(m.process, m.highlights, m.testimonials)
    } else {
      out.push(b)
    }
  }
  return out
}

async function migrateLive(id, lang) {
  const doc = await client.getDocument(id)
  if (!doc) throw new Error(`introuvable: ${id}`)
  if ((doc.pageBuilder || []).some((b) => b._key === 'sv-process')) {
    console.log(`  ${id}: déjà migré, saut.`)
    return
  }
  const next = rebuild(doc.pageBuilder || [], lang)
  if (DRY) {
    console.log(`  ${id}: DRY -> ${next.map((b) => b._type).join(' > ')}`)
    return
  }
  await client.patch(id).set({ pageBuilder: next }).commit({ visibility: 'sync' })
  console.log(`  ${id}: restructuré (live).`)
}

function migrateSeed() {
  const seed = JSON.parse(readFileSync(seedPath, 'utf8'))
  let changed = 0
  for (const d of seed.documents) {
    if (d.type !== 'servicesPage') continue
    const lang = d.content.language
    if (!MODS[lang]) continue
    if ((d.content.pageBuilder || []).some((b) => b._key === 'sv-process')) continue
    d.content.pageBuilder = rebuild(d.content.pageBuilder, lang)
    changed++
  }
  if (DRY) {
    console.log(`  seed: ${changed} doc(s) (DRY).`)
    return
  }
  writeFileSync(seedPath, JSON.stringify(seed, null, 2) + '\n')
  console.log(`  seed-content.json: ${changed} doc(s) mis à jour (miroir).`)
}

async function main() {
  console.log(`Migration FOND /services (dataset ${client.config().dataset})`)
  for (const { id, lang } of DOCS) await migrateLive(id, lang)
  migrateSeed()
  console.log('Terminé.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
