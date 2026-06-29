// Banque de personnes: extrait les 4 membres inline du bloc team (aboutPage-fr/en),
// cree 8 docs `person` + 4 translation.metadata, repointe team.members et
// article.author vers ces references. Lit le token CLI, idempotent, --dry-run.
import { createClient } from "@sanity/client"
import { readFileSync, writeFileSync } from "node:fs"
import { homedir } from "node:os"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const DRY = process.argv.includes("--dry-run")
const here = dirname(fileURLToPath(import.meta.url))
const seedPath = join(here, "..", "seed-content.json")
const LANGS = ["fr", "en"]

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

// Nom -> base d'id de personne, dans l'ordre d'affichage du bloc team.
const ROSTER = [
  { name: "Martin Lefebvre", base: "person-martin", key: "m1", img: "team-martin" },
  { name: "Julie Caron", base: "person-julie", key: "m2", img: "team-julie" },
  { name: "Samuel Ouellet", base: "person-samuel", key: "m3", img: "team-samuel" },
  { name: "Nadia Bélanger", base: "person-nadia", key: "m4", img: "team-nadia" },
]
const baseByName = Object.fromEntries(ROSTER.map((r) => [r.name, r.base]))

// Article -> personne (par patronyme de base).
const ARTICLE_AUTHOR = {
  "article-punaises": "person-julie",
  "article-fourmis": "person-martin",
  "article-souris": "person-samuel",
}

function tmDoc(base) {
  const tval = (lang) => ({
    _key: lang,
    _type: "internationalizedArrayReferenceValue",
    language: lang,
    value: { _type: "reference", _ref: base + "-" + lang, _weak: true, _strengthenOnPublish: { type: "person" } },
  })
  return { _id: "translation-" + base, _type: "translation.metadata", schemaTypes: ["person"], translations: LANGS.map(tval) }
}

function teamBlockOf(doc) {
  const blocks = doc.pageBuilder || []
  const team = blocks.find((b) => b._type === "team")
  if (!team) throw new Error("bloc team introuvable dans " + doc._id)
  return team
}

async function migrateLive() {
  // 1. Lire les membres inline live, par langue, pour batir les docs person.
  const persons = []
  for (const lang of LANGS) {
    const about = await client.getDocument("aboutPage-" + lang)
    if (!about) throw new Error("introuvable: aboutPage-" + lang)
    const team = teamBlockOf(about)
    for (const m of team.members || []) {
      const base = baseByName[m.name]
      if (!base) throw new Error("membre inconnu du roster: " + m.name)
      persons.push({
        _id: base + "-" + lang,
        _type: "person",
        language: lang,
        name: m.name,
        role: m.role,
        bio: m.bio,
        photo: m.photo, // figure avec le vrai _ref d'asset live
      })
    }
  }
  const tms = ROSTER.map((r) => tmDoc(r.base))

  // 2. Reconstruire les blocs team en references (ordre + _key conserves).
  const aboutPatches = []
  for (const lang of LANGS) {
    const about = await client.getDocument("aboutPage-" + lang)
    const next = (about.pageBuilder || []).map((b) => {
      if (b._type !== "team") return b
      return {
        ...b,
        members: ROSTER.map((r) => ({ _key: r.key, _type: "reference", _ref: r.base + "-" + lang })),
      }
    })
    aboutPatches.push({ id: about._id, pageBuilder: next })
  }

  // 3. Repointer les auteurs d'article.
  const articlePatches = []
  for (const [artBase, personBase] of Object.entries(ARTICLE_AUTHOR)) {
    for (const lang of LANGS) {
      articlePatches.push({ id: artBase + "-" + lang, author: { _type: "reference", _ref: personBase + "-" + lang } })
    }
  }

  if (DRY) {
    console.log("  persons:", persons.map((p) => p._id).join(", "))
    console.log("  tms:", tms.map((t) => t._id).join(", "))
    console.log("  about:", aboutPatches.map((a) => a.id).join(", "))
    console.log("  articles:", articlePatches.map((a) => a.id + " -> " + a.author._ref).join(", "))
    return
  }

  let tx = client.transaction()
  for (const p of persons) tx = tx.createOrReplace(p)
  for (const t of tms) tx = tx.createOrReplace(t)
  for (const a of aboutPatches) tx = tx.patch(a.id, (patch) => patch.set({ pageBuilder: a.pageBuilder }))
  for (const a of articlePatches) tx = tx.patch(a.id, (patch) => patch.set({ author: a.author }))
  await tx.commit({ visibility: "sync" })
  console.log("  live: 8 person + 4 tm + about + 6 articles (sync).")
}

function migrateSeed() {
  const seed = JSON.parse(readFileSync(seedPath, "utf8"))

  // Source: les membres inline du seed (par langue) pour name/role/bio.
  const aboutSeed = Object.fromEntries(
    LANGS.map((lang) => [lang, seed.documents.find((d) => d.content && d.content._id === "aboutPage-" + lang)]),
  )

  // 1. Upsert des 8 docs person + 4 tm (wrappers seed).
  const upsert = (wrapper) => {
    const idx = seed.documents.findIndex((d) => d.content && d.content._id === wrapper.content._id)
    if (idx >= 0) seed.documents[idx] = wrapper
    else seed.documents.push(wrapper)
  }
  for (const lang of LANGS) {
    const team = teamBlockOf(aboutSeed[lang].content)
    for (const m of team.members) {
      const base = baseByName[m.name]
      const r = ROSTER.find((x) => x.base === base)
      upsert({
        type: "person",
        content: {
          _id: base + "-" + lang,
          _type: "person",
          language: lang,
          name: m.name,
          role: m.role,
          bio: m.bio,
          photo: { _type: "figure", image: { _type: "image", asset: { _type: "reference", _ref: "IMG:" + r.img } } },
        },
      })
    }
  }
  for (const r of ROSTER) upsert({ type: "translation.metadata", content: tmDoc(r.base) })

  // 2. team.members -> references (par langue).
  for (const lang of LANGS) {
    const team = teamBlockOf(aboutSeed[lang].content)
    team.members = ROSTER.map((r) => ({ _key: r.key, _type: "reference", _ref: r.base + "-" + lang }))
  }

  // 3. article.author -> references.
  for (const [artBase, personBase] of Object.entries(ARTICLE_AUTHOR)) {
    for (const lang of LANGS) {
      const art = seed.documents.find((d) => d.content && d.content._id === artBase + "-" + lang)
      if (!art) throw new Error("seed article introuvable: " + artBase + "-" + lang)
      art.content.author = { _type: "reference", _ref: personBase + "-" + lang }
    }
  }

  if (DRY) {
    console.log("  SEED (DRY): 8 person + 4 tm + team refs + 6 auteurs prets.")
    return
  }
  writeFileSync(seedPath, JSON.stringify(seed, null, 2) + "\n")
  console.log("  seed-content.json: miroir ecrit.")
}

console.log(DRY ? "DRY-RUN" : "LIVE")
await migrateLive()
migrateSeed()
console.log("OK.")
