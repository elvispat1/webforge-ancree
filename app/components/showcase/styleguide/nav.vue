<script setup lang="ts">
/* Shell de navigation des pages dev (guide de style, vitrine blocs, formulaire).
 *
 * Rend une barre latérale gauche sticky (liste d'ancres + scroll-spy) ET le
 * contenu de la page passé en slot, dans une mise en page 2 colonnes. La barre
 * se replie en rail mince (animation de largeur) et POUSSE le contenu (jamais
 * d'overlay sur desktop). Tout le comportement vit ici, donc toutes les pages dev
 * se comportent pareil.
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

// Quand le jeu d'ancres change (bascule d'onglet dans /showcase, où les panneaux
// coexistent en v-show), on ré-observe les sections désormais visibles et on
// remet l'ancre active sur la première. flush 'post': le DOM (visibilité) est à
// jour avant de ré-observer.
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

      <!-- Replié: repère typographique vertical, pour que le rail se lise comme un
           panneau. Toujours présent (positionné en absolu, hors flux), révélé en
           fondu différé au repli. Décoratif (le bouton porte le libellé a11y). -->
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

/* Barre latérale: colonne pleine hauteur sticky qui pousse le contenu. Largeur
 * (et padding) animés au repli. Le topbar dev n'est pas sticky: il sort du flux
 * au scroll et la barre se cale à top:0. */
.wf-sg__bar {
  position: sticky;
  top: 0;
  flex: 0 0 auto;
  width: 26rem;
  height: 100vh;
  box-sizing: border-box;
  overflow-x: hidden;
  overflow-y: auto;
  padding: calc(var(--spacing-unit) * 2.4) calc(var(--spacing-unit) * 2);
  border-right: var(--line-hair);
  background: var(--bg-base);
  z-index: 10;
  transition: width var(--motion-duration-line) var(--motion-ease-settle);
}
/* Repliée: rail pleine hauteur. Padding INCHANGÉ par rapport à l'état ouvert, donc
 * le bouton ne bouge pas d'un pixel: largeur = padding gauche (2) + bouton (3.2) +
 * padding droite (2). Seule la largeur s'anime; libellé et liste s'effacent. */
.wf-sg.is-collapsed .wf-sg__bar {
  width: 7.2rem;
  overflow: hidden; /* tue la barre de défilement parasite du rail replié */
}

.wf-sg__content {
  flex: 1 1 auto;
  min-width: 0;
}
/* Feuille de contenu centrée et bornée: la vitrine se lit comme un document, pas
 * étalée bord à bord. Reste large (au-dessus du seuil desktop des blocs). */
.wf-sg__sheet {
  max-width: 128rem;
  margin-inline: auto;
}

/* En-tête de la barre: bouton de repli (en tête, pour rester visible dans le
 * rail) + libellé qui peut passer sur 2 lignes. */
.wf-sg__head {
  margin-bottom: calc(var(--spacing-unit) * 2);
}
/* Rien ne bouge dans l'en-tête au repli: le bouton garde sa position exacte (même
 * padding, même place dans le flux), seuls le libellé et la liste s'effacent. */
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
  transition: color 150ms ease, border-color 150ms ease, background-color 150ms ease;
}
.wf-sg__toggle:hover {
  color: var(--accent-1);
  border-color: color-mix(in oklch, var(--accent-1) 35%, transparent);
  background: var(--bg-alt);
}
.wf-sg__toggle:focus-visible {
  outline: 2px solid var(--accent-1);
  outline-offset: 2px;
}
/* Replié: le bouton prend l'accent pour signaler clairement « rouvrir ». */
.wf-sg.is-collapsed .wf-sg__toggle {
  color: var(--accent-1);
  border-color: color-mix(in oklch, var(--accent-1) 35%, transparent);
}
.wf-sg.is-collapsed .wf-sg__toggle:hover {
  background: color-mix(in oklch, var(--accent-1) 8%, transparent);
}
/* Libellé vertical du rail replié: repère typographique discret (mono, muté),
 * centré sur la hauteur. Positionné dans la barre (sticky = contexte positionné). */
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
  transition: opacity 150ms ease;
}
/* Apparaît en fondu APRÈS l'animation de largeur (délai), jamais pendant. */
.wf-sg.is-collapsed .wf-sg__rail-label {
  opacity: 1;
  transition: opacity 150ms ease 200ms;
}

/* Libellé + liste: s'effacent au repli (opacité), clippés par la largeur du rail. */
.wf-sg__label {
  display: block;
  margin: 0 0 calc(var(--spacing-unit) * 1.6);
  font-family: var(--font-mono);
  font-size: 1.1rem;
  line-height: 1.35;
  color: var(--text-muted);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  /* nowrap: comme les liens, le titre ne se réagence pas au repli (il ne grandit
   * pas vers le bas pour pousser la liste), il est coupé net par le bord. */
  white-space: nowrap;
  transition: opacity 120ms ease;
}
.wf-sg__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing-unit) * 0.5);
  transition: opacity 120ms ease;
}
.wf-sg.is-collapsed .wf-sg__list {
  opacity: 0;
  pointer-events: none;
}

/* Liens texte; l'actif passe en text-base + gras + filet accent à gauche. */
.wf-sg__link {
  display: block;
  /* nowrap: au repli, le libellé ne se réagence pas. Il est coupé net par le bord
   * du panneau (overflow:hidden de la barre) et glisse hors champ proprement. */
  white-space: nowrap;
  font-family: var(--font-display);
  font-size: 1.3rem;
  color: var(--text-muted);
  text-decoration: none;
  letter-spacing: 0.01em;
  padding: calc(var(--spacing-unit) * 1) calc(var(--spacing-unit) * 1.5);
  border-left: 2px solid transparent;
  border-radius: 0 var(--radius) var(--radius) 0;
  transition: color 150ms ease, border-color 150ms ease, background-color 150ms ease;
}
.wf-sg__link:hover {
  color: var(--text-base);
  background: var(--bg-alt);
}
.wf-sg__link:focus-visible {
  outline: 2px solid var(--accent-1);
  outline-offset: 2px;
}
.wf-sg__link.is-active {
  color: var(--text-base);
  font-weight: 600;
  border-left-color: var(--accent-1);
}

/* Petit écran: la barre ouverte passe en overlay fixe pour ne pas écraser le
 * contenu (le push réduirait le bloc sous le seuil desktop des container queries).
 * Repliée, le rail mince reste un simple push. Seuil en @container site, résolu
 * contre .wf-site (hôte du conteneur dans le layout showcase): même régime de
 * largeur que le reste du chrome. Effet du containment du layout: « fixed » se
 * cale sur la page entière plutôt que le viewport (la barre couvre toute la
 * hauteur du document) — équivalent visuellement, surface dev seulement. */
@container site (max-width: 767.98px) {
  .wf-sg:not(.is-collapsed) .wf-sg__bar {
    position: fixed;
    inset: 0 auto 0 0;
    box-shadow: 0 0 2rem color-mix(in oklch, var(--black) 25%, transparent);
  }
}
</style>
