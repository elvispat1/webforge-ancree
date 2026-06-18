<script setup lang="ts">
/* TurnstileWidget — widget anti-bot Cloudflare Turnstile, réutilisable par tout
 * formulaire. Charge le script Turnstile à la demande (render explicite) et émet
 * le jeton via @success. À envelopper dans <ClientOnly> (logique navigateur,
 * accède à window). Absent tant qu'aucune clé publique n'est configurée: c'est
 * l'appelant qui garde l'affichage par v-if sur la site key.
 */
const props = withDefaults(defineProps<{
  siteKey: string
  action?: string
}>(), {
  action: 'contact'
})

const emit = defineEmits<{
  success: [token: string]
  expired: []
  error: [message: string]
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
    script.onerror = () => reject(new Error('Échec du chargement Turnstile'))
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
    language: 'fr',
    callback: (token: string) => emit('success', token),
    'expired-callback': () => emit('expired'),
    'error-callback': (code: string) => {
      console.error('Turnstile error:', code)
      emit('error', 'La vérification a échoué. Veuillez rafraîchir la page.')
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
    emit('error', 'Impossible de charger la vérification anti-robot.')
  }
})

onBeforeUnmount(() => {
  if (widgetId !== undefined && window.turnstile) window.turnstile.remove(widgetId)
})
</script>

<template>
  <div ref="containerRef" />
</template>
