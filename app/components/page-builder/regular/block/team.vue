<script setup lang="ts">
/* Équipe: les visages de l'autorité. Une rangée de portraits posés (coins
 * arrondis, ombre chaude: la matière d'Ancrée), puis une hiérarchie typographique
 * nette, sans accent décoratif: nom en slab, rôle en bleu confiance, certifications
 * en micro-libellé sobre, bio muette. Pas de pastille ni de tiret ambre. La grille
 * se remplit d'elle-même (auto-fit) pour rester équilibrée quel que soit le nombre
 * de membres. Le fond peint tout de suite (PageBuilder enveloppe déjà le bloc dans
 * v-reveal). */
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
              sizes="xs:100vw sm:50vw md:33vw lg:25vw xl:25vw xxl:25vw"
              tone="base"
            />
          </figure>

          <div class="team__body">
            <h3 class="team__name wf-h4">{{ member.name }}</h3>
            <p class="team__role">{{ member.role }}</p>
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

/* Rangée de portraits qui se remplit d'elle-même: pas de 3+1 bancal, les colonnes
 * s'ajustent au nombre de membres et à la largeur. */
.team__grid {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
  gap: clamp(2.8rem, 4vw, 4.4rem) clamp(2rem, 3vw, 3.2rem);
}
.team__grid--headed {
  margin-top: var(--space-head-content);
}
.team__member {
  display: flex;
  flex-direction: column;
}

/* Portrait posé: coins arrondis, ombre chaude (la matière d'Ancrée). Aucun accent
 * décoratif appliqué dessus. */
.team__figure {
  margin: 0;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--elev-high);
}

.team__body {
  margin-top: 1.8rem;
}
.team__name {
  margin: 0;
  color: var(--text-base);
}
/* Rôle: réserve deux lignes pour que la bio démarre à la même hauteur d'une carte
 * à l'autre, que le rôle tienne sur une ou deux lignes. */
.team__role {
  margin: 0.4rem 0 0;
  min-height: 2lh;
  color: var(--accent-trust);
  font-weight: 600;
}
.team__bio {
  margin: 1.2rem 0 0;
  max-width: 42ch;
}
</style>
