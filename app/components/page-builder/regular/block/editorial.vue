<script setup lang="ts">
/* Bloc Éditorial: du contenu long en SEGMENTS. Chaque segment pose du texte riche
 * (titres, listes, liens internes inline) et, au choix, une ou deux images.
 * SOLO (un seul segment): aucune transition possible, on honore la disposition du
 * CMS. SÉQUENCE (2+ segments): le composant force un zigzag posé, le côté de l'image
 * est dérivé en code et les compos « posées » (band, duo) sont rabattues sur la
 * famille « à côté ». Garantie démo: impossible de générer la transition cassée
 * (texte, image à droite, puis texte à gauche avec un vide à droite).
 * Une « disposition » par segment décide de la composition du visuel; `auto` la
 * dérive du nombre d'images, les autres la forcent (replis sûrs si image manque).
 * Deux familles, pour donner du rythme entre segments:
 *   À CÔTÉ (texte et image côte à côte, zigzag d'Ancrée):
 *     aside    — image modeste à côté du texte
 *     overhang — image qui déborde dans la gouttière vers le texte (filet ambre)
 *     nested   — paire emboîtée (l'ancrage tient le cadre, la seconde glisse en débord)
 *   POSÉE EN PLEINE MESURE (amorce de texte au-dessus, visuel large dessous):
 *     band     — une image en bandeau pleine mesure du conteneur
 *     duo      — deux images en diptyque décalé (tailles inégales, l'une posée plus bas)
 *     text     — texte pleine mesure, aucun visuel
 * Entrées en cascade « ancrées au sol ». PortableText importé explicitement (le
 * dossier page-builder est hors auto-import). */
import type { BlockBase } from '~/types/blocks'
import type {
  EditorialContent,
  EditorialSegment,
  EditorialDisposition,
  EditorialImage
} from '~/content/editorial'
import PortableText from '~/components/page-builder/article/PortableText.vue'

const props = defineProps<BlockBase<'editorial'> & EditorialContent>()

const hasHead = computed(() => Boolean(props.heading))

// Un editorial à plusieurs segments est une SÉQUENCE (composée en zigzag posé); à un
// seul segment, c'est un SOLO (aucune transition possible, disposition honorée).
const isSequence = computed(() => props.segments.length > 1)

// Disposition d'un segment SOLO: `auto` se résout selon le nombre d'images; une compo
// qui exige plus d'images qu'elle n'en a retombe sur une compo plus simple. Jamais de
// bloc cassé (même esprit fail-safe que le placeholder du fragment <Image>).
function soloDisposition(seg: EditorialSegment): EditorialDisposition {
  const count = seg.media.length
  let d = seg.disposition
  if (d === 'auto') d = count === 0 ? 'text' : count === 1 ? 'aside' : 'nested'
  if ((d === 'nested' || d === 'duo') && count < 2) d = count === 1 ? 'aside' : 'text'
  if ((d === 'aside' || d === 'overhang' || d === 'band') && count === 0) d = 'text'
  return d
}

// Disposition d'un segment en SÉQUENCE: on rabat tout sur la famille « à côté » (ou un
// interlude de texte centré si 0 image), pour qu'aucun segment ne puisse poser un vide
// à côté de l'image d'un voisin. Les compos « posées » (band, duo) et le champ
// mediaSide du CMS ne sont volontairement PAS honorés ici: la démo ne doit pas pouvoir
// générer la transition cassée (texte, image à droite, puis texte à gauche, vide).
function seqDisposition(seg: EditorialSegment): EditorialDisposition {
  const count = seg.media.length
  if (count === 0) return 'text'
  if (count >= 2) return 'nested'
  return 'aside'
}

// Côté de l'image au desktop (SOLO uniquement): `auto` alterne (segments impairs à
// gauche), `left`/`right` forcent. En séquence, le côté est dérivé en code (zigzag).
function mediaLeft(seg: EditorialSegment, i: number): boolean {
  if (seg.mediaSide === 'left') return true
  if (seg.mediaSide === 'right') return false
  return i % 2 === 1
}

// Vue de rendu par segment: disposition résolue, côté, images réellement posées, et
// le repère de famille (« à côté » vs « posée »). La légende ne s'affiche que sur les
// compositions à image unique (les paires n'en portent pas).
interface SegmentView {
  body: EditorialSegment['body']
  disp: EditorialDisposition
  left: boolean
  beside: boolean
  seq: boolean
  interlude: boolean
  images: EditorialImage[]
  caption?: string
}
const view = computed<SegmentView[]>(() => {
  const seq = isSequence.value
  let imgRank = 0 // rang du segment porteur d'image, pour le zigzag dérivé en séquence
  return props.segments.map((seg, i) => {
    const disp = seq ? seqDisposition(seg) : soloDisposition(seg)
    const pair = disp === 'nested' || disp === 'duo'
    const single = disp === 'aside' || disp === 'overhang' || disp === 'band'
    const hasImg = disp !== 'text'
    // Côté: en solo on honore mediaSide; en séquence on dérive un zigzag strict du
    // rang d'image (1re image à droite, puis alternance), CMS volontairement ignoré.
    let left: boolean
    if (seq) {
      left = hasImg ? imgRank % 2 === 1 : false
      if (hasImg) imgRank++
    } else {
      left = mediaLeft(seg, i)
    }
    return {
      body: seg.body,
      disp,
      left,
      beside: disp === 'aside' || disp === 'overhang' || disp === 'nested',
      seq,
      interlude: seq && disp === 'text',
      images: disp === 'text' ? [] : pair ? seg.media.slice(0, 2) : seg.media.slice(0, 1),
      caption: single ? seg.media[0]?.caption : undefined
    }
  })
})

function segmentClass(vm: SegmentView): string[] {
  const c = [`editorial__segment--${vm.disp}`]
  if (vm.seq) c.push('editorial__segment--seq')
  if (vm.interlude) c.push('editorial__segment--interlude')
  if (vm.beside) c.push('editorial__segment--beside', vm.left ? 'editorial__segment--media-left' : 'editorial__segment--media-right')
  if (vm.disp === 'duo') c.push(vm.left ? 'editorial__segment--media-left' : 'editorial__segment--media-right')
  return c
}
function mediaClass(vm: SegmentView): string | undefined {
  if (vm.disp === 'nested') return 'editorial__media--pair'
  if (vm.disp === 'duo') return 'editorial__media--duo'
  if (vm.disp === 'band') return 'editorial__media--band'
  return undefined
}
function imgClass(vm: SegmentView, j: number): string {
  if (vm.disp === 'nested') return j === 0 ? 'editorial__img--back' : 'editorial__img--front'
  if (vm.disp === 'duo') return 'editorial__img--duo'
  return 'editorial__img--single'
}

// Ratios par token (discipline 1: jamais une valeur d'aspect en dur côté appelant).
// Le visuel reste paysage et modeste, le contenu prime; le bandeau s'étire (vidéo),
// le diptyque varie large/portrait pour l'asymétrie posée.
function imgRatio(vm: SegmentView, j: number): string {
  switch (vm.disp) {
    case 'band':
      return 'var(--ratio-video)'
    case 'overhang':
      return 'var(--ratio-landscape)'
    case 'nested':
      return 'var(--ratio-landscape)'
    case 'duo':
      return j === 0 ? 'var(--ratio-wide)' : 'var(--ratio-portrait)'
    default:
      return 'var(--ratio-wide)'
  }
}
function imgSizes(vm: SegmentView, j: number): string {
  switch (vm.disp) {
    case 'band':
      return 'xs:100vw sm:100vw md:100vw lg:100vw xl:100vw xxl:100vw'
    case 'nested':
      return j === 0
        ? 'xs:100vw sm:100vw md:50vw lg:40vw xl:40vw xxl:40vw'
        : 'xs:60vw sm:60vw md:30vw lg:22vw xl:22vw xxl:22vw'
    case 'duo':
      return j === 0
        ? 'xs:100vw sm:100vw md:50vw lg:46vw xl:46vw xxl:46vw'
        : 'xs:100vw sm:100vw md:45vw lg:34vw xl:34vw xxl:34vw'
    default:
      return 'xs:100vw sm:100vw md:50vw lg:40vw xl:40vw xxl:40vw'
  }
}
</script>

<template>
  <section class="editorial">
    <div class="wf-container">
      <SectionHead v-if="hasHead" :eyebrow="eyebrow" :heading="heading!" :lead="lead" />

      <div class="editorial__segments" :class="{ 'editorial__segments--headed': hasHead }">
        <article
          v-for="(vm, i) in view"
          :key="i"
          class="editorial__segment wf-grid-cols"
          :class="segmentClass(vm)"
          data-reveal-stagger
        >
          <div class="editorial__text">
            <PortableText :value="vm.body" />
          </div>

          <figure v-if="vm.images.length" class="editorial__media" :class="mediaClass(vm)">
            <!-- Chaque image est enveloppée dans un div local: le fragment <Image> a
                 plusieurs racines (v-if/else), donc les styles scoped n'atteignent
                 pas sa racine. Le wrapper reçoit le calage (cadre, ombre, débord). -->
            <div
              v-for="(img, j) in vm.images"
              :key="j"
              class="editorial__img"
              :class="imgClass(vm, j)"
            >
              <Image :src="img.src" :alt="img.alt" :ratio="imgRatio(vm, j)" :sizes="imgSizes(vm, j)" />
            </div>
            <figcaption v-if="vm.caption" class="editorial__caption wf-caption">
              {{ vm.caption }}
            </figcaption>
          </figure>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.editorial {
  padding-block: var(--space-block-default);
  background: var(--bg-base);
}
.editorial__segments {
  display: flex;
  flex-direction: column;
  gap: clamp(5.6rem, 9vh, 8.4rem);
}
.editorial__segments--headed {
  margin-top: var(--space-head-content);
}

/* Segment: pile au mobile, grille calée sur les pistes au desktop. Le conteneur 16
 * pistes vient de .wf-grid-cols; le placement (et la bascule de côté) reste ici,
 * c'est un motif positionnel par segment (exception légitime, cf. grid-utilities). */
.editorial__segment {
  display: flex;
  flex-direction: column;
  gap: 3.2rem;
}
.editorial__text {
  max-width: 68ch;
}

/* Média: cadre arrondi, ombre chaude. Famille « à côté »: l'image se pose AVANT le
 * texte au mobile. Famille « posée »: le texte d'amorce reste en tête. */
.editorial__media {
  order: -1;
  margin: 0;
  position: relative;
}
.editorial__segment--band .editorial__media,
.editorial__segment--duo .editorial__media {
  order: 0;
}
.editorial__img {
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--elev-mid);
}
.editorial__caption {
  margin-top: 1.2rem;
  color: var(--text-muted);
}

/* Débord: l'image porte une ombre chaude plus marquée (matière et profondeur, sans
 * filet décoratif). Le décalage dans la gouttière se précise au desktop. */
.editorial__segment--overhang .editorial__img {
  box-shadow: var(--elev-high);
}

/* Paire emboîtée: l'image d'ancrage (back) tient le cadre, la seconde (front) glisse
 * en débord dans le coin bas vers le texte. Anneau couleur fond (mat blanc) pour
 * détacher les plans, ombre plus marquée. */
.editorial__media--pair .editorial__img--front {
  position: absolute;
  bottom: -2.4rem;
  right: -1.2rem;
  width: 56%;
  z-index: 2;
  box-shadow:
    0 0 0 0.8rem var(--bg-base),
    var(--elev-high);
}

/* Diptyque décalé: deux images empilées au mobile, côte à côte et décalées au
 * desktop. */
.editorial__media--duo {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2.4rem;
}

@container site (min-width: 1024px) {
  .editorial__segment {
    display: grid;
    column-gap: 2rem;
    row-gap: 3.6rem;
    /* Haut aligné: l'image se cale sur le début du texte (plus juste pour du
     * long-form aux longueurs inégales qu'un centrage qui ferait flotter l'image). */
    align-items: start;
  }

  /* Texte seul: pleine mesure de lecture, calée à gauche. */
  .editorial__segment--text .editorial__text {
    grid-column: 1 / span 10;
  }

  /* Famille « à côté » (aside, overhang, nested): texte prime en mesure large,
   * image modeste à côté, zigzag par le côté. */
  .editorial__segment--beside.editorial__segment--media-right .editorial__text {
    grid-column: 1 / span 8;
    grid-row: 1;
  }
  .editorial__segment--beside.editorial__segment--media-right .editorial__media {
    grid-column: 10 / -1;
    grid-row: 1;
  }
  .editorial__segment--beside.editorial__segment--media-left .editorial__text {
    grid-column: 9 / -1;
    grid-row: 1;
  }
  .editorial__segment--beside.editorial__segment--media-left .editorial__media {
    grid-column: 1 / span 7;
    grid-row: 1;
  }

  /* Débord: l'image pousse dans la gouttière VERS le texte (translation, pas un
   * changement de piste: aucune animation de layout, l'image reste posée). */
  .editorial__segment--overhang.editorial__segment--media-right .editorial__img {
    transform: translateX(-2.4rem);
  }
  .editorial__segment--overhang.editorial__segment--media-left .editorial__img {
    transform: translateX(2.4rem);
  }

  /* Le débord de la paire vise le texte selon le côté (l'autre bord repasse en auto
   * pour ne pas sur-contraindre la largeur). */
  .editorial__segment--nested.editorial__segment--media-right .editorial__img--front {
    right: auto;
    left: -2.4rem;
  }
  .editorial__segment--nested.editorial__segment--media-left .editorial__img--front {
    left: auto;
    right: -2.4rem;
  }

  /* Bandeau ancré: amorce de texte au-dessus, image pleine mesure du conteneur
   * dessous (un moment fort qui casse le rythme, posé, pas à bord perdu). */
  .editorial__segment--band .editorial__text {
    grid-column: 1 / span 10;
    grid-row: 1;
  }
  .editorial__segment--band .editorial__media {
    grid-column: 1 / -1;
    grid-row: 2;
  }

  /* Diptyque décalé: amorce au-dessus, deux images sous le texte. La plus large se
   * pose en haut, la plus étroite glisse plus bas (asymétrie posée, ancrée au sol).
   * Le côté inverse l'arrangement (miroir horizontal). */
  .editorial__segment--duo .editorial__text {
    grid-column: 1 / span 10;
    grid-row: 1;
  }
  .editorial__segment--duo .editorial__media {
    grid-column: 1 / -1;
    grid-row: 2;
  }
  .editorial__segment--duo.editorial__segment--media-right .editorial__media--duo {
    grid-template-columns: 9fr 7fr;
  }
  .editorial__segment--duo.editorial__segment--media-right .editorial__img--duo:nth-child(1) {
    grid-column: 1;
  }
  .editorial__segment--duo.editorial__segment--media-right .editorial__img--duo:nth-child(2) {
    grid-column: 2;
    margin-top: 3.6rem;
  }
  .editorial__segment--duo.editorial__segment--media-left .editorial__media--duo {
    grid-template-columns: 7fr 9fr;
  }
  .editorial__segment--duo.editorial__segment--media-left .editorial__img--duo:nth-child(1) {
    grid-column: 2;
  }
  .editorial__segment--duo.editorial__segment--media-left .editorial__img--duo:nth-child(2) {
    grid-column: 1;
    margin-top: 3.6rem;
  }
}

/* Séquence (2+ segments): le zigzag se pose. L'image penche dans la gouttière vers le
 * texte (matière et profondeur, sans tiret ni filet), l'ombre chaude se renforce. Le
 * rendu solo reste inchangé (la signature ne s'applique qu'aux séquences). */
@container site (min-width: 1024px) {
  .editorial__segment--seq.editorial__segment--media-right .editorial__media {
    transform: translateX(-1.6rem);
  }
  .editorial__segment--seq.editorial__segment--media-left .editorial__media {
    transform: translateX(1.6rem);
  }
  .editorial__segment--seq .editorial__img--single {
    box-shadow: var(--elev-high);
  }

  /* Interlude de texte en séquence (0 image): mesure centrée et posée, vides
   * symétriques (jamais un demi-bloc à vide latéral sous l'image d'un voisin). */
  .editorial__segment--interlude .editorial__text {
    grid-column: 3 / span 12;
    margin-inline: auto;
  }
}
</style>
