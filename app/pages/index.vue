<script setup lang="ts">
import PageBuilder from '~/components/page-builder/regular/index.vue'
/* Accueil MULTIPAGE (mode Multipage, racine /). Une passerelle: le heros, puis
 * un choix d'apercus qui MENENT aux pages dediees (services -> /services, villes
 * -> pages service-ville, temoignages, bandeau d'appel -> /contact). Le contenu
 * profond (a-propos, FAQ, formulaire) vit sur ses pages dediees, joignables par
 * la nav multipage; on ne le duplique pas ici. En-tete en mode multipage (liens
 * de route), via le layout default.
 *
 * V2 (Sanity, fail-fast): heros et blocs viennent du payload unique (plugin
 * 01.content) via useHeroContent/useHomeBlocks; resolveBlocks a deja resolu les
 * items contre les collections. La page ne fait que filtrer la passerelle; les
 * liens (dont les CTA « contact » qui portent une page interne = Contact, resolus
 * en /contact#contact) viennent du CMS, aucun recablage code ici. */
import type { PageBlock } from '~/types/blocks'

// Blocs retenus pour la passerelle (apercus + conversion), dans l'ordre de rendu.
const GATEWAY_BLOCKS = new Set(['trust-bar', 'services', 'service-cities', 'testimonials', 'cta-band'])

const hero = useHeroContent('home')

const seo = useFixedPage('home').seo

const homeBlocks = useHomeBlocks()
// Passerelle: on retient les apercus + la conversion. Les cartes services MENENT a
// leur page de detail (href deja construit par resolveServicesBlock), au meme titre
// que les cartes de villes; le CTA « Voir tous les services » reste le chemin vers
// le hub. (Avant le 25 juin: href neutralises, cartes informatives; renverse.)
const blocks = computed<PageBlock[]>(() =>
  homeBlocks.value.filter((b) => GATEWAY_BLOCKS.has(b._type))
)

// Accueil (racine): titre/description du CMS (homePage via payload, replis deja
// faits au transform). Titre COMPLET (porte deja la marque) -> gabarit
// neutralise pour ne pas doubler le suffixe. Visuel OG du heros. Identite
// LocalBusiness complete du graphe (NAP + zone desservie), source UNIQUE de la
// marque. Pas de fil d'Ariane (page racine). Suit le patron Minimaliste.
usePageSeo({
  ...seo,
  titleTemplate: null,
  image: hero.value.visual.src,
  // NAP complet (LocalBusiness + PostalAddress + sameAs) depuis la source unique
  // (useLocalBusinessSeo lit siteSettings); visuel = heros de l'accueil.
  localBusiness: useLocalBusinessSeo(hero.value.visual.src)
})
</script>

<template>
  <Hero :hero="hero" />
  <PageBuilder :blocks="blocks" reveal />
</template>
