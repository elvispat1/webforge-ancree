<script setup lang="ts">
/* Checkbox — case à cocher réutilisable et accessible.
 *
 * Le libellé passe par le slot par défaut (permet d'y glisser un lien, ex:
 * acceptation d'une politique). Présentationnel: la validation vit dans le
 * formulaire. Émet update:modelValue (v-model booléen) et blur.
 *
 * Usage:
 *   <Checkbox v-model="vals.privacy" required>
 *     J'accepte la <NuxtLink to="/...">politique</NuxtLink>.
 *   </Checkbox>
 */
const props = withDefaults(defineProps<{
  modelValue: boolean
  required?: boolean
  error?: string
}>(), {
  required: false
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  blur: []
}>()

const uid = useId()
const id = `check-${uid}`
const errorId = `err-${uid}`

/* focus() exposé: permet au formulaire de déplacer le focus sur la case quand
 * elle est la première erreur à la soumission (pattern bouton toujours actif). */
const control = ref<HTMLInputElement | null>(null)
defineExpose({
  focus: () => control.value?.focus()
})
</script>

<template>
  <div class="wf-check" :class="{ 'wf-check--error': !!error }">
    <input
      :id="id"
      ref="control"
      type="checkbox"
      class="wf-check__input"
      :checked="modelValue"
      :required="required"
      :aria-required="required || undefined"
      :aria-invalid="error ? 'true' : undefined"
      :aria-describedby="error ? errorId : undefined"
      @change="emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
      @blur="emit('blur')"
    >
    <label :for="id" class="wf-check__label"><slot /></label>
    <p v-if="error" :id="errorId" class="wf-err wf-check__err" role="alert">{{ error }}</p>
  </div>
</template>
