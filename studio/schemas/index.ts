// Registre des 43 types du Studio: 11 objets partagés, 8 blocs réguliers,
// 7 blocs article, 9 singletons, 4 collections, 4 banques. Deux définitions ne
// sont PAS enregistrées car ce sont des helpers de champ réutilisés, pas des
// types autonomes: pageBuilderField (objects/blocks/page-builder.ts) et
// articlePortableText (objects/article-blocks/article-portable-text.ts).

// Objets partagés
import { figure } from './objects/figure'
import { heroImage } from './objects/hero-image'
import { link } from './objects/link'
import { seo } from './objects/seo'
import { heroHome } from './objects/hero-home'
import { pageHero } from './objects/page-hero'
import { legalSection } from './objects/legal-section'
import { legalParagraph } from './objects/legal-paragraph'
import { legalList } from './objects/legal-list'
import { legalTodo } from './objects/legal-todo'
import { proof } from './objects/proof'
import { stat } from './objects/stat'

// Blocs réguliers (union PageBlock côté Vue, peau et libellés propres d'Ancrée)
import { trustBar } from './objects/blocks/trust-bar'
import { services } from './objects/blocks/services'
import { serviceCities } from './objects/blocks/service-cities'
import { about } from './objects/blocks/about'
import { testimonials } from './objects/blocks/testimonials'
import { faq } from './objects/blocks/faq'
import { ctaBand } from './objects/blocks/cta-band'
import { contact } from './objects/blocks/contact'

// Blocs article (union ArticleBlock côté Vue)
import { articleLead } from './objects/article-blocks/article-lead'
import { articleRichText } from './objects/article-blocks/article-rich-text'
import { articleImage } from './objects/article-blocks/article-image'
import { articleQuote } from './objects/article-blocks/article-quote'
import { articleGallery } from './objects/article-blocks/article-gallery'
import { articleCallout } from './objects/article-blocks/article-callout'
import { articleInlineCta } from './objects/article-blocks/article-inline-cta'

// Documents: singletons (un exemplaire par langue avec doc-level i18n)
import { siteSettings } from './documents/site-settings'
import { homePage } from './documents/home-page'
import { servicesPage } from './documents/services-page'
import { villesPage } from './documents/villes-page'
import { aboutPage } from './documents/about-page'
import { blogPage } from './documents/blog-page'
import { faqPage } from './documents/faq-page'
import { contactPage } from './documents/contact-page'
import { onePager } from './documents/one-pager'

// Documents: collections
import { service } from './documents/service'
import { serviceCity } from './documents/service-city'
import { article } from './documents/article'
import { category } from './documents/category'

// Documents: banques et instances fixes
import { testimonial } from './documents/testimonial'
import { faqItem } from './documents/faq-item'
import { faqTheme } from './documents/faq-theme'
import { legalPage } from './documents/legal-page'

export const schemaTypes = [
  // Objets partagés
  figure,
  heroImage,
  link,
  seo,
  heroHome,
  pageHero,
  legalSection,
  legalParagraph,
  legalList,
  legalTodo,
  proof,
  stat,

  // Blocs réguliers
  trustBar,
  services,
  serviceCities,
  about,
  testimonials,
  faq,
  ctaBand,
  contact,

  // Blocs article
  articleLead,
  articleRichText,
  articleImage,
  articleQuote,
  articleGallery,
  articleCallout,
  articleInlineCta,

  // Documents: singletons
  siteSettings,
  homePage,
  servicesPage,
  villesPage,
  aboutPage,
  blogPage,
  faqPage,
  contactPage,
  onePager,

  // Documents: collections
  service,
  serviceCity,
  article,
  category,

  // Documents: banques et instances fixes
  testimonial,
  faqItem,
  faqTheme,
  legalPage,
]
