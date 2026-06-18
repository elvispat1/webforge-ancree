// Registre des 48 types du Studio: 9 objets partagés, 15 blocs réguliers,
// 7 blocs article, 17 documents. La config Portable Text
// (article-blocks/article-portable-text.ts) n'est PAS enregistrée: c'est une
// définition de champ réutilisée par les blocs, pas un type au registre.

// Objets partagés
import { figure } from './objects/figure'
import { link } from './objects/link'
import { seo } from './objects/seo'
import { heroHome } from './objects/hero-home'
import { pageHero } from './objects/page-hero'
import { legalSection } from './objects/legal-section'
import { legalParagraph } from './objects/legal-paragraph'
import { legalList } from './objects/legal-list'
import { legalTodo } from './objects/legal-todo'

// Blocs réguliers (union PageBlock côté Vue, mapping kebab-case en §2.1 de la spec)
import { about } from './objects/blocks/about'
import { services } from './objects/blocks/services'
import { testimonials } from './objects/blocks/testimonials'
import { faq } from './objects/blocks/faq'
import { contact } from './objects/blocks/contact'
import { mediaText } from './objects/blocks/media-text'
import { ctaBand } from './objects/blocks/cta-band'
// `process` (le bloc) masque le global Node dans ce module: sans incidence ici,
// aucun accès à process.env dans ce fichier.
import { process } from './objects/blocks/process'
import { stats } from './objects/blocks/stats'
import { highlights } from './objects/blocks/highlights'
import { logos } from './objects/blocks/logos'
import { projectsPreview } from './objects/blocks/projects-preview'
import { blogPreview } from './objects/blocks/blog-preview'
import { iframe } from './objects/blocks/iframe'
import { videoYoutube } from './objects/blocks/video-youtube'

// Blocs article (union ArticleBlock côté Vue, mapping en §2.2 de la spec)
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
import { projectsPage } from './documents/projects-page'
import { aboutPage } from './documents/about-page'
import { blogPage } from './documents/blog-page'
import { faqPage } from './documents/faq-page'
import { contactPage } from './documents/contact-page'
import { onePager } from './documents/one-pager'

// Documents: collections
import { service } from './documents/service'
import { project } from './documents/project'
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
  link,
  seo,
  heroHome,
  pageHero,
  legalSection,
  legalParagraph,
  legalList,
  legalTodo,

  // Blocs réguliers
  about,
  services,
  testimonials,
  faq,
  contact,
  mediaText,
  ctaBand,
  process,
  stats,
  highlights,
  logos,
  projectsPreview,
  blogPreview,
  iframe,
  videoYoutube,

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
  projectsPage,
  aboutPage,
  blogPage,
  faqPage,
  contactPage,
  onePager,

  // Documents: collections
  service,
  project,
  article,
  category,

  // Documents: banques et instances fixes
  testimonial,
  faqItem,
  faqTheme,
  legalPage,
]
