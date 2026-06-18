<script setup lang="ts">
// Bloc d'article « gallery » (_type "gallery"): grille de figures dans la colonne
// de mesure de lecture. Une figure par image (forme ArticleImage, cf.
// content/article-blocks.ts), chacune avec sa légende. La grille passe de 1 à 2
// colonnes au seuil container @container site (min-width: 500px).
//
// Typé contre le bloc discriminé (ArticleGalleryBlock = BlockBase<'gallery'> &
// ArticleGalleryContent), même mécanique que les blocs réguliers. _type et _key
// déclarés en props pour éviter le fallthrough d'attributs sur le noeud racine
// (l'orchestrateur étale le bloc via v-bind).
import type { ArticleGalleryBlock } from '~/types/blocks'

defineProps<ArticleGalleryBlock>()
</script>

<template>
  <div class="wf-article-gallery" data-reveal-stagger>
    <figure
      v-for="(img, i) in images"
      :key="i"
      class="wf-article-gallery-item"
    >
      <Image
        :src="img.src"
        :alt="img.alt"
        :ratio="img.ratio"
        :label="img.label"
        :caption="img.caption"
        sizes="sm:100vw md:100vw lg:50vw xl:50vw xxl:50vw"
        tone="base"
      />
      <figcaption class="wf-figcap">{{ img.caption }}</figcaption>
    </figure>
  </div>
</template>
