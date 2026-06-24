// Migration ponctuelle: l'alt par usage (sur les objets `figure` et le `visual`
// du hero) devient un alt bilingue PAR ASSET, lu nativement par le plugin média
// (altText localisé { fr, en } sur le doc sanity.imageAsset). Trois passes:
//
//   1. RÉCOLTE  -> choisit un alt { fr, en } par asset et le pose sur l'asset.
//   2. STRIP    -> retire la clé `alt` de TOUS les nœuds figure (zéro champ orphelin).
//   3. HERO     -> restructure homePage/onePager (fr+en): visual figure -> heroImage
//                  { desktop }, en jetant alt/label/caption/ratio.
//
// Une image servant plusieurs usages avec des alt différents = CONFLIT: on choisit
// un défaut (le plus partagé; égalité tranchée par rôle puis par clé de slot) et on
// LOG tous les candidats pour raffinage en médiathèque. Override explicite pour le
// cas ambigu hero-rempart (décrit littéralement la camionnette -> alt de villesPage).
//
// Auth: SANITY_AUTH_TOKEN ou ~/.config/sanity/config.json (comme seed.mjs).
// Usage: node studio/seed/migrate-hero-alt.mjs [--dry-run]

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

// ── Helpers de forme ─────────────────────────────────────────────────────────

const assetRefOf = (img) =>
  img && typeof img === 'object' && img.asset && typeof img.asset._ref === 'string' ? img.asset._ref : null

// Un nœud figure: un objet portant un sous-objet `image` qui référence un asset.
const isFigureNode = (n) => n && typeof n === 'object' && assetRefOf(n.image) != null

// Identifiant logique d'un doc (sans préfixe brouillon ni suffixe de langue).
const logicalId = (id) => id.replace(/^drafts\./, '').replace(/-(fr|en)$/, '')

// Rang de rôle d'un usage d'après son chemin relatif (plus petit = plus proéminent).
function roleRank(relPath) {
  if (/(^|\.)visual$/.test(relPath)) return 0 // visuel du héros
  if (/body\[/.test(relPath)) return 5 // corps/galerie d'article
  if (/hero\[\d+\]\.image$/.test(relPath)) return 1 // masthead de page interne
  if (/^image$/.test(relPath)) return 2 // image principale de service
  if (/(^|\.)photo$/.test(relPath)) return 3 // photo de bloc « about »
  if (/(^|\.)cover$/.test(relPath)) return 4 // couverture d'article
  return 9
}

// Override des cas ambigus (égalité totale): on force le slot le plus fidèle à
// l'image. hero-rempart montre la camionnette -> l'alt de villesPage.
const OVERRIDES = {
  'hero-rempart.jpg': (slot) => slot.logicalId === 'villesPage',
}

// ── Lecture du dataset ───────────────────────────────────────────────────────

const docs = await client.fetch('*')
const isSystem = (id) => id.startsWith('drafts.') || id.includes('previewUrlSecret')

// slots: assetRef -> Map(slotKey -> { logicalId, relPath, role, fr, en })
const slots = new Map()

function harvest(node, lang, docId, relPath) {
  if (Array.isArray(node)) return node.forEach((it, i) => harvest(it, lang, docId, `${relPath}[${i}]`))
  if (node && typeof node === 'object') {
    if (isFigureNode(node) && typeof node.alt === 'string' && node.alt.length > 0) {
      const ref = assetRefOf(node.image)
      const lid = logicalId(docId)
      const key = `${lid}|${relPath}`
      if (!slots.has(ref)) slots.set(ref, new Map())
      const m = slots.get(ref)
      const slot = m.get(key) || { logicalId: lid, relPath, role: roleRank(relPath) }
      slot[lang] = node.alt
      m.set(key, slot)
    }
    for (const k of Object.keys(node)) harvest(node[k], lang, docId, relPath ? `${relPath}.${k}` : k)
  }
}

// On récolte les candidats sur les docs PUBLIÉS de langue fr/en uniquement.
for (const d of docs) {
  if (isSystem(d._id)) continue
  const lang = d.language
  if (lang !== 'fr' && lang !== 'en') continue
  harvest(d, lang, d._id, '')
}

// ── Choix de l'alt par asset ─────────────────────────────────────────────────

// Résout les noms de fichiers d'assets pour des logs lisibles + override.
const assetRefs = [...slots.keys()]
const assetDocs = await client.fetch('*[_id in $ids]{_id, originalFilename, altText}', { ids: assetRefs })
const fnOf = Object.fromEntries(assetDocs.map((a) => [a._id, a.originalFilename || a._id]))
const existingAlt = Object.fromEntries(assetDocs.map((a) => [a._id, a.altText]))

const decisions = [] // { ref, fn, fr, en, note, candidates }

for (const ref of assetRefs) {
  const slotList = [...slots.get(ref).values()]
  // Popularité = nombre de slots partageant le même alt fr (les langues sont en miroir).
  const freqFr = {}
  for (const s of slotList) if (s.fr) freqFr[s.fr] = (freqFr[s.fr] || 0) + 1
  const pop = (s) => (s.fr ? freqFr[s.fr] || 0 : 0)

  const fn = fnOf[ref]
  const override = OVERRIDES[fn]
  let winner
  if (override) winner = slotList.find(override)
  if (!winner) {
    winner = [...slotList].sort((a, b) => {
      if (pop(b) !== pop(a)) return pop(b) - pop(a) // plus partagé d'abord
      if (a.role !== b.role) return a.role - b.role // rôle plus proéminent
      return `${a.logicalId}|${a.relPath}`.localeCompare(`${b.logicalId}|${b.relPath}`)
    })[0]
  }

  // Repli de langue: si le slot gagnant n'a pas une langue, prendre l'alt le plus
  // partagé dans cette langue pour l'asset (rare; nos slots ont fr+en).
  const fallback = (lang) => {
    const freq = {}
    for (const s of slotList) if (s[lang]) freq[s[lang]] = (freq[s[lang]] || 0) + 1
    return Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] || ''
  }
  const fr = winner?.fr || fallback('fr')
  const en = winner?.en || fallback('en')

  // Liste des candidats par langue (pour le log de conflit).
  const candidatesFor = (lang) => {
    const freq = {}
    for (const s of slotList) if (s[lang]) freq[s[lang]] = (freq[s[lang]] || 0) + 1
    return Object.entries(freq).sort((a, b) => b[1] - a[1])
  }

  decisions.push({
    ref,
    fn,
    fr,
    en,
    note: override ? 'OVERRIDE (fidélité à l\'image)' : 'auto (plus partagé / rôle)',
    candidates: { fr: candidatesFor('fr'), en: candidatesFor('en') },
    existing: existingAlt[ref],
  })
}

// ── Mutation des docs (clone + restructure hero + strip alt) ──────────────────

function restructureHero(node) {
  // heroHome.visual: figure { image, alt, label, caption, ratio } -> heroImage { desktop }.
  if (node && typeof node === 'object' && node._type === 'heroHome' && node.visual && node.visual.image) {
    node.visual = { _type: 'heroImage', desktop: node.visual.image }
    return true
  }
  return false
}

function stripAndRestructure(node, counters) {
  if (Array.isArray(node)) {
    for (const it of node) stripAndRestructure(it, counters)
    return
  }
  if (node && typeof node === 'object') {
    if (restructureHero(node)) counters.hero += 1
    // Strip de l'alt orphelin sur tout nœud figure restant (le visual du héros, déjà
    // restructuré en heroImage, n'a plus de clé `image` -> non concerné).
    if (isFigureNode(node) && 'alt' in node) {
      delete node.alt
      counters.alt += 1
    }
    for (const k of Object.keys(node)) stripAndRestructure(node[k], counters)
  }
}

const changedDocs = []
for (const d of docs) {
  if (isSystem(d._id)) continue
  const clone = structuredClone(d)
  const counters = { alt: 0, hero: 0 }
  stripAndRestructure(clone, counters)
  if (counters.alt > 0 || counters.hero > 0) {
    changedDocs.push({ doc: clone, counters })
  }
}

// ── Rapport ──────────────────────────────────────────────────────────────────

console.log(`Dataset: ${client.config().dataset} (project ${client.config().projectId})`)
console.log(`Docs lus: ${docs.length} | assets de figure: ${assetRefs.length} | docs à modifier: ${changedDocs.length}\n`)

console.log('═══ ALT BILINGUE CHOISI PAR ASSET (posé sur l\'asset) ═══')
for (const d of decisions) {
  console.log(`\n[${d.fn}]  ${d.note}${d.existing ? '  (altText actuel: ' + JSON.stringify(d.existing) + ')' : ''}`)
  console.log(`   fr ✓ "${d.fr}"`)
  console.log(`   en ✓ "${d.en}"`)
  const hasConflict = d.candidates.fr.length > 1 || d.candidates.en.length > 1
  if (hasConflict) {
    console.log('   ── CONFLIT, autres candidats à raffiner en médiathèque:')
    for (const lang of ['fr', 'en']) {
      for (const [alt, n] of d.candidates[lang]) {
        if (alt !== d[lang]) console.log(`        [${lang}] ×${n}  "${alt}"`)
      }
    }
  }
}

console.log('\n═══ DOCS MODIFIÉS (alt retiré / hero restructuré) ═══')
for (const { doc, counters } of changedDocs) {
  const bits = []
  if (counters.alt) bits.push(`${counters.alt} alt retiré(s)`)
  if (counters.hero) bits.push('hero -> heroImage')
  console.log(`   ${doc._id}: ${bits.join(', ')}`)
}

// ── Écriture ───────────────────────────────────────────────────────────────

if (DRY) {
  console.log('\nDRY RUN: aucune écriture.')
} else {
  let tx = client.transaction()
  for (const d of decisions) tx = tx.patch(d.ref, (p) => p.set({ altText: { fr: d.fr, en: d.en } }))
  for (const { doc } of changedDocs) tx = tx.createOrReplace(doc)
  const res = await tx.commit({ visibility: 'sync' })
  console.log(`\nCommit OK: ${res.results?.length ?? 0} mutation(s) (${decisions.length} assets + ${changedDocs.length} docs).`)
}
