<script setup lang="ts">
/* Rangee de CTA en bas de bloc, collee a la marge droite. Sortie de <SectionHead>
 * le 25 juin: le couple lead+bouton ne vit plus en aside a droite de la tete (il
 * se decalait de la grille du corps). Le bouton « voir tout » descend ici, apres
 * la mosaique, ou il colle toujours la marge droite (s'aligne au bord, jamais
 * decale d'une piste). Geste plus logique aussi: on parcourt les cartes, puis
 * « voir tout ». */
import type { SectionCta } from '~/content/blocks'

defineProps<{ ctas: SectionCta[] }>()

function ctaKind(href: string): 'internal' | 'external' | 'anchor' {
  if (href.startsWith('#') || href.startsWith('tel:') || href.startsWith('mailto:')) return 'anchor'
  if (href.startsWith('http')) return 'external'
  return 'internal'
}
</script>

<template>
  <div v-if="ctas.length" class="scta" data-reveal>
    <Button
      v-for="(cta, i) in ctas"
      :key="cta.href"
      :href="cta.href"
      :kind="ctaKind(cta.href)"
      :variant="i === 0 ? 'primary' : 'ghost'"
      :icon="i === 0 ? 'lucide:arrow-right' : false"
    >
      {{ cta.label }}
    </Button>
  </div>
</template>

<style scoped>
.scta {
  margin-top: var(--space-head-content);
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 1.2rem;
}
</style>
