<script setup lang="ts">
import type { FaqBlock } from '~/types/blocks'

const faq = defineProps<FaqBlock>()

/* Le contenu FAQ est typé {q,a}; l'Accordion attend {title,content}. */
const items = computed(() => faq.items.map(i => ({ title: i.q, content: i.a })))
</script>

<template>
  <section class="wf-section wf-faq" id="faq">
    <div class="wf-container">
      <div class="section-grid wf-faq-layout">
        <header class="wf-section-head wf-faq-head" data-reveal-stagger>
          <div class="wf-caption">{{ faq.eyebrow }}</div>
          <h2 class="wf-h2">{{ faq.heading }}</h2>
        </header>

        <div class="wf-faq-body">
          <!-- faq-schema piloté par l'assembleur (FAQPage: une seule instance
               balisée par site), jamais en dur ici. -->
          <Accordion
            :items="items"
            mode="multiple"
            :default-open="[0]"
            :faq-schema="faq.faqSchema ?? false"
            :heading-level="3"
            data-reveal-stagger
          />
        </div>
      </div>
    </div>
  </section>
</template>
