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
</script>

<template>
  <div class="wf-site">
    <a class="wf-skip" href="#main">{{ t('a11y.skip_to_content') }}</a>
    <Header mode="landing" :home="home" />
    <main id="main">
      <slot />
    </main>
    <Footer mode="landing" :home="home" />
    <CallBar />
    <Consent :policy-href="policyHref" />
  </div>
</template>
