import siteContent from "../data/site-content.json";

const iconPaths = {
  instagram: "M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm5 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm6.5-.4a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2ZM12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z",
  linkedin: "M4.98 3.5a2.5 2.5 0 1 1-.02 5 2.5 2.5 0 0 1 .02-5ZM3 10h4v11H3V10Zm7 0h3.8v1.5h.1c.5-.9 1.8-1.8 3.7-1.8 4 0 4.7 2.6 4.7 6V21h-4v-5.2c0-1.2 0-2.8-1.8-2.8s-2 1.3-2 2.7V21H10V10Z",
  mail: "M3 5h18v14H3V5Zm2.2 2 6.8 5.1L18.8 7H5.2Zm13.8 10V9.6l-7 5.2-7-5.2V17h14Z",
  youtube: "M21.6 7.2s-.2-1.5-.8-2.2c-.8-.8-1.7-.8-2.1-.9C15.7 4 12 4 12 4s-3.7 0-6.7.1c-.4.1-1.3.1-2.1.9-.6.7-.8 2.2-.8 2.2S2 9 2 10.7v1.6c0 1.7.4 3.5.4 3.5s.2 1.5.8 2.2c.8.8 1.9.8 2.4.9 1.7.2 6.4.1 6.4.1s3.7 0 6.7-.1c.4-.1 1.3-.1 2.1-.9.6-.7.8-2.2.8-2.2s.4-1.8.4-3.5v-1.6c0-1.7-.4-3.5-.4-3.5ZM10 14.5v-5l5 2.5-5 2.5Z",
};

function Icon({ name }) {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
      <path d={iconPaths[name] || iconPaths.mail} />
    </svg>
  );
}

function emailHref(value) {
  const email = String(value || "").trim();
  if (!email) return "/#contact";
  if (email.startsWith("/") || email.startsWith("#") || email.startsWith("http") || email.startsWith("mailto:")) return email;
  return `mailto:${email}`;
}

function phoneHref(value) {
  const phone = String(value || "").trim();
  if (!phone) return "/#contact";
  if (phone.startsWith("tel:")) return phone;
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export default function NotFound() {
  const copy = siteContent.notFound || {};
  const contactDetails = siteContent.contactDetails || {};
  const socialLinks = siteContent.socialLinks || [];

  return (
    <main className="not-found-page">
      <img className="not-found-bg" src={siteContent.assets.heroBackground} alt="" aria-hidden="true" />
      <div className="not-found-shade" />
      <section className="not-found-panel">
        <p>{copy.eyebrow || "404"}</p>
        <h1>{copy.title || "Sorry, something went wrong"}</h1>
        <span>{copy.body || "The page you are looking for is missing or has moved."}</span>
        <div className="not-found-actions">
          <a href="/">{copy.homeLabel || "Return home"}</a>
          <a href="/#contact">{copy.contactLabel || "Contact form"}</a>
          <a href={emailHref(contactDetails.email)}>{contactDetails.emailLabel || copy.emailLabel || "Email Marius"}</a>
          <a href={phoneHref(contactDetails.phone)}>{contactDetails.phoneLabel || copy.callLabel || "Call Marius"}</a>
        </div>
        <nav className="not-found-socials" aria-label="Marius social links">
          {socialLinks.map((link) => (
            <a href={link.href} key={link.name} target="_blank" rel="noreferrer noopener" aria-label={link.name}>
              <Icon name={link.icon} />
            </a>
          ))}
        </nav>
      </section>
    </main>
  );
}
