<script setup lang="ts">
/* Barre d'appel collante au mobile (composant de conversion grave). Fixe en bas
 * de l'ecran, masquee au desktop. Geste d'appel ambre dominant plus un lien
 * d'estimation. Reprend la respiration subtile du bouton d'appel. */
const { t } = useI18n()
// Numero d'appel depuis la NAP Sanity (tel: derive de phoneE164).
const site = useContent('site')
const phoneHref = computed(() => `tel:${site.value.contact.phoneE164}`)
</script>

<template>
  <div class="callbar">
    <a class="callbar__call" :href="phoneHref">
      <Icon name="lucide:phone" aria-hidden="true" />
      <span>{{ t('hero.cta_primary') }}</span>
    </a>
    <a class="callbar__est" href="#contact">{{ t('callbar.estimate') }}</a>
  </div>
</template>

<style scoped>
.callbar {
  position: fixed;
  inset: auto 0 0 0;
  z-index: 45;
  display: flex;
  align-items: stretch;
  gap: 1rem;
  padding: 1rem 1.4rem calc(1rem + env(safe-area-inset-bottom, 0px));
  background: var(--bg-base);
  border-top: var(--line-hair);
  box-shadow: 0 -0.6rem 2rem color-mix(in oklch, var(--shadow-tint) 12%, transparent);
}
.callbar__call {
  flex: 1 1 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  padding: 1.4rem;
  border-radius: var(--radius);
  background: var(--accent-call);
  color: var(--text-oncall);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.7rem;
  text-decoration: none;
  box-shadow: var(--elev-mid);
}
.callbar__call svg {
  width: 1.9rem;
  height: 1.9rem;
}
.callbar__est {
  display: inline-flex;
  align-items: center;
  padding: 1.4rem 1.6rem;
  border-radius: var(--radius);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.5rem;
  color: var(--text-base);
  text-decoration: none;
  box-shadow: inset 0 0 0 var(--line-width) color-mix(in oklch, var(--text-base) 22%, transparent);
}

@container site (min-width: 1024px) {
  .callbar {
    display: none;
  }
}
</style>
