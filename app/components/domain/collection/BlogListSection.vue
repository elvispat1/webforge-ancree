<script setup lang="ts">
// Section de liste d'articles réutilisée par /blog, /blog/page/[n] et les archives
// de catégorie: barre de filtre (FilterBar, route-based, SEO) + grille d'articles +
// pagination. Factorise le rendu pour ne pas le dupliquer entre les routes.
//
// Vue PURE sur des données fournies (même contrat que ProjectGrid): la page
// requête les collections au build (useArticles, useBlogFilterOptions) et passe
// tout en props. Aucun import de contenu ni requête ici — la signature ne bouge
// pas au swap Sanity V2.
import type { BlogFilterOption } from '~/composables/useBlogFilterOptions'

interface ArticleCard {
  title: string
  excerpt: string
  href: string
  date: string
  category?: string
  cover: { ratio: string; src?: string; alt: string; label: string; caption: string }
}

const props = defineProps<{
  cards: ArticleCard[]
  page: number
  totalPages: number
  basePath: string
  /** Nombre total d'articles de la vue courante (compteur de la barre de filtre). */
  total: number
  /** Options de la barre de filtre, calculées par la page (useBlogFilterOptions). */
  filterOptions: BlogFilterOption[]
  /** Slug de catégorie active (archive); absent = « Tous » (liste complète). */
  activeCategory?: string
  /** Niveau de titre des cartes (h2..h6), transmis à la grille. 2 quand la liste
   *  vit directement sous le h1 du héros (toutes les routes /blog actuelles). */
  headingLevel?: 2 | 3 | 4 | 5 | 6
}>()

const activeSlug = computed(() => props.activeCategory ?? 'all')
</script>

<template>
  <section id="blog-list" class="wf-section">
    <div class="wf-container">
      <FilterBar
        :options="filterOptions"
        :active="activeSlug"
        :total="total"
        count-key="ui.filter.count_articles"
      />

      <ArticleGrid :articles="cards" :heading-level="headingLevel" />

      <Pagination :page="page" :total-pages="totalPages" :base-path="basePath" />
    </div>
  </section>
</template>
