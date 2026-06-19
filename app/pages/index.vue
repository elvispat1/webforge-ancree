<script setup lang="ts">
// Accueil placeholder du canvas vierge. La reconstruction (héros, blocs, contenu
// Sanity) remplace cette page.
const { t } = useI18n()
const switchLocalePath = useSwitchLocalePath()
const { locale } = useI18n()

useSeoMeta({
  title: () => t('home.title'),
  description: () => t('home.lead')
})
</script>

<template>
  <section class="canvas">
    <p class="canvas-kicker">webforge-ancree</p>
    <h1 class="canvas-title">{{ t('home.title') }}</h1>
    <p class="canvas-lead">{{ t('home.lead') }}</p>
    <NuxtLink class="canvas-link" :to="switchLocalePath(locale === 'fr' ? 'en' : 'fr')">
      {{ t('home.switch') }}
    </NuxtLink>
  </section>
</template>
