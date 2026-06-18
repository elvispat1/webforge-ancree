<script setup lang="ts">
/* Modal — primitive d'overlay réutilisable et accessible.
 *
 * Agnostique du contenu (tout passe par le slot) et de la marque (uniquement
 * des tokens). Premier consommateur: le menu mobile (placement plein écran).
 * Conçue aussi pour des pop-ups centrés et des panneaux latéraux (drawers).
 *
 * État: piloté par le store overlay, par `id`. Le déclencheur (n'importe où)
 * appelle overlay.open(id); le Modal lit overlay.isActive(id). Un seul overlay
 * ouvert à la fois (cf. store). Migrera vers webforge-core avec le store.
 *
 * Usage:
 *   <Modal id="mobile-menu" :label="t('a11y.mobile_menu')" placement="full">
 *     <template #default="{ close }"> … <button @click="close" /> … </template>
 *   </Modal>
 *   // ailleurs: const overlay = useOverlayStore(); overlay.open('mobile-menu')
 *
 * Props:
 *   - id              → identifiant unique de cet overlay dans le store.
 *   - label           → nom accessible du dialogue (aria-label).
 *   - placement       → d'où vient le panneau et où il se pose:
 *                       'center' | 'right' | 'left' | 'top' | 'bottom' | 'full'.
 *   - size            → taille du panneau pour les placements non plein écran
 *                       (largeur pour right/left, hauteur pour top/bottom,
 *                       max-width pour center). Token ou unité; défaut par CSS.
 *   - backdrop        → afficher le voile assombri derrière le panneau.
 *   - closeOnBackdrop → un clic sur le voile ferme l'overlay.
 *   - closeOnEscape   → la touche Échap ferme l'overlay.
 *
 * Accessibilité (gérée ici, pas dans les consommateurs):
 *   - role="dialog" + aria-modal + aria-label sur le panneau;
 *   - focus déplacé dans le panneau à l'ouverture, rendu au déclencheur à la
 *     fermeture; piège à focus (Tab/Shift+Tab cyclent dans le panneau);
 *   - le reste de la page passe en `inert` tant que l'overlay est ouvert
 *     (non focusable, non cliquable, sorti de l'arbre d'accessibilité);
 *   - Échap ferme; scroll du body verrouillé (compensation de la scrollbar
 *     pour éviter le saut de layout);
 *   - transitions neutralisées par le reset prefers-reduced-motion global.
 */

type Placement = 'center' | 'right' | 'left' | 'top' | 'bottom' | 'full'

const props = withDefaults(defineProps<{
  id: string
  label: string
  placement?: Placement
  size?: string
  backdrop?: boolean
  closeOnBackdrop?: boolean
  closeOnEscape?: boolean
}>(), {
  placement: 'center',
  size: '',
  backdrop: true,
  closeOnBackdrop: true,
  closeOnEscape: true
})

const overlay = useOverlayStore()
const open = computed(() => overlay.isActive(props.id))

const panel = ref<HTMLElement | null>(null)

/* Élément qui détenait le focus avant l'ouverture: on le lui rend à la
 * fermeture (continuité au clavier / lecteur d'écran). */
let trigger: HTMLElement | null = null

/* Racine de l'app Nuxt: on la rend inerte tant que l'overlay est ouvert.
 * Le Modal se téléporte dans <body>, donc hors de cette racine. */
const APP_ROOT_ID = '__nuxt'

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(',')

function focusables(): HTMLElement[] {
  if (!panel.value) return []
  return Array.from(panel.value.querySelectorAll<HTMLElement>(FOCUSABLE))
    .filter((el) => el.offsetParent !== null)
}

function close() {
  overlay.close()
}

/* Fermeture due à une navigation (liens du menu): pose le drapeau du store pour
 * que la restauration de scroll soit sautée, de façon déterministe (voir le
 * commentaire de unlockScroll). */
function closeForNavigation() {
  overlay.closeForNavigation()
}

function onBackdrop() {
  if (props.closeOnBackdrop) close()
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.closeOnEscape) {
    e.stopPropagation()
    close()
    return
  }
  if (e.key !== 'Tab') return

  const items = focusables()
  /* Panneau sans élément focusable: garder le focus sur le panneau lui-même. */
  if (items.length === 0) {
    e.preventDefault()
    panel.value?.focus()
    return
  }

  const first = items[0]!
  const last = items[items.length - 1]!
  const active = document.activeElement

  if (e.shiftKey && (active === first || active === panel.value)) {
    e.preventDefault()
    last.focus()
  } else if (!e.shiftKey && active === last) {
    e.preventDefault()
    first.focus()
  }
}

/* Verrou de scroll robuste iOS: `overflow:hidden` sur le body ne bloque pas
 * Safari iOS (le body continue de défiler sous l'overlay). On fige donc le body
 * en `position:fixed` à sa position de scroll courante, restaurée à la fermeture.
 * La largeur de scrollbar est compensée (padding-right) pour éviter le saut de
 * layout sur desktop. */
let lockedScrollY = 0

function lockScroll() {
  lockedScrollY = window.scrollY
  const scrollbar = window.innerWidth - document.documentElement.clientWidth
  document.body.style.position = 'fixed'
  document.body.style.top = `-${lockedScrollY}px`
  document.body.style.left = '0'
  document.body.style.right = '0'
  document.body.style.width = '100%'
  if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`
}

function unlockScroll(skipRestore = false) {
  document.body.style.position = ''
  document.body.style.top = ''
  document.body.style.left = ''
  document.body.style.right = ''
  document.body.style.width = ''
  document.body.style.paddingRight = ''
  /* Le position:fixed avait remis window.scrollY à 0; on restaure la position
   * d'avant le verrou pour que l'usager reste où il était. On SAUTE cette
   * restauration quand la fermeture est due à une navigation (skipRestore): la
   * nouvelle page doit démarrer là où le scrollBehavior du routeur la place (haut,
   * ancre, liste blog). Le signal vient du store (drapeau posé au clic), pas de la
   * route: il est donc déterministe, contrairement à une comparaison de chemin qui
   * dépend de l'ordre d'exécution watcher/routeur (course = bug intermittent). */
  if (!skipRestore) {
    window.scrollTo(0, lockedScrollY)
  }
}

function setBackgroundInert(on: boolean) {
  const root = document.getElementById(APP_ROOT_ID)
  if (!root) return
  if (on) root.setAttribute('inert', '')
  else root.removeAttribute('inert')
}

watch(open, async (isOpen) => {
  if (!import.meta.client) return

  if (isOpen) {
    trigger = document.activeElement as HTMLElement | null
    lockScroll()
    setBackgroundInert(true)
    await nextTick()
    /* Focus le panneau (annonce le dialogue par son aria-label); Tab descend
     * ensuite dans le contenu via le piège à focus. */
    panel.value?.focus()
  } else {
    /* Passage direct A -> B (un autre overlay devient actif sans fermeture
     * intermédiaire): ne pas relâcher le verrou de scroll ni l'inertie, B en a
     * encore besoin et l'ordre de déclenchement des watchers n'est pas garanti.
     * B (ré)applique lock/inert et prend le focus de son côté. Garde le système
     * sain quand un 2e Modal coexistera (multipage à venir). */
    if (overlay.isOpen) {
      /* Le drapeau de navigation ne concerne que CE déverrouillage (sauté ici,
       * B garde le verrou): on le consomme pour qu'il ne puisse pas pendre et
       * contaminer la prochaine fermeture (filet pour le 2e Modal à venir). */
      overlay.consumeNavigation()
      trigger = null
      return
    }
    /* Retirer l'inertie AVANT de redonner le focus, sinon le déclencheur
     * (dans la racine) reste non focusable. */
    setBackgroundInert(false)
    /* Consomme le drapeau de navigation: une fermeture par lien du menu saute la
     * restauration de scroll, une fermeture par X/Échap/voile la fait. */
    unlockScroll(overlay.consumeNavigation())
    trigger?.focus?.()
    trigger = null
  }
})

/* Filet de sécurité si le composant est démonté alors que l'overlay est ouvert
 * (HMR, teardown): ne pas laisser le body verrouillé ni la page inerte. On
 * consomme aussi le drapeau pour ne pas le laisser pendre dans le store. */
onBeforeUnmount(() => {
  if (open.value) {
    setBackgroundInert(false)
    unlockScroll(overlay.consumeNavigation())
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="wf-overlay">
      <div
        v-if="open"
        class="wf-overlay"
        :class="`wf-overlay--${placement}`"
        @keydown="onKeydown"
      >
        <div
          v-if="backdrop"
          class="wf-overlay__backdrop"
          @click="onBackdrop"
        />
        <div
          ref="panel"
          class="wf-modal"
          role="dialog"
          aria-modal="true"
          :aria-label="label"
          tabindex="-1"
          :style="size ? { '--wf-modal-size': size } : undefined"
        >
          <slot :close="close" :close-for-navigation="closeForNavigation" />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
