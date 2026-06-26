/**
 * Dépouille l'objet `figure` à { image } seul (décision du 26 juin 2026): retire
 * label / caption / ratio de TOUTES les figures du dataset. La LÉGENDE migre vers la
 * DESCRIPTION de l'asset (bilingue), comme l'ALT vit déjà sur l'asset (altText). Le
 * ratio est désormais décidé par l'emplacement au rendu, plus par le contenu.
 *
 * Seule légende réelle au seed: l'image d'inspection de l'article fourmis (fr/en),
 * relocalisée sur la description de son asset.
 *
 * Idempotent (rejouable). Lancer depuis studio/:
 *   npx sanity exec migrate/figure-strip.mjs --with-user-token
 *   DRY=1 npx sanity exec migrate/figure-strip.mjs --with-user-token   (aperçu sans écriture)
 */
import { getCliClient } from 'sanity/cli'

const client = getCliClient({ apiVersion: '2024-09-01' })
const DRY = process.env.DRY === '1'

// 1. Légendes relocalisées sur la description bilingue de l'asset.
const ASSET_DESCRIPTIONS = {
  'image-63ce3125380e4bf9994b4261b970c11d5b098d48-1200x896-jpg': {
    fr: 'Une inspection soignée trouve le nid, pas seulement les ouvrières.',
    en: 'A careful inspection finds the nest, not just the workers.',
  },
}

// 2. Strip récursif de label/caption/ratio sur les objets `figure` (= objet portant
//    une clé `image`). Les autres porteurs de label (lien, proof, stat) n'ont PAS de
//    clé `image`, donc restent intacts.
let stripped = 0
function strip(node) {
  if (Array.isArray(node)) {
    let changed = false
    for (const item of node) changed = strip(item) || changed
    return changed
  }
  if (node && typeof node === 'object') {
    let changed = false
    const isFigure = node.image && typeof node.image === 'object'
    if (isFigure) {
      for (const f of ['label', 'caption', 'ratio']) {
        if (f in node) {
          delete node[f]
          changed = true
          stripped++
        }
      }
    }
    for (const k of Object.keys(node)) changed = strip(node[k]) || changed
    return changed
  }
  return false
}

async function run() {
  for (const [assetId, description] of Object.entries(ASSET_DESCRIPTIONS)) {
    console.log(`asset ${assetId} -> description { fr, en }`)
    if (!DRY) await client.patch(assetId).set({ description }).commit()
  }

  const docs = await client.fetch(`*[
    !(_id in path("drafts.**")) &&
    !(_type match "sanity.**") &&
    !(_type match "system.**") &&
    _type != "translation.metadata" &&
    _type != "media.tag"
  ]`)

  let changedDocs = 0
  for (const doc of docs) {
    if (strip(doc)) {
      changedDocs++
      console.log(`strip: ${doc._id}`)
      if (!DRY) await client.createOrReplace(doc)
    }
  }

  console.log(`\n${DRY ? '[DRY] ' : ''}${stripped} champ(s) retire(s) sur ${changedDocs} document(s).`)
}

run().then(() => process.exit(0)).catch((e) => {
  console.error(e)
  process.exit(1)
})
