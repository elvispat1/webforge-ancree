<script setup lang="ts">
/* ConsentCategories — section « Catégories de témoins » de la politique de
 * confidentialité, PILOTÉE PAR LA CONFIG (useContent('consent') + i18n), pas par
 * le contenu rédactionnel.
 *
 * Pourquoi config et non contenu: la liste reflète les technologies réellement
 * installées (principe CAI), donnée TECHNIQUE et non rédactionnelle. Elle reste
 * synchronisée avec la bannière de consentement (même config, mêmes libellés):
 * ajouter une catégorie dans CONSENT_CONFIG la fait apparaître ici ET dans la
 * bannière, sans toucher le contenu de la page. C'est le gabarit réutilisable
 * d'un projet WebForge à l'autre.
 *
 * Convention WebForge (cf. content/legal.ts): on décrit par CATÉGORIE et finalité,
 * jamais par fournisseur nommé (la CAI permet « les noms ou les catégories »).
 *
 * Rendu dans le slot #after-sections de <LegalPage>, page de confidentialité
 * seulement. « Nécessaires » est implicite (toujours en tête, requis), suivi des
 * catégories opt-in de la config. Le lien « Gérer les témoins » rouvre la bannière
 * (exigence Loi 25: retirer son consentement aussi facilement que le donner).
 */
const config = useContent('consent')
const consent = useConsentStore()
const { t } = useI18n()

const categories = computed(() => [
  { id: 'necessary', required: true },
  ...config.value.categories.map((c) => ({ id: c.id, required: false }))
])
</script>

<template>
  <section class="wf-legal-consent">
    <h2 class="wf-h3 wf-legal-h2">{{ t('consent.policy.title') }}</h2>
    <p>{{ t('consent.policy.intro') }}</p>

    <dl class="wf-legal-consent-list">
      <div v-for="cat in categories" :key="cat.id" class="wf-legal-consent-item">
        <dt class="wf-legal-consent-term">
          <span class="wf-body-1">{{ t(`consent.categories.${cat.id}.label`) }}</span>
          <span class="wf-caption">{{ cat.required ? t('consent.policy.status_required') : t('consent.policy.status_optional') }}</span>
        </dt>
        <dd class="wf-body-3">{{ t(`consent.categories.${cat.id}.purpose`) }}</dd>
      </div>
    </dl>

    <p>
      {{ t('consent.policy.change_prefix') }}
      <button type="button" class="wf-link" @click="consent.reopen()">{{ t('consent.manage') }}</button>.
    </p>
  </section>
</template>
