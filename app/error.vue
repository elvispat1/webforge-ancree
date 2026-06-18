<script setup lang="ts">
/* Page d'erreur du gabarit (404 et erreurs fatales). Sobre, famille
 * Minimaliste: en-tête réduit (signature de marque + lien d'accueil), wf-h1,
 * message court et lien à filet vers l'accueil. Les chaînes sont du chrome
 * produit générique (i18n ui.error.* et a11y.*, parité fr/en), jamais du
 * contenu propre au site. Noindex: une page d'erreur n'a rien à faire dans
 * l'index.
 *
 * CHROME MINIMAL, hors pipeline de contenu (statique pur). Le 404.html est une
 * coquille SPA rendue côté client; sur une route inexistante AUCUN payload
 * Sanity n'est joignable (pas de _payload.json pour la route, et le plugin
 * 01.content ne fetch jamais au client). Donc cette page N'UTILISE PAS le layout
 * default: Header/Footer/Logo/usePageSeo lisent tous useContent('site') ->
 * usePayload(), qui throw sans payload et vide la page. On reconstruit ici une
 * coquille autonome qui ne touche jamais le payload. L'invariant tient: sur une
 * VRAIE route, l'absence de payload reste un échec fatal (usePayload inchangé).
 *
 * La marque vient de la config de site (nuxt.config `site`, useSiteConfig),
 * disponible côté client partout, JAMAIS de Sanity. La route d'accueil vient du
 * route-map (même source que le Header réel), localisée. */
import { routePath } from '~/config/route-map'
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()
const { t } = useI18n()

const isNotFound = computed(() => props.error.statusCode === 404)
const title = computed(() => (isNotFound.value ? t('ui.error.not_found_title') : t('ui.error.generic_title')))
const body = computed(() => (isNotFound.value ? t('ui.error.not_found_body') : t('ui.error.generic_body')))

/* Marque et accueil sans toucher Sanity: nom via la config de site, route
 * d'accueil localisée via le route-map. */
const site = useSiteConfig()
const brandName = computed(() => String(site.name ?? ''))
const homeHref = computed(() => routePath('home', useWfLocale()))

/* SEO minimal, SANS usePayload (la version usePageSeo lit le payload pour les
 * replis og/description, indisponibles ici). Le repli de titre de nuxt-seo-utils
 * est désactivé dans nuxt.config (seo.fallbackTitle: false): il imposait sinon
 * « {code} - {message} » (anglais, fuite du chemin) sur les erreurs.
 *
 * Titre fixé IMPÉRATIVEMENT au montage. Le 404.html est une coquille SPA rendue
 * côté client; dans ce contexte le head DÉCLARATIF d'un composant d'erreur
 * (useHead/useSeoMeta) ne pose aucun <title> (vérifié: repli désactivé, un titre
 * déclaratif d'error.vue ne sort pas; seul un head de niveau app/plugin en
 * poserait un). On fixe donc document.title au montage, et rien ne le réécrit
 * (repli désactivé). Forme « {titre} | {marque} ». Le noindex est couvert par le
 * robots global (site.indexable: false). */
const fullTitle = computed(() => `${title.value} | ${brandName.value}`)
onMounted(() => {
  document.title = fullTitle.value
})

/* clearError purge l'état d'erreur avant de rediriger (un simple lien laisserait
 * l'app dans l'état d'erreur). Le href reste le repli sans JS (le rechargement
 * complet purge aussi). Le logo et le lien de bas de page mènent tous deux à
 * l'accueil localisé. */
function backHome(): void {
  clearError({ redirect: homeHref.value })
}
</script>

<template>
  <div class="wf-site">
    <a :href="'#main'" class="wf-skip">{{ t('a11y.skip_to_content') }}</a>
    <header class="wf-header">
      <div class="wf-container wf-header-row">
        <a :href="homeHref" class="wf-logo" @click.prevent="backHome">
          <span class="wf-logo-wm">{{ brandName }}</span>
        </a>
      </div>
    </header>
    <main id="main">
      <section class="wf-section wf-error">
        <div class="wf-container">
          <div class="section-grid">
            <div class="wf-error-copy">
              <p class="wf-caption">{{ t('ui.error.code', { code: error.statusCode }) }}</p>
              <h1 class="wf-h1">{{ title }}</h1>
              <p class="wf-body-1 wf-text-muted">{{ body }}</p>
              <a :href="homeHref" class="wf-rule-link" @click.prevent="backHome">
                <span class="wf-rule-link-label">{{ t('ui.error.home_link') }}</span>
                <Icon name="lucide:chevron-right" class="wf-rule-link-arrow" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>
