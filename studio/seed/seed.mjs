// Importeur de seed Ancree (demo Rempart Extermination).
//
// Lit studio/seed-content.json (format { documents: [ { type, content } ] }),
// uploade les 4 images locales en assets natifs, remplace les references
// IMG:<cle> par l'asset _id reel, puis fait un SWAP PROPRE: supprime tous les
// anciens documents de contenu (par type) avant de creer les neufs. Les assets
// uploades ne sont pas supprimes (sanity.imageAsset hors de la liste de types).
//
// Auth: lit le token du CLI Sanity (~/.config/sanity/config.json) ou
// SANITY_AUTH_TOKEN. Idempotent au niveau des documents (createOrReplace);
// relancer re-uploade les images (assets orphelins benins).
//
// Usage:  node studio/seed/seed.mjs           (execute)
//         node studio/seed/seed.mjs --dry-run (n'ecrit rien, affiche le plan)

import { createClient } from '@sanity/client'
import { readFileSync, createReadStream } from 'node:fs'
import { homedir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const DRY = process.argv.includes('--dry-run')
const here = dirname(fileURLToPath(import.meta.url))
const studioDir = join(here, '..')
const repoRoot = join(studioDir, '..')

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

const img = (file) => join(repoRoot, 'public', 'images', file)
const IMAGES = {
  'hero-rempart': img('hero-rempart.jpg'),
  'equipe-rempart': img('equipe-rempart.jpg'),
  'hero-technicien': img('hero-technicien.jpg'),
  'inspection-rempart': img('inspection-rempart.jpg'),
  // Héros générés (split asymétrique): nuisibles sur fond blanc (détail service),
  // scènes pour les pages de niveau 2, camionnette de quartier (villes, partagée).
  'hero-ant': img('hero-ant.jpg'),
  'hero-mouse': img('hero-mouse.jpg'),
  'hero-wasp': img('hero-wasp.jpg'),
  'hero-bedbug': img('hero-bedbug.jpg'),
  'hero-roach': img('hero-roach.jpg'),
  'hero-team': img('hero-team.jpg'),
  'hero-techVan': img('hero-techVan.jpg'),
  'hero-techAction': img('hero-techAction.jpg'),
  'hero-vanHood': img('hero-vanHood.jpg'),
  // Logo de marque (brand.logo des Globales): le SVG de la favicon sert de marque.
  'logo-rempart': join(repoRoot, 'public', 'favicon.svg'),
}

// Texte alternatif BILINGUE par asset, posé sur le doc sanity.imageAsset (altText
// localisé { fr, en } lu nativement par le plugin média et par les projections GROQ).
// L'alt vit sur l'image, plus par usage. Une image réutilisée porte un seul alt par
// langue (défaut de la migration); raffiner ensuite dans la médiathèque ET ici, sinon
// un re-seed réécrit ces valeurs. Le logo est décoratif: pas d'altText.
const ALT_TEXT = {
  'hero-rempart': {
    fr: 'Camionnette de service de Rempart Extermination dans un quartier de la Rive-Nord',
    en: 'Rempart Extermination service van in a North Shore neighbourhood',
  },
  'equipe-rempart': {
    fr: 'Les techniciens de Rempart Extermination réunis devant leur camionnette de service',
    en: 'The Rempart Extermination technicians standing together beside their service van',
  },
  'hero-technicien': {
    fr: 'Un technicien de Rempart Extermination en intervention devant une maison de la Rive-Nord',
    en: 'A Rempart Extermination technician on a job in front of a North Shore home',
  },
  'inspection-rempart': {
    fr: 'Un technicien vérifie les points d\'entrée le long d\'une fondation',
    en: 'A technician checking entry points along a foundation',
  },
  'hero-ant': {
    fr: 'Fourmi charpentière en gros plan sur fond blanc',
    en: 'Carpenter ant in close-up on a white background',
  },
  'hero-mouse': {
    fr: 'Souris domestique sur fond blanc',
    en: 'House mouse on a white background',
  },
  'hero-wasp': {
    fr: 'Guêpe sur fond blanc',
    en: 'Wasp on a white background',
  },
  'hero-bedbug': {
    fr: 'Punaise de lit en gros plan sur fond blanc',
    en: 'Bed bug in close-up on a white background',
  },
  'hero-roach': {
    fr: 'Coquerelle sur fond blanc',
    en: 'Cockroach on a white background',
  },
  'hero-team': {
    fr: 'L\'équipe de techniciens de Rempart devant la camionnette de service',
    en: 'The Rempart technician team in front of the service van',
  },
  'hero-techVan': {
    fr: 'Technicien de Rempart à côté de la camionnette de service',
    en: 'Rempart technician beside the service van',
  },
  'hero-techAction': {
    fr: 'Technicien traitant les plinthes d\'une maison',
    en: 'Technician treating the baseboards of a home',
  },
  'hero-vanHood': {
    fr: 'Camionnette de service dans un quartier résidentiel de la Rive-Nord',
    en: 'Service van in a North Shore residential neighbourhood',
  },
}

// Extension de fichier d'un chemin (pour nommer l'asset uploade: jpg, svg, ...).
const extOf = (path) => path.slice(path.lastIndexOf('.') + 1).toLowerCase()

const seed = JSON.parse(readFileSync(join(studioDir, 'seed-content.json'), 'utf8'))
const docs = seed.documents
const types = [...new Set(docs.map((d) => d.type))]

// Remplace recursivement tout _ref "IMG:<cle>" par l'asset _id uploade.
function resolveImageRefs(node, map) {
  if (Array.isArray(node)) return node.map((n) => resolveImageRefs(n, map))
  if (node && typeof node === 'object') {
    for (const k of Object.keys(node)) {
      const v = node[k]
      if (k === '_ref' && typeof v === 'string' && v.startsWith('IMG:')) {
        const key = v.slice(4)
        const id = map[key]
        if (!id) throw new Error(`Cle image inconnue: ${v}`)
        node[k] = id
      } else {
        node[k] = resolveImageRefs(v, map)
      }
    }
  }
  return node
}

async function main() {
  console.log(`Dataset: ${client.config().dataset} (project ${client.config().projectId})`)
  console.log(`Documents a seeder: ${docs.length} | types: ${types.length}`)

  if (DRY) {
    const fs = await import('node:fs')
    for (const [key, path] of Object.entries(IMAGES)) {
      console.log(`  image ${key}: ${fs.existsSync(path) ? 'OK' : 'MANQUANTE'} (${path})`)
    }
    const refKeys = new Set()
    JSON.stringify(docs).replace(/IMG:([a-zA-Z-]+)/g, (_, k) => (refKeys.add(k), ''))
    console.log('  cles image referencees:', [...refKeys].join(', '))
    for (const [key, alt] of Object.entries(ALT_TEXT)) {
      console.log(`  altText ${key}: fr="${alt.fr}" | en="${alt.en}"`)
    }
    console.log('DRY-RUN: aucune ecriture.')
    return
  }

  // 1. Upload des 4 images natives (idempotent: reutilise l'asset si deja present).
  const assetMap = {}
  for (const [key, path] of Object.entries(IMAGES)) {
    const fn = `${key}.${extOf(path)}`
    const existing = await client.fetch(
      '*[_type == "sanity.imageAsset" && originalFilename == $fn][0]._id',
      { fn },
    )
    if (existing) {
      assetMap[key] = existing
      console.log(`  reutilise ${key} -> ${existing}`)
    } else {
      const asset = await client.assets.upload('image', createReadStream(path), { filename: fn })
      assetMap[key] = asset._id
      console.log(`  uploade ${key} -> ${asset._id}`)
    }
  }

  // 1b. Pose le texte alternatif bilingue sur les assets (altText localise { fr, en }).
  // L'alt vit sur l'image, lu par le plugin media et les projections GROQ.
  for (const [key, alt] of Object.entries(ALT_TEXT)) {
    const id = assetMap[key]
    if (!id) continue
    await client.patch(id).set({ altText: alt }).commit()
    console.log(`  altText ${key} -> { fr, en }`)
  }

  // 2. Construit les docs finaux (_type derive du wrapper, refs image resolues).
  const built = docs.map((d) => {
    const content = resolveImageRefs(structuredClone(d.content), assetMap)
    if (!content._type) content._type = d.type
    return content
  })

  // 3. Swap propre: supprime tous les anciens docs de contenu (par type), assets epargnes.
  console.log(`  suppression des anciens docs de types: ${types.join(', ')}`)
  await client.delete({ query: '*[_type in $types]', params: { types } })

  // 4. Cree les neufs en UNE transaction (les refs croisees fr/en se resolvent
  // dans la meme transaction; Sanity valide l'integrite a la fin du commit).
  let tx = client.transaction()
  for (const c of built) tx = tx.createOrReplace(c)
  await tx.commit({ visibility: 'sync' })
  console.log(`  cree ${built.length} docs en une transaction`)

  // 5. Verif des comptes.
  const counts = await client.fetch('*[_type in $types]{_type} | { "t": _type }', { types })
  const byType = {}
  for (const c of counts) byType[c.t] = (byType[c.t] || 0) + 1
  console.log('Comptes apres seed:', JSON.stringify(byType))
  console.log(`Total docs seedes: ${counts.length}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
