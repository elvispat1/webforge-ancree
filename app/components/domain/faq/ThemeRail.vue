<script setup lang="ts">
// Rail de navigation des thèmes de la page FAQ. Desktop: liste verticale sticky à
// gauche (filet d'accent sur l'item actif). Mobile: barre de chips horizontale
// défilable au-dessus des groupes. Scrollspy: le thème dont le groupe occupe le
// haut du viewport se surligne (IntersectionObserver). Clic = défilement doux vers
// le groupe (#faq-theme-<slug>); l'offset du header fixe est garanti par le
// scroll-padding-top global. Logique transposée du SgNav du styleguide (hors prod).
import { prefersReducedMotion } from '~/family/motion'

const props = defineProps<{
  themes: { slug: string; label: string }[]
}>()

const { t } = useI18n()
const activeSlug = ref<string | null>(props.themes[0]?.slug ?? null)

let observer: IntersectionObserver | null = null

onMounted(() => {
  requestAnimationFrame(() => {
    const els = props.themes
      .map((th) => document.getElementById(`faq-theme-${th.slug}`))
      .filter((el): el is HTMLElement => el !== null)
    if (!els.length) return

    observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) activeSlug.value = (visible[0].target as HTMLElement).dataset.slug ?? null
      },
      { rootMargin: '-10% 0px -70% 0px', threshold: 0 }
    )
    els.forEach((el) => observer!.observe(el))
  })
})

onBeforeUnmount(() => observer?.disconnect())

function onClick(event: MouseEvent, slug: string) {
  event.preventDefault()
  const el = document.getElementById(`faq-theme-${slug}`)
  if (!el) return
  el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' })
  history.replaceState(null, '', `#faq-theme-${slug}`)
  activeSlug.value = slug
}
</script>

<template>
  <nav class="wf-faq-rail" :aria-label="t('a11y.faq_themes')">
    <ul class="wf-faq-rail-list">
      <li v-for="th in themes" :key="th.slug">
        <a
          :href="`#faq-theme-${th.slug}`"
          class="wf-faq-rail-link"
          :class="{ 'is-active': activeSlug === th.slug }"
          :aria-current="activeSlug === th.slug ? 'true' : undefined"
          @click="onClick($event, th.slug)"
        >{{ th.label }}</a>
      </li>
    </ul>
  </nav>
</template>
