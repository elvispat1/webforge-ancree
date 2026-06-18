<script setup lang="ts">
// Galerie d'images page-level (détail de projet). Le parent fournit la
// <section class="wf-section"><div class="wf-container">; ce composant rend
// uniquement l'en-tête optionnel et la grille de figures, jamais son propre
// wrapper de section. Container queries @container site uniquement: il vit
// DANS .wf-site.
//
// Chaque entrée alimente une <Image> (jamais <img>): src réel ou placeholder
// élégant si absent (mode démo). figure + figcaption = structure sémantique
// correcte pour une image légendée.

interface GalleryImage {
  /** Ratio CSS de l'image (ex: '4/3', '3/4', '16/9'). */
  ratio: string
  /** URL de l'image. Absent = placeholder visuel. */
  src?: string
  /** Texte alternatif (vide si décoratif). */
  alt: string
  /** Texte ARIA en mode placeholder. */
  label: string
  /** Légende visible sous l'image. */
  caption: string
}

defineProps<{
  images: GalleryImage[]
  /** Titre optionnel posé en h2 dans un wf-section-head. */
  heading?: string
}>()
</script>

<template>
  <!-- En-tête optionnel: rendu seulement si un heading est fourni. -->
  <header v-if="heading" class="wf-section-head wf-media-gallery-head" data-reveal>
    <h2 class="wf-h2">{{ heading }}</h2>
  </header>

  <!-- Grille de figures: 1 col par défaut, 2 cols à partir d'un seuil container. -->
  <div class="wf-media-gallery-grid" data-reveal-stagger>
    <figure
      v-for="(img, i) in images"
      :key="i"
      class="wf-media-gallery-figure"
    >
      <Image
        :src="img.src"
        :alt="img.alt"
        :ratio="img.ratio"
        :label="img.label"
        :caption="img.caption"
        sizes="sm:100vw md:50vw lg:50vw xl:50vw xxl:50vw"
        tone="base"
      />
      <figcaption class="wf-figcap">{{ img.caption }}</figcaption>
    </figure>
  </div>
</template>
