// Migration ponctuelle: les CTA « contact » des pages MULTIPAGE (qui n'ont pas de
// section contact en place) reçoivent une page interne = Contact. Un lien `anchor`
// avec internalRef se résout en `/contact#contact` (va sur la page contact, puis
// scrolle à l'ancre), au lieu d'une ancre nue `#contact` sans cible sur ces pages.
//
// Le one-pager et la page contact GARDENT l'ancre nue (#contact) qui scrolle en
// place (la section y est présente). La nav landing (siteSettings) reste en ancres.
//
// Remplace le recâblage codé en dur de app/pages/index.vue (retiré): le CMS pilote.
//
// Auth: SANITY_AUTH_TOKEN ou ~/.config/sanity/config.json.
// Usage: node studio/seed/migrate-contact-cta-ref.mjs [--dry-run]

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

// Docs dont une page courante n'a PAS de section contact: un CTA contact doit y
// pointer la page Contact. (onePager + contactPage gardent l'ancre nue.)
const MULTIPAGE_TYPES = new Set([
  'homePage', 'servicesPage', 'aboutPage', 'faqPage', 'villesPage', 'blogPage', 'service',
])

const isAnchorContactLink = (n) =>
  n && typeof n === 'object' && n.type === 'anchor' && n.anchor === 'contact' && !n.internalRef

// Pose internalRef = contactPage de la langue du doc sur chaque lien ancre #contact.
function patchLinks(node, lang, counters) {
  if (Array.isArray(node)) return node.forEach((it) => patchLinks(it, lang, counters))
  if (node && typeof node === 'object') {
    if (isAnchorContactLink(node)) {
      node.internalRef = { _type: 'reference', _ref: `contactPage-${lang}` }
      counters.n += 1
    }
    for (const k of Object.keys(node)) patchLinks(node[k], lang, counters)
  }
}

const docs = await client.fetch('*')
const isSystem = (id) => id.startsWith('drafts.') || id.includes('previewUrlSecret')

const changed = []
for (const d of docs) {
  if (isSystem(d._id)) continue
  if (!MULTIPAGE_TYPES.has(d._type)) continue
  const lang = d.language
  if (lang !== 'fr' && lang !== 'en') continue
  const clone = structuredClone(d)
  const counters = { n: 0 }
  patchLinks(clone, lang, counters)
  if (counters.n > 0) changed.push({ doc: clone, n: counters.n })
}

console.log(`Dataset: ${client.config().dataset} (project ${client.config().projectId})`)
console.log(`Docs lus: ${docs.length} | docs à modifier: ${changed.length}\n`)
console.log('═══ CTA contact -> page interne Contact (anchor #contact + internalRef) ═══')
let total = 0
for (const { doc, n } of changed) {
  total += n
  console.log(`   ${doc._id}: ${n} lien(s) contact -> contactPage-${doc.language}`)
}
console.log(`\nTotal: ${total} lien(s) sur ${changed.length} docs.`)

if (DRY) {
  console.log('\nDRY RUN: aucune écriture.')
} else {
  let tx = client.transaction()
  for (const { doc } of changed) tx = tx.createOrReplace(doc)
  const res = await tx.commit({ visibility: 'sync' })
  console.log(`\nCommit OK: ${res.results?.length ?? 0} mutation(s).`)
}
