<script setup lang="ts">
/* Button — composant visuel + interactif. Décide lui-même de rendre <button>,
 * <NuxtLink> ou <a> selon ses props, pour éviter le HTML invalide (nested
 * interactive elements).
 *
 * Usage:
 *   <Button href="#contact" kind="anchor">Démarrer un projet</Button>
 *   <Button href="/services" kind="internal" variant="ghost" :icon="false">Voir les services</Button>
 *   <Button href="https://patoinestudio.ca" kind="external">Patoine Studio</Button>
 *   <Button type="submit">Envoyer</Button>
 *   <Button icon="lucide:download">Télécharger</Button>
 *
 * Props:
 *   - href + kind  → rendu <NuxtLink>, <a target=_blank> ou <a href=#…>
 *   - href absent  → rendu <button type=button|submit>
 *   - variant      → 'primary' (par défaut) ou 'ghost'
 *   - size         → 'default' ou 'sm' (plus compact, pour menu/header)
 *   - icon         → nom d'icône Iconify. Défaut conditionnel:
 *                    'lucide:arrow-up-right' si kind='external',
 *                    sinon 'lucide:chevron-right'.
 *                    Passer `:icon="false"` pour désactiver l'icône.
 *   - disabled     → désactive le bouton
 *   - loading      → état d'envoi en cours: spinner à la place du chevron +
 *                    aria-busy. Le bouton RESTE actif (pas de disabled, qui le
 *                    sortirait de l'ordre de tabulation): c'est au formulaire
 *                    de bloquer la double soumission par son état.
 *
 * Quand Sanity sera branché en V2, les boutons venant du CMS passeront par ce
 * même composant — il suffira de mapper le type Sanity (`internal | external |
 * anchor | submit`) et l'icône optionnelle sur les props ici.
 *
 * Animation chevron au hover (si icône présente):
 *   default: [Label  ›]
 *   hover:   [›  Label] avec ancien chevron qui sort à droite, label qui se
 *            décale, nouveau chevron qui entre depuis la gauche.
 */

const NuxtLink = resolveComponent('NuxtLink')

const props = withDefaults(defineProps<{
  href?: string
  kind?: 'internal' | 'external' | 'anchor'
  variant?: 'primary' | 'ghost'
  size?: 'default' | 'sm'
  type?: 'button' | 'submit'
  disabled?: boolean
  icon?: string | false
  loading?: boolean
}>(), {
  variant: 'primary',
  size: 'default',
  type: 'button',
  disabled: false,
  loading: false
})

/* Mention sr-only « nouvelle fenêtre » des liens externes (a11y, G201). */
const { t } = useI18n()

const isLink = computed(() => Boolean(props.href))

const tag = computed(() => {
  if (!isLink.value) return 'button'
  if (props.kind === 'internal') return NuxtLink
  return 'a'
})

const bindings = computed(() => {
  if (!isLink.value) {
    return { type: props.type, disabled: props.disabled }
  }
  if (props.kind === 'internal') {
    return { to: props.href }
  }
  if (props.kind === 'external') {
    return { href: props.href, target: '_blank', rel: 'noopener noreferrer' }
  }
  return { href: props.href } // anchor
})

const showIcon = computed(() => props.icon !== false)
const defaultIcon = computed(() =>
  props.kind === 'external' ? 'lucide:arrow-up-right' : 'lucide:chevron-right'
)
const iconName = computed(() =>
  typeof props.icon === 'string' ? props.icon : defaultIcon.value
)

const classes = computed(() => [
  'wf-btn',
  props.variant === 'ghost' ? 'wf-btn-ghost' : null,
  props.size === 'sm' ? 'wf-btn-sm' : null,
  !showIcon.value ? 'wf-btn-no-icon' : null,
  props.loading ? 'is-loading' : null
])
</script>

<template>
  <component
    :is="tag"
    v-bind="bindings"
    :class="classes"
    :aria-busy="loading ? 'true' : undefined"
  >
    <Icon
      v-if="showIcon && !loading"
      :name="iconName"
      class="wf-btn-chevron wf-btn-chevron--enter"
      aria-hidden="true"
    />
    <span class="wf-btn-label">
      <slot />
      <span v-if="kind === 'external'" class="wf-sr-only">{{ t('a11y.opens_new_window') }}</span>
    </span>
    <!-- Spinner d'envoi: prend exactement la place du chevron (même empreinte),
         décoratif (l'état est porté par aria-busy + le libellé du bouton). -->
    <span v-if="loading" class="wf-btn-spinner" aria-hidden="true" />
    <Icon
      v-else-if="showIcon"
      :name="iconName"
      class="wf-btn-chevron wf-btn-chevron--exit"
      aria-hidden="true"
    />
  </component>
</template>
