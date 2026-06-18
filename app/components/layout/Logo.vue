<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    size?: number
    href?: string
  }>(),
  {
    size: 22,
    href: '#top'
  }
)

const site = useContent('site')

/* Le logo est un lien de route (NuxtLink) sauf quand href est une ancre (#...),
 * où un <a> natif gère le scroll d'ancre. Landing: route /one-pager#top;
 * multipage: route / (accueil). */
const isAnchor = computed(() => props.href.startsWith('#'))
/* `<component :is="'NuxtLink'">` (chaîne) ne se résout pas en composant et rend un
 * élément <nuxtlink> inerte. On passe le composant résolu. */
const NuxtLink = resolveComponent('NuxtLink')
</script>

<template>
  <component
    :is="isAnchor ? 'a' : NuxtLink"
    v-bind="isAnchor ? { href } : { to: href }"
    class="wf-logo"
    :aria-label="site.brand.homeAriaLabel"
  >
    <!-- Logo = lockup complet (icône + nom gravés dans un seul SVG, brand.logo
         Sanity). Rendu à la hauteur `size` (px), largeur auto pour préserver le
         ratio du lockup. Chargement eager: le logo vit dans le header de chaque
         page. Décoratif (alt vide): le lien porte homeAriaLabel. Sans src, repli
         texte = le nom porte seul la marque. -->
    <img
      v-if="site.brand.logo.src"
      class="wf-logo-img"
      :src="site.brand.logo.src"
      alt=""
      :style="{ height: `${size}px` }"
      loading="eager"
    >
    <span v-else class="wf-logo-wm">{{ site.brand.name }}</span>
  </component>
</template>
