<script setup lang="ts">
/* Équipe: une grille de cartes portrait, le visage de l'autorité. Chaque carte
 * pose un portrait (ratio portrait, ombre chaude, coin ambre signé comme la photo
 * du bloc « à propos »), puis le nom en slab, le rôle en accent, les certifications
 * amorcées d'une languette ambre (le geste « ancré au sol »), et une bio sobre.
 * Forme volontairement distincte des grilles de tuiles (processus, points forts) et
 * de la mosaïque de cartes (services): ici des cartes hautes, portrait en tête. Base
 * blanche; la matière vient de l'ombre et des accents, jamais d'un fond crème.
 * Le fond peint tout de suite (PageBuilder enveloppe déjà le bloc dans v-reveal). */
import type { BlockBase } from '~/types/blocks'
import type { TeamContent } from '~/content/team'

const props = defineProps<BlockBase<'team'> & TeamContent>()

const hasHead = computed(() => Boolean(props.heading || props.eyebrow))
</script>

<template>
  <section class="team">
    <div class="wf-container">
      <div v-if="hasHead" class="team__head">
        <SectionHead :eyebrow="eyebrow" :heading="heading || ''" />
        <p v-if="lead" class="team__lead wf-body-1 wf-text-muted">{{ lead }}</p>
      </div>

      <ul
        class="team__grid"
        :class="{ 'team__grid--headed': hasHead }"
        data-reveal-stagger
      >
        <li v-for="member in members" :key="member.name" class="team__member">
          <figure class="team__figure">
            <Image
              :src="member.photo.src"
              :alt="member.photo.alt"
              :ratio="'var(--ratio-portrait)'"
              sizes="xs:100vw sm:50vw md:33vw lg:33vw xl:33vw xxl:33vw"
              tone="base"
            />
            <span class="team__corner" aria-hidden="true" />
          </figure>

          <div class="team__body">
            <h3 class="team__name wf-h4">{{ member.name }}</h3>
            <p class="team__role wf-body-3">{{ member.role }}</p>
            <p v-if="member.credentials" class="team__credentials wf-caption">
              <span class="team__tick" aria-hidden="true" />{{ member.credentials }}
            </p>
            <p v-if="member.bio" class="team__bio wf-body-2 wf-text-muted">{{ member.bio }}</p>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.team {
  padding-block: var(--space-block-default);
  background: var(--bg-base);
}
.team__lead {
  margin: var(--space-title-lead) 0 0;
  max-width: 52ch;
}

/* Grille de cartes: empilée au mobile, deux puis trois colonnes. */
.team__grid {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  grid-template-columns: 1fr;
  gap: clamp(3.2rem, 5vw, 5.6rem) clamp(2.4rem, 4vw, 4rem);
}
.team__grid--headed {
  margin-top: var(--space-head-content);
}
.team__member {
  display: flex;
  flex-direction: column;
}

/* Portrait posé: coins arrondis, ombre chaude, languette ambre au coin bas-gauche
 * (même signature « ancré au sol » que la photo du bloc à propos). */
.team__figure {
  position: relative;
  margin: 0;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--elev-high);
}
.team__corner {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 5rem;
  height: 0.6rem;
  background: var(--accent-call);
  border-top-right-radius: 2px;
}

.team__body {
  margin-top: 2rem;
}
.team__name {
  margin: 0;
  color: var(--text-base);
}
.team__role {
  margin: 0.6rem 0 0;
  color: var(--accent-trust);
  font-weight: 600;
}
.team__credentials {
  display: inline-flex;
  align-items: baseline;
  gap: 1.1rem;
  margin: 1.2rem 0 0;
  color: var(--text-muted);
}
.team__tick {
  flex: none;
  align-self: center;
  display: inline-block;
  width: 2.2rem;
  height: 3px;
  border-radius: 2px;
  background: var(--accent-call);
}
.team__bio {
  margin: 1.2rem 0 0;
  max-width: 42ch;
}

@container site (min-width: 640px) {
  .team__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@container site (min-width: 1024px) {
  .team__grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
