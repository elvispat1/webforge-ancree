<script setup lang="ts">
/* Repertoire de la page /faq: le listing VISIBLE des questions, groupees par
 * theme. Distinct du bloc `faq` (page-builder, partage par les pages de detail):
 * ici une SEULE composition d'un tenant, a l'echelle de la page, qui evite
 * d'empiler le meme split asymetrique une fois par theme (la redondance que le
 * plan FOND veut tuer).
 *
 * Disposition signature Ancree: scission posee. Un rail gauche, calme et collant,
 * porte le sommaire (les themes en index ancre) et une carte d'appel en bleu nuit;
 * la colonne droite, plus large, empile les groupes (titre de theme + accordeon).
 * Le sommaire suit le defilement (scroll-spy) pour marquer le theme courant. La
 * hierarchie passe par la typo (poids, couleur), jamais par une languette ambre.
 *
 * Source unique: useFaqByTheme() (memes sections, meme ordre que le Studio, meme
 * banque qui alimente le JSON-LD FAQPage de la page). L'accordeon est la primitive
 * partagee; la reponse riche (Portable Text, liens internes inline) passe par le
 * slot `content`. AUCUNE numerotation. */
import PortableText from '~/components/page-builder/article/PortableText.vue'

const { t } = useI18n()

// Les groupes a rendre: ceux qui portent au moins une question (un theme vide ne
// laisse ni ancre morte au sommaire ni titre orphelin).
const groups = useFaqByTheme()
const themes = computed(() => groups.value.filter((g) => g.items.length > 0))

// Sommaire actif (scroll-spy): le theme dont le titre franchit la ligne de tete.
// Progressive enhancement, cote client seulement; sans JS, les ancres restent des
// liens qui sautent (scroll-behavior et scroll-padding sont globaux).
const rootEl = ref<HTMLElement | null>(null)
const activeSlug = ref('')

onMounted(() => {
  const groupEls = Array.from(
    rootEl.value?.querySelectorAll<HTMLElement>('.faq-dir__group[id]') ?? []
  )
  if (!groupEls.length) return
  activeSlug.value = groupEls[0]!.id

  // Bande de detection mince sous l'en-tete collant: un groupe devient courant
  // quand son titre passe juste sous le header et avant le dernier tiers de l'ecran.
  const live = new Set<string>()
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) live.add((e.target as HTMLElement).id)
        else live.delete((e.target as HTMLElement).id)
      }
      const top = groupEls.find((el) => live.has(el.id))
      if (top) activeSlug.value = top.id
    },
    { rootMargin: '-88px 0px -64% 0px', threshold: 0 }
  )
  groupEls.forEach((el) => io.observe(el))
  onUnmounted(() => io.disconnect())
})
</script>

<template>
  <section ref="rootEl" class="faq-dir">
    <div class="wf-container">
      <div class="faq-dir__layout wf-grid-cols">
        <!-- Rail: sommaire ancre + carte d'appel, colle au defilement au desktop.
             Le sticky vit sur l'item de grille (course = la hauteur des groupes);
             pas de v-reveal ici (la nav est presente d'emblee, et un ScrollTrigger
             sur l'element collant fausserait sa mesure). -->
        <aside class="faq-dir__rail wf-col-full wf-span-5">
          <div class="faq-dir__rail-inner">
            <nav class="faq-dir__nav" :aria-label="t('faq.nav_label')">
              <p class="faq-dir__nav-label wf-caption wf-text-muted">{{ t('faq.browse') }}</p>
              <ul class="faq-dir__nav-list">
                <li v-for="g in themes" :key="g.slug">
                  <a
                    class="faq-dir__nav-link"
                    :class="{ 'is-active': activeSlug === g.slug }"
                    :href="`#${g.slug}`"
                    :aria-current="activeSlug === g.slug ? 'true' : undefined"
                  >
                    <span class="faq-dir__nav-dot" aria-hidden="true" />
                    <span>{{ g.theme }}</span>
                  </a>
                </li>
              </ul>
            </nav>

            <div class="faq-dir__call">
              <span class="faq-dir__call-icon" aria-hidden="true">
                <Icon name="lucide:phone-call" />
              </span>
              <div>
                <p class="faq-dir__call-title wf-h5">{{ t('faq.still_wondering_title') }}</p>
                <p class="faq-dir__call-lead wf-body-3">{{ t('faq.still_wondering_lead') }}</p>
              </div>
            </div>
          </div>
        </aside>

        <!-- Groupes: un theme = un titre slab + son accordeon. -->
        <div class="faq-dir__groups wf-col-full wf-from-7 wf-to-end">
          <article v-for="(g, gi) in themes" :id="g.slug" :key="g.slug" class="faq-dir__group" v-reveal>
            <div class="faq-dir__group-inner" data-reveal-stagger>
              <h2 class="faq-dir__group-title wf-h3">{{ g.theme }}</h2>
              <Accordion
                :items="g.items.map((i) => ({ title: i.q }))"
                mode="multiple"
                :default-open="gi === 0 ? [0] : []"
                :heading-level="3"
              >
                <template #content="{ index }">
                  <PortableText :value="g.items[index]?.a ?? []" />
                </template>
              </Accordion>
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.faq-dir {
  padding-block: var(--space-block-default);
  background: var(--bg-alt);
}
.faq-dir__layout {
  align-items: start;
}

/* Rail gauche: zone calme, posee. Empile au mobile (sommaire court puis carte),
 * colle au defilement au desktop. */
.faq-dir__rail-inner {
  display: flex;
  flex-direction: column;
  gap: var(--space-head-content);
}

.faq-dir__nav-label {
  margin-bottom: 1.6rem;
}
.faq-dir__nav-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  border-top: var(--line-hair);
}
.faq-dir__nav-link {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  padding-block: 1.2rem;
  border-bottom: var(--line-hair);
  font-family: var(--font-display);
  font-size: 1.7rem;
  font-weight: 600;
  line-height: 1.25;
  color: var(--text-muted);
  text-decoration: none;
  transition: color var(--motion-duration-hover) var(--motion-ease-out);
}
/* Pastille « vous etes ici »: ronde (jamais une bande laterale), bleu confiance
 * a l'etat actif. Pose, pas decoratif. */
.faq-dir__nav-dot {
  flex: none;
  width: 0.8rem;
  height: 0.8rem;
  border-radius: var(--radius-pill);
  background: color-mix(in oklch, var(--text-base) 18%, transparent);
  transition:
    background-color var(--motion-duration-hover) var(--motion-ease-out),
    transform var(--motion-duration-expand) var(--motion-ease-settle);
}
.faq-dir__nav-link:hover {
  color: var(--text-base);
}
.faq-dir__nav-link:hover .faq-dir__nav-dot {
  background: color-mix(in oklch, var(--accent-trust) 60%, transparent);
}
.faq-dir__nav-link:focus-visible {
  outline: var(--focus-ring-width) solid var(--accent-trust);
  outline-offset: var(--focus-ring-offset);
  border-radius: var(--radius-sm);
}
.faq-dir__nav-link.is-active {
  color: var(--text-base);
}
.faq-dir__nav-link.is-active .faq-dir__nav-dot {
  background: var(--accent-trust);
  transform: scale(1.25);
}

/* Carte d'appel: bleu nuit, rappelle qu'il y a une vraie personne a joindre. */
.faq-dir__call {
  display: flex;
  align-items: center;
  gap: 1.6rem;
  padding: 2.2rem;
  background: var(--bg-deep);
  border-radius: var(--radius);
  box-shadow: var(--elev-mid);
}
.faq-dir__call-icon {
  display: grid;
  place-items: center;
  flex: none;
  width: 4.4rem;
  height: 4.4rem;
  border-radius: var(--radius-sm);
  background: var(--accent-call);
  color: var(--text-oncall);
}
.faq-dir__call-icon svg {
  width: 2.4rem;
  height: 2.4rem;
}
.faq-dir__call-title {
  color: var(--text-ondeep);
}
.faq-dir__call-lead {
  margin-top: 0.4rem;
  color: color-mix(in oklch, var(--text-ondeep) 76%, transparent);
}

/* Colonne des groupes. Espace ample entre les themes; chaque titre degage de
 * l'en-tete collant a l'ancrage (scroll-margin additif au scroll-padding global). */
.faq-dir__groups {
  display: flex;
  flex-direction: column;
  gap: var(--space-block-tight);
  margin-top: var(--space-head-content);
}
.faq-dir__group {
  scroll-margin-top: 2.4rem;
}
.faq-dir__group-title {
  margin-bottom: 2.4rem;
}

@container site (min-width: 1024px) {
  /* Le sticky est porte par l'item de grille (start-aligne via align-items:start
   * du layout): sa course de collage est la hauteur du conteneur de grille, donc
   * toute la colonne des groupes. Meme geste que le bloc faq partage. */
  .faq-dir__rail {
    position: sticky;
    top: calc(var(--header-height) + 3rem);
  }
  .faq-dir__groups {
    margin-top: 0;
  }
}
</style>
