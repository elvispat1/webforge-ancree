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
 * Monté dans les coquilles de site (layouts default + landing), pas sous /showcase.
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

/* Rendu différé au mount client. Le plugin consent (.client) amorce le store
 * AVANT l'hydratation, donc `bannerVisible` peut déjà être vrai quand Vue hydrate:
 * rendre la carte à ce stade créerait un mismatch d'hydratation (serveur = rien,
 * client = la carte) sur le site généré statiquement. On attend donc le mount: au
 * premier rendu client la carte reste absente (comme au serveur), puis elle
 * apparaît. Le blocage dur GA4, lui, reste piloté tôt par le plugin. */
const mounted = ref(false)
onMounted(() => { mounted.value = true })

/* Brouillon des bascules opt-in, initialisé depuis l'état courant à l'ouverture
 * du panneau. « Nécessaires » n'y est pas (toujours vrai, verrouillé). */
const draft = reactive<Record<string, boolean>>({})
function initDraft() {
  for (const c of config.value.categories) draft[c.id] = consent.consented(c.id)
}

/* Rouvrir la bannière (via le pied de page ou la page politique) repart
 * toujours de la vue de base. Réouverture explicite (forceOpen): on déplace le
 * focus sur la carte (tabindex=-1) pour que le lecteur d'écran annonce son
 * apparition et que le clavier la rejoigne sans retraverser la page. Au premier
 * affichage (forceOpen faux), on ne vole JAMAIS le focus au chargement. */
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
    <Transition name="wf-consent">
      <section
        v-if="mounted && consent.bannerVisible"
        ref="card"
        class="wf-consent"
        :aria-label="copy('aria_label')"
        tabindex="-1"
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
            <Icon name="lucide:chevron-left" aria-hidden="true" />
            <span>{{ copy('back') }}</span>
          </button>

          <ul class="wf-consent__cats">
            <!-- Nécessaires: catégorie requise, pas de bascule — juste la mention « Requis ». -->
            <li class="wf-consent__cat wf-consent__cat--required">
              <span class="wf-consent__cat-label">{{ copy('categories.necessary.label') }}</span>
              <span class="wf-consent__required">{{ copy('required') }}</span>
            </li>
            <!-- Catégories opt-in. Libellé + bascule seulement; les descriptions
                 de catégories vivront dans la politique de confidentialité (panneau clean). -->
            <li v-for="c in config.categories" :key="c.id" class="wf-consent__cat">
              <!-- v-model éclaté: draft[c.id] est boolean | undefined sous
                   noUncheckedIndexedAccess, le repli false rétablit le contrat
                   boolean du Switch (les clés sont semées au montage). -->
              <Switch
                :model-value="draft[c.id] ?? false"
                :label="copy(`categories.${c.id}.label`)"
                @update:model-value="draft[c.id] = $event"
              />
            </li>
          </ul>

          <Button :icon="false" class="wf-consent__save" @click="onSaveCustom">{{ copy('save') }}</Button>
        </div>
      </section>
    </Transition>
  </Teleport>
</template>
