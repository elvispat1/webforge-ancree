<script setup lang="ts">
import type { ContactBlock } from '~/types/blocks'

const contact = defineProps<ContactBlock>()

/* Transport + machine à états délégués au composable réutilisable; la validation
 * des champs et ses messages restent ici (ils viennent du contenu). */
const { status, turnstileToken, honeypot, submit } = useContactForm()

/* Clé publique Turnstile: vide en démo → le widget n'est pas rendu. */
const { public: { turnstileSiteKey } } = useRuntimeConfig()

const vals = reactive({
  name: '',
  email: '',
  phone: '',
  message: '',
  privacy: false
})

const errors = reactive<{ name?: string; email?: string; privacy?: string }>({})

/* Prédicats de validité par champ requis, réutilisés par validateField (qui
 * pose les messages d'erreur au blur et à la soumission). Le message est
 * optionnel: aucun prédicat, il n'entre pas dans la validation. */
const isNameValid = computed(() => vals.name.trim().length > 0)
const isEmailValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(vals.email))

/* Validation par champ, déclenchée au blur (pose le message d'erreur).
 * validate() rejoue tout à la soumission, case politique incluse. */
function validateField(field: 'name' | 'email' | 'privacy') {
  if (field === 'name') {
    errors.name = isNameValid.value ? undefined : contact.form.errors.nameRequired
  } else if (field === 'email') {
    errors.email = isEmailValid.value ? undefined : contact.form.errors.emailInvalid
  } else if (field === 'privacy') {
    errors.privacy = vals.privacy ? undefined : contact.form.errors.privacyRequired
  }
}

function validate(): boolean {
  validateField('name')
  validateField('email')
  validateField('privacy')
  return !errors.name && !errors.email && !errors.privacy
}

/* Cocher la case efface son erreur sans attendre la prochaine soumission. */
watch(() => vals.privacy, () => {
  if (errors.privacy) validateField('privacy')
})

/* Refs des contrôles (focus() exposé par Input/Checkbox): à la soumission
 * invalide, le focus se déplace sur le PREMIER champ en erreur (ordre du DOM)
 * pour que l'usager clavier ou lecteur d'écran atterrisse sur quoi corriger. */
type Focusable = { focus: () => void }
const nameField = ref<Focusable | null>(null)
const emailField = ref<Focusable | null>(null)
const privacyField = ref<Focusable | null>(null)

function focusFirstError() {
  const target = errors.name
    ? nameField.value
    : errors.email
      ? emailField.value
      : errors.privacy
        ? privacyField.value
        : null
  target?.focus()
}

/* Au succès, FormSuccess remplace le formulaire sur place: l'élément focusé
 * disparaît du DOM et le focus retomberait au body. On le déplace sur la
 * confirmation (qui s'annonce aussi d'elle-même via role=status). */
const successPanel = ref<Focusable | null>(null)
watch(status, (s) => {
  if (s === 'success') nextTick(() => successPanel.value?.focus())
})

async function onSubmit() {
  // Double soumission bloquée par l'état loading, jamais par un disabled (qui
  // sortirait le bouton de l'ordre de tabulation et rendrait la validation
  // inatteignable au clavier).
  if (status.value === 'loading') return
  if (!validate()) {
    await nextTick()
    focusFirstError()
    return
  }
  // Poste vers /api/contact. En démo (sans clé Resend) la route renvoie un
  // succès simulé; avec les clés posées, elle envoie via Resend + Turnstile.
  await submit({
    name: vals.name,
    email: vals.email,
    phone: vals.phone,
    message: vals.message
  })
}
</script>

<template>
  <section class="wf-section wf-contact" id="contact">
    <div class="wf-container">
      <div class="section-grid wf-contact-grid">
        <div class="wf-contact-copy" data-reveal-stagger>
          <div class="wf-caption">{{ contact.eyebrow }}</div>
          <h2 class="wf-h2">{{ contact.heading }}</h2>
          <p class="wf-body-2 wf-text-muted">{{ contact.lead }}</p>
          <dl class="wf-contact-meta">
            <div v-for="m in contact.meta" :key="m.label">
              <dt>{{ m.label }}</dt>
              <dd>
                <a v-if="m.href" :href="m.href" class="wf-link">{{ m.value }}</a>
                <template v-else-if="m.lines">
                  <template v-for="(line, i) in m.lines" :key="i">
                    {{ line }}<br v-if="i < m.lines.length - 1">
                  </template>
                </template>
              </dd>
            </div>
          </dl>
        </div>

        <div class="wf-contact-form-wrap">
          <!-- État succès: remplace le formulaire sur place une fois l'envoi
               confirmé. Le focus y est déplacé (watch status) puisque le bouton
               focusé vient de disparaître du DOM. -->
          <FormSuccess
            v-if="status === 'success'"
            ref="successPanel"
            :title="contact.success.title"
            :body="contact.success.body"
          />

          <!-- Formulaire -->
          <form
            v-else
            :class="['wf-form', { 'is-loading': status === 'loading' }]"
            novalidate
            @submit.prevent="onSubmit"
          >
            <!-- Honeypot anti-bot: hors écran, ignoré des humains, rempli par les robots. -->
            <div class="wf-hp" aria-hidden="true">
              <label for="contact-website">Website</label>
              <input id="contact-website" v-model="honeypot" type="text" name="website" tabindex="-1" autocomplete="off">
            </div>

            <Input
              ref="nameField"
              v-model="vals.name"
              :label="contact.form.fields.name.label"
              type="text"
              required
              autocomplete="name"
              :error="errors.name"
              @blur="validateField('name')"
            />

            <Input
              ref="emailField"
              v-model="vals.email"
              :label="contact.form.fields.email.label"
              type="email"
              required
              autocomplete="email"
              :error="errors.email"
              @blur="validateField('email')"
            />

            <Input
              v-model="vals.phone"
              :label="contact.form.fields.phone.label"
              type="tel"
              autocomplete="tel"
            />

            <Input
              v-model="vals.message"
              :label="contact.form.fields.message.label"
              type="textarea"
              :rows="5"
            />

            <Checkbox ref="privacyField" v-model="vals.privacy" required :error="errors.privacy">
              {{ contact.form.privacy.text }}
              <NuxtLink :to="contact.form.privacy.href">{{ contact.form.privacy.linkText }}</NuxtLink>.
            </Checkbox>

            <!-- Bouton TOUJOURS actif (pattern a11y): la validation se joue à la
                 soumission, le focus va à la première erreur. Pendant l'envoi le
                 bouton montre un spinner + aria-busy; la double soumission est
                 bloquée par l'état loading dans onSubmit, pas par un disabled. -->
            <Button type="submit" class="wf-form-submit" :loading="status === 'loading'" icon="lucide:chevron-right">
              {{ status === 'loading' ? contact.form.submit.loading : contact.form.submit.idle }}
            </Button>

            <!-- Anti-bot Turnstile, sous le bouton. Rendu seulement si une clé
                 publique est configurée (donc absent en démo). -->
            <ClientOnly>
              <TurnstileWidget
                v-if="turnstileSiteKey"
                :site-key="turnstileSiteKey"
                action="contact"
                @success="(token: string) => (turnstileToken = token)"
                @expired="() => (turnstileToken = '')"
                @error="() => (turnstileToken = '')"
              />
            </ClientOnly>

            <div v-if="status === 'error'" class="wf-form-banner" role="alert">
              <strong>{{ contact.form.errorBanner.title }}</strong>
              <span>{{ contact.form.errorBanner.body }}</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>
