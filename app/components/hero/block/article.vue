<script setup lang="ts">
/* Masthead d'un article (hero-article). Meme grammaire posee que hero-page (fond
 * clair, fil d'Ariane, titre slab a l'axe gauche, ligne d'horizon ambre), enrichie
 * d'une puce de categorie (lien vers l'archive), d'une accroche, d'une meta de
 * lecture (date, auteur, duree) et d'une image de couverture posee au sol.
 * SOLIDE, immediat: aucune apparition au chargement (titre = contenu critique). */
import type { HeroArticleBlock } from '~/types/blocks'

const props = defineProps<HeroArticleBlock>()

const { t } = useI18n()

const metaItems = computed(() => {
  const items: string[] = [props.dateLabel]
  if (props.author) items.push(props.author)
  if (props.readingTime) items.push(t('ui.blog.reading_time', { n: props.readingTime }))
  return items
})
</script>

<template>
  <section class="article-hero">
    <div class="wf-container article-hero__inner">
      <nav v-if="crumbs?.length" class="article-hero__crumbs" :aria-label="t('a11y.breadcrumb')">
        <ol class="article-hero__trail">
          <li v-for="(crumb, i) in crumbs" :key="crumb.label" class="article-hero__crumb">
            <NuxtLink v-if="crumb.to" :to="crumb.to" class="article-hero__crumb-link">{{ crumb.label }}</NuxtLink>
            <span v-else class="article-hero__crumb-current" aria-current="page">{{ crumb.label }}</span>
            <Icon
              v-if="i < crumbs.length - 1"
              name="lucide:chevron-right"
              class="article-hero__sep"
              aria-hidden="true"
            />
          </li>
        </ol>
      </nav>

      <div class="article-hero__head section-grid">
        <div class="article-hero__head-col wf-col-full wf-span-11">
          <NuxtLink v-if="category" :to="category.href" class="article-hero__chip wf-caption">{{ category.label }}</NuxtLink>
          <h1 class="article-hero__title wf-h1">{{ title }}</h1>
          <p v-if="excerpt" class="article-hero__excerpt wf-body-1 wf-text-muted">{{ excerpt }}</p>

          <p class="article-hero__meta">
            <template v-for="(item, i) in metaItems" :key="item">
              <span v-if="i > 0" class="article-hero__meta-sep" aria-hidden="true" />
              <span class="article-hero__meta-item">{{ item }}</span>
            </template>
          </p>
        </div>
      </div>
    </div>

    <figure v-if="cover?.src" class="article-hero__cover">
      <div class="wf-container">
        <div class="article-hero__cover-frame">
          <Image
            :src="cover.src"
            :alt="cover.alt"
            ratio="var(--ratio-wide)"
            sizes="xs:100vw sm:100vw md:100vw lg:1100px xl:1100px xxl:1100px"
            loading="eager"
            fetchpriority="high"
            decoding="sync"
            tone="base"
          />
          <span class="article-hero__cover-anchor" aria-hidden="true" />
        </div>
      </div>
    </figure>
  </section>
</template>

<style scoped>
.article-hero {
  position: relative;
  background: linear-gradient(
    to bottom,
    color-mix(in oklch, var(--navy) 5%, var(--bg-base)) 0%,
    var(--bg-base) 70%
  );
}
.article-hero__inner {
  padding-block: calc(var(--header-height) + clamp(3.5rem, 7vh, 6rem)) clamp(2.8rem, 4vh, 4rem);
}

/* Fil d'Ariane (identique au masthead de page). */
.article-hero__trail {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.2rem 0.4rem;
}
.article-hero__crumb {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}
.article-hero__crumb-link,
.article-hero__crumb-current {
  font-family: var(--font-display);
  font-size: 1.45rem;
  font-weight: 600;
  line-height: 1.3;
}
.article-hero__crumb-link {
  color: var(--text-muted);
  text-decoration: none;
  transition: color var(--motion-duration-hover) var(--motion-ease-settle);
}
.article-hero__crumb-link:hover {
  color: var(--accent-trust);
}
.article-hero__crumb-current {
  color: var(--text-base);
}
.article-hero__sep {
  width: 1.4rem;
  height: 1.4rem;
  color: color-mix(in oklch, var(--text-muted) 52%, transparent);
}

/* Tete: puce categorie, titre, accroche, meta. Axe gauche, mesure contenue. La
 * grille (16 pistes desktop / 4 mobile) vient de .section-grid, calee sur
 * .wf-container; ici on ne pose que l'espacement vertical (gap fil d'Ariane ->
 * tete). */
.article-hero__head {
  margin-top: var(--space-crumbs-head);
}
/* Base mobile (la section-grid a 4 pistes en dessous du seuil): la tete prend
 * toute la largeur. L'asymetrie posee ne s'active qu'au desktop. */
.article-hero__head-col {
  max-width: 60rem;
}
.article-hero__chip {
  display: inline-block;
  margin-bottom: 1.8rem;
  padding: 0.6rem 1.4rem;
  border-radius: var(--radius-pill);
  background: var(--accent-call-soft);
  color: var(--text-base);
  text-decoration: none;
  box-shadow: var(--elev-flush);
  transition: background-color var(--motion-duration-hover) var(--motion-ease-settle);
}
.article-hero__chip:hover {
  background: color-mix(in oklch, var(--accent-call) 26%, var(--paper));
}
.article-hero__title {
  color: var(--text-base);
  text-wrap: balance;
}
.article-hero__excerpt {
  margin-top: var(--space-title-lead);
  max-width: 52ch;
}
.article-hero__meta {
  margin-top: 2.4rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1.2rem;
}
.article-hero__meta-item {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 1.45rem;
  color: var(--text-muted);
}
.article-hero__meta-sep {
  width: 1px;
  height: 1.4rem;
  background: color-mix(in oklch, var(--text-muted) 40%, transparent);
}

/* Couverture: posee au sol, ombre chaude, languette ambre au coin (ancrage). */
.article-hero__cover {
  margin: 0;
}
.article-hero__cover-frame {
  position: relative;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--elev-high);
}
.article-hero__cover-anchor {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 7rem;
  height: 0.6rem;
  background: var(--accent-call);
  border-top-right-radius: 2px;
}

@container site (min-width: 1024px) {
  /* Asymetrie posee: la tete tient une large mesure a l'axe gauche (cols 1-11),
   * cols 12-16 en respiration. Le placement vient des classes utilitaires
   * (wf-col-full wf-span-11) dans le template; la mesure de ligne reste bornee
   * par max-width. */
  /* Le fragment <Image> rend .wf-image (aspect inline = prop ratio, --ratio-wide).
   * On surclasse en cadrage cinematique au desktop (!important bat le style inline). */
  .article-hero__cover-frame :deep(.wf-image) {
    aspect-ratio: 21 / 9 !important;
  }
}
</style>
