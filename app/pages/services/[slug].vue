<script setup lang="ts">
import PageBuilder from '~/components/page-builder/regular/index.vue'
/* Page de service par nuisible (le « quoi » du SEO local). Contenu tire de Sanity
 * (collection service, par slug + langue). Le slug est RICHE en mots-cles et TRADUIT
 * par langue (FR extermination-fourmis-charpentieres <-> EN carpenter-ant-extermination);
 * on pose les params i18n via service.translations pour que l'alternate de langue
 * porte SON propre slug. Sous le contenu propre au nuisible (intro + points forts),
 * un corps oriente conversion (processus, temoignages, bandeau d'appel) compose par
 * useServiceBlocks depuis service.detail. En-tete solide (masthead clair, pas de heros). */
import { breadcrumbsFor } from '~/config/route-map'
import type { WfLocale } from '~/sanity/transform'
import type { HeroPageBlock } from '~/types/blocks'

const { t, locale } = useI18n()
const route = useRoute()
const loc = computed(() => locale.value as 'fr' | 'en')

// Composable appele inconditionnellement en setup (avant le 404 possible).
const setI18nParams = useSetI18nParams()

const slug = String(route.params.slug)
const maybeService = useService(slug)
// Slug inconnu: 404 fatal propre. En statique, seuls les slugs connus sont
// prerendus; ce garde couvre une navigation cliente vers un slug inexistant.
if (!maybeService) {
  throw createError({ statusCode: 404, statusMessage: 'Service introuvable', fatal: true })
}

// Alternate de langue: chaque langue porte SON slug (traduit). Slug equivalent tire
// de service.translations (payload); repli sur le meme slug si la traduction manque.
const slugFor = (lang: WfLocale): string =>
  maybeService.translations?.find((tr) => tr.lang === lang)?.slug ?? maybeService.slug
setI18nParams({ fr: { slug: slugFor('fr') }, en: { slug: slugFor('en') } })

// Rendu reactif: suit les editions live du service courant; repli sur le snapshot
// si l'item disparait du graphe scope. Le template auto-unwrap ces computed.
const service = computed(() => useService(slug) ?? maybeService)

// Appel direct depuis la NAP Sanity (tel: derive de phoneE164), jamais en dur.
const site = useContent('site')
const phoneHref = computed(() => `tel:${site.value.contact.phoneE164}`)

const breadcrumbs = computed(() => breadcrumbsFor('services', { label: service.value.title }, loc.value))

// Masthead (bloc hero-page, rendu par <Hero>). Compose code depuis le document
// service: eyebrow d'ancrage (meta du service, repli i18n), titre, accroche (body),
// appel direct, fil d'Ariane (route-map). Intro et points forts vivent dans le corps.
const heroBlock = computed<HeroPageBlock>(() => ({
  _type: 'hero-page',
  _key: `masthead-${service.value.slug}`,
  crumbs: breadcrumbs.value,
  eyebrow: service.value.meta ?? t('hero.kicker'),
  title: service.value.title,
  lead: service.value.summary,
  cta: { label: t('hero.cta_primary'), href: phoneHref.value }
}))

// Points forts: les benefices du service (collection), icone commune = icone du
// service (les benefices ne portent pas d'icone propre au contrat). Decision de
// composition de page, jamais un champ Studio; la peau (template/CSS) reste intacte.
const intro = computed(() => service.value.intro ?? [])
const highlights = computed(() =>
  service.value.benefits.map((b) => ({ icon: service.value.icon ?? 'lucide:check', title: b.title, body: b.body }))
)

// Corps oriente conversion depuis service.detail (processus + temoignages + bandeau
// d'appel), compose par useServiceBlocks et rendu par le page-builder.
const blocks = computed(() => useServiceBlocks(service.value))

// Page nuisible (SEO local): ItemPage + fil Accueil > Services > [nuisible].
usePageSeo({
  title: service.value.title,
  description: service.value.summary,
  image: service.value.image || undefined,
  webPageType: 'ItemPage',
  breadcrumbs: breadcrumbs.value
})
</script>

<template>
  <div class="pest">
    <Hero :hero="heroBlock" />

    <div class="wf-container pest__body">
      <div v-if="intro.length" class="pest__intro">
        <p v-for="(para, i) in intro" :key="i" class="wf-body-1 wf-text-muted pest__para">{{ para }}</p>
      </div>

      <ul v-if="highlights.length" class="pest__highlights" data-reveal-stagger>
        <li v-for="h in highlights" :key="h.title" class="pest__highlight">
          <span class="pest__highlight-icon" aria-hidden="true">
            <Icon :name="h.icon" />
          </span>
          <h2 class="pest__highlight-title wf-h5">{{ h.title }}</h2>
          <p class="pest__highlight-body wf-body-2">{{ h.body }}</p>
        </li>
      </ul>
    </div>

    <PageBuilder :blocks="blocks" reveal />
  </div>
</template>

<style scoped>
.pest__body {
  padding-block: var(--space-block-default);
  display: grid;
  gap: 4.8rem;
}
.pest__intro {
  max-width: 68ch;
}
.pest__para + .pest__para {
  margin-top: 1.6rem;
}

/* Points forts du nuisible (signes, traitement, garantie): colonnes posees, sans
 * boite de carte (on evite l'empilement de cartes), icone en pastille ambre douce,
 * titre slab. Materiau Ancree, base blanche. */
.pest__highlights {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  grid-template-columns: 1fr;
  gap: 3.2rem;
}
.pest__highlight {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.pest__highlight-icon {
  display: grid;
  place-items: center;
  width: 5.2rem;
  height: 5.2rem;
  border-radius: var(--radius);
  background: var(--accent-call-soft);
  box-shadow: var(--elev-low);
  margin-bottom: 1.8rem;
}
.pest__highlight-icon svg {
  width: 2.8rem;
  height: 2.8rem;
  color: var(--accent-trust);
}
.pest__highlight-title {
  margin: 0;
}
.pest__highlight-body {
  margin-top: 1rem;
  color: var(--text-muted);
}

@container site (min-width: 768px) {
  .pest__highlights {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 4rem;
  }
}
</style>
