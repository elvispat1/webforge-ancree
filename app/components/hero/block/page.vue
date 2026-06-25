<script setup lang="ts">
/* Masthead des pages internes (hero-page), partagé par les pages de niveau 2
 * (services, à propos, contact, FAQ, blog) ET les pages de détail (service, ville).
 * PAS le héros full bleed d'accueil: un bandeau de repérage solide sur fond clair.
 *
 * Deux dispositions selon la présence d'une image:
 *  - AVEC image (split asymétrique posé): titre, accroche et appel à l'axe gauche
 *    (cols 1-7), image dans un cadre arrondi à ombre chaude à droite (cols 9-16),
 *    ancrée au sol par une languette ambre. Langage Ancrée, distinct de l'accueil.
 *  - SANS image: titre à gauche (cols 1-10), accroche + appel sur une mesure étroite
 *    à droite (cols 12-16), calés en bas du titre (disposition d'origine).
 *
 * Le masthead « repose » sur une ligne d'horizon pleine largeur. Masthead SOLIDE,
 * immédiat: aucune apparition au chargement (titre = contenu critique au-dessus de
 * la ligne de flottaison). La signature « s'ancre en montant » vit dans le corps. */
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
  <section class="page-hero" :class="{ 'page-hero--media': image }">
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
        <div class="page-hero__text">
          <p v-if="eyebrow" class="page-hero__eyebrow wf-caption">
            <span class="page-hero__tick" aria-hidden="true" />{{ eyebrow }}
          </p>
          <h1 class="page-hero__title wf-h1">{{ title }}</h1>

          <!-- Split: accroche + appel sous le titre, dans la colonne texte. -->
          <template v-if="image">
            <p v-if="lead" class="page-hero__lead wf-body-1 wf-text-muted">{{ lead }}</p>
            <div v-if="cta" class="page-hero__cta">
              <Button :href="cta.href" :kind="ctaKind(cta.href)" variant="call" icon="lucide:phone" :pulse="true">
                {{ cta.label }}
              </Button>
            </div>
          </template>
        </div>

        <!-- Carte image: posée au sol, cadre arrondi, ombre chaude, languette ambre. -->
        <figure v-if="image" class="page-hero__media">
          <div class="page-hero__frame">
            <Image
              :src="image.src"
              :alt="image.alt"
              ratio="4/3"
              sizes="xs:100vw sm:100vw md:50vw lg:45vw xl:45vw xxl:45vw"
            />
          </div>
          <span class="page-hero__media-anchor" aria-hidden="true" />
        </figure>

        <!-- Sans image: accroche + appel sur une mesure étroite à droite (d'origine). -->
        <div v-else-if="hasAside" class="page-hero__aside">
          <p v-if="lead" class="page-hero__lead wf-body-1 wf-text-muted">{{ lead }}</p>
          <div v-if="cta" class="page-hero__cta">
            <Button :href="cta.href" :kind="ctaKind(cta.href)" variant="call" icon="lucide:phone" :pulse="true">
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

/* Tête: la grille (16 pistes desktop / 4 mobile) vient de .section-grid, calée sur
 * .wf-container; ici on pose l'espacement vertical et le placement des colonnes. */
.page-hero__head {
  margin-top: var(--space-crumbs-head);
  row-gap: 3.2rem;
}
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
/* Split: l'accroche et l'appel sous le titre respirent du titre. */
.page-hero--media .page-hero__lead {
  margin-top: var(--space-title-lead);
}

/* Carte image: cadre arrondi à ombre chaude, posée au sol. Au mobile elle suit le
 * texte (le titre, contenu critique, reste en tête). */
.page-hero__media {
  margin: 0;
  position: relative;
}
.page-hero__frame {
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--elev-mid);
}
/* Languette ambre sous la carte: le geste « ancré au sol », à l'aplomb gauche. */
.page-hero__media-anchor {
  position: absolute;
  left: 2.4rem;
  bottom: -0.3rem;
  width: clamp(4rem, 8vw, 6rem);
  height: 4px;
  border-radius: 0 0 2px 2px;
  background: var(--accent-call);
  box-shadow: var(--elev-low);
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

/* Desktop: calage sur les 16 pistes de .section-grid. */
@container site (min-width: 1024px) {
  .page-hero__head {
    align-items: end;
  }
  /* Sans image: titre large (cols 1-10), aside étroit (cols 12-16) calé en bas. */
  .page-hero__text {
    grid-column: 1 / span 10;
  }
  .page-hero__aside {
    grid-column: 12 / -1;
  }
  .page-hero__lead {
    max-width: 38ch;
  }
  /* Split: texte (cols 1-7) et image (cols 9-16), hauts alignés. */
  .page-hero--media .page-hero__head {
    align-items: start;
  }
  .page-hero--media .page-hero__text {
    grid-column: 1 / span 7;
    align-self: center;
  }
  .page-hero--media .page-hero__media {
    grid-column: 9 / -1;
  }
}
</style>
