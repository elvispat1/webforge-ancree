<script setup lang="ts">
/* Contact: le formulaire d'appel pose A COTE des coordonnees et de la zone de
 * service. Asymetrie posee (DESIGN.md): un panneau bleu nuit « coordonnees + zone »
 * avec le motif de couverture radial repris du bloc service-cities, et a cote la
 * carte blanche du formulaire. Le formulaire valide cote client, deplace le focus
 * vers le premier champ en faute, et bascule vers un panneau de confirmation au
 * succes. Plomberie reelle TERRAIN (useContactForm + honeypot + Turnstile + route
 * /api/contact, niveau demo): en statique pur le succes est simule cote client
 * (contactDemo), Turnstile dormant (aucune cle publique). Le bouton d'envoi n'est
 * JAMAIS desactive; la double soumission est gardee par status === 'loading'.
 * Aucune numerotation. */
import type { BlockBase } from '~/types/blocks'
import type { ContactContent } from '~/content/contact'
import { useContactForm, type ContactField } from '~/composables/useContactForm'

type ContactBlock = BlockBase<'contact'> & ContactContent

defineProps<ContactBlock>()
const { t, locale } = useI18n()

// Messages d'erreur (chrome i18n, pas du contenu): generiques et reutilisables.
const errorMessages: Record<ContactField, string> = {
  name: t('contact.error_name'),
  contact: t('contact.error_contact'),
  message: ''
}

const { status, values, errors, turnstileToken, honeypot, submit, validate } = useContactForm(errorMessages)

// Cle publique Turnstile: vide en demo -> le widget n'est pas rendu (le geste
// anti-bot est TERRAIN, actif seulement sur un vrai site client). Le widget reste
// monte/demonte par le v-if; on garde une ref pour le reinitialiser apres erreur.
const { public: { turnstileSiteKey } } = useRuntimeConfig()
const turnstile = ref<{ reset: () => void } | null>(null)

// Identifiants stables des champs, pour l'association label / aria-describedby.
const fieldId: Record<ContactField, string> = {
  name: 'contact-name',
  contact: 'contact-contact',
  message: 'contact-message'
}

const successPanel = ref<{ focus: () => void } | null>(null)

async function onSubmit(): Promise<void> {
  await submit((firstInvalid) => {
    // Replace le focus sur le premier champ en faute (accessibilite).
    const el = document.getElementById(fieldId[firstInvalid])
    el?.focus()
  })
}

// Au succes, on deplace le focus vers le panneau de confirmation pour que le
// lecteur d'ecran annonce le changement d'etat. A l'echec, un nouveau jeton
// Turnstile est requis pour reessayer: on vide le jeton et on reinitialise le
// widget (la banniere d'erreur, elle, s'annonce via role="alert").
watch(status, async (next) => {
  if (next === 'success') {
    await nextTick()
    successPanel.value?.focus()
  } else if (next === 'error') {
    turnstileToken.value = ''
    turnstile.value?.reset()
  }
})

// Revalide a la perte de focus seulement si le champ portait deja une erreur
// (on ne harcele pas l'utilisateur en cours de frappe).
function onBlur(field: ContactField): void {
  if (errors[field]) validate()
}

function metaKind(href: string): 'external' | 'anchor' | 'internal' {
  if (href.startsWith('#') || href.startsWith('tel:') || href.startsWith('mailto:')) return 'anchor'
  if (href.startsWith('http')) return 'external'
  return 'internal'
}

const NuxtLink = resolveComponent('NuxtLink')
</script>

<template>
  <section class="contact">
    <div class="wf-container">
      <SectionHead :eyebrow="eyebrow" :heading="heading" :lead="lead" />

      <div class="contact__layout section-grid">
        <!-- Coordonnees + zone de service: panneau bleu nuit, motif radial local. -->
        <aside class="contact__aside" data-reveal>
          <svg class="contact__rings" viewBox="0 0 200 200" aria-hidden="true" focusable="false">
            <circle cx="100" cy="100" r="92" />
            <circle cx="100" cy="100" r="66" />
            <circle cx="100" cy="100" r="40" />
            <circle cx="100" cy="100" r="16" />
          </svg>
          <div class="contact__aside-body">
            <span class="contact__pin" aria-hidden="true">
              <Icon name="lucide:map-pin" />
            </span>
            <dl class="contact__meta">
              <div v-for="item in meta" :key="item.label" class="contact__meta-item">
                <dt class="contact__meta-label wf-caption">{{ item.label }}</dt>
                <dd class="contact__meta-value">
                  <component
                    :is="item.href ? (metaKind(item.href) === 'internal' ? NuxtLink : 'a') : 'span'"
                    v-if="item.value"
                    :to="item.href && metaKind(item.href) === 'internal' ? item.href : undefined"
                    :href="item.href && metaKind(item.href) !== 'internal' ? item.href : undefined"
                    class="contact__meta-line"
                    :class="{ 'contact__meta-line--link': item.href }"
                  >
                    {{ item.value }}
                  </component>
                  <template v-if="item.lines">
                    <span v-for="line in item.lines" :key="line" class="contact__meta-line">{{ line }}</span>
                  </template>
                </dd>
              </div>
            </dl>
          </div>
        </aside>

        <!-- Formulaire d'appel ou confirmation au succes. -->
        <div class="contact__form-col" data-reveal>
          <FormSuccess
            v-if="status === 'success'"
            ref="successPanel"
            :title="form.success.title"
            :body="form.success.body"
          />
          <form v-else class="contact__form" novalidate @submit.prevent="onSubmit">
            <!-- Honeypot anti-bot: hors ecran, ignore des humains, rempli par les
                 robots. Le serveur renvoie un succes silencieux s'il est rempli. -->
            <div class="contact__hp" aria-hidden="true">
              <label for="contact-website">Website</label>
              <input
                id="contact-website"
                v-model="honeypot"
                type="text"
                name="website"
                tabindex="-1"
                autocomplete="off"
              >
            </div>

            <Input
              :id="fieldId.name"
              v-model="values.name"
              :label="form.fields.name.label"
              :required="form.fields.name.required"
              :error="errors.name"
              :required-label="t('contact.required')"
              autocomplete="name"
              @blur="onBlur('name')"
            />
            <Input
              :id="fieldId.contact"
              v-model="values.contact"
              :label="form.fields.contact.label"
              :required="form.fields.contact.required"
              :error="errors.contact"
              :required-label="t('contact.required')"
              autocomplete="email"
              @blur="onBlur('contact')"
            />
            <Input
              :id="fieldId.message"
              v-model="values.message"
              :label="form.fields.message.label"
              :required="form.fields.message.required"
              :optional-label="t('contact.optional')"
              multiline
              :rows="5"
              @blur="onBlur('message')"
            />

            <div class="contact__actions" :class="{ 'contact__actions--loading': status === 'loading' }">
              <Button
                type="submit"
                variant="call"
                :icon="status === 'loading' ? 'lucide:loader-circle' : 'lucide:send'"
                :aria-busy="status === 'loading' ? 'true' : undefined"
              >
                {{ status === 'loading' ? form.submitLoading : form.submitIdle }}
              </Button>
            </div>

            <!-- Banniere d'echec: le formulaire reste en place pour reessayer.
                 role="alert" annonce le changement au lecteur d'ecran. Bord plein
                 ambre/brique (jamais de filet lateral), ton chaud, posee. -->
            <div v-if="status === 'error'" class="contact__error" role="alert">
              <Icon name="lucide:triangle-alert" class="contact__error-icon" aria-hidden="true" />
              <div class="contact__error-text">
                <p class="contact__error-title">{{ form.errorBanner.title }}</p>
                <p class="contact__error-body wf-body-3">{{ form.errorBanner.body }}</p>
              </div>
            </div>

            <!-- Anti-bot Turnstile, sous le bouton. Rendu seulement si une cle
                 publique est configuree (donc absent en demo). La boite est rendue
                 par Cloudflare; la langue suit la locale du site. -->
            <ClientOnly>
              <TurnstileWidget
                v-if="turnstileSiteKey"
                ref="turnstile"
                :site-key="turnstileSiteKey"
                action="contact"
                :language="locale"
                @success="(token: string) => (turnstileToken = token)"
                @expired="() => (turnstileToken = '')"
                @error="() => (turnstileToken = '')"
              />
            </ClientOnly>

            <p v-if="form.privacyNote" class="contact__privacy wf-body-3">
              <Icon name="lucide:lock" class="contact__privacy-icon" aria-hidden="true" />
              {{ form.privacyNote }}
            </p>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.contact {
  padding-block: var(--space-block-default);
  background: var(--bg-base);
}
.contact__layout {
  margin-top: 4.8rem;
  align-items: start;
}

/* Panneau coordonnees + zone: bleu nuit, motif de couverture radial. */
.contact__aside {
  position: relative;
  overflow: hidden;
  grid-column: 1 / -1;
  padding: 3.2rem;
  border-radius: var(--radius-lg);
  background: var(--bg-deep);
  color: var(--text-ondeep);
  box-shadow: var(--elev-mid);
}
.contact__rings {
  position: absolute;
  top: -3rem;
  right: -3rem;
  width: 22rem;
  height: 22rem;
  opacity: 0.5;
}
.contact__rings circle {
  fill: none;
  stroke: color-mix(in oklch, var(--accent-call) 55%, transparent);
  stroke-width: 1;
}
.contact__aside-body {
  position: relative;
}
.contact__pin {
  display: grid;
  place-items: center;
  width: 4.4rem;
  height: 4.4rem;
  border-radius: var(--radius);
  background: var(--accent-call);
  color: var(--navy);
  margin-bottom: 2.4rem;
}
.contact__pin svg {
  width: 2.4rem;
  height: 2.4rem;
}
.contact__meta {
  margin: 0;
  display: grid;
  gap: 2.4rem;
}
.contact__meta-item {
  display: grid;
  gap: 0.6rem;
}
.contact__meta-label {
  color: color-mix(in oklch, var(--text-ondeep) 74%, transparent);
}
.contact__meta-value {
  margin: 0;
  display: grid;
  gap: 0.2rem;
}
.contact__meta-line {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 1.8rem;
  line-height: 1.3;
  color: var(--text-ondeep);
  text-decoration: none;
}
.contact__meta-line--link {
  transition: color var(--motion-duration-hover) var(--motion-ease-settle);
}
.contact__meta-line--link:hover {
  color: var(--accent-call);
}

/* Colonne formulaire. */
.contact__form-col {
  grid-column: 1 / -1;
}
.contact__form {
  display: grid;
  gap: 2.4rem;
  padding: 3.2rem;
  background: var(--bg-lift);
  border: var(--line-soft);
  border-radius: var(--radius-lg);
  box-shadow: var(--elev-low);
}
.contact__actions {
  margin-top: 0.4rem;
}
/* Pendant l'envoi factice, l'icone de chargement tourne (rotation continue,
 * coupee par le kill-switch reduced-motion global via la duree tokenisee). */
.contact__actions--loading :deep(.btn__icon) {
  animation: contact-spin var(--motion-duration-spin) linear infinite;
}
@keyframes contact-spin {
  to {
    transform: rotate(360deg);
  }
}

/* Honeypot: hors ecran sans perturber la mise en page, hors tabulation. */
.contact__hp {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  overflow: hidden;
}

/* Banniere d'echec: region teintee a bord plein (pas de filet lateral, banni),
 * ton brique chaud derive de --error, icone et titre slab poses. */
.contact__error {
  display: flex;
  align-items: flex-start;
  gap: 1.2rem;
  padding: 1.8rem 2rem;
  background: var(--error-soft);
  border: var(--line-width) solid color-mix(in oklch, var(--error) 38%, transparent);
  border-radius: var(--radius);
}
.contact__error-icon {
  width: 2.2rem;
  height: 2.2rem;
  flex: none;
  margin-top: 0.2rem;
  color: var(--error);
}
.contact__error-text {
  display: grid;
  gap: 0.4rem;
}
.contact__error-title {
  margin: 0;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.7rem;
  line-height: 1.3;
  color: var(--text-base);
}
.contact__error-body {
  margin: 0;
  color: var(--text-muted);
}
.contact__privacy {
  display: flex;
  align-items: flex-start;
  gap: 0.8rem;
  margin: 0;
}
.contact__privacy-icon {
  width: 1.7rem;
  height: 1.7rem;
  flex: none;
  margin-top: 0.2rem;
  color: var(--accent-trust);
}

@container site (min-width: 1024px) {
  .contact__aside {
    grid-column: 1 / span 6;
    position: sticky;
    top: 3rem;
  }
  .contact__form-col {
    grid-column: 8 / -1;
  }
  .contact__form {
    padding: 4rem;
  }
}
</style>
