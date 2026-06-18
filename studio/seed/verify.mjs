/**
 * Vérification post-seed du démo WebForge Minimaliste.
 *
 * Usage, depuis studio/ :
 *   yarn sanity exec seed/verify.mjs --with-user-token
 *
 * Vérifie, sur les documents publiés du dataset :
 *   a. comptes attendus par type et par langue, et un translation.metadata
 *      par paire FR/EN (id déterministe translation-<base>, aucun orphelin)
 *   b. aucun marqueur _imagePath restant (GROQ ne peut pas chercher une clé
 *      arbitraire : on télécharge les documents et on marche récursivement)
 *   c. intégrité des références : chaque _ref pointe un _id existant
 *   d. chaque figure avec image a un asset résolvable (sanity.imageAsset)
 *
 * Code de sortie 1 si au moins une vérification échoue.
 */

import { getCliClient } from 'sanity/cli'

// Override env (D5), aligné sur run.mjs / sanity.cli.ts. Lecture seule: aucun
// garde-fou d'écriture ici, on vérifie le project effectivement configuré.
const PROJECT_ID = process.env.SANITY_STUDIO_PROJECT_ID || 'fesilwqf'
const DATASET = process.env.SANITY_STUDIO_DATASET || 'production'
const API_VERSION = '2026-06-01'

// Inventaire attendu, par type et par langue (x2 : fr et en).
const EXPECTED_PER_LANG = {
  siteSettings: 1,
  homePage: 1,
  servicesPage: 1,
  projectsPage: 1,
  aboutPage: 1,
  blogPage: 1,
  faqPage: 1,
  contactPage: 1,
  onePager: 1,
  service: 5,
  project: 6,
  article: 12,
  category: 3,
  testimonial: 6,
  faqTheme: 8,
  faqItem: 9,
  legalPage: 2,
}

// Types présents au dataset mais hors inventaire de contenu.
const NON_CONTENT_TYPES = new Set([
  'translation.metadata',
  'sanity.imageAsset',
  'sanity.fileAsset',
  'media.tag',
])

function abort(message) {
  console.error(`\n✗ ABORT: ${message}`)
  process.exit(1)
}

const client = getCliClient({ apiVersion: API_VERSION })
const config = client.config()

if (config.projectId !== PROJECT_ID) {
  abort(`projectId attendu « ${PROJECT_ID} », reçu « ${config.projectId} ». Vérifier sanity.cli.ts.`)
}
if (config.dataset !== DATASET) {
  abort(`dataset attendu « ${DATASET} », reçu « ${config.dataset} ». Vérifier sanity.cli.ts.`)
}
if (!config.token) {
  abort('aucun token. Lancer avec : yarn sanity exec seed/verify.mjs --with-user-token')
}

// Marche récursive avec chemin lisible pour les messages d'erreur.
function walk(node, visit, crumb = '') {
  if (Array.isArray(node)) {
    node.forEach((item, i) => walk(item, visit, `${crumb}[${i}]`))
    return
  }
  if (node && typeof node === 'object') {
    visit(node, crumb)
    for (const [key, value] of Object.entries(node)) walk(value, visit, crumb ? `${crumb}.${key}` : key)
  }
}

const failures = []
function check(ok, message) {
  if (!ok) failures.push(message)
  return ok
}

async function main() {
  console.log(`Vérification du seed — project ${PROJECT_ID}, dataset ${DATASET}, api ${API_VERSION}`)

  // Un seul fetch : tous les documents publiés, assets et metadata compris.
  const docs = await client.fetch('*[!(_id in path("drafts.**"))]')
  const idSet = new Set(docs.map((d) => d._id))
  const typeById = new Map(docs.map((d) => [d._id, d._type]))

  const contentDocs = docs.filter((d) => d._type in EXPECTED_PER_LANG)
  const metadataDocs = docs.filter((d) => d._type === 'translation.metadata')
  const langOf = (d) => d.language ?? d._id.match(/-(fr|en)$/)?.[1]

  // ----------------------------------------------------------
  // a. Comptes par type et par langue
  // ----------------------------------------------------------
  console.log('\n--- a. Comptes par type et par langue ---')
  for (const [type, expected] of Object.entries(EXPECTED_PER_LANG)) {
    const parts = []
    for (const lang of ['fr', 'en']) {
      const got = contentDocs.filter((d) => d._type === type && langOf(d) === lang).length
      const ok = check(got === expected, `compte ${type} ${lang} : attendu ${expected}, trouvé ${got}`)
      parts.push(`${lang} ${got}/${expected} ${ok ? '✓' : '✗'}`)
    }
    console.log(`  ${type.padEnd(14)} ${parts.join('   ')}`)
  }

  // Types inattendus : signalés sans faire échouer (media.tag et compagnie
  // sont des types d'infrastructure légitimes).
  const unexpected = docs.filter((d) => !(d._type in EXPECTED_PER_LANG) && !NON_CONTENT_TYPES.has(d._type))
  for (const d of unexpected) console.warn(`  ! type hors inventaire : ${d._type} (${d._id})`)

  // translation.metadata : un par paire FR/EN présente, id déterministe,
  // aucun orphelin. Avec l'inventaire ci-dessus au complet, cela fait une
  // metadata par paire de base (somme des types x1).
  console.log('\n--- a. translation.metadata ---')
  const pairBases = new Set()
  const langsByBase = new Map()
  for (const d of contentDocs) {
    const match = d._id.match(/^(.*)-(fr|en)$/)
    if (!match) {
      check(false, `_id de contenu sans suffixe de langue : ${d._id}`)
      continue
    }
    if (!langsByBase.has(match[1])) langsByBase.set(match[1], new Set())
    langsByBase.get(match[1]).add(match[2])
  }
  for (const [base, langs] of langsByBase) {
    if (langs.has('fr') && langs.has('en')) pairBases.add(base)
    else check(false, `paire incomplète : ${base} (${[...langs].join(', ')} seulement)`)
  }

  check(
    metadataDocs.length === pairBases.size,
    `translation.metadata : attendu ${pairBases.size} (une par paire FR/EN), trouvé ${metadataDocs.length}`,
  )
  console.log(`  paires FR/EN : ${pairBases.size}, metadata : ${metadataDocs.length}`)

  const metadataIds = new Set(metadataDocs.map((d) => d._id))
  for (const base of pairBases) {
    check(metadataIds.has(`translation-${base}`), `metadata manquante pour la paire ${base} (translation-${base})`)
  }
  for (const d of metadataDocs) {
    const base = d._id.replace(/^translation-/, '')
    check(d._id.startsWith('translation-') && pairBases.has(base), `metadata orpheline : ${d._id}`)
    const langs = (d.translations ?? []).map((t) => t.language).sort()
    check(
      langs.join(',') === 'en,fr',
      `metadata ${d._id} : entries de langue attendues fr et en, trouvé (${langs.join(', ') || 'aucune'})`,
    )
  }

  // ----------------------------------------------------------
  // b. Aucun marqueur _imagePath restant
  // ----------------------------------------------------------
  console.log('\n--- b. Marqueurs _imagePath restants ---')
  let markerCount = 0
  for (const d of docs) {
    walk(d, (obj, crumb) => {
      if (typeof obj._imagePath === 'string') {
        markerCount += 1
        check(false, `_imagePath restant dans ${d._id} (${crumb}) : ${obj._imagePath}`)
      }
    })
  }
  console.log(`  ${markerCount} marqueur(s) restant(s) ${markerCount === 0 ? '✓' : '✗'}`)

  // ----------------------------------------------------------
  // c. Intégrité des références
  // ----------------------------------------------------------
  console.log('\n--- c. Intégrité des références ---')
  let refCount = 0
  let brokenRefs = 0
  for (const d of docs) {
    walk(d, (obj, crumb) => {
      if (typeof obj._ref !== 'string') return
      refCount += 1
      if (!idSet.has(obj._ref)) {
        brokenRefs += 1
        check(false, `référence brisée dans ${d._id} (${crumb}) : ${obj._ref}`)
      }
    })
  }
  console.log(`  ${refCount} références, ${brokenRefs} brisée(s) ${brokenRefs === 0 ? '✓' : '✗'}`)

  // ----------------------------------------------------------
  // d. Chaque figure avec image a un asset résolvable
  // ----------------------------------------------------------
  console.log('\n--- d. Figures avec image ---')
  let figureCount = 0
  let figureBroken = 0
  for (const d of docs) {
    walk(d, (obj, crumb) => {
      if (obj._type !== 'figure' || obj.image == null) return
      figureCount += 1
      const ref = obj.image.asset?._ref
      const ok = typeof ref === 'string' && typeById.get(ref) === 'sanity.imageAsset'
      if (!ok) {
        figureBroken += 1
        check(false, `figure sans asset résolvable dans ${d._id} (${crumb}) : asset=${ref ?? 'absent'}`)
      }
    })
  }
  console.log(`  ${figureCount} figures avec image, ${figureBroken} non résolvable(s) ${figureBroken === 0 ? '✓' : '✗'}`)

  // ----------------------------------------------------------
  // Verdict
  // ----------------------------------------------------------
  if (failures.length > 0) {
    console.error(`\n✗ ${failures.length} échec(s) :`)
    for (const f of failures) console.error(`  - ${f}`)
    process.exit(1)
  }
  console.log('\n✓ Toutes les vérifications passent.')
}

main().catch((err) => {
  console.error('\n✗ Erreur de vérification :', err.message)
  process.exit(1)
})
