<script setup lang="ts">
/* Services par ville: LE bloc signature d'Ancree, moteur SEO local (remplace le
 * portfolio). Asymetrie posee: un panneau « zone de service » en bleu nuit, avec
 * un motif de couverture radial (le local comme motif), pose a cote d'une
 * mosaique de villes desservies. Chaque ville mene a une page service-ville.
 * Aucune numerotation. */
import type { ServiceCitiesBlock } from '~/types/blocks'
import type { SectionCta } from '~/content/blocks'
import { routePath } from '~/config/route-map'

defineProps<ServiceCitiesBlock>()

const { t, locale } = useI18n()
const route = useRoute()
const NuxtLink = resolveComponent('NuxtLink')

// Tag + bindings derives du type de lien (calque le pattern du Button): interne
// = NuxtLink avec :to; externe = <a href> focusable avec target/rel. Evite le
// <a> sans href (non focusable) du cas externe quand :to vaut undefined.
function cityTag(href: string) {
  return cityKind(href) === 'internal' ? NuxtLink : 'a'
}
function cityBindings(href: string) {
  return cityKind(href) === 'internal'
    ? { to: href }
    : { href, target: '_blank', rel: 'noopener noreferrer' }
}

// Geste « voir toutes les villes » vers le hub /villes (symetrie avec le bloc
// services -> /services). Supprime sur le hub lui-meme pour eviter l'auto-lien.
// Libelle i18n (affordance de nav), cible derivee du route-map (pas en dur).
const villesPath = computed(() => routePath('villes', locale.value as 'fr' | 'en'))
const areaCtas = computed<SectionCta[]>(() =>
  route.path === villesPath.value ? [] : [{ label: t('cities.see_all'), href: villesPath.value }]
)

function cityKind(href: string): 'internal' | 'external' {
  return href.startsWith('http') ? 'external' : 'internal'
}
</script>

<template>
  <section class="cities">
    <div class="wf-container">
      <SectionHead :eyebrow="eyebrow" :heading="heading" :lead="lead" />

      <div class="cities__layout section-grid">
        <aside class="cities__area wf-col-full wf-span-6" data-reveal>
          <CoverageRings class="cities__rings" />
          <div class="cities__area-body">
            <span class="cities__pin" aria-hidden="true">
              <Icon name="lucide:map-pin" />
            </span>
            <p class="cities__area-label wf-caption">{{ areaLabel }}</p>
            <p class="cities__area-name wf-h3">{{ areaName }}</p>
            <p v-if="areaNote" class="cities__area-note wf-body-2">{{ areaNote }}</p>
          </div>
        </aside>

        <ul class="cities__grid wf-col-full wf-from-8 wf-to-end" data-reveal-stagger>
          <li
            v-for="city in cities"
            :key="city.href"
            class="cities__item"
            :class="{ 'cities__item--featured': city.featured }"
          >
            <component :is="cityTag(city.href)" v-bind="cityBindings(city.href)" class="cities__link">
              <Icon name="lucide:map-pin" class="cities__item-pin" aria-hidden="true" />
              <span class="cities__item-text">
                <span class="cities__item-name wf-h5">{{ city.name }}</span>
                <span v-if="city.note" class="cities__item-note">{{ city.note }}</span>
              </span>
              <Icon name="lucide:arrow-up-right" class="cities__item-arrow" aria-hidden="true" />
            </component>
          </li>
        </ul>
      </div>

      <SectionCta :ctas="areaCtas" />
    </div>
  </section>
</template>

<style scoped>
.cities {
  padding-block: var(--space-block-default);
  background: var(--bg-alt);
}
.cities__layout {
  margin-top: var(--space-head-content);
  align-items: start;
}

/* Panneau zone de service: bleu nuit, motif de couverture radial. */
.cities__area {
  position: relative;
  overflow: hidden;
  padding: 3.2rem;
  border-radius: var(--radius-lg);
  background: var(--bg-deep);
  color: var(--text-ondeep);
  box-shadow: var(--elev-mid);
}
.cities__rings {
  position: absolute;
  top: -3rem;
  right: -3rem;
  width: 22rem;
  height: 22rem;
  opacity: 0.5;
  color: color-mix(in oklch, var(--accent-call) 55%, transparent);
}
.cities__area-body {
  position: relative;
}
.cities__pin {
  display: grid;
  place-items: center;
  width: 4.4rem;
  height: 4.4rem;
  border-radius: var(--radius);
  background: var(--accent-call);
  color: var(--navy);
  margin-bottom: 2rem;
}
.cities__pin svg {
  width: 2.4rem;
  height: 2.4rem;
}
.cities__area-label {
  color: color-mix(in oklch, var(--text-ondeep) 78%, transparent);
}
.cities__area-name {
  margin-top: 0.8rem;
  color: var(--text-ondeep);
}
.cities__area-note {
  margin-top: 1.4rem;
  max-width: 30ch;
  color: color-mix(in oklch, var(--text-ondeep) 80%, transparent);
}

/* Mosaique de villes. */
.cities__grid {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.4rem;
}
.cities__link {
  display: flex;
  align-items: center;
  gap: 1.4rem;
  height: 100%;
  padding: 1.8rem 2rem;
  background: var(--bg-lift);
  border-radius: var(--radius-md);
  box-shadow: var(--elev-low);
  color: var(--text-base);
  text-decoration: none;
  /* Meme geste que les tuiles de service: au survol le fond se teinte d'ambre
   * doux, pas de lift, courbe ease-out DOUCE a 240ms (graduelle). */
  transition: background-color var(--motion-duration-line) var(--motion-ease-out);
}
.cities__link:hover {
  background: var(--accent-call-soft);
}
.cities__item-pin {
  width: 2.2rem;
  height: 2.2rem;
  flex: none;
  color: var(--accent-trust);
}
.cities__item-text {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
}
.cities__item-name {
  color: var(--text-base);
}
.cities__item-note {
  margin-top: 0.2rem;
  font-size: 1.3rem;
  color: var(--text-muted);
}
.cities__item-arrow {
  width: 1.9rem;
  height: 1.9rem;
  flex: none;
  color: var(--text-muted);
  transition: transform var(--motion-duration-line) var(--motion-ease-out);
}
.cities__link:hover .cities__item-arrow {
  transform: translate(3px, -3px);
  color: var(--accent-trust);
}

@container site (min-width: 640px) {
  .cities__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .cities__item--featured {
    grid-column: span 2;
  }
}
@container site (min-width: 1024px) {
  .cities__area {
    position: sticky;
    top: 3rem;
  }
  .cities__grid {
    gap: 1.6rem;
  }
}
</style>
