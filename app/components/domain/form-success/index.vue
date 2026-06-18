<script setup lang="ts">
/* FormSuccess — écran de confirmation présentationnel, affiché à la place d'un
 * formulaire après une soumission réussie. Agnostique du formulaire: reçoit son
 * contenu en props, ne porte aucune logique d'état. Conçu pour être réutilisé
 * par tout formulaire (contact, devis, infolettre…) une fois le multipage en
 * place; vit dans l'app tant qu'il n'a qu'un seul consommateur.
 *
 * Styles: classes .wf-form-success / .wf-success-mark dans global.css
 * (convention du projet — composants sans <style>, cf. Accordion/Input/Checkbox).
 * Couleurs en currentColor / inherit: le composant prend la couleur de son
 * contexte (texte clair sur la section Contact sombre, sombre sur fond clair),
 * il reste donc réutilisable sans hypothèse sur la surface.
 *
 * a11y: role="status" annonce la confirmation aux lecteurs d'écran de façon
 * polie (pas assertive), sans voler le focus. La pastille ✓ est décorative.
 * La racine porte tabindex=-1 et le composant expose focus(): quand la
 * confirmation REMPLACE un formulaire (l'élément focusé disparaît du DOM), le
 * consommateur y déplace le focus pour que le clavier ne retombe pas au body.
 * Jamais de focus automatique au montage: la vitrine /showcase rend ce
 * composant statiquement et il ne doit pas voler le focus au chargement.
 */
defineProps<{
  title: string
  body: string
}>()

const root = ref<HTMLElement | null>(null)
defineExpose({
  focus: () => root.value?.focus()
})
</script>

<template>
  <div ref="root" class="wf-form-success" role="status" tabindex="-1">
    <span class="wf-success-mark" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="24" height="24">
        <path
          d="M4 12 L10 18 L20 6"
          stroke="currentColor"
          stroke-width="2"
          fill="none"
          stroke-linecap="square"
        />
      </svg>
    </span>
    <h3 class="wf-h4">{{ title }}</h3>
    <p class="wf-body-1 wf-text-muted">{{ body }}</p>
  </div>
</template>
