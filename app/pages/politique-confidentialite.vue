<script setup lang="ts">
/* Politique de confidentialité — page de second plan, partagée entre les deux
 * types de site (one-pager + multipage), à la racine. Le gabarit vit dans
 * <LegalPage>; cette page ne fait que choisir son contenu et son SEO. */
const legal = useContent('legal')

// SEO localisé (T2b): titre du document légal (payload, par locale), description
// par gabarit i18n (nom de site interpolé depuis le payload).
const { t } = useI18n()
const site = useContent('site').value

usePageSeo({
  title: legal.value.confidentialite.title,
  description: t('ui.legal.privacy_description', { site: site.brand.name })
})
</script>

<template>
  <LegalPage :doc="legal.confidentialite">
    <template #after-sections>
      <ConsentCategories />
    </template>
  </LegalPage>
</template>
