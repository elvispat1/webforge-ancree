<script setup lang="ts">
// Fil d'Ariane partagé par les héros page/detail/article. Purement
// présentationnel: le balisage Schema.org BreadcrumbList vit dans le graphe
// JSON-LD émis par usePageSeo (option breadcrumbs, même source route-map),
// jamais en microdonnées ici (sinon double balisage). Le dernier maillon est
// la page courante (non cliquable, aria-current).
import type { Crumb } from '~/config/route-map'

defineProps<{ items: Crumb[] }>()

const { t } = useI18n()
</script>

<template>
  <nav class="wf-breadcrumb" :aria-label="t('a11y.breadcrumb')">
    <ol class="wf-breadcrumb__list">
      <li
        v-for="(crumb, i) in items"
        :key="i"
        class="wf-breadcrumb__item"
      >
        <NuxtLink
          v-if="crumb.to && i < items.length - 1"
          :to="crumb.to"
          class="wf-breadcrumb__link"
        >{{ crumb.label }}</NuxtLink>
        <span
          v-else
          class="wf-breadcrumb__current"
          aria-current="page"
        >{{ crumb.label }}</span>
      </li>
    </ol>
  </nav>
</template>
