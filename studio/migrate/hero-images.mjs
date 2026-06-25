/**
 * Téléverse les images de héros générées et les pose sur le champ image des
 * masthead: pageHero des pages de niveau 2 (à propos, contact, index services,
 * index villes) et detailHero des collections (service par nuisible, villes
 * partagée). L'alt est bilingue SUR L'ASSET (altText {fr,en}), une fois par image.
 *
 * Lancer depuis studio/:  npx sanity exec migrate/hero-images.mjs --with-user-token
 */
import { getCliClient } from 'sanity/cli'
import { createReadStream } from 'node:fs'
import { join } from 'node:path'

const client = getCliClient({ apiVersion: '2024-09-01' })
const IMG = join(process.cwd(), '..', 'generated_imgs')

// Chaque entrée: fichier généré, alt bilingue, et les documents qui la portent.
const PLAN = {
  ant: {
    file: 'generated-20260625-202624-nheblv.jpg',
    fr: 'Fourmi charpentière en gros plan sur fond blanc',
    en: 'Carpenter ant in close-up on a white background',
    docs: ['service-fourmis-charpentieres-fr', 'service-fourmis-charpentieres-en'],
  },
  mouse: {
    file: 'generated-20260625-202732-tatdtg.jpg',
    fr: 'Souris domestique sur fond blanc',
    en: 'House mouse on a white background',
    docs: ['service-souris-rats-fr', 'service-souris-rats-en'],
  },
  wasp: {
    file: 'generated-20260625-202748-qlq7wb.jpg',
    fr: 'Guêpe sur fond blanc',
    en: 'Wasp on a white background',
    docs: ['service-guepes-frelons-fr', 'service-guepes-frelons-en'],
  },
  bedbug: {
    file: 'generated-20260625-202805-zjmye9.jpg',
    fr: 'Punaise de lit en gros plan sur fond blanc',
    en: 'Bed bug in close-up on a white background',
    docs: ['service-punaises-de-lit-fr', 'service-punaises-de-lit-en'],
  },
  roach: {
    file: 'generated-20260625-202821-ytv4ya.jpg',
    fr: 'Coquerelle sur fond blanc',
    en: 'Cockroach on a white background',
    docs: ['service-commercial-fr', 'service-commercial-en'],
  },
  team: {
    file: 'generated-20260625-202912-f3354d.jpg',
    fr: "L'équipe de techniciens de Rempart devant la camionnette de service",
    en: 'The Rempart technician team in front of the service van',
    docs: ['aboutPage-fr', 'aboutPage-en'],
  },
  techVan: {
    file: 'generated-20260625-202929-iwv3np.jpg',
    fr: 'Technicien de Rempart à côté de la camionnette de service',
    en: 'Rempart technician beside the service van',
    docs: ['contactPage-fr', 'contactPage-en'],
  },
  techAction: {
    file: 'generated-20260625-202945-cktsng.jpg',
    fr: "Technicien traitant les plinthes d'une maison",
    en: 'Technician treating the baseboards of a home',
    docs: ['servicesPage-fr', 'servicesPage-en'],
  },
  vanHood: {
    file: 'generated-20260625-203002-x62ruv.jpg',
    fr: 'Camionnette de service dans un quartier résidentiel de la Rive-Nord',
    en: 'Service van in a North Shore residential neighbourhood',
    // docs complétés dynamiquement: index villes + toutes les villes.
    docs: ['villesPage-fr', 'villesPage-en'],
  },
}

const figure = (assetId) => ({
  _type: 'figure',
  image: { _type: 'image', asset: { _type: 'reference', _ref: assetId } },
})

async function run() {
  // L'image partagée des villes va aussi sur chaque serviceCity (fr+en).
  const cityIds = await client.fetch(
    '*[_type == "serviceCity" && !(_id in path("drafts.**"))]._id',
  )
  PLAN.vanHood.docs.push(...cityIds)

  const tx = client.transaction()
  let images = 0
  let docs = 0

  for (const [key, entry] of Object.entries(PLAN)) {
    const path = join(IMG, entry.file)
    const asset = await client.assets.upload('image', createReadStream(path), {
      filename: `hero-${key}.jpg`,
    })
    // Alt bilingue sur l'asset (une image = un alt, traduit).
    await client.patch(asset._id).set({ altText: { fr: entry.fr, en: entry.en } }).commit()
    images++
    console.log(`asset ${key} -> ${asset._id} (${entry.docs.length} docs)`)

    for (const docId of entry.docs) {
      tx.patch(docId, (p) => p.set({ 'hero[0].image': figure(asset._id) }))
      docs++
    }
  }

  await tx.commit({ visibility: 'sync' })
  console.log(`\nTermine. ${images} images televersees, ${docs} masthead garnis.`)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
