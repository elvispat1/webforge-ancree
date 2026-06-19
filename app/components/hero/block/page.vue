<script setup lang="ts">
// Héros « page »: pages de niveau 2 (services, projets, à propos, blog, faq,
// contact). Imposé par la page, hors page-builder. Composition « masthead »: tête
// éditoriale (fil d'Ariane épinglé en haut à gauche, position stable d'une page
// niveau 2 à l'autre; titre; intro; CTA optionnel) puis image de couverture pleine
// largeur EN DESSOUS. Silhouette volontairement distincte du héros détail (split
// texte/image), pour que l'index ne se confonde pas avec la fiche. L'image est
// OPTIONNELLE: sans elle (faq, contact), la tête seule, Minimaliste pur. Entrée au
// chargement.
import type { Crumb } from '~/config/route-map'
import type { HeroPageBlock } from '~/types/blocks'

withDefaults(defineProps<HeroPageBlock & { breadcrumbs?: Crumb[] }>(), {
  lead: undefined,
  breadcrumbs: () => [],
  cta: undefined,
  image: undefined
})

const heroRef = ref<HTMLElement | null>(null)
useEntrance(heroRef)
</script>

<template>
  <section ref="heroRef" class="wf-hero wf-hero-page">
    <div class="wf-container">
      <div class="section-grid">
        <div class="wf-hero-page-head" data-reveal-stagger>
          <Breadcrumbs v-if="breadcrumbs.length" :items="breadcrumbs" class="wf-hero-breadcrumb" />
          <h1 class="wf-h1">{{ title }}</h1>
          <p v-if="lead" class="wf-body-1 wf-text-muted wf-hero-page-lead">{{ lead }}</p>
          <div v-if="cta" class="wf-hero-page-cta">
            <Button :href="cta.href" kind="internal" icon="lucide:chevron-right">{{ cta.label }}</Button>
          </div>
        </div>
      </div>

      <figure v-if="image" class="wf-hero-page-cover" data-reveal>
        <Image
          :src="image.src"
          :alt="image.alt"
          :ratio="image.ratio"
          :label="image.label"
          :caption="image.caption"
          sizes="sm:100vw md:100vw lg:100vw xl:100vw xxl:100vw"
          loading="eager"
          fetchpriority="high"
          decoding="sync"
          tone="base"
        />
      </figure>
    </div>
  </section>
</template>
