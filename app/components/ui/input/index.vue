<script setup lang="ts">
/* Input — champ de formulaire réutilisable et accessible.
 *
 * Label flottant: au repos le label occupe la zone de saisie; au focus ou
 * quand le champ est rempli, il monte au-dessus en petit. L'astérisque (si
 * requis) est collée au nom et monte avec lui. Gère text/email/tel/date/textarea.
 * Pour type=date, le label reste fixe au-dessus (le champ affiche toujours le
 * gabarit de date), via le modificateur .wf-field--labeled.
 *
 * Présentationnel: la VALIDATION vit dans le formulaire (chaque formulaire
 * décide quels champs sont requis). Le composant émet `blur` pour déclencher
 * la validation et affiche l'erreur qu'on lui passe via `error`.
 *
 * Convention: champ requis = astérisque collée au nom; champ optionnel = aucun
 * indicateur (l'absence d'astérisque suffit).
 *
 * Usage:
 *   <Input v-model="vals.name" label="Nom" type="text" required
 *          autocomplete="name" :error="errors.name" @blur="validate('name')" />
 *   <Input v-model="vals.phone" label="Téléphone" type="tel" />
 *   <Input v-model="vals.message" label="Votre projet" type="textarea" required />
 */
type FieldType = 'text' | 'email' | 'tel' | 'date' | 'textarea'

const props = withDefaults(defineProps<{
  modelValue: string
  label: string
  type?: FieldType
  required?: boolean
  autocomplete?: string
  placeholder?: string
  error?: string
  rows?: number
}>(), {
  type: 'text',
  required: false,
  rows: 5
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: []
}>()

const uid = useId()
const fieldId = `field-${uid}`
const errorId = `err-${uid}`

const isMultiline = computed(() => props.type === 'textarea')
const isDate = computed(() => props.type === 'date')

function onInput(e: Event) {
  emit('update:modelValue', (e.target as HTMLInputElement | HTMLTextAreaElement).value)
}

/* focus() exposé: permet au formulaire de déplacer le focus sur le premier
 * champ en erreur à la soumission (pattern bouton toujours actif). */
const control = ref<HTMLInputElement | HTMLTextAreaElement | null>(null)
defineExpose({
  focus: () => control.value?.focus()
})
</script>

<template>
  <div class="wf-field" :class="{ 'wf-field--multiline': isMultiline, 'wf-field--error': !!error, 'wf-field--labeled': isDate }">
    <!-- placeholder par défaut à un espace: nécessaire pour que :placeholder-shown
         pilote l'état flottant du label même sans exemple de saisie. -->
    <textarea
      v-if="isMultiline"
      :id="fieldId"
      ref="control"
      class="wf-field__control"
      :value="modelValue"
      :rows="rows"
      :required="required"
      :placeholder="placeholder || ' '"
      :aria-required="required || undefined"
      :aria-invalid="error ? 'true' : undefined"
      :aria-describedby="error ? errorId : undefined"
      @input="onInput"
      @blur="emit('blur')"
    />
    <input
      v-else
      :id="fieldId"
      ref="control"
      class="wf-field__control"
      :type="type"
      :value="modelValue"
      :required="required"
      :autocomplete="autocomplete"
      :placeholder="placeholder || ' '"
      :aria-required="required || undefined"
      :aria-invalid="error ? 'true' : undefined"
      :aria-describedby="error ? errorId : undefined"
      @input="onInput"
      @blur="emit('blur')"
    >
    <label :for="fieldId" class="wf-field__label">
      {{ label }}<span v-if="required" class="wf-field__req" aria-hidden="true">*</span>
    </label>
    <!-- role=alert: l'erreur est posée au blur (le focus a déjà quitté le champ),
         la région live est le seul canal qui l'annonce au lecteur d'écran. -->
    <p v-if="error" :id="errorId" class="wf-err" role="alert">{{ error }}</p>
  </div>
</template>
