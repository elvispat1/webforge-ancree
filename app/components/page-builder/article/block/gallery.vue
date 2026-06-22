<script setup lang="ts">
/* Galerie d'article: au moins deux figures arrondies, en grille (1 col, puis 2).
 * Legendes optionnelles, sobres. */
import type { BlockBase } from '~/types/blocks'
import type { ArticleGalleryContent } from '~/content/article-blocks'

defineProps<BlockBase<'gallery'> & ArticleGalleryContent>()
</script>

<template>
  <ul class="article-gallery">
    <li v-for="(item, i) in images" :key="item.src + i" class="article-gallery__item">
      <figure class="article-gallery__figure">
        <div class="article-gallery__frame">
          <NuxtImg
            :src="item.src"
            :alt="item.alt || ''"
            class="article-gallery__img"
            sizes="xs:100vw sm:100vw md:380px lg:380px xl:380px xxl:380px"
            format="webp"
            loading="lazy"
          />
        </div>
        <figcaption v-if="item.caption" class="article-gallery__caption">{{ item.caption }}</figcaption>
      </figure>
    </li>
  </ul>
</template>

<style scoped>
.article-gallery {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.6rem;
  container-type: inline-size;
}
.article-gallery__figure {
  margin: 0;
}
.article-gallery__frame {
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--elev-low);
}
.article-gallery__img {
  display: block;
  width: 100%;
  height: 100%;
  aspect-ratio: var(--ratio-landscape);
  object-fit: cover;
}
.article-gallery__caption {
  margin-top: 0.9rem;
  font-size: 1.35rem;
  line-height: 1.4;
  color: var(--text-muted);
}
@container (min-width: 500px) {
  .article-gallery {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
