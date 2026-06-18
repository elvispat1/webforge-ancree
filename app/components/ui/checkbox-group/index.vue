<script setup lang="ts">
/* CheckboxGroup — choix multiple, accessible et piloté par tokens.
 *
 * fieldset + legend regroupent des cases (réutilise le composant Checkbox, donc
 * son habillage et son accessibilité). Présentationnel: la validation vit dans
 * le formulaire. v-model = tableau des valeurs cochées.
 *
 * Usage:
 *   <CheckboxGroup v-model="vals" legend="Services" :options="opts" :error="err" />
 */
type CheckOption = { label: string; value: string }

const props = withDefaults(defineProps<{
  modelValue: string[]
  options: CheckOption[]
  legend: string
  required?: boolean
  error?: string
}>(), {
  required: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
  blur: []
}>()

const uid = useId()
const errorId = `err-${uid}`

function toggle(value: string, checked: boolean) {
  const next = checked
    ? [...props.modelValue, value]
    : props.modelValue.filter(v => v !== value)
  emit('update:modelValue', next)
}
</script>

<template>
  <fieldset class="wf-checkbox-group" :class="{ 'wf-checkbox-group--error': !!error }">
    <legend class="wf-checkbox-group__legend">
      {{ legend }}<span v-if="required" class="wf-field__req" aria-hidden="true">*</span>
    </legend>
    <div class="wf-checkbox-group__options">
      <Checkbox
        v-for="opt in options"
        :key="opt.value"
        :model-value="modelValue.includes(opt.value)"
        @update:model-value="(c: boolean) => toggle(opt.value, c)"
        @blur="emit('blur')"
      >{{ opt.label }}</Checkbox>
    </div>
    <p v-if="error" :id="errorId" class="wf-err wf-checkbox-group__err" role="alert">{{ error }}</p>
  </fieldset>
</template>
