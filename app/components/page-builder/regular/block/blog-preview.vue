<script setup lang="ts">
import type { BlockBase } from '~/types/blocks'
import type { BlogPreviewContent } from '~/content/blog-preview'

const blogPreview = defineProps<BlockBase<'blog-preview'> & BlogPreviewContent>()
</script>

<template>
  <section class="wf-section wf-blog-preview">
    <div class="wf-container">
      <SectionHead
        :eyebrow="blogPreview.eyebrow"
        :heading="blogPreview.heading"
        :lead="blogPreview.lead"
        :ctas="blogPreview.ctaHref && blogPreview.ctaLabel ? [{ label: blogPreview.ctaLabel, href: blogPreview.ctaHref }] : []"
      />

      <!-- Cartes via le composant partagé ArticleGrid (même carte que /blog),
           tag de catégorie sur la cover inclus (défaut du composant). -->
      <ArticleGrid :articles="blogPreview.items" :columns="3" />
    </div>
  </section>
</template>
