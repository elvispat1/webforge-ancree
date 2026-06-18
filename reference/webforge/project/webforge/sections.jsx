// WebForge Palier 1 — Section components for Atelier Cormier (fictional ébéniste)
// All values come from CSS custom properties on :root. No hard-coded design tokens.

// ─── PRIMITIVES ───────────────────────────────────────────────────────────

function Logo({ size = 22, label = true }) {
  return (
    <a href="#top" className="wf-logo" aria-label="Atelier Cormier — accueil">
      <span className="wf-logo-mark" style={{ width: size, height: size }} aria-hidden="true">
        <svg viewBox="0 0 24 24" width={size} height={size}>
          <rect x="0" y="0" width="24" height="24" rx="1" fill="var(--accent-1)" />
          <text
            x="12" y="12"
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily='"Archivo", system-ui, sans-serif'
            fontSize="11"
            fontWeight="700"
            letterSpacing="-0.5"
            fill="var(--bg-base)"
          >AC</text>
        </svg>
      </span>
      {label ? <span className="wf-logo-wm">Atelier Cormier</span> : null}
    </a>
  );
}

function Placeholder({ ratio = "4/3", label = "image", tone = "alt", caption }) {
  return (
    <div className={`wf-ph wf-ph-${tone}`} style={{ aspectRatio: ratio }} role="img" aria-label={label}>
      <svg className="wf-ph-stripes" aria-hidden="true" preserveAspectRatio="none">
        <defs>
          <pattern id={`p-${label.replace(/\s+/g, "-")}`} width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="10" stroke="currentColor" strokeWidth="0.6" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#p-${label.replace(/\s+/g, "-")})`} />
      </svg>
      <span className="wf-ph-label">{caption || label}</span>
    </div>
  );
}

// ─── HEADER ───────────────────────────────────────────────────────────────

function Header({ scrolled, onAnchor }) {
  const links = [
    { href: "#about", label: "À propos" },
    { href: "#services", label: "Services" },
    { href: "#testimonials", label: "Témoignages" },
    { href: "#faq", label: "FAQ" },
  ];
  return (
    <header className={`wf-header${scrolled ? " is-scrolled" : ""}`} data-screen-label="Header">
      <div className="wf-container wf-header-row">
        <Logo />
        <nav className="wf-nav" aria-label="Navigation principale">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={(e) => onAnchor && onAnchor(e, l.href)}>
              {l.label}
            </a>
          ))}
        </nav>
        <a className="wf-btn wf-btn-sm" href="#contact" onClick={(e) => onAnchor && onAnchor(e, "#contact")}>
          Démarrer un projet
        </a>
      </div>
    </header>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────

function Hero({ onAnchor }) {
  return (
    <section className="wf-hero" id="top" data-screen-label="Hero">
      <div className="wf-container wf-hero-grid">
        <div className="wf-hero-text">
          <div className="wf-kicker">
            <span className="wf-kicker-dot" />
            Ébénisterie sur mesure · Chambly
          </div>
          <h1 className="wf-h1">
            Du bois massif local, façonné à la main, pour durer cent ans.
          </h1>
          <p className="wf-lead">
            Cuisines, mobilier et restauration, dans un atelier indépendant en Montérégie depuis 2014.
          </p>
          <div className="wf-hero-cta">
            <a className="wf-btn" href="#contact" onClick={(e) => onAnchor && onAnchor(e, "#contact")}>
              Démarrer un projet
              <span className="wf-btn-arrow" aria-hidden="true">→</span>
            </a>
            <a className="wf-btn-ghost" href="#services" onClick={(e) => onAnchor && onAnchor(e, "#services")}>
              Voir les services
            </a>
          </div>
          <dl className="wf-hero-meta">
            <div><dt>Établi</dt><dd>2014</dd></div>
            <div><dt>Projets livrés</dt><dd>140+</dd></div>
            <div><dt>Rayon</dt><dd>200 km</dd></div>
          </dl>
        </div>
        <div className="wf-hero-visual">
          <Placeholder ratio="4/5" label="Atelier · plan de travail en frêne" caption="Photo atelier · 4:5" />
          <div className="wf-hero-stamp">
            <span>Estab.</span>
            <strong>MMXIV</strong>
            <span>Chambly · QC</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── ABOUT ────────────────────────────────────────────────────────────────

function About() {
  const points = [
    {
      n: "01",
      title: "Bois locaux.",
      body: "Frêne, érable, merisier, noyer noir, sourcés à moins de 200 km de l'atelier.",
    },
    {
      n: "02",
      title: "Atelier solo.",
      body: "Vous parlez à la personne qui construit votre pièce. Pas d'intermédiaire, pas de sous-traitance.",
    },
    {
      n: "03",
      title: "Joinage traditionnel.",
      body: "Tenons, mortaises, queues d'aronde. Aucune quincaillerie cachée pour combler le travail.",
    },
  ];
  return (
    <section className="wf-section wf-about" id="about" data-screen-label="About">
      <div className="wf-container wf-about-grid">
        <div className="wf-about-photo">
          <Placeholder ratio="3/4" label="Portrait Maxime Cormier" caption="Portrait · 3:4" tone="base" />
          <figcaption className="wf-figcap">Maxime Cormier, fondateur · Atelier Cormier, Chambly.</figcaption>
        </div>
        <div className="wf-about-copy">
          <div className="wf-eyebrow">À propos</div>
          <h2 className="wf-h2">Une seule personne, du dessin à la livraison.</h2>
          <p className="wf-p">
            J'ai appris le métier dans l'atelier de mon grand-père à Saint-Hyacinthe, puis passé cinq ans
            chez un maître ébéniste à Lévis. Depuis 2014, je travaille seul à Chambly — c'est moi qui
            dessine, qui scie, qui assemble, qui livre. Si vous m'appelez, c'est moi qui réponds.
          </p>
          <p className="wf-p wf-p-muted">
            Mon parti pris est simple : moins de pièces, mieux faites. Si je ne suis pas la bonne personne
            pour votre projet, je vous le dirai directement.
          </p>
          <ul className="wf-diffs">
            {points.map((p) => (
              <li key={p.n}>
                <span className="wf-diff-n">{p.n}</span>
                <div>
                  <strong>{p.title}</strong>
                  <span>{p.body}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

// ─── SERVICES ─────────────────────────────────────────────────────────────

function Services() {
  const items = [
    {
      n: "S/01",
      title: "Cuisines complètes",
      body: "Caissons, façades et plans de travail en bois massif. Du croquis initial à la pose finale, en passant par les électros.",
      meta: "8 – 12 semaines",
    },
    {
      n: "S/02",
      title: "Mobilier de salle à manger",
      body: "Tables, bancs, buffets et chaises. Conçus pour le quotidien, taillés pour passer aux enfants.",
      meta: "6 – 10 semaines",
    },
    {
      n: "S/03",
      title: "Bibliothèques intégrées",
      body: "Rangements muraux sur mesure, ajustés au pouce près à votre mur — plinthes, moulures et angles compris.",
      meta: "6 – 8 semaines",
    },
    {
      n: "S/04",
      title: "Restauration de pièces anciennes",
      body: "Remise en état de meubles hérités, dans le respect de l'original. Devis honnête : parfois je vous dirai de ne rien toucher.",
      meta: "4 – 8 semaines",
    },
  ];
  return (
    <section className="wf-section wf-services" id="services" data-screen-label="Services">
      <div className="wf-container">
        <header className="wf-section-head">
          <div className="wf-eyebrow">Services</div>
          <h2 className="wf-h2">Quatre choses, faites correctement.</h2>
          <p className="wf-lead-sm">
            Je ne fais pas tout. Voilà ce que je fais — chaque ligne représente un projet que j'ai
            livré au moins vingt fois.
          </p>
        </header>
        <ul className="wf-services-grid">
          {items.map((s) => (
            <li key={s.n} className="wf-service">
              <div className="wf-service-top">
                <span className="wf-service-n">{s.n}</span>
                <span className="wf-service-meta">{s.meta}</span>
              </div>
              <h3 className="wf-h3">{s.title}</h3>
              <p className="wf-service-body">{s.body}</p>
              <a href="#contact" className="wf-service-cta">
                Demander un devis
                <span aria-hidden="true">→</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// ─── TESTIMONIALS ─────────────────────────────────────────────────────────

function Testimonials() {
  const items = [
    {
      quote: "Refait notre cuisine en frêne en 2022. Trois ans plus tard, les portes ne bougent toujours pas. Le travail parle de lui-même.",
      name: "Catherine Dufresne",
      ctx: "Cuisine complète · Saint-Mathias-sur-Richelieu",
    },
    {
      quote: "Une table de huit places en noyer pour les soixante-dix ans de mon père. Livrée trois mois après le premier croquis, exactement comme convenu.",
      name: "Jean-Philippe Rousseau",
      ctx: "Table de salle à manger · Chambly",
    },
    {
      quote: "J'avais hérité d'une commode de ma grand-mère qui se défaisait. Maxime l'a remise en état sans en effacer l'histoire.",
      name: "Marie-Hélène Bélanger",
      ctx: "Restauration · Carignan",
    },
  ];
  return (
    <section className="wf-section wf-testimonials" id="testimonials" data-screen-label="Testimonials">
      <div className="wf-container">
        <header className="wf-section-head wf-section-head-split">
          <div>
            <div className="wf-eyebrow">Témoignages</div>
            <h2 className="wf-h2">Trois clients, trois projets, une seule règle&nbsp;: livrer ce qu'on a promis.</h2>
          </div>
        </header>
        <ul className="wf-testimonials-grid">
          {items.map((t, i) => (
            <li key={i} className="wf-testimonial">
              <div className="wf-quote-mark" aria-hidden="true">“</div>
              <blockquote className="wf-quote">{t.quote}</blockquote>
              <footer className="wf-quote-foot">
                <strong>{t.name}</strong>
                <span>{t.ctx}</span>
              </footer>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────

function FAQ() {
  const items = [
    {
      q: "Quel est le délai typique pour un projet?",
      a: "De six semaines pour une pièce simple à six mois pour une cuisine complète. Je préfère un échéancier honnête à une promesse rapide — vous aurez la date de livraison par écrit dans le devis.",
    },
    {
      q: "Travaillez-vous en dehors de la Montérégie?",
      a: "Oui, sur la Rive-Sud, à Montréal et jusqu'en Estrie. Au-delà de 200 km, les coûts de transport rendent le projet moins intéressant pour vous — je vous référerai à un collègue ébéniste de votre région.",
    },
    {
      q: "Comment se déroule l'estimation?",
      a: "Une rencontre d'une heure, à l'atelier ou chez vous, gratuite et sans engagement. Vous recevez un devis détaillé par écrit dans la semaine, avec les essences, les dimensions et l'échéancier précis.",
    },
    {
      q: "Quelles essences de bois proposez-vous?",
      a: "Frêne, érable, merisier, noyer noir et chêne blanc en standard. Toutes sourcées au Québec et séchées en chambre. Pour les essences exotiques ou tropicales, je vous expliquerai pourquoi je préfère ne pas en utiliser.",
    },
    {
      q: "Offrez-vous une garantie?",
      a: "Cinq ans sur la structure et les assemblages. À vie sur la main-d'œuvre — si quelque chose lâche à cause d'une erreur de fabrication, je le répare, même dans dix ans.",
    },
  ];
  const [open, setOpen] = React.useState(0);

  return (
    <section className="wf-section wf-faq" id="faq" data-screen-label="FAQ">
      <div className="wf-container">
        <header className="wf-section-head">
          <div className="wf-eyebrow">FAQ</div>
          <h2 className="wf-h2">Les questions qu'on me pose le plus souvent.</h2>
        </header>
        {/* itemScope/itemType handled in real Nuxt build — markup ready */}
        <ol className="wf-faq-list" itemScope itemType="https://schema.org/FAQPage">
          {items.map((it, i) => {
            const isOpen = open === i;
            return (
              <li
                key={i}
                className={`wf-faq-item${isOpen ? " is-open" : ""}`}
                itemScope
                itemProp="mainEntity"
                itemType="https://schema.org/Question"
              >
                <button
                  className="wf-faq-q"
                  aria-expanded={isOpen}
                  aria-controls={`faq-a-${i}`}
                  onClick={() => setOpen(isOpen ? -1 : i)}
                >
                  <span className="wf-faq-n">{String(i + 1).padStart(2, "0")}</span>
                  <span className="wf-faq-q-text" itemProp="name">{it.q}</span>
                  <span className="wf-faq-chev" aria-hidden="true">
                    <svg viewBox="0 0 12 12" width="12" height="12">
                      <path d="M2 4 L6 8 L10 4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="square" />
                    </svg>
                  </span>
                </button>
                <div
                  id={`faq-a-${i}`}
                  className="wf-faq-a"
                  role="region"
                  itemScope
                  itemProp="acceptedAnswer"
                  itemType="https://schema.org/Answer"
                >
                  <p itemProp="text">{it.a}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

// ─── CONTACT FORM ─────────────────────────────────────────────────────────

function ContactForm({ forcedState }) {
  // forcedState: undefined | 'empty' | 'invalid' | 'loading' | 'success' | 'error'
  const [vals, setVals] = React.useState({ nom: "", courriel: "", tel: "", message: "" });
  const [errors, setErrors] = React.useState({});
  const [status, setStatus] = React.useState("idle"); // idle | loading | success | error

  // forcedState override for canvas
  const effectiveStatus = forcedState === "loading" ? "loading"
    : forcedState === "success" ? "success"
    : forcedState === "error" ? "error"
    : status;
  const showErrors = forcedState === "invalid" ? {
    nom: "Votre nom est requis.",
    courriel: "Courriel invalide.",
    message: "Décrivez brièvement votre projet (10 caractères minimum).",
  } : errors;
  const displayVals = forcedState === "invalid" ? {
    nom: "",
    courriel: "catherine@",
    tel: "",
    message: "Bonjour",
  } : forcedState === "loading" || forcedState === "success" ? {
    nom: "Catherine Dufresne",
    courriel: "catherine.d@exemple.ca",
    tel: "450 555 0142",
    message: "Bonjour Maxime, j'aimerais discuter d'un projet de bibliothèque intégrée pour notre salon (mur de 4,2 m, hauteur 2,7 m, en frêne ou érable). Disponible en soirée la semaine prochaine.",
  } : vals;

  const set = (k) => (e) => setVals((s) => ({ ...s, [k]: e.target.value }));

  function validate() {
    const next = {};
    if (!vals.nom.trim()) next.nom = "Votre nom est requis.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(vals.courriel)) next.courriel = "Courriel invalide.";
    if (vals.message.trim().length < 10) next.message = "Décrivez brièvement votre projet (10 caractères minimum).";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function onSubmit(e) {
    e.preventDefault();
    if (forcedState) return;
    if (!validate()) return;
    setStatus("loading");
    setTimeout(() => setStatus("success"), 900);
  }

  if (effectiveStatus === "success") {
    return (
      <div className="wf-form-success" role="status">
        <div className="wf-success-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path d="M4 12 L10 18 L20 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="square" />
          </svg>
        </div>
        <h3 className="wf-h3">Message reçu.</h3>
        <p className="wf-p">
          Merci {displayVals.nom.split(" ")[0]}. Je vous reviens d'ici 24 heures ouvrables, depuis l'atelier.
          En attendant, gardez la sciure en main.
        </p>
        <p className="wf-p-tiny">— Maxime</p>
      </div>
    );
  }

  return (
    <form className={`wf-form${effectiveStatus === "loading" ? " is-loading" : ""}`} onSubmit={onSubmit} noValidate>
      <div className="wf-field">
        <label htmlFor="cf-nom">Nom <span className="wf-req" aria-hidden="true">*</span></label>
        <input
          id="cf-nom"
          type="text"
          value={displayVals.nom}
          onChange={set("nom")}
          aria-invalid={!!showErrors.nom}
          aria-describedby={showErrors.nom ? "err-nom" : undefined}
          autoComplete="name"
          placeholder="Catherine Dufresne"
        />
        {showErrors.nom && <p id="err-nom" className="wf-err">{showErrors.nom}</p>}
      </div>
      <div className="wf-field">
        <label htmlFor="cf-mail">Courriel <span className="wf-req" aria-hidden="true">*</span></label>
        <input
          id="cf-mail"
          type="email"
          value={displayVals.courriel}
          onChange={set("courriel")}
          aria-invalid={!!showErrors.courriel}
          aria-describedby={showErrors.courriel ? "err-mail" : undefined}
          autoComplete="email"
          placeholder="vous@exemple.ca"
        />
        {showErrors.courriel && <p id="err-mail" className="wf-err">{showErrors.courriel}</p>}
      </div>
      <div className="wf-field">
        <label htmlFor="cf-tel">Téléphone <span className="wf-opt">optionnel</span></label>
        <input
          id="cf-tel"
          type="tel"
          value={displayVals.tel}
          onChange={set("tel")}
          autoComplete="tel"
          placeholder="450 555 0188"
        />
      </div>
      <div className="wf-field">
        <label htmlFor="cf-msg">Votre projet <span className="wf-req" aria-hidden="true">*</span></label>
        <textarea
          id="cf-msg"
          rows="5"
          value={displayVals.message}
          onChange={set("message")}
          aria-invalid={!!showErrors.message}
          aria-describedby={showErrors.message ? "err-msg" : undefined}
          placeholder="Type de projet, essence souhaitée, dimensions approximatives, échéancier..."
        />
        {showErrors.message && <p id="err-msg" className="wf-err">{showErrors.message}</p>}
      </div>
      {effectiveStatus === "error" && (
        <div className="wf-form-banner" role="alert">
          <strong>Envoi impossible.</strong>
          <span>Vérifiez votre connexion et réessayez, ou écrivez-moi directement à bonjour@ateliercormier.ca.</span>
        </div>
      )}
      <div className="wf-form-foot">
        <button type="submit" className="wf-btn" disabled={effectiveStatus === "loading"}>
          {effectiveStatus === "loading" ? "Envoi en cours…" : "Envoyer la demande"}
          {effectiveStatus !== "loading" && <span className="wf-btn-arrow" aria-hidden="true">→</span>}
        </button>
        <p className="wf-form-fine">
          Réponse sous 24 h ouvrables. Vos informations restent entre vous et moi.
        </p>
      </div>
    </form>
  );
}

function Contact({ forcedState }) {
  return (
    <section className="wf-section wf-contact" id="contact" data-screen-label="Contact">
      <div className="wf-container wf-contact-grid">
        <div className="wf-contact-copy">
          <div className="wf-eyebrow">Contact</div>
          <h2 className="wf-h2">Parlez-moi de votre projet.</h2>
          <p className="wf-lead-sm">
            Une rencontre d'une heure, à l'atelier ou chez vous, suffit pour savoir si on est faits
            pour travailler ensemble. Aucun engagement avant la signature du devis.
          </p>
          <dl className="wf-contact-meta">
            <div>
              <dt>Téléphone</dt>
              <dd><a href="tel:+14505550188">450 555 0188</a></dd>
            </div>
            <div>
              <dt>Courriel</dt>
              <dd><a href="mailto:bonjour@ateliercormier.ca">bonjour@ateliercormier.ca</a></dd>
            </div>
            <div>
              <dt>Atelier</dt>
              <dd>14 rue Bourgogne<br />Chambly QC&nbsp; J3L 1A4</dd>
            </div>
            <div>
              <dt>Heures</dt>
              <dd>Lun–Ven 8h–17h<br />Sam sur rendez-vous</dd>
            </div>
          </dl>
        </div>
        <div className="wf-contact-form-wrap">
          <ContactForm forcedState={forcedState} />
        </div>
      </div>
    </section>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="wf-footer" data-screen-label="Footer">
      <div className="wf-container wf-footer-grid">
        <div className="wf-footer-brand">
          <Logo />
          <p>Ébénisterie sur mesure, Chambly QC. Établi en 2014.</p>
        </div>
        <div className="wf-footer-col">
          <h4>Atelier</h4>
          <p>14 rue Bourgogne<br />Chambly QC&nbsp; J3L 1A4</p>
        </div>
        <div className="wf-footer-col">
          <h4>Contact</h4>
          <p>
            <a href="tel:+14505550188">450 555 0188</a><br />
            <a href="mailto:bonjour@ateliercormier.ca">bonjour@ateliercormier.ca</a>
          </p>
        </div>
        <div className="wf-footer-col">
          <h4>Pages</h4>
          <p>
            <a href="legal-conditions.html">Conditions d'utilisation</a><br />
            <a href="legal-privacy.html">Politique de confidentialité</a>
          </p>
        </div>
      </div>
      <div className="wf-container wf-footer-base">
        <p>© 2026 Atelier Cormier. Tous droits réservés.</p>
        <p className="wf-credit">
          Site par <a href="https://patoinestudio.ca">Patoine Studio</a> · <span>WebForge One-Pager</span>
        </p>
      </div>
    </footer>
  );
}

// ─── SITE COMPOSITION ─────────────────────────────────────────────────────

function Site({ device = "desktop", forcedFormState, mode = "live", forceScrolled = false }) {
  const isStatic = mode === "static";
  const [scrolled, setScrolled] = React.useState(forceScrolled);
  const rootRef = React.useRef(null);

  React.useEffect(() => {
    if (isStatic) return;
    const el = rootRef.current;
    if (!el) return;
    const onScroll = () => setScrolled(el.scrollTop > 24);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [isStatic]);

  function onAnchor(e, hash) {
    e.preventDefault();
    if (isStatic) return;
    const root = rootRef.current;
    if (!root) return;
    const target = root.querySelector(hash);
    if (target) {
      const top = target.offsetTop - 64;
      root.scrollTo({ top, behavior: "smooth" });
    }
  }

  return (
    <div className={`wf-site wf-device-${device}${isStatic ? " is-static" : ""}`} ref={rootRef}>
      <Header scrolled={scrolled} onAnchor={onAnchor} />
      <main>
        <Hero onAnchor={onAnchor} />
        <About />
        <Services />
        <Testimonials />
        <FAQ />
        <Contact forcedState={forcedFormState} />
      </main>
      <Footer />
    </div>
  );
}

// Static wrapper that lets you embed any subset of sections (or a single block)
// inside a canvas artboard. Renders a .wf-site host so container queries work.
function SiteHost({ children, device = "desktop" }) {
  return (
    <div className={`wf-site wf-device-${device} is-static`}>{children}</div>
  );
}

Object.assign(window, {
  Logo, Placeholder, Header, Hero, About, Services,
  Testimonials, FAQ, ContactForm, Contact, Footer, Site, SiteHost,
});
