<script setup lang="ts">
/* Projets (collection). Héros de page + grille filtrable (rendue au niveau page,
 * pilotée par la collection) + bande CTA. Inspirer et prouver. */
import PageBuilder from '~/components/page-builder/regular/index.vue'
import { breadcrumbsFor } from '~/config/route-map'

definePageMeta({ layout: 'default' })

const locale = useWfLocale()
const hero = usePageHero('projects')
const breadcrumbs = breadcrumbsFor('projects', undefined, locale)
// SEO du document projectsPage (payload, par locale; replis 12.10 au transform).
const seo = useFixedPage('projects').seo

usePageSeo({
  title: seo.title,
  description: seo.description,
  image: hero.value.image?.src,
  webPageType: 'CollectionPage',
  breadcrumbs
})

// computed: la grille de projets se met à jour in-place en preview (useProjects
// reste plain, mais appelé dans ce computed sa lecture du payload est suivie).
const projects = computed(() => useProjects())
const blocks = useProjectsPageBlocks()
</script>

<template>
  <Hero :hero="hero" :breadcrumbs="breadcrumbs" />

  <!-- ProjectGrid porte sa propre .wf-section + .wf-container: pas de wrapper ici
       (sinon double padding de section, ~160px de vide sous le héros). Cartes en
       h2: la grille vit directement sous le h1 du héros (pas de saut h1 -> h3). -->
  <ProjectGrid :projects="projects" :heading-level="2" />

  <PageBuilder :blocks="blocks" reveal />
</template>
