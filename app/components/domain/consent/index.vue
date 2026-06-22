<script setup lang="ts">
/* Consent — bannière de consentement aux témoins, peau Ancrée.
 *
 * Carte fixe en bas à gauche, NON bloquante (ce n'est pas une modale: elle ne
 * vole pas le focus au chargement, ne piège pas la page, ne la rend pas inerte;
 * rien de mesure ne se charge de toute façon avant le oui). Deux vues dans la
 * même carte:
 *   - main      : titre, explication + lien politique, 3 actions de poids égal
 *                 (Tout accepter / Nécessaires seulement / Personnaliser).
 *   - customize : cases par catégorie + Enregistrer, avec un bouton Retour.
 * Le panneau customize piège le focus clavier de façon autonome (Tab cycle dans
 * le panneau); Retour rend le focus au déclencheur. La carte de base reste
 * atteignable au clavier sans piéger.
 *
 * La plomberie (store, plugin, config) est portée 1:1 de Minimaliste; SEULE la
 * peau (markup ancré, tokens Ancrée, case à cocher au lieu d'un switch) est
 * propre à Ancrée. Catégories pilotées par la config (useContent('consent')):
 * « Nécessaires » implicite et verrouillé en tête, puis les opt-in. Toute la
 * copie vient d'i18n (consent.*), surchargeable string par string via `overrides`.
 *
 * Montée dans les coquilles de site (layouts default + landing), pas sous
 * /showcase. Se téléporte dans <body>.
 */
const props = withDefaults(defineProps<{
  /* Cible du lien « politique de confidentialité ». Qualifiée par le layout
   * (landing: sous /one-pager). */
  policyHref?: string
  /* Surcharge optionnelle de n'importe quelle chaîne. Clé = chemin sous
   * `consent.` dans i18n (ex: 'title', 'categories.analytics.label'). */
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

/* Rendu différé au mount client. Le plugin consent (.client) amorce le store
 * AVANT l'hydratation, donc `bannerVisible` peut déjà être vrai quand Vue hydrate:
 * rendre la carte à ce stade créerait un mismatch d'hydratation (serveur = rien,
 * client = la carte) sur le site généré statiquement. On attend donc le mount. */
const mounted = ref(false)
onMounted(() => { mounted.value = true })

/* Brouillon des bascules opt-in, initialisé depuis l'état courant à l'ouverture
 * du panneau. « Nécessaires » n'y est pas (toujours vrai, verrouillé). */
const draft = reactive<Record<string, boolean>>({})
function initDraft() {
  for (const c of config.value.categories) draft[c.id] = consent.consented(c.id)
}

/* Rouvrir la bannière repart toujours de la vue de base. Réouverture explicite
 * (forceOpen): on déplace le focus sur la carte (tabindex=-1) pour l'annoncer au
 * lecteur d'écran. Au premier affichage (forceOpen faux), on ne vole JAMAIS le
 * focus au chargement. */
const card = ref<HTMLElement | null>(null)
watch(() => consent.bannerVisible, (visible) => {
  if (!visible) return
  view.value = 'main'
  if (consent.forceOpen) nextTick(() => card.value?.focus())
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
    <Transition name="consent">
      <section
        v-if="mounted && consent.bannerVisible"
        ref="card"
        class="consent"
        :aria-label="copy('aria_label')"
        tabindex="-1"
        @keydown="view === 'customize' && onPanelKeydown($event)"
      >
        <!-- Vue de base -->
        <div v-if="view === 'main'" class="consent__view">
          <h2 class="consent__title wf-h5">{{ copy('title') }}</h2>
          <p class="consent__body wf-body-2">{{ copy('body') }}</p>
          <p class="consent__policy wf-body-2">
            {{ copy('policy_prefix') }}
            <NuxtLink :to="policyHref" class="consent__link">{{ copy('policy_link') }}</NuxtLink>
          </p>
          <div class="consent__actions">
            <Button :icon="false" @click="onAcceptAll">{{ copy('accept_all') }}</Button>
            <Button :icon="false" variant="ghost" @click="onRefuse">{{ copy('necessary_only') }}</Button>
            <Button :icon="false" variant="ghost" @click="openCustomize">{{ copy('customize') }}</Button>
          </div>
        </div>

        <!-- Vue personnaliser (même carte, navigation interne) -->
        <div v-else ref="panel" class="consent__view">
          <button ref="back" type="button" class="consent__back" @click="closeCustomize">
            <Icon name="lucide:chevron-left" aria-hidden="true" />
            <span>{{ copy('back') }}</span>
          </button>

          <ul class="consent__cats">
            <!-- Nécessaires: catégorie requise, pas de bascule — juste la mention « Requis ». -->
            <li class="consent__cat consent__cat--required">
              <span class="consent__cat-label">{{ copy('categories.necessary.label') }}</span>
              <span class="consent__required">{{ copy('required') }}</span>
            </li>
            <!-- Catégories opt-in: libellé + case. Les descriptions détaillées
                 vivent dans la politique de confidentialité (panneau sobre). -->
            <li v-for="c in config.categories" :key="c.id" class="consent__cat">
              <Checkbox
                :model-value="draft[c.id] ?? false"
                @update:model-value="draft[c.id] = $event"
              >
                {{ copy(`categories.${c.id}.label`) }}
              </Checkbox>
            </li>
          </ul>

          <Button :icon="false" class="consent__save" @click="onSaveCustom">{{ copy('save') }}</Button>
        </div>
      </section>
    </Transition>
  </Teleport>
</template>

<style scoped>
.consent {
  position: fixed;
  bottom: clamp(1.2rem, 3vw, 2.4rem);
  left: clamp(1.2rem, 3vw, 2.4rem);
  z-index: 70;
  width: min(38rem, calc(100vw - 2.4rem));
  padding: 2.4rem;
  background: var(--bg-base);
  border: var(--line-width) solid var(--line-soft);
  border-radius: var(--radius-lg);
  box-shadow: var(--elev-high);
  outline: none;
}
.consent__title {
  margin: 0 0 0.8rem;
  color: var(--text-base);
}
.consent__body {
  margin: 0 0 0.6rem;
  color: var(--text-muted);
}
.consent__policy {
  margin: 0 0 1.8rem;
  color: var(--text-muted);
}
.consent__link {
  color: var(--accent-trust);
  text-underline-offset: 0.2em;
}
.consent__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}
.consent__back {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin: 0 0 1.6rem;
  padding: 0;
  background: none;
  border: none;
  color: var(--text-muted);
  font: inherit;
  cursor: pointer;
}
.consent__back:hover {
  color: var(--text-base);
}
.consent__cats {
  list-style: none;
  margin: 0 0 2rem;
  padding: 0;
  display: grid;
  gap: 1.2rem;
}
.consent__cat {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.2rem;
}
.consent__cat--required {
  padding-bottom: 1.2rem;
  border-bottom: var(--line-width) solid var(--line-hair);
}
.consent__cat-label {
  color: var(--text-base);
}
.consent__required {
  font-size: 1.3rem;
  color: var(--text-muted);
}
.consent__save {
  width: 100%;
}

/* Entrée/sortie ancrée: glisse depuis le sol, sans rebond. */
.consent-enter-active,
.consent-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.consent-enter-from,
.consent-leave-to {
  opacity: 0;
  transform: translateY(1.2rem);
}
@media (prefers-reduced-motion: reduce) {
  .consent-enter-active,
  .consent-leave-active {
    transition: opacity 0.2s ease;
  }
  .consent-enter-from,
  .consent-leave-to {
    transform: none;
  }
}
</style>
