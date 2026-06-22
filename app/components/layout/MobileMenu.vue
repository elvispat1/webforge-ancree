<script setup lang="ts">
/* Menu mobile ouvert depuis le burger de l'en-tete: plein ecran au telephone,
 * tiroir lateral en tablette (768-1024). Ferme au clic sur un lien, sur le fond,
 * ou avec Echap. Modale accessible: verrouille le defilement, pose le focus a
 * l'ouverture, piege le focus tant qu'elle est ouverte (aria-modal), et rend le
 * focus au burger a la fermeture. Rendu en position fixe (pas de Teleport, pour
 * rester sain au SSR). Recoit des liens deja normalises {label, href} (l'en-tete
 * les construit selon le mode: ancres en landing, routes en multipage). */
interface MenuLink {
  label: string
  href: string
}

const props = withDefaults(
  defineProps<{ open: boolean; mode?: 'multipage' | 'landing'; links: MenuLink[] }>(),
  { mode: 'landing' }
)
const emit = defineEmits<{ close: [] }>()

const { t, locale } = useI18n()
// Marque et numero d'appel depuis siteSettings (discipline 3): rien en dur.
const site = useContent('site')
const brandWords = computed(() => {
  const name = site.value.brand.name
  const i = name.indexOf(' ')
  return i === -1 ? { lead: name, rest: '' } : { lead: name.slice(0, i), rest: name.slice(i + 1) }
})
const phoneHref = computed(() => `tel:${site.value.contact.phoneE164}`)
const panelRef = ref<HTMLElement | null>(null)
// Element focalise avant l'ouverture (le burger): on lui rend le focus a la
// fermeture, pour ne pas perdre l'utilisateur clavier au milieu de la page.
let lastFocused: HTMLElement | null = null

function close(): void {
  emit('close')
}

// Cibles focalisables de la modale, dans l'ordre du DOM (base du piege de focus).
function focusables(): HTMLElement[] {
  if (!panelRef.value) return []
  return Array.from(
    panelRef.value.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  )
}

function onKeydown(e: KeyboardEvent): void {
  if (e.key === 'Escape') {
    close()
    return
  }
  // Piege de focus: Tab boucle a l'interieur. aria-modal le promet aux lecteurs
  // d'ecran; ceci tient la promesse au clavier, sinon le focus file derriere la
  // modale, sur la page masquee.
  if (e.key !== 'Tab') return
  const items = focusables()
  if (items.length === 0) return
  // items.length > 0 garanti par la garde ci-dessus: les bornes existent.
  const first = items[0]!
  const last = items[items.length - 1]!
  const active = document.activeElement as HTMLElement | null
  const inside = !!active && !!panelRef.value?.contains(active)
  if (e.shiftKey && (active === first || !inside)) {
    e.preventDefault()
    last.focus()
  } else if (!e.shiftKey && (active === last || !inside)) {
    e.preventDefault()
    first.focus()
  }
}

watch(
  () => props.open,
  (isOpen) => {
    if (!import.meta.client) return
    document.body.style.overflow = isOpen ? 'hidden' : ''
    if (isOpen) {
      lastFocused = document.activeElement as HTMLElement | null
      window.addEventListener('keydown', onKeydown)
      nextTick(() => focusables()[0]?.focus())
    } else {
      window.removeEventListener('keydown', onKeydown)
      lastFocused?.focus()
      lastFocused = null
    }
  }
)

onBeforeUnmount(() => {
  if (!import.meta.client) return
  document.body.style.overflow = ''
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <Transition name="mm">
    <div v-if="open" class="mm" role="dialog" aria-modal="true" :aria-label="t('a11y.main_nav')">
      <div class="mm__backdrop" @click="close" />
      <div ref="panelRef" class="mm__panel">
        <div class="mm__bar">
          <span class="mm__brand" aria-hidden="true">
            <strong>{{ brandWords.lead }}</strong> {{ brandWords.rest }}
          </span>
          <button type="button" class="mm__close" :aria-label="t('a11y.close_menu')" @click="close">
            <Icon name="lucide:x" aria-hidden="true" />
          </button>
        </div>

        <nav class="mm__nav" :aria-label="t('a11y.main_nav')">
          <!-- Multipage: routes internes en NuxtLink (navigation instantanee, pas de
               rechargement). Landing: ancres du one-pager en <a> (defilement en page). -->
          <template v-if="mode === 'multipage'">
            <NuxtLink v-for="link in links" :key="link.href" :to="link.href" class="mm__link" @click="close">
              {{ link.label }}
            </NuxtLink>
          </template>
          <template v-else>
            <a v-for="link in links" :key="link.href" :href="link.href" class="mm__link" @click="close">
              {{ link.label }}
            </a>
          </template>
        </nav>

        <div class="mm__actions">
          <Button
            :href="phoneHref"
            kind="anchor"
            variant="call"
            icon="lucide:phone"
            @click="close"
          >
            {{ t('hero.cta_primary') }}
          </Button>
          <a class="mm__phone" :href="phoneHref">{{ site.contact.phone }}</a>
          <SwitchLocalePathLink class="mm__lang" :locale="locale === 'fr' ? 'en' : 'fr'" @click="close">{{ t('home.switch') }}</SwitchLocalePathLink>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.mm {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  justify-content: flex-end;
}
.mm__backdrop {
  position: absolute;
  inset: 0;
  background: color-mix(in oklch, var(--navy) 55%, transparent);
}
.mm__panel {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%; /* mobile: la modale prend tout l'ecran */
  height: 100%;
  padding: 2.4rem;
  background: var(--bg-base);
  box-shadow: var(--elev-high);
}
/* Tablette (768-1024): tiroir lateral, pas plein ecran (le burger disparait des
   1024, ou la nav desktop reprend). */
@container site (min-width: 768px) {
  .mm__panel {
    width: min(86vw, 40rem);
  }
}
.mm__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: var(--header-height);
}
.mm__brand {
  font-family: var(--font-display);
  font-size: 1.7rem;
  color: var(--text-base);
}
.mm__brand strong {
  font-weight: 800;
}
.mm__close {
  display: grid;
  place-items: center;
  width: 4.4rem;
  height: 4.4rem;
  border: 0;
  border-radius: var(--radius-sm);
  background: color-mix(in oklch, var(--text-base) 5%, transparent);
  color: var(--text-base);
  cursor: pointer;
}
.mm__close svg {
  width: 2.4rem;
  height: 2.4rem;
}

.mm__nav {
  display: flex;
  flex-direction: column;
  margin-top: 1.6rem;
}
.mm__link {
  padding: 1.6rem 0;
  border-bottom: var(--line-soft);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 2.2rem;
  color: var(--text-base);
  text-decoration: none;
}
.mm__link:hover {
  color: var(--accent-trust);
}

.mm__actions {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 1.4rem;
  padding-top: 2.4rem;
}
.mm__phone {
  text-align: center;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.8rem;
  color: var(--text-base);
  text-decoration: none;
}
.mm__lang {
  text-align: center;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 1.5rem;
  color: var(--text-muted);
  text-decoration: none;
}
.mm__lang:hover {
  color: var(--accent-trust);
}

/* Apparition: le panneau glisse, le fond se fond. Coupe en reduced-motion. */
.mm-enter-active,
.mm-leave-active {
  transition: opacity var(--motion-duration-line) var(--motion-ease-settle);
}
.mm-enter-active .mm__panel,
.mm-leave-active .mm__panel {
  transition: transform var(--motion-duration-expand) var(--motion-ease-settle);
}
.mm-enter-from,
.mm-leave-to {
  opacity: 0;
}
.mm-enter-from .mm__panel,
.mm-leave-to .mm__panel {
  transform: translateX(100%);
}
@media (prefers-reduced-motion: reduce) {
  .mm-enter-active,
  .mm-leave-active,
  .mm-enter-active .mm__panel,
  .mm-leave-active .mm__panel {
    transition: none;
  }
}
</style>
