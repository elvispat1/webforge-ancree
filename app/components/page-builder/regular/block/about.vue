<script setup lang="ts">
/* A propos: media-texte en ZIGZAG, signature Ancree. Une grande photo d'equipe
 * ancree a gauche (cols 1-6), le recit a droite (cols 7-12), asymetrie posee,
 * empile au mobile. La photo n'est pas un rectangle sage de plus: une carte de
 * chiffres de confiance en bleu nuit la CHEVAUCHE par le bas, comme une plaque
 * posee au sol, et un filet ambre signe le coin. Les grands chiffres deviennent
 * des elements graphiques (valeur ambre en display lourd, qualificatif sobre).
 * Aucune parente avec le split photo collante + liste numerotee de Minimaliste.
 * Aucune numerotation. Le fond peint tout de suite (pas de data-reveal sur la
 * section: PageBuilder enveloppe deja le bloc dans v-reveal). */
import type { BlockBase } from '~/types/blocks'
import type { AboutContent } from '~/content/about'

type AboutBlock = BlockBase<'about'> & AboutContent

defineProps<AboutBlock>()
</script>

<template>
  <section class="about">
    <div class="wf-container">
      <div class="about__layout section-grid">
        <!-- Media: photo ancree, carte de chiffres en chevauchement. -->
        <div class="about__media" data-reveal>
          <figure class="about__figure">
            <NuxtImg
              :src="photo.src"
              :alt="photo.alt || ''"
              class="about__img"
              sizes="xs:100vw sm:100vw md:50vw lg:50vw xl:50vw xxl:50vw"
              format="webp"
              loading="lazy"
            />
            <span class="about__corner" aria-hidden="true" />
          </figure>

          <dl class="about__stats" data-reveal-stagger>
            <div v-for="stat in stats" :key="stat.label" class="about__stat">
              <dt class="about__stat-value">{{ stat.value }}</dt>
              <dd class="about__stat-label">{{ stat.label }}</dd>
            </div>
          </dl>
        </div>

        <!-- Recit. -->
        <div class="about__copy" data-reveal-stagger>
          <p v-if="eyebrow" class="about__eyebrow wf-caption">
            <span class="about__tick" aria-hidden="true" />{{ eyebrow }}
          </p>
          <h2 class="about__heading wf-h2">{{ heading }}</h2>
          <div class="about__body">
            <p v-for="para in body" :key="para" class="wf-body-1 wf-text-muted">{{ para }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.about {
  padding-block: var(--space-block-default);
  background: var(--bg-base);
}
.about__layout {
  align-items: center;
  row-gap: 4.8rem;
}
/* Mobile et tablette: la photo et le recit prennent toute la largeur, empiles.
 * Le zigzag 6/6 ne s'active qu'au desktop (la section-grid a 4 colonnes en
 * dessous, donc sans cette regle les enfants se coinceraient dans une colonne). */
.about__media,
.about__copy {
  grid-column: 1 / -1;
}

/* Media: la photo et la carte de chiffres forment une pile ancree. Au mobile,
 * la carte se pose juste apres la photo, en debord controle. */
.about__media {
  position: relative;
}
.about__figure {
  position: relative;
  margin: 0;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--elev-high);
}
.about__img {
  display: block;
  width: 100%;
  height: 100%;
  aspect-ratio: var(--ratio-landscape);
  object-fit: cover;
}
/* Filet ambre qui signe le coin bas-gauche de la photo (ancrage au sol). */
.about__corner {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 6rem;
  height: 0.6rem;
  background: var(--accent-call);
  border-top-right-radius: 2px;
}

/* Carte de chiffres de confiance: bleu nuit, posee, chevauche la photo par le
 * bas. Grille de paires valeur / qualificatif. */
.about__stats {
  position: relative;
  z-index: 1;
  margin: -3.2rem 0 0;
  padding: 2.8rem;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 2.6rem 2rem;
  background: var(--bg-deep);
  color: var(--text-ondeep);
  border-radius: var(--radius-lg);
  box-shadow: var(--elev-high);
}
.about__stat {
  position: relative;
  padding-left: 1.6rem;
}
/* Petit trait ambre vertical devant chaque chiffre (rappel de la signature). */
.about__stat::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.4rem;
  bottom: 0.4rem;
  width: 3px;
  border-radius: 2px;
  background: var(--accent-call);
}
.about__stat-value {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: clamp(3rem, calc(2.4rem + 1.4vw), 4rem);
  line-height: 1;
  letter-spacing: -0.02em;
  color: var(--accent-call);
}
.about__stat-label {
  margin: 0.8rem 0 0;
  font-family: var(--font-body);
  font-size: 1.5rem;
  line-height: 1.35;
  color: color-mix(in oklch, var(--text-ondeep) 78%, transparent);
}

/* Recit. */
.about__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 1.1rem;
  margin-bottom: 1.6rem;
  color: var(--text-muted);
}
.about__tick {
  display: inline-block;
  width: 2.6rem;
  height: 3px;
  border-radius: 2px;
  background: var(--accent-call);
}
.about__heading {
  max-width: 18ch;
}
.about__body {
  margin-top: var(--space-title-lead);
  display: flex;
  flex-direction: column;
  gap: 1.8rem;
  max-width: 52ch;
}

@container site (min-width: 640px) {
  .about__stats {
    /* Au-dela du mobile, la carte se resserre et se decale vers la droite,
     * franchement en chevauchement sur la photo. */
    margin-top: -4rem;
    margin-inline: 3.2rem 0;
  }
}

@container site (min-width: 1024px) {
  .about__layout {
    column-gap: 2rem;
  }
  /* Media-texte asymetrique cale sur 16 pistes: photo a gauche (cols 1-9, large),
   * recit a droite (cols 11-16, mesure plus etroite), col 10 en gouttiere. */
  .about__media {
    grid-column: 1 / span 9;
  }
  .about__copy {
    grid-column: 11 / -1;
  }
  /* La carte de chiffres deborde sous la photo et mord sur la gouttiere, vers le
   * recit (le chevauchement devient une vraie superposition de plans). */
  .about__stats {
    margin-top: -5.6rem;
    margin-inline: 4.8rem -4rem;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 2.4rem 2rem;
    padding: 3.2rem 3.6rem;
  }
  .about__stat-label {
    max-width: 14ch;
  }
}
</style>
