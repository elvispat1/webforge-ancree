// Legal page template — same shell for /conditions, /confidentialite.
// Sober, narrow column, same tokens. Designed to be a 2nd-class page
// (no hero, breadcrumbs at top, footer reused).

function LegalPage({ kind = "conditions" }) {
  const data = kind === "privacy" ? PRIVACY_DATA : CONDITIONS_DATA;
  return (
    <div className="wf-site wf-device-desktop is-static wf-legal">
      <Header scrolled={true} onAnchor={() => {}} />
      <main>
        <article className="wf-legal-article">
          <div className="wf-container">
            <nav className="wf-breadcrumb" aria-label="Fil d'Ariane">
              <a href="WebForge Palier 1.html">Atelier Cormier</a>
              <span aria-hidden="true">/</span>
              <span>{data.crumb}</span>
            </nav>
            <header className="wf-legal-head">
              <div className="wf-eyebrow">{data.kicker}</div>
              <h1 className="wf-h1 wf-legal-h1">{data.title}</h1>
              <p className="wf-legal-meta">En vigueur depuis le {data.updated}. Version 1.0.</p>
            </header>
            <div className="wf-legal-body">
              {data.sections.map((s, i) => (
                <section key={i}>
                  <h2 className="wf-h3 wf-legal-h2">
                    <span className="wf-legal-n">§{String(i + 1).padStart(2, "0")}</span>
                    {s.title}
                  </h2>
                  {s.body.map((p, j) => <p key={j}>{p}</p>)}
                </section>
              ))}
              <section className="wf-legal-contact">
                <p>
                  Pour toute question relative à ce document, écrivez-nous à{" "}
                  <a href="mailto:bonjour@ateliercormier.ca">bonjour@ateliercormier.ca</a>{" "}
                  ou par la poste au 14 rue Bourgogne, Chambly QC J3L 1A4.
                </p>
              </section>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}

const CONDITIONS_DATA = {
  crumb: "Conditions d'utilisation",
  kicker: "Pages légales",
  title: "Conditions d'utilisation",
  updated: "1er janvier 2026",
  sections: [
    {
      title: "Champ d'application",
      body: [
        "Les présentes conditions encadrent l'utilisation du site ateliercormier.ca et tout échange initié à partir du formulaire de contact. En naviguant sur le site, vous acceptez sans réserve ces conditions.",
        "Atelier Cormier se réserve le droit de modifier ces conditions à tout moment. La version en vigueur est celle affichée sur la présente page, datée en haut du document.",
      ],
    },
    {
      title: "Propriété intellectuelle",
      body: [
        "Les textes, photographies, croquis, designs et marques figurant sur le site sont la propriété exclusive d'Atelier Cormier (Maxime Cormier, propriétaire unique). Toute reproduction, totale ou partielle, sans autorisation écrite préalable est interdite.",
      ],
    },
    {
      title: "Devis et contrats",
      body: [
        "Les devis émis par Atelier Cormier sont valides pour une durée de trente (30) jours civils. Aucun engagement n'est pris avant la signature d'un contrat de service détaillé, distinct des présentes conditions.",
        "Un acompte de 30 % du montant total du contrat est exigible à la signature, et est non remboursable à compter du moment où la sélection du bois est confirmée par le client.",
      ],
    },
    {
      title: "Limitation de responsabilité",
      body: [
        "Le site est fourni à titre informatif. Atelier Cormier ne saurait être tenu responsable de toute interprétation des informations qui y figurent, des liens externes ou d'une indisponibilité temporaire.",
      ],
    },
    {
      title: "Droit applicable",
      body: [
        "Les présentes conditions sont régies par les lois en vigueur au Québec. Tout litige sera porté devant les tribunaux compétents du district judiciaire de Saint-Hyacinthe.",
      ],
    },
  ],
};

const PRIVACY_DATA = {
  crumb: "Politique de confidentialité",
  kicker: "Pages légales",
  title: "Politique de confidentialité",
  updated: "1er janvier 2026",
  sections: [
    {
      title: "Données collectées",
      body: [
        "Atelier Cormier collecte uniquement les informations que vous fournissez volontairement via le formulaire de contact : nom, courriel, numéro de téléphone (optionnel) et contenu du message.",
        "Aucun cookie de traçage publicitaire n'est installé. Le site utilise un compteur de visites anonyme, sans identification personnelle.",
      ],
    },
    {
      title: "Utilisation des données",
      body: [
        "Les données soumises servent exclusivement à répondre à votre demande d'information ou à préparer un devis. Elles ne sont jamais vendues, louées, ni partagées avec un tiers à des fins commerciales.",
      ],
    },
    {
      title: "Conservation",
      body: [
        "Les demandes restées sans suite sont supprimées après douze (12) mois. Les dossiers de clients ayant signé un contrat sont conservés sept (7) ans, durée prescrite par les obligations fiscales québécoises.",
      ],
    },
    {
      title: "Vos droits",
      body: [
        "Conformément à la Loi 25 sur la protection des renseignements personnels dans le secteur privé, vous pouvez à tout moment demander la consultation, la rectification ou la suppression de vos données. Une demande écrite à bonjour@ateliercormier.ca suffit ; un délai maximal de trente (30) jours est appliqué.",
      ],
    },
    {
      title: "Sécurité",
      body: [
        "Le site est hébergé sur Cloudflare Pages, en HTTPS chiffré de bout en bout. Aucun stockage de données personnelles n'est effectué côté serveur — les soumissions du formulaire sont transmises directement par courriel au responsable.",
      ],
    },
  ],
};

window.LegalPage = LegalPage;
