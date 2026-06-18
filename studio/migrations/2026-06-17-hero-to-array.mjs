// Migration: champ `hero` des documents de page, OBJET -> TABLEAU de 1 élément.
// Idempotent: ignore un hero déjà tableau ou absent. Le rendu ne dépend PAS de
// cette migration (GROQ tolérant `coalesce(hero[0], hero)`); elle sert à ce que
// le Studio affiche le champ array peuplé/éditable après le déploiement du schéma.
// Lancer (sur go): cd studio && npx sanity exec migrations/2026-06-17-hero-to-array.mjs --with-user-token
import { getCliClient } from 'sanity/cli'

const client = getCliClient()

const PAGE_TYPES = {
  homePage: 'heroHome',
  onePager: 'heroHome',
  servicesPage: 'pageHero',
  projectsPage: 'pageHero',
  aboutPage: 'pageHero',
  blogPage: 'pageHero',
  faqPage: 'pageHero',
  contactPage: 'pageHero',
}

const docs = await client.fetch(
  `*[_type in $types]{ _id, _type, hero }`,
  { types: Object.keys(PAGE_TYPES) }
)

let tx = client.transaction()
let count = 0
for (const d of docs) {
  if (Array.isArray(d.hero) || !d.hero) continue // déjà migré ou vide
  const heroType = PAGE_TYPES[d._type]
  tx = tx.patch(d._id, (p) => p.set({ hero: [{ ...d.hero, _type: heroType, _key: 'hero' }] }))
  count++
}
if (count > 0) {
  await tx.commit()
}
console.log(`Migration hero -> tableau: ${count} document(s) migré(s).`)
