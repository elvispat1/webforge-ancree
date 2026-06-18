// Constantes de COMPILATION injectées par vite.define (cf. nuxt.config.ts).
//
// __WF_PREVIEW__ est figée à la valeur de previewEnabled au moment du build
// (présence des deux interrupteurs d'env SANITY_API_READ_TOKEN et
// NUXT_PUBLIC_STUDIO_URL). En build statique de production elle vaut false:
// les branches preview de l'app (plugin 01.content, montage du PreviewBanner
// dans les layouts) sont des branches mortes éliminées par Rollup, AUCUN code
// preview dans .output/public (gate T2c, pureté statique).

declare global {
  const __WF_PREVIEW__: boolean
}

export {}
