<script setup lang="ts">
/* A propos: media-texte en ZIGZAG, signature Ancree. Une grande photo d'equipe
 * ancree a gauche (cols 1-9, large), le recit a droite (cols 11-16, mesure plus
 * etroite), col 10 en gouttiere: asymetrie posee, jamais un 6/6 sage. Empile au
 * mobile. La photo n'est pas un rectangle sage de plus: une carte de
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
        <div class="about__media wf-col-full wf-span-9" data-reveal>
          <figure class="about__figure">
            <Image
              :src="photo.src"
              :alt="photo.alt"
              sizes="xs:100vw sm:100vw md:50vw lg:50vw xl:50vw xxl:50vw"
              tone="base"
            />
            <span class="about__corner" aria-hidden="true" />
          </figure>

          <dl class="about__stats" data-reveal-stagger>
            <div v-for="stat in stats" :key="stat.label" class="about__stat">
              <!-- Semantique correcte: le qualificatif est le terme (dt), la valeur
                   sa description (dd). L'ordre visuel (valeur au-dessus du libelle)
                   est retabli par CSS (order), pas par l'ordre du markup. -->
              <dt class="about__stat-label wf-body-3">{{ stat.label }}</dt>
              <dd class="about__stat-value">{{ stat.value }}</dd>
            </div>
          </dl>
        </div>

        <!-- Recit. -->
        <div class="about__copy wf-col-full wf-from-11 wf-to-end" data-reveal-stagger>
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
  /* Markup dt(libelle) -> dd(valeur) pour la semantique; on retablit l'ordre
   * visuel (valeur en haut, libelle en bas) sans toucher au DOM. */
  display: flex;
  flex-direction: column;
}
/* Valeur: gros chiffre graphique signature (DESIGN.md: « display lourd »). Echelle
 * propre, plus marquee que wf-h3, assumee comme element graphique (pas un titre de
 * corps). order: 0 la garde en haut de l'empilement. */
.about__stat-value {
  order: 0;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: clamp(3rem, calc(2.4rem + 1.4vw), 4rem);
  line-height: 1;
  letter-spacing: -0.02em;
  color: var(--accent-call);
}
/* Libelle: echelle de corps portee par wf-body-3 (sur l'element). On garde la
 * couleur sur fond sombre (differe du wf-body-3 de base) et l'ecart a la valeur. */
.about__stat-label {
  order: 1;
  margin: 0.8rem 0 0;
  color: color-mix(in oklch, var(--text-ondeep) 78%, transparent);
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
  /* Media-texte asymetrique cale sur 16 pistes: photo a gauche (cols 1-9, large),
   * recit a droite (cols 11-16, mesure plus etroite), col 10 en gouttiere.
   * Le placement nomme est porte par les utilitaires dans le template
   * (wf-col-full wf-span-9 / wf-col-full wf-from-11 wf-to-end). */
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
