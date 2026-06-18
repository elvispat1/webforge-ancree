<script setup lang="ts">
// Héros « article »: en-tête éditorial d'un article de blog. Imposé par la page.
// Fil d'Ariane + catégorie (lien) + titre + méta (date, auteur, temps de lecture),
// puis image de couverture pleine largeur. Schema.org Article/BreadcrumbList est
// posé par la page; ici, le balisage temps via <time datetime>.
import type { Crumb } from '~/config/route-map'
import type { HeroArticleBlock } from '~/types/blocks'

withDefaults(defineProps<HeroArticleBlock & { breadcrumbs?: Crumb[] }>(), {
  breadcrumbs: () => [],
  category: undefined
})

const { t } = useI18n()
// Locale courante pour le formatage de date (MAJ-08): date EN sur /en/blog.
const locale = useWfLocale()
const heroRef = ref<HTMLElement | null>(null)
useEntrance(heroRef)
</script>

<template>
  <section ref="heroRef" class="wf-hero wf-hero-article">
    <div class="wf-container">
      <div class="wf-hero-article-head" data-reveal-stagger>
        <Breadcrumbs v-if="breadcrumbs.length" :items="breadcrumbs" />
        <NuxtLink
          v-if="category"
          :to="category.to"
          class="wf-caption wf-hero-article-cat"
        >{{ category.label }}</NuxtLink>
        <h1 class="wf-h1">{{ title }}</h1>
        <ul class="wf-hero-article-meta">
          <li class="wf-body-3"><time :datetime="date">{{ formatDate(date, locale) }}</time></li>
          <li class="wf-body-3">{{ author }}</li>
          <li class="wf-body-3">{{ t('ui.blog.reading_time', { minutes: readingTime }) }}</li>
        </ul>
      </div>

      <figure class="wf-hero-article-cover" data-reveal>
        <Image
          :src="cover.src"
          :alt="cover.alt"
          :ratio="cover.ratio"
          :label="cover.label"
          :caption="cover.caption"
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
