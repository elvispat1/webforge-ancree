<script setup lang="ts">
/* Détail d'un projet (étude de cas). Héros detail + galerie + défi/solution/
 * résultat + chiffres + témoignage du client + projets similaires + bande CTA. */
import PageBuilder from '~/components/page-builder/regular/index.vue'
import { breadcrumbsFor } from '~/config/route-map'
import type { WfLocale } from '~/sanity/transform'
import type { HeroDetailBlock } from '~/types/blocks'

definePageMeta({ layout: 'default' })

const route = useRoute()
const locale = useWfLocale()
// Composable appelé inconditionnellement en setup (avant le 404 possible).
const setI18nParams = useSetI18nParams()

const slug = String(route.params.slug)
const maybeProject = useProject(slug)
if (!maybeProject) {
  throw createError({ statusCode: 404, statusMessage: 'Projet introuvable', fatal: true })
}

// setI18nParams (T2b): slug équivalent de chaque langue (doc.translations du
// payload), pour que switchLocalePath et les hreflang du module pointent le
// détail traduit. Doc sans traduction: repli sur le même slug (alternate
// dégradé acceptable, démo noindex). Logique setup-once: snapshot validé.
const slugFor = (lang: WfLocale): string =>
  maybeProject.translations?.find((t) => t.lang === lang)?.slug ?? maybeProject.slug
setI18nParams({ fr: { slug: slugFor('fr') }, en: { slug: slugFor('en') } })

const breadcrumbs = breadcrumbsFor('projects', { label: maybeProject.title }, locale)

usePageSeo({
  title: maybeProject.title,
  description: maybeProject.excerpt,
  image: maybeProject.cover.src,
  webPageType: 'ItemPage',
  breadcrumbs
})

// Rendu réactif: suit les éditions live du projet courant; repli sur le snapshot.
// Le template auto-unwrap ces computed.
const project = computed(() => useProject(slug) ?? maybeProject)
// En-tête de la galerie: copie de détail portée par CE document projet
// (project.detail, spec 6.11 et 12.16). detail FULL garanti: page rendue
// uniquement pour l'item courant.
const galleryHeading = computed(() => project.value.detail!.gallery.heading)
const blocks = computed(() => useProjectBlocks(project.value))

// Héros « detail » composé depuis le document projet (pas saisi au CMS): même
// donnée qu'avant, rendue via l'orchestrateur.
const heroBlock = computed<HeroDetailBlock>(() => ({
  _type: 'hero-detail',
  _key: `hero-${project.value.slug}`,
  title: project.value.title,
  lead: project.value.excerpt,
  meta: [project.value.location, project.value.year],
  image: project.value.cover
}))
</script>

<template>
  <Hero :hero="heroBlock" :breadcrumbs="breadcrumbs" />

  <section v-if="project.gallery.length" class="wf-section">
    <div class="wf-container">
      <MediaGallery :images="project.gallery" :heading="galleryHeading" />
    </div>
  </section>

  <PageBuilder :blocks="blocks" reveal />
</template>
