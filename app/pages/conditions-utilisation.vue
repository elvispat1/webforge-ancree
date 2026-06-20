<script setup lang="ts">
/* Page legale (gabarit de demo) en mode multipage. Masthead hero-page sobre
 * (fil d'Ariane + titre, sans eyebrow ni appel: une page legale ne convertit
 * pas), puis le corps. Le vrai contenu legal sera redige avant la mise en ligne. */
import { breadcrumbsFor } from '~/config/route-map'
import type { HeroPageBlock } from '~/types/blocks'

const { t, locale } = useI18n()

const heroBlock = computed<HeroPageBlock>(() => ({
  _type: 'hero-page',
  _key: 'masthead',
  crumbs: breadcrumbsFor('terms', undefined, locale.value as 'fr' | 'en'),
  title: t('pages.terms_heading')
}))

usePageSeo({
  title: t('pages.terms_heading'),
  description: t('pages.legal_body'),
  breadcrumbs: breadcrumbsFor('terms', undefined, locale.value as 'fr' | 'en')
})
</script>

<template>
  <article>
    <Hero :hero="heroBlock" />
    <div class="wf-container legal">
      <p class="legal__body wf-body-1 wf-text-muted">{{ t('pages.legal_body') }}</p>
    </div>
  </article>
</template>

<style scoped>
.legal {
  padding-block: var(--space-block-default);
}
.legal__body {
  max-width: 60ch;
}
</style>
