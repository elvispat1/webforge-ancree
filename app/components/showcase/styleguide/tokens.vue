<script setup lang="ts">
/* Section Tokens du Style Guide. Affiche les couleurs de marque, la
 * géométrie, l'échelle d'espacement et le rythme vertical entre blocs.
 * Les spécimens (swatches, échelles) sont rendus visuellement; les
 * valeurs techniques (hex, px, noms de tokens) restent en dur (données).
 * Texte naturel via i18n (showcase.styleguide.tokens).
 */

const { t } = useI18n()

type BrandColor = { token: string; value: string; usage: string }
type ColorGroup = { label: string; colors: BrandColor[] }

const colorGroups: ColorGroup[] = [
  {
    label: t('showcase.styleguide.tokens.group_base'),
    colors: [
      { token: '--white', value: '#FAFAF7', usage: t('showcase.styleguide.tokens.use_white') },
      { token: '--black', value: '#1A1A1A', usage: t('showcase.styleguide.tokens.use_black') }
    ]
  },
  {
    label: t('showcase.styleguide.tokens.group_backgrounds'),
    colors: [
      { token: '--bg-base', value: 'var(--white)', usage: t('showcase.styleguide.tokens.use_bg_base') },
      { token: '--bg-alt',  value: '#F2EFE9',     usage: t('showcase.styleguide.tokens.use_bg_alt') }
    ]
  },
  {
    label: t('showcase.styleguide.tokens.group_text'),
    colors: [
      { token: '--text-base',  value: 'var(--black)', usage: t('showcase.styleguide.tokens.use_text_base') },
      { token: '--text-muted', value: '#6B675F',     usage: t('showcase.styleguide.tokens.use_text_muted') }
    ]
  },
  {
    label: t('showcase.styleguide.tokens.group_accent'),
    colors: [
      { token: '--accent-1', value: '#2D4A3E', usage: t('showcase.styleguide.tokens.use_accent_1') }
    ]
  }
]

const spacingMultiples = [
  { tw: 2,  px: '10px', rem: '1rem', usage: t('showcase.styleguide.tokens.use_spacing_inline') },
  { tw: 4,  px: '20px', rem: '2rem', usage: t('showcase.styleguide.tokens.use_spacing_standard') },
  { tw: 8,  px: '40px', rem: '4rem', usage: t('showcase.styleguide.tokens.use_spacing_card') },
  { tw: 16, px: '80px', rem: '8rem', usage: t('showcase.styleguide.tokens.use_spacing_large') }
]

const blockSpaces = [
  { token: '--space-block-tight',   value: '4rem', px1440: '40px', px1920: '53px',  usage: t('showcase.styleguide.tokens.use_block_tight') },
  { token: '--space-block-default', value: '8rem', px1440: '80px', px1920: '107px', usage: t('showcase.styleguide.tokens.use_block_default') }
]

</script>

<template>
  <div class="sg-tokens">

    <!-- Couleurs marque -->
    <div class="sg-tokens-group">
      <h3 class="wf-h4 sg-tokens-group__title">{{ t('showcase.styleguide.tokens.group_colors') }}</h3>
      <p class="wf-body-3 sg-tokens-group__note">{{ t('showcase.styleguide.tokens.colors_note') }}</p>

      <div v-for="g in colorGroups" :key="g.label" class="sg-color-group">
        <p class="wf-caption sg-color-group__label">{{ g.label }}</p>
        <div class="sg-tokens-swatches">
          <div v-for="c in g.colors" :key="c.token" class="sg-swatch">
            <div class="sg-swatch__color" :style="{ background: `var(${c.token})` }" />
            <p class="wf-caption sg-swatch__name">{{ c.token }}</p>
            <p class="wf-body-3 sg-swatch__value">{{ c.value }}</p>
            <p class="wf-body-3 sg-swatch__usage">{{ c.usage }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Géométrie -->
    <div class="sg-tokens-group">
      <h3 class="wf-h4 sg-tokens-group__title">{{ t('showcase.styleguide.tokens.group_geometry') }}</h3>

      <div class="sg-geo-row">
        <div class="sg-geo-sample">
          <div class="sg-geo-radius" />
        </div>
        <div class="sg-geo-meta">
          <p class="wf-caption">--radius</p>
          <p class="wf-body-3">0.2rem · 2px @ 1440 viewport</p>
        </div>
      </div>

      <div class="sg-geo-row">
        <div class="sg-geo-sample">
          <div class="sg-ruler sg-ruler--h">
            <span class="sg-ruler__label">10px @ 1440</span>
          </div>
        </div>
        <div class="sg-geo-meta">
          <p class="wf-caption">--spacing-unit</p>
          <p class="wf-body-3">1rem · 10px @ 1440 / 13.33px @ 1920</p>
        </div>
      </div>
    </div>

    <!-- Échelle d'espacement -->
    <div class="sg-tokens-group">
      <h3 class="wf-h4 sg-tokens-group__title">{{ t('showcase.styleguide.tokens.group_spacing') }}</h3>
      <p class="wf-body-3 sg-tokens-group__note">{{ t('showcase.styleguide.tokens.spacing_note') }}</p>

      <div class="sg-spacing-scale">
        <div v-for="s in spacingMultiples" :key="s.tw" class="sg-spacing-row">
          <div class="sg-spacing-bar" :style="{ width: s.rem }" />
          <div class="sg-spacing-meta">
            <p class="wf-caption sg-spacing-meta__name">p-{{ s.tw }} · {{ s.px }}</p>
            <p class="wf-body-3 sg-spacing-meta__usage">{{ s.usage }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Rythme vertical entre blocs -->
    <div class="sg-tokens-group">
      <h3 class="wf-h4 sg-tokens-group__title">{{ t('showcase.styleguide.tokens.group_block_rhythm') }}</h3>
      <p class="wf-body-3 sg-tokens-group__note">{{ t('showcase.styleguide.tokens.block_rhythm_note') }}</p>

      <div class="sg-block-spaces">
        <div v-for="b in blockSpaces" :key="b.token" class="sg-block-space">
          <div class="sg-block-bar" />
          <div class="sg-block-gap" :style="{ height: b.value }">
            <span class="sg-block-gap__label">{{ b.px1440 }} / {{ b.px1920 }}</span>
          </div>
          <div class="sg-block-bar" />
          <p class="wf-caption sg-block-space__name">{{ b.token }}</p>
          <p class="wf-body-3 sg-block-space__usage">{{ b.usage }}</p>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.sg-tokens-group {
  margin-bottom: calc(var(--spacing-unit) * 6);
}
.sg-tokens-group:last-child {
  margin-bottom: 0;
}
.sg-tokens-group__title {
  margin-bottom: calc(var(--spacing-unit) * 4); /* 40px, titre → contenu sans description */
  color: var(--text-base);
}
.sg-tokens-group__note {
  /* -20px top remonte sous le titre (20px effectif), 40px bottom vers le contenu. */
  margin: calc(var(--spacing-unit) * -2) 0 calc(var(--spacing-unit) * 4);
  color: var(--text-muted);
}

/* Color groups (Base, Backgrounds, Text, Accents) */
.sg-color-group {
  margin-bottom: calc(var(--spacing-unit) * 4);
}
.sg-color-group:last-child {
  margin-bottom: 0;
}
.sg-color-group__label {
  margin: 0 0 calc(var(--spacing-unit) * 2);
  color: var(--accent-1);
}

/* Color swatches */
.sg-tokens-swatches {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: calc(var(--spacing-unit) * 3);
}
.sg-swatch {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing-unit) * 0.5);
}
.sg-swatch__color {
  width: 100%;
  aspect-ratio: 1;
  border-radius: var(--radius);
  border: var(--line-hair);
}
.sg-swatch__name {
  margin: calc(var(--spacing-unit) * 1) 0 0;
}
.sg-swatch__value {
  margin: calc(var(--spacing-unit) * 0.25) 0 0;
  color: var(--text-muted);
}
.sg-swatch__usage {
  margin: calc(var(--spacing-unit) * 1) 0 0;
  color: var(--text-muted);
}

/* Géométrie */
.sg-geo-row {
  display: grid;
  grid-template-columns: 8fr 4fr;
  gap: calc(var(--spacing-unit) * 3);
  align-items: center;
  padding-block: calc(var(--spacing-unit) * 2);
  border-bottom: var(--line-hair);
}
.sg-geo-row:last-child {
  border-bottom: none;
}
.sg-geo-sample {
  display: flex;
  align-items: center;
  min-height: 80px;
}
.sg-geo-radius {
  width: 60px;
  height: 60px;
  background: var(--bg-alt);
  border: var(--line-soft);
  border-radius: var(--radius);
}
.sg-geo-meta p {
  margin: 0;
}
.sg-geo-meta p + p {
  margin-top: calc(var(--spacing-unit) * 0.5);
  color: var(--text-muted);
}

/* Ruler horizontal — pour --spacing-unit */
.sg-ruler--h {
  position: relative;
  width: 1rem; /* = --spacing-unit, 10px @ 1440 */
  height: 30px;
  display: flex;
  align-items: center;
}
.sg-ruler--h::before,
.sg-ruler--h::after {
  content: '';
  position: absolute;
  width: 1px;
  height: 100%;
  background: color-mix(in oklch, var(--accent-1) 50%, transparent);
}
.sg-ruler--h::before { left: 0; }
.sg-ruler--h::after { right: 0; }
.sg-ruler--h {
  background-image: linear-gradient(
    to right,
    color-mix(in oklch, var(--accent-1) 50%, transparent) 50%,
    transparent 0
  );
  background-size: 4px 1px;
  background-repeat: repeat-x;
  background-position: 0 50%;
}
.sg-ruler__label {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-family: var(--font-display);
  font-size: 1rem;
  color: var(--text-muted);
  white-space: nowrap;
}

/* Block rhythm */
.sg-block-spaces {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: calc(var(--spacing-unit) * 4);
  margin-top: calc(var(--spacing-unit) * 2);
}
.sg-block-space {
  display: flex;
  flex-direction: column;
  align-items: stretch;
}
.sg-block-bar {
  height: 1px;
  width: 100%;
  background: var(--text-base);
}
.sg-block-gap {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-image: linear-gradient(
    to bottom,
    color-mix(in oklch, var(--accent-1) 50%, transparent) 50%,
    transparent 0
  );
  background-size: 1px 4px;
  background-repeat: repeat-y;
  background-position: 50% 0;
}
.sg-block-gap__label {
  font-family: var(--font-display);
  font-size: 1rem;
  color: var(--text-muted);
  background: var(--bg-base);
  padding: 0 calc(var(--spacing-unit) * 0.75);
  white-space: nowrap;
}
.sg-block-space__name {
  margin: calc(var(--spacing-unit) * 2) 0 calc(var(--spacing-unit) * 0.5);
}
.sg-block-space__usage {
  margin: 0;
  color: var(--text-muted);
}

/* Échelle d'espacement */
.sg-spacing-scale {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing-unit) * 1.5);
}
.sg-spacing-row {
  display: grid;
  grid-template-columns: 12rem 1fr;
  gap: calc(var(--spacing-unit) * 3);
  align-items: center;
  padding-block: calc(var(--spacing-unit) * 1);
  border-bottom: var(--line-hair);
}
.sg-spacing-row:last-child {
  border-bottom: none;
}
.sg-spacing-bar {
  height: 8px;
  background: var(--accent-1);
  border-radius: 1px;
  max-width: 100%;
}
.sg-spacing-meta__name {
  margin: 0;
}
.sg-spacing-meta__usage {
  margin: calc(var(--spacing-unit) * 0.5) 0 0;
  color: var(--text-muted);
}
</style>
