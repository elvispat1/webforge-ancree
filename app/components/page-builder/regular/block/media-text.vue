<script setup lang="ts">
import type { BlockBase } from '~/types/blocks'
import type { MediaTextContent } from '~/content/media-text'
// Typé contre BlockBase + le contenu étalé. Le type discriminé MediaTextBlock
// sera promu dans types/blocks.ts à l'intégration.
const mediaText = defineProps<BlockBase<'media-text'> & MediaTextContent>()
</script>

<template>
  <!-- Ordre DOM constant: copy d'abord, figure ensuite. En mobile (empilé), la
       lecture est texte puis image. En desktop, le flip gauche/droite passe
       UNIQUEMENT par grid-column (classe --left / --right), jamais par un
       réordonnancement du DOM: clavier et lecteur d'écran restent alignés. -->
  <section class="wf-section wf-media-text" :class="`wf-media-text--${mediaText.mediaSide}`">
    <div class="wf-container">
      <div class="section-grid wf-media-text-grid">
        <div class="wf-media-text-copy" data-reveal-stagger>
          <div v-if="mediaText.eyebrow" class="wf-caption">{{ mediaText.eyebrow }}</div>
          <h2 class="wf-h2">{{ mediaText.heading }}</h2>
          <p
            v-for="(paragraph, i) in mediaText.body"
            :key="i"
            :class="i === mediaText.body.length - 1 ? 'wf-body-2 wf-text-muted' : 'wf-body-1'"
          >{{ paragraph }}</p>
          <!-- CTA unique = lien à filet (cf. pattern CTA). Route interne rendue
               en <NuxtLink :to>, stylée en .wf-rule-link (distinct de wf-link). -->
          <NuxtLink v-if="mediaText.cta" :to="mediaText.cta.href" class="wf-rule-link wf-media-text-cta">
            <span class="wf-rule-link-label">{{ mediaText.cta.label }}</span>
            <Icon name="lucide:chevron-right" class="wf-rule-link-arrow" aria-hidden="true" />
          </NuxtLink>
        </div>

        <!-- figure + figcaption: image légendée sémantiquement correcte. Image
             ne rend que le visuel, le figcaption est son frère DANS le figure.
             margin:0 sur figure (neutralise le défaut UA), posé en CSS. -->
        <figure class="wf-media-text-figure" data-reveal>
          <Image
            :src="mediaText.image.src"
            :alt="mediaText.image.alt"
            :ratio="mediaText.image.ratio"
            :label="mediaText.image.label"
            :caption="mediaText.image.caption"
            sizes="sm:100vw md:100vw lg:50vw xl:50vw xxl:50vw"
            tone="base"
          />
          <figcaption class="wf-figcap">{{ mediaText.image.caption }}</figcaption>
        </figure>
      </div>
    </div>
  </section>
</template>
