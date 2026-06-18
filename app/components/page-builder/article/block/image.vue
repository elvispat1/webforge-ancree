<script setup lang="ts">
// Bloc d'article « image » (_type "image"): image légendée insérée dans le corps
// de l'article. Typé contre le bloc discriminé (ArticleImageBlock =
// BlockBase<'image'> & ArticleImageContent: { image: ArticleImage }), même
// mécanique que les blocs réguliers. _type et _key déclarés en props pour qu'ils
// ne retombent pas en attributs de fallthrough (v-bind de l'orchestrateur).
//
// Le fragment <Image> est importé explicitement: ce fichier s'appelle image.vue,
// donc <Image> dans le template se résoudrait sinon vers CE composant (auto-
// référence). L'import nommé lève l'ambiguïté.
import type { ArticleImageBlock } from '~/types/blocks'
import ImageFragment from '~/components/fragments/images/Image.vue'

defineProps<ArticleImageBlock>()
</script>

<template>
  <figure class="wf-article-figure" data-reveal>
    <ImageFragment
      :src="image.src"
      :alt="image.alt"
      :ratio="image.ratio"
      :label="image.label"
      :caption="image.caption"
      sizes="sm:100vw md:768px"
      tone="base"
    />
    <figcaption class="wf-figcap">{{ image.caption }}</figcaption>
  </figure>
</template>
