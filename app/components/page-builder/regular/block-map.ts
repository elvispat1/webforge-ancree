/* Table de dispatch des blocs de page: un _type (kebab-case) vers un composant.
 * Mecanisme repris tel quel du systeme (string-keyed map + <component :is> +
 * v-bind). Les memes cles _type que Sanity, des dispositions neuves. */
import TrustBar from './block/trust-bar.vue'
import Services from './block/services.vue'
import ServiceCities from './block/service-cities.vue'
import About from './block/about.vue'
import Testimonials from './block/testimonials.vue'
import Faq from './block/faq.vue'
import CtaBand from './block/cta-band.vue'
import Contact from './block/contact.vue'
import Process from './block/process.vue'
import Editorial from './block/editorial.vue'
import Highlights from './block/highlights.vue'
import Team from './block/team.vue'

export const regularBlockMap = {
  'trust-bar': TrustBar,
  services: Services,
  'service-cities': ServiceCities,
  about: About,
  testimonials: Testimonials,
  faq: Faq,
  'cta-band': CtaBand,
  contact: Contact,
  process: Process,
  editorial: Editorial,
  highlights: Highlights,
  team: Team
} as const

export type RegularBlockType = keyof typeof regularBlockMap
