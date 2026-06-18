<script setup lang="ts">
/* NumberInput — champ nombre avec pas (boutons − / +), accessible et piloté par
 * tokens. Réutilise le champ stylé (.wf-field), masque les spinners natifs et
 * pose deux boutons. Présentationnel: erreur en prop; la valeur est bornée par
 * min/max. Les libellés des boutons (chrome générique) passent par i18n.
 *
 * Usage:
 *   <NumberInput v-model="n" label="Quantité" :min="1" :max="10" :error="err" />
 */
const props = withDefaults(defineProps<{
  modelValue: number
  label: string
  min?: number
  max?: number
  step?: number
  required?: boolean
  error?: string
}>(), {
  step: 1,
  required: false
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
  blur: []
}>()

const { t } = useI18n()
const uid = useId()
const fieldId = `number-${uid}`
const errorId = `err-${uid}`

function clamp(n: number): number {
  if (props.min !== undefined) n = Math.max(props.min, n)
  if (props.max !== undefined) n = Math.min(props.max, n)
  return n
}
function bump(dir: number) {
  emit('update:modelValue', clamp((props.modelValue || 0) + dir * props.step))
}
function onInput(e: Event) {
  const n = Number((e.target as HTMLInputElement).value)
  if (!Number.isNaN(n)) emit('update:modelValue', clamp(n))
}
</script>

<template>
  <div class="wf-field wf-field--number" :class="{ 'wf-field--error': !!error }">
    <input
      :id="fieldId"
      type="number"
      inputmode="numeric"
      class="wf-field__control"
      :value="modelValue"
      :min="min"
      :max="max"
      :step="step"
      :required="required"
      :aria-required="required || undefined"
      :aria-invalid="error ? 'true' : undefined"
      :aria-describedby="error ? errorId : undefined"
      @input="onInput"
      @blur="emit('blur')"
    >
    <label :for="fieldId" class="wf-field__label">
      {{ label }}<span v-if="required" class="wf-field__req" aria-hidden="true">*</span>
    </label>
    <div class="wf-number__steppers">
      <button type="button" class="wf-number__btn" :aria-label="t('a11y.number_decrease')" @click="bump(-1)">
        <Icon name="lucide:minus" aria-hidden="true" />
      </button>
      <button type="button" class="wf-number__btn" :aria-label="t('a11y.number_increase')" @click="bump(1)">
        <Icon name="lucide:plus" aria-hidden="true" />
      </button>
    </div>
    <p v-if="error" :id="errorId" class="wf-err" role="alert">{{ error }}</p>
  </div>
</template>
