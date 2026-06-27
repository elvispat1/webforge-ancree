// Page contact /contact, lot FOND. Aujourd'hui: pageHero > contact > ctaBand (deux
// blocs de corps, lead du contact identique au heros, aucun signal de confiance ni
// zone desservie). Cible du plan:
//   contact (lead distinct, angle « vraie personne ») > trustBar (casse les deux
//   panneaux navy) > serviceCities (zones desservies) > faq (desamorce avant le
//   formulaire) > ctaBand (urgence en cloture).
//
// Le bloc contact (b1) et le ctaBand (b2) sont CONSERVES tels quels (b1: seuls
// eyebrow + lead changent). Les 3 blocs neufs s'inserent entre les deux. Le schema
// autorise deja les 12 blocs (pageBuilderField partage): aucun deploy Studio.
//
// Fetch + reconstruction par TYPE de bloc (idempotent: re-run rebatit la meme
// sequence). Live (patch set + publish sync) puis miroir seed. Apostrophes droites.
//
// Usage:  node studio/seed/migrate-contact-fond.mjs [--dry-run]

import { createClient } from "@sanity/client"
import { readFileSync, writeFileSync } from "node:fs"
import { homedir } from "node:os"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const DRY = process.argv.includes("--dry-run")
const here = dirname(fileURLToPath(import.meta.url))
const seedPath = join(here, "..", "seed-content.json")

function readToken() {
  if (process.env.SANITY_AUTH_TOKEN) return process.env.SANITY_AUTH_TOKEN
  const cfg = JSON.parse(readFileSync(join(homedir(), ".config", "sanity", "config.json"), "utf8"))
  if (cfg.authToken) return cfg.authToken
  throw new Error("Aucun token Sanity.")
}

const client = createClient({
  projectId: "5if00rwn",
  dataset: "production",
  apiVersion: "2024-10-01",
  token: readToken(),
  useCdn: false,
})

const LANGS = ["fr", "en"]

// Enrichissement du bloc contact: eyebrow distinct du titre du heros (« Nous
// joindre »), lead distinct de celui du heros (angle vraie personne + dispo 7j).
const CONTACT = {
  fr: {
    eyebrow: "Parlons-en",
    lead: "Au bout du fil, une vraie personne, pas un répondeur. Écrivez-nous les grandes lignes ou appelez directement: on vous revient avec un plan clair et une estimation gratuite, 7 jours sur 7.",
  },
  en: {
    eyebrow: "Let's talk",
    lead: "A real person on the line, never a machine. Send us the basics or call directly: you get a clear plan and a free estimate, seven days a week.",
  },
}

// trustBar: signaux d'autorite (recadre l'angle « avant de s'engager »).
function trustBar(lang) {
  const items = {
    fr: [
      { value: "Membre ASTTQ", label: "gestion parasitaire du Québec", icon: "lucide:award" },
      { value: "Assurance responsabilité", label: "couverture 2 M$", icon: "lucide:shield-check" },
      { value: "Produits homologués", label: "Santé Canada, sûrs pour la famille", icon: "lucide:leaf" },
      { value: "Technicien licencié", label: "certifié en intervention", icon: "lucide:badge-check" },
    ],
    en: [
      { value: "ASTTQ member", label: "Quebec pest management", icon: "lucide:award" },
      { value: "Liability insurance", label: "$2M coverage", icon: "lucide:shield-check" },
      { value: "Approved products", label: "Health Canada, family-safe", icon: "lucide:leaf" },
      { value: "Licensed technician", label: "certified to treat", icon: "lucide:badge-check" },
    ],
  }
  return {
    _key: "cp-trust",
    _type: "trustBar",
    items: items[lang].map((it, i) => ({ _key: "t" + (i + 1), _type: "proof", ...it })),
  }
}

// serviceCities: zones desservies (exigence du mandat). Copie propre a contact,
// distincte du hub /villes.
function serviceCities(lang) {
  const c = {
    fr: {
      eyebrow: "Notre territoire",
      heading: "On est déjà dans votre secteur",
      lead: "De Laval à Repentigny, un technicien d'ici part vers vous, souvent le jour même.",
      areaLabel: "Zone desservie",
      areaName: "Rive-Nord de Montréal et Laval",
      areaNote: "Intervention rapide partout dans la couronne nord.",
    },
    en: {
      eyebrow: "Our territory",
      heading: "We are already in your area",
      lead: "From Laval to Repentigny, a local technician heads your way, often the same day.",
      areaLabel: "Service area",
      areaName: "Montreal North Shore and Laval",
      areaNote: "Fast response across the north crown.",
    },
  }
  return { _key: "cp-cities", _type: "serviceCities", mode: "featured", ...c[lang] }
}

// faq: desamorce les objections principales avant le formulaire (items generaux
// reutilises: prix, delai, garantie, securite).
function faqBlock(lang) {
  const c = {
    fr: { eyebrow: "Avant de nous écrire", heading: "Les questions qu'on entend le plus" },
    en: { eyebrow: "Before you write", heading: "The questions we hear most" },
  }
  const bases = ["faqItem-prix", "faqItem-delai", "faqItem-garantie", "faqItem-securite"]
  return {
    _key: "cp-faq",
    _type: "faq",
    ...c[lang],
    items: bases.map((b, i) => ({ _key: "fq" + i, _type: "reference", _ref: b + "-" + lang })),
  }
}

// Reconstruit le pageBuilder a partir des blocs existants (contact + ctaBand
// preserves), enrichit le contact, insere les 3 blocs au milieu.
function rebuild(pb, lang) {
  const contact = pb.find((b) => b._type === "contact")
  const ctaBand = pb.find((b) => b._type === "ctaBand")
  if (!contact || !ctaBand) throw new Error("contact ou ctaBand introuvable (" + lang + ")")
  const enriched = { ...contact, eyebrow: CONTACT[lang].eyebrow, lead: CONTACT[lang].lead }
  return [enriched, trustBar(lang), serviceCities(lang), faqBlock(lang), ctaBand]
}

async function migrateLive() {
  for (const lang of LANGS) {
    const id = "contactPage-" + lang
    const doc = await client.getDocument(id)
    if (!doc) throw new Error("introuvable: " + id)
    const next = rebuild(doc.pageBuilder || [], lang)
    if (DRY) {
      console.log("  " + id + " (DRY): " + next.map((b) => b._type).join(" > "))
      continue
    }
    await client.patch(id).set({ pageBuilder: next }).commit({ visibility: "sync" })
    console.log("  " + id + ": pageBuilder recable (live).")
  }
}

function migrateSeed() {
  const seed = JSON.parse(readFileSync(seedPath, "utf8"))
  for (const lang of LANGS) {
    const id = "contactPage-" + lang
    const d = seed.documents.find((x) => x.content && x.content._id === id)
    if (!d) throw new Error("seed introuvable: " + id)
    d.content.pageBuilder = rebuild(d.content.pageBuilder || [], lang)
  }
  if (DRY) {
    console.log("  SEED (DRY): miroir pret.")
    return
  }
  writeFileSync(seedPath, JSON.stringify(seed, null, 2) + "\n")
  console.log("  seed-content.json: miroir ecrit.")
}

async function main() {
  console.log("Page contact /contact, FOND (dataset " + client.config().dataset + ")")
  await migrateLive()
  migrateSeed()
  console.log("Termine.")
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
