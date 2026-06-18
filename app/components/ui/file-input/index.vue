<script setup lang="ts">
/* FileInput — téléversement d'un fichier, accessible et piloté par tokens.
 *
 * input type=file natif masqué (sr-only) dans un label-déclencheur stylé en
 * bouton; le nom du fichier choisi s'affiche à côté. Version simple: un fichier,
 * pas de glisser-déposer ni d'aperçu (Tier 3 au besoin). Présentationnel: erreur
 * en prop. Le libellé du déclencheur a un défaut i18n, surchargeable par prop.
 *
 * Usage:
 *   <FileInput v-model="file" label="Photo du projet" accept="image/*" :error="err" />
 */
const props = withDefaults(defineProps<{
  modelValue: File | null
  label: string
  buttonText?: string
  accept?: string
  required?: boolean
  error?: string
}>(), {
  required: false
})

const emit = defineEmits<{
  'update:modelValue': [value: File | null]
  blur: []
}>()

const { t } = useI18n()
const uid = useId()
const fieldId = `file-${uid}`
const errorId = `err-${uid}`

const triggerText = computed(() => props.buttonText || t('a11y.file_choose'))
const fileName = computed(() => props.modelValue?.name ?? '')

function onChange(e: Event) {
  const files = (e.target as HTMLInputElement).files
  emit('update:modelValue', files?.[0] ?? null)
}
</script>

<template>
  <div class="wf-file" :class="{ 'wf-file--error': !!error }">
    <span class="wf-file__label">
      {{ label }}<span v-if="required" class="wf-field__req" aria-hidden="true">*</span>
    </span>
    <div class="wf-file__row">
      <label class="wf-file__trigger">
        <Icon name="lucide:paperclip" aria-hidden="true" />
        <span>{{ triggerText }}</span>
        <input
          :id="fieldId"
          type="file"
          class="wf-file__input wf-sr-only"
          :accept="accept"
          :required="required"
          :aria-invalid="error ? 'true' : undefined"
          :aria-describedby="error ? errorId : undefined"
          @change="onChange"
          @blur="emit('blur')"
        >
      </label>
      <span v-if="fileName" class="wf-file__name">{{ fileName }}</span>
    </div>
    <p v-if="error" :id="errorId" class="wf-err" role="alert">{{ error }}</p>
  </div>
</template>
