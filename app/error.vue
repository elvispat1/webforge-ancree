<script setup lang="ts">
// Page d'erreur minimale du canvas (404 + erreurs fatales). Coquille autonome:
// elle ne touche aucun pipeline de contenu. Chrome générique via i18n.
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()
const { t } = useI18n()
const localePath = useLocalePath()

const isNotFound = computed(() => props.error.statusCode === 404)
const title = computed(() => (isNotFound.value ? t('error.not_found') : t('error.generic')))

function backHome(): void {
  clearError({ redirect: localePath('/') })
}
</script>

<template>
  <main id="main" class="canvas">
    <p class="canvas-kicker">{{ error.statusCode }}</p>
    <h1 class="canvas-title">{{ title }}</h1>
    <a class="canvas-link" :href="localePath('/')" @click.prevent="backHome">
      {{ t('error.home') }}
    </a>
  </main>
</template>
