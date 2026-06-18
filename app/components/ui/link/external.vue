<script setup lang="ts">
/* LinkExternal — lien vers une URL externe. Ouvre dans un nouvel onglet avec
 * les attributs de sécurité standards (noopener, noreferrer).
 *
 * Convention WebForge: tout lien externe affiche une icône arrow-up-right
 * après le texte pour signaler visuellement la nature externe. L'icône hérite
 * de la couleur du parent et est dimensionnée à 1em.
 *
 * a11y: l'ouverture dans un nouvel onglet est annoncée aux lecteurs d'écran via
 * une mention sr-only (l'icône est purement décorative).
 *
 * Usage:
 *   <LinkExternal href="https://patoinestudio.ca">Patoine Studio</LinkExternal>
 */
defineProps<{
  href: string
}>()

const { t } = useI18n()
</script>

<template>
  <a :href="href" target="_blank" rel="noopener noreferrer" class="wf-link wf-link-external">
    <slot />
    <span class="wf-sr-only">{{ t('a11y.opens_new_window') }}</span>
    <Icon
      name="lucide:arrow-up-right"
      class="wf-link-external-icon"
      aria-hidden="true"
    />
  </a>
</template>

<style scoped>
.wf-link-external {
  display: inline-flex;
  align-items: center;
  gap: 0.2em;
}
.wf-link-external-icon {
  width: 1em;
  height: 1em;
  flex-shrink: 0;
}
</style>
