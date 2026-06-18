<script setup lang="ts">
/* Coquille de la page /showcase (client-facing, hors site). Fournit le conteneur
 * nommé `site` (via .wf-site, global.css) dont dépendent SgNav et les blocs
 * (container queries), plus le skip link. Pas de Header/Footer/nav: la page n'est
 * pas une page du site, c'est le guide des composants WebForge.
 * .wf-showcase-layout exclut <main> du padding-top de hauteur de header
 * (global.css): la page a sa propre barre d'onglets dans le flux, pas de header
 * fixe à compenser (sinon un vide blanc en haut). */
const { t } = useI18n()
</script>

<template>
  <div class="wf-site wf-showcase-layout">
    <a :href="'#main'" class="wf-skip">{{ t('a11y.skip_to_content') }}</a>
    <main id="main">
      <slot />
    </main>
  </div>
</template>
