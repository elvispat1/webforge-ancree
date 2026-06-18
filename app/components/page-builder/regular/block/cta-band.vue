<script setup lang="ts">
import type { BlockBase } from '~/types/blocks'
import type { CtaBandContent } from '~/content/cta-band'
const ctaBand = defineProps<BlockBase<'cta-band'> & CtaBandContent>()
</script>

<template>
  <!-- Bande de conversion pleine largeur, surface sombre (--black), sortie de
       fin de page. Traitement de contraste sur fond noir aligné sur .wf-contact:
       surtitre/lead en blanc cassé, ghost en blanc (l'accent vert ne contraste
       pas sur le noir). Layout centré: titre fort, lead optionnel, 1 ou 2 CTA. -->
  <section class="wf-section wf-cta-band">
    <div class="wf-container">
      <div class="section-grid wf-cta-band-grid">
        <!-- Colonne unique centrée (cols 3-10 en desktop), groupe révélé en
             cascade. Ordre DOM = ordre de lecture: titre, lead, actions. -->
        <div class="wf-cta-band-inner" data-reveal-stagger>
          <h2 class="wf-h2">{{ ctaBand.title }}</h2>
          <p v-if="ctaBand.subtitle" class="wf-body-1 wf-text-muted">
            {{ ctaBand.subtitle }}
          </p>
          <div class="wf-cta-band-actions">
            <!-- CTA principal: bouton primary, lien interne (route /...). -->
            <Button :href="ctaBand.primaryCta.href" kind="internal" variant="primary">
              {{ ctaBand.primaryCta.label }}
            </Button>
            <!-- CTA secondaire optionnel: bouton ghost (style hero à 2 boutons). -->
            <Button
              v-if="ctaBand.secondaryCta"
              :href="ctaBand.secondaryCta.href"
              kind="internal"
              variant="ghost"
            >
              {{ ctaBand.secondaryCta.label }}
            </Button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
