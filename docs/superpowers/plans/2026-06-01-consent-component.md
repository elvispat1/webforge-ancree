# Composant de consentement aux témoins — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construire la bannière de consentement aux témoins maison de WebForge (catégories pilotées par config, blocage dur, accepter/refuser/personnaliser, persistance + versionnement), dans `apps/webforge-minimaliste-demo/`, le câblage GA4 réel reporté au premier vrai client.

**Architecture:** La décision de consentement vit dans un store Pinia (`stores/consent.ts`) qui lit/écrit `localStorage`, valide la fraîcheur (6 mois) et la version de politique, et expose un point d'injection analytique (stub GA4 reporté). Un plugin client (`plugins/consent.client.ts`) amorce le store très tôt pour le blocage dur. La config par-site (catégories + policyVersion) vit dans `content/consent.ts` via `useContent('consent')`; toute la copie passe par i18n (`consent.*`), surchargeable par props. L'UI est une carte fixe en bas à gauche, non bloquante (pas un `Modal`), avec une vue de base et un panneau « personnaliser » en place qui piège le focus de façon autonome. Les bascules sont un nouveau composant `Switch` (interrupteur pilule) bâti sur la case native, habillé par tokens de famille.

**Tech Stack:** Nuxt 4, Vue 3 `<script setup lang="ts">`, Pinia, `@nuxtjs/i18n`, Tailwind v4 + tokens CSS WebForge. Aucun test runner dans le repo: vérification par `nuxt prepare` (typegen), contrôle visuel dans le dev server déjà ouvert de Charles, et `yarn build` final (génération statique).

**Décisions tranchées par Charles (cadrage):**
- Focus du panneau « personnaliser »: **trap autonome dans la carte**, le `Modal` n'est pas touché.
- Home de la config consent: **source dédiée `app/content/consent.ts`** exposée par `useContent('consent')`.
- Copie: **i18n** (`consent.*`), ce qui élargit la règle « i18n minimal en V1 » du CLAUDE.md (à entériner, tâche 7).

**Disciplines à tenir (CLAUDE.md):** aucune valeur design en dur dans les composants (tout par tokens), aucun texte d'interface en dur (i18n), fichiers `.vue` script → template → style. Commits conventionnels, petits, atomiques. Ne jamais push sans validation explicite de Charles.

---

## Structure de fichiers

| Fichier | Responsabilité | Action |
| --- | --- | --- |
| `app/content/consent.ts` | Config par-site: `policyVersion` + liste de catégories opt-in. Types `ConsentCategory`/`ConsentConfig`. | Créer |
| `app/composables/useContent.ts` | Enregistrer la source `consent`. | Modifier |
| `i18n/locales/fr.json`, `i18n/locales/en.json` | Namespace `consent.*` (titre, body, libellés, catégories, mentions). | Modifier |
| `app/stores/consent.ts` | Spine: état `record`/`ready`/`forceOpen`, hydratation localStorage, validité (version + 6 mois), `consented()`, accept/refuse/saveCustom/reopen, `applyConsent()` + stub GA4. Type `ConsentRecord`. | Créer |
| `app/plugins/consent.client.ts` | Amorce le store tôt côté client (blocage dur). | Créer |
| `app/components/switch/index.vue` | Interrupteur pilule accessible sur case native. | Créer |
| `app/components/consent/index.vue` | La carte: vue de base + panneau personnaliser, trap autonome. | Créer |
| `app/assets/css/global.css` | Styles `.wf-switch*` et `.wf-consent*` (tokens uniquement). | Modifier |
| `app/layouts/default.vue`, `app/layouts/landing.vue` | Monter `<Consent>` avec le bon `policy-href`. | Modifier |
| `app/components/layout/Footer.vue` | Lien « Gérer les témoins » qui appelle `consent.reopen()`. | Modifier |
| `app/components/styleguide/atoms.vue` | Documenter le `Switch` au style guide. | Modifier |
| `CLAUDE.md` | Noter l'élargissement i18n (chrome produit générique). | Modifier |

---

## Task 1 : Config consent + source useContent

**Files:**
- Create: `app/content/consent.ts`
- Modify: `app/composables/useContent.ts`

- [ ] **Step 1 : Créer `app/content/consent.ts`**

```ts
// Config consent par site — quelles catégories de témoins existent sur CE site,
// et version de la politique. Distinct de la COPIE (générique, via i18n): ici
// c'est la structure propre au site, par-site, façon content/site.ts. En V2
// Sanity, useContent() remplacera la source; la shape reste.
//
// Principe CAI: ne lister que les catégories correspondant à une techno
// réellement installée (jamais de faux choix). Base WebForge vitrine =
// Nécessaires (implicite, toujours verrouillé) + Analytique (opt-in, éteint).

export interface ConsentCategory {
  /* Identifiant stable. Sert de clé de stockage ET de clé i18n
   * (consent.categories.<id>.label / .description). */
  id: string
  /* État par défaut d'une catégorie opt-in: toujours false côté conformité.
   * Explicité ici pour porter l'intention dans la config. */
  default: boolean
}

export interface ConsentConfig {
  /* Incrémenté dès que la liste de catégories change. Un enregistrement dont la
   * version diffère est traité comme périmé (la bannière se ré-affiche). */
  policyVersion: number
  categories: ConsentCategory[]
}

export const CONSENT_CONFIG: ConsentConfig = {
  policyVersion: 1,
  categories: [
    { id: 'analytics', default: false }
    // La catégorie « Nécessaires » est IMPLICITE: toujours verrouillée, jamais
    // stockée, jamais dans ce tableau. Pour ajouter une catégorie (ex:
    // { id: 'marketing', default: false }): l'ajouter ici, incrémenter
    // policyVersion, et ajouter les clés i18n consent.categories.marketing.*.
    // Le composant l'affiche sans aucune refonte.
  ]
}
```

- [ ] **Step 2 : Enregistrer la source dans `app/composables/useContent.ts`**

Remplacer le contenu actuel par (ajoute `consent` aux imports, au type et à `SOURCES`) :

```ts
// useContent — point d'accès unique au contenu **transverse** du site.
//
// Expose le contenu qui ne vit pas dans un bloc de page-builder:
//   - `site`    : brand, nav, footer, coordonnées (Header, Footer, Logo).
//   - `legal`   : pages légales (conditions, confidentialité), consommées par <LegalPage>.
//   - `consent` : config de consentement aux témoins (catégories + policyVersion),
//                 consommée par <Consent> et le store consent.
// Les contenus des blocs (Hero, About, etc.) ne passent plus par ici depuis
// l'introduction du page-builder typé.
//
// V1 (actuel) — retourne du contenu local depuis `app/content/*`.
// V2 (Sanity) — sera remplacé par une query Sanity au build, signature stable.

import { SITE_CONTENT, type SiteContent } from '~/content/site'
import { LEGAL_CONTENT, type LegalContent } from '~/content/legal'
import { CONSENT_CONFIG, type ConsentConfig } from '~/content/consent'

type ContentSources = {
  site: SiteContent
  legal: LegalContent
  consent: ConsentConfig
}

const SOURCES: ContentSources = {
  site: SITE_CONTENT,
  legal: LEGAL_CONTENT,
  consent: CONSENT_CONFIG
}

export function useContent<K extends keyof ContentSources>(key: K): ContentSources[K] {
  return SOURCES[key]
}
```

- [ ] **Step 3 : Régénérer les types et vérifier que rien ne casse**

Run: `cd apps/webforge-minimaliste-demo && yarn nuxt prepare`
Expected: termine sans erreur (`.nuxt` régénéré).

- [ ] **Step 4 : Commit**

```bash
git add apps/webforge-minimaliste-demo/app/content/consent.ts apps/webforge-minimaliste-demo/app/composables/useContent.ts
git commit -m "feat(minimaliste-demo): config consent + source useContent"
```

---

## Task 2 : Clés i18n du consentement

**Files:**
- Modify: `i18n/locales/fr.json`
- Modify: `i18n/locales/en.json`

- [ ] **Step 1 : Ajouter le namespace `consent` dans `i18n/locales/fr.json`**

Ajouter la clé `"consent"` au même niveau que `"a11y"` (ne pas toucher `a11y`) :

```json
{
  "a11y": {
    "skip_to_content": "Aller au contenu principal",
    "main_nav": "Navigation principale",
    "toggle_menu_open": "Ouvrir le menu",
    "toggle_menu_close": "Fermer le menu",
    "mobile_menu": "Menu de navigation"
  },
  "consent": {
    "aria_label": "Préférences de témoins",
    "title": "Témoins et confidentialité",
    "body": "Ce site utilise des témoins de mesure d’audience pour comprendre sa fréquentation. Vous pouvez tout accepter, garder les nécessaires seulement, ou choisir par catégorie.",
    "policy_prefix": "Détails dans notre",
    "policy_link": "politique de confidentialité",
    "accept_all": "Tout accepter",
    "necessary_only": "Nécessaires seulement",
    "customize": "Personnaliser",
    "back": "Retour",
    "save": "Enregistrer mes choix",
    "always_active": "Toujours actif",
    "manage": "Gérer les témoins",
    "categories": {
      "necessary": {
        "label": "Nécessaires",
        "description": "Requis au fonctionnement du site : sécurité du formulaire et mémorisation de votre choix de témoins."
      },
      "analytics": {
        "label": "Analytique",
        "description": "Mesure d’audience anonyme pour comprendre la fréquentation et améliorer le site."
      }
    }
  }
}
```

- [ ] **Step 2 : Ajouter le miroir anglais dans `i18n/locales/en.json`**

```json
{
  "a11y": {
    "skip_to_content": "Skip to main content",
    "main_nav": "Main navigation",
    "toggle_menu_open": "Open menu",
    "toggle_menu_close": "Close menu",
    "mobile_menu": "Navigation menu"
  },
  "consent": {
    "aria_label": "Cookie preferences",
    "title": "Cookies and privacy",
    "body": "This site uses analytics cookies to understand its traffic. You can accept all, keep only the necessary ones, or choose by category.",
    "policy_prefix": "Details in our",
    "policy_link": "privacy policy",
    "accept_all": "Accept all",
    "necessary_only": "Necessary only",
    "customize": "Customize",
    "back": "Back",
    "save": "Save my choices",
    "always_active": "Always active",
    "manage": "Manage cookies",
    "categories": {
      "necessary": {
        "label": "Necessary",
        "description": "Required for the site to work: form security and remembering your cookie choice."
      },
      "analytics": {
        "label": "Analytics",
        "description": "Anonymous audience measurement to understand traffic and improve the site."
      }
    }
  }
}
```

- [ ] **Step 3 : Commit**

```bash
git add apps/webforge-minimaliste-demo/i18n/locales/fr.json apps/webforge-minimaliste-demo/i18n/locales/en.json
git commit -m "feat(minimaliste-demo): clés i18n du consentement (fr + en)"
```

---

## Task 3 : Store consent + plugin de blocage dur

**Files:**
- Create: `app/stores/consent.ts`
- Create: `app/plugins/consent.client.ts`

- [ ] **Step 1 : Créer `app/stores/consent.ts`**

```ts
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
 * Vit dans l'app; migrera vers webforge-core avec le composant <Consent> quand
 * un 2e démo en aura besoin (discipline de remplissage des packages, CLAUDE.md).
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
     * REPORTÉ — premier vrai client WebForge: injecter ici le script GA4.
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
      console.debug('[consent] analytique consentie — point d’injection GA4 (reporté)')
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
```

- [ ] **Step 2 : Créer `app/plugins/consent.client.ts`**

```ts
/* Plugin consent — s'exécute tôt côté client. Lit l'enregistrement de
 * consentement et applique le blocage dur AVANT le rendu utile: rien de mesure
 * ne se charge tant que l'analytique n'a pas été consentie (et l'enregistrement
 * valide). La décision vit dans le store; le plugin l'amorce.
 *
 * Suffixe .client: jamais exécuté au build/SSR (localStorage n'existe pas côté
 * serveur). @pinia/nuxt enregistre Pinia avant les plugins applicatifs, donc le
 * store est résolvable ici.
 */
export default defineNuxtPlugin(() => {
  const consent = useConsentStore()
  consent.hydrate()
  consent.applyConsent()
})
```

- [ ] **Step 3 : Régénérer les types**

Run: `cd apps/webforge-minimaliste-demo && yarn nuxt prepare`
Expected: termine sans erreur.

- [ ] **Step 4 : Vérifier dans le dev server déjà ouvert de Charles**

Dans la console du navigateur (page d'accueil rechargée), à `localStorage` vide : aucun message GA4 (analytique non consentie). Puis dans la console : `localStorage.setItem('webforge:consent', JSON.stringify({version:1,date:new Date().toISOString(),categories:{analytics:true}}))` et recharger → le message `[consent] analytique consentie …` apparaît. Nettoyer ensuite : `localStorage.removeItem('webforge:consent')`.

- [ ] **Step 5 : Commit**

```bash
git add apps/webforge-minimaliste-demo/app/stores/consent.ts apps/webforge-minimaliste-demo/app/plugins/consent.client.ts
git commit -m "feat(minimaliste-demo): store consent + plugin de blocage dur"
```

---

## Task 4 : Composant Switch (interrupteur pilule)

**Files:**
- Create: `app/components/switch/index.vue`
- Modify: `app/assets/css/global.css` (ajout d'un bloc `.wf-switch*`)
- Modify: `app/components/styleguide/atoms.vue`

- [ ] **Step 1 : Créer `app/components/switch/index.vue`**

```vue
<script setup lang="ts">
/* Switch — interrupteur pilule accessible, bâti sur une case à cocher native.
 *
 * Présentationnel: la case <input type=checkbox role=switch> reste la vraie
 * commande (clavier, lecteurs d'écran); l'habillage pilule (piste + knob qui
 * glisse, crochet quand actif) est purement visuel, piloté par les tokens de
 * famille. Émet update:modelValue (v-model booléen).
 *
 * Verrouillé (`disabled`): rendu en état désactivé visible. Le consommateur
 * affiche alors sa propre mention à côté (ex: « Toujours actif »).
 *
 * Usage:
 *   <Switch v-model="on" :label="…" :description="…" />
 *   <Switch :model-value="true" disabled :label="…" :description="…" />
 */
const props = withDefaults(defineProps<{
  modelValue: boolean
  label: string
  description?: string
  disabled?: boolean
}>(), {
  description: '',
  disabled: false
})

const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

const uid = useId()
const id = `switch-${uid}`
const descId = `switch-desc-${uid}`
</script>

<template>
  <div class="wf-switch" :class="{ 'wf-switch--disabled': disabled }">
    <div class="wf-switch__text">
      <label :for="id" class="wf-switch__label">{{ label }}</label>
      <p v-if="description" :id="descId" class="wf-switch__desc">{{ description }}</p>
    </div>
    <input
      :id="id"
      type="checkbox"
      role="switch"
      class="wf-switch__input"
      :checked="modelValue"
      :disabled="disabled"
      :aria-describedby="description ? descId : undefined"
      @change="emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
    >
  </div>
</template>
```

- [ ] **Step 2 : Ajouter les styles `.wf-switch*` dans `app/assets/css/global.css`**

Insérer ce bloc juste APRÈS la règle de la case à cocher (après `.wf-err::before { … }`, autour de la ligne 1130, avant `.wf-form-banner`). Le crochet réutilise le data-URI sans couleur de la case à cocher (la couleur vient de `background-color`, la forme du `mask`). Aucune gestion `prefers-reduced-motion` ici: le reset global en fin de fichier neutralise déjà toutes les transitions.

```css
/* ── Interrupteur pilule (composant <Switch>) ─────────────────────────────── */
.wf-switch {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: calc(var(--spacing-unit) * 2);
  min-height: 4.4rem; /* cible tactile (la rangée entière est cliquable via le label) */
}
.wf-switch__text { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.wf-switch__label {
  font-family: var(--font-display);
  font-size: 1.6rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--text-base);
  cursor: pointer;
}
.wf-switch__desc {
  margin: 0;
  font-size: 1.4rem;
  line-height: 1.45;
  color: var(--text-muted);
}

/* Piste */
.wf-switch__input {
  appearance: none;
  -webkit-appearance: none;
  position: relative;
  flex-shrink: 0;
  width: 4.6rem;
  height: 2.6rem;
  border-radius: 1.3rem;
  background: color-mix(in oklch, var(--text-base) 22%, transparent);
  border: 1px solid color-mix(in oklch, var(--text-base) 22%, transparent);
  cursor: pointer;
  transition: background-color 180ms ease, border-color 180ms ease;
}
/* Knob (glisse de gauche à droite) */
.wf-switch__input::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 0.3rem;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: var(--white);
  transform: translateY(-50%);
  transition: transform 200ms cubic-bezier(0.22, 1, 0.36, 1);
}
/* Crochet dans le knob, révélé quand actif. Forme via mask (le data-URI ne porte
 * aucune couleur), couleur via background-color = accent-1. Suit le knob. */
.wf-switch__input::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 0.3rem;
  width: 2rem;
  height: 2rem;
  transform: translateY(-50%);
  background-color: var(--accent-1);
  -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M3.5 8.5 L6.5 11.5 L12.5 5' fill='none' stroke='%23000' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") center / 1.1rem no-repeat;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M3.5 8.5 L6.5 11.5 L12.5 5' fill='none' stroke='%23000' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") center / 1.1rem no-repeat;
  opacity: 0;
  transition: transform 200ms cubic-bezier(0.22, 1, 0.36, 1), opacity 140ms ease;
}
.wf-switch__input:checked {
  background: var(--accent-1);
  border-color: var(--accent-1);
}
.wf-switch__input:checked::before { transform: translate(2rem, -50%); }
.wf-switch__input:checked::after { transform: translate(2rem, -50%); opacity: 1; }
.wf-switch__input:focus-visible {
  outline: 2px solid var(--accent-1);
  outline-offset: 2px;
}
.wf-switch--disabled .wf-switch__input { cursor: not-allowed; opacity: 0.85; }
.wf-switch--disabled .wf-switch__label { cursor: default; }
```

- [ ] **Step 3 : Documenter le `Switch` au style guide dans `app/components/styleguide/atoms.vue`**

Dans le `<script setup>`, ajouter l'import sous `import LinkInternal …` :

```ts
import Switch from '~/components/switch/index.vue'
```

Ajouter l'état local pour la démo (juste après `const systemIcons = […]`) :

```ts
const switchDemo = ref(true)
```

Dans le `<template>`, ajouter ce groupe juste avant le commentaire `<!-- Link -->` :

```vue
    <!-- Switch -->
    <div class="sg-atoms-group">
      <h3 class="wf-h4 sg-atoms-group__title">Switch</h3>
      <p class="wf-body-3 sg-atoms-group__note">components/switch/index.vue — interrupteur pilule bâti sur une case native (input type=checkbox role=switch). Le knob glisse, un crochet apparaît à l'état actif. Habillé par les tokens de famille. État verrouillé (disabled) rendu visible: le consommateur affiche sa propre mention à côté (ex: « Toujours actif » sur la catégorie Nécessaires de la bannière de consentement).</p>

      <div class="sg-row">
        <div class="sg-row__sample">
          <Switch v-model="switchDemo" label="Analytique" description="Mesure d'audience anonyme." />
        </div>
        <div class="sg-row__meta">
          <pre class="sg-css">&lt;Switch
  v-model="on"
  :label="…"
  :description="…"
/&gt;</pre>
          <p class="wf-body-3 sg-row__usage">Interactif. v-model booléen. Piste accent-1 + crochet à l'état actif.</p>
        </div>
      </div>

      <div class="sg-row">
        <div class="sg-row__sample">
          <Switch :model-value="true" disabled label="Nécessaires" description="Requis au fonctionnement du site." />
        </div>
        <div class="sg-row__meta">
          <pre class="sg-css">&lt;Switch
  :model-value="true"
  disabled
  :label="…"
/&gt;</pre>
          <p class="wf-body-3 sg-row__usage">Verrouillé. État activé désactivé visible. La mention « Toujours actif » est rendue par le consommateur, pas par le Switch.</p>
        </div>
      </div>
    </div>
```

- [ ] **Step 4 : Régénérer les types et vérifier visuellement**

Run: `cd apps/webforge-minimaliste-demo && yarn nuxt prepare`
Expected: sans erreur. Dans le dev server de Charles, ouvrir `/dev/styleguide`, onglet composants atomiques : le `Switch` interactif bascule (knob glisse, crochet vert apparaît), le verrouillé est visiblement désactivé. Tester le focus clavier (Tab → contour accent), `prefers-reduced-motion` (bascule instantanée).

- [ ] **Step 5 : Commit**

```bash
git add apps/webforge-minimaliste-demo/app/components/switch/index.vue apps/webforge-minimaliste-demo/app/assets/css/global.css apps/webforge-minimaliste-demo/app/components/styleguide/atoms.vue
git commit -m "feat(minimaliste-demo): composant Switch (interrupteur pilule)"
```

---

## Task 5 : Composant Consent (la carte)

**Files:**
- Create: `app/components/consent/index.vue`
- Modify: `app/assets/css/global.css` (ajout d'un bloc `.wf-consent*`)

- [ ] **Step 1 : Créer `app/components/consent/index.vue`**

```vue
<script setup lang="ts">
/* Consent — bannière de consentement aux témoins WebForge.
 *
 * Carte fixe en bas à gauche, NON bloquante (ce n'est pas un <Modal>: elle ne
 * vole pas, ne piège pas le focus, ne rend pas la page inerte; rien de mesure ne
 * se charge de toute façon avant le oui). Deux vues dans la même carte:
 *   - base       : titre, explication + lien politique, 3 actions de poids égal
 *                  (Tout accepter / Nécessaires seulement / Personnaliser).
 *   - customize   : bascules par catégorie + Enregistrer, avec un bouton Retour.
 * Le panneau customize piège le focus clavier de façon autonome (Tab cycle dans
 * le panneau); Retour rend le focus au déclencheur. La carte de base, elle,
 * reste atteignable au clavier sans piéger.
 *
 * Catégories pilotées par la config (useContent('consent')): « Nécessaires »
 * implicite et verrouillé en tête, puis les opt-in de la config. Toute la copie
 * vient d'i18n (consent.*), surchargeable string par string via la prop
 * `overrides` (clé = chemin sous consent., ex: 'title' ou 'categories.analytics.label').
 *
 * Monté dans les coquilles de site (layouts default + landing), pas sous /dev.
 * Se téléporte dans <body>. Migrera vers webforge-core avec le store quand un 2e
 * démo en aura besoin.
 */
const props = withDefaults(defineProps<{
  /* Cible du lien « politique de confidentialité ». Qualifiée par le layout
   * (landing: sous /one-pager). */
  policyHref?: string
  /* Surcharge optionnelle de n'importe quelle chaîne. Clé = chemin sous
   * `consent.` dans i18n (ex: 'title', 'categories.analytics.description'). */
  overrides?: Record<string, string>
}>(), {
  policyHref: '/politique-confidentialite',
  overrides: () => ({})
}) 

const consent = useConsentStore()
const config = useContent('consent')
const { t } = useI18n()

/* Résolution de copie: surcharge de prop d'abord, sinon i18n. */
function copy(key: string): string {
  return props.overrides[key] ?? t(`consent.${key}`)
}

/* Vue courante de la carte. */
const view = ref<'main' | 'customize'>('main')

/* Brouillon des bascules opt-in, initialisé depuis l'état courant à l'ouverture
 * du panneau. « Nécessaires » n'y est pas (toujours vrai, verrouillé). */
const draft = reactive<Record<string, boolean>>({})
function initDraft() {
  for (const c of config.categories) draft[c.id] = consent.consented(c.id)
}

/* Rouvrir la bannière (via le pied de page) repart toujours de la vue de base. */
watch(() => consent.bannerVisible, (visible) => {
  if (visible) view.value = 'main'
})

/* ── Navigation interne + trap de focus autonome (customize uniquement) ─────── */
const panel = ref<HTMLElement | null>(null)
const back = ref<HTMLElement | null>(null)
let returnFocusEl: HTMLElement | null = null

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(',')

function focusables(): HTMLElement[] {
  if (!panel.value) return []
  return Array.from(panel.value.querySelectorAll<HTMLElement>(FOCUSABLE))
    .filter((el) => el.offsetParent !== null)
}

function onPanelKeydown(e: KeyboardEvent) {
  if (e.key !== 'Tab') return
  const items = focusables()
  if (items.length === 0) return
  const first = items[0]!
  const last = items[items.length - 1]!
  const active = document.activeElement
  if (e.shiftKey && active === first) {
    e.preventDefault()
    last.focus()
  } else if (!e.shiftKey && active === last) {
    e.preventDefault()
    first.focus()
  }
}

function openCustomize(e: MouseEvent) {
  returnFocusEl = e.currentTarget as HTMLElement
  initDraft()
  view.value = 'customize'
  nextTick(() => back.value?.focus())
}

function closeCustomize() {
  view.value = 'main'
  nextTick(() => returnFocusEl?.focus())
}

/* ── Actions ────────────────────────────────────────────────────────────────
 * Après un choix, le store devient valide → bannerVisible passe à false → la
 * carte disparaît (sauf reload symétrique déclenché par le store). */
function onAcceptAll() { consent.acceptAll() }
function onRefuse() { consent.refuse() }
function onSaveCustom() { consent.saveCustom({ ...draft }) }
</script>

<template>
  <Teleport to="body">
    <Transition name="wf-consent">
      <section
        v-if="consent.bannerVisible"
        class="wf-consent"
        :aria-label="copy('aria_label')"
        @keydown="view === 'customize' && onPanelKeydown($event)"
      >
        <!-- Vue de base -->
        <div v-if="view === 'main'" class="wf-consent__view">
          <h2 class="wf-consent__title">{{ copy('title') }}</h2>
          <p class="wf-consent__body">{{ copy('body') }}</p>
          <p class="wf-consent__policy">
            {{ copy('policy_prefix') }}
            <NuxtLink :to="policyHref" class="wf-link">{{ copy('policy_link') }}</NuxtLink>
          </p>
          <div class="wf-consent__actions">
            <Button :icon="false" @click="onAcceptAll">{{ copy('accept_all') }}</Button>
            <Button :icon="false" variant="ghost" @click="onRefuse">{{ copy('necessary_only') }}</Button>
            <Button :icon="false" variant="ghost" @click="openCustomize">{{ copy('customize') }}</Button>
          </div>
        </div>

        <!-- Vue personnaliser (même carte, navigation interne) -->
        <div v-else ref="panel" class="wf-consent__view">
          <button ref="back" type="button" class="wf-consent__back" @click="closeCustomize">
            <Icon name="lucide:arrow-left" aria-hidden="true" />
            <span>{{ copy('back') }}</span>
          </button>

          <ul class="wf-consent__cats">
            <!-- Nécessaires: implicite, verrouillé, mention « Toujours actif ». -->
            <li class="wf-consent__cat">
              <Switch
                :model-value="true"
                disabled
                :label="copy('categories.necessary.label')"
                :description="copy('categories.necessary.description')"
              />
              <span class="wf-consent__always">{{ copy('always_active') }}</span>
            </li>
            <!-- Catégories opt-in de la config. -->
            <li v-for="c in config.categories" :key="c.id" class="wf-consent__cat">
              <Switch
                v-model="draft[c.id]"
                :label="copy(`categories.${c.id}.label`)"
                :description="copy(`categories.${c.id}.description`)"
              />
            </li>
          </ul>

          <Button :icon="false" class="wf-consent__save" @click="onSaveCustom">{{ copy('save') }}</Button>
        </div>
      </section>
    </Transition>
  </Teleport>
</template>
```

- [ ] **Step 2 : Ajouter les styles `.wf-consent*` dans `app/assets/css/global.css`**

Insérer ce bloc juste AVANT le bloc `OVERLAY / MODAL` (autour de la ligne 1436). z-index 90 inline, dans l'échelle du système (header 50, floater 60, skip-link 100, overlays 200). Pas de `prefers-reduced-motion` ici: le reset global en fin de fichier neutralise la transition d'entrée.

```css
/* ────────────────────────────────────────────────────────────────────────
   CONSENT  (bannière de consentement aux témoins, cf. components/consent/index.vue)
   Carte fixe non bloquante en bas à gauche. Deux vues (base / personnaliser)
   dans la même carte.
   ──────────────────────────────────────────────────────────────────────── */
.wf-consent {
  position: fixed;
  left: calc(var(--spacing-unit) * 2);
  bottom: calc(var(--spacing-unit) * 2);
  z-index: 90; /* au-dessus du header (50) et du floater (60), sous le skip-link (100) et les overlays (200) */
  width: min(38rem, calc(100vw - var(--spacing-unit) * 4));
  max-height: calc(100dvh - var(--spacing-unit) * 4);
  overflow-y: auto;
  background: var(--bg-base);
  border: var(--line-soft);
  border-radius: var(--radius);
  box-shadow: 0 1.5rem 4rem -1.5rem color-mix(in oklch, var(--black) 35%, transparent);
  padding: calc(var(--spacing-unit) * 3);
}
.wf-consent__view { display: flex; flex-direction: column; }
.wf-consent__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.8rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--text-base);
}
.wf-consent__body {
  margin: calc(var(--spacing-unit) * 1.5) 0 0;
  font-size: 1.5rem;
  line-height: 1.5;
  color: var(--text-muted);
}
.wf-consent__policy {
  margin: calc(var(--spacing-unit) * 1) 0 0;
  font-size: 1.5rem;
  line-height: 1.5;
  color: var(--text-muted);
}
.wf-consent__actions {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing-unit) * 1.5);
  margin-top: calc(var(--spacing-unit) * 3);
}
.wf-consent__actions .wf-btn { width: 100%; justify-content: center; }

/* Vue personnaliser */
.wf-consent__back {
  display: inline-flex;
  align-items: center;
  gap: 0.5em;
  align-self: flex-start;
  margin-bottom: calc(var(--spacing-unit) * 1);
  font-family: var(--font-display);
  font-size: 1.4rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--text-muted);
  transition: color 150ms ease;
}
.wf-consent__back:hover { color: var(--accent-1); }
.wf-consent__cats { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; }
.wf-consent__cat { padding-block: calc(var(--spacing-unit) * 2); border-top: var(--line-hair); }
.wf-consent__cat:last-of-type { border-bottom: var(--line-hair); }
.wf-consent__always {
  display: block;
  margin-top: calc(var(--spacing-unit) * 1);
  font-family: var(--font-display);
  font-size: 1.2rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--accent-1);
}
.wf-consent__save { margin-top: calc(var(--spacing-unit) * 3); width: 100%; justify-content: center; }

/* Entrée: glisse depuis le bas + fondu. Neutralisée par le reset
 * prefers-reduced-motion plus bas. */
.wf-consent-enter-active,
.wf-consent-leave-active {
  transition: opacity 280ms ease, transform 280ms cubic-bezier(0.22, 1, 0.36, 1);
}
.wf-consent-enter-from,
.wf-consent-leave-to {
  opacity: 0;
  transform: translateY(1rem);
}
```

- [ ] **Step 3 : Régénérer les types**

Run: `cd apps/webforge-minimaliste-demo && yarn nuxt prepare`
Expected: sans erreur.

- [ ] **Step 4 : Commit**

```bash
git add apps/webforge-minimaliste-demo/app/components/consent/index.vue apps/webforge-minimaliste-demo/app/assets/css/global.css
git commit -m "feat(minimaliste-demo): bannière de consentement aux témoins"
```

---

## Task 6 : Montage dans les coquilles + lien « Gérer les témoins »

**Files:**
- Modify: `app/layouts/default.vue`
- Modify: `app/layouts/landing.vue`
- Modify: `app/components/layout/Footer.vue`

- [ ] **Step 1 : Monter `<Consent>` dans `app/layouts/default.vue`**

Ajouter `<Consent />` juste après `<Footer />`, dans le `.wf-site`. La cible du lien politique en mode multipage est la route plate :

```vue
<template>
  <div class="wf-site">
    <a :href="'#main'" class="wf-skip">{{ t('a11y.skip_to_content') }}</a>
    <Header mode="multipage" />
    <main id="main">
      <slot />
    </main>
    <Footer />
    <Consent policy-href="/politique-confidentialite" />
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
</script>
```

- [ ] **Step 2 : Monter `<Consent>` dans `app/layouts/landing.vue`**

En mode landing, les pages légales vivent sous `home` (`/one-pager`). Passer la cible qualifiée :

```vue
<template>
  <div class="wf-site">
    <a :href="'#main'" class="wf-skip">{{ t('a11y.skip_to_content') }}</a>
    <Header mode="landing" :home="home" />
    <main id="main">
      <slot />
    </main>
    <Footer mode="landing" :home="home" />
    <Consent :policy-href="`${home}/politique-confidentialite`" />
  </div>
</template>

<script setup lang="ts">
/* Coquille du site one-pager, qui vit sous /one-pager (accueil + pages légales).
 * On qualifie la nav, le logo et les liens de pied de page par cette racine pour
 * qu'ils fonctionnent depuis n'importe quelle page du sous-arbre, pas seulement
 * l'accueil: depuis une page légale, « À propos » ramène vers /one-pager#about. */
const { t } = useI18n()
const home = '/one-pager'
</script>
```

- [ ] **Step 3 : Ajouter le lien « Gérer les témoins » dans `app/components/layout/Footer.vue`**

Dans le `<script setup>`, ajouter le store et i18n (après `const site = useContent('site')`) :

```ts
const consent = useConsentStore()
const { t } = useI18n()
```

Dans le template, ajouter le bouton à la fin de la rangée `.wf-footer-legal`, après la boucle des `pageLinks` (le bouton hérite `.wf-link`; il rouvre la carte) :

```vue
      <p class="wf-footer-legal">
        <NuxtLink
          v-for="link in site.footer.pageLinks"
          :key="link.href"
          :to="mode === 'landing' ? home + link.href : link.href"
          class="wf-link"
        >{{ link.label }}</NuxtLink>
        <button type="button" class="wf-link wf-footer-consent" @click="consent.reopen()">{{ t('consent.manage') }}</button>
      </p>
```

- [ ] **Step 4 : Ajouter le style d'alignement du bouton dans `app/assets/css/global.css`**

Le `<button>` doit s'aligner sur les liens légaux voisins (qui sont des `NuxtLink` inline). Le reset global `button {}` couvre déjà font/couleur/fond/bordure/padding/cursor; il reste à garantir l'alignement vertical inline. Ajouter cette règle juste après `.wf-footer-legal` dans la section FOOTER de `global.css` (rechercher `.wf-footer-legal` pour la localiser) :

```css
.wf-footer-consent { vertical-align: baseline; }
```

- [ ] **Step 5 : Régénérer les types et vérifier de bout en bout**

Run: `cd apps/webforge-minimaliste-demo && yarn nuxt prepare`
Expected: sans erreur.

Dans le dev server de Charles, `localStorage` vide, recharger l'accueil multipage (`/`) :
1. La carte apparaît en bas à gauche (glisse + fondu), non bloquante (le site défile derrière, le focus n'est pas piégé).
2. « Personnaliser » → la même carte montre les bascules; Nécessaires verrouillé + « Toujours actif »; Tab cycle dans le panneau; « Retour » ramène le focus sur « Personnaliser ».
3. « Tout accepter » / « Nécessaires seulement » → la carte disparaît, `localStorage['webforge:consent']` contient le bon enregistrement (version 1, date ISO, `categories.analytics` true/false).
4. Pied de page « Gérer les témoins » → la carte réapparaît, vue de base.
5. Accepter analytique, rouvrir, basculer analytique OFF, Enregistrer → la page recharge (coupure symétrique).
6. Tester la même séquence sur le one-pager (`/one-pager`) : le lien politique pointe vers `/one-pager/politique-confidentialite`.

Nettoyer : `localStorage.removeItem('webforge:consent')`.

- [ ] **Step 6 : Commit**

```bash
git add apps/webforge-minimaliste-demo/app/layouts/default.vue apps/webforge-minimaliste-demo/app/layouts/landing.vue apps/webforge-minimaliste-demo/app/components/layout/Footer.vue apps/webforge-minimaliste-demo/app/assets/css/global.css
git commit -m "feat(minimaliste-demo): monter la bannière consent + lien Gérer les témoins"
```

---

## Task 7 : Mettre à jour CLAUDE.md (élargissement i18n)

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1 : Préciser la discipline 2 dans `CLAUDE.md`**

Dans la section « Les trois disciplines de code », point 2, remplacer la phrase sur le périmètre i18n V1 pour acter que le chrome produit générique (réutilisable, futur `webforge-core`) passe désormais aussi par i18n. Texte de remplacement du point 2 :

```markdown
**2. Aucun texte d'interface affiché en dur** (Nuxt i18n). En V1, i18n couvre deux familles de strings: (a) les strings d'accessibilité universelles (skip link, aria-labels, landmarks), et (b) le **chrome produit générique** réutilisable d'un site à l'autre, écrit une fois et destiné à `webforge-core` (ex: la bannière de consentement aux témoins, `consent.*`). Le contenu propre au site (textes d'Atelier Cormier) reste géré par la discipline 3, pas par i18n.
```

- [ ] **Step 2 : Vérification finale — build de génération statique**

Run: `cd apps/webforge-minimaliste-demo && yarn build`
Expected: build Nuxt réussi (compile composants, store, plugin, i18n sans erreur). Confirme que la génération statique Cloudflare Pages passe.

- [ ] **Step 3 : Commit**

```bash
git add CLAUDE.md
git commit -m "docs: acter l'élargissement i18n au chrome produit générique"
```

---

## Couverture du brief (auto-revue)

| Exigence du brief | Tâche |
| --- | --- |
| §1 Catégories pilotées par config, N sans refonte, Nécessaires implicite verrouillé | T1 (config), T5 (rendu) |
| §2 État par défaut éteint + blocage dur (plugin client tôt, GA4 conditionnel) | T3 (store `applyConsent`/`loadAnalytics`, plugin) |
| §3 Trois surfaces (arrivée bas-gauche / personnaliser en place / retour via pied de page), pas de X | T5 (vues), T6 (montage + lien footer) |
| §4 Persistance localStorage, forme d'enregistrement, validité 6 mois, versionnement, coupure symétrique = reload | T3 (`hydrate`/`isValid`/`persist`) |
| §5 Copie i18n générique + props de surcharge + lien vers politique de confidentialité | T2 (clés), T5 (`copy()`/`overrides`/`policyHref`) |
| §6 Bascules pilule sur case native, Nécessaires désactivé visible, cibles ≥44px, reduced-motion, focus base non piégé / panneau piégé | T4 (Switch), T5 (trap autonome, `.wf-consent`) |
| §7 Tokens uniquement, i18n uniquement, bâti dans le démo (pas de package) | toutes |
| §8 Réemploi Button / Checkbox (base du Switch) / Footer | T4, T5, T6 |
| Reporté: câblage GA4 réel + test du blocage dur | stub balisé dans T3 (`loadAnalytics`) |

**Note de portée:** le `Modal` n'est pas réutilisé (carte non bloquante + trap autonome, décision tranchée). La logique complète est posée; seul le `loadAnalytics()` reste un stub balisé jusqu'au premier vrai client.
```
