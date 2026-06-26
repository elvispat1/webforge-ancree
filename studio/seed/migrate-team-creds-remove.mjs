// Retire les certifications du bloc team (décision Charles: nom + rôle + bio seulement).
// Désindexe le champ credentials sur le live et le retire du miroir seed. Idempotent.
//
// Usage:  node studio/seed/migrate-team-creds-remove.mjs [--dry-run]

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

const MEMBERS = ['m1', 'm2', 'm3', 'm4']
const DOCS = ['aboutPage-fr', 'aboutPage-en']

async function migrateLive(id) {
  const paths = MEMBERS.map((m) => `pageBuilder[_key=="ap-team"].members[_key=="${m}"].credentials`)
  if (DRY) {
    console.log(`  ${id}: DRY unset credentials x${MEMBERS.length}`)
    return
  }
  await client.patch(id).unset(paths).commit({ visibility: 'sync' })
  console.log(`  ${id}: credentials retiré (live).`)
}

function migrateSeed() {
  const seed = JSON.parse(readFileSync(seedPath, 'utf8'))
  for (const d of seed.documents) {
    if (d.type !== 'aboutPage') continue
    const team = (d.content.pageBuilder || []).find((b) => b._key === 'ap-team')
    if (!team) continue
    for (const m of team.members || []) delete m.credentials
  }
  if (DRY) {
    console.log('  seed: DRY')
    return
  }
  writeFileSync(seedPath, JSON.stringify(seed, null, 2) + '\n')
  console.log('  seed-content.json: credentials retiré (miroir).')
}

async function main() {
  console.log(`Retrait certifications team (dataset ${client.config().dataset})`)
  for (const id of DOCS) await migrateLive(id)
  migrateSeed()
  console.log('Terminé.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
