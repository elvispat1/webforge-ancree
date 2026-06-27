<script setup lang="ts">
/* Filtre du blog, base sur l'URL (chaque option est un lien crawlable vers une
 * archive de categorie, jamais un etat client). Une seule categorie a la fois.
 * « Tous les sujets » ramene a /blog. L'option active porte aria-current. */
import type { Category } from '~/content/categories'
import { routePath, type Locale } from '~/config/route-map'

const props = defineProps<{ categories: Category[]; activeSlug?: string }>()

const { locale, t } = useI18n()
const loc = computed(() => locale.value as Locale)
const allHref = computed(() => routePath('blog', loc.value))

/* Rail défilant: sur une page de catégorie au mobile, l'option active peut être hors
 * du cadre visible. On la ramène dans le rail (défilement horizontal du rail SEUL,
 * jamais de la page). Progressif: sans JS, le rail reste défilable à la main. */
const listRef = ref<HTMLElement | null>(null)
onMounted(() => {
  const list = listRef.value
  if (!list || list.scrollWidth <= list.clientWidth) return
  const active = list.querySelector<HTMLElement>('.filterbar__pill--active')
  if (!active) return
  const lr = list.getBoundingClientRect()
  const ar = active.getBoundingClientRect()
  // Aligne l'active sur la mesure du contenu (gouttière), pas sur le bord de fuite.
  const pad = parseFloat(getComputedStyle(list).scrollPaddingLeft) || 16
  if (ar.left < lr.left + pad || ar.right > lr.right) list.scrollLeft += ar.left - lr.left - pad
})
</script>

<template>
  <nav class="filterbar" :aria-label="t('a11y.category_filter')">
    <ul ref="listRef" class="filterbar__list">
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
/* Un seul rang qui défile horizontalement quand les pastilles dépassent la mesure
 * (mobile): disposition nette et identique à toute largeur, jamais d'enroulement en
 * escalier. Quand tout tient (desktop), aucun défilement, rang aligné à gauche.
 *
 * Pleine fuite: le rail déborde jusqu'au bord du conteneur (margin-inline négatif =
 * gouttière de page) et se re-cale sur la mesure du contenu (padding-inline =
 * gouttière). Les pastilles entrent et sortent au bord de l'écran, pas rognées à
 * l'intérieur de la marge. La 1re pastille reste alignée sur le contenu.
 *
 * padding/margin-block: laisse respirer l'ombre des pastilles sans qu'overflow-x ne
 * la rogne verticalement. Barre de défilement masquée; la pastille suivante qui
 * dépasse (peek) signale qu'on peut faire défiler. */
.filterbar__list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-wrap: nowrap;
  gap: 1rem;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  scroll-snap-type: x proximity;
  scroll-padding-inline: var(--wf-pad-inline, 0px);
  scrollbar-width: none;
  padding-block: 1.2rem;
  padding-inline: var(--wf-pad-inline, 0px);
  margin-block: -1.2rem;
  margin-inline: calc(-1 * var(--wf-pad-inline, 0px));
}
.filterbar__list::-webkit-scrollbar {
  display: none;
}
.filterbar__pill {
  display: inline-flex;
  flex: none;
  scroll-snap-align: start;
  white-space: nowrap;
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
