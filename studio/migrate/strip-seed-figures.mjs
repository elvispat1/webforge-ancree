/**
 * Aligne le miroir seed-content.json sur le live: retire label / caption / ratio des
 * figures (objet `figure` = objet portant une clé `image`). La légende vit désormais
 * sur la description bilingue de l'asset (seed/seed.mjs ASSET_DESCRIPTIONS). Idempotent.
 *
 * Lancer depuis studio/:  node migrate/strip-seed-figures.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const seedPath = join(dirname(fileURLToPath(import.meta.url)), '..', 'seed-content.json')

let stripped = 0
function strip(node) {
  if (Array.isArray(node)) {
    node.forEach(strip)
    return
  }
  if (node && typeof node === 'object') {
    if (node.image && typeof node.image === 'object') {
      for (const f of ['label', 'caption', 'ratio']) {
        if (f in node) {
          delete node[f]
          stripped++
        }
      }
    }
    for (const k of Object.keys(node)) strip(node[k])
  }
}

const seed = JSON.parse(readFileSync(seedPath, 'utf8'))
strip(seed)
writeFileSync(seedPath, JSON.stringify(seed, null, 2) + '\n', 'utf8')
console.log(`${stripped} champ(s) retiré(s) du miroir seed-content.json.`)
