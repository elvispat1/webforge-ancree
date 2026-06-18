<script setup lang="ts">
/* HeroHome — héros de la page d'accueil (one-pager et accueil multipage).
 *
 * Le héros EST un bloc: typé HeroHomeBlock (BlockBase<'hero-home'> & HeroContent),
 * dispatché via heroBlockMap dans l'orchestrateur components/hero/index.vue.
 * _type et _key sont absorbés par le type; ils ne débordent plus en attributs HTML.
 */
import type { HeroHomeBlock } from '~/types/blocks'

/* withDefaults pour signaler à Vue que kicker est optionnel au runtime —
 * sinon le compiler infère `required: true` à partir du type generic. */
const hero = withDefaults(defineProps<HeroHomeBlock>(), {
  kicker: undefined
})

/* Entrée au chargement: le contenu marqué (texte en cascade, puis visuel) apparaît
 * au montage. Le héros étant above-the-fold, on joue au load, pas au scroll. */
const heroRef = ref<HTMLElement | null>(null)
useEntrance(heroRef)

/* Kind dérivé par CTA: le héros sert le one-pager (CTAs en ancres #contact /
 * #services → <a> natif) ET l'accueil multipage (CTAs en routes /contact /
 * /services → <NuxtLink>, navigation SPA + prefetch, cohérent avec le header). */
const ctaKind = (href: string): 'anchor' | 'internal' =>
  href.startsWith('#') ? 'anchor' : 'internal'

/* ── Art direction du visuel (D23, contrat §15.4) ─────────────────────────
 * UNE <picture>: <source media> sert le cadrage MOBILE paysage (visualMobile),
 * le <img> de repli sert le cadrage DESKTOP portrait (visual). Une seule image
 * téléchargée par viewport (avant: deux <Image> togglées en CSS, deux fetchs).
 *
 * Dérogation documentée (contrat §15.4): `source media` est résolu par le
 * préchargeur du navigateur, qui ignore les container queries → media query
 * VIEWPORT obligée. Borne exclusive 1023.98px, miroir du seuil @container site
 * de la grille (même convention que MOBILE_MAX du MobileMenu). */
const HERO_MOBILE_MQ = '(max-width: 1023.98px)'

/* srcset/sizes via useImage().getSizes(), alignés sur le fragment <Image>:
 * format webp + quality globale de nuxt.config (le fragment l'hérite par
 * NuxtImg, getSizes ne la merge pas seul). Chaînes sizes du contrat §8:
 * desktop = split 5/7 (colonnes 8-12); mobile = pleine largeur, plafonnée à
 * lg (la source ne rend jamais au-delà de 1023.98px: nommer lg donne le
 * plafond 1024×2 retina exact, xl/xxl ne produiraient que des variantes
 * mortes au generate). */
const img = useImage()
const heroModifiers = { format: 'webp', quality: img.options.quality }
const desktop = computed(() =>
  hero.visual.src
    ? img.getSizes(hero.visual.src, {
        sizes: 'sm:100vw md:100vw lg:50vw xl:50vw xxl:50vw',
        modifiers: heroModifiers
      })
    : null
)
const mobile = computed(() =>
  hero.visualMobile.src
    ? img.getSizes(hero.visualMobile.src, {
        sizes: 'sm:100vw md:100vw lg:100vw',
        modifiers: heroModifiers
      })
    : null
)

/* PIÈGE prerender (plan T2c): getSizes n'appose pas le header x-nitro-prerender
 * (seul le chemin <NuxtImg> le fait) → sans ce hint manuel, AUCUNE variante
 * /_ipx/ du héros n'est écrite au generate. */
usePrerenderImages(desktop.value?.srcset, desktop.value?.src, mobile.value?.srcset)

/* Parallaxe: même mécanique que le fragment <Image> (cadre clippant + image
 * surdimensionnée, géométrie dans global.css sous la bannière HERO), appliquée
 * ici au <img> natif de la <picture> (pas de $el à capturer). */
const frame = ref<HTMLElement | null>(null)
const image = ref<HTMLElement | null>(null)
useParallax(image, frame)
</script>

<template>
  <section ref="heroRef" class="wf-hero" id="top">
    <div class="wf-container">
      <div class="section-grid wf-hero-grid">
        <div class="wf-hero-text" data-reveal-stagger>
          <div v-if="hero.kicker" class="wf-caption">{{ hero.kicker }}</div>
          <h1 class="wf-h1">{{ hero.title }}</h1>
          <p class="wf-body-1 wf-text-muted">{{ hero.lead }}</p>
          <div class="wf-hero-cta">
            <Button :href="hero.primaryCta.href" :kind="ctaKind(hero.primaryCta.href)" icon="lucide:chevron-right">
              {{ hero.primaryCta.label }}
            </Button>
            <Button :href="hero.secondaryCta.href" :kind="ctaKind(hero.secondaryCta.href)" variant="ghost" :icon="false">
              {{ hero.secondaryCta.label }}
            </Button>
          </div>
          <dl class="wf-hero-meta">
            <div v-for="m in hero.meta" :key="m.label">
              <dt class="wf-caption">{{ m.label }}</dt>
              <dd class="wf-h4">{{ m.value }}</dd>
            </div>
          </dl>
        </div>

        <div class="wf-hero-visual" data-reveal>
          <!-- Art direction D23: une seule <picture>, source mobile (paysage)
               + img de repli desktop (portrait). Ratios par variante en CSS
               (custom properties posées ici depuis le contenu, bascule
               @container dans global.css au même seuil que la grille). -->
          <div
            v-if="desktop"
            ref="frame"
            class="wf-hero-picture"
            :style="{
              '--wf-hero-ratio': hero.visual.ratio,
              '--wf-hero-ratio-mobile': hero.visualMobile.ratio
            }"
          >
            <picture>
              <source
                v-if="mobile"
                :media="HERO_MOBILE_MQ"
                :srcset="mobile.srcset"
                :sizes="mobile.sizes"
              />
              <img
                ref="image"
                :src="desktop.src"
                :srcset="desktop.srcset"
                :sizes="desktop.sizes"
                :alt="hero.visual.alt ?? ''"
                loading="eager"
                fetchpriority="high"
                decoding="sync"
              />
            </picture>
          </div>
          <!-- Repli placeholder (figure sans image au Studio): le fragment
               <Image> sans src rend son placeholder; les deux cadrages restent
               togglés en CSS (aucun fetch, le dédoublonnage D23 ne s'applique
               qu'aux vraies images). -->
          <template v-else>
            <div class="wf-hero-visual--desktop">
              <Image
                :ratio="hero.visual.ratio"
                :label="hero.visual.label"
                :caption="hero.visual.caption"
              />
            </div>
            <div class="wf-hero-visual--mobile">
              <Image
                :ratio="hero.visualMobile.ratio"
                :label="hero.visualMobile.label"
                :caption="hero.visualMobile.caption"
              />
            </div>
          </template>
        </div>
      </div>
    </div>
  </section>
</template>
