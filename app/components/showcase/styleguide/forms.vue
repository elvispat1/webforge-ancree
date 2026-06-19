<script setup lang="ts">
/* Section Formulaire du Style Guide. Spécimens rendus des contrôles de la
 * famille Minimaliste (Input, Checkbox, CheckboxGroup, RadioGroup, Switch,
 * Select, date, NumberInput, FileInput) et de la rétroaction de soumission
 * (bannière d'erreur, écran de succès), plus un exemple de formulaire complet.
 * Texte naturel via i18n (showcase.styleguide.forms), valeurs pré-remplies
 * incluses (sample_*): localisées pour ne pas figer des données FR dans le HTML
 * EN de la vitrine (reproduite par famille).
 *
 * Le focus est interactif par nature: on en montre une réplique statique (champ
 * rendu avec le souligné accent + label accent figés via la classe .sg-focus),
 * pour le voir d'un coup d'œil sans cliquer. C'est du CSS de vitrine, le
 * composant Input n'est pas modifié.
 */
const { t } = useI18n()

type CssProp = [string, string]
type CssRule = { selector: string; props: CssProp[] }

function formatCss(rule: CssRule): string {
  const body = rule.props.map(([k, v]) => `  ${k}: ${v};`).join('\n')
  return `${rule.selector} {\n${body}\n}`
}

/* États interactifs: le visiteur peut taper / cocher pour voir le comportement. */
const demo = reactive({
  name: '',
  email: t('showcase.styleguide.forms.sample_email'),
  message: '',
  privacy: false,
  analytics: true
})

/* Contrôles de choix (vitrine RadioGroup). */
const radioProject = ref('cuisine')
const radioEmpty = ref('')
const radioContact = ref('courriel')
const radioPlan = ref('essentiel')
const projectOptions = computed(() => [
  { value: 'cuisine', label: t('showcase.styleguide.forms.project_cuisine') },
  { value: 'mobilier', label: t('showcase.styleguide.forms.project_mobilier') },
  { value: 'restauration', label: t('showcase.styleguide.forms.project_restauration') }
])
const contactOptions = computed(() => [
  { value: 'courriel', label: t('showcase.styleguide.forms.contact_courriel') },
  { value: 'telephone', label: t('showcase.styleguide.forms.contact_telephone') },
  { value: 'sms', label: t('showcase.styleguide.forms.contact_sms') }
])
const planOptions = computed(() => [
  { value: 'essentiel', label: t('showcase.styleguide.forms.plan_essentiel_label'), description: t('showcase.styleguide.forms.plan_essentiel_desc') },
  { value: 'multipage', label: t('showcase.styleguide.forms.plan_multipage_label'), description: t('showcase.styleguide.forms.plan_multipage_desc') },
  { value: 'builder', label: t('showcase.styleguide.forms.plan_builder_label'), description: t('showcase.styleguide.forms.plan_builder_desc') }
])
const checkServices = ref(['cuisine', 'restauration'])
const checkEmpty = ref<string[]>([])
const serviceOptions = computed(() => [
  { value: 'cuisine', label: t('showcase.styleguide.forms.service_cuisine') },
  { value: 'mobilier', label: t('showcase.styleguide.forms.service_mobilier') },
  { value: 'restauration', label: t('showcase.styleguide.forms.service_restauration') },
  { value: 'rangement', label: t('showcase.styleguide.forms.service_rangement') }
])

/* Saisie avancée (vitrine Select / Date / Number / File). */
const selProvince = ref('qc')
const selEmpty = ref('')
const provinceOptions = computed(() => [
  { value: 'qc', label: t('showcase.styleguide.forms.province_qc') },
  { value: 'on', label: t('showcase.styleguide.forms.province_on') },
  { value: 'nb', label: t('showcase.styleguide.forms.province_nb') }
])
const categoryOptions = computed(() => [
  { value: 'cuisine', label: t('showcase.styleguide.forms.category_cuisine') },
  { value: 'mobilier', label: t('showcase.styleguide.forms.category_mobilier') },
  { value: 'restauration', label: t('showcase.styleguide.forms.category_restauration') }
])
const datePref = ref('2026-07-15')
const qty = ref(2)
const projectFile = ref<File | null>(null)

/* Formulaire complet: champs pré-remplis pour montrer l'allure « complétée ». */
const full = reactive({
  name: t('showcase.styleguide.forms.sample_name'),
  email: t('showcase.styleguide.forms.sample_email'),
  phone: t('showcase.styleguide.forms.sample_phone'),
  message: t('showcase.styleguide.forms.sample_message'),
  privacy: true
})

/* Règles CSS documentées, reprises telles quelles de global.css (extraits des
 * propriétés qui portent l'état; pas la règle complète). */
const fieldLabelFloat: CssRule = {
  selector: '.wf-field__control:not(:placeholder-shown) ~ .wf-field__label',
  props: [
    ['transform', 'translateY(0.4rem) scale(1)'],
    ['color', 'var(--text-base)']
  ]
}
const fieldFocus: CssRule = {
  selector: '.wf-field__control:focus',
  props: [
    ['border-bottom-color', 'var(--accent-1)'],
    ['box-shadow', '0 1px 0 0 var(--accent-1)']
  ]
}
const fieldError: CssRule = {
  selector: '.wf-field--error .wf-field__control',
  props: [
    ['border-bottom-color', 'var(--error)'],
    ['box-shadow', '0 1px 0 0 var(--error)']
  ]
}
const checkChecked: CssRule = {
  selector: '.wf-check__input:checked',
  props: [
    ['background-color', 'var(--accent-1)'],
    ['border-color', 'var(--accent-1)']
  ]
}
const checkError: CssRule = {
  selector: '.wf-check--error .wf-check__input',
  props: [
    ['border-color', 'var(--error)']
  ]
}
const switchChecked: CssRule = {
  selector: '.wf-switch__input:checked',
  props: [
    ['background', 'var(--accent-1)'],
    ['border-color', 'var(--accent-1)']
  ]
}
const formBanner: CssRule = {
  selector: '.wf-form-banner',
  props: [
    ['background', 'var(--error-soft)'],
    ['border-left', '4px solid var(--error)']
  ]
}
const formCard: CssRule = {
  selector: '.wf-form',
  props: [
    ['display', 'grid'],
    ['gap', 'calc(var(--spacing-unit) * 4)'],
    ['padding', 'calc(var(--spacing-unit) * 4)'],
    ['background', 'var(--bg-base)'],
    ['border-radius', 'var(--radius)']
  ]
}
</script>

<template>
  <div class="wf-styleguide">

    <!-- CHAMPS TEXTE ────────────────────────────────────────────────────── -->
    <section id="champs" class="wf-styleguide-section">
      <div class="wf-container">
        <h2 class="wf-h2 wf-styleguide-section__title">{{ t('showcase.styleguide.forms.section_champs') }}</h2>

        <div class="sg-atoms-group">
          <h3 class="wf-h4 sg-atoms-group__title">{{ t('showcase.styleguide.forms.group_input') }}</h3>

          <div class="sg-row">
            <div class="sg-row__sample">
              <Input v-model="demo.name" :label="t('showcase.styleguide.forms.label_name')" type="text" required autocomplete="name" />
            </div>
            <div class="sg-row__meta">
              <pre class="sg-css">&lt;Input v-model=&quot;…&quot;
  label=&quot;Nom&quot;
  type=&quot;text&quot; required /&gt;</pre>
            </div>
          </div>

          <div class="sg-row">
            <div class="sg-row__sample">
              <Input v-model="demo.email" :label="t('showcase.styleguide.forms.label_email')" type="email" required autocomplete="email" />
            </div>
            <div class="sg-row__meta">
              <pre class="sg-css">{{ formatCss(fieldLabelFloat) }}</pre>
            </div>
          </div>

          <div class="sg-row">
            <div class="sg-row__sample">
              <Input class="sg-focus" :model-value="t('showcase.styleguide.forms.sample_name')" :label="t('showcase.styleguide.forms.label_name')" type="text" />
              <span class="sg-tag">{{ t('showcase.styleguide.forms.focus_tag') }}</span>
            </div>
            <div class="sg-row__meta">
              <pre class="sg-css">{{ formatCss(fieldFocus) }}</pre>
            </div>
          </div>

          <div class="sg-row">
            <div class="sg-row__sample">
              <Input :model-value="t('showcase.styleguide.forms.sample_email_partial')" :label="t('showcase.styleguide.forms.label_email')" type="email" :error="t('showcase.styleguide.forms.error_email')" />
            </div>
            <div class="sg-row__meta">
              <pre class="sg-css">{{ formatCss(fieldError) }}</pre>
            </div>
          </div>

          <div class="sg-row">
            <div class="sg-row__sample">
              <Input v-model="demo.message" :label="t('showcase.styleguide.forms.label_project')" type="textarea" :rows="4" />
            </div>
            <div class="sg-row__meta">
              <pre class="sg-css">&lt;Input v-model=&quot;…&quot;
  label=&quot;Votre projet&quot;
  type=&quot;textarea&quot;
  :rows=&quot;4&quot; /&gt;</pre>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- SÉLECTION ───────────────────────────────────────────────────────── -->
    <section id="selection" class="wf-styleguide-section">
      <div class="wf-container">
        <h2 class="wf-h2 wf-styleguide-section__title">{{ t('showcase.styleguide.forms.section_selection') }}</h2>

        <!-- Checkbox -->
        <div class="sg-atoms-group">
          <h3 class="wf-h4 sg-atoms-group__title">{{ t('showcase.styleguide.forms.group_checkbox') }}</h3>

          <div class="sg-row">
            <div class="sg-row__sample">
              <Checkbox v-model="demo.privacy" required>
                {{ t('showcase.styleguide.forms.consent_prefix') }} <NuxtLink to="/one-pager">{{ t('showcase.styleguide.forms.consent_link') }}</NuxtLink>.
              </Checkbox>
            </div>
            <div class="sg-row__meta">
              <pre class="sg-css">&lt;Checkbox v-model=&quot;…&quot; required&gt;
  J'accepte la &lt;NuxtLink&gt;…&lt;/NuxtLink&gt;.
&lt;/Checkbox&gt;</pre>
            </div>
          </div>

          <div class="sg-row">
            <div class="sg-row__sample">
              <Checkbox :model-value="true">
                {{ t('showcase.styleguide.forms.consent_prefix') }} <NuxtLink to="/one-pager">{{ t('showcase.styleguide.forms.consent_link') }}</NuxtLink>.
              </Checkbox>
            </div>
            <div class="sg-row__meta">
              <pre class="sg-css">{{ formatCss(checkChecked) }}</pre>
            </div>
          </div>

          <div class="sg-row">
            <div class="sg-row__sample">
              <Checkbox :model-value="false" :error="t('showcase.styleguide.forms.error_consent')">
                {{ t('showcase.styleguide.forms.consent_prefix') }} <NuxtLink to="/one-pager">{{ t('showcase.styleguide.forms.consent_link') }}</NuxtLink>.
              </Checkbox>
            </div>
            <div class="sg-row__meta">
              <pre class="sg-css">{{ formatCss(checkError) }}</pre>
            </div>
          </div>
        </div>

        <!-- CheckboxGroup -->
        <div class="sg-atoms-group">
          <h3 class="wf-h4 sg-atoms-group__title">{{ t('showcase.styleguide.forms.group_checkboxgroup') }}</h3>

          <div class="sg-row">
            <div class="sg-row__sample">
              <CheckboxGroup v-model="checkServices" :legend="t('showcase.styleguide.forms.legend_services')" :options="serviceOptions" />
            </div>
            <div class="sg-row__meta">
              <pre class="sg-css">&lt;CheckboxGroup v-model="…"
  legend="…"
  :options="opts" /&gt;</pre>
            </div>
          </div>

          <div class="sg-row">
            <div class="sg-row__sample">
              <CheckboxGroup v-model="checkEmpty" :legend="t('showcase.styleguide.forms.legend_services')" :options="serviceOptions" required :error="t('showcase.styleguide.forms.error_services')" />
            </div>
            <div class="sg-row__meta">
              <pre class="sg-css">:error="'…'"</pre>
            </div>
          </div>
        </div>

        <!-- RadioGroup -->
        <div class="sg-atoms-group">
          <h3 class="wf-h4 sg-atoms-group__title">{{ t('showcase.styleguide.forms.group_radiogroup') }}</h3>

          <div class="sg-row">
            <div class="sg-row__sample">
              <RadioGroup v-model="radioProject" :legend="t('showcase.styleguide.forms.legend_project')" :options="projectOptions" required />
            </div>
            <div class="sg-row__meta">
              <pre class="sg-css">&lt;RadioGroup v-model="…"
  legend="…"
  :options="opts" required /&gt;</pre>
            </div>
          </div>

          <div class="sg-row">
            <div class="sg-row__sample">
              <RadioGroup v-model="radioEmpty" :legend="t('showcase.styleguide.forms.legend_project')" :options="projectOptions" required :error="t('showcase.styleguide.forms.error_radio')" />
            </div>
            <div class="sg-row__meta">
              <pre class="sg-css">:error="'…'"</pre>
            </div>
          </div>

          <div class="sg-row">
            <div class="sg-row__sample">
              <RadioGroup v-model="radioContact" :legend="t('showcase.styleguide.forms.legend_contact')" :options="contactOptions" variant="segmented" />
            </div>
            <div class="sg-row__meta">
              <pre class="sg-css">variant="segmented"</pre>
            </div>
          </div>

          <div class="sg-row">
            <div class="sg-row__sample">
              <RadioGroup v-model="radioPlan" :legend="t('showcase.styleguide.forms.legend_plan')" :options="planOptions" variant="cards" />
            </div>
            <div class="sg-row__meta">
              <pre class="sg-css">variant="cards"</pre>
            </div>
          </div>
        </div>

        <!-- Switch -->
        <div class="sg-atoms-group">
          <h3 class="wf-h4 sg-atoms-group__title">{{ t('showcase.styleguide.forms.group_switch') }}</h3>

          <div class="sg-row">
            <div class="sg-row__sample">
              <Switch v-model="demo.analytics" :label="t('showcase.styleguide.forms.label_analytics')" :description="t('showcase.styleguide.forms.desc_analytics')" />
            </div>
            <div class="sg-row__meta">
              <pre class="sg-css">{{ formatCss(switchChecked) }}</pre>
            </div>
          </div>

          <div class="sg-row">
            <div class="sg-row__sample">
              <Switch :model-value="true" disabled :label="t('showcase.styleguide.forms.label_necessary')" :description="t('showcase.styleguide.forms.desc_necessary')" />
            </div>
            <div class="sg-row__meta">
              <pre class="sg-css">&lt;Switch :model-value=&quot;true&quot;
  disabled
  :label=&quot;…&quot; /&gt;</pre>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- SAISIE AVANCÉE ────────────────────────────────────────────────────── -->
    <section id="saisie" class="wf-styleguide-section">
      <div class="wf-container">
        <h2 class="wf-h2 wf-styleguide-section__title">{{ t('showcase.styleguide.forms.section_saisie') }}</h2>

        <!-- Select -->
        <div class="sg-atoms-group">
          <h3 class="wf-h4 sg-atoms-group__title">{{ t('showcase.styleguide.forms.group_select') }}</h3>

          <div class="sg-row">
            <div class="sg-row__sample">
              <Select v-model="selProvince" :label="t('showcase.styleguide.forms.label_province')" :options="provinceOptions" required />
            </div>
            <div class="sg-row__meta">
              <pre class="sg-css">&lt;Select v-model="…"
  label="Province"
  :options="opts" required /&gt;</pre>
            </div>
          </div>

          <div class="sg-row">
            <div class="sg-row__sample">
              <Select v-model="selEmpty" :label="t('showcase.styleguide.forms.label_category')" :options="categoryOptions" :placeholder="t('showcase.styleguide.forms.placeholder_category')" required :error="t('showcase.styleguide.forms.error_category')" />
            </div>
            <div class="sg-row__meta">
              <pre class="sg-css">placeholder="…"
:error="'…'"</pre>
            </div>
          </div>
        </div>

        <!-- Input date -->
        <div class="sg-atoms-group">
          <h3 class="wf-h4 sg-atoms-group__title">{{ t('showcase.styleguide.forms.group_date') }}</h3>

          <div class="sg-row">
            <div class="sg-row__sample">
              <Input v-model="datePref" :label="t('showcase.styleguide.forms.label_date')" type="date" />
            </div>
            <div class="sg-row__meta">
              <pre class="sg-css">&lt;Input v-model="…"
  label="Date souhaitée"
  type="date" /&gt;</pre>
            </div>
          </div>
        </div>

        <!-- NumberInput -->
        <div class="sg-atoms-group">
          <h3 class="wf-h4 sg-atoms-group__title">{{ t('showcase.styleguide.forms.group_number') }}</h3>

          <div class="sg-row">
            <div class="sg-row__sample">
              <NumberInput v-model="qty" :label="t('showcase.styleguide.forms.label_qty')" :min="1" :max="10" />
            </div>
            <div class="sg-row__meta">
              <pre class="sg-css">&lt;NumberInput v-model="…"
  label="Quantité"
  :min="1" :max="10" /&gt;</pre>
            </div>
          </div>
        </div>

        <!-- FileInput -->
        <div class="sg-atoms-group">
          <h3 class="wf-h4 sg-atoms-group__title">{{ t('showcase.styleguide.forms.group_file') }}</h3>

          <div class="sg-row">
            <div class="sg-row__sample">
              <FileInput v-model="projectFile" :label="t('showcase.styleguide.forms.label_photo')" :button-text="t('showcase.styleguide.forms.button_photo')" accept="image/*" />
            </div>
            <div class="sg-row__meta">
              <pre class="sg-css">&lt;FileInput v-model="…"
  label="Photo du projet"
  accept="image/*" /&gt;</pre>
            </div>
          </div>
        </div>

      </div>
    </section>

    <!-- RÉTROACTION ─────────────────────────────────────────────────────── -->
    <section id="retroaction" class="wf-styleguide-section">
      <div class="wf-container">
        <h2 class="wf-h2 wf-styleguide-section__title">{{ t('showcase.styleguide.forms.section_retroaction') }}</h2>

        <div class="sg-atoms-group">
          <h3 class="wf-h4 sg-atoms-group__title">{{ t('showcase.styleguide.forms.group_banner') }}</h3>

          <div class="sg-row">
            <div class="sg-row__sample">
              <div class="wf-form-banner" role="alert">
                <strong>{{ t('showcase.styleguide.forms.banner_title') }}</strong>
                <span>{{ t('showcase.styleguide.forms.banner_body') }}</span>
              </div>
            </div>
            <div class="sg-row__meta">
              <pre class="sg-css">{{ formatCss(formBanner) }}</pre>
            </div>
          </div>
        </div>

        <div class="sg-atoms-group">
          <h3 class="wf-h4 sg-atoms-group__title">{{ t('showcase.styleguide.forms.group_success') }}</h3>

          <div class="sg-row">
            <div class="sg-row__sample">
              <FormSuccess :title="t('showcase.styleguide.forms.success_title')" :body="t('showcase.styleguide.forms.success_body')" />
            </div>
            <div class="sg-row__meta">
              <pre class="sg-css">&lt;FormSuccess
  :title=&quot;…&quot;
  :body=&quot;…&quot; /&gt;</pre>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- EXEMPLE COMPLET ─────────────────────────────────────────────────── -->
    <section id="exemple" class="wf-styleguide-section">
      <div class="wf-container">
        <h2 class="wf-h2 wf-styleguide-section__title">{{ t('showcase.styleguide.forms.section_exemple') }}</h2>

        <div class="sg-example">
          <div class="sg-form-demo">
            <form class="wf-form" novalidate @submit.prevent>
              <Input v-model="full.name" :label="t('showcase.styleguide.forms.label_name')" type="text" required autocomplete="name" />
              <Input v-model="full.email" :label="t('showcase.styleguide.forms.label_email')" type="email" required autocomplete="email" />
              <Input v-model="full.phone" :label="t('showcase.styleguide.forms.label_phone')" type="tel" autocomplete="tel" />
              <Input v-model="full.message" :label="t('showcase.styleguide.forms.label_project')" type="textarea" :rows="4" />
              <Checkbox v-model="full.privacy" required>
                {{ t('showcase.styleguide.forms.consent_prefix') }} <NuxtLink to="/one-pager">{{ t('showcase.styleguide.forms.consent_link') }}</NuxtLink>.
              </Checkbox>
              <Button type="submit" class="wf-form-submit" icon="lucide:chevron-right">{{ t('showcase.styleguide.forms.button_submit') }}</Button>
            </form>
          </div>
          <div class="sg-example__meta">
            <pre class="sg-css">{{ formatCss(formCard) }}</pre>
          </div>
        </div>
      </div>
    </section>

  </div>
</template>

<style scoped>
/* Coquille de page, répliquée de /showcase styleguide (scoped, donc isolée). */
.wf-styleguide {
  padding-bottom: calc(var(--spacing-unit) * 4);
}
.wf-styleguide-section {
  padding-block: calc(var(--spacing-unit) * 6);
  border-bottom: var(--line-hair);
  scroll-margin-top: 2rem; /* léger décalage d'ancre (nav latérale, plus en haut) */
}
.wf-styleguide-section:first-child {
  padding-top: calc(var(--spacing-unit) * 4);
}
.wf-styleguide-section:last-child {
  border-bottom: none;
}
.wf-styleguide-section__title {
  margin-bottom: calc(var(--spacing-unit) * 4);
}

/* Groupes + pattern row 8fr/4fr, répliqués d'atoms.vue (même langage visuel). */
.sg-atoms-group {
  margin-bottom: calc(var(--spacing-unit) * 6);
}
.sg-atoms-group:last-child {
  margin-bottom: 0;
}
.sg-atoms-group__title {
  margin-bottom: calc(var(--spacing-unit) * 4);
  color: var(--text-base);
}

.sg-row {
  display: grid;
  grid-template-columns: 8fr 4fr;
  gap: calc(var(--spacing-unit) * 3);
  align-items: start;
  padding-block: calc(var(--spacing-unit) * 3);
  border-bottom: var(--line-hair);
}
.sg-row:last-child {
  border-bottom: none;
}
.sg-row__sample {
  min-width: 0;
}
.sg-row__meta {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing-unit) * 1.5);
}

.sg-css {
  font-family: var(--font-mono);
  font-size: 1.2rem;
  line-height: 1.55;
  margin: 0;
  white-space: pre;
  color: var(--text-base);
  background: var(--bg-alt);
  padding: calc(var(--spacing-unit) * 1.5) calc(var(--spacing-unit) * 2);
  border-radius: var(--radius);
  overflow-x: auto;
}

/* Réplique statique du focus: force le style :focus du contrôle réel sans focus
 * réel. :deep() perce la frontière scoped pour atteindre l'intérieur d'<Input>. */
.sg-focus :deep(.wf-field__control) {
  border-bottom-color: var(--accent-1);
  box-shadow: 0 1px 0 0 var(--accent-1);
}
.sg-focus :deep(.wf-field__label) {
  color: var(--accent-1);
}
.sg-tag {
  display: inline-block;
  margin-top: calc(var(--spacing-unit) * 1.5);
  font-family: var(--font-mono);
  font-size: 1.1rem;
  letter-spacing: 0.04em;
  color: var(--text-muted);
}

/* Exemple complet: formulaire borné (colonne réaliste) + sa note. */
.sg-example {
  display: grid;
  grid-template-columns: minmax(0, 48rem) 1fr;
  gap: calc(var(--spacing-unit) * 4);
  align-items: start;
}
.sg-form-demo {
  min-width: 0;
}
.sg-example__meta {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing-unit) * 1.5);
  padding-top: calc(var(--spacing-unit) * 2);
}
</style>
