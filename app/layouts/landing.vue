<script setup lang="ts">
/* Coquille du one-pager (sous /one-pager): le Header passe en mode ancres +
 * scrollspy, qualifie par la racine du one-pager pour que la nav fonctionne
 * depuis les pages legales du sous-arbre. Racine localisee par le route-map
 * (prefixe /en inclus): le one-pager EN vit sous /en/one-pager. */
import { onePagerPath } from '~/config/route-map'

const { t, locale } = useI18n()
const home = computed(() => onePagerPath('index', locale.value as 'fr' | 'en'))
/* Lien politique de la bannière de consentement, qualifié pour le sous-arbre
 * one-pager (la politique vit sous /one-pager). */
const policyHref = computed(() => onePagerPath('privacy', locale.value as 'fr' | 'en'))

/* PreviewBanner, monte SEULEMENT dans les builds preview. __WF_PREVIEW__ est une
 * constante de compilation (vite.define): en build statique la branche est morte,
 * Rollup n'emet ni le composant ni ses imports (/api/exit-preview, cookie) dans
 * .output/public. En preview: chunk async, affiche hors iframe. */
const PreviewBanner = __WF_PREVIEW__
  ? defineAsyncComponent(() => import('~/components/layout/PreviewBanner.vue'))
  : null
</script>

<template>
  <div class="wf-site">
    <a class="wf-skip" href="#main">{{ t('a11y.skip_to_content') }}</a>
    <Header mode="landing" :home="home" />
    <main id="main">
      <slot />
    </main>
    <Footer mode="landing" :home="home" />
    <!-- Barre d'appel mobile desactivee temporairement: trop imposante et buggee
         sur iPhone. A retravailler avant de la reactiver. <CallBar /> -->
    <Consent :policy-href="policyHref" />
    <!-- En fin de layout comme la carte consent (position:fixed, slot DOM libre):
         le premier Tab atterrit sur le skip link, pas sur « Quitter ». -->
    <component :is="PreviewBanner" v-if="PreviewBanner" />
  </div>
</template>
