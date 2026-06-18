<script setup lang="ts">
// Carte d'article PARTAGÉE: liste du blog (/blog, pages de catégorie, articles
// reliés) ET aperçu blog de l'accueil. Média + titre + extrait + pied (date à
// gauche, chevron qui glisse au survol), cartes de hauteur égale (le corps en
// flex:1 pousse le pied au bas, donc les pieds s'alignent malgré des extraits
// inégaux). Catégorie optionnelle en tag superposé sur la cover (montré sur le
// blog, masqué à l'accueil): hors du flux texte, les titres démarrent à la même
// hauteur sur toute la rangée, avec ou sans catégorie.
//
// Lien étiré sur le titre: un seul élément interactif accessible (nom de lien =
// titre), toute la carte cliquable via ::after. formatDate (auto-importé) formate
// selon la locale courante, de façon déterministe (Intl + UTC), pour éviter tout
// décalage d'hydratation au prérendu statique.
const articleCard = withDefaults(defineProps<{
  title: string
  excerpt: string
  href: string
  date: string
  category?: string
  cover: { ratio: string; src?: string; alt: string; label: string; caption: string }
  /** Afficher le tag de catégorie sur la cover (contexte blog). Défaut false (accueil). */
  showCategory?: boolean
  /** Niveau de titre de la carte (h2..h6). 2 quand la grille vit directement sous
   *  le h1 du héros (listes /blog); défaut 3 (sous un h2 de section). */
  headingLevel?: 2 | 3 | 4 | 5 | 6
}>(), {
  category: undefined,
  showCategory: false,
  headingLevel: 3
})

// Même pattern que <Accordion>: niveau sémantique paramétrable, rendu visuel
// constant (la classe wf-h5 ne bouge pas).
const headingTag = computed(() => `h${articleCard.headingLevel}`)

// Locale courante pour le formatage de date (MAJ-08): la même sur toute la page.
const locale = useWfLocale()
</script>

<template>
  <li class="wf-article-card">
    <!-- Pas de figcaption: carte compacte (aligné sur l'aperçu accueil). La légende
         de couverture ne sert qu'en mode placeholder, rendue dans l'Image. -->
    <figure class="wf-article-card-media">
      <Image
        :src="cover.src"
        :alt="cover.alt"
        :ratio="cover.ratio"
        :label="cover.label"
        :caption="cover.caption"
        sizes="sm:100vw md:50vw lg:33vw xl:33vw xxl:33vw"
        tone="base"
        :parallax="false"
      />
      <!-- Tag de catégorie superposé sur la cover: frère de l'Image (pas dedans),
           donc insensible au zoom de survol. Hors du flux texte du corps: les
           titres restent alignés sur la rangée, avec ou sans catégorie. Ordre de
           lecture inchangé (cover, catégorie, titre). Classe .wf-card-tag
           partagée avec <ProjectCard> (bannière de collection de global.css). -->
      <span v-if="showCategory && category" class="wf-caption wf-text-base wf-card-tag">{{ category }}</span>
    </figure>

    <div class="wf-article-card-body">
      <div class="wf-article-card-main">
        <component :is="headingTag" class="wf-h5 wf-article-card-title">
          <!-- Lien étiré: le ::after couvre la carte entière (un seul lien). -->
          <NuxtLink :to="href" class="wf-article-card-link">{{ title }}</NuxtLink>
        </component>
        <p class="wf-body-2 wf-text-muted wf-article-card-excerpt">{{ excerpt }}</p>
      </div>

      <!-- Pied poussé au bas: filet hairline, date à gauche, chevron à droite qui
           apparaît au survol pour signaler que la carte mène à l'article. -->
      <div class="wf-article-card-foot">
        <time :datetime="date" class="wf-body-3 wf-article-card-date">{{ formatDate(date, locale) }}</time>
        <Icon name="lucide:chevron-right" class="wf-article-card-cue" aria-hidden="true" />
      </div>
    </div>
  </li>
</template>
