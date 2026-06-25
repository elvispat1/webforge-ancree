<script setup lang="ts">
/* Masthead des pages internes (hero-page). PAS le héros full bleed d'accueil: un
 * bandeau de repérage, sobre, tourné vers le texte, sur fond clair. Signature
 * Ancrée: titre slab à l'axe gauche (cols 1-10), accroche + appel sur une mesure
 * étroite à droite (cols 12-16) calée en bas du titre (asymétrie posée, même
 * grammaire que SectionHead). Le masthead « repose » sur une ligne d'horizon
 * pleine largeur, avec une languette ambre à l'axe gauche, là où le contenu
 * touche le sol. Volontairement SANS classe .hero: l'en-tête devient blanc solide
 * d'emblée (les deux clairs, pas de couture), au lieu de rester translucide.
 *
 * Masthead SOLIDE, immédiat: aucune apparition au chargement. Le titre est du
 * contenu critique au-dessus de la ligne de flottaison; une anim qui le masque
 * (rAF gelé en arrière-plan, ou timeline d'anim throttlée) le laisserait blanc.
 * On reste « ancré, planté »: la signature « s'ancre en montant » vit dans les
 * blocs du corps (reveal au défilement) et le héros d'accueil, pas dans ce
 * bandeau de repérage. */
import type { HeroPageBlock } from '~/types/blocks'

const props = defineProps<HeroPageBlock>()

const { t } = useI18n()

const hasAside = computed(() => Boolean(props.lead) || Boolean(props.cta))

function ctaKind(href: string): 'internal' | 'external' | 'anchor' {
  if (href.startsWith('#') || href.startsWith('tel:') || href.startsWith('mailto:')) return 'anchor'
  if (href.startsWith('http')) return 'external'
  return 'internal'
}
</script>

<template>
  <section class="page-hero">
    <div class="wf-container page-hero__inner">
      <nav v-if="crumbs?.length" class="page-hero__crumbs" :aria-label="t('a11y.breadcrumb')">
        <ol class="page-hero__trail">
          <li v-for="(crumb, i) in crumbs" :key="crumb.label" class="page-hero__crumb">
            <NuxtLink v-if="crumb.to" :to="crumb.to" class="page-hero__crumb-link">{{ crumb.label }}</NuxtLink>
            <span v-else class="page-hero__crumb-current" aria-current="page">{{ crumb.label }}</span>
            <Icon
              v-if="i < crumbs.length - 1"
              name="lucide:chevron-right"
              class="page-hero__sep"
              aria-hidden="true"
            />
          </li>
        </ol>
      </nav>

      <div class="page-hero__head section-grid">
        <div class="page-hero__title-col wf-col-full wf-span-10">
          <p v-if="eyebrow" class="page-hero__eyebrow wf-caption">
            <span class="page-hero__tick" aria-hidden="true" />{{ eyebrow }}
          </p>
          <h1 class="page-hero__title wf-h1">{{ title }}</h1>
        </div>

        <div v-if="hasAside" class="page-hero__aside wf-col-full wf-from-12 wf-to-end">
          <p v-if="lead" class="page-hero__lead wf-body-1 wf-text-muted">{{ lead }}</p>
          <div v-if="cta" class="page-hero__cta">
            <Button
              :href="cta.href"
              :kind="ctaKind(cta.href)"
              variant="call"
              icon="lucide:phone"
              :pulse="true"
            >
              {{ cta.label }}
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Ligne d'horizon: le masthead se pose au sol. Languette ambre à l'axe
         gauche (où le contenu touche le sol), filet pleine largeur en dessous. -->
    <div class="page-hero__horizon" aria-hidden="true">
      <div class="wf-container">
        <span class="page-hero__anchor" />
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Léger dégradé navy -> papier: de la matière et de la chaleur sans champ beige
 * (la chaleur vient des accents et des ombres, pas d'un fond crème). */
.page-hero {
  position: relative;
  background: linear-gradient(
    to bottom,
    color-mix(in oklch, var(--navy) 5%, var(--bg-base)) 0%,
    var(--bg-base) 70%
  );
}
/* Réserve la hauteur de l'en-tête collant (qui chevauche), puis respire. */
.page-hero__inner {
  padding-block: calc(var(--header-height) + clamp(3.5rem, 7vh, 6rem)) clamp(3.2rem, 5vh, 4.8rem);
}

/* Fil d'Ariane: maillons slab, séparateur chevron discret, page courante sobre. */
.page-hero__trail {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.2rem 0.4rem;
}
.page-hero__crumb {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}
.page-hero__crumb-link,
.page-hero__crumb-current {
  font-family: var(--font-display);
  font-size: 1.45rem;
  font-weight: 600;
  line-height: 1.3;
}
.page-hero__crumb-link {
  color: var(--text-muted);
  text-decoration: none;
  transition: color var(--motion-duration-hover) var(--motion-ease-settle);
}
.page-hero__crumb-link:hover {
  color: var(--accent-trust);
}
.page-hero__crumb-current {
  color: var(--text-base);
}
.page-hero__sep {
  width: 1.4rem;
  height: 1.4rem;
  color: color-mix(in oklch, var(--text-muted) 52%, transparent);
}

/* Tête: titre à l'axe gauche, accroche + appel à droite. La grille (16 pistes
 * desktop / 4 mobile) vient de .section-grid, calée sur .wf-container; ici on ne
 * pose que l'espacement vertical (gap fil d'Ariane -> tête) et le row-gap qui
 * sépare le bloc de titre de l'aside quand ils s'empilent au mobile. */
.page-hero__head {
  margin-top: var(--space-crumbs-head);
  row-gap: 2.4rem;
}
/* Base mobile (la section-grid a 4 pistes en dessous du seuil): titre et aside
 * prennent toute la largeur, empilés via wf-col-full. L'asymétrie 10/12-16 ne
 * s'active qu'au desktop via wf-span-10 / wf-from-12 wf-to-end. */
.page-hero__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 1.1rem;
  margin-bottom: 1.6rem;
  color: var(--text-muted);
}
.page-hero__tick {
  display: inline-block;
  width: 2.6rem;
  height: 3px;
  border-radius: 2px;
  background: var(--accent-call);
}
.page-hero__title {
  max-width: 17ch;
  color: var(--text-base);
}
.page-hero__lead {
  max-width: 46ch;
}
.page-hero__cta {
  margin-top: var(--space-lead-cta);
}

/* Horizon: le masthead repose au sol. */
.page-hero__horizon {
  border-top: var(--line-hair);
}
.page-hero__anchor {
  display: block;
  width: clamp(6rem, 12vw, 9rem);
  height: 4px;
  border-radius: 0 0 2px 2px;
  background: var(--accent-call);
  box-shadow: var(--elev-low);
}

/* Desktop: calage sur les 16 pistes de .section-grid (pas une grille de tête à la
 * main). Asymétrie posée: titre sur une large mesure (cols 1-10), accroche + appel
 * sur une mesure étroite (cols 12-16), calés en bas du titre. Col 11 en gouttière. */
@container site (min-width: 1024px) {
  .page-hero__head {
    align-items: end;
  }
  .page-hero__lead {
    max-width: 38ch;
  }
}
</style>
