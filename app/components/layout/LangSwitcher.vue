<script setup lang="ts">
/* LangSwitcher: bascule FR <-> EN du chrome de nav (multipage seulement,
 * décision R1: les one-pagers FR et EN sont deux pages autonomes, sans bascule).
 *
 * Élément <a> natif en PLEIN CHARGEMENT, jamais <NuxtLink>: le graphe de
 * contenu est fetché PAR LANGUE par app/plugins/01.content.ts au chargement de
 * l'app (payload wf-content-<locale>); une navigation client cross-locale
 * garderait le graphe de la langue de départ (piège documenté au plan T2b).
 * Le libellé affiche la langue CIBLE (page FR -> « EN », page EN -> « FR »).
 *
 * Résolution de l'URL cible:
 *  - Pages fixes et pagination (/blog/page/N): switchLocalePath() résout par le
 *    nom de route via customRoutes (route-map.buildI18nPages), juste dès le
 *    rendu serveur (aucun param traduit).
 *  - Pages détail (param `slug`: services, projets, catch-all blog): les slugs
 *    diffèrent par langue; switchLocalePath n'est juste qu'une fois les params
 *    posés par la page (setI18nParams). Or le Header rend AVANT la page (ordre
 *    SSR): tant que les params ne sont pas posés, repli sur la racine de la
 *    locale cible (jamais un slug FR sous /en, 404 garantie en statique). Côté
 *    client, on resynchronise après le montage de la page (onMounted +
 *    page:finish): le lien devient l'URL exacte (gate T2b, round-trip
 *    /services/cuisines <-> /en/services/kitchens).
 */
import { localePrefix, type Locale } from '~/config/route-map'

const { t, locale } = useI18n()
const route = useRoute()
const switchLocalePath = useSwitchLocalePath()

const targetLocale = computed<Locale>(() => (locale.value === 'en' ? 'fr' : 'en'))
const targetRoot = computed(() => localePrefix(targetLocale.value) || '/')

/* Clé meta INTERNE de @nuxtjs/i18n (v10, DYNAMIC_PARAMS_KEY de module.mjs) où
 * setI18nParams dépose les params par locale. setI18nParams écrit dans l'objet
 * meta BRUT du routeur, hors réactivité Vue: le tick force la réévaluation du
 * computed une fois la page montée (hydratation et navigations client), moment
 * où les params sont garantis posés. À revalider au bump majeur du module. */
const I18N_PARAMS_META_KEY = 'nuxtI18nInternal'
const tick = ref(0)

const nuxtApp = useNuxtApp()
const unhook = nuxtApp.hook('page:finish', () => { tick.value++ })
onMounted(() => { tick.value++ })
onBeforeUnmount(() => { unhook() })

const href = computed(() => {
  void tick.value
  if ('slug' in route.params) {
    const params = route.meta[I18N_PARAMS_META_KEY] as Record<string, unknown> | undefined
    if (!params || Object.keys(params).length === 0) return targetRoot.value
  }
  return switchLocalePath(targetLocale.value) || targetRoot.value
})
</script>

<template>
  <a
    class="wf-lang wf-link wf-caption"
    :href="href"
    :hreflang="targetLocale"
    :lang="targetLocale"
    :aria-label="t('a11y.lang_switcher')"
  >{{ t('ui.lang.target') }}</a>
</template>
