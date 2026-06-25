/**
 * Régénère les entrées seed-content.json des docs touchés (service, serviceCity, et
 * les 4 singletons de niveau 2 about/contact/services/villes) À PARTIR DU LIVE, qui
 * fait foi. Convertit les refs d'asset image -> IMG:<clé> (clé = originalFilename
 * sans extension, alignée sur seed.mjs IMAGES). Remplace en place dans le tableau
 * documents (ordre préservé), ne touche pas les autres docs.
 *
 * Lancer depuis studio/:  npx sanity exec migrate/regenerate-seed.mjs --with-user-token
 */
import { getCliClient } from 'sanity/cli'
import { readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const client = getCliClient({ apiVersion: '2024-09-01' })
const seedPath = join(dirname(fileURLToPath(import.meta.url)), '..', 'seed-content.json')

// Clés d'image connues du seed (seed.mjs IMAGES). Toute image référencée doit en faire partie.
const KNOWN = new Set([
  'hero-rempart', 'equipe-rempart', 'hero-technicien', 'inspection-rempart',
  'hero-ant', 'hero-mouse', 'hero-wasp', 'hero-bedbug', 'hero-roach',
  'hero-team', 'hero-techVan', 'hero-techAction', 'hero-vanHood', 'logo-rempart',
])

const SYSTEM = new Set(['_rev', '_createdAt', '_updatedAt'])

function strip(node) {
  if (Array.isArray(node)) return node.map(strip)
  if (node && typeof node === 'object') {
    const out = {}
    for (const k of Object.keys(node)) {
      if (SYSTEM.has(k)) continue
      out[k] = strip(node[k])
    }
    return out
  }
  return node
}

function mapRefs(node, idToKey) {
  if (Array.isArray(node)) return node.map((n) => mapRefs(n, idToKey))
  if (node && typeof node === 'object') {
    for (const k of Object.keys(node)) {
      const v = node[k]
      if (k === '_ref' && typeof v === 'string' && v.startsWith('image-')) {
        const key = idToKey[v]
        if (!key) throw new Error(`Asset image sans clé seed: ${v}`)
        if (!KNOWN.has(key)) throw new Error(`Clé image absente de seed.mjs IMAGES: ${key} (${v})`)
        node[k] = `IMG:${key}`
      } else {
        node[k] = mapRefs(v, idToKey)
      }
    }
  }
  return node
}

function collectImageRefs(node, out) {
  if (Array.isArray(node)) { for (const n of node) collectImageRefs(n, out); return }
  if (node && typeof node === 'object') {
    for (const k of Object.keys(node)) {
      if (k === '_ref' && typeof node[k] === 'string' && node[k].startsWith('image-')) out.add(node[k])
      else collectImageRefs(node[k], out)
    }
  }
}

async function run() {
  const ids = [
    'aboutPage-fr', 'aboutPage-en', 'contactPage-fr', 'contactPage-en',
    'servicesPage-fr', 'servicesPage-en', 'villesPage-fr', 'villesPage-en',
  ]
  const docs = await client.fetch(
    '*[(_type=="service" || _type=="serviceCity" || _id in $ids) && !(_id in path("drafts.**"))]',
    { ids },
  )

  // Carte asset id -> clé seed (originalFilename sans extension).
  const refs = new Set()
  for (const d of docs) collectImageRefs(d, refs)
  const assets = await client.fetch('*[_id in $r]{_id, originalFilename}', { r: [...refs] })
  const idToKey = {}
  for (const a of assets) {
    idToKey[a._id] = (a.originalFilename || '').replace(/\.[a-z]+$/i, '')
  }

  // Docs nettoyés + refs converties, indexés par _id.
  const byId = {}
  for (const d of docs) {
    const content = mapRefs(strip(d), idToKey)
    byId[content._id] = { type: content._type, content }
  }

  // Remplace en place dans seed-content.json (ordre préservé), ajoute si absent.
  const seed = JSON.parse(readFileSync(seedPath, 'utf8'))
  let replaced = 0
  const seen = new Set()
  seed.documents = seed.documents.map((entry) => {
    const id = entry.content?._id
    if (id && byId[id]) {
      seen.add(id)
      replaced++
      return byId[id]
    }
    return entry
  })
  let added = 0
  for (const [id, entry] of Object.entries(byId)) {
    if (!seen.has(id)) { seed.documents.push(entry); added++ }
  }

  writeFileSync(seedPath, JSON.stringify(seed, null, 2) + '\n', 'utf8')
  console.log(`Docs live: ${docs.length} | remplacés: ${replaced} | ajoutés: ${added}`)
  console.log(`Assets mappés: ${Object.keys(idToKey).length} -> clés: ${[...new Set(Object.values(idToKey))].sort().join(', ')}`)
}

run().catch((e) => { console.error(e); process.exit(1) })
