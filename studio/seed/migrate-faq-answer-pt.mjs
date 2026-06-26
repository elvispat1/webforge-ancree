// Lot service détail, sous-étape A (socle FAQ): faqItem.answer passe de texte plat
// à Portable Text restreint (maillage interne inline + JSON-LD FAQPage alimenté par
// une extraction texte). Décision Charles no 6.
//
// Ce script migre LA DONNÉE: chaque answer string -> un (ou des) bloc(s) PT normaux.
// Doit tourner AVANT le build (la projection projette désormais answer en PT). Les
// 12 faqItems actuels (6 fr + 6 en) sont des paragraphes simples sans saut: un bloc
// chacun. Idempotent (saute si answer est déjà un array). Live puis miroir seed.
//
// Usage:  node studio/seed/migrate-faq-answer-pt.mjs [--dry-run]

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

// Texte plat -> Portable Text normal. Paragraphes séparés par un saut double; les
// sauts simples deviennent une espace (le PT n'a pas de saut souple propre). Clés
// déterministes (re-run stable).
function strToPt(str) {
  const paras = String(str)
    .split(/\n{2,}/)
    .map((s) => s.replace(/\s*\n\s*/g, ' ').trim())
    .filter(Boolean)
  const blocks = paras.length ? paras : ['']
  return blocks.map((text, i) => ({
    _type: 'block',
    _key: `a${i}`,
    style: 'normal',
    markDefs: [],
    children: [{ _type: 'span', _key: `a${i}s0`, text, marks: [] }],
  }))
}

async function migrateLive() {
  const items = await client.fetch('*[_type == "faqItem"]{_id, answer}')
  let changed = 0
  for (const it of items) {
    if (Array.isArray(it.answer)) continue
    const pt = strToPt(it.answer)
    if (DRY) {
      console.log(`  ${it._id}: DRY -> ${pt.length} bloc(s) PT`)
      changed++
      continue
    }
    await client.patch(it._id).set({ answer: pt }).commit({ visibility: 'sync' })
    console.log(`  ${it._id}: answer -> PT (live).`)
    changed++
  }
  console.log(`  live: ${changed} faqItem(s)${DRY ? ' (DRY)' : ''}.`)
}

function migrateSeed() {
  const seed = JSON.parse(readFileSync(seedPath, 'utf8'))
  let changed = 0
  for (const d of seed.documents) {
    if (d.type !== 'faqItem') continue
    if (Array.isArray(d.content.answer)) continue
    d.content.answer = strToPt(d.content.answer)
    changed++
  }
  if (DRY) {
    console.log(`  seed: ${changed} faqItem(s) (DRY).`)
    return
  }
  writeFileSync(seedPath, JSON.stringify(seed, null, 2) + '\n')
  console.log(`  seed-content.json: ${changed} faqItem(s) mis à jour (miroir).`)
}

async function main() {
  console.log(`Migration faqItem.answer -> Portable Text (dataset ${client.config().dataset})`)
  await migrateLive()
  migrateSeed()
  console.log('Terminé.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
