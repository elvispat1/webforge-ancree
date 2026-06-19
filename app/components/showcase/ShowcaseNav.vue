<script setup lang="ts">
/* Navigation de la vitrine: barre collante en haut, liste les sections et la
 * galerie de blocs, avec reperage de la section active (scroll-spy via
 * IntersectionObserver). Clic = saut d'ancre (offset gere par le
 * scroll-padding-top global). Observateur recale apres montage cote client. */
const props = defineProps<{ items: { id: string; label: string }[] }>()

const activeId = ref<string | null>(null)
let observer: IntersectionObserver | null = null

function setup() {
  observer?.disconnect()
  const els = props.items
    .map((i) => document.getElementById(i.id))
    .filter((el): el is HTMLElement => el !== null)
  if (!els.length) return
  observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
      if (visible[0]) activeId.value = visible[0].target.id
    },
    { rootMargin: '-12% 0px -75% 0px', threshold: 0 }
  )
  els.forEach((el) => observer!.observe(el))
}

onMounted(() => requestAnimationFrame(setup))
onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <nav class="sg-nav" aria-label="Sections">
    <ul class="sg-nav__list">
      <li v-for="it in items" :key="it.id">
        <a :href="`#${it.id}`" class="sg-nav__link" :class="{ 'is-active': activeId === it.id }">
          {{ it.label }}
        </a>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.sg-nav {
  position: sticky;
  top: 0;
  z-index: 5;
  background: color-mix(in oklch, var(--bg-base) 90%, transparent);
  backdrop-filter: blur(10px);
  border-bottom: var(--line-hair);
}
.sg-nav__list {
  display: flex;
  gap: 0.4rem;
  overflow-x: auto;
  list-style: none;
  margin: 0;
  padding: 1.2rem 24px;
  scrollbar-width: none;
}
.sg-nav__list::-webkit-scrollbar {
  display: none;
}
.sg-nav__link {
  display: inline-block;
  white-space: nowrap;
  padding: 0.6rem 1.4rem;
  border-radius: var(--radius-pill);
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 1.4rem;
  color: var(--text-muted);
  text-decoration: none;
  transition:
    color var(--motion-duration-hover) var(--motion-ease-settle),
    background-color var(--motion-duration-hover) var(--motion-ease-settle);
}
.sg-nav__link:hover {
  color: var(--text-base);
}
.sg-nav__link.is-active {
  background: var(--text-base);
  color: var(--paper);
}

@container site (min-width: 1024px) {
  .sg-nav__list {
    padding-inline: 8rem;
  }
}
</style>
