<script setup lang="ts">
/* Heros full bleed d'Ancree. L'image remplit TOUT le heros, bord a bord; le
 * contenu est pose par-dessus, ancre au sol (aligne en bas a gauche), comme s'il
 * reposait sur le terrain. Aucune parente avec le split contenu de Minimaliste.
 * Le contenu monte et se pose au chargement (useEntrance, cascade), l'image
 * porte un parallaxe leger. Un degrade navy garantit la lisibilite du texte
 * clair et donne de la profondeur. Consomme le contrat HeroHomeBlock inchange. */
import type { HeroHomeBlock } from '~/types/blocks'

defineProps<HeroHomeBlock>()

const heroRef = ref<HTMLElement | null>(null)
const frameRef = ref<HTMLElement | null>(null)
const imageRef = ref<HTMLElement | null>(null)

useEntrance(heroRef)

// NuxtImg est un composant: le ref donne l'instance, on capture le <img> reel.
function setImageEl(el: unknown): void {
  imageRef.value = (el as { $el?: HTMLElement } | null)?.$el ?? null
}
useParallax(imageRef, frameRef)

function ctaKind(href: string): 'internal' | 'external' | 'anchor' {
  if (href.startsWith('#') || href.startsWith('tel:') || href.startsWith('mailto:')) return 'anchor'
  if (href.startsWith('http')) return 'external'
  return 'internal'
}
</script>

<template>
  <section ref="heroRef" class="hero">
    <div ref="frameRef" class="hero__media">
      <!-- Image mobile optionnelle (art direction plein ecran): rendue seulement si
           fournie au CMS, montree sous le seuil. Sinon, le desktop sert partout. -->
      <NuxtImg
        v-if="visualMobile"
        :src="visualMobile.src"
        :alt="visualMobile.alt || ''"
        class="hero__img hero__img--mobile"
        sizes="xs:100vw sm:100vw md:100vw"
        format="webp"
        loading="eager"
        fetchpriority="high"
        decoding="sync"
      />
      <NuxtImg
        :ref="setImageEl"
        :src="visual.src"
        :alt="visual.alt || ''"
        class="hero__img"
        :class="{ 'hero__img--desktop': !!visualMobile }"
        sizes="xs:100vw sm:100vw md:100vw lg:100vw xl:100vw xxl:100vw"
        format="webp"
        loading="eager"
        fetchpriority="high"
        decoding="sync"
      />
    </div>
    <div class="hero__scrim" aria-hidden="true" />

    <div class="wf-container hero__inner">
      <div class="hero__content" data-reveal-stagger>
        <p v-if="kicker" class="hero__kicker wf-caption">
          <Icon name="lucide:map-pin" class="hero__kicker-icon" aria-hidden="true" />
          {{ kicker }}
        </p>
        <h1 class="hero__title wf-h1">{{ title }}</h1>
        <p class="hero__lead wf-body-1">{{ lead }}</p>
        <div class="hero__ctas">
          <Button
            :href="primaryCta.href"
            :kind="ctaKind(primaryCta.href)"
            variant="call"
            icon="lucide:phone"
            :pulse="true"
          >
            {{ primaryCta.label }}
          </Button>
          <Button
            :href="secondaryCta.href"
            :kind="ctaKind(secondaryCta.href)"
            variant="ghost"
            tone="ondark"
            icon="lucide:arrow-right"
          >
            {{ secondaryCta.label }}
          </Button>
        </div>
      </div>

      <dl class="hero__proofs" data-reveal>
        <div v-for="proof in meta" :key="proof.value" class="hero__proof">
          <Icon v-if="proof.icon" :name="proof.icon" class="hero__proof-icon" aria-hidden="true" />
          <div class="hero__proof-text">
            <dt class="hero__proof-value">{{ proof.value }}</dt>
            <dd class="hero__proof-label">{{ proof.label }}</dd>
          </div>
        </div>
      </dl>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  overflow: clip;
  color: var(--text-ondeep);
  isolation: isolate;
}

/* Cadre du parallaxe: remplit le heros; l'image surdimensionnee translate sans
 * reveler de bord. */
.hero__media {
  position: absolute;
  inset: 0;
  z-index: -2;
  overflow: hidden;
}
.hero__img {
  position: absolute;
  inset: 0;
  top: -6%;
  width: 100%;
  height: 112%;
  object-fit: cover;
  /* Mobile: favorise la droite (le technicien) malgre le recadrage vertical. */
  object-position: 70% 35%;
}
@container site (min-width: 1024px) {
  .hero__img {
    object-position: center 36%;
  }
}

/* Bascule desktop/mobile quand une image mobile est fournie. Sans image mobile,
   l'image desktop ne porte pas --desktop et reste visible partout. */
.hero__img--mobile {
  display: block;
}
.hero__img--desktop {
  display: none;
}
@container site (min-width: 1024px) {
  .hero__img--mobile {
    display: none;
  }
  .hero__img--desktop {
    display: block;
  }
}

/* Degrade navy: fort en bas (lisibilite du contenu ancre au sol), leger en haut
 * (lisibilite de l'en-tete clair). Profondeur sans glassmorphisme. */
.hero__scrim {
  position: absolute;
  inset: 0;
  z-index: -1;
  background:
    linear-gradient(
      to top,
      color-mix(in oklch, var(--navy) 92%, transparent) 0%,
      color-mix(in oklch, var(--navy) 68%, transparent) 20%,
      color-mix(in oklch, var(--navy) 22%, transparent) 44%,
      transparent 66%
    ),
    linear-gradient(
      to bottom,
      color-mix(in oklch, var(--navy) 42%, transparent) 0%,
      transparent 22%
    );
}

.hero__inner {
  position: relative;
  min-height: clamp(56rem, 92vh, 88rem);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: clamp(3rem, 5vh, 4.4rem);
  padding-block: calc(var(--header-height) + 3rem) clamp(4rem, 6vh, 7rem);
}

.hero__content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

/* Pastille d'ancrage local: casse normale, pin ambre, sur l'image (translucide
 * pour la lisibilite). Pas d'etiquette majuscule traquee. */
.hero__kicker {
  display: inline-flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.7rem 1.4rem 0.7rem 1.1rem;
  border-radius: var(--radius-pill);
  background: color-mix(in oklch, var(--navy) 62%, transparent);
  border: 1px solid color-mix(in oklch, white 32%, transparent);
  color: var(--text-ondeep);
}
.hero__kicker-icon {
  width: 1.7rem;
  height: 1.7rem;
  color: var(--accent-call);
}

.hero__title {
  margin-top: 2.4rem;
  max-width: 18ch;
  color: var(--text-ondeep);
}
.hero__lead {
  margin-top: var(--space-title-lead);
  max-width: 46ch;
  color: color-mix(in oklch, var(--text-ondeep) 86%, transparent);
}
.hero__ctas {
  margin-top: var(--space-lead-cta);
  display: flex;
  flex-wrap: wrap;
  gap: 1.4rem;
}

/* Preuves de confiance posees sur une corniche au sol (filet clair au-dessus). */
.hero__proofs {
  margin: 0;
  padding-top: 2.4rem;
  border-top: 1px solid color-mix(in oklch, white 22%, transparent);
  display: flex;
  flex-wrap: wrap;
  gap: 1.6rem 3rem;
}
.hero__proof {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.hero__proof-icon {
  width: 2.4rem;
  height: 2.4rem;
  flex: none;
  color: var(--accent-call);
}
.hero__proof-value {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.7rem;
  line-height: 1.2;
  color: var(--text-ondeep);
}
.hero__proof-label {
  margin: 0;
  font-size: 1.4rem;
  line-height: 1.3;
  color: color-mix(in oklch, var(--text-ondeep) 74%, transparent);
}

/* Desktop: le contenu garde une mesure confortable a gauche, l'image respire a
 * droite (le sujet reste visible). */
@container site (min-width: 1024px) {
  .hero__content {
    max-width: 64rem;
  }
  .hero__proofs {
    gap: 1.6rem 4rem;
  }
}

/* Anti-flash: masque le contenu au premier rendu UNIQUEMENT si JS actif et
 * mouvement permis (alors useEntrance le revele en montant). Sans JS ou en
 * reduced-motion, le contenu est visible tout de suite. */
@media (scripting: enabled) and (prefers-reduced-motion: no-preference) {
  .hero [data-reveal],
  .hero [data-reveal-stagger] > * {
    opacity: 0;
  }
}
</style>
