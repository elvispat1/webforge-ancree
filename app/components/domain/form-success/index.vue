<script setup lang="ts">
/* Panneau de confirmation: remplace le formulaire apres un envoi reussi. Conçu
 * pour recevoir le focus (tabindex -1) afin que le lecteur d'ecran annonce la
 * confirmation; role status + aria-live polite couvrent l'annonce sans voler le
 * focus de force. La vue parente appelle focus() via le ref expose. Materiel
 * Ancree: pastille ambre posee, carte arrondie a ombre chaude. */
const props = defineProps<{
  title: string
  body: string
}>()

const panel = ref<HTMLElement | null>(null)

function focus(): void {
  panel.value?.focus()
}

defineExpose({ focus })

// Lecture pour eviter l'avertissement « props non utilise » sur title/body en
// l'absence d'usage hors template (les deux servent au rendu ci-dessous).
void props
</script>

<template>
  <div
    ref="panel"
    class="success"
    role="status"
    aria-live="polite"
    tabindex="-1"
    data-reveal
  >
    <span class="success__mark" aria-hidden="true">
      <Icon name="lucide:check" />
    </span>
    <p class="success__title wf-h4">{{ title }}</p>
    <p class="success__body wf-body-2">{{ body }}</p>
  </div>
</template>

<style scoped>
.success {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 3.2rem;
  background: var(--bg-lift);
  border: var(--line-soft);
  border-radius: var(--radius-lg);
  box-shadow: var(--elev-mid);
}
.success:focus-visible {
  outline: none;
  box-shadow:
    var(--elev-mid),
    0 0 0 3px color-mix(in oklch, var(--accent-trust) 24%, transparent);
}
.success__mark {
  display: grid;
  place-items: center;
  width: 5.2rem;
  height: 5.2rem;
  border-radius: var(--radius-pill);
  background: var(--accent-call);
  color: var(--text-oncall);
  margin-bottom: 2rem;
}
.success__mark svg {
  width: 2.8rem;
  height: 2.8rem;
}
.success__title {
  margin: 0;
}
.success__body {
  margin-top: 1.2rem;
  max-width: 42ch;
  color: var(--text-muted);
}
</style>
