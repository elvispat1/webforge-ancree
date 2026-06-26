// Remplace le brand.logo (siteSettings) par le LOGO COMPLET de marque (glyphe +
// mot-symbole « Rempart Extermination »), ce qu'un vrai client fournit. Avant: le
// brand.logo pointait sur le SVG de la favicon (le glyphe seul). Le glyphe famille
// reste la favicon (public/favicon.svg), à la racine, inchangé.
//
// Téléverse public/logo-rempart.svg (généré par build-logo-svg.mjs, déduplication par
// hash de contenu côté Sanity), repointe siteSettings-fr/en brand.logo, puis supprime
// l'ancien asset de glyphe (devenu orphelin) pour que le re-seed reste déterministe
// (un seul asset « logo-rempart.svg »). seed.mjs pointe désormais la clé sur le logo
// complet; le ref seed IMG:logo-rempart est inchangé.
//
// Usage:  node studio/seed/migrate-brand-logo.mjs [--dry-run]

import { createClient } from '@sanity/client'
import { readFileSync, createReadStream } from 'node:fs'
import { homedir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const DRY = process.argv.includes('--dry-run')
const here = dirname(fileURLToPath(import.meta.url))
const logoPath = join(here, '..', '..', 'public', 'logo-rempart.svg')

function readToken() {
  if (process.env.SANITY_AUTH_TOKEN) return process.env.SANITY_AUTH_TOKEN
  const cfg = JSON.parse(readFileSync(join(homedir(), '.config', 'sanity', 'config.json'), 'utf8'))
  if (cfg.authToken) return cfg.authToken
  throw new Error('Aucun token Sanity.')
}

const client = createClient({ projectId: '5if00rwn', dataset: 'production', apiVersion: '2024-10-01', token: readToken(), useCdn: false })
const LANGS = ['fr', 'en']

async function main() {
  console.log(`Brand logo complet (dataset ${client.config().dataset})`)

  // Asset courant (le glyphe) référencé par brand.logo, pour le nettoyer après.
  const ssFr = await client.getDocument('siteSettings-fr')
  const staleRef = ssFr?.brand?.logo?.asset?._ref
  console.log(`  brand.logo actuel: ${staleRef || '(aucun)'}`)

  if (DRY) {
    console.log(`  DRY: téléverserait ${logoPath}, repointerait siteSettings-${LANGS.join('/')} brand.logo, supprimerait ${staleRef}`)
    return
  }

  // Téléverse le logo complet (dédup par hash: re-run renvoie le même asset).
  const asset = await client.assets.upload('image', createReadStream(logoPath), { filename: 'logo-rempart.svg' })
  console.log(`  logo complet -> ${asset._id}`)

  // Repointe brand.logo (fr + en) sur le logo complet.
  let tx = client.transaction()
  for (const lang of LANGS) {
    tx = tx.patch(`siteSettings-${lang}`, (p) =>
      p.set({ 'brand.logo': { _type: 'image', asset: { _type: 'reference', _ref: asset._id } } }),
    )
  }
  await tx.commit({ visibility: 'sync' })
  console.log(`  siteSettings-${LANGS.join('/')}: brand.logo repointé.`)

  // Nettoie l'ancien asset de glyphe (orphelin une fois brand.logo repointé), pour que
  // le re-seed (reuse par originalFilename) ne retombe pas dessus. Sans risque: la
  // favicon vit en public/favicon.svg, pas sur cet asset.
  if (staleRef && staleRef !== asset._id) {
    try {
      await client.delete(staleRef)
      console.log(`  ancien asset glyphe supprimé: ${staleRef}`)
    } catch (e) {
      console.log(`  ancien asset non supprimé (encore référencé?), ignoré: ${e.message}`)
    }
  }
  console.log('Terminé.')
}
main().catch((e) => { console.error(e); process.exit(1) })
