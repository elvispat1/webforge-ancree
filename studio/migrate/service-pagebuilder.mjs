/**
 * Migration ponctuelle: service + serviceCity vers le modele « Contenu + SEO »
 * (masthead hero[1] + pageBuilder), aligne sur les singletons.
 *
 * Lit le LIVE (vrais refs d'assets preserves), construit hero + pageBuilder a partir
 * de l'ancien modele, puis patch+unset sur le document PUBLIE. Idempotent: un doc
 * deja migre (sans detail/body) est saute. Ecarte aussi les brouillons residuels de
 * ces types (sinon, schema deploye -> champs inconnus en rouge).
 *
 * Lancer depuis studio/:  npx sanity exec migrate/service-pagebuilder.mjs --with-user-token
 */
import { getCliClient } from 'sanity/cli'

const client = getCliClient({ apiVersion: '2024-09-01' })

const uid = (p = 'k') => `${p}-${Math.random().toString(36).slice(2, 10)}`
const clean = (obj) => JSON.parse(JSON.stringify(obj)) // retire les undefined

const AREAS = { fr: 'Zones desservies', en: 'Service areas' }
const CITY_SERVICES = {
  fr: (c) => `Nos services à ${c}`,
  en: (c) => `Our services in ${c}`,
}

function textBlock(text) {
  return {
    _type: 'block',
    _key: uid('b'),
    style: 'normal',
    markDefs: [],
    children: [{ _type: 'span', _key: uid('s'), text: text || '', marks: [] }],
  }
}

// Un item de body de ville etait stocke en {_type:'block', text} (sans children) ou
// en bloc PT complet: on normalise vers un bloc PT a children.
function bodyItemToBlock(item) {
  if (item && Array.isArray(item.children) && item.children.length) {
    return {
      ...item,
      _type: 'block',
      _key: item._key || uid('b'),
      style: item.style || 'normal',
      markDefs: item.markDefs || [],
    }
  }
  return { ...textBlock(item?.text || ''), _key: item?._key || uid('b') }
}

function serviceHero(doc) {
  return [{ _type: 'detailHero', _key: uid('hero'), eyebrow: doc.meta, title: doc.title, lead: doc.summary }]
}

function cityHero(doc) {
  return [
    {
      _type: 'detailHero',
      _key: uid('hero'),
      eyebrow: AREAS[doc.language] || AREAS.fr,
      title: doc.heading || doc.city,
      lead: doc.lead,
    },
  ]
}

function buildServicePageBuilder(doc) {
  const d = doc.detail || {}
  const pb = []
  // intro (paragraphes) -> bloc editorial texte
  if (Array.isArray(doc.intro) && doc.intro.length) {
    pb.push({
      _type: 'editorial',
      _key: uid('pb-intro'),
      segments: [
        { _type: 'editorialSegment', _key: uid('seg'), body: doc.intro.map(textBlock), media: [], mediaSide: 'auto' },
      ],
    })
  }
  // benefits -> bloc points forts
  if (Array.isArray(doc.benefits) && doc.benefits.length) {
    pb.push({
      _type: 'highlights',
      _key: uid('pb-hl'),
      heading: d.benefits?.heading || 'Ce que vous obtenez',
      items: doc.benefits.map((b) => ({ _type: 'highlight', _key: b._key || uid('hl'), title: b.title, body: b.body })),
    })
  }
  // editorial riche existant (vrais refs d'images preserves)
  if (d.editorial) {
    pb.push({ ...d.editorial, _type: 'editorial', _key: uid('pb-ed') })
  }
  // process -> bloc processus
  if (d.process) {
    pb.push({
      _type: 'process',
      _key: uid('pb-proc'),
      eyebrow: d.process.eyebrow,
      heading: d.process.heading,
      lead: d.process.lead,
      steps: (d.process.steps || []).map((s) => ({
        _type: 'processStep',
        _key: s._key || uid('st'),
        title: s.title,
        body: s.body,
      })),
    })
  }
  // temoignages -> bloc intelligent mode service (la grille se remplit, pad cote front)
  if (d.testimonials) {
    pb.push({
      _type: 'testimonials',
      _key: uid('pb-tm'),
      eyebrow: d.testimonials.eyebrow,
      heading: d.testimonials.heading,
      mode: 'service',
      service: { _type: 'reference', _ref: doc._id },
      limit: 3,
    })
  }
  // bandeau d'appel de fin
  if (d.cta) {
    pb.push({ ...d.cta, _type: 'ctaBand', _key: uid('pb-cta') })
  }
  return pb
}

function buildCityPageBuilder(doc) {
  const pb = []
  if (Array.isArray(doc.body) && doc.body.length) {
    pb.push({
      _type: 'editorial',
      _key: uid('pb-body'),
      segments: [
        { _type: 'editorialSegment', _key: uid('seg'), body: doc.body.map(bodyItemToBlock), media: [], mediaSide: 'auto' },
      ],
    })
  }
  // la grille des services (l'ancienne section <ServicesGrid> de la page ville)
  pb.push({
    _type: 'services',
    _key: uid('pb-svc'),
    heading: (CITY_SERVICES[doc.language] || CITY_SERVICES.fr)(doc.city),
    mode: 'auto',
  })
  return pb
}

async function run() {
  const services = await client.fetch('*[_type == "service" && !(_id in path("drafts.**"))]')
  const cities = await client.fetch('*[_type == "serviceCity" && !(_id in path("drafts.**"))]')

  const tx = client.transaction()
  let migrated = 0
  let skipped = 0

  for (const doc of services) {
    if (!doc.detail && !doc.intro && !doc.benefits && !doc.meta && !doc.related) {
      skipped++
      continue
    }
    const hero = serviceHero(doc)
    const pageBuilder = buildServicePageBuilder(doc)
    tx.patch(doc._id, (p) =>
      p.set(clean({ hero, pageBuilder })).unset(['detail', 'intro', 'benefits', 'meta', 'related']),
    )
    migrated++
    console.log(`service -> ${doc._id} (${pageBuilder.length} sections)`)
  }

  for (const doc of cities) {
    if (!doc.body && !doc.heading && !doc.lead) {
      skipped++
      continue
    }
    const hero = cityHero(doc)
    const pageBuilder = buildCityPageBuilder(doc)
    tx.patch(doc._id, (p) => p.set(clean({ hero, pageBuilder })).unset(['body', 'heading', 'lead']))
    migrated++
    console.log(`serviceCity -> ${doc._id} (${pageBuilder.length} sections)`)
  }

  await tx.commit({ visibility: 'sync' })
  console.log(`\nPatch: ${migrated} migres, ${skipped} sautes (deja migres).`)

  // Brouillons residuels (ex. drafts.service-fourmis-charpentieres-fr): a l'ancien
  // schema, ils afficheraient des champs inconnus en rouge apres deploiement.
  const drafts = await client.fetch(
    '*[_id in path("drafts.**") && (_type == "service" || _type == "serviceCity")]._id',
  )
  for (const id of drafts) {
    await client.delete(id)
    console.log(`brouillon ecarte -> ${id}`)
  }
  console.log(`\nTermine. ${drafts.length} brouillon(s) ecarte(s).`)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
