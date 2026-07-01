<script setup lang="ts">
/* Champ de saisie: primitive de formulaire accessible. Un <label> associe par id,
 * v-model standard, variante multiligne (textarea) via la prop multiline. Le
 * message d'erreur optionnel se lie par aria-describedby et bascule aria-invalid;
 * un hook @blur permet a la vue de valider a la perte de focus. Aucune valeur
 * design en dur: rayons, filets, couleurs et mouvement passent par les tokens. Le
 * marqueur requis est visuel et porte aussi un libelle a11y (pas un simple *). */
defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    id: string
    label: string
    modelValue: string
    type?: string
    required?: boolean
    multiline?: boolean
    rows?: number
    autocomplete?: string
    error?: string
    /* Libelle a11y du marqueur requis (i18n cote vue), ex « requis ». */
    requiredLabel?: string
    /* Note optionnelle pour les champs non requis, ex « facultatif ». */
    optionalLabel?: string
  }>(),
  {
    type: 'text',
    required: false,
    multiline: false,
    rows: 5,
    autocomplete: undefined,
    error: '',
    requiredLabel: undefined,
    optionalLabel: undefined
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: []
}>()

const errorId = computed(() => `${props.id}-error`)
const hasError = computed(() => Boolean(props.error))
const describedBy = computed(() => (hasError.value ? errorId.value : undefined))

function onInput(event: Event): void {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement
  emit('update:modelValue', target.value)
}

/* focus() expose: la vue replace le focus sur le premier champ en faute a la
 * soumission (pattern bouton toujours actif). */
const control = ref<HTMLInputElement | HTMLTextAreaElement | null>(null)
defineExpose({ focus: () => control.value?.focus() })
</script>

<template>
  <div class="field" :class="{ 'field--error': hasError }">
    <label class="field__label" :for="id">
      <span class="field__label-text">{{ label }}</span>
      <span
        v-if="required && requiredLabel"
        class="field__req"
        :aria-label="requiredLabel"
      >
        <span aria-hidden="true">*</span>
      </span>
      <span v-else-if="!required && optionalLabel" class="field__opt">{{ optionalLabel }}</span>
    </label>

    <textarea
      v-if="multiline"
      :id="id"
      ref="control"
      class="field__control field__control--area"
      :value="modelValue"
      :rows="rows"
      :required="required"
      :autocomplete="autocomplete"
      :aria-invalid="hasError ? 'true' : undefined"
      :aria-describedby="describedBy"
      v-bind="$attrs"
      @input="onInput"
      @blur="emit('blur')"
    />
    <input
      v-else
      :id="id"
      ref="control"
      class="field__control"
      :type="type"
      :value="modelValue"
      :required="required"
      :autocomplete="autocomplete"
      :aria-invalid="hasError ? 'true' : undefined"
      :aria-describedby="describedBy"
      v-bind="$attrs"
      @input="onInput"
      @blur="emit('blur')"
    >

    <p v-if="hasError" :id="errorId" class="field__error" role="alert">
      <Icon name="lucide:alert-circle" class="field__error-icon" aria-hidden="true" />
      {{ error }}
    </p>
  </div>
</template>

<style scoped>
.field {
  display: grid;
  gap: 0.8rem;
}
.field__label {
  display: inline-flex;
  align-items: baseline;
  gap: 0.8rem;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 1.5rem;
  color: var(--text-base);
}
.field__req {
  /* Bleu de confiance (pas l'ambre d'appel): 5.21:1 sur fond clair, conforme au
   * seuil 3:1 de WCAG 1.4.11 pour un marqueur graphique. L'info « requis » reste
   * aussi portee par aria-label et l'attribut required (jamais la seule couleur). */
  color: var(--accent-trust);
  font-weight: 700;
}
.field__opt {
  font-family: var(--font-body);
  font-weight: 400;
  font-size: 1.3rem;
  color: var(--text-muted);
}
.field__control {
  width: 100%;
  padding: 1.4rem 1.6rem;
  font-family: var(--font-body);
  font-size: 1.7rem;
  line-height: 1.4;
  color: var(--text-base);
  background: var(--bg-lift);
  border: var(--line-hair);
  border-radius: var(--radius);
  box-shadow: var(--elev-low);
  transition:
    border-color var(--motion-duration-line) var(--motion-ease-settle),
    box-shadow var(--motion-duration-hover) var(--motion-ease-settle);
}
.field__control--area {
  resize: vertical;
  min-height: 12rem;
}
.field__control::placeholder {
  color: color-mix(in oklch, var(--text-muted) 85%, transparent);
}
.field__control:hover {
  border-color: color-mix(in oklch, var(--text-base) 24%, transparent);
}
.field__control:focus-visible {
  outline: none;
  border-color: var(--accent-trust);
  box-shadow:
    var(--elev-low),
    0 0 0 3px color-mix(in oklch, var(--accent-trust) 24%, transparent);
}

/* Etat d'erreur: filet et halo derives de --error, jamais une couleur en dur. */
.field--error .field__control {
  border-color: var(--error);
}
.field--error .field__control:focus-visible {
  box-shadow:
    var(--elev-low),
    0 0 0 3px color-mix(in oklch, var(--error) 26%, transparent);
}
.field__error {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  margin: 0;
  font-family: var(--font-body);
  font-size: 1.4rem;
  line-height: 1.4;
  color: var(--error);
}
.field__error-icon {
  width: 1.7rem;
  height: 1.7rem;
  flex: none;
}
</style>
