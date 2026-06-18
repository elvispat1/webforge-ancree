<script setup lang="ts">
// Pagination d'articles (pages liste/archive du blog).
//
// Rend une nav sobre: lien Précédent, suite de liens numérotés, lien Suivant.
// L'URL d'une page suit le schéma strict du blog: la page 1 vit sur basePath
// nu, les pages suivantes sous basePath/page/N. Le composant ne connaît pas la
// route courante: il dérive tout de `page`, `totalPages` et `basePath`.
//
// Liens internes via <NuxtLink :to> pour rester crawlables au prérendu statique
// (les pages d'archive paginées sont listées dans nitro.prerender.routes, mais
// les liens crawlables sécurisent la découverte). Le maillon actif n'est pas un
// lien: c'est un <span aria-current="page"> (page courante non cliquable).

const { t } = useI18n()

const pagination = defineProps<{
  /** Page courante (1-indexée). */
  page: number
  /** Nombre total de pages. */
  totalPages: number
  /** Racine de la collection paginée, ex '/blog' ou '/blog/le-bois'. */
  basePath: string
}>()

/** URL d'une page: page 1 = basePath nu; page N>1 = basePath/page/N. */
function hrefFor(n: number): string {
  return n === 1 ? pagination.basePath : `${pagination.basePath}/page/${n}`
}

/** Liste des numéros de page à rendre (1..totalPages, dense). */
const pages = computed(() =>
  Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
)

const hasPrev = computed(() => pagination.page > 1)
const hasNext = computed(() => pagination.page < pagination.totalPages)
</script>

<template>
  <!-- Masqué entièrement s'il n'y a qu'une page (ou moins): rien à paginer. -->
  <nav
    v-if="totalPages > 1"
    class="wf-pagination"
    :aria-label="t('a11y.pagination')"
  >
    <!-- Précédent: présent seulement si une page le précède. -->
    <NuxtLink
      v-if="hasPrev"
      :to="hrefFor(page - 1)"
      class="wf-pagination-edge wf-pagination-prev"
      :aria-label="t('a11y.previous_page')"
    >
      <Icon name="lucide:chevron-left" class="wf-pagination-chevron" aria-hidden="true" />
      <span class="wf-pagination-edge-label">{{ t('a11y.previous_page') }}</span>
    </NuxtLink>
    <!-- Cale gauche quand Précédent est absent: garde les numéros centrés. -->
    <span v-else class="wf-pagination-edge wf-pagination-spacer" aria-hidden="true" />

    <ol class="wf-pagination-list">
      <li v-for="n in pages" :key="n" class="wf-pagination-item">
        <!-- Page courante: non cliquable, marquée aria-current. -->
        <span
          v-if="n === page"
          class="wf-pagination-num is-current"
          aria-current="page"
        >{{ n }}</span>
        <NuxtLink
          v-else
          :to="hrefFor(n)"
          class="wf-pagination-num"
        >{{ n }}</NuxtLink>
      </li>
    </ol>

    <!-- Suivant: présent seulement s'il reste une page après. -->
    <NuxtLink
      v-if="hasNext"
      :to="hrefFor(page + 1)"
      class="wf-pagination-edge wf-pagination-next"
      :aria-label="t('a11y.next_page')"
    >
      <span class="wf-pagination-edge-label">{{ t('a11y.next_page') }}</span>
      <Icon name="lucide:chevron-right" class="wf-pagination-chevron" aria-hidden="true" />
    </NuxtLink>
    <!-- Cale droite quand Suivant est absent: équilibre la rangée. -->
    <span v-else class="wf-pagination-edge wf-pagination-spacer" aria-hidden="true" />
  </nav>
</template>
