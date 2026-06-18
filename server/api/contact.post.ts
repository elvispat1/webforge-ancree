/* POST /api/contact — réception du formulaire de contact.
 *
 * Route Nitro, servie sous `nuxt dev`. En démo, le site est en STATIQUE PUR
 * (preset Nitro 'static'): cette route n'est PAS déployée et le formulaire simule
 * le succès côté client (runtimeConfig.public.contactDemo). Un vrai site client
 * met contactDemo à false et déploie avec un runtime serveur sur Cloudflare
 * Workers (preset 'cloudflare-module', comme la branche preview SSR), où Nitro la
 * compile en handler du Worker.
 *
 * MODE DÉMO: sans clé Resend configurée, la route valide les champs puis renvoie
 * un succès simulé SANS rien envoyer. Pose RESEND_API_KEY (+ CONTACT_FROM_EMAIL,
 * CONTACT_TO_EMAIL) pour activer l'envoi réel. Turnstile: ignoré si non
 * configuré, fail-closed dès que TURNSTILE_SECRET_KEY est posée.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'
const TURNSTILE_ACTION = 'contact'

interface ContactBody {
  name?: string
  email?: string
  phone?: string
  message?: string
  website?: string // honeypot
  'cf-turnstile-response'?: string
}

/* Coupe et borne une valeur entrante. Tout ce qui n'est pas une chaîne → ''. */
function clean(value: unknown, maxLength: number): string {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
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

/* Gabarit courriel: styles inline littéraux (les clients courriel ne lisent pas
 * les variables CSS), d'où les couleurs en dur ici plutôt que via les tokens. */
function buildEmailHtml(data: { name: string, email: string, phone: string, message: string }): string {
  const rows = [
    { label: 'Nom', value: data.name },
    { label: 'Courriel', value: data.email },
    { label: 'Téléphone', value: data.phone }
  ]
    .filter(r => r.value)
    .map(r => `<tr><td style="padding:8px 12px;font-weight:600;color:#1A1A1A;white-space:nowrap;vertical-align:top;">${escapeHtml(r.label)}</td><td style="padding:8px 12px;color:#6B675F;">${escapeHtml(r.value)}</td></tr>`)
    .join('')

  return `<!DOCTYPE html><html lang="fr-CA"><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#F2EFE9;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">
    <div style="background:#FAFAF7;border-radius:8px;overflow:hidden;">
      <div style="background:#2D4A3E;padding:20px 28px;">
        <h1 style="margin:0;font-size:18px;color:#FAFAF7;font-weight:600;">Nouvelle demande de projet</h1>
      </div>
      <div style="padding:24px 28px;">
        <table style="width:100%;border-collapse:collapse;font-size:15px;">${rows}</table>
        <div style="margin-top:20px;">
          <p style="font-weight:600;color:#1A1A1A;margin:0 0 8px;">Projet</p>
          <div style="background:#F2EFE9;border-radius:6px;padding:16px;color:#6B675F;white-space:pre-wrap;">${escapeHtml(data.message)}</div>
        </div>
      </div>
    </div>
  </div>
</body></html>`
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const body = await readBody<ContactBody>(event)

  // Honeypot: rempli = bot. Succès silencieux (ne rien révéler du piège).
  if (clean(body?.website, 200)) {
    return { success: true }
  }

  // Validation serveur (miroir des règles client). Messages génériques ici:
  // le client affiche ses propres messages par champ depuis le contenu.
  const name = clean(body?.name, 120)
  const email = clean(body?.email, 254).toLowerCase()
  const phone = clean(body?.phone, 40)
  const message = clean(body?.message, 4000)

  if (!name || !email || !EMAIL_REGEX.test(email) || !message) {
    throw createError({ statusCode: 400, statusMessage: 'Champs du formulaire invalides.' })
  }

  // MODE DÉMO: pas de clé Resend → succès simulé, aucun courriel envoyé.
  if (!config.resendApiKey) {
    return { success: true }
  }

  // Turnstile: fail-closed dès que la clé secrète est configurée.
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

  // Envoi via l'API REST Resend (fonctionne dans le runtime Cloudflare).
  try {
    await $fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${config.resendApiKey}` },
      body: {
        from: config.contactFromEmail,
        to: [config.contactToEmail],
        reply_to: email,
        subject: `Nouvelle demande de ${name}`,
        html: buildEmailHtml({ name, email, phone, message })
      }
    })
  } catch {
    throw createError({ statusCode: 502, statusMessage: 'Erreur lors de l\'envoi du courriel.' })
  }

  return { success: true }
})
