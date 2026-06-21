import { defineCliConfig } from 'sanity/cli'

// Project « WebForge - Ancrée Demo » dans l'organisation Patoine Studio
// (convention à deux régimes, contrat §17). Ids non sensibles: le projectId
// circule dans toutes les URL du CDN Sanity.
//
// projectId / dataset alignés sur sanity.config.ts: défaut de code + override env
// OPTIONNEL. Ce fichier pilote `sanity deploy` (studio:deploy) et `sanity schema
// deploy`: sans cette porte de sortie env, un client qui forke le gabarit
// déploierait son schéma et son Studio CONTRE le project de la démo (MAJ-05).
export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID || '5if00rwn',
    dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  },
  // Hostname du Studio hébergé (Phase 2 preview): fige l'URL à
  // webforge-ancree.sanity.studio et rend `sanity deploy` non interactif
  // (sinon il demande le hostname au premier déploiement).
  // À CHANGER au transfert client (sinon `sanity deploy` viserait l'URL de la démo).
  studioHost: 'webforge-ancree',
  // deployment.appId: figé au PREMIER `sanity deploy` de la famille Ancrée (le
  // CLI le propose, on le fige ici pour rendre les déploiements suivants non
  // interactifs). Propre à l'app Studio d'Ancrée (webforge-ancree.sanity.studio),
  // distincte de la démo Minimaliste. À CHANGER au transfert client.
  deployment: {
    appId: 'cj30bl1gqvc56km7d170ksyq',
  },
})
