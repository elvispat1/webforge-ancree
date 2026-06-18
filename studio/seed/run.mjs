/**
 * Seed du démo WebForge Ancrée (contenu Atelier Cormier, FR + EN).
 *
 * Usage, depuis studio/ :
 *   yarn sanity exec seed/run.mjs --with-user-token
 *
 * Cible (D5): par défaut le project de la DÉMO (5if00rwn). Un vrai client qui
 * forke le gabarit pose SANITY_STUDIO_PROJECT_ID (et au besoin
 * SANITY_STUDIO_DATASET) vers SON project avant de lancer. Garde-fou: seeder
 * 5if00rwn est refusé sans SEED_ALLOW_DEMO=1 (réservé au mainteneur de la démo).
 *
 * Phases ordonnées par dépendances de références (pattern seed-fpo.mjs de
 * nuxt-sanity-test), createOrReplace idempotent, transactions par lots de 50 :
 *   0. upload des images : marqueurs { _imagePath } remplacés par des assets
 *      (déduplication par hash côté Sanity, donc rejouable sans doublon).
 *      Deux racines : '/images/...' sous public/ du démo, '/seed-assets/...'
 *      sous studio/seed/assets/ (ex. le logo SVG de la marque)
 *   A. category + faqTheme + testimonial + faqItem (les faqTheme précèdent
 *      les faqItem dans les modules de données : la référence forte
 *      faqItem.theme est donc toujours écrite après sa cible)
 *   B. service (champ related retiré temporairement) + project + article
 *   C. patch des service.related (les project de la phase B existent)
 *      Les références avant-coureuses (une phase vers une phase ultérieure :
 *      testimonial -> service/project, liens internes des articles -> pages
 *      singletons) sont écrites _weak: true puis renforcées en phase D2,
 *      le content lake refusant une référence forte vers un _id inexistant.
 *   D. les 9 singletons + legalPage (leurs blocs référencent A et B)
 *   D2. renforcement des références avant-coureuses : retrait du _weak posé
 *       avant écriture, toutes les cibles existent (références fortes finales,
 *       conformes au schéma)
 *   E. translation.metadata, un document par paire FR/EN
 *      (structure exacte documentInternationalization v6)
 */

import { createReadStream, existsSync } from 'node:fs'
import path from 'node:path'
import { getCliClient } from 'sanity/cli'

import * as sitePagesFr from './data/site-pages-fr.mjs'
import * as collectionsFr from './data/collections-fr.mjs'
import * as articlesFr1 from './data/articles-fr-1.mjs'
import * as articlesFr2 from './data/articles-fr-2.mjs'
import * as banquesLegalFr from './data/banques-legal-fr.mjs'
import * as sitePagesEn from './data/site-pages-en.mjs'
import * as collectionsEn from './data/collections-en.mjs'
import * as articlesEn1 from './data/articles-en-1.mjs'
import * as articlesEn2 from './data/articles-en-2.mjs'
import * as banquesLegalEn from './data/banques-legal-en.mjs'

// Override env (D5), aligné sur sanity.cli.ts / sanity.config.ts: un client qui
// forke le gabarit pose SANITY_STUDIO_PROJECT_ID vers SON project avant de seeder.
const PROJECT_ID = process.env.SANITY_STUDIO_PROJECT_ID || '5if00rwn'
const DATASET = process.env.SANITY_STUDIO_DATASET || 'production'
const API_VERSION = '2026-06-01'
const TX_CHUNK = 50

// Le script s'exécute depuis studio/ : les marqueurs '/seed-assets/...'
// pointent les fichiers propres au seed dans studio/seed/assets/ (logo SVG).
// Les marqueurs '/images/...' sont résolus dans public/ du démo D'ABORD
// (les 7 images encore servies par la vitrine /dev y vivent), puis dans
// studio/seed/assets/images/ (les sources d'upload du contenu de production,
// retirées de public/ pour ne pas être déployées dans le statique).
const PUBLIC_DIR = path.resolve(process.cwd(), '..', 'public')
const SEED_IMAGES_DIR = path.resolve(process.cwd(), 'seed', 'assets', 'images')
const SEED_ASSETS_DIR = path.resolve(process.cwd(), 'seed', 'assets')
const SEED_ASSETS_PREFIX = '/seed-assets/'

function markerFilePath(imagePath) {
  if (imagePath.startsWith(SEED_ASSETS_PREFIX)) {
    return path.join(SEED_ASSETS_DIR, imagePath.slice(SEED_ASSETS_PREFIX.length))
  }
  const inPublic = path.join(PUBLIC_DIR, imagePath)
  if (existsSync(inPublic)) return inPublic
  return path.join(SEED_IMAGES_DIR, path.basename(imagePath))
}

const SINGLETON_TYPES = [
  'siteSettings', 'homePage', 'servicesPage', 'projectsPage', 'aboutPage',
  'blogPage', 'faqPage', 'contactPage', 'onePager',
]
const PHASE_A_TYPES = new Set(['category', 'faqTheme', 'testimonial', 'faqItem'])
const PHASE_B_TYPES = new Set(['service', 'project', 'article'])
const PHASE_D_TYPES = new Set([...SINGLETON_TYPES, 'legalPage'])

function abort(message) {
  console.error(`\n✗ ABORT: ${message}`)
  process.exit(1)
}

// ------------------------------------------------------------
// Client : garde-fou projet/dataset avant toute écriture
// ------------------------------------------------------------

const client = getCliClient({ apiVersion: API_VERSION })
const config = client.config()

if (config.projectId !== PROJECT_ID) {
  abort(`projectId attendu « ${PROJECT_ID} », reçu « ${config.projectId} ». Vérifier sanity.cli.ts.`)
}
if (config.dataset !== DATASET) {
  abort(`dataset attendu « ${DATASET} », reçu « ${config.dataset} ». Vérifier sanity.cli.ts.`)
}
// Garde-fou (D5): le projectId par défaut est celui de la DÉMO (5if00rwn, org
// Patoine Studio). Un vrai client qui forke le gabarit DOIT poser
// SANITY_STUDIO_PROJECT_ID vers SON project avant de seeder, sinon il écraserait
// le contenu de la démo. On refuse donc de seeder 5if00rwn à moins d'une
// confirmation explicite (SEED_ALLOW_DEMO=1), réservée au mainteneur du gabarit
// qui (re)seede réellement la démo.
if (PROJECT_ID === '5if00rwn' && process.env.SEED_ALLOW_DEMO !== '1') {
  abort(
    'projectId = « 5if00rwn » (la DÉMO). Pour seeder un vrai client, posez '
    + 'SANITY_STUDIO_PROJECT_ID vers votre project. Pour (re)seeder la démo '
    + 'elle-même, relancez avec SEED_ALLOW_DEMO=1.'
  )
}
if (!config.token) {
  abort('aucun token. Lancer avec : yarn sanity exec seed/run.mjs --with-user-token')
}

// ------------------------------------------------------------
// Chargement des 10 modules de données
// ------------------------------------------------------------

const MODULES = [
  ['site-pages-fr', sitePagesFr],
  ['collections-fr', collectionsFr],
  ['articles-fr-1', articlesFr1],
  ['articles-fr-2', articlesFr2],
  ['banques-legal-fr', banquesLegalFr],
  ['site-pages-en', sitePagesEn],
  ['collections-en', collectionsEn],
  ['articles-en-1', articlesEn1],
  ['articles-en-2', articlesEn2],
  ['banques-legal-en', banquesLegalEn],
]

// Accepte un export default tableau, sinon la concaténation de tous les
// exports nommés qui sont des tableaux.
function docsOfModule(name, mod) {
  if (Array.isArray(mod.default)) return mod.default
  const arrays = Object.values(mod).filter(Array.isArray)
  if (arrays.length === 0) abort(`module ${name} : aucun export de tableau de documents`)
  return arrays.flat()
}

function loadAllDocs() {
  const all = []
  const seen = new Set()
  for (const [name, mod] of MODULES) {
    const docs = docsOfModule(name, mod)
    for (const doc of docs) {
      if (!doc || typeof doc._id !== 'string' || typeof doc._type !== 'string') {
        abort(`module ${name} : document sans _id ou _type (${JSON.stringify(doc).slice(0, 120)})`)
      }
      if (doc._type === 'translation.metadata') {
        abort(`module ${name} : ${doc._id} est un translation.metadata, ils sont générés par la phase E`)
      }
      if (!/-(fr|en)$/.test(doc._id)) {
        abort(`module ${name} : _id « ${doc._id} » ne se termine pas par -fr ou -en`)
      }
      if (seen.has(doc._id)) abort(`_id en double entre modules : ${doc._id}`)
      seen.add(doc._id)
      all.push(doc)
    }
    console.log(`  ${name} : ${docs.length} documents`)
  }
  return all
}

// ------------------------------------------------------------
// Helpers d'écriture (transactions par lots)
// ------------------------------------------------------------

const chunk = (arr, size) => {
  const out = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

async function writeDocs(label, docs) {
  console.log(`\n--- ${label} : ${docs.length} documents ---`)
  for (const part of chunk(docs, TX_CHUNK)) {
    // createOrReplace ne touche que le document PUBLIÉ; un brouillon existant
    // (créé en éditant dans le Studio) continuerait de masquer la nouvelle
    // version dans l'interface. On supprime donc le brouillon correspondant
    // dans la même transaction: le seed est LA source de vérité quand il roule.
    const tx = part.reduce(
      (t, d) => t.createOrReplace(d).delete(`drafts.${d._id}`),
      client.transaction(),
    )
    await tx.commit()
    for (const d of part) console.log(`  ✓ ${d._id}`)
  }
}

// ------------------------------------------------------------
// Phase 0 : images. Marche récursive, upload des fichiers uniques,
// remplacement des marqueurs { _imagePath } par { _type: 'image', asset }.
// ------------------------------------------------------------

function walk(node, visit) {
  if (Array.isArray(node)) {
    for (const item of node) walk(item, visit)
    return
  }
  if (node && typeof node === 'object') {
    visit(node)
    for (const value of Object.values(node)) walk(value, visit)
  }
}

function collectImagePaths(docs) {
  const paths = new Set()
  for (const doc of docs) {
    walk(doc, (obj) => {
      if (typeof obj._imagePath === 'string') paths.add(obj._imagePath)
    })
  }
  return [...paths].sort()
}

async function uploadImages(imagePaths) {
  // Validation complète avant le premier upload : échec rapide et exhaustif.
  const missing = imagePaths.filter((p) => !existsSync(markerFilePath(p)))
  if (missing.length > 0) {
    abort(`fichiers introuvables :\n  ${missing.map((p) => `${p} -> ${markerFilePath(p)}`).join('\n  ')}`)
  }

  const assetIdByPath = new Map()
  let i = 0
  for (const imagePath of imagePaths) {
    i += 1
    const filePath = markerFilePath(imagePath)
    // Sanity déduplique par hash du fichier : rejouer le seed ne crée pas de doublon.
    const asset = await client.assets.upload('image', createReadStream(filePath), {
      filename: path.basename(filePath),
    })
    assetIdByPath.set(imagePath, asset._id)
    console.log(`  [${i}/${imagePaths.length}] ${imagePath} -> ${asset._id}`)
  }
  return assetIdByPath
}

function replaceImageMarkers(docs, assetIdByPath) {
  for (const doc of docs) {
    walk(doc, (obj) => {
      if (typeof obj._imagePath !== 'string') return
      const assetId = assetIdByPath.get(obj._imagePath)
      if (!assetId) abort(`marqueur sans asset uploadé : ${obj._imagePath}`)
      delete obj._imagePath
      // Mutation en place : les champs frères du marqueur (et du figure parent)
      // sont préservés tels quels.
      obj._type = 'image'
      obj.asset = { _type: 'reference', _ref: assetId }
    })
  }
}

// ------------------------------------------------------------
// Références avant-coureuses : le content lake valide les références fortes
// à la mutation, donc un document ne peut pas référencer fortement un
// document d'une phase ultérieure (testimonial -> service/project, liens
// internes des articles -> pages singletons; les cycles entre types rendent
// tout ordre de phases insuffisant). Ces références sont posées _weak: true
// avant écriture, leur chemin JSONMatch retenu, et la phase D2 retire le
// _weak une fois toutes les phases écrites. Les références au sein d'une
// même phase restent fortes : chaque phase tient dans une transaction
// (<= TX_CHUNK documents), et le content lake accepte une référence forte
// vers un document créé dans la même transaction.
// ------------------------------------------------------------

function jsonMatchSegment(item, index) {
  return item && typeof item === 'object' && typeof item._key === 'string'
    ? `[_key=="${item._key}"]`
    : `[${index}]`
}

function weakenForwardRefs(docs, rankById) {
  const patches = []
  for (const doc of docs) {
    const ownRank = rankById.get(doc._id)
    const paths = []
    const visit = (node, crumb) => {
      if (Array.isArray(node)) {
        node.forEach((item, i) => visit(item, crumb + jsonMatchSegment(item, i)))
        return
      }
      if (!node || typeof node !== 'object') return
      if (typeof node._ref === 'string' && !node._weak) {
        const targetRank = rankById.get(node._ref)
        if (targetRank !== undefined && targetRank > ownRank) {
          node._weak = true
          paths.push(`${crumb}._weak`)
          return
        }
      }
      for (const [key, value] of Object.entries(node)) {
        visit(value, crumb ? `${crumb}.${key}` : key)
      }
    }
    for (const [key, value] of Object.entries(doc)) visit(value, key)
    if (paths.length > 0) patches.push({ id: doc._id, paths })
  }
  return patches
}

// ------------------------------------------------------------
// Phase E : translation.metadata, un par paire FR/EN.
// Structure exacte documentInternationalization v6 (copie de la référence
// nuxt-sanity-test) : entries internationalizedArrayReferenceValue avec
// `language` au niveau de l'entry, refs _weak: true + _strengthenOnPublish.
// ------------------------------------------------------------

function buildTranslationMetadata(docs) {
  const byBase = new Map()
  for (const doc of docs) {
    const match = doc._id.match(/^(.*)-(fr|en)$/)
    const base = match[1]
    const lang = match[2]
    if (!byBase.has(base)) byBase.set(base, { type: doc._type, langs: new Set() })
    const entry = byBase.get(base)
    if (entry.type !== doc._type) {
      abort(`paire ${base} : types divergents (${entry.type} vs ${doc._type})`)
    }
    entry.langs.add(lang)
  }

  const metadataDocs = []
  for (const [base, { type, langs }] of byBase) {
    if (!langs.has('fr') || !langs.has('en')) {
      console.warn(`  ! paire incomplète ignorée : ${base} (${[...langs].join(', ')})`)
      continue
    }
    metadataDocs.push({
      _id: `translation-${base}`,
      _type: 'translation.metadata',
      schemaTypes: [type],
      translations: ['fr', 'en'].map((lang) => ({
        _key: lang,
        _type: 'internationalizedArrayReferenceValue',
        language: lang,
        value: {
          _type: 'reference',
          _ref: `${base}-${lang}`,
          _weak: true,
          _strengthenOnPublish: { type },
        },
      })),
    })
  }
  return metadataDocs
}

// ------------------------------------------------------------
// Main
// ------------------------------------------------------------

async function main() {
  console.log(`Seed WebForge Ancrée — project ${PROJECT_ID}, dataset ${DATASET}, api ${API_VERSION}`)
  if (!existsSync(PUBLIC_DIR)) {
    abort(`dossier public introuvable (${PUBLIC_DIR}). Lancer depuis studio/.`)
  }

  console.log('\n--- Chargement des modules de données ---')
  const allDocs = loadAllDocs()

  // Répartition par phase, avec garde-fou : tout type inconnu fait échouer
  // le seed plutôt que de passer sous silence.
  const phaseA = []
  const phaseB = []
  const phaseD = []
  for (const doc of allDocs) {
    if (PHASE_A_TYPES.has(doc._type)) phaseA.push(doc)
    else if (PHASE_B_TYPES.has(doc._type)) phaseB.push(doc)
    else if (PHASE_D_TYPES.has(doc._type)) phaseD.push(doc)
    else abort(`type non prévu par les phases : ${doc._type} (${doc._id})`)
  }

  // Phase 0 : images.
  const imagePaths = collectImagePaths(allDocs)
  console.log(`\n--- Phase 0 : upload de ${imagePaths.length} images uniques ---`)
  const assetIdByPath = await uploadImages(imagePaths)
  replaceImageMarkers(allDocs, assetIdByPath)

  // Références avant-coureuses : affaiblies avant écriture, chemins retenus,
  // renforcement en phase D2 (voir le commentaire de weakenForwardRefs).
  const rankById = new Map()
  for (const doc of phaseA) rankById.set(doc._id, 1)
  for (const doc of phaseB) rankById.set(doc._id, 2)
  for (const doc of phaseD) rankById.set(doc._id, 3)
  const strengthenPatches = weakenForwardRefs(allDocs, rankById)
  const strengthenCount = strengthenPatches.reduce((n, p) => n + p.paths.length, 0)
  console.log(`\n--- Références avant-coureuses affaiblies : ${strengthenCount} (dans ${strengthenPatches.length} documents) ---`)

  // Phase B : le champ related (service -> project) est retiré puis posé en
  // phase C, une fois les project écrits (références fortes).
  const relatedPatches = []
  const phaseBDocs = phaseB.map((doc) => {
    if (doc._type === 'service' && doc.related !== undefined) {
      const { related, ...rest } = doc
      relatedPatches.push({ id: doc._id, related })
      return rest
    }
    return doc
  })

  await writeDocs('Phase A : category + faqTheme + testimonial + faqItem', phaseA)
  await writeDocs('Phase B : service (sans related) + project + article', phaseBDocs)

  console.log(`\n--- Phase C : patch de ${relatedPatches.length} service.related ---`)
  for (const part of chunk(relatedPatches, TX_CHUNK)) {
    const tx = part.reduce(
      (t, p) => t.patch(p.id, (patch) => patch.set({ related: p.related })),
      client.transaction(),
    )
    await tx.commit()
    for (const p of part) console.log(`  ✓ ${p.id} (${p.related.length} refs)`)
  }

  await writeDocs('Phase D : singletons + legalPage', phaseD)

  console.log(`\n--- Phase D2 : renforcement de ${strengthenCount} références avant-coureuses ---`)
  for (const part of chunk(strengthenPatches, TX_CHUNK)) {
    const tx = part.reduce(
      (t, p) => t.patch(p.id, (patch) => patch.unset(p.paths)),
      client.transaction(),
    )
    await tx.commit()
    for (const p of part) console.log(`  ✓ ${p.id} (${p.paths.length} réf)`)
  }

  const metadataDocs = buildTranslationMetadata(allDocs)
  await writeDocs('Phase E : translation.metadata', metadataDocs)

  // ----------------------------------------------------------
  // Résumé : documents par type et par langue, assets uploadés
  // ----------------------------------------------------------
  const tally = new Map()
  for (const doc of allDocs) {
    const lang = doc._id.endsWith('-fr') ? 'fr' : 'en'
    if (!tally.has(doc._type)) tally.set(doc._type, { fr: 0, en: 0 })
    tally.get(doc._type)[lang] += 1
  }

  console.log('\n=== Résumé du seed ===')
  const types = [...tally.keys()].sort()
  for (const type of types) {
    const { fr, en } = tally.get(type)
    console.log(`  ${type.padEnd(22)} fr ${String(fr).padStart(2)}   en ${String(en).padStart(2)}`)
  }
  console.log(`  ${'translation.metadata'.padEnd(22)} ${metadataDocs.length} (paires FR/EN)`)
  console.log(`  ${'assets image'.padEnd(22)} ${assetIdByPath.size} uploadés`)
  console.log(`  ${'réfs renforcées (D2)'.padEnd(22)} ${strengthenCount}`)
  console.log(`  ${'total documents'.padEnd(22)} ${allDocs.length + metadataDocs.length}`)
  console.log('\n✓ Seed terminé.')
}

main().catch((err) => {
  console.error('\n✗ Erreur de seed :', err.message)
  process.exit(1)
})
