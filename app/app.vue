<script setup lang="ts">
// Gating dev de la grille de calage: en build de production, le composant (DOM
// overlay, listener clavier global, CSS) ne doit jamais partir dans le bundle.
// Lazy + v-if="isDev": la branche est élaguée en prod ET le chunk du composant
// n'est jamais chargé. Même pattern que les pages /dev/* (import.meta.dev).
const isDev = import.meta.dev

// Liens alternate hreflang fr-CA / en-CA / x-default sur les deux arbres
// (correctif SEO T2c). Vérifié dans node_modules/@nuxtjs/i18n/dist/runtime:
// hors strictSeo, seoSettings.seo est false par défaut et le module n'émet
// RIEN tout seul; c'est cet appel useLocaleHead({ seo: true }) qui active
// l'émission (et pose seoSettings.seo = true, ce qui rend les patchs head de
// setI18nParams complets sur les pages détail: les alternates y sont corrigés
// avec les slugs traduits APRÈS le setup de la page, dédupliqués par unhead
// sur la clé alternate:<hreflang>). On ne lie ICI que les rel=alternate:
// canonical, og:url et og:locale restent émis par la couche existante
// (nuxt-seo-utils + usePageSeo), et unhead déduplique de toute façon les
// canonicals (clé unique « canonical ») si un patch i18n en ajoute un.
// dir/lang false: htmlAttrs lang est déjà géré par nuxt-seo-utils.
// baseUrl (i18n) posé dans nuxt.config: hrefs absolus.
const i18nHead = useLocaleHead({ dir: false, lang: false, seo: true })
useHead(() => ({
  link: (i18nHead.value.link ?? []).filter((l) => l.rel === 'alternate'),
  // og:locale + og:locale:alternate sur TOUTES les pages, source unique (A5/F4).
  // Sans ça, le module ne les pose que sur les pages détail (via setI18nParams),
  // pas sur les pages fixes. On ne reprend QUE ces deux propriétés du meta de
  // useLocaleHead (og:url et canonical restent à nuxt-seo-utils, pas de doublon).
  // Sur les détails, setI18nParams émet les mêmes entrées avec la même clé i18n:
  // unhead déduplique, aucun doublon.
  meta: (i18nHead.value.meta ?? []).filter(
    (m) => m.property === 'og:locale' || m.property === 'og:locale:alternate'
  )
}))
</script>

<template>
  <!-- Annonceur de route: région live masquée qui lit le titre de la nouvelle
       page aux technologies d'assistance à chaque navigation client (SPA).
       Composant Nuxt natif, indispensable en multipage. -->
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <LazyDevGrid v-if="isDev" />
</template>
