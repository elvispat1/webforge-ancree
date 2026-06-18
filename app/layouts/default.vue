<script setup lang="ts">
/* Coquille du site multipage. Le lien de politique de la bannière de
 * consentement est localisé par le route-map (FR /politique-confidentialite,
 * EN /en/privacy-policy). */
import { routePath } from '~/config/route-map'

const { t } = useI18n()
const policyHref = routePath('privacy', useWfLocale())

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
    <Header mode="multipage" />
    <main id="main">
      <slot />
    </main>
    <Footer />
    <Consent :policy-href="policyHref" />
    <!-- En fin de layout comme la carte consent (position:fixed, slot DOM libre):
         le premier Tab atterrit sur le skip link, pas sur « Quitter la prévisualisation ». -->
    <component :is="PreviewBanner" v-if="PreviewBanner" />
  </div>
</template>
