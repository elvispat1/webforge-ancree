/* POST /api/contact, reception du formulaire de contact.
 *
 * Route Nitro, servie sous `nuxt dev`. En DEMO, le site est en STATIQUE PUR
 * (preset Nitro 'static'): cette route n'est PAS deployee et le formulaire simule
 * le succes cote client (runtimeConfig.public.contactDemo). Un vrai site client met
 * contactDemo a false et deploie avec un runtime serveur sur Cloudflare Workers
 * (preset 'cloudflare-module', comme la future branche preview SSR), ou Nitro la
 * compile en handler du Worker.
 *
 * MODE DEMO / TERRAIN: sans cle Resend configuree, la route valide les champs puis
 * renvoie un succes simule SANS rien envoyer. Pose RESEND_API_KEY (+ CONTACT_FROM_EMAIL,
 * CONTACT_TO_EMAIL) pour activer l'envoi reel. Turnstile: ignore si non configure,
 * fail-closed des que TURNSTILE_SECRET_KEY est posee.
 *
 * Plomberie portee/adaptee de webforge-minimaliste. Difference de contrat: Ancree a
 * UN champ « contact » (telephone OU courriel), pas des champs separes; le reply_to
 * Resend n'est pose que si ce champ est un courriel. */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'
const TURNSTILE_ACTION = 'contact'

interface ContactBody {
  name?: string
  contact?: string // telephone ou courriel
  message?: string
  website?: string // honeypot
  'cf-turnstile-response'?: string
}

/* Coupe et borne une valeur entrante. Tout ce qui n'est pas une chaine -> ''. */
function clean(value: unknown, maxLength: number): string {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

/* Miroir serveur de l'heuristique client (useContactForm.looksLikeContact):
 * un courriel plausible ou au moins 10 chiffres (telephone). */
function looksLikeContact(raw: string): boolean {
  if (raw.length < 5) return false
  const isEmail = EMAIL_REGEX.test(raw)
  const isPhone = raw.replace(/\D/g, '').length >= 10
  return isEmail || isPhone
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

async function verifyTurnstile(secret: string, token: string, ip: string | null): Promise<boolean> {
  const body = new FormData()
  body.append('secret', secret)
  body.append('response', token)
  if (ip) body.append('remoteip', ip)
  try {
    const result = await $fetch<{ success: boolean, action?: string }>(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      body
    })
    if (!result.success) return false
    if (result.action && result.action !== TURNSTILE_ACTION) return false
    return true
  } catch {
    return false
  }
}

/* Gabarit courriel: styles inline litteraux (les clients courriel ne lisent pas les
 * variables CSS), d'ou les couleurs en dur ici plutot que via les tokens. Palette
 * Ancree: bandeau bleu nuit, pastille ambre, fond papier chaud. */
function buildEmailHtml(data: { name: string, contact: string, message: string }): string {
  const rows = [
    { label: 'Nom', value: data.name },
    { label: 'Coordonnée', value: data.contact }
  ]
    .filter(r => r.value)
    .map(r => `<tr><td style="padding:8px 12px;font-weight:700;color:#16243f;white-space:nowrap;vertical-align:top;">${escapeHtml(r.label)}</td><td style="padding:8px 12px;color:#5c6678;">${escapeHtml(r.value)}</td></tr>`)
    .join('')

  const messageBlock = data.message
    ? `<div style="margin-top:20px;">
          <p style="font-weight:700;color:#16243f;margin:0 0 8px;">Sa demande</p>
          <div style="background:#f6f3ee;border-radius:12px;padding:16px;color:#5c6678;white-space:pre-wrap;">${escapeHtml(data.message)}</div>
        </div>`
    : ''

  return `<!DOCTYPE html><html lang="fr-CA"><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f6f3ee;font-family:Georgia,'Times New Roman',serif;">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">
    <div style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 24px rgba(60,40,20,0.10);">
      <div style="background:#16243f;padding:22px 28px;border-bottom:4px solid #fbbf24;">
        <h1 style="margin:0;font-size:19px;color:#ffffff;font-weight:700;">Nouvelle demande de Rempart</h1>
      </div>
      <div style="padding:24px 28px;">
        <table style="width:100%;border-collapse:collapse;font-size:15px;">${rows}</table>
        ${messageBlock}
      </div>
    </div>
  </div>
</body></html>`
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const body = await readBody<ContactBody>(event)

  // Honeypot: rempli = robot. Succes silencieux (ne rien reveler du piege).
  if (clean(body?.website, 200)) {
    return { success: true }
  }

  // Validation serveur (miroir des regles client). Messages generiques ici: le
  // client affiche ses propres messages par champ depuis le contenu. Le message
  // est OPTIONNEL (comme cote client).
  const name = clean(body?.name, 120)
  const contact = clean(body?.contact, 254)
  const message = clean(body?.message, 4000)

  if (!name || !looksLikeContact(contact)) {
    throw createError({ statusCode: 400, statusMessage: 'Champs du formulaire invalides.' })
  }

  // MODE DEMO: pas de cle Resend -> succes simule, aucun courriel envoye.
  if (!config.resendApiKey) {
    return { success: true }
  }

  // Turnstile: fail-closed des que la cle secrete est configuree.
  if (config.turnstileSecretKey) {
    const token = clean(body?.['cf-turnstile-response'], 2048)
    if (!token) {
      throw createError({ statusCode: 400, statusMessage: 'Vérification anti-robot requise.' })
    }
    const ip = getRequestHeader(event, 'cf-connecting-ip') ?? null
    const valid = await verifyTurnstile(config.turnstileSecretKey, token, ip)
    if (!valid) {
      throw createError({ statusCode: 403, statusMessage: 'Vérification anti-robot échouée.' })
    }
  }

  // Reply-to seulement si la coordonnee est un courriel (sinon c'est un telephone:
  // il reste dans le corps du message, pas dans l'en-tete reply_to).
  const isEmail = EMAIL_REGEX.test(contact)

  // Envoi via l'API REST Resend (fonctionne dans le runtime Cloudflare).
  try {
    await $fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${config.resendApiKey}` },
      body: {
        from: config.contactFromEmail,
        to: [config.contactToEmail],
        ...(isEmail ? { reply_to: contact } : {}),
        subject: `Nouvelle demande de ${name}`,
        html: buildEmailHtml({ name, contact, message })
      }
    })
  } catch {
    throw createError({ statusCode: 502, statusMessage: 'Erreur lors de l\'envoi du courriel.' })
  }

  return { success: true }
})
