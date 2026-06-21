/* Typage du global `window.turnstile` injecte par le script Cloudflare Turnstile
 * (charge a la demande par TurnstileWidget, render explicite). Le widget anti-bot
 * est TERRAIN: dormant en demo (aucune cle publique posee -> jamais rendu), actif
 * sur un vrai site client qui configure NUXT_PUBLIC_TURNSTILE_SITE_KEY. */
interface TurnstileRenderOptions {
  sitekey: string
  action?: string
  language?: string
  theme?: 'light' | 'dark' | 'auto'
  callback?: (token: string) => void
  'expired-callback'?: () => void
  'error-callback'?: (errorCode: string) => void
}

interface TurnstileInstance {
  render: (container: HTMLElement, options: TurnstileRenderOptions) => string
  reset: (widgetId: string) => void
  remove: (widgetId: string) => void
}

declare global {
  interface Window {
    turnstile: TurnstileInstance
  }
}

export {}
