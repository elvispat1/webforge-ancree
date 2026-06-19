/* Types de blocs. BlockBase porte la discrimination (_type) et la cle (_key) que
 * les mecanismes de dispatch (block-map + <component :is>) utilisent. Les contrats
 * de contenu vivent dans content/. */
import type { HeroContent, HeroPageContent } from '~/content/hero'
import type { TrustBarContent, ServicesContent, ServiceCitiesContent } from '~/content/blocks'
import type { AboutContent } from '~/content/about'
import type { TestimonialsContent } from '~/content/testimonials'
import type { FaqContent } from '~/content/faq'
import type { CtaBandContent } from '~/content/cta-band'
import type { ContactContent } from '~/content/contact'

export type BlockBase<T extends string> = { _type: T; _key: string }

// Heros (catalogue a part, comme dans le systeme).
export type HeroHomeBlock = BlockBase<'hero-home'> & HeroContent
export type HeroPageBlock = BlockBase<'hero-page'> & HeroPageContent
export type HeroBlock = HeroHomeBlock | HeroPageBlock

// Blocs de la page-builder.
export type TrustBarBlock = BlockBase<'trust-bar'> & TrustBarContent
export type ServicesBlock = BlockBase<'services'> & ServicesContent
export type ServiceCitiesBlock = BlockBase<'service-cities'> & ServiceCitiesContent
export type AboutBlock = BlockBase<'about'> & AboutContent
export type TestimonialsBlock = BlockBase<'testimonials'> & TestimonialsContent
export type FaqBlock = BlockBase<'faq'> & FaqContent
export type CtaBandBlock = BlockBase<'cta-band'> & CtaBandContent
export type ContactBlock = BlockBase<'contact'> & ContactContent

export type PageBlock =
  | TrustBarBlock
  | ServicesBlock
  | ServiceCitiesBlock
  | AboutBlock
  | TestimonialsBlock
  | FaqBlock
  | CtaBandBlock
  | ContactBlock
