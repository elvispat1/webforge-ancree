<script setup lang="ts">
/* Carte d'article: couverture arrondie, puce de categorie, titre slab (lien
 * etire sur toute la carte), accroche, pied (date, duree, fleche). Carte blanche
 * posee (ombre chaude, pas de filet dur), elle se souleve au survol. Le titre
 * porte le lien; un ::after etire rend toute la carte cliquable sans imbriquer
 * d'interactifs. headingLevel ajustable selon le contexte (liste vs reliés). */
import type { ArticleCardData } from '~/composables/useArticles'

withDefaults(
  defineProps<{ card: ArticleCardData; headingLevel?: 'h2' | 'h3' }>(),
  { headingLevel: 'h2' }
)

const { t } = useI18n()
</script>

<template>
  <article class="acard">
    <div class="acard__media">
      <NuxtImg
        :src="card.cover.src"
        :alt="card.cover.alt || ''"
        class="acard__img"
        sizes="xs:100vw sm:100vw md:50vw lg:380px xl:420px xxl:420px"
        format="webp"
        loading="lazy"
      />
      <span v-if="card.category" class="acard__tag">{{ card.category.title }}</span>
    </div>

    <div class="acard__body">
      <component :is="headingLevel" class="acard__title wf-h5">
        <NuxtLink :to="card.href" class="acard__link">{{ card.title }}</NuxtLink>
      </component>
      <p class="acard__excerpt">{{ card.excerpt }}</p>

      <p class="acard__meta">
        <span class="acard__meta-item">{{ card.dateLabel }}</span>
        <span class="acard__meta-sep" aria-hidden="true" />
        <span class="acard__meta-item">{{ t('ui.blog.reading_time', { n: card.readingMinutes }) }}</span>
        <Icon name="lucide:arrow-right" class="acard__arrow" aria-hidden="true" />
      </p>
    </div>
  </article>
</template>

<style scoped>
.acard {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-lift);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--elev-low);
  transition:
    transform var(--motion-duration-hover) var(--motion-ease-settle),
    box-shadow var(--motion-duration-hover) var(--motion-ease-settle);
}
.acard:hover {
  transform: translateY(-4px);
  box-shadow: var(--elev-high);
}
.acard__media {
  position: relative;
}
.acard__img {
  display: block;
  width: 100%;
  height: 100%;
  aspect-ratio: var(--ratio-landscape);
  object-fit: cover;
}
.acard__tag {
  position: absolute;
  left: 1.4rem;
  bottom: 1.4rem;
  padding: 0.5rem 1.2rem;
  border-radius: var(--radius-pill);
  background: color-mix(in oklch, var(--navy) 88%, transparent);
  color: var(--text-ondeep);
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 1.3rem;
  backdrop-filter: blur(2px);
}
.acard__body {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  padding: 2.4rem;
}
.acard__title {
  margin: 0;
  color: var(--text-base);
}
.acard__link {
  color: inherit;
  text-decoration: none;
  transition: color var(--motion-duration-hover) var(--motion-ease-settle);
}
.acard__link::after {
  content: '';
  position: absolute;
  inset: 0;
}
.acard:hover .acard__link {
  color: var(--accent-trust);
}
.acard__excerpt {
  margin: 1.2rem 0 0;
  font-size: 1.6rem;
  line-height: 1.5;
  color: var(--text-muted);
}
.acard__meta {
  margin: 2rem 0 0;
  padding-top: 1.6rem;
  border-top: var(--line-soft);
  display: flex;
  align-items: center;
  gap: 1rem;
}
.acard__meta-item {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 1.35rem;
  color: var(--text-muted);
}
.acard__meta-sep {
  width: 1px;
  height: 1.2rem;
  background: color-mix(in oklch, var(--text-muted) 40%, transparent);
}
.acard__arrow {
  width: 1.8rem;
  height: 1.8rem;
  margin-left: auto;
  color: var(--accent-trust);
  transition: transform var(--motion-duration-hover) var(--motion-ease-settle);
}
.acard:hover .acard__arrow {
  transform: translateX(4px);
}
</style>
