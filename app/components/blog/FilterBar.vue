<script setup lang="ts">
/* Filtre du blog, base sur l'URL (chaque option est un lien crawlable vers une
 * archive de categorie, jamais un etat client). Une seule categorie a la fois.
 * « Tous les sujets » ramene a /blog. L'option active porte aria-current. */
import type { CategoryContent } from '~/content/blog'
import { routePath, type Locale } from '~/config/route-map'

const props = defineProps<{ categories: CategoryContent[]; activeSlug?: string }>()

const { locale, t } = useI18n()
const loc = computed(() => locale.value as Locale)
const allHref = computed(() => routePath('blog', loc.value))
</script>

<template>
  <nav class="filterbar" :aria-label="t('a11y.category_filter')">
    <ul class="filterbar__list">
      <li>
        <NuxtLink
          :to="allHref"
          class="filterbar__pill"
          :class="{ 'filterbar__pill--active': !props.activeSlug }"
          :aria-current="!props.activeSlug ? 'page' : undefined"
        >
          {{ t('ui.blog.all') }}
        </NuxtLink>
      </li>
      <li v-for="cat in categories" :key="cat.slug">
        <NuxtLink
          :to="categoryHref(cat.slug, loc)"
          class="filterbar__pill"
          :class="{ 'filterbar__pill--active': props.activeSlug === cat.slug }"
          :aria-current="props.activeSlug === cat.slug ? 'page' : undefined"
        >
          {{ cat.title }}
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.filterbar__list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}
.filterbar__pill {
  display: inline-flex;
  align-items: center;
  padding: 0.9rem 1.8rem;
  border-radius: var(--radius-pill);
  background: var(--bg-lift);
  box-shadow:
    var(--elev-flush),
    inset 0 0 0 var(--line-width) color-mix(in oklch, var(--text-base) 14%, transparent);
  color: var(--text-base);
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 1.5rem;
  text-decoration: none;
  transition:
    background-color var(--motion-duration-hover) var(--motion-ease-settle),
    color var(--motion-duration-hover) var(--motion-ease-settle),
    box-shadow var(--motion-duration-hover) var(--motion-ease-settle);
}
.filterbar__pill:hover {
  box-shadow:
    var(--elev-flush),
    inset 0 0 0 var(--line-width) color-mix(in oklch, var(--text-base) 30%, transparent);
}
.filterbar__pill--active,
.filterbar__pill--active:hover {
  background: var(--bg-deep);
  color: var(--text-ondeep);
  box-shadow: var(--elev-low);
}
</style>
