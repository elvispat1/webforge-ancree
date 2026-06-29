// Blog, fin du chantier FOND. Deux volets:
//  1. Re-maillage: fourmis pointait vers le HUB /services (servicesPage) -> recible
//     vers le service precis (fourmis charpentieres). souris n'avait aucun lien ->
//     ajoute un lien contextuel vers le service souris/rats. Liens de SERVICE
//     seulement, aucun lien ville (decision Charles).
//  2. Deux articles neufs fr+en sur le modele punaises: « Souris a l'automne »
//     (Samuel Ouellet, prevention, cover hero-mouse) et « Guepes et frelons »
//     (Martin Lefebvre, prevention, cover hero-wasp). Auteur = reference a la
//     banque person. Cover = image de nuisible EXISTANTE (pas de generation).
//
// Lit le token CLI, idempotent, --dry-run. Apostrophes droites.
// Usage:  node studio/seed/migrate-blog-finish.mjs [--dry-run]
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

// Asset ids des covers (images de nuisible existantes).
const COVER_ASSET = {
  "hero-mouse": "image-1c500ade3f769efdd7dc88c08d15eebeced8b9e0-1408x768-jpg",
  "hero-wasp": "image-871e942f94c12e52e8ea474f1d6293091900dfe8-1408x768-jpg",
}

// ── Helpers Portable Text (corps d'un articleRichText) ────────────────────────
function blk(key, style, segs, lang, listItem) {
  const markDefs = []
  const children = []
  let lc = 0
  segs.forEach((seg, i) => {
    const sk = key + "s" + i
    if (typeof seg === "string") {
      children.push({ _type: "span", _key: sk, text: seg, marks: [] })
    } else {
      lc += 1
      const lk = key + "l" + lc
      markDefs.push({ _key: lk, _type: "link", type: "internal", internalRef: { _type: "reference", _ref: seg.ref + "-" + lang } })
      children.push({ _type: "span", _key: sk, text: seg.t, marks: [lk] })
    }
  })
  const b = { _type: "block", _key: key, style, markDefs, children }
  if (listItem) {
    b.listItem = listItem
    b.level = 1
  }
  return b
}
const lead = (key, text) => ({ _key: key, _type: "articleLead", text })
const quote = (key, q, attribution) => ({ _key: key, _type: "articleQuote", quote: q, attribution })
const rich = (key, blocks) => ({ _key: key, _type: "articleRichText", body: blocks })

// ── Volet 1: re-maillage des articles existants ───────────────────────────────
// fourmis: tout lien interne vers servicesPage-<lang> -> service-fourmis-charpentieres-<lang>.
function retargetFourmis(body, lang) {
  return body.map((b) => {
    if (b._type !== "articleRichText") return b
    return {
      ...b,
      body: b.body.map((inner) => {
        if (!Array.isArray(inner.markDefs) || !inner.markDefs.length) return inner
        return {
          ...inner,
          markDefs: inner.markDefs.map((md) =>
            md._type === "link" && md.internalRef && md.internalRef._ref === "servicesPage-" + lang
              ? { ...md, internalRef: { ...md.internalRef, _ref: "service-fourmis-charpentieres-" + lang } }
              : md,
          ),
        }
      }),
    }
  })
}

// souris: ajoute un paragraphe de cloture (lien service souris/rats) a l'articleRichText b2.
const SOURIS_LINK = {
  fr: ["Quand ces indices se confirment, notre ", { t: "service de contrôle des souris et des rats", ref: "service-souris-rats" }, " s'attaque d'abord aux points d'entrée, plutôt que de seulement poser des pièges."],
  en: ["When these signs add up, our ", { t: "mouse and rat control service", ref: "service-souris-rats" }, " goes after the entry points first, rather than just setting traps."],
}
function appendSourisLink(body, lang) {
  return body.map((b) => {
    if (b._type !== "articleRichText" || b._key !== "b2") return b
    if (b.body.some((inner) => inner._key === "b2r6")) return b // idempotent
    return { ...b, body: [...b.body, blk("b2r6", "normal", SOURIS_LINK[lang], lang)] }
  })
}

// ── Volet 2: corps des deux articles neufs ────────────────────────────────────
function sourisAutomneBody(lang) {
  if (lang === "fr") {
    return [
      lead("b1", "Dès que les nuits fraîchissent, les souris cherchent un abri au chaud, et nos maisons sont une cible idéale. La plupart des infestations d'automne commencent par une seule ouverture qu'on n'a jamais remarquée."),
      rich("b2", [
        blk("b2a", "h2", ["Pourquoi l'automne les attire"], lang),
        blk("b2b", "normal", ["Une souris ne supporte pas le froid longtemps. À l'automne, elle suit la chaleur et l'odeur de nourriture vers l'intérieur, où elle trouve un nid tranquille pour l'hiver. C'est la saison où une petite négligence devient une vraie colonie."], lang),
      ]),
      rich("b3", [
        blk("b3a", "h2", ["Par où elles entrent"], lang),
        blk("b3b", "normal", ["Une souris passe par une ouverture de la taille d'un dix sous. Les points d'entrée les plus fréquents sont:"], lang),
        blk("b3c", "normal", ["les fissures de fondation et le bas des portes de garage;"], lang, "bullet"),
        blk("b3d", "normal", ["les passages de tuyaux et de fils mal scellés;"], lang, "bullet"),
        blk("b3e", "normal", ["les évents de sécheuse et les grilles d'aération abîmées."], lang, "bullet"),
      ]),
      rich("b4", [
        blk("b4a", "h2", ["Prévenir avant l'hiver"], lang),
        blk("b4b", "normal", ["Quelques gestes simples, posés tôt, évitent une infestation:"], lang),
        blk("b4c", "normal", ["scellez les ouvertures avec un matériau que la souris ne ronge pas, comme la laine d'acier et le mortier;"], lang, "bullet"),
        blk("b4d", "normal", ["rangez les graines, la nourriture pour animaux et les aliments secs dans des contenants hermétiques;"], lang, "bullet"),
        blk("b4e", "normal", ["dégagez le pourtour de la maison des tas de bois et de feuilles qui servent d'abri."], lang, "bullet"),
        blk("b4f", "normal", ["Si les indices se multiplient malgré tout, notre ", { t: "service de contrôle des souris et des rats", ref: "service-souris-rats" }, " s'attaque d'abord aux points d'entrée, plutôt que de seulement poser des pièges."], lang),
      ]),
      quote("b5", "Un piège attrape une souris. Sceller l'entrée règle le problème. C'est l'exclusion qui empêche les suivantes de revenir.", "Samuel Ouellet, technicien rongeurs et exclusion"),
    ]
  }
  return [
    lead("b1", "As soon as the nights turn cold, mice look for a warm shelter, and our homes are an ideal target. Most fall infestations start with a single opening nobody ever noticed."),
    rich("b2", [
      blk("b2a", "h2", ["Why fall draws them in"], lang),
      blk("b2b", "normal", ["A mouse cannot take the cold for long. In the fall it follows warmth and the smell of food indoors, where it finds a quiet nest for the winter. This is the season when a small oversight becomes a real colony."], lang),
    ]),
    rich("b3", [
      blk("b3a", "h2", ["Where they get in"], lang),
      blk("b3b", "normal", ["A mouse slips through a gap the size of a dime. The most common entry points are:"], lang),
      blk("b3c", "normal", ["foundation cracks and the bottom of garage doors;"], lang, "bullet"),
      blk("b3d", "normal", ["pipe and wire runs that are poorly sealed;"], lang, "bullet"),
      blk("b3e", "normal", ["dryer vents and damaged air grilles."], lang, "bullet"),
    ]),
    rich("b4", [
      blk("b4a", "h2", ["Prevent it before winter"], lang),
      blk("b4b", "normal", ["A few simple steps, taken early, keep an infestation away:"], lang),
      blk("b4c", "normal", ["seal openings with a material a mouse cannot gnaw through, such as steel wool and mortar;"], lang, "bullet"),
      blk("b4d", "normal", ["store seeds, pet food and dry goods in airtight containers;"], lang, "bullet"),
      blk("b4e", "normal", ["clear woodpiles and leaf litter away from the foundation."], lang, "bullet"),
      blk("b4f", "normal", ["If the signs keep adding up, our ", { t: "mouse and rat control service", ref: "service-souris-rats" }, " goes after the entry points first, rather than just setting traps."], lang),
    ]),
    quote("b5", "A trap catches one mouse. Sealing the entry solves the problem. Exclusion is what keeps the next ones from coming back.", "Samuel Ouellet, rodent and exclusion technician"),
  ]
}

function guepesBody(lang) {
  if (lang === "fr") {
    return [
      lead("b1", "Au printemps, un nid de guêpes tient dans une main et passe inaperçu. À la fin de l'été, la même colonie compte des centaines d'ouvrières et défend son nid avec vigueur. Comprendre ce cycle, c'est savoir quand agir sans risque."),
      rich("b2", [
        blk("b2a", "h2", ["Le cycle d'une colonie"], lang),
        blk("b2b", "normal", ["Une reine fondatrice démarre seule le nid au printemps. La colonie grossit tout l'été et devient la plus nombreuse, et la plus défensive, en août et septembre. C'est aussi le moment où les guêpes, attirées par le sucre, croisent le plus souvent notre chemin."], lang),
      ]),
      rich("b3", [
        blk("b3a", "h2", ["Où les nids apparaissent"], lang),
        blk("b3b", "normal", ["Selon l'espèce, le nid se cache dans des endroits très différents:"], lang),
        blk("b3c", "normal", ["sous les avant-toits, les balcons et les cadres de fenêtre;"], lang, "bullet"),
        blk("b3d", "normal", ["dans le sol, un vieux terrier ou un muret de pierres;"], lang, "bullet"),
        blk("b3e", "normal", ["dans un cabanon, un grenier ou une cloison creuse."], lang, "bullet"),
      ]),
      rich("b4", [
        blk("b4a", "h2", ["Pourquoi ne pas s'en occuper soi-même"], lang),
        blk("b4b", "normal", ["Déloger un nid actif provoque une réaction défensive immédiate, et les piqûres multiples sont dangereuses, surtout en cas d'allergie. Un nid dans un mur, arrosé d'aérosol, pousse souvent les guêpes à percer vers l'intérieur. Notre ", { t: "service de gestion des guêpes et des frelons", ref: "service-guepes-frelons" }, " traite le nid à la source, puis le retire une fois la colonie neutralisée."], lang),
        blk("b4c", "normal", ["La règle simple: si le nid est plus gros qu'une balle de golf ou hors de portée, on appelle plutôt que d'improviser."], lang),
      ]),
      quote("b5", "On traite toujours le nid avant de le sceller. Boucher un trou avec une colonie vivante derrière, c'est la rediriger vers la pièce d'à côté.", "Martin Lefebvre, fondateur et technicien en chef"),
    ]
  }
  return [
    lead("b1", "In spring, a wasp nest fits in your hand and goes unnoticed. By late summer, the same colony numbers hundreds of workers and defends its nest fiercely. Understanding that cycle is knowing when to act safely."),
    rich("b2", [
      blk("b2a", "h2", ["The life of a colony"], lang),
      blk("b2b", "normal", ["A founding queen starts the nest alone in spring. The colony grows all summer and is at its largest, and most defensive, in August and September. That is also when wasps, drawn to sugar, cross our path most often."], lang),
    ]),
    rich("b3", [
      blk("b3a", "h2", ["Where nests appear"], lang),
      blk("b3b", "normal", ["Depending on the species, the nest hides in very different spots:"], lang),
      blk("b3c", "normal", ["under eaves, balconies and window frames;"], lang, "bullet"),
      blk("b3d", "normal", ["in the ground, an old burrow or a stone wall;"], lang, "bullet"),
      blk("b3e", "normal", ["in a shed, an attic or a hollow wall."], lang, "bullet"),
    ]),
    rich("b4", [
      blk("b4a", "h2", ["Why not handle it yourself"], lang),
      blk("b4b", "normal", ["Disturbing an active nest triggers an immediate defensive response, and multiple stings are dangerous, especially for anyone allergic. A nest inside a wall, sprayed with an aerosol, often pushes the wasps to break through indoors. Our ", { t: "wasp and hornet management service", ref: "service-guepes-frelons" }, " treats the nest at the source, then removes it once the colony is neutralised."], lang),
      blk("b4c", "normal", ["The simple rule: if the nest is bigger than a golf ball or out of reach, call rather than improvise."], lang),
    ]),
    quote("b5", "We always treat the nest before sealing it. Plug a hole with a live colony behind it and you just redirect them to the next room.", "Martin Lefebvre, founder and lead technician"),
  ]
}

const NEW_ARTICLES = [
  {
    base: "article-souris-automne",
    img: "hero-mouse",
    authorBase: "person-samuel",
    categoryBase: "category-prevention",
    date: "2026-06-24",
    readingTime: 5,
    slug: { fr: "souris-a-l-automne", en: "mice-in-the-fall" },
    title: { fr: "Souris à l'automne: les arrêter avant qu'elles n'entrent", en: "Mice in the fall: stopping them before they get in" },
    excerpt: {
      fr: "Quand le froid arrive, les souris cherchent un abri au chaud. Voici par où elles entrent et comment les tenir dehors avant l'hiver.",
      en: "When the cold arrives, mice look for a warm shelter. Here is where they get in and how to keep them out before winter.",
    },
    body: sourisAutomneBody,
  },
  {
    base: "article-guepes",
    img: "hero-wasp",
    authorBase: "person-martin",
    categoryBase: "category-prevention",
    date: "2026-06-12",
    readingTime: 5,
    slug: { fr: "guepes-et-frelons", en: "wasps-and-hornets" },
    title: { fr: "Guêpes et frelons: comprendre le nid avant d'agir", en: "Wasps and hornets: understand the nest before you act" },
    excerpt: {
      fr: "Un nid de guêpes tient dans une main au printemps, puis devient agressif en fin d'été. Voici comment lire ce cycle et quand appeler.",
      en: "A wasp nest fits in your hand in spring, then turns aggressive by late summer. Here is how to read the cycle and when to call.",
    },
    body: guepesBody,
  },
]

function articleDoc(cfg, lang, coverRef) {
  return {
    _id: cfg.base + "-" + lang,
    _type: "article",
    language: lang,
    title: cfg.title[lang],
    slug: { _type: "slug", current: cfg.slug[lang] },
    excerpt: cfg.excerpt[lang],
    cover: { _type: "figure", image: { _type: "image", asset: { _type: "reference", _ref: coverRef } } },
    category: { _type: "reference", _ref: cfg.categoryBase + "-" + lang },
    author: { _type: "reference", _ref: cfg.authorBase + "-" + lang },
    date: cfg.date,
    readingTime: cfg.readingTime,
    body: cfg.body(lang),
  }
}

function tmDoc(base, type) {
  const tval = (lang) => ({ _key: lang, _type: "internationalizedArrayReferenceValue", language: lang, value: { _type: "reference", _ref: base + "-" + lang, _weak: true, _strengthenOnPublish: { type } } })
  return { _id: "translation-" + base, _type: "translation.metadata", schemaTypes: [type], translations: LANGS.map(tval) }
}

async function migrateLive() {
  let tx = client.transaction()
  // Volet 1: re-maillage.
  for (const lang of LANGS) {
    const fourmis = await client.getDocument("article-fourmis-" + lang)
    if (!fourmis) throw new Error("introuvable: article-fourmis-" + lang)
    tx = tx.patch("article-fourmis-" + lang, (p) => p.set({ body: retargetFourmis(fourmis.body, lang) }))
    const souris = await client.getDocument("article-souris-" + lang)
    if (!souris) throw new Error("introuvable: article-souris-" + lang)
    tx = tx.patch("article-souris-" + lang, (p) => p.set({ body: appendSourisLink(souris.body, lang) }))
  }
  // Volet 2: articles neufs + tm.
  for (const cfg of NEW_ARTICLES) {
    for (const lang of LANGS) tx = tx.createOrReplace(articleDoc(cfg, lang, COVER_ASSET[cfg.img]))
    tx = tx.createOrReplace(tmDoc(cfg.base, "article"))
  }
  if (DRY) {
    console.log("  re-maillage fourmis (servicesPage -> service fourmis) + souris (+lien service) fr+en")
    console.log("  articles neufs:", NEW_ARTICLES.flatMap((c) => LANGS.map((l) => c.base + "-" + l)).join(", "))
    console.log("  tm:", NEW_ARTICLES.map((c) => "translation-" + c.base).join(", "))
    return
  }
  await tx.commit({ visibility: "sync" })
  console.log("  live: re-maillage + 4 articles + 2 tm (sync).")
}

function migrateSeed() {
  const seed = JSON.parse(readFileSync(seedPath, "utf8"))
  const find = (id) => seed.documents.find((d) => d.content && d.content._id === id)
  const upsert = (wrapper) => {
    const idx = seed.documents.findIndex((d) => d.content && d.content._id === wrapper.content._id)
    if (idx >= 0) seed.documents[idx] = wrapper
    else seed.documents.push(wrapper)
  }
  // Volet 1.
  for (const lang of LANGS) {
    const fourmis = find("article-fourmis-" + lang)
    if (!fourmis) throw new Error("seed introuvable: article-fourmis-" + lang)
    fourmis.content.body = retargetFourmis(fourmis.content.body, lang)
    const souris = find("article-souris-" + lang)
    if (!souris) throw new Error("seed introuvable: article-souris-" + lang)
    souris.content.body = appendSourisLink(souris.content.body, lang)
  }
  // Volet 2 (cover en IMG:<cle>).
  for (const cfg of NEW_ARTICLES) {
    for (const lang of LANGS) upsert({ type: "article", content: articleDoc(cfg, lang, "IMG:" + cfg.img) })
    upsert({ type: "translation.metadata", content: tmDoc(cfg.base, "article") })
  }
  if (DRY) {
    console.log("  SEED (DRY): re-maillage + 4 articles + 2 tm prets.")
    return
  }
  writeFileSync(seedPath, JSON.stringify(seed, null, 2) + "\n")
  console.log("  seed-content.json: miroir ecrit.")
}

console.log(DRY ? "DRY-RUN" : "LIVE")
await migrateLive()
migrateSeed()
console.log("OK.")
