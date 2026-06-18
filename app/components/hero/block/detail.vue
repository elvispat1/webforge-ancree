<script setup lang="ts">
// Héros « detail »: pages détail service et projet. Imposé par la page.
// Composition éditoriale: fil d'Ariane épinglé en haut à gauche (position stable
// d'une page niveau 2 à l'autre), titre + description + méta ancrés en bas à
// gauche, image phare pleine hauteur à droite (haut aligné au fil d'Ariane).
// Ordre DOM: texte avant image; placement en colonnes via CSS.
import type { Crumb } from '~/config/route-map'
import type { HeroDetailBlock } from '~/types/blocks'

withDefaults(defineProps<HeroDetailBlock & { breadcrumbs?: Crumb[] }>(), {
  breadcrumbs: () => [],
  lead: undefined,
  meta: () => []
})

const heroRef = ref<HTMLElement | null>(null)
useEntrance(heroRef)
</script>

<template>
  <section ref="heroRef" class="wf-hero wf-hero-detail">
    <div class="wf-container">
      <div class="section-grid wf-hero-detail-grid">
        <div class="wf-hero-detail-text">
          <Breadcrumbs v-if="breadcrumbs.length" :items="breadcrumbs" class="wf-hero-breadcrumb" data-reveal />
          <div class="wf-hero-detail-body" data-reveal-stagger>
            <h1 class="wf-h1">{{ title }}</h1>
            <p v-if="lead" class="wf-body-1 wf-text-muted wf-hero-detail-lead">{{ lead }}</p>
            <ul v-if="meta.length" class="wf-hero-detail-meta">
              <li v-for="(m, i) in meta" :key="i" class="wf-body-2 wf-text-muted">{{ m }}</li>
            </ul>
          </div>
        </div>

        <figure class="wf-hero-detail-visual" data-reveal>
          <Image
            :src="image.src"
            :alt="image.alt"
            :ratio="image.ratio"
            :label="image.label"
            :caption="image.caption"
            sizes="sm:100vw md:100vw lg:58vw xl:58vw xxl:58vw"
            loading="eager"
            fetchpriority="high"
            decoding="sync"
            tone="base"
          />
        </figure>
      </div>
    </div>
  </section>
</template>
