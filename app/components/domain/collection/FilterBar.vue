<script setup lang="ts">
// Barre de filtre de collection, route-based. Le déclencheur « Filtrer » EST
// l'indicateur de sélection: neutre = « Filtrer », actif = la catégorie choisie (en
// accent). Il déploie un panneau d'options en place (idiome accordéon,
// grid-template-rows 0fr -> 1fr). Chaque option est un NuxtLink: filtrer change l'URL
// (SEO, prérendu statique), une seule catégorie à la fois (revenir à « Tous »
// efface). Un compteur de la vue courante à droite. Pas de tag séparé ni de bouton
// Effacer: le filtre n'est jamais cumulatif. La page calcule options/active/total.
const props = defineProps<{
  /** Options du filtre, l'option « tout » en tête (slug 'all', href de la collection nue). */
  options: { slug: string; label: string; count: number; href: string }[]
  /** Slug actif ('all' = aucune catégorie). */
  active: string
  /** Nombre d'items de la vue courante (compteur de la barre). */
  total: number
  /** Clé i18n pluralisable du compteur (ex 'ui.filter.count_articles'). */
  countKey: string
}>()

const { t } = useI18n()
const open = ref(false)
const panelId = useId()
const root = ref<HTMLElement | null>(null)
const trigger = ref<HTMLElement | null>(null)

const isFiltered = computed(() => props.active !== 'all')
const activeOption = computed(() => props.options.find((o) => o.slug === props.active))
// Cible de l'effacement: l'href de l'option « tout » (la collection nue).
const clearHref = computed(() => props.options.find((o) => o.slug === 'all')?.href ?? '/')

function close() { open.value = false }

// Fermeture au clic dehors et à Échap (le focus revient au déclencheur).
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && open.value) {
    close()
    trigger.value?.focus()
  }
}
function onPointerDown(e: PointerEvent) {
  if (open.value && root.value && !root.value.contains(e.target as Node)) close()
}
onMounted(() => {
  document.addEventListener('keydown', onKeydown)
  document.addEventListener('pointerdown', onPointerDown)
})
onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
  document.removeEventListener('pointerdown', onPointerDown)
})
</script>

<template>
  <div ref="root" class="wf-filter">
    <div class="wf-filter-bar">
      <!-- Le déclencheur EST l'indicateur de sélection: neutre = « Filtrer », actif
           = la catégorie choisie (en accent). Recliquer rouvre le panneau pour
           changer ou revenir à « Tous ». Une seule catégorie à la fois, donc aucune
           sensation de cumul de tags. -->
      <button
        ref="trigger"
        type="button"
        class="wf-filter-trigger"
        :class="{ 'is-open': open, 'is-active': isFiltered }"
        :aria-expanded="open"
        :aria-controls="panelId"
        :aria-label="isFiltered && activeOption ? `${t('ui.filter.trigger')} : ${activeOption.label}` : undefined"
        @click="open = !open"
      >
        <Icon v-if="!isFiltered" name="lucide:sliders-horizontal" aria-hidden="true" />
        <span>{{ isFiltered && activeOption ? activeOption.label : t('ui.filter.trigger') }}</span>
        <Icon name="lucide:chevron-down" class="wf-filter-chevron" aria-hidden="true" />
      </button>

      <div class="wf-filter-meta">
        <!-- Raccourci d'effacement à côté du compteur: retour à tous les articles
             en un clic. Visible seulement quand une catégorie est active. -->
        <NuxtLink v-if="isFiltered" :to="clearHref" class="wf-filter-clear">
          <Icon name="lucide:x" aria-hidden="true" />
          <span>{{ t('ui.filter.clear') }}</span>
        </NuxtLink>
        <span class="wf-filter-count wf-caption">{{ t(countKey, total) }}</span>
      </div>
    </div>

    <div :id="panelId" class="wf-filter-panel" :class="{ 'is-open': open }">
      <nav class="wf-filter-panel-inner" :inert="!open" :aria-label="t('a11y.category_filter')">
        <ul class="wf-filter-options">
          <li v-for="opt in options" :key="opt.slug">
            <NuxtLink
              :to="opt.href"
              class="wf-filter-option"
              :class="{ 'is-active': opt.slug === active }"
              :aria-current="opt.slug === active ? 'page' : undefined"
              @click="close"
            >
              <span class="wf-filter-option-label">{{ opt.label }}</span>
              <span class="wf-filter-option-count">{{ opt.count }}</span>
            </NuxtLink>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>
