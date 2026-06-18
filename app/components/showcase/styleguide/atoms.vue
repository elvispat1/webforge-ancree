<script setup lang="ts">
/* Section Composants atomiques du Style Guide. Spécimens rendus de Button, Link
 * et Icon, avec la règle CSS et une légende courte par spécimen.
 * Texte naturel via i18n (showcase.styleguide.atoms).
 */

import Button from '~/components/ui/button/index.vue'
import LinkInternal from '~/components/ui/link/internal.vue'

const { t } = useI18n()

type CssProp = [string, string]
type CssRule = { selector: string; props: CssProp[] }

function formatCss(rule: CssRule): string {
  const body = rule.props.map(([k, v]) => `  ${k}: ${v};`).join('\n')
  return `${rule.selector} {\n${body}\n}`
}

function formatCssMulti(rules: CssRule[]): string {
  return rules.map(formatCss).join('\n\n')
}

const buttonPrimary: CssRule = {
  selector: '.wf-btn',
  props: [
    ['display', 'inline-flex'],
    ['align-items', 'center'],
    ['gap', 'calc(var(--spacing-unit) * 2)'],
    ['padding', 'calc(var(--spacing-unit) * 1.4) calc(var(--spacing-unit) * 3)'],
    ['background', 'var(--accent-1)'],
    ['color', 'var(--bg-base)'],
    ['border', '1px solid var(--accent-1)'],
    ['border-radius', 'var(--radius)'],
    ['font-family', 'var(--font-display)'],
    ['font-weight', '500'],
    ['font-size', '1.6rem'],
    ['letter-spacing', '-0.01em']
  ]
}

const buttonSm: CssRule = {
  selector: '.wf-btn-sm',
  props: [
    ['padding', 'calc(var(--spacing-unit) * 1.25) calc(var(--spacing-unit) * 2)'],
    ['font-size', '1.4rem']
  ]
}

const buttonGhost: CssRule[] = [
  {
    selector: '.wf-btn-ghost',
    props: [
      ['background', 'transparent'],
      ['color', 'var(--accent-1)'],
      ['border-color', 'var(--accent-1)']
    ]
  },
  {
    selector: '.wf-btn-ghost:hover',
    props: [
      ['background', 'var(--accent-1)'],
      ['color', 'var(--bg-base)']
    ]
  }
]

const buttonDisabled: CssRule = {
  selector: '.wf-btn:disabled',
  props: [
    ['opacity', '0.7'],
    ['cursor', 'not-allowed'],
    ['background', 'var(--text-muted)'],
    ['border-color', 'var(--text-muted)']
  ]
}

const systemIcons = [
  'lucide:chevron-right',
  'lucide:arrow-up-right'
]
</script>

<template>
  <div class="sg-atoms">

    <!-- Button -->
    <div class="sg-atoms-group">
      <h3 class="wf-h4 sg-atoms-group__title">{{ t('showcase.styleguide.atoms.group_button') }}</h3>

      <div class="sg-row">
        <div class="sg-row__sample">
          <Button>Action</Button>
        </div>
        <div class="sg-row__meta">
          <pre class="sg-css">{{ formatCss(buttonPrimary) }}</pre>
          <p class="wf-body-3 sg-row__usage">{{ t('showcase.styleguide.atoms.usage_primary') }}</p>
        </div>
      </div>

      <div class="sg-row">
        <div class="sg-row__sample">
          <Button size="sm">Action</Button>
        </div>
        <div class="sg-row__meta">
          <pre class="sg-css">{{ formatCss(buttonSm) }}</pre>
          <p class="wf-body-3 sg-row__usage">{{ t('showcase.styleguide.atoms.usage_sm') }}</p>
        </div>
      </div>

      <div class="sg-row">
        <div class="sg-row__sample">
          <Button variant="ghost">Action</Button>
        </div>
        <div class="sg-row__meta">
          <pre class="sg-css">{{ formatCssMulti(buttonGhost) }}</pre>
          <p class="wf-body-3 sg-row__usage">{{ t('showcase.styleguide.atoms.usage_ghost') }}</p>
        </div>
      </div>

      <div class="sg-row">
        <div class="sg-row__sample">
          <Button disabled>Action</Button>
        </div>
        <div class="sg-row__meta">
          <pre class="sg-css">{{ formatCss(buttonDisabled) }}</pre>
          <p class="wf-body-3 sg-row__usage">{{ t('showcase.styleguide.atoms.usage_disabled') }}</p>
        </div>
      </div>

      <div class="sg-row">
        <div class="sg-row__sample">
          <Button icon="lucide:download">Télécharger</Button>
        </div>
        <div class="sg-row__meta">
          <pre class="sg-css">&lt;Button icon=&quot;lucide:download&quot;&gt;
  Télécharger
&lt;/Button&gt;</pre>
          <p class="wf-body-3 sg-row__usage">{{ t('showcase.styleguide.atoms.usage_icon') }}</p>
        </div>
      </div>
    </div>

    <!-- Link -->
    <div class="sg-atoms-group">
      <h3 class="wf-h4 sg-atoms-group__title">{{ t('showcase.styleguide.atoms.group_link') }}</h3>

      <div class="sg-row">
        <div class="sg-row__sample">
          <LinkInternal to="/one-pager">{{ t('showcase.styleguide.atoms.link_sample') }}</LinkInternal>
        </div>
        <div class="sg-row__meta">
          <pre class="sg-css">class="wf-link"</pre>
          <p class="wf-body-3 sg-row__usage">{{ t('showcase.styleguide.atoms.usage_link') }}</p>
        </div>
      </div>
    </div>

    <!-- Icon -->
    <div class="sg-atoms-group">
      <h3 class="wf-h4 sg-atoms-group__title">{{ t('showcase.styleguide.atoms.group_icon') }}</h3>
      <p class="wf-body-3 sg-atoms-group__note">{{ t('showcase.styleguide.atoms.icon_note') }}</p>

      <div class="sg-icon-grid">
        <div v-for="name in systemIcons" :key="name" class="sg-icon-cell">
          <Icon :name="name" class="sg-icon-cell__icon" />
          <pre class="sg-css">name="{{ name }}"</pre>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
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
.sg-atoms-group__note {
  margin: calc(var(--spacing-unit) * -2) 0 calc(var(--spacing-unit) * 4);
  color: var(--text-muted);
  max-width: 70ch;
}

/* Row pattern partagé avec la section Typographie. */
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
.sg-row__usage {
  color: var(--text-muted);
  margin: 0;
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

/* Icon grid */
.sg-icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: calc(var(--spacing-unit) * 3);
}
.sg-icon-cell {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: calc(var(--spacing-unit) * 1.5);
}
.sg-icon-cell__icon {
  width: 28px;
  height: 28px;
  color: var(--text-base);
}

</style>
