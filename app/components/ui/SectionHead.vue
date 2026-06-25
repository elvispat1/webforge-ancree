<script setup lang="ts">
/* En-tete de section partage. Signature Ancree: un court trait ambre (« ancre au
 * sol ») devant un sur-titre en casse normale, jamais une etiquette majuscule
 * traquee. Le titre et le lead sont EMPILES a gauche dans une mesure lisible
 * (decision 25 juin: plus d'aside a droite, qui se decalait de la grille du corps;
 * l'asymetrie est portee par la mosaique du corps). Le CTA eventuel vit en BAS du
 * bloc via <SectionCta>, colle a la marge droite, jamais decale. */
defineProps<{
  eyebrow?: string
  heading: string
  lead?: string
}>()
</script>

<template>
  <header class="shead wf-grid-cols" data-reveal-stagger>
    <p v-if="eyebrow" class="shead__eyebrow wf-caption wf-col-full">
      <span class="shead__tick" aria-hidden="true" />{{ eyebrow }}
    </p>
    <h2 class="shead__heading wf-h2 wf-col-full">{{ heading }}</h2>
    <p v-if="lead" class="shead__lead wf-body-1 wf-text-muted wf-col-full wf-span-8">{{ lead }}</p>
  </header>
</template>

<style scoped>
.shead__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 1.1rem;
  margin-bottom: 1.6rem;
  color: var(--text-muted);
}
.shead__tick {
  display: inline-block;
  width: 2.6rem;
  height: 3px;
  border-radius: 2px;
  background: var(--accent-call);
}
.shead__heading {
  max-width: 20ch;
}
.shead__lead {
  margin-top: var(--space-title-lead);
  max-width: 60ch;
}

/* Calage sur la grille de page (16 pistes, memes lignes que .section-grid du
 * corps, meme conteneur donc memes verticales): la tete devient une grille
 * (.wf-grid-cols) et le lead tient une mesure CALEE sur les pistes (cols 1-8,
 * meme bord droit que la carte vedette des services, via wf-col-full wf-span-8)
 * plutot qu'un max-width libre qui flottait entre deux colonnes. Le titre garde
 * son retour a la ligne serre (20ch, display lourd). */
@container site (min-width: 1024px) {
  .shead__lead {
    max-width: none;
  }
}
</style>
