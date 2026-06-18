<script setup lang="ts">
/* LinkInternal — wrapper léger autour de <NuxtLink> pour les liens vers des
 * routes internes du site. Aucun styling, juste le routing.
 *
 * Usage:
 *   <LinkInternal to="/services">Voir les services</LinkInternal>
 *
 * Pour un lien stylé bouton, utiliser <Button href="/services" kind="internal">
 * qui rend déjà le bon élément en interne.
 */
defineProps<{
  to: string
}>()
</script>

<template>
  <NuxtLink :to="to" class="wf-link"><slot /></NuxtLink>
</template>
