<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <a class="wf-skip" href="#main">{{ t('a11y.skip_to_content') }}</a>
  <main id="main">
    <slot />
  </main>
</template>
