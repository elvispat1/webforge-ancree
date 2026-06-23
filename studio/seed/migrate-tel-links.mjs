// Migration ponctuelle: convertit tout lien `link` de type `external` dont
// l'URL externe est un `tel:` vers le nouveau type `tel` (action d'appel derivee
// de Coordonnees -> Telephone). Retire `externalUrl`. Ne touche a RIEN d'autre
// (les http/mailto, les ancres #contact, le numero affiche, etc. restent intacts).
//
// Auth: meme source que seed.mjs (SANITY_AUTH_TOKEN ou ~/.config/sanity/config.json).
// Usage: node studio/seed/migrate-tel-links.mjs [--dry-run]

import { createClient } from '@sanity/client'
import { readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const DRY = process.argv.includes('--dry-run')

function readToken() {
  if (process.env.SANITY_AUTH_TOKEN) return process.env.SANITY_AUTH_TOKEN
  try {
    const cfg = JSON.parse(readFileSync(join(homedir(), '.config', 'sanity', 'config.json'), 'utf8'))
    if (cfg.authToken) return cfg.authToken
  } catch {}
  throw new Error('Aucun token Sanity (SANITY_AUTH_TOKEN ou ~/.config/sanity/config.json).')
}

const client = createClient({
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || '5if00rwn',
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  apiVersion: '2024-10-01',
  token: readToken(),
  useCdn: false,
})

// Mutation en place de l'arbre d'un document: chaque objet `link` external+tel:
// devient un `link` de type `tel` sans URL. Retourne le nombre de liens convertis.
function convert(node) {
  let n = 0
  if (Array.isArray(node)) {
    for (const item of node) n += convert(item)
    return n
  }
  if (node && typeof node === 'object') {
    if (
      node._type === 'link' &&
      node.type === 'external' &&
      typeof node.externalUrl === 'string' &&
      node.externalUrl.startsWith('tel:')
    ) {
      node.type = 'tel'
      delete node.externalUrl
      n += 1
    }
    for (const key of Object.keys(node)) n += convert(node[key])
    return n
  }
  return 0
}

// Tout le dataset, brouillons inclus (perspective brute du client).
const docs = await client.fetch('*')
let totalLinks = 0
let changedDocs = 0
const tx = client.transaction()

for (const doc of docs) {
  const n = convert(doc)
  if (n > 0) {
    totalLinks += n
    changedDocs += 1
    if (!DRY) tx.createOrReplace(doc)
    console.log(`  ${doc._id}: ${n} lien(s) tel converti(s)`)
  }
}

console.log(`\nTotal: ${totalLinks} lien(s) dans ${changedDocs} document(s).`)

if (totalLinks === 0) {
  console.log('Rien a migrer.')
} else if (DRY) {
  console.log('DRY RUN: aucune ecriture.')
} else {
  const res = await tx.commit()
  console.log(`Commit OK: ${res.results?.length ?? 0} mutation(s) appliquee(s).`)
}
