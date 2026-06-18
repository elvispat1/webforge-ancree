<script setup lang="ts">
import type { BlockBase } from '~/types/blocks'
import type { ProjectsPreviewContent } from '~/content/projects-preview'
// Typé contre BlockBase + le contenu étalé. Le type discriminé ProjectsPreviewBlock
// sera promu dans types/blocks.ts à l'intégration.
const projectsPreview = defineProps<BlockBase<'projects-preview'> & ProjectsPreviewContent>()
</script>

<template>
  <section class="wf-section wf-projects-preview">
    <div class="wf-container">
      <SectionHead
        :eyebrow="projectsPreview.eyebrow"
        :heading="projectsPreview.heading"
        :lead="projectsPreview.lead"
        :ctas="projectsPreview.ctaHref && projectsPreview.ctaLabel ? [{ label: projectsPreview.ctaLabel, href: projectsPreview.ctaHref }] : []"
      />

      <!-- Grille de cartes teaser. Chaque carte = <ProjectCard> (carte partagée
           avec la grille /projets) qui mène au détail /projets/[slug] (maillage
           interne). data-reveal-stagger révèle les cartes en cascade. -->
      <ul class="wf-projects-preview-grid" data-reveal-stagger>
        <ProjectCard
          v-for="item in projectsPreview.items"
          :key="item.slug"
          :slug="item.slug"
          :title="item.title"
          :excerpt="item.excerpt"
          :service="item.service"
          :cover="item.cover"
        />
      </ul>
    </div>
  </section>
</template>
