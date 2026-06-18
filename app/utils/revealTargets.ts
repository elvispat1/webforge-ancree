const isHidden = (el: Element) => el.getAttribute('aria-hidden') === 'true'

/* Collecte les cibles d'apparition d'un conteneur, dans l'ordre du DOM:
 *   - [data-reveal]          → l'élément lui-même est une cible;
 *   - [data-reveal-stagger]  → ses enfants directs sont chacun une cible.
 * Les éléments décoratifs (aria-hidden) sont ignorés (honeypot, etc.).
 * Partagé par la directive v-reveal (au scroll) et useEntrance (au montage). */
export function collectRevealTargets(root: HTMLElement): HTMLElement[] {
  const marked = root.querySelectorAll<HTMLElement>('[data-reveal], [data-reveal-stagger]')
  const targets: HTMLElement[] = []
  marked.forEach((node) => {
    if (isHidden(node)) return
    if (node.hasAttribute('data-reveal-stagger')) {
      for (const child of Array.from(node.children) as HTMLElement[]) {
        if (!isHidden(child)) targets.push(child)
      }
    } else {
      targets.push(node)
    }
  })
  return targets
}
