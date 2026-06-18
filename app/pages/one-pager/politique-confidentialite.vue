<script setup lang="ts">
/* Politique de confidentialité du site one-pager. Vit dans le sous-arbre
 * /one-pager et adopte le layout landing pour que l'en-tête et le pied de page
 * naviguent vers les sections du one-pager (/one-pager#section), comme le vrai
 * site. Gabarit et contenu partagés via <LegalPage> et useContent('legal'). */
const legal = useContent('legal')

definePageMeta({
  layout: 'landing'
})

// Noindex comme tout le sous-arbre /one-pager (vitrine interne du palier 1):
// cette page rend le MÊME document légal que /politique-confidentialite, qui
// reste la seule version indexable. Aussi exclu du sitemap (nuxt.config).
// SEO localisé (T2b): titre du document légal (payload, par locale),
// description par gabarit i18n (nom de site interpolé depuis le payload).
const { t } = useI18n()
const site = useContent('site').value

usePageSeo({
  title: legal.value.confidentialite.title,
  description: t('ui.legal.privacy_description', { site: site.brand.name }),
  noindex: true
})
</script>

<template>
  <LegalPage :doc="legal.confidentialite">
    <template #after-sections>
      <ConsentCategories />
    </template>
  </LegalPage>
</template>
