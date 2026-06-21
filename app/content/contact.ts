/* Contrat de contenu du bloc contact, miroir de ce que la transformation Sanity
 * produira. AUCUNE valeur design ici, que des champs de contenu. Le bloc pose le
 * formulaire (factice pour l'instant) a cote des coordonnees et de la zone de
 * service (motif local repris du bloc service-cities). Les libelles des champs et
 * les etats du bouton vivent dans le contenu (et non en dur dans le composant),
 * pour rester traduisibles et editables. Aucune numerotation, site-wide. */

// Un element de coordonnee: une etiquette, et soit une valeur simple (avec lien
// optionnel: tel, mailto), soit plusieurs lignes (adresse, heures).
export interface ContactMetaItem {
  label: string
  value?: string
  href?: string // tel:, mailto: ou URL; absent -> texte simple
  lines?: string[] // plusieurs lignes (heures, zone), au lieu de value
}

// Les trois champs du formulaire: nom, coordonnee (telephone ou courriel),
// message. Le contrat porte le libelle et l'obligation; la validation et le
// mouvement appartiennent au composant et au composable.
export interface ContactFormField {
  label: string
  required: boolean
}

export interface ContactForm {
  fields: {
    name: ContactFormField
    contact: ContactFormField
    message: ContactFormField
  }
  submitIdle: string // libelle du bouton au repos
  submitLoading: string // libelle pendant l'envoi
  success: {
    title: string
    body: string
  }
  // Banniere affichee si la soumission echoue (reseau, refus Turnstile, erreur
  // serveur). Le formulaire reste en place pour reessayer. Absente en demo (le
  // succes y est toujours simule), mais le contenu existe pour le vrai endpoint.
  errorBanner: {
    title: string
    body: string
  }
  privacyNote?: string // note de confidentialite sous le bouton
}

export interface ContactContent {
  eyebrow?: string // marqueur de section; absent sur une page dediee (le masthead le porte)
  heading: string
  lead: string
  meta: ContactMetaItem[]
  form: ContactForm
}

/* Contenu de demonstration bilingue (Rempart Extermination, fictif). Coordonnees
 * fictives: tel 450 555 0199, courriel bonjour@rempart-extermination.ca, zone
 * Rive-Nord de Montreal et Laval, heures Lun-Dim 7h a 21h. Francais quebecois
 * soutenu et chaleureux, on s'adresse au client (« on », « vous »). */
export function contactFixture(isEn: boolean): ContactContent {
  if (isEn) {
    return {
      eyebrow: 'Get in touch',
      heading: 'Tell us what you are dealing with',
      lead: 'Describe the situation in a few words and we will get back to you with a clear plan and an honest estimate, often the same day.',
      meta: [
        {
          label: 'Call us',
          value: '450 555 0199',
          href: 'tel:+14505550199'
        },
        {
          label: 'Write to us',
          value: 'bonjour@rempart-extermination.ca',
          href: 'mailto:bonjour@rempart-extermination.ca'
        },
        {
          label: 'Service area',
          lines: ['North Shore of Montreal and Laval', 'Residential and commercial']
        },
        {
          label: 'Hours',
          lines: ['Monday to Sunday', '7 a.m. to 9 p.m.']
        }
      ],
      form: {
        fields: {
          name: { label: 'Your name', required: true },
          contact: { label: 'Phone or email', required: true },
          message: { label: 'What is going on?', required: false }
        },
        submitIdle: 'Send my request',
        submitLoading: 'Sending...',
        success: {
          title: 'Message received, thank you.',
          body: 'A Rempart technician will get back to you shortly to set up a visit. For anything urgent, call us at 450 555 0199.'
        },
        errorBanner: {
          title: 'Your message did not go through.',
          body: 'Please try again in a moment, or call us directly at 450 555 0199. We really do want to hear from you.'
        },
        privacyNote: 'Your information stays with us and is only used to reply to your request.'
      }
    }
  }

  return {
    eyebrow: 'Nous joindre',
    heading: 'Dites-nous ce qui vous tracasse',
    lead: 'Décrivez la situation en quelques mots et on vous revient avec un plan clair et une estimation honnête, souvent le jour même.',
    meta: [
      {
        label: 'Nous appeler',
        value: '450 555 0199',
        href: 'tel:+14505550199'
      },
      {
        label: 'Nous écrire',
        value: 'bonjour@rempart-extermination.ca',
        href: 'mailto:bonjour@rempart-extermination.ca'
      },
      {
        label: 'Zone de service',
        lines: ['Rive-Nord de Montréal et Laval', 'Résidentiel et commercial']
      },
      {
        label: 'Heures',
        lines: ['Du lundi au dimanche', 'De 7 h à 21 h']
      }
    ],
    form: {
      fields: {
        name: { label: 'Votre nom', required: true },
        contact: { label: 'Téléphone ou courriel', required: true },
        message: { label: 'Qu’est-ce qui se passe?', required: false }
      },
      submitIdle: 'Envoyer ma demande',
      submitLoading: 'Envoi en cours...',
      success: {
        title: 'Message reçu, merci.',
        body: 'Un technicien de Rempart vous revient sous peu pour fixer une visite. Pour une urgence, appelez-nous au 450 555 0199.'
      },
      errorBanner: {
        title: 'L’envoi n’a pas fonctionné.',
        body: 'Réessayez dans un moment, ou appelez-nous directement au 450 555 0199. On veut vraiment vous lire.'
      },
      privacyNote: 'Vos informations restent chez nous et servent seulement à répondre à votre demande.'
    }
  }
}
