<script setup lang="ts">
/* Grille des services par nuisible: cartes CLIQUABLES vers les pages detail
 * (/services/<slug>). Source = collection service (Sanity, via useServices); href
 * construit sur la base localisee /services + slug du document. Premiere carte
 * vedette (bleu nuit). Reutilisee par le hub /services ET les pages ville (maillage
 * service x lieu). Le niveau de titre des cartes s'adapte au contexte (h2 sous un
 * masthead h1, h3 sous une section h2). */
import { routePath } from '~/config/route-map'

withDefaults(defineProps<{ headingLevel?: 'h2' | 'h3' }>(), { headingLevel: 'h3' })

const { t, locale } = useI18n()
const items = computed(() => useServices())
// Base localisee des pages de detail (prefixe /en inclus en EN): un href construit
// en dur sur la base FR enverrait les cartes EN vers des 404.
const detailBase = computed(() => routePath('services', locale.value as 'fr' | 'en'))
function href(slug: string): string {
  return `${detailBase.value}/${slug}`
}
</script>

<template>
  <ul class="sg">
    <li v-for="(s, i) in items" :key="s.slug" class="sg__card" :class="{ 'sg__card--featured': i === 0 }">
      <NuxtLink :to="href(s.slug)" class="sg__inner">
        <span class="sg__icon-wrap">
          <Icon :name="s.icon ?? 'lucide:check'" class="sg__icon" aria-hidden="true" />
        </span>
        <component :is="headingLevel" class="sg__title wf-h4">{{ s.title }}</component>
        <p class="sg__body wf-body-2">{{ s.summary }}</p>
        <span class="sg__more">
          {{ t('ui.learn_more') }}
          <Icon name="lucide:arrow-right" aria-hidden="true" />
        </span>
      </NuxtLink>
    </li>
  </ul>
</template>

<style scoped>
.sg {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}
.sg__card {
  border-radius: var(--radius-lg);
}
/* Carte cliquable: meme materiau que le bloc services de l'accueil (ombre chaude,
 * coins doux, soulevement au survol). Mene a la page detail du nuisible. */
.sg__inner {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  height: 100%;
  padding: 2.8rem;
  background: var(--bg-lift);
  border: var(--line-soft);
  border-radius: var(--radius-lg);
  box-shadow: var(--elev-low);
  color: var(--text-base);
  text-decoration: none;
  transition:
    transform var(--motion-duration-hover) var(--motion-ease-settle),
    box-shadow var(--motion-duration-hover) var(--motion-ease-settle);
}
.sg__inner:hover {
  transform: translateY(-4px);
  box-shadow: var(--elev-high);
}
.sg__card--featured .sg__inner {
  background: var(--bg-deep);
  border-color: transparent;
  color: var(--text-ondeep);
  box-shadow: var(--elev-mid);
}
.sg__icon-wrap {
  display: grid;
  place-items: center;
  width: 5.2rem;
  height: 5.2rem;
  border-radius: var(--radius);
  background: var(--accent-call-soft);
  margin-bottom: 2rem;
}
.sg__card--featured .sg__icon-wrap {
  background: color-mix(in oklch, white 12%, transparent);
}
.sg__icon {
  width: 2.8rem;
  height: 2.8rem;
  color: var(--accent-trust);
}
.sg__card--featured .sg__icon {
  color: var(--accent-call);
}
.sg__title {
  margin: 0;
}
.sg__card--featured .sg__title {
  color: var(--text-ondeep);
}
.sg__body {
  margin-top: 1.2rem;
  color: var(--text-muted);
}
.sg__card--featured .sg__body {
  color: color-mix(in oklch, var(--text-ondeep) 80%, transparent);
}
/* Affordance « en savoir plus »: le geste de lien, fleche qui glisse au survol. */
.sg__more {
  margin-top: 2rem;
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.5rem;
  color: var(--accent-trust);
}
.sg__more svg {
  width: 1.7rem;
  height: 1.7rem;
  transition: transform var(--motion-duration-hover) var(--motion-ease-settle);
}
.sg__inner:hover .sg__more svg {
  transform: translateX(4px);
}
.sg__card--featured .sg__more {
  color: var(--accent-call);
}

@container site (min-width: 640px) {
  .sg {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@container site (min-width: 1024px) {
  .sg {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
