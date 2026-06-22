<script setup lang="ts">
// Page d'erreur du gabarit (404 + erreurs fatales). Coquille AUTONOME: ne touche
// aucun pipeline de contenu. Sur une route inexistante, AUCUN payload Sanity n'est
// joignable (pas de _payload.json, le plugin 01.content ne fetch jamais au client):
// cette page n'utilise donc PAS le layout default (Header/Footer/usePageSeo lisent
// useContent('site') -> usePayload(), qui throw sans payload). La marque vient de
// la config de site (useSiteConfig), JAMAIS de Sanity; la route d'accueil du
// route-map (même source que le Header), localisée. Chrome générique via i18n
// (ui.error.*). Noindex couvert par le robots global (site.indexable: false).
import { routePath } from '~/config/route-map'
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()
const { t } = useI18n()

const isNotFound = computed(() => props.error.statusCode === 404)
const title = computed(() => (isNotFound.value ? t('ui.error.not_found_title') : t('ui.error.generic_title')))

/* Marque et accueil sans toucher Sanity: nom via la config de site, route
 * d'accueil localisée via le route-map. */
const site = useSiteConfig()
const brandName = computed(() => String(site.name ?? ''))
const homeHref = computed(() => routePath('home', useWfLocale()))

/* Titre fixé IMPÉRATIVEMENT au montage. Le 404.html est une coquille SPA rendue
 * côté client; le repli de titre de nuxt-seo-utils est désactivé (seo.fallbackTitle:
 * false), et un <title> déclaratif d'error.vue ne sort pas dans ce contexte. On fixe
 * donc document.title au montage. Forme « {titre} | {marque} ». */
const fullTitle = computed(() => `${title.value} | ${brandName.value}`)
onMounted(() => {
  document.title = fullTitle.value
})

/* clearError purge l'état d'erreur avant de rediriger (un simple lien laisserait
 * l'app dans l'état d'erreur). Le href reste le repli sans JS. */
function backHome(): void {
  clearError({ redirect: homeHref.value })
}
</script>

<template>
  <main id="main" class="canvas">
    <p class="canvas-kicker">{{ error.statusCode }}</p>
    <h1 class="canvas-title">{{ title }}</h1>
    <a class="canvas-link" :href="homeHref" @click.prevent="backHome">
      {{ t('ui.error.home_link') }}
    </a>
  </main>
</template>
