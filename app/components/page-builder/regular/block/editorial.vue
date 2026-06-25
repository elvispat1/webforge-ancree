<script setup lang="ts">
/* Bloc Éditorial: du contenu long en SEGMENTS. Chaque segment pose du texte riche
 * (titres, listes, liens internes inline) et, au choix, une ou deux images. Le côté
 * de l'image ALTERNE en zigzag (asymétrie posée d'Ancrée), ou se force par segment.
 * Deux images = elles s'EMBOÎTENT: une image d'ancrage et une seconde glissée en
 * débord dans le coin vers le texte, ombre chaude, fin filet ambre (matière et
 * profondeur, le même geste que la carte de chiffres sur la photo de « à propos »).
 * Un segment sans image prend la pleine mesure de lecture. Entrées en cascade,
 * parallaxe douce sur l'image seule. PortableText importé explicitement (le dossier
 * page-builder est hors auto-import). */
import type { BlockBase } from '~/types/blocks'
import type { EditorialContent, EditorialSegment } from '~/content/editorial'
import PortableText from '~/components/page-builder/article/PortableText.vue'

const props = defineProps<BlockBase<'editorial'> & EditorialContent>()

const hasHead = computed(() => Boolean(props.heading))

// Côté de l'image au desktop: `auto` alterne (premier segment image à droite, puis
// à gauche, etc.); `left`/`right` forcent. Sans image, le segment est pleine mesure.
function mediaLeft(seg: EditorialSegment, i: number): boolean {
  if (seg.mediaSide === 'left') return true
  if (seg.mediaSide === 'right') return false
  return i % 2 === 1
}
function segmentClass(seg: EditorialSegment, i: number): string {
  if (!seg.media.length) return 'editorial__segment--text'
  return mediaLeft(seg, i) ? 'editorial__segment--media-left' : 'editorial__segment--media-right'
}
function imgClass(count: number, j: number): string {
  if (count < 2) return 'editorial__img--single'
  return j === 0 ? 'editorial__img--back' : 'editorial__img--front'
}
function imgRatio(count: number, j: number): string {
  // Paysage modeste, jamais un portrait qui domine le texte (le contenu prime).
  if (count < 2) return '3/2'
  return j === 0 ? '4/3' : '4/3'
}
</script>

<template>
  <section class="editorial">
    <div class="wf-container">
      <SectionHead v-if="hasHead" :eyebrow="eyebrow" :heading="heading!" :lead="lead" />

      <div class="editorial__segments" :class="{ 'editorial__segments--headed': hasHead }">
        <article
          v-for="(seg, i) in segments"
          :key="i"
          class="editorial__segment wf-grid-cols"
          :class="segmentClass(seg, i)"
          data-reveal-stagger
        >
          <div class="editorial__text">
            <PortableText :value="seg.body" />
          </div>

          <figure
            v-if="seg.media.length"
            class="editorial__media"
            :class="{ 'editorial__media--pair': seg.media.length > 1 }"
          >
            <!-- Chaque image est enveloppee dans un div local: le fragment <Image>
                 a plusieurs racines (v-if/else), donc les styles scoped n'atteignent
                 pas sa racine. Le wrapper recoit le calage (cadre, ombre, debord). -->
            <div
              v-for="(img, j) in seg.media"
              :key="j"
              class="editorial__img"
              :class="imgClass(seg.media.length, j)"
            >
              <Image
                :src="img.src"
                :alt="img.alt"
                :ratio="imgRatio(seg.media.length, j)"
                sizes="xs:100vw sm:100vw md:50vw lg:40vw xl:40vw xxl:40vw"
              />
            </div>
            <figcaption v-if="seg.media.length === 1 && seg.media[0]!.caption" class="editorial__caption wf-caption">
              {{ seg.media[0]!.caption }}
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

/* Segment: pile au mobile (image au-dessus du texte), zigzag calé sur les pistes au
 * desktop. Le conteneur 16 pistes vient de .wf-grid-cols; le placement texte/média
 * (et la bascule de côté) reste ici, c'est un motif positionnel par segment. */
.editorial__segment {
  display: flex;
  flex-direction: column;
  gap: 3.2rem;
}
.editorial__text {
  max-width: 68ch;
}

/* Média: cadre arrondi, ombre chaude. Au mobile l'image se pose AVANT le texte. */
.editorial__media {
  order: -1;
  margin: 0;
  position: relative;
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

/* Paire emboîtée: l'image d'ancrage (back) tient le cadre, la seconde (front) glisse
 * en débord dans le coin bas vers le texte. Anneau couleur fond (mat blanc) pour
 * détacher les plans, ombre plus marquée. Une position horizontale de base (mobile)
 * est posée ici; le côté du débord se précise au desktop selon le sens du zigzag. */
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

@container site (min-width: 1024px) {
  .editorial__segment {
    display: grid;
    column-gap: 2rem;
    /* Haut aligné: l'image se cale sur le début du texte (plus juste pour du
     * long-form aux longueurs inégales qu'un centrage qui ferait flotter l'image). */
    align-items: start;
  }
  /* Le texte prime (mesure large), l'image reste modeste. Image à droite (défaut /
   * zigzag pair): texte cols 1-8, média cols 10-16. */
  .editorial__segment--media-right .editorial__text {
    grid-column: 1 / span 8;
    grid-row: 1;
  }
  .editorial__segment--media-right .editorial__media {
    grid-column: 10 / -1;
    grid-row: 1;
  }
  /* Image à gauche (zigzag impair): média cols 1-7, texte cols 9-16. */
  .editorial__segment--media-left .editorial__text {
    grid-column: 9 / -1;
    grid-row: 1;
  }
  .editorial__segment--media-left .editorial__media {
    grid-column: 1 / span 7;
    grid-row: 1;
  }
  /* Segment sans image: pleine mesure de lecture, calée à gauche. */
  .editorial__segment--text .editorial__text {
    grid-column: 1 / span 10;
  }
  /* Le débord de la paire vise le texte selon le côté (l'autre bord repasse en auto
   * pour ne pas sur-contraindre la largeur). */
  .editorial__segment--media-right .editorial__img--front {
    right: auto;
    left: -2.4rem;
  }
  .editorial__segment--media-left .editorial__img--front {
    left: auto;
    right: -2.4rem;
  }
}
</style>
