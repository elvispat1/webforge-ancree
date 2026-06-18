<script setup lang="ts">
import type { AboutBlock } from '~/types/blocks'
const about = defineProps<AboutBlock>()
</script>

<template>
  <section class="wf-section wf-about" id="about">
    <div class="wf-container">
      <!-- Ordre DOM: copy d'abord, photo ensuite. En mobile (empilé) la photo
           tombe donc sous le texte avec le bon ordre de lecture (pas de `order`
           qui désynchroniserait le DOM). En desktop, grid-column replace la
           photo à gauche peu importe l'ordre DOM. -->
      <div class="section-grid wf-about-grid">
        <div class="wf-about-copy" data-reveal-stagger>
          <div class="wf-caption">{{ about.eyebrow }}</div>
          <h2 class="wf-h2">{{ about.heading }}</h2>
          <p
            v-for="(paragraph, i) in about.body"
            :key="i"
            :class="i === about.body.length - 1 ? 'wf-body-2 wf-text-muted' : 'wf-body-1'"
          >{{ paragraph }}</p>
          <ul class="wf-diffs">
            <li v-for="d in about.diffs" :key="d.n">
              <span class="wf-diff-n">{{ d.n }}</span>
              <div>
                <strong>{{ d.title }}</strong>
                <span>{{ d.body }}</span>
              </div>
            </li>
          </ul>
        </div>

        <!-- figure + figcaption: structure sémantique correcte pour une image
             accompagnée d'une légende. Image ne rend que le visuel (img ou
             placeholder), le figcaption est son frère DANS le figure, donc
             valide (un figcaption hors figure ne l'est pas). -->
        <figure class="wf-about-photo" data-reveal>
          <Image
            :src="about.photo.src"
            :alt="about.photo.alt"
            :ratio="about.photo.ratio"
            :label="about.photo.label"
            :caption="about.photo.caption"
            tone="base"
          />
          <figcaption class="wf-figcap">{{ about.figcaption }}</figcaption>
        </figure>
      </div>
    </div>
  </section>
</template>
