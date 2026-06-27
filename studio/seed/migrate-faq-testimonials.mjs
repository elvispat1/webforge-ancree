// FAQ /faq, lot FOND: intercale un bloc temoignages dans le pageBuilder de la
// page, AVANT le bandeau d'appel. Decision Charles: les temoignages viennent
// APRES le repertoire (rendu hors pageBuilder) et avant ctaBand+contact, pour
// casser le mur d'accordeons par une preuve sociale qui fait echo aux questions.
//
// Sequence finale de /faq:  Hero > FaqDirectory > testimonials > ctaBand > contact.
// Le schema autorise deja le bloc (pageBuilderField partage, 12 types): aucun
// redeploiement Studio requis.
//
// Mode "featured" (limit 3), comme le hub villes et /a-propos. Copie propre a la
// FAQ (les memes questions, des reponses qui tiennent). Apostrophes droites.
//
// Live (patch + publish sync) puis miroir seed-content.json. Idempotent: no-op si
// un bloc temoignages est deja present.
//
// Usage:  node studio/seed/migrate-faq-testimonials.mjs [--dry-run]

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

// Bloc temoignages par langue. _key "pb-tm" (libre: la page n'a que b1/b2).
const TM = {
  fr: {
    _key: 'pb-tm',
    _type: 'testimonials',
    eyebrow: "La preuve par l'expérience",
    heading: 'Ils avaient les mêmes questions que vous',
    mode: 'featured',
    limit: 3,
  },
  en: {
    _key: 'pb-tm',
    _type: 'testimonials',
    eyebrow: 'Proof from the field',
    heading: 'They had the same questions you do',
    mode: 'featured',
    limit: 3,
  },
}

const DOCS = [
  { id: 'faqPage-fr', lang: 'fr' },
  { id: 'faqPage-en', lang: 'en' },
]

async function migrateLive(id, lang) {
  const doc = await client.getDocument(id)
  if (!doc) throw new Error(`introuvable: ${id}`)
  const pb = doc.pageBuilder || []
  if (pb.some((b) => b._type === 'testimonials')) {
    console.log(`  ${id}: bloc temoignages deja present, saut.`)
    return
  }
  const next = [TM[lang], ...pb]
  if (DRY) {
    console.log(`  ${id}: DRY, pageBuilder -> ${next.map((b) => b._type).join(', ')}`)
    return
  }
  await client.patch(id).set({ pageBuilder: next }).commit({ visibility: 'sync' })
  console.log(`  ${id}: temoignages intercale (live).`)
}

function migrateSeed() {
  const seed = JSON.parse(readFileSync(seedPath, 'utf8'))
  let changed = 0
  for (const d of seed.documents) {
    if (d.type !== 'faqPage') continue
    const lang = d.content.language
    if (!TM[lang]) continue
    const pb = d.content.pageBuilder || []
    if (pb.some((b) => b._type === 'testimonials')) continue
    d.content.pageBuilder = [TM[lang], ...pb]
    changed++
  }
  if (DRY) {
    console.log(`  seed: ${changed} doc(s) (DRY).`)
    return
  }
  writeFileSync(seedPath, JSON.stringify(seed, null, 2) + '\n')
  console.log(`  seed-content.json: ${changed} doc(s) mis a jour (miroir).`)
}

async function main() {
  console.log(`Temoignages dans /faq (dataset ${client.config().dataset})`)
  for (const { id, lang } of DOCS) await migrateLive(id, lang)
  migrateSeed()
  console.log('Termine.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
