// Génère le LOGO COMPLET de marque en SVG autonome: le glyphe (carré ambre + bouclier
// navy, repris de public/favicon.svg) PLUS le mot-symbole « Rempart Extermination »
// (Bitter, comme le header: « Rempart » gras navy, « Extermination » plus léger slate).
//
// Pourquoi un SVG autonome avec la POLICE EMBARQUÉE (base64 @font-face): rendu comme
// <img> (asset Sanity), un SVG est isolé et ne récupère pas la police de la page; on
// embarque donc le woff2 variable de Bitter (les vrais bytes expédiés par le site) et
// on rend le texte via <text font-weight>. Le logo s'affiche pareil partout (img,
// inline, aperçu Sanity). Le glyphe seul reste la favicon (famille), à la racine.
//
// La largeur du viewBox est MESURÉE (rendu large -> rognage -> remappage) plutôt
// qu'estimée: le poids 800/600 élargit le texte et un viewBox trop court rognerait.
//
// Prérequis: un build (`nuxt generate`) pour que .output/public/_fonts contienne le
// woff2 de Bitter, fontkit (npm i --no-save fontkit) pour repérer la fonte, et sharp
// (déjà au projet) pour la mesure. Sortie: public/logo-rempart.svg.
//
// Les valeurs en dur (couleurs, géométrie) ne vivent que dans ce fichier d'asset de
// marque, jamais dans un composant (même discipline que favicon.svg).
//
// Usage:  node studio/seed/build-logo-svg.mjs

import * as fk from 'fontkit'
import sharp from 'sharp'
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(here, '..', '..')
const fontsDir = join(repoRoot, '.output', 'public', '_fonts')
const outPath = join(repoRoot, 'public', 'logo-rempart.svg')

const NAVY = '#16243f'
const AMBER = '#fbbf24'
const SLATE = '#5c6678'
const H = 64
const WORD_X = 84
const R_SIZE = 27
const E_SIZE = 17

// Repère la fonte latine variable de Bitter parmi les woff2 expédiés (familyName
// « Bitter … » qui porte bien R et é), indépendamment du nom hashé du build.
function findBitterLatin() {
  for (const f of readdirSync(fontsDir).filter((n) => n.endsWith('.woff2'))) {
    try {
      const font = fk.openSync(join(fontsDir, f))
      const fam = String(font.familyName || '')
      if (fam.includes('Bitter') && font.hasGlyphForCodePoint?.(82) && font.hasGlyphForCodePoint?.(233)) return join(fontsDir, f)
    } catch {}
  }
  throw new Error('Fonte latine Bitter introuvable dans .output/public/_fonts (build requis).')
}

const b64 = readFileSync(findBitterLatin()).toString('base64')

function makeSvg(W) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Rempart Extermination">
  <!-- Logo complet de marque (demo, famille Ancree): glyphe (carre ambre + bouclier
       navy, repris de favicon.svg) + mot-symbole Bitter (police embarquee pour un
       rendu autonome en <img>). Valeurs en dur reservees a ce fichier d'asset. -->
  <defs>
    <style>
      @font-face{font-family:'RempartBitter';font-style:normal;font-weight:100 900;src:url(data:font/woff2;base64,${b64}) format('woff2');}
      .wm{font-family:'RempartBitter','Bitter',Georgia,serif;}
    </style>
  </defs>
  <rect width="64" height="64" rx="14.2" fill="${AMBER}"/>
  <g transform="translate(12.5 12.5) scale(1.625)" fill="none" stroke="${NAVY}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
    <path d="m9 12 2 2 4-4"/>
  </g>
  <text class="wm" x="${WORD_X}" y="29.5" font-size="${R_SIZE}" font-weight="800" letter-spacing="-0.27" fill="${NAVY}">Rempart</text>
  <text class="wm" x="${WORD_X + 0.5}" y="50" font-size="${E_SIZE}" font-weight="600" letter-spacing="0.34" fill="${SLATE}">Extermination</text>
</svg>
`
}

// Mesure: rend un viewBox volontairement large, rogne le blanc, remappe la largeur du
// contenu en unités SVG, puis fige un viewBox serré (contenu + petite marge droite).
const PROBE_W = 520
const probeSvg = Buffer.from(makeSvg(PROBE_W))
const meta = await sharp(probeSvg, { density: 384 }).flatten({ background: '#ffffff' }).metadata()
const pxPerUnit = meta.width / PROBE_W
const { info } = await sharp(probeSvg, { density: 384 }).flatten({ background: '#ffffff' }).trim({ threshold: 5 }).toBuffer({ resolveWithObject: true })
const contentRight = (Math.abs(info.trimOffsetLeft || 0) + info.width) / pxPerUnit
const W = Math.ceil(contentRight + 6)

writeFileSync(outPath, makeSvg(W))
console.log(`Logo écrit: ${outPath}`)
console.log(`  viewBox: 0 0 ${W} ${H} | contenu mesuré jusqu'à ${contentRight.toFixed(1)} | woff2 embarqué: ${Math.round(b64.length / 1024)} KB (base64)`)
