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
import { onePagerPath, routePath } from '~/config/route-map'

const props = withDefaults(
  defineProps<{ mode?: 'multipage' | 'landing'; home?: string }>(),
  { mode: 'multipage', home: '/' }
)

const { t, locale } = useI18n()
const localePath = useLocalePath()
// Navigation et liens du pied editables depuis Sanity (siteSettings.nav / .footer):
// meme source unique que l'En-tete et le Menu mobile. La nav du pied suit le mode
// (ancres du one-pager en landing, routes en multipage); les liens legaux viennent
// de footer.utility, requalifies vers le sous-arbre one-pager en mode landing.
const site = useContent('site')
const socials = useSocials()
// Réouverture de la bannière de consentement (revoir/modifier son choix de
// témoins à tout moment, même après un choix valide). Le store pilote l'affichage.
const consent = useConsentStore()
// Normalise en { label, href } selon le mode (routes en multipage, ancres en
// landing): le template ne connait qu'une forme, comme le Menu mobile.
const footerNav = computed(() =>
  props.mode === 'multipage'
    ? site.value.nav.multipage.primary.map((l) => ({ label: l.label, href: l.route }))
    : site.value.nav.landing.primary.map((l) => ({ label: l.label, href: l.anchor }))
)
const year = useState<number>('site-year', () => new Date().getFullYear())
// Marque, coordonnees et zone depuis siteSettings (discipline 3): aucun NAP ni
// nom de marque en dur. tel:/mailto: derives en code (phoneE164).
const brandWords = computed(() => {
  const name = site.value.brand.name
  const i = name.indexOf(' ')
  return i === -1 ? { lead: name, rest: '' } : { lead: name.slice(0, i), rest: name.slice(i + 1) }
})
const phoneHref = computed(() => `tel:${site.value.contact.phoneE164}`)
const emailHref = computed(() => `mailto:${site.value.contact.email}`)
// Copyright depuis Sanity: le jeton {year} est remplace par l'annee courante.
const copyright = computed(() => site.value.footer.copyright.replace('{year}', String(year.value)))
// Barre du bas: liens utilitaires (FAQ, Contact) + pages legales (conditions,
// confidentialite), dans l'ordre du document. Les pageLinks etaient absents du
// rendu (bug constate): on les joint a utility. Chaque href passe par legalHref.
const legalLinks = computed(() => [...site.value.footer.utility, ...site.value.footer.pageLinks])

const brandTo = computed(() => (props.mode === 'multipage' ? localePath('/') : props.home))
function landingHref(href: string): string {
  return props.home && props.home !== '/' ? `${props.home}${href}` : href
}

// Liens legaux conscients du mode: en multipage, les href du payload (routes
// racine) tels quels; en landing, requalifies vers leurs pendants du sous-arbre
// one-pager via le route-map (jamais une concatenation home + chemin, qui placerait
// mal le prefixe /en). footer.utility porte les legales (ordre du document).
function legalHref(href: string): string {
  if (props.mode !== 'landing') return href
  const loc = locale.value as 'fr' | 'en'
  if (href === routePath('terms', loc)) return onePagerPath('terms', loc)
  if (href === routePath('privacy', loc)) return onePagerPath('privacy', loc)
  return href
}
</script>

<template>
  <footer class="footer">
    <CoverageRings class="footer__rings" />

    <div class="wf-container footer__inner">
      <div class="footer__top">
        <div class="footer__identity">
          <NuxtLink :to="brandTo" class="footer__brand" :aria-label="site.brand.homeAriaLabel">
            <span class="footer__mark" aria-hidden="true"><Icon name="lucide:shield-check" /></span>
            <span class="footer__word"><strong>{{ brandWords.lead }}</strong><span v-if="brandWords.rest">{{ brandWords.rest }}</span></span>
          </NuxtLink>
          <p class="footer__tagline">{{ site.brand.tagline }}</p>
          <ul v-if="socials.length" class="footer__socials">
            <li v-for="s in socials" :key="s.platform">
              <a :href="s.url" class="footer__social" :aria-label="s.label" target="_blank" rel="noopener noreferrer">
                <Icon :name="s.icon" aria-hidden="true" />
              </a>
            </li>
          </ul>
        </div>

        <div class="footer__aside">
          <!-- Plan du site, en haut a droite (pas de titre generique au-dessus). -->
          <nav class="footer__nav" :aria-label="t('footer.nav_heading')">
            <template v-if="mode === 'multipage'">
              <NuxtLink v-for="link in footerNav" :key="link.href" :to="link.href" class="footer__nav-link">
                {{ link.label }}
              </NuxtLink>
            </template>
            <template v-else>
              <a v-for="link in footerNav" :key="link.href" :href="landingHref(link.href)" class="footer__nav-link">
                {{ link.label }}
              </a>
            </template>
          </nav>

          <!-- Nous joindre: NAP complet (telephone, courriel, adresse civique) pour
               la coherence Name Address Phone cote Google. -->
          <div class="footer__col footer__contact">
            <p class="footer__heading wf-caption">{{ t('footer.contact_heading') }}</p>
            <a class="footer__link" :href="phoneHref">{{ site.contact.phone }}</a>
            <a class="footer__link" :href="emailHref">{{ site.contact.email }}</a>
            <address class="footer__address">
              <span>{{ site.contact.address.line1 }}</span>
              <span>{{ site.contact.address.cityProv }}, {{ site.contact.address.postal }}</span>
            </address>
          </div>
        </div>
      </div>

      <div class="footer__bottom">
        <!-- Liens utiles et legaux (FAQ, Contact, conditions, confidentialite,
             gerer les temoins): colonne au mobile, rangee au desktop. -->
        <nav class="footer__legal" :aria-label="t('footer.legal_nav')">
          <NuxtLink
            v-for="link in legalLinks"
            :key="link.href"
            :to="legalHref(link.href)"
            class="footer__legal-link"
          >{{ link.label }}</NuxtLink>
          <button type="button" class="footer__legal-link footer__consent" @click="consent.reopen()">
            {{ t('consent.manage') }}
          </button>
        </nav>
        <!-- Mentions: copyright de la compagnie, puis le credit studio juste
             dessous (colle, discret, derniere chose qu'on voit). -->
        <div class="footer__fineprint">
          <p class="footer__copy">{{ copyright }}</p>
          <p class="footer__credit">
            {{ site.footer.credit.label }}
            <a :href="site.footer.credit.studioUrl" target="_blank" rel="noopener noreferrer">{{ site.footer.credit.studio }}</a>
          </p>
        </div>
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
  color: color-mix(in oklch, var(--accent-call) 45%, transparent);
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

.footer__socials {
  list-style: none;
  margin: 2rem 0 0;
  padding: 0;
  display: flex;
  gap: 1.2rem;
}
.footer__social {
  display: grid;
  place-items: center;
  width: 4rem;
  height: 4rem;
  border-radius: var(--radius-sm);
  background: color-mix(in oklch, var(--text-ondeep) 8%, transparent);
  color: color-mix(in oklch, var(--text-ondeep) 88%, transparent);
  transition: color var(--motion-duration-hover) var(--motion-ease-settle);
}
.footer__social svg {
  width: 2rem;
  height: 2rem;
}
.footer__social:hover {
  color: var(--accent-call);
}

/* Colonne droite: plan du site (en haut) puis bloc « Nous joindre » dessous. */
.footer__aside {
  display: flex;
  flex-direction: column;
  gap: 3.2rem;
}
/* Plan du site, slab (Bitter) pour un peu de presence. Colonne au mobile (cibles
 * tactiles confortables, padding de touche sur chaque lien), rangee au desktop. */
.footer__nav {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.6rem;
}
.footer__nav-link {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 1.6rem;
  color: color-mix(in oklch, var(--text-ondeep) 88%, transparent);
  text-decoration: none;
  width: fit-content;
  padding-block: 0.6rem;
}
.footer__nav-link:hover {
  color: var(--accent-call);
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
/* Adresse civique (NAP), deux lignes. <address> reinitialise (l'italique par
 * defaut casse le ton pose). */
.footer__address {
  display: flex;
  flex-direction: column;
  font-style: normal;
  font-size: 1.6rem;
  line-height: 1.5;
  color: color-mix(in oklch, var(--text-ondeep) 88%, transparent);
}

/* Bas du footer, empile: liens (utiles/legaux/temoins), puis les mentions
 * (copyright, puis le credit studio discret juste dessous). */
.footer__bottom {
  margin-top: 4.8rem;
  padding-top: 2.8rem;
  border-top: var(--line-ondeep);
  display: flex;
  flex-direction: column;
  gap: 2rem;
  font-size: 1.4rem;
  color: color-mix(in oklch, var(--text-ondeep) 70%, transparent);
}
/* Mentions: copyright en haut, credit studio colle dessous (petit ecart). */
.footer__fineprint {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
/* Credit studio: derniere ligne, ton delicat (plus petit, plus attenue, pas un
 * lien proeminent). */
.footer__credit {
  font-size: 1.3rem;
  color: color-mix(in oklch, var(--text-ondeep) 52%, transparent);
}
.footer__credit a,
.footer__legal-link {
  color: color-mix(in oklch, var(--text-ondeep) 88%, transparent);
  text-decoration: none;
}
/* Padding de touche sur chaque lien du bas (cible tactile confortable au mobile). */
.footer__legal-link {
  padding-block: 0.6rem;
}
/* Le déclencheur de consentement est un <button> (action JS), habillé comme les
 * liens légaux: reset des styles natifs; le padding-block de touche vient de
 * .footer__legal-link, on ne neutralise que le padding horizontal. */
.footer__consent {
  padding-inline: 0;
  background: none;
  border: none;
  font: inherit;
  cursor: pointer;
}
.footer__credit a:hover,
.footer__legal-link:hover {
  color: var(--accent-call);
}
/* Liens utiles et legaux: colonne au mobile (cibles tactiles empilees), rangee
 * au desktop. */
.footer__legal {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.6rem;
}

@container site (min-width: 640px) {
  /* Deux zones posees: identite a gauche, plan du site + contact a droite. */
  .footer__top {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 4rem;
  }
}
@container site (min-width: 1024px) {
  .footer {
    padding-block: clamp(6rem, 9vh, 8rem) 4rem;
  }
  .footer__top {
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
    gap: 6rem;
    align-items: start;
  }
  /* Plan du site et liens du bas: rangee horizontale au desktop. */
  .footer__nav {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.4rem 2.4rem;
  }
  .footer__legal {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.4rem 2.4rem;
  }
}
</style>
