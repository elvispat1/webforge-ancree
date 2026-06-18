<script setup lang="ts">
/* Select — menu déroulant à choix unique, basé sur un <select> natif stylé.
 *
 * Le natif est le plus accessible et le plus fiable (clavier, mobile, lecteurs
 * d'écran). On retire seulement la flèche native (appearance:none) pour poser
 * notre chevron. Label fixe au-dessus: un select affiche toujours une valeur,
 * le label ne redescend pas dans la zone. Présentationnel: erreur en prop.
 *
 * Usage:
 *   <Select v-model="v" label="Province" :options="opts" required :error="err" />
 */
type SelectOption = { label: string; value: string }

const props = withDefaults(defineProps<{
  modelValue: string
  options: SelectOption[]
  label: string
  required?: boolean
  error?: string
  placeholder?: string
}>(), {
  required: false,
  placeholder: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: []
}>()

const uid = useId()
const fieldId = `select-${uid}`
const errorId = `err-${uid}`
</script>

<template>
  <div class="wf-field wf-field--labeled wf-field--select" :class="{ 'wf-field--error': !!error }">
    <select
      :id="fieldId"
      class="wf-field__control"
      :value="modelValue"
      :required="required"
      :aria-required="required || undefined"
      :aria-invalid="error ? 'true' : undefined"
      :aria-describedby="error ? errorId : undefined"
      @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      @blur="emit('blur')"
    >
      <option v-if="placeholder" value="">{{ placeholder }}</option>
      <option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
    </select>
    <label :for="fieldId" class="wf-field__label">
      {{ label }}<span v-if="required" class="wf-field__req" aria-hidden="true">*</span>
    </label>
    <Icon name="lucide:chevron-down" class="wf-select__chevron" aria-hidden="true" />
    <p v-if="error" :id="errorId" class="wf-err" role="alert">{{ error }}</p>
  </div>
</template>
