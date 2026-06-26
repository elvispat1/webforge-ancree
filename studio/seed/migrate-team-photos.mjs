// Branche les portraits de l'équipe (bloc team de /a-propos).
//
// Téléverse 4 portraits (public/images/team-*.jpg) en assets Sanity natifs, pose
// l'alt bilingue SUR L'ASSET (altText { fr, en }, lu par FIGURE_PROJECTION), puis
// renseigne le champ photo (figure) de chaque membre du bloc team sur le live
// (aboutPage-fr ET aboutPage-en référencent le même asset par membre). Enfin, MIROIR
// dans seed-content.json (refs IMG:team-* résolues par seed.mjs au re-seed).
//
// Personnes fictives (démo Rempart). Idempotent: réutilise l'asset s'il existe.
//
// Usage:  node studio/seed/migrate-team-photos.mjs [--dry-run]

import { createClient } from '@sanity/client'
import { readFileSync, writeFileSync, createReadStream } from 'node:fs'
import { homedir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const DRY = process.argv.includes('--dry-run')
const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(here, '..', '..')
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

const img = (f) => join(repoRoot, 'public', 'images', f)

// Clé asset -> fichier, alt bilingue, et membre (clé _key) du bloc team.
const PHOTOS = [
  {
    key: 'team-martin', file: img('team-martin.jpg'), member: 'm1',
    alt: {
      fr: 'Martin Lefebvre, fondateur et technicien en chef de Rempart Extermination',
      en: 'Martin Lefebvre, founder and lead technician at Rempart Extermination',
    },
  },
  {
    key: 'team-julie', file: img('team-julie.jpg'), member: 'm2',
    alt: {
      fr: 'Julie Caron, technicienne punaises de lit et détection chez Rempart Extermination',
      en: 'Julie Caron, bed bug and detection technician at Rempart Extermination',
    },
  },
  {
    key: 'team-samuel', file: img('team-samuel.jpg'), member: 'm3',
    alt: {
      fr: 'Samuel Ouellet, technicien rongeurs et exclusion chez Rempart Extermination',
      en: 'Samuel Ouellet, rodent and exclusion technician at Rempart Extermination',
    },
  },
  {
    key: 'team-nadia', file: img('team-nadia.jpg'), member: 'm4',
    alt: {
      fr: 'Nadia Bélanger, technicienne commerciale et conformité chez Rempart Extermination',
      en: 'Nadia Bélanger, commercial and compliance technician at Rempart Extermination',
    },
  },
]

const figureFor = (assetRef) => ({
  _type: 'figure',
  image: { _type: 'image', asset: { _type: 'reference', _ref: assetRef } },
})

async function uploadAll() {
  const map = {}
  for (const p of PHOTOS) {
    const fn = `${p.key}.jpg`
    const existing = await client.fetch(
      '*[_type == "sanity.imageAsset" && originalFilename == $fn][0]._id',
      { fn },
    )
    if (existing) {
      map[p.key] = existing
      console.log(`  réutilise ${p.key} -> ${existing}`)
    } else {
      const asset = await client.assets.upload('image', createReadStream(p.file), { filename: fn })
      map[p.key] = asset._id
      console.log(`  uploadé ${p.key} -> ${asset._id}`)
    }
    await client.patch(map[p.key]).set({ altText: p.alt }).commit()
  }
  return map
}

async function patchLive(map) {
  for (const id of ['aboutPage-fr', 'aboutPage-en']) {
    const sets = {}
    for (const p of PHOTOS) {
      sets[`pageBuilder[_key=="ap-team"].members[_key=="${p.member}"].photo`] = figureFor(map[p.key])
    }
    await client.patch(id).set(sets).commit({ visibility: 'sync' })
    console.log(`  ${id}: 4 portraits branchés (live).`)
  }
}

function patchSeed() {
  const seed = JSON.parse(readFileSync(seedPath, 'utf8'))
  let changed = 0
  for (const d of seed.documents) {
    if (d.type !== 'aboutPage') continue
    const team = (d.content.pageBuilder || []).find((b) => b._key === 'ap-team')
    if (!team) continue
    for (const m of team.members || []) {
      const p = PHOTOS.find((x) => x.member === m._key)
      if (p) m.photo = figureFor(`IMG:${p.key}`)
    }
    changed++
  }
  writeFileSync(seedPath, JSON.stringify(seed, null, 2) + '\n')
  console.log(`  seed-content.json: ${changed} doc(s) mis à jour (miroir, refs IMG:team-*).`)
}

async function main() {
  console.log(`Portraits équipe (dataset ${client.config().dataset})`)
  if (DRY) {
    for (const p of PHOTOS) console.log(`  DRY ${p.key} (${p.member}) <- ${p.file}`)
    return
  }
  const map = await uploadAll()
  await patchLive(map)
  patchSeed()
  console.log('Terminé.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
