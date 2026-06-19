<script setup lang="ts">
/* Section Typographie du Style Guide. Affiche les familles de police, les
 * poids, l'échelle de titres (wf-h1 à h5), le corps de texte (wf-body-1/2/3),
 * les captions (wf-caption), les éléments spécialisés (figcap) et les
 * modificateurs de couleur (text-base/muted/accent).
 *
 * Pour chaque entrée, la colonne de droite affiche la règle CSS complète
 * en format lisible (sélecteur, accolade, propriétés indentées). Les valeurs
 * reflètent typography.css; tout changement de valeur là-bas doit être
 * propagé manuellement ici. Texte naturel via i18n (showcase.styleguide.typography).
 */

const { t } = useI18n()

type CssProp = [string, string]
type CssRule = { selector: string; props: CssProp[] }

function formatCss(rule: CssRule): string {
  const body = rule.props.map(([k, v]) => `  ${k}: ${v};`).join('\n')
  return `${rule.selector} {\n${body}\n}`
}

const fontWeights: { weight: number; label: string }[] = [
  { weight: 400, label: t('showcase.styleguide.typography.weight_regular') },
  { weight: 500, label: t('showcase.styleguide.typography.weight_medium') },
  { weight: 600, label: t('showcase.styleguide.typography.weight_semibold') }
]

const fontFamilies: { token: string; stack: string; sample: string }[] = [
  {
    token: '--font-display',
    stack: 'Archivo, "Helvetica Neue", Helvetica, Arial, sans-serif',
    sample: t('showcase.styleguide.typography.family_display')
  },
  {
    token: '--font-body',
    stack: 'Archivo, "Helvetica Neue", Helvetica, Arial, sans-serif',
    sample: t('showcase.styleguide.typography.family_body')
  },
  {
    token: '--font-mono',
    stack: 'JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace',
    sample: t('showcase.styleguide.typography.family_mono')
  }
]

const headings: { className: string; label: string; rule: CssRule }[] = [
  { className: 'wf-h1', label: t('showcase.styleguide.typography.heading_1'), rule: { selector: '.wf-h1', props: [
    ['font-family', 'var(--font-display)'],
    ['font-size', 'clamp(3.6rem, calc(2.33rem + 3.38vw), 7.2rem)'],
    ['line-height', '1.04'],
    ['letter-spacing', '-0.035em'],
    ['font-weight', '500']
  ]}},
  { className: 'wf-h2', label: t('showcase.styleguide.typography.heading_2'), rule: { selector: '.wf-h2', props: [
    ['font-family', 'var(--font-display)'],
    ['font-size', 'clamp(2.8rem, calc(1.89rem + 2.44vw), 5.4rem)'],
    ['line-height', '1.08'],
    ['letter-spacing', '-0.028em'],
    ['font-weight', '500']
  ]}},
  { className: 'wf-h3', label: t('showcase.styleguide.typography.heading_3'), rule: { selector: '.wf-h3', props: [
    ['font-family', 'var(--font-display)'],
    ['font-size', 'clamp(2.3rem, calc(1.7rem + 1.6vw), 4rem)'],
    ['line-height', '1.15'],
    ['letter-spacing', '-0.02em'],
    ['font-weight', '500']
  ]}},
  { className: 'wf-h4', label: t('showcase.styleguide.typography.heading_4'), rule: { selector: '.wf-h4', props: [
    ['font-family', 'var(--font-display)'],
    ['font-size', 'clamp(2rem, calc(1.65rem + 0.94vw), 3rem)'],
    ['line-height', '1.2'],
    ['letter-spacing', '-0.015em'],
    ['font-weight', '600']
  ]}},
  { className: 'wf-h5', label: t('showcase.styleguide.typography.heading_5'), rule: { selector: '.wf-h5', props: [
    ['font-family', 'var(--font-display)'],
    ['font-size', 'clamp(1.9rem, calc(1.79rem + 0.28vw), 2.2rem)'],
    ['line-height', '1.25'],
    ['letter-spacing', '-0.01em'],
    ['font-weight', '600']
  ]}}
]

const bodies: { className: string; rule: CssRule }[] = [
  { className: 'wf-body-1', rule: { selector: '.wf-body-1', props: [
    ['font-family', 'var(--font-body)'],
    ['font-size', '1.8rem'],
    ['line-height', '1.55'],
    ['color', 'var(--text-base)']
  ]}},
  { className: 'wf-body-2', rule: { selector: '.wf-body-2', props: [
    ['font-family', 'var(--font-body)'],
    ['font-size', '1.6rem'],
    ['line-height', '1.5'],
    ['color', 'var(--text-base)']
  ]}},
  { className: 'wf-body-3', rule: { selector: '.wf-body-3', props: [
    ['font-family', 'var(--font-body)'],
    ['font-size', '1.4rem'],
    ['line-height', '1.45'],
    ['color', 'var(--text-muted)']
  ]}}
]

const captions: { className: string; rule: CssRule }[] = [
  { className: 'wf-caption', rule: { selector: '.wf-caption', props: [
    ['font-family', 'var(--font-display)'],
    ['font-size', '1.2rem'],
    ['line-height', '1.4'],
    ['letter-spacing', '0.12em'],
    ['text-transform', 'uppercase'],
    ['font-weight', '600'],
    ['color', 'var(--text-muted)']
  ]}}
]

const specials: { className: string; label: string; rule: CssRule }[] = [
  { className: 'wf-figcap', label: t('showcase.styleguide.typography.figcap_sample'), rule: { selector: '.wf-figcap', props: [
    ['font-family', 'var(--font-display)'],
    ['font-size', '1.2rem'],
    ['line-height', '1.4'],
    ['letter-spacing', '0.005em'],
    ['color', 'var(--text-muted)']
  ]}}
]

const colorMods: { className: string; rule: CssRule }[] = [
  { className: 'wf-text-base',   rule: { selector: '.wf-text-base',   props: [['color', 'var(--text-base)']] }},
  { className: 'wf-text-muted',  rule: { selector: '.wf-text-muted',  props: [['color', 'var(--text-muted)']] }},
  { className: 'wf-text-accent', rule: { selector: '.wf-text-accent', props: [['color', 'var(--accent-1)']] }}
]

const sampleSentence = t('showcase.styleguide.typography.sample_sentence')
</script>

<template>
  <div class="sg-typo">

    <!-- Familles de police -->
    <div class="sg-typo-group">
      <h3 class="wf-h4 sg-typo-group__title">{{ t('showcase.styleguide.typography.group_families') }}</h3>
      <p class="wf-body-3 sg-typo-group__note">
        {{ t('showcase.styleguide.typography.families_note') }}
      </p>
      <div v-for="f in fontFamilies" :key="f.token" class="sg-typo-row">
        <div class="sg-typo-row__sample" :style="{ fontFamily: f.stack, fontSize: '2.4rem' }">
          {{ f.sample }}
        </div>
        <div class="sg-typo-row__meta">
          <pre class="sg-css">{{ f.token }}: {{ f.stack }};</pre>
        </div>
      </div>
    </div>

    <!-- Poids de police -->
    <div class="sg-typo-group">
      <h3 class="wf-h4 sg-typo-group__title">{{ t('showcase.styleguide.typography.group_weights') }}</h3>
      <p class="wf-body-3 sg-typo-group__note">
        {{ t('showcase.styleguide.typography.weights_note') }}
      </p>
      <div v-for="w in fontWeights" :key="w.weight" class="sg-typo-row">
        <!-- Specimen: le nom du poids rendu DANS ce poids (générique, localisé,
             agnostique de la marque). D3. -->
        <div class="sg-typo-row__sample" :style="{ fontWeight: w.weight, fontSize: '2rem', fontFamily: 'var(--font-display)' }">
          {{ w.label }}
        </div>
        <div class="sg-typo-row__meta">
          <pre class="sg-css">font-weight: {{ w.weight }};</pre>
        </div>
      </div>
    </div>

    <!-- Headings -->
    <div class="sg-typo-group">
      <h3 class="wf-h4 sg-typo-group__title">{{ t('showcase.styleguide.typography.group_headings') }}</h3>
      <p class="wf-body-3 sg-typo-group__note">
        {{ t('showcase.styleguide.typography.headings_note') }}
      </p>
      <div v-for="h in headings" :key="h.className" class="sg-typo-row">
        <div class="sg-typo-row__sample">
          <span :class="h.className">{{ h.label }}</span>
        </div>
        <div class="sg-typo-row__meta">
          <pre class="sg-css">{{ formatCss(h.rule) }}</pre>
        </div>
      </div>
    </div>

    <!-- Body -->
    <div class="sg-typo-group">
      <h3 class="wf-h4 sg-typo-group__title">{{ t('showcase.styleguide.typography.group_body') }}</h3>
      <div v-for="b in bodies" :key="b.className" class="sg-typo-row">
        <div class="sg-typo-row__sample">
          <p :class="b.className">{{ sampleSentence }} {{ sampleSentence }}</p>
        </div>
        <div class="sg-typo-row__meta">
          <pre class="sg-css">{{ formatCss(b.rule) }}</pre>
        </div>
      </div>
    </div>

    <!-- Caption -->
    <div class="sg-typo-group">
      <h3 class="wf-h4 sg-typo-group__title">{{ t('showcase.styleguide.typography.group_captions') }}</h3>
      <div v-for="c in captions" :key="c.className" class="sg-typo-row">
        <div class="sg-typo-row__sample">
          <p :class="c.className">{{ t('showcase.styleguide.typography.caption_sample') }}</p>
        </div>
        <div class="sg-typo-row__meta">
          <pre class="sg-css">{{ formatCss(c.rule) }}</pre>
        </div>
      </div>
    </div>

    <!-- Éléments spécialisés -->
    <div class="sg-typo-group">
      <h3 class="wf-h4 sg-typo-group__title">{{ t('showcase.styleguide.typography.group_specials') }}</h3>
      <div v-for="s in specials" :key="s.className" class="sg-typo-row">
        <div class="sg-typo-row__sample">
          <p :class="s.className">{{ s.label }}</p>
        </div>
        <div class="sg-typo-row__meta">
          <pre class="sg-css">{{ formatCss(s.rule) }}</pre>
        </div>
      </div>
    </div>

    <!-- Modificateurs de couleur -->
    <div class="sg-typo-group">
      <h3 class="wf-h4 sg-typo-group__title">{{ t('showcase.styleguide.typography.group_colors') }}</h3>
      <div v-for="m in colorMods" :key="m.className" class="sg-typo-row">
        <div class="sg-typo-row__sample">
          <p class="wf-body-1" :class="m.className">{{ sampleSentence }}</p>
        </div>
        <div class="sg-typo-row__meta">
          <pre class="sg-css">{{ formatCss(m.rule) }}</pre>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.sg-typo-group {
  margin-bottom: calc(var(--spacing-unit) * 6);
}
.sg-typo-group:last-child {
  margin-bottom: 0;
}
.sg-typo-group__title {
  margin-bottom: calc(var(--spacing-unit) * 4); /* 40px, titre → contenu sans description */
  color: var(--text-base);
}

.sg-typo-row {
  display: grid;
  grid-template-columns: 8fr 4fr;
  gap: calc(var(--spacing-unit) * 3);
  align-items: start;
  padding-block: calc(var(--spacing-unit) * 3);
  border-bottom: var(--line-hair);
}
.sg-typo-row:last-child {
  border-bottom: none;
}

.sg-typo-row__sample {
  min-width: 0;
}
.sg-typo-row__sample p {
  margin: 0;
}

.sg-typo-row__meta {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing-unit) * 1.5);
}

.sg-css {
  font-family: var(--font-mono);
  font-size: 1.2rem; /* 12px @ 1440, code/meta dev — exception assumée hors échelle body */
  line-height: 1.55;
  margin: 0;
  white-space: pre;
  color: var(--text-base);
  background: var(--bg-alt);
  padding: calc(var(--spacing-unit) * 1.5) calc(var(--spacing-unit) * 2);
  border-radius: var(--radius);
  overflow-x: auto;
}
.sg-typo-group__note {
  color: var(--text-muted);
  /* -20px top remonte sous le titre (20px effectif), 40px bottom vers le contenu. */
  margin: calc(var(--spacing-unit) * -2) 0 calc(var(--spacing-unit) * 4);
  max-width: 70ch;
}
</style>
