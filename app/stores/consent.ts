/* Store consent — source de vérité de l'état de consentement aux témoins.
 *
 * Persiste le choix en localStorage (l'enregistrement du consentement est
 * strictement nécessaire, donc exempt de consentement — aucun cookie requis).
 * Décide si la bannière doit s'afficher (pas de choix, ou choix périmé), et
 * applique le consentement (point d'injection GA4, câblage réel reporté).
 *
 * Blocage dur: rien de mesure ne se charge tant que l'analytique n'a pas été
 * acceptée ET que l'enregistrement est valide. Donner et couper sont
 * symétriques: couper l'analytique en cours de session recharge la page
 * (GA4 ne se déchargeant pas proprement, il ne se réinjecte pas au reload).
 *
 * Port 1:1 de Minimaliste (plomberie produit, pas de la peau).
 */
import { CONSENT_CONFIG } from '~/content/consent'

/* Clé localStorage de l'enregistrement de consentement. */
const STORAGE_KEY = 'webforge:consent'

/* Validité de l'enregistrement: 6 mois (repère CNIL, prudent pour le Québec).
 * Passé ce délai, on retombe en « pas de consentement ». */
const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 30 * 6

export interface ConsentRecord {
  /* policyVersion de la config au moment du choix. */
  version: number
  /* Horodatage ISO du choix. */
  date: string
  /* Choix par catégorie opt-in. « Nécessaires » n'est jamais stocké (toujours vrai). */
  categories: Record<string, boolean>
}

export const useConsentStore = defineStore('consent', () => {
  /* Enregistrement courant, ou null si aucun. */
  const record = ref<ConsentRecord | null>(null)
  /* Vrai une fois l'hydratation client faite. Garde la bannière hors du rendu
   * serveur et du premier rendu client (site généré statiquement): pas de flash,
   * pas de mismatch d'hydratation. */
  const ready = ref(false)
  /* Réouverture manuelle depuis le pied de page, même si un choix valide existe. */
  const forceOpen = ref(false)

  /* Valide = existe + version courante + moins de 6 mois. Sinon → comme absent. */
  const isValid = computed(() => {
    if (!record.value) return false
    if (record.value.version !== CONSENT_CONFIG.policyVersion) return false
    const age = Date.now() - new Date(record.value.date).getTime()
    return Number.isFinite(age) && age >= 0 && age < MAX_AGE_MS
  })

  /* La bannière s'affiche après hydratation si aucun consentement valide, ou si
   * le visiteur a demandé à le revoir. */
  const bannerVisible = computed(() => ready.value && (!isValid.value || forceOpen.value))

  /* Consentement effectif d'une catégorie. « necessary » toujours vrai. Sans
   * enregistrement valide, on retombe sur le défaut de la config (opt-in = false). */
  function consented(id: string): boolean {
    if (id === 'necessary') return true
    if (isValid.value && record.value) return record.value.categories[id] ?? false
    const cat = CONSENT_CONFIG.categories.find((c) => c.id === id)
    return cat ? cat.default : false
  }

  /* Lecture localStorage. Client uniquement. Tolère un JSON corrompu. */
  function hydrate() {
    if (!import.meta.client) return
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      record.value = raw ? (JSON.parse(raw) as ConsentRecord) : null
    } catch {
      record.value = null
    }
    ready.value = true
  }

  /* Garde-fou anti double-injection (GA4 ne se charge qu'une fois par page). */
  let analyticsLoaded = false

  function loadAnalytics() {
    if (analyticsLoaded) return
    analyticsLoaded = true
    /* ───────────────────────────────────────────────────────────────────────
     * REPORTÉ — vrai déploiement: injecter ici le script GA4.
     * Esquisse (à brancher avec le vrai measurement id via runtimeConfig):
     *   const s = document.createElement('script')
     *   s.async = true
     *   s.src = `https://www.googletagmanager.com/gtag/js?id=${id}`
     *   document.head.appendChild(s)
     *   window.dataLayer = window.dataLayer || []
     *   function gtag(){ window.dataLayer.push(arguments) }
     *   gtag('js', new Date()); gtag('config', id)
     * Tester alors le blocage dur: aucun appel réseau de mesure avant ce point.
     * ─────────────────────────────────────────────────────────────────────── */
    if (import.meta.dev) {
      console.debug('[consent] analytique consentie — point d\'injection GA4 (reporté)')
    }
  }

  /* Applique le consentement courant. En V1, seul le hook analytique existe. */
  function applyConsent() {
    if (!import.meta.client) return
    if (consented('analytics')) loadAnalytics()
  }

  /* Écrit l'enregistrement et applique. Symétrie donner/couper: si l'analytique
   * passe de ON à OFF, on recharge; sinon on applique (injecte GA4 si ON). */
  function persist(categories: Record<string, boolean>) {
    const wasAnalytics = consented('analytics')
    record.value = {
      version: CONSENT_CONFIG.policyVersion,
      date: new Date().toISOString(),
      categories
    }
    forceOpen.value = false
    if (import.meta.client) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(record.value))
      } catch { /* stockage indisponible: l'état reste en mémoire pour la session */ }
    }
    const nowAnalytics = consented('analytics')
    if (import.meta.client && wasAnalytics && !nowAnalytics) {
      location.reload()
      return
    }
    applyConsent()
  }

  /* Construit l'objet categories pour « tout accepter » / « refuser » à partir
   * de la config (toutes les opt-in à `value`). */
  function allCategories(value: boolean): Record<string, boolean> {
    const out: Record<string, boolean> = {}
    for (const c of CONSENT_CONFIG.categories) out[c.id] = value
    return out
  }

  function acceptAll() { persist(allCategories(true)) }
  function refuse() { persist(allCategories(false)) }           // « Nécessaires seulement »
  function saveCustom(categories: Record<string, boolean>) { persist({ ...categories }) }

  /* Rouvre la bannière pour revoir le choix (lien pied de page). */
  function reopen() { forceOpen.value = true }

  return {
    record, ready, forceOpen,
    isValid, bannerVisible, consented,
    hydrate, applyConsent, acceptAll, refuse, saveCustom, reopen
  }
})
