// Convertit les certifications du bloc team en étiquettes courtes (chips ambre).
//
// Avant: une phrase (string) par membre. Après: un tableau de mots-clés courts,
// rendus en étiquettes. aboutPage fr + en, live + miroir seed. Idempotent (no-op si
// déjà un tableau).
//
// Usage:  node studio/seed/migrate-team-credentials.mjs [--dry-run]

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

const CREDS = {
  fr: {
    m1: ['Membre ASTTQ', 'Gestion parasitaire'],
    m2: ['Traitement thermique', 'Détection canine'],
    m3: ['Gestion parasitaire', 'Exclusion mécanique'],
    m4: ['Certifiée HACCP', 'Programmes préventifs'],
  },
  en: {
    m1: ['ASTTQ member', 'Pest management'],
    m2: ['Heat treatment', 'Canine detection'],
    m3: ['Pest management', 'Mechanical exclusion'],
    m4: ['HACCP certified', 'Preventive programs'],
  },
}
const DOCS = [
  { id: 'aboutPage-fr', lang: 'fr' },
  { id: 'aboutPage-en', lang: 'en' },
]

async function migrateLive(id, lang) {
  const sets = {}
  for (const [member, creds] of Object.entries(CREDS[lang])) {
    sets[`pageBuilder[_key=="ap-team"].members[_key=="${member}"].credentials`] = creds
  }
  if (DRY) {
    console.log(`  ${id}: DRY, 4 membres -> étiquettes`)
    return
  }
  await client.patch(id).set(sets).commit({ visibility: 'sync' })
  console.log(`  ${id}: certifications en étiquettes (live).`)
}

function migrateSeed() {
  const seed = JSON.parse(readFileSync(seedPath, 'utf8'))
  for (const d of seed.documents) {
    if (d.type !== 'aboutPage') continue
    const lang = d.content.language
    if (!CREDS[lang]) continue
    const team = (d.content.pageBuilder || []).find((b) => b._key === 'ap-team')
    if (!team) continue
    for (const m of team.members || []) {
      if (CREDS[lang][m._key]) m.credentials = CREDS[lang][m._key]
    }
  }
  if (DRY) {
    console.log('  seed: DRY')
    return
  }
  writeFileSync(seedPath, JSON.stringify(seed, null, 2) + '\n')
  console.log('  seed-content.json: certifications en étiquettes (miroir).')
}

async function main() {
  console.log(`Certifications team en étiquettes (dataset ${client.config().dataset})`)
  for (const { id, lang } of DOCS) await migrateLive(id, lang)
  migrateSeed()
  console.log('Terminé.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
