<script setup lang="ts">
/* Page legale du ONE-PAGER (sous /one-pager, layout landing: en-tete par ancres
 * qualifie par /one-pager). Masthead hero-page sobre, sans fil d'Ariane (hors de
 * l'arbre de breadcrumbs multipage). Le pendant multipage est /politique-confidentialite. */
import type { HeroPageBlock } from '~/types/blocks'

definePageMeta({ layout: 'landing' })

const { t } = useI18n()

const heroBlock = computed<HeroPageBlock>(() => ({
  _type: 'hero-page',
  _key: 'masthead',
  title: t('pages.privacy_heading')
}))

// Sous-arbre one-pager: NOINDEX (exclu du sitemap aussi). Pas de fil d'Ariane
// (hors de l'arbre de breadcrumbs multipage).
usePageSeo({
  title: t('pages.privacy_heading'),
  description: t('pages.legal_body'),
  noindex: true
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
