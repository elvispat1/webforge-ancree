<script setup lang="ts">
/* LinkAnchor — lien vers une ancre interne de la page courante (one-pager).
 *
 * Usage:
 *   <LinkAnchor href="#contact">Contact</LinkAnchor>
 */
defineProps<{
  href: string
}>()
</script>

<template>
  <a :href="href" class="wf-link"><slot /></a>
</template>
