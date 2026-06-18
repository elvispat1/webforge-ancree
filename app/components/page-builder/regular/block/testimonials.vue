<script setup lang="ts">
import type { TestimonialsBlock } from '~/types/blocks'
const testimonials = defineProps<TestimonialsBlock>()
</script>

<template>
  <section class="wf-section wf-testimonials" id="testimonials">
    <div class="wf-container">
      <SectionHead :eyebrow="testimonials.eyebrow" :heading="testimonials.heading" />

      <ul class="wf-testimonials-grid" data-reveal-stagger>
        <li v-for="(t, i) in testimonials.items" :key="i" class="wf-testimonial">
          <div class="wf-quote-mark" aria-hidden="true">“</div>
          <blockquote class="wf-quote">{{ t.quote }}</blockquote>
          <footer class="wf-quote-foot">
            <strong>{{ t.name }}</strong>
            <span>{{ t.context }}</span>
          </footer>
        </li>
      </ul>
    </div>
  </section>
</template>
