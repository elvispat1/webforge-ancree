<script lang="ts">
/* Serialiseur Portable Text maison (sans dependance): rend le texte riche d'un
 * article en HTML semantique style Ancree. Marques supportees: strong, em, et
 * l'annotation link (interne via NuxtLink, externe en <a> sur). Les blocs de
 * liste consecutifs de meme type sont regroupes en <ul>/<ol>. Titres mappes sur
 * l'echelle slab (h2 -> wf-h3, h3 -> wf-h4). Render function pour gerer les
 * marques imbriquees proprement; les styles scoped s'appliquent au rendu. */
import { defineComponent, h, resolveComponent, type PropType, type VNode } from 'vue'
import type { PortableTextBlock, PortableTextSpan } from '~/content/article-blocks'

export default defineComponent({
  name: 'PortableText',
  props: {
    value: { type: Array as PropType<PortableTextBlock[]>, default: () => [] }
  },
  setup(props) {
    const NuxtLink = resolveComponent('NuxtLink')

    function renderSpan(span: PortableTextSpan, markDefs: PortableTextBlock['markDefs']): VNode | string {
      let node: VNode | string = span.text
      for (const mark of span.marks ?? []) {
        // Capture dans une const fraiche: le slot de NuxtLink est lazy, sans ca il
        // lirait `node` reassigne (a lui-meme) -> auto-reference infinie.
        const inner = node
        if (mark === 'strong') node = h('strong', null, [inner])
        else if (mark === 'em') node = h('em', null, [inner])
        else {
          const def = markDefs?.find((d) => d._key === mark)
          if (def && def._type === 'link') {
            const href = def.href
            const external = href.startsWith('http')
            const internal = href.startsWith('/') && !href.startsWith('//')
            node = internal
              ? h(NuxtLink, { to: href, class: 'wf-prose-link' }, () => [inner])
              : h('a', {
                  href,
                  class: 'wf-prose-link',
                  target: external ? '_blank' : undefined,
                  rel: external ? 'noopener noreferrer' : undefined
                }, [inner])
          }
        }
      }
      return node
    }

    const children = (block: PortableTextBlock) => block.children.map((s) => renderSpan(s, block.markDefs))

    return () => {
      const blocks = props.value ?? []
      const out: VNode[] = []
      let i = 0
      while (i < blocks.length) {
        const blk = blocks[i]!
        if (blk.listItem) {
          const kind = blk.listItem
          const tag = kind === 'number' ? 'ol' : 'ul'
          const items: VNode[] = []
          while (i < blocks.length && blocks[i]!.listItem === kind) {
            const li = blocks[i]!
            items.push(h('li', { key: li._key }, children(li)))
            i++
          }
          out.push(h(tag, { key: blk._key, class: tag === 'ol' ? 'wf-prose-ol' : 'wf-prose-ul' }, items))
          continue
        }
        const style = blk.style ?? 'normal'
        if (style === 'h2') out.push(h('h2', { key: blk._key, class: 'wf-h3 wf-prose-h' }, children(blk)))
        else if (style === 'h3') out.push(h('h3', { key: blk._key, class: 'wf-h4 wf-prose-h' }, children(blk)))
        else out.push(h('p', { key: blk._key, class: 'wf-body-1 wf-prose-p' }, children(blk)))
        i++
      }
      return h('div', { class: 'wf-prose' }, out)
    }
  }
})
</script>

<style scoped>
.wf-prose {
  display: flex;
  flex-direction: column;
  gap: 1.8rem;
  color: var(--text-base);
}
/* Titres de section dans le corps: respirent au-dessus, slab plante. */
.wf-prose-h {
  margin-top: 1.4rem;
}
.wf-prose-h:first-child {
  margin-top: 0;
}
.wf-prose-p {
  color: color-mix(in oklch, var(--text-base) 86%, transparent);
}
/* Listes: puce ambre (jamais de numero impose par le design; la liste ordonnee
 * reste une vraie liste ordonnee de contenu si l'auteur la choisit). */
.wf-prose-ul,
.wf-prose-ol {
  margin: 0;
  padding-left: 2.4rem;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  color: color-mix(in oklch, var(--text-base) 86%, transparent);
  font-size: 1.7rem;
  line-height: 1.6;
}
.wf-prose-ul {
  list-style: none;
}
.wf-prose-ul li {
  position: relative;
  padding-left: 1.6rem;
}
.wf-prose-ul li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.85em;
  width: 0.7rem;
  height: 0.7rem;
  border-radius: var(--radius-sm);
  background: var(--accent-call);
}
.wf-prose-ol {
  list-style: decimal;
}
.wf-prose-ol li::marker {
  font-family: var(--font-display);
  font-weight: 700;
  color: var(--accent-trust);
}
/* Liens dans le corps: bleu confiance, soulignement doux qui se ferme au survol. */
.wf-prose-link {
  color: var(--accent-trust);
  text-decoration: underline;
  text-decoration-color: color-mix(in oklch, var(--accent-trust) 40%, transparent);
  text-underline-offset: 3px;
  transition: text-decoration-color var(--motion-duration-hover) var(--motion-ease-settle);
}
.wf-prose-link:hover {
  text-decoration-color: var(--accent-trust);
}
.wf-prose :where(strong) {
  font-weight: 700;
  color: var(--text-base);
}
</style>
