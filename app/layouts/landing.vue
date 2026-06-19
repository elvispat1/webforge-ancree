<script setup lang="ts">
/* Coquille du site one-pager, qui vit sous /one-pager (accueil + pages légales).
 * On qualifie la nav, le logo et les liens de pied de page par cette racine pour
 * qu'ils fonctionnent depuis n'importe quelle page du sous-arbre, pas seulement
 * l'accueil: depuis une page légale, « À propos » ramène vers /one-pager#about.
 * Racine et lien de politique localisés par le route-map (préfixe /en inclus):
 * le one-pager EN vit sous /en/one-pager, jamais /one-pager/en (T2b). */
import { onePagerPath } from '~/config/route-map'

const { t } = useI18n()
const home = onePagerPath('index', useWfLocale())
const policyHref = onePagerPath('privacy', useWfLocale())

/* PreviewBanner, monté SEULEMENT dans les builds preview. __WF_PREVIEW__ est
 * une constante de compilation (vite.define, cf. nuxt.config): en build
 * statique de production la branche est morte et Rollup n'émet ni le composant
 * ni ses imports (cookie sanity-preview-*, /api/exit-preview) dans
 * .output/public (gate T2c, pureté statique). En preview: chunk async. */
const PreviewBanner = __WF_PREVIEW__
  ? defineAsyncComponent(() => import('~/components/layout/PreviewBanner.vue'))
  : null
</script>

<template>
  <div class="wf-site">
    <a :href="'#main'" class="wf-skip">{{ t('a11y.skip_to_content') }}</a>
    <Header mode="landing" :home="home" />
    <main id="main">
      <slot />
    </main>
    <Footer mode="landing" :home="home" />
    <Consent :policy-href="policyHref" />
    <!-- En fin de layout comme la carte consent (position:fixed, slot DOM libre):
         le premier Tab atterrit sur le skip link, pas sur « Quitter la prévisualisation ». -->
    <component :is="PreviewBanner" v-if="PreviewBanner" />
  </div>
</template>
