<script setup lang="ts">
// Liens alternate hreflang fr-CA / en-CA / x-default sur les deux arbres de
// langue (plomberie i18n SEO conservée). useLocaleHead({ seo: true }) active
// l'émission des alternates; on ne lie ici que les rel=alternate.
const i18nHead = useLocaleHead({ dir: false, lang: false, seo: true })
useHead(() => ({
  link: (i18nHead.value.link ?? []).filter((l) => l.rel === 'alternate'),
  // og:locale + og:locale:alternate sur TOUTES les pages, source unique. Sans ça,
  // le module ne les pose que sur les pages détail (via setI18nParams), pas sur
  // les pages fixes. On ne reprend QUE ces deux propriétés du meta de
  // useLocaleHead (og:url et canonical restent à nuxt-seo-utils; sur les détails,
  // setI18nParams émet les mêmes entrées avec la même clé, unhead déduplique).
  meta: (i18nHead.value.meta ?? []).filter(
    (m) => m.property === 'og:locale' || m.property === 'og:locale:alternate'
  )
}))

// Overlay de grille, outil dev seulement (touche `g`). Hors bundle de prod.
const isDev = import.meta.dev
</script>

<template>
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <DevGrid v-if="isDev" />
</template>
