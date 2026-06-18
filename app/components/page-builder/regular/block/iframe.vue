<script setup lang="ts">
import type { BlockBase } from '~/types/blocks'
import type { IframeContent } from '~/content/iframe'

// Bloc d'intégration générique: affiche une URL quelconque (carte, formulaire,
// calendrier…) dans un cadre responsive aligné sur la grille. Le ratio impose la
// hauteur (l'iframe n'a pas de hauteur intrinsèque), l'iframe remplit le cadre.
const embed = defineProps<BlockBase<'iframe'> & IframeContent>()
</script>

<template>
  <section class="wf-section wf-iframe">
    <div class="wf-container">
      <div class="section-grid">
        <figure class="wf-iframe-figure" data-reveal>
          <div class="wf-iframe-frame" :style="{ aspectRatio: embed.ratio }">
            <iframe
              :src="embed.url"
              :title="embed.title"
              loading="lazy"
              referrerpolicy="strict-origin-when-cross-origin"
              allow="fullscreen; picture-in-picture; clipboard-write"
              allowfullscreen
            />
          </div>
          <figcaption v-if="embed.caption" class="wf-figcap">{{ embed.caption }}</figcaption>
        </figure>
      </div>
    </div>
  </section>
</template>
