<script setup lang="ts">
/* Coquille du mode MULTIPAGE (racine /): en-tete en mode multipage (liens de
 * route via le route-map). Le one-pager utilise le layout `landing` (ancres). */
import { routePath } from '~/config/route-map'

const { t } = useI18n()
/* Cible du lien « politique de confidentialité » de la bannière de consentement,
 * localisée (racine multipage). */
const policyHref = routePath('privacy', useWfLocale())
</script>

<template>
  <div class="wf-site">
    <a class="wf-skip" href="#main">{{ t('a11y.skip_to_content') }}</a>
    <Header mode="multipage" />
    <main id="main">
      <slot />
    </main>
    <Footer />
    <!-- Barre d'appel mobile desactivee temporairement: trop imposante et buggee
         sur iPhone. A retravailler avant de la reactiver. <CallBar /> -->
    <Consent :policy-href="policyHref" />
  </div>
</template>
