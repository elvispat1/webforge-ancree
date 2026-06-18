<script setup lang="ts">
import type { BlockBase } from '~/types/blocks'
import type { VideoYoutubeContent } from '~/content/video-youtube'

// Bloc vidéo YouTube en FAÇADE: on rend une affiche (vignette YouTube ou image
// personnalisée) avec un bouton de lecture; l'iframe YouTube ne se charge qu'au
// clic. Gain de perf (aucun script YouTube au chargement) et posture témoins
// (domaine nocookie, aucune requête YouTube avant le geste de l'utilisateur).
const video = defineProps<BlockBase<'video-youtube'> & VideoYoutubeContent>()
const { t } = useI18n()

const playing = ref(false)
// maxresdefault n'existe pas pour toutes les vidéos: repli sur hqdefault (toujours
// présent) au premier échec de chargement.
const thumbFallback = ref(false)
const thumbUrl = computed(() =>
  `https://i.ytimg.com/vi/${video.videoId}/${thumbFallback.value ? 'hqdefault' : 'maxresdefault'}.jpg`
)
const embedUrl = computed(
  () => `https://www.youtube-nocookie.com/embed/${video.videoId}?autoplay=1&rel=0`
)
// Étiquette du bouton: « Lire la vidéo » enrichie du titre s'il existe (cible
// claire quand plusieurs vidéos cohabitent sur une page).
const playLabel = computed(() =>
  video.title ? `${t('ui.video.play')} : ${video.title}` : t('ui.video.play')
)
const iframeTitle = computed(() => video.title || t('ui.video.iframe_title'))
</script>

<template>
  <section class="wf-section wf-video">
    <div class="wf-container">
      <div class="section-grid">
        <figure class="wf-video-figure" data-reveal>
          <div class="wf-video-frame">
            <button
              v-if="!playing"
              type="button"
              class="wf-video-poster"
              :aria-label="playLabel"
              @click="playing = true"
            >
              <!-- Affiche personnalisée: figure Sanity (alt vide = décorative, le
                   bouton porte déjà le nom accessible). -->
              <Image
                v-if="video.posterMode === 'custom'"
                :src="video.poster?.src"
                :alt="''"
                :ratio="video.poster?.ratio || '16/9'"
                sizes="sm:100vw md:100vw lg:100vw xl:100vw xxl:100vw"
                tone="base"
                :parallax="false"
                class="wf-video-img"
              />
              <!-- Vignette YouTube (URL externe, hors IPX): img simple, décorative. -->
              <img
                v-else
                class="wf-video-img wf-video-img--thumb"
                :src="thumbUrl"
                alt=""
                loading="lazy"
                @error="thumbFallback = true"
              >
              <span class="wf-video-scrim" aria-hidden="true" />
              <span class="wf-video-play" aria-hidden="true">
                <svg class="wf-video-play-icon" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" fill="currentColor" />
                </svg>
              </span>
            </button>

            <!-- Lecteur chargé au clic (geste utilisateur = autoplay autorisé). -->
            <iframe
              v-else
              class="wf-video-embed"
              :src="embedUrl"
              :title="iframeTitle"
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              referrerpolicy="strict-origin-when-cross-origin"
              allowfullscreen
            />
          </div>
          <figcaption v-if="video.title" class="wf-figcap">{{ video.title }}</figcaption>
        </figure>
      </div>
    </div>
  </section>
</template>
