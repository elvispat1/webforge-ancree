<script setup lang="ts">
/* Pied de page: bande pleine largeur bleu nuit (moment d'ancrage final), avec le
 * motif de couverture radial repris du bloc villes. Marque et zone de service,
 * navigation, coordonnees, puis une barre basse (droits, credit, mentions
 * legales). L'annee est figee au build via useState pour eviter un decalage
 * d'hydratation. Au mobile, marge basse supplementaire pour degager la barre
 * d'appel collante. */
/* Le pied de page suit le mode (comme l'en-tete): en multipage la nav pointe vers
 * des routes; en landing (one-pager), vers les ancres qualifiees par la racine du
 * one-pager. */
const props = withDefaults(
  defineProps<{ mode?: 'multipage' | 'landing'; home?: string }>(),
  { mode: 'multipage', home: '/' }
)

const { t } = useI18n()
const localePath = useLocalePath()
const links = useSiteNav()
const multipageLinks = useMultipageNav()
const year = useState<number>('site-year', () => new Date().getFullYear())

const brandTo = computed(() => (props.mode === 'multipage' ? localePath('/') : props.home))
function landingHref(href: string): string {
  return props.home && props.home !== '/' ? `${props.home}${href}` : href
}
</script>

<template>
  <footer class="footer">
    <svg class="footer__rings" viewBox="0 0 200 200" aria-hidden="true" focusable="false">
      <circle cx="100" cy="100" r="92" />
      <circle cx="100" cy="100" r="64" />
      <circle cx="100" cy="100" r="36" />
    </svg>

    <div class="wf-container footer__inner">
      <div class="footer__top">
        <div class="footer__brand-col">
          <NuxtLink :to="brandTo" class="footer__brand" :aria-label="t('site.home_aria')">
            <span class="footer__mark" aria-hidden="true"><Icon name="lucide:shield-check" /></span>
            <span class="footer__word"><strong>Rempart</strong><span>Extermination</span></span>
          </NuxtLink>
          <p class="footer__tagline">{{ t('footer.tagline') }}</p>
        </div>

        <nav class="footer__col" :aria-label="t('footer.nav_heading')">
          <p class="footer__heading wf-caption">{{ t('footer.nav_heading') }}</p>
          <template v-if="mode === 'multipage'">
            <NuxtLink v-for="link in multipageLinks" :key="link.to" :to="link.to" class="footer__link">
              {{ link.label }}
            </NuxtLink>
          </template>
          <template v-else>
            <a v-for="link in links" :key="link.href" :href="landingHref(link.href)" class="footer__link">
              {{ t(link.labelKey) }}
            </a>
          </template>
        </nav>

        <div class="footer__col">
          <p class="footer__heading wf-caption">{{ t('footer.contact_heading') }}</p>
          <a class="footer__link" :href="t('contact.phone_href')">{{ t('contact.phone_display') }}</a>
          <a class="footer__link" :href="t('contact.email_href')">{{ t('contact.email_display') }}</a>
          <p class="footer__area">
            <Icon name="lucide:map-pin" class="footer__area-icon" aria-hidden="true" />
            {{ t('hero.kicker') }}
          </p>
        </div>
      </div>

      <div class="footer__bottom">
        <p class="footer__copy">© {{ year }} Rempart Extermination. {{ t('footer.rights') }}</p>
        <p class="footer__credit">
          {{ t('footer.credit') }}
          <a href="https://patoinestudio.ca" target="_blank" rel="noopener noreferrer">{{ t('footer.studio') }}</a>
        </p>
        <nav class="footer__legal" :aria-label="t('footer.nav_heading')">
          <NuxtLink :to="localePath('/politique-confidentialite')" class="footer__legal-link">{{ t('footer.privacy') }}</NuxtLink>
          <NuxtLink :to="localePath('/conditions-utilisation')" class="footer__legal-link">{{ t('footer.terms') }}</NuxtLink>
        </nav>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  position: relative;
  overflow: clip;
  background: var(--bg-deep);
  color: var(--text-ondeep);
  padding-block: clamp(5rem, 8vh, 7rem) 9rem;
}
.footer__rings {
  position: absolute;
  bottom: -8rem;
  right: -6rem;
  width: 32rem;
  height: 32rem;
  opacity: 0.4;
  pointer-events: none;
}
.footer__rings circle {
  fill: none;
  stroke: color-mix(in oklch, var(--accent-call) 45%, transparent);
  stroke-width: 1;
}
.footer__inner {
  position: relative;
}

.footer__top {
  display: grid;
  grid-template-columns: 1fr;
  gap: 4rem;
}
.footer__brand {
  display: inline-flex;
  align-items: center;
  gap: 1.1rem;
  text-decoration: none;
  color: var(--text-ondeep);
}
.footer__mark {
  display: grid;
  place-items: center;
  width: 3.6rem;
  height: 3.6rem;
  border-radius: var(--radius-sm);
  background: var(--accent-call);
  color: var(--navy);
}
.footer__mark svg {
  width: 2.1rem;
  height: 2.1rem;
}
.footer__word {
  display: flex;
  flex-direction: column;
  line-height: 1.05;
  font-family: var(--font-display);
}
.footer__word strong {
  font-size: 1.9rem;
  font-weight: 800;
}
.footer__word span {
  font-size: 1.2rem;
  font-weight: 600;
  color: color-mix(in oklch, var(--text-ondeep) 62%, transparent);
}
.footer__tagline {
  margin-top: 1.8rem;
  max-width: 38ch;
  font-size: 1.6rem;
  line-height: 1.55;
  color: color-mix(in oklch, var(--text-ondeep) 80%, transparent);
}

.footer__col {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}
.footer__heading {
  color: color-mix(in oklch, var(--text-ondeep) 70%, transparent);
  margin-bottom: 0.4rem;
}
.footer__link {
  font-family: var(--font-body);
  font-size: 1.6rem;
  color: color-mix(in oklch, var(--text-ondeep) 88%, transparent);
  text-decoration: none;
  width: fit-content;
}
.footer__link:hover {
  color: var(--accent-call);
}
.footer__area {
  display: inline-flex;
  align-items: center;
  gap: 0.7rem;
  font-size: 1.6rem;
  color: color-mix(in oklch, var(--text-ondeep) 88%, transparent);
}
.footer__area-icon {
  width: 1.8rem;
  height: 1.8rem;
  color: var(--accent-call);
}

.footer__bottom {
  margin-top: 4.8rem;
  padding-top: 2.8rem;
  border-top: 1px solid color-mix(in oklch, white 14%, transparent);
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  font-size: 1.4rem;
  color: color-mix(in oklch, var(--text-ondeep) 70%, transparent);
}
.footer__credit a,
.footer__legal-link {
  color: color-mix(in oklch, var(--text-ondeep) 88%, transparent);
  text-decoration: none;
}
.footer__credit a:hover,
.footer__legal-link:hover {
  color: var(--accent-call);
}
.footer__legal {
  display: flex;
  flex-wrap: wrap;
  gap: 1.6rem 2.4rem;
}

@container site (min-width: 640px) {
  .footer__top {
    grid-template-columns: 1.4fr 1fr 1fr;
    gap: 3rem;
  }
}
@container site (min-width: 1024px) {
  .footer {
    padding-block: clamp(6rem, 9vh, 8rem) 4rem;
  }
  .footer__top {
    grid-template-columns: 1.6fr 1fr 1.2fr;
    gap: 6rem;
  }
  .footer__bottom {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 2rem;
  }
}
</style>
