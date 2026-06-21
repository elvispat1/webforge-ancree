<script setup lang="ts">
/* TurnstileWidget, verification anti-bot Cloudflare Turnstile, reutilisable par
 * tout formulaire. Charge le script Turnstile a la demande (render explicite) et
 * emet le jeton via @success. A envelopper dans <ClientOnly> (logique navigateur,
 * accede a window). Plomberie portee de webforge-minimaliste; TERRAIN: dormant en
 * demo (l'appelant garde l'affichage par v-if sur la cle publique, vide en demo).
 *
 * Aucun texte d'interface en dur ici: le widget rend la boite Cloudflare et n'emet
 * que des evenements; l'appelant decide quoi montrer (sa banniere d'erreur de
 * contenu). La langue de la boite vient d'une prop (locale du site), pas codee. */
const props = withDefaults(defineProps<{
  siteKey: string
  action?: string
  /* Langue de la boite Cloudflare; passee par l'appelant depuis la locale i18n. */
  language?: string
}>(), {
  action: 'contact',
  language: 'fr'
})

const emit = defineEmits<{
  success: [token: string]
  expired: []
  error: []
}>()

const containerRef = ref<HTMLDivElement>()
let widgetId: string | undefined

function loadScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve()

  const w = window as unknown as { __turnstileLoadPromise__?: Promise<void> }
  if (w.__turnstileLoadPromise__) return w.__turnstileLoadPromise__

  const promise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    script.async = true
    script.onload = () => resolve()
    // Code interne (diagnostic), pas un texte affiche a l'usager.
    script.onerror = () => reject(new Error('turnstile-script-load-failed'))
    document.head.appendChild(script)
  })

  w.__turnstileLoadPromise__ = promise
  return promise
}

function renderWidget() {
  if (!containerRef.value || !window.turnstile) return
  if (widgetId !== undefined) window.turnstile.remove(widgetId)

  widgetId = window.turnstile.render(containerRef.value, {
    sitekey: props.siteKey,
    action: props.action,
    language: props.language,
    callback: (token: string) => emit('success', token),
    'expired-callback': () => emit('expired'),
    'error-callback': (code: string) => {
      // Diagnostic dev seulement; l'usager voit la banniere d'erreur du formulaire.
      console.error('Turnstile error:', code)
      emit('error')
    }
  })
}

function reset() {
  if (widgetId !== undefined && window.turnstile) window.turnstile.reset(widgetId)
}
defineExpose({ reset })

onMounted(async () => {
  try {
    await loadScript()
    renderWidget()
  } catch {
    emit('error')
  }
})

onBeforeUnmount(() => {
  if (widgetId !== undefined && window.turnstile) window.turnstile.remove(widgetId)
})
</script>

<template>
  <div ref="containerRef" class="turnstile" />
</template>

<style scoped>
/* La boite est rendue par Cloudflare (iframe a ses propres dimensions); on ne
 * controle que son calage dans le flux du formulaire. Posee, pas centree. */
.turnstile {
  display: flex;
  min-height: 6.5rem;
}
</style>
