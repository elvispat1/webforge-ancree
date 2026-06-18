<script setup lang="ts">
// Carte de projet PARTAGÉE: bloc projects-preview (accueil, détails de service
// et de projet) ET grille de la page /projets. Figure clippée au ratio uniforme
// (--ratio-tile, hauteurs égales) coiffée du tag de service superposé (même
// pattern que la catégorie d'ArticleCard), titre, extrait, indice de lecture
// poussé en pied (margin auto: les indices s'alignent d'une carte à l'autre
// malgré des extraits inégaux). CSS: bannière COLLECTION PROJECT CARD de
// global.css (.wf-project-card-*) + .wf-card-tag partagé.
//
// Le lien englobant couvre figure + texte (cible cliquable pleine carte); son
// intitulé accessible est le titre. L'indice « Voir le projet » est décoratif
// (aria-hidden), chrome produit générique via i18n (ui.*).
import { routePath } from '~/config/route-map'

const projectCard = withDefaults(defineProps<{
  /** Slug du projet: la carte mène à /projets/[slug]. */
  slug: string
  title: string
  excerpt: string
  /** Libellé du service rattaché, déjà résolu en titre affichable (jamais le slug brut). */
  service?: string
  cover: { ratio: string; src?: string; alt: string; label: string; caption: string }
  /** Niveau de titre de la carte (h2..h6). 2 quand la grille vit directement sous
   *  le h1 du héros (page /projets); défaut 3 (sous un h2 de section). */
  headingLevel?: 2 | 3 | 4 | 5 | 6
  /** Chaîne sizes @nuxt/image selon la colonne occupée (défaut: tiers de grille). */
  sizes?: string
  /** eager pour les premières cartes above-the-fold (première rangée de /projets). */
  loading?: 'eager' | 'lazy'
}>(), {
  service: undefined,
  headingLevel: 3,
  sizes: 'sm:100vw md:50vw lg:33vw xl:33vw xxl:33vw',
  loading: 'lazy'
})

// Même pattern que <Accordion>: niveau sémantique paramétrable, rendu visuel
// constant (la classe wf-h5 ne bouge pas).
const headingTag = computed(() => `h${projectCard.headingLevel}`)

// Base localisée des pages de détail (préfixe /en inclus en EN, /projets vs
// /projects): un chemin construit en dur sur la base FR casserait l'arbre EN.
const detailBase = routePath('projects', useWfLocale())

// Indice de carte: chrome produit générique (i18n ui.*), pas du contenu de site.
const { t } = useI18n()
</script>

<template>
  <li class="wf-project-card">
    <NuxtLink :to="`${detailBase}/${projectCard.slug}`" class="wf-project-card-link">
      <!-- Le ratio source de l'image n'est PAS transmis: la figure impose un
           cadre uniforme (--ratio-tile) et l'image le remplit en cover, pour
           des tuiles de hauteur égale quel que soit le ratio du contenu. -->
      <figure class="wf-project-card-figure">
        <Image
          :src="cover.src"
          :alt="cover.alt"
          :label="cover.label"
          :caption="cover.caption"
          :sizes="sizes"
          :loading="loading"
          tone="base"
          :parallax="false"
        />
        <!-- Tag de service superposé sur la cover: frère de l'Image (pas dedans),
             donc insensible au zoom de survol. Hors du flux texte du corps: les
             titres démarrent à la même hauteur sur toutes les cartes, avec ou
             sans service. Ordre de lecture inchangé (cover, service, titre).
             Classe .wf-card-tag partagée avec <ArticleCard> (bannière de
             collection de global.css). -->
        <span v-if="service" class="wf-caption wf-text-base wf-card-tag">{{ service }}</span>
      </figure>
      <div class="wf-project-card-body">
        <component :is="headingTag" class="wf-h5 wf-project-card-title">{{ title }}</component>
        <p class="wf-body-2 wf-text-muted wf-project-card-excerpt">{{ excerpt }}</p>
        <span class="wf-project-card-cue" aria-hidden="true">
          <span class="wf-project-card-cue-label">{{ t('ui.view_project') }}</span>
          <Icon name="lucide:chevron-right" class="wf-project-card-cue-arrow" />
        </span>
      </div>
    </NuxtLink>
  </li>
</template>
