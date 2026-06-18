<script setup lang="ts">
import { onePagerPath, routePath } from '~/config/route-map'

const props = withDefaults(defineProps<{
  mode?: 'landing' | 'multipage'
  /* Miroir du Header: racine du site pour qualifier ancres et liens légaux en
   * mode landing. En landing, la nav vise /one-pager#section et les pages
   * légales vivent sous /one-pager/. */
  home?: string
}>(), {
  mode: 'multipage',
  home: '/'
})

const site = useContent('site')
const consent = useConsentStore()
const { t } = useI18n()
const locale = useWfLocale()

const logoHref = computed(() =>
  props.mode === 'landing' ? `${props.home}#top` : routePath('home', locale)
)

/* Liens du sous-footer. En multipage, la FAQ (utility) précède les légales; en
 * landing, seulement les légales (la FAQ est une ancre dans la nav du one-pager). */
const footerLinks = computed(() =>
  props.mode === 'landing'
    ? site.value.footer.pageLinks
    : [...site.value.footer.utility, ...site.value.footer.pageLinks]
)

/* En landing, les liens légaux du contenu (chemins multipage du payload) sont
 * requalifiés vers leurs équivalents du sous-arbre one-pager via le route-map.
 * Jamais de concaténation home + chemin: en EN le préfixe de locale vit en tête
 * (/en/one-pager/terms-of-use), une concaténation donnerait /one-pager/en/... */
function legalHref(href: string): string {
  if (props.mode !== 'landing') return href
  if (href === routePath('terms', locale)) return onePagerPath('terms', locale)
  if (href === routePath('privacy', locale)) return onePagerPath('privacy', locale)
  return href
}

/* Année courante injectée dans le copyright (placeholder {year} du contenu).
 * Via useState pour que la valeur calculée au build (site généré statiquement)
 * soit sérialisée et réutilisée à l'identique côté client: pas de recalcul à
 * l'hydratation, donc pas de mismatch si l'année du visiteur diffère de celle
 * du build. Se met à jour à chaque rebuild/déploiement. */
const year = useState('footer-year', () => new Date().getFullYear())
const copyright = computed(() =>
  site.value.footer.copyright.replace('{year}', String(year.value))
)
</script>

<template>
  <footer class="wf-footer">
    <!-- Haut: marque à gauche, navigation en ligne + réseaux à droite. -->
    <div class="wf-container wf-footer-top">
      <div class="wf-footer-brand">
        <Logo :href="logoHref" />
        <p>{{ site.brand.tagline }}</p>
      </div>

      <div class="wf-footer-aside">
        <!-- Multipage: liens primaires DÉDIÉS au pied (site.footer.primary,
             spec 6.1), plus la nav multipage. Landing: ancres de la nav du
             one-pager, inchangé. -->
        <nav class="wf-footer-nav" :aria-label="t('a11y.footer_nav')">
          <template v-if="mode === 'landing'">
            <a
              v-for="link in site.nav.landing.primary"
              :key="link.anchor"
              :href="home + link.anchor"
              class="wf-link"
            >{{ link.label }}</a>
          </template>
          <template v-else>
            <NuxtLink
              v-for="link in site.footer.primary"
              :key="link.href"
              :to="link.href"
              class="wf-link"
            >{{ link.label }}</NuxtLink>
          </template>
        </nav>
        <!-- Réseaux sociaux: liens icône seule, nom accessible via aria-label
             (avec la mention « nouvelle fenêtre », cible target=_blank). -->
        <ul class="wf-footer-socials">
          <li v-for="s in site.footer.socials" :key="s.label">
            <a :href="s.href" :aria-label="`${s.label} ${t('a11y.opens_new_window')}`" target="_blank" rel="noopener noreferrer">
              <Icon :name="s.icon" />
            </a>
          </li>
        </ul>
      </div>
    </div>

    <!-- Sous-footer. Deux copyrights, un par breakpoint, pour garder un ordre
         de lecture logique SANS `order`/`row-reverse` (qui désynchroniseraient
         l'ordre visuel et l'ordre DOM, un piège d'accessibilité):
           desktop ≥720: copyright à gauche (premier dans le DOM), liens à droite,
                         crédit de conception en dernière ligne;
           mobile  <720: liens légaux, puis crédit de conception, puis le copyright
                         (propriété intellectuelle du client) en toute dernière ligne.
         Celui qui n'est pas affiché passe en display:none, donc hors de l'arbre
         d'accessibilité: le lecteur d'écran n'en rencontre jamais qu'un.
         En multipage, la FAQ (utility) rejoint les légales au pied (rôle SEO et
         maillage, hors nav principale); en landing la FAQ est une ancre de la nav. -->
    <div class="wf-container wf-footer-base">
      <p class="wf-footer-copy wf-footer-copy--desktop">{{ copyright }}</p>
      <p class="wf-footer-legal">
        <NuxtLink
          v-for="link in footerLinks"
          :key="link.href"
          :to="legalHref(link.href)"
          class="wf-link"
        >{{ link.label }}</NuxtLink>
        <button type="button" class="wf-link wf-footer-consent" @click="consent.reopen()">{{ t('consent.manage') }}</button>
      </p>
    </div>

    <!-- Crédit de conception: lien discret vers le studio, présent sur chaque
         page (backlink). Contenu depuis site.footer.credit. -->
    <p class="wf-container wf-footer-credit">
      {{ site.footer.credit.label }}
      <a
        :href="site.footer.credit.studioUrl"
        class="wf-link"
        target="_blank"
        rel="noopener noreferrer"
      ><!-- espace hors du span: le compilateur condense l'espace de tête d'un
        span et le nom accessible collerait les deux segments
      -->{{ site.footer.credit.studio }}&#32;<span class="wf-sr-only">{{ t('a11y.opens_new_window') }}</span></a>
    </p>

    <!-- Copyright (propriété intellectuelle du client): dernière ligne sur mobile.
         Sur desktop il vit dans .wf-footer-base (à gauche de la rangée), et celui-ci
         est masqué. -->
    <p class="wf-container wf-footer-copy wf-footer-copy--mobile">{{ copyright }}</p>
  </footer>
</template>
