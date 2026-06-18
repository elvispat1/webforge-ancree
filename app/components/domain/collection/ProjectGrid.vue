<script setup lang="ts">
// Grille de projets (page /projets). Reçoit la collection déjà résolue (props.projects)
// et la rend telle quelle: galerie à plat, sans filtre usager. La relation
// project.service sert au maillage interne (projets liés sur les pages service,
// projets similaires sur les détails) et au surtitre de carte (libellé résolu).
//
// La carte est le composant partagé <ProjectCard> (même carte que le bloc
// projects-preview du page builder); la grille (colonnes, gouttières) reste
// propre à cette page (.wf-project-grid-list).
//
// En V2 Sanity, la signature ne bouge pas: la page requête la collection au build
// et la passe en props. Le composant reste une vue pure sur des données fournies.

import type { Project } from '~/content/projects'

const projectGrid = withDefaults(defineProps<{
  projects: Project[]
  /** Niveau de titre des cartes (h2..h6). 2 quand la grille vit directement sous
   *  le h1 du héros (page /projets), pour une hiérarchie de titres sans saut. */
  headingLevel?: 2 | 3 | 4 | 5 | 6
}>(), {
  headingLevel: 3
})

// Relation résolue en titre affichable (le slug brut ne sort jamais à l'écran),
// même résolution que l'assembleur projectsPreviewBlock de usePageBlocks.
function serviceLabel(p: Project): string {
  return useService(p.service)?.title ?? p.service
}
</script>

<template>
  <section class="wf-section wf-project-grid" id="projects">
    <div class="wf-container">
      <!-- Grille de cartes. Chaque carte garde sa clé stable (slug). La première
           rangée (3 cartes au palier large) charge en eager: la grille vit
           directement sous le héros compact, above-the-fold en desktop. -->
      <ul class="wf-project-grid-list" data-reveal-stagger>
        <ProjectCard
          v-for="(p, i) in projectGrid.projects"
          :key="p.slug"
          :slug="p.slug"
          :title="p.title"
          :excerpt="p.excerpt"
          :service="serviceLabel(p)"
          :cover="p.cover"
          :heading-level="projectGrid.headingLevel"
          :loading="i < 3 ? 'eager' : 'lazy'"
        />
      </ul>
    </div>
  </section>
</template>
