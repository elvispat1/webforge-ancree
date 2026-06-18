<script setup lang="ts">
/* Switch — interrupteur pilule accessible, bâti sur une case à cocher native.
 *
 * Présentationnel: la case <input type=checkbox role=switch> reste la vraie
 * commande (clavier, lecteurs d'écran); l'habillage pilule (piste + knob qui
 * glisse, crochet quand actif) est purement visuel, piloté par les tokens de
 * famille. Émet update:modelValue (v-model booléen).
 *
 * Verrouillé (`disabled`): rendu en état désactivé visible. Le consommateur
 * affiche alors sa propre mention à côté (ex: « Toujours actif »).
 *
 * Usage:
 *   <Switch v-model="on" :label="…" :description="…" />
 *   <Switch :model-value="true" disabled :label="…" :description="…" />
 */
const props = withDefaults(defineProps<{
  modelValue: boolean
  label: string
  description?: string
  disabled?: boolean
}>(), {
  description: '',
  disabled: false
})

const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

const uid = useId()
const id = `switch-${uid}`
const descId = `switch-desc-${uid}`
</script>

<template>
  <div class="wf-switch" :class="{ 'wf-switch--disabled': disabled }">
    <div class="wf-switch__text">
      <label :for="id" class="wf-switch__label">{{ label }}</label>
      <p v-if="description" :id="descId" class="wf-switch__desc">{{ description }}</p>
    </div>
    <input
      :id="id"
      type="checkbox"
      role="switch"
      class="wf-switch__input"
      :checked="modelValue"
      :disabled="disabled"
      :aria-describedby="description ? descId : undefined"
      @change="emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
    >
  </div>
</template>
