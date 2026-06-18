export interface VideoYoutubeContent {
  // Identifiant de la vidéo (11 caractères), extrait de l'URL ou de l'ID source au
  // transform (youtubeId). Le composant en dérive la vignette et l'URL d'intégration.
  videoId: string
  // Source de l'affiche montrée AVANT lecture:
  //   'youtube' = vignette officielle de YouTube (i.ytimg.com);
  //   'custom'  = image téléversée (figure résolue), plus soignée.
  // Les deux modes affichent un bouton de lecture; l'iframe YouTube (nocookie) ne
  // se charge qu'au clic (façade: meilleure perf, aucun témoin avant le geste).
  posterMode: 'youtube' | 'custom'
  // Affiche personnalisée (mode 'custom'): figure résolue (src + alt). Absente en
  // mode 'youtube'. Cadre imposé en 16/9 par le bloc (object-fit cover).
  poster?: {
    ratio: string
    // V1: chemin string. V2: asset Sanity résolu en URL au transform.
    src?: string
    alt: string
    label: string
    caption: string
  }
  // Titre optionnel: enrichit l'étiquette du bouton de lecture, sert de légende
  // (wf-figcap) et de title de l'iframe une fois lancée.
  title?: string
}

/** Fonction de traduction minimale (clé -> chaîne), compatible avec useI18n().t. */
type Tr = (key: string) => string

/** Échantillon de démonstration du bloc video-youtube pour la vitrine /showcase
 * (jamais consommé en production). Texte via i18n (showcase.samples.video_youtube.*),
 * scaffolding technique inline. videoId = Big Buck Bunny (vidéo libre, intégrable). */
export function videoYoutubeSample(t: Tr): VideoYoutubeContent {
  return {
    videoId: 'aqz-KE-bpKQ',
    posterMode: 'youtube',
    poster: {
      ratio: '16/9',
      src: '/images/about.jpg',
      alt: t('showcase.samples.video_youtube.poster_alt'),
      label: t('showcase.samples.video_youtube.poster_label'),
      caption: t('showcase.samples.video_youtube.poster_caption')
    },
    title: t('showcase.samples.video_youtube.title')
  }
}
