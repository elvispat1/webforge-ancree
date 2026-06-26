// Retire le bloc trustBar de l'accueil et du one-pager (fr + en).
//
// Décision Charles (26 juin): pas de trustBar directement sous un héros qui porte
// déjà ses preuves. heroHome (accueil, one-pager) porte 3 preuves intégrées; une
// trustBar juste en dessous empile deux rangées de signaux. On la retire. Les pages
// à héros sans preuves (à propos, contact, villes) la gardent.
//
// Live: on lit le doc, on filtre les blocs trustBar, on réécrit pageBuilder (blocs
// restants conservés verbatim). Puis MIROIR seed-content.json. Idempotent.
//
// Usage:  node studio/seed/migrate-remove-hero-trustbar.mjs [--dry-run]

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

const IDS = ['homePage-fr', 'homePage-en', 'onePager-fr', 'onePager-en']
const TARGET_TYPES = new Set(['homePage', 'onePager'])

async function migrateLive(id) {
  const doc = await client.getDocument(id)
  if (!doc) {
    console.log(`  ${id}: introuvable, saut.`)
    return
  }
  const pb = doc.pageBuilder || []
  if (!pb.some((b) => b._type === 'trustBar')) {
    console.log(`  ${id}: pas de trustBar, saut.`)
    return
  }
  const next = pb.filter((b) => b._type !== 'trustBar')
  if (DRY) {
    console.log(`  ${id}: DRY, retrait de ${pb.length - next.length} trustBar`)
    return
  }
  await client.patch(id).set({ pageBuilder: next }).commit({ visibility: 'sync' })
  console.log(`  ${id}: trustBar retirée (live).`)
}

function migrateSeed() {
  const seed = JSON.parse(readFileSync(seedPath, 'utf8'))
  let changed = 0
  for (const d of seed.documents) {
    if (!TARGET_TYPES.has(d.type)) continue
    const pb = d.content.pageBuilder || []
    if (!pb.some((b) => b._type === 'trustBar')) continue
    d.content.pageBuilder = pb.filter((b) => b._type !== 'trustBar')
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
  console.log(`Retrait trustBar sous héros (dataset ${client.config().dataset})`)
  for (const id of IDS) await migrateLive(id)
  migrateSeed()
  console.log('Terminé.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
