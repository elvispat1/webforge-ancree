<script setup lang="ts">
/* RadioGroup — choix unique dans une liste, accessible et piloté par tokens.
 *
 * fieldset + legend regroupent les options (le libellé de groupe = la question).
 * Présentationnel: la validation vit dans le formulaire, le composant affiche
 * l'erreur qu'on lui passe. v-model = la valeur sélectionnée (string).
 *
 * Trois rendus via `variant`, même sémantique (un seul choix possible):
 *   - list (défaut): cercle radio + libellé, options empilées.
 *   - segmented: rangée de segments pilule (options courtes, ex: un mode).
 *   - cards: cartes bordées (ex: choisir un forfait, description optionnelle).
 *
 * Usage:
 *   <RadioGroup v-model="v" legend="Type de projet" :options="opts" required :error="err" />
 */
type RadioOption = { label: string; value: string; description?: string }

const props = withDefaults(defineProps<{
  modelValue: string
  options: RadioOption[]
  legend: string
  name?: string
  required?: boolean
  error?: string
  variant?: 'list' | 'segmented' | 'cards'
}>(), {
  required: false,
  variant: 'list'
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: []
}>()

const uid = useId()
const groupName = `radio-${uid}`
const errorId = `err-${uid}`
</script>

<template>
  <fieldset
    class="wf-radio-group"
    :class="[`wf-radio-group--${variant}`, { 'wf-radio-group--error': !!error }]"
  >
    <legend class="wf-radio-group__legend">
      {{ legend }}<span v-if="required" class="wf-field__req" aria-hidden="true">*</span>
    </legend>
    <div class="wf-radio-group__options">
      <label v-for="opt in options" :key="opt.value" class="wf-radio">
        <input
          type="radio"
          class="wf-radio__input"
          :name="name || groupName"
          :value="opt.value"
          :checked="modelValue === opt.value"
          :required="required"
          :aria-invalid="error ? 'true' : undefined"
          :aria-describedby="error ? errorId : undefined"
          @change="emit('update:modelValue', opt.value)"
          @blur="emit('blur')"
        >
        <span class="wf-radio__box">
          <span class="wf-radio__title">{{ opt.label }}</span>
          <span v-if="opt.description" class="wf-radio__desc">{{ opt.description }}</span>
        </span>
      </label>
    </div>
    <p v-if="error" :id="errorId" class="wf-err wf-radio-group__err" role="alert">{{ error }}</p>
  </fieldset>
</template>
