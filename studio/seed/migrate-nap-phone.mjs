// NAP, parité fr/en: le téléphone canonique différait entre langues (fr live
// 1 888 555-4250, en live 450 555 0199; seed = 450 pour les deux). Charles tranche:
// le canonique est « 1 888 555-4250 » (sans frais). On l'aligne PARTOUT
// (siteSettings fr+en live + seed). Tout le site dérive de siteSettings.contact.phone
// (header urgence, bloc contact, pied NAP, JSON-LD LocalBusiness, liens tel:), donc
// ce seul champ corrige le NAP site-wide. Aucun schéma touché. Idempotent, --dry-run.
// Usage:  node studio/seed/migrate-nap-phone.mjs [--dry-run]
import { createClient } from "@sanity/client"
import { readFileSync, writeFileSync } from "node:fs"
import { homedir } from "node:os"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const DRY = process.argv.includes("--dry-run")
const here = dirname(fileURLToPath(import.meta.url))
const seedPath = join(here, "..", "seed-content.json")
const LANGS = ["fr", "en"]
const PHONE = "1 888 555-4250"

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

async function migrateLive() {
  let tx = client.transaction()
  for (const lang of LANGS) tx = tx.patch("siteSettings-" + lang, (p) => p.set({ "contact.phone": PHONE }))
  if (DRY) {
    console.log("  siteSettings-fr/-en (DRY): contact.phone = " + PHONE)
    return
  }
  await tx.commit({ visibility: "sync" })
  console.log("  live: contact.phone aligné fr+en (sync).")
}

function migrateSeed() {
  const seed = JSON.parse(readFileSync(seedPath, "utf8"))
  for (const lang of LANGS) {
    const d = seed.documents.find((x) => x.content && x.content._id === "siteSettings-" + lang)
    if (!d) throw new Error("seed introuvable: siteSettings-" + lang)
    if (!d.content.contact) throw new Error("seed sans contact: siteSettings-" + lang)
    d.content.contact.phone = PHONE
  }
  if (DRY) {
    console.log("  SEED (DRY): contact.phone aligné fr+en.")
    return
  }
  writeFileSync(seedPath, JSON.stringify(seed, null, 2) + "\n")
  console.log("  seed-content.json: miroir écrit.")
}

console.log(DRY ? "DRY-RUN" : "LIVE")
await migrateLive()
migrateSeed()
console.log("OK.")
