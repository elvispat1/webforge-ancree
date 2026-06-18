/* Store overlay — source de vérité unique de « quel overlay est ouvert ».
 *
 * Un seul overlay ouvert à la fois: l'état tient un identifiant (ou null).
 * Ouvrir un overlay en remplace un autre déjà ouvert (donc fermer A se fait
 * gratuitement en ouvrant B). Couvre le menu mobile, mais aussi tout futur
 * pop-up ou dialogue: chaque consommateur choisit son propre id.
 *
 * Vit dans l'app pour l'instant; migrera vers webforge-core quand un 2e démo
 * en aura besoin (cf. discipline de remplissage des packages, CLAUDE.md).
 *
 * Usage:
 *   const overlay = useOverlayStore()
 *   overlay.open('mobile-menu')           // ouvre
 *   overlay.toggle('mobile-menu')         // bascule
 *   overlay.close()                       // ferme (l'usager reste où il était)
 *   overlay.closeForNavigation()          // ferme parce qu'on navigue
 *   overlay.isActive('mobile-menu')       // bool réactif dans un computed
 *
 * Le store ne gère QUE l'état. Le comportement (focus trap, Escape, scroll
 * lock, fond inerte, transitions) vit dans le composant <Modal>.
 */

export const useOverlayStore = defineStore('overlay', () => {
  /* id de l'overlay actuellement ouvert, ou null si aucun. */
  const activeId = ref<string | null>(null)

  /* Intention de la fermeture courante: vrai quand on ferme PARCE QU'ON NAVIGUE
   * (clic d'un lien du menu). Posé SYNCHRONIQUEMENT au clic, donc fiable quand le
   * watcher async du Modal le lit plus tard: il sait alors sauter la restauration
   * de scroll et laisser le scrollBehavior du routeur placer la nouvelle page
   * (haut, ancre, liste blog) sans course. Drapeau privé (jamais SSR), lu+remis à
   * zéro par consumeNavigation(). Voir la garde de scroll dans <Modal>. */
  const navigating = ref(false)

  /* Vrai dès qu'un overlay quelconque est ouvert (utile pour un effet global,
   * ex. masquer un bouton flottant tant qu'un overlay occupe l'écran). */
  const isOpen = computed(() => activeId.value !== null)

  /* Prédicat par id: à lire dans un computed côté consommateur pour rester
   * réactif (Vue suit activeId au travers de l'appel). */
  const isActive = (id: string) => activeId.value === id

  function open(id: string) {
    activeId.value = id
  }

  /* Fermeture sans navigation (X, Échap, voile, auto-fermeture au resize):
   * l'usager reste sur la page, le Modal restaure sa position de scroll. */
  function close() {
    navigating.value = false
    activeId.value = null
  }

  /* Fermeture due à une navigation (lien du menu): le drapeau survit jusqu'à ce
   * que le watcher du Modal le consomme, pour sauter la restauration de scroll. */
  function closeForNavigation() {
    navigating.value = true
    activeId.value = null
  }

  /* Lit puis remet à zéro le drapeau de navigation. Le Modal l'appelle à la
   * fermeture pour décider de restaurer ou non le scroll. */
  function consumeNavigation(): boolean {
    const was = navigating.value
    navigating.value = false
    return was
  }

  function toggle(id: string) {
    activeId.value = activeId.value === id ? null : id
  }

  return { activeId, isOpen, isActive, open, close, closeForNavigation, consumeNavigation, toggle }
})
