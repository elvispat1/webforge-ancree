<script setup lang="ts">
/* Shell de navigation des pages vitrine (guide de style, blocs, formulaire).
 *
 * Rend une barre laterale gauche sticky (liste d'ancres + scroll-spy) ET le
 * contenu de la page passe en slot, dans une mise en page 2 colonnes. La barre se
 * replie en rail mince (animation de largeur) et POUSSE le contenu (jamais
 * d'overlay sur desktop). Tout le comportement vit ici. Porte de Minimaliste,
 * peau Ancree.
 *
 * Usage:
 *   <SgNav :items="sections" label="…">
 *     <!-- contenu de la page -->
 *   </SgNav>
 */

const props = withDefaults(defineProps<{
  items: { id: string; label: string }[]
  label?: string
}>(), {
  label: 'Sections'
})

const collapsed = ref(false)
const activeId = ref<string | null>(props.items[0]?.id ?? null)

let observer: IntersectionObserver | null = null

function setupObserver() {
  observer?.disconnect()
  requestAnimationFrame(() => {
    const elements = props.items
      .map(item => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null)

    if (!elements.length) return

    observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) {
          activeId.value = visible[0].target.id
        }
      },
      {
        rootMargin: '-10% 0px -70% 0px',
        threshold: 0
      }
    )

    elements.forEach(el => observer!.observe(el))
  })
}

onMounted(setupObserver)

// Quand le jeu d'ancres change (bascule d'onglet, panneaux en v-show), on
// re-observe les sections desormais visibles et on remet l'ancre active sur la
// premiere. flush 'post': le DOM (visibilite) est a jour avant de re-observer.
watch(() => props.items, () => {
  activeId.value = props.items[0]?.id ?? null
  setupObserver()
}, { flush: 'post' })

onBeforeUnmount(() => {
  observer?.disconnect()
})

function onClick(event: MouseEvent, id: string) {
  event.preventDefault()
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  history.replaceState(null, '', `#${id}`)
  activeId.value = id
}
</script>

<template>
  <div class="wf-sg" :class="{ 'is-collapsed': collapsed }">
    <nav class="wf-sg__bar" :aria-label="label">
      <div class="wf-sg__head">
        <button
          type="button"
          class="wf-sg__toggle"
          :aria-expanded="!collapsed"
          :aria-label="collapsed ? 'Afficher la navigation' : 'Masquer la navigation'"
          @click="collapsed = !collapsed"
        >
          <Icon
            :name="collapsed ? 'lucide:panel-left-open' : 'lucide:panel-left-close'"
            aria-hidden="true"
          />
        </button>
      </div>
      <p class="wf-sg__label">{{ label }}</p>

      <ul class="wf-sg__list">
        <li v-for="item in items" :key="item.id">
          <a
            :href="`#${item.id}`"
            class="wf-sg__link"
            :class="{ 'is-active': activeId === item.id }"
            :aria-current="activeId === item.id ? 'true' : undefined"
            @click="onClick($event, item.id)"
          >{{ item.label }}</a>
        </li>
      </ul>

      <!-- Replie: repere typographique vertical, pour que le rail se lise comme un
           panneau. Toujours present (positionne en absolu), revele en fondu differe
           au repli. Decoratif (le bouton porte le libelle a11y). -->
      <span class="wf-sg__rail-label" aria-hidden="true">{{ label }}</span>
    </nav>

    <div class="wf-sg__content">
      <div class="wf-sg__sheet">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
.wf-sg {
  display: flex;
  align-items: flex-start;
}

/* Barre laterale: colonne pleine hauteur sticky qui pousse le contenu. Largeur (et
 * padding) animes au repli. La barre d'onglets sombre n'est pas sticky: elle sort
 * du flux au scroll et la barre laterale se cale a top:0. */
.wf-sg__bar {
  position: sticky;
  top: 0;
  flex: 0 0 auto;
  width: 26rem;
  height: 100svh;
  box-sizing: border-box;
  overflow-x: hidden;
  overflow-y: auto;
  padding: calc(var(--spacing-unit) * 2.4) calc(var(--spacing-unit) * 2);
  border-right: var(--line-hair);
  background: var(--bg-base);
  z-index: 10;
  transition: width var(--motion-duration-line) var(--motion-ease-settle);
}
/* Repliee: rail pleine hauteur. Padding INCHANGE par rapport a l'etat ouvert: le
 * bouton ne bouge pas (largeur = padding gauche + bouton 3.2 + padding droite).
 * Seule la largeur s'anime; libelle et liste s'effacent. */
.wf-sg.is-collapsed .wf-sg__bar {
  width: 7.2rem;
  overflow: hidden;
}

.wf-sg__content {
  flex: 1 1 auto;
  min-width: 0;
}
/* Feuille de contenu centree et bornee: la vitrine se lit comme un document, pas
 * etalee bord a bord. Reste large (au-dessus du seuil desktop des blocs). */
.wf-sg__sheet {
  max-width: 128rem;
  margin-inline: auto;
}

.wf-sg__head {
  margin-bottom: calc(var(--spacing-unit) * 2);
}
.wf-sg.is-collapsed .wf-sg__label {
  opacity: 0;
  pointer-events: none;
}
.wf-sg__toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 3.2rem;
  height: 3.2rem;
  background: transparent;
  border: var(--line-hair);
  border-radius: var(--radius);
  color: var(--text-muted);
  cursor: pointer;
  font-size: 1.8rem;
  transition: color var(--motion-duration-hover) var(--motion-ease-out), border-color var(--motion-duration-hover) var(--motion-ease-out), background-color var(--motion-duration-hover) var(--motion-ease-out);
}
.wf-sg__toggle:hover {
  color: var(--accent-trust);
  border-color: color-mix(in oklch, var(--accent-trust) 35%, transparent);
  background: var(--bg-alt);
}
.wf-sg__toggle:focus-visible {
  outline: 2px solid var(--accent-trust);
  outline-offset: 2px;
}
.wf-sg.is-collapsed .wf-sg__toggle {
  color: var(--accent-trust);
  border-color: color-mix(in oklch, var(--accent-trust) 35%, transparent);
}
.wf-sg.is-collapsed .wf-sg__toggle:hover {
  background: color-mix(in oklch, var(--accent-trust) 8%, transparent);
}
/* Libelle vertical du rail replie: repere typographique discret (mono, mute). */
.wf-sg__rail-label {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  writing-mode: vertical-rl;
  font-family: var(--font-mono);
  font-size: 1.1rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: color-mix(in oklch, var(--text-muted) 75%, transparent);
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: opacity var(--motion-duration-hover) var(--motion-ease-out);
}
.wf-sg.is-collapsed .wf-sg__rail-label {
  opacity: 1;
  transition: opacity var(--motion-duration-hover) var(--motion-ease-out) 200ms;
}

.wf-sg__label {
  display: block;
  margin: 0 0 calc(var(--spacing-unit) * 1.6);
  font-family: var(--font-mono);
  font-size: 1.1rem;
  line-height: 1.35;
  color: var(--text-muted);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  white-space: nowrap;
  transition: opacity var(--motion-duration-hover) var(--motion-ease-out);
}
.wf-sg__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing-unit) * 0.5);
  transition: opacity var(--motion-duration-hover) var(--motion-ease-out);
}
.wf-sg.is-collapsed .wf-sg__list {
  opacity: 0;
  pointer-events: none;
}

/* Liens texte; l'actif passe en text-base + gras + filet accent a gauche. */
.wf-sg__link {
  display: block;
  white-space: nowrap;
  font-family: var(--font-display);
  font-size: 1.3rem;
  color: var(--text-muted);
  text-decoration: none;
  letter-spacing: 0.01em;
  padding: calc(var(--spacing-unit) * 1) calc(var(--spacing-unit) * 1.5);
  border-left: 2px solid transparent;
  border-radius: 0 var(--radius) var(--radius) 0;
  transition: color var(--motion-duration-hover) var(--motion-ease-out), border-color var(--motion-duration-hover) var(--motion-ease-out), background-color var(--motion-duration-hover) var(--motion-ease-out);
}
.wf-sg__link:hover {
  color: var(--text-base);
  background: var(--bg-alt);
}
.wf-sg__link:focus-visible {
  outline: 2px solid var(--accent-trust);
  outline-offset: 2px;
}
.wf-sg__link.is-active {
  color: var(--text-base);
  font-weight: 600;
  border-left-color: var(--accent-trust);
}

/* Petit ecran: la barre ouverte passe en overlay fixe pour ne pas ecraser le
 * contenu (le push le ferait passer sous le seuil desktop des container queries).
 * Repliee, le rail mince reste un simple push. Seuil en @container site. */
@container site (max-width: 767.98px) {
  .wf-sg:not(.is-collapsed) .wf-sg__bar {
    position: fixed;
    inset: 0 auto 0 0;
    box-shadow: 0 0 2rem color-mix(in oklch, var(--shadow-tint) 30%, transparent);
  }
}
</style>
