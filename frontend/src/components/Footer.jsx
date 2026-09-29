import { Link } from 'react-router-dom';
import { FOOTER } from '../config/footer';
import RotatingEarth from './ui/wireframe-dotted-globe';
import './Footer.css';

function FooterLink({ link }) {
  const content = <>{link.label}<span aria-hidden="true">↗</span></>;
  if (link.href) return <a href={link.href} target={link.href.startsWith('http') ? '_blank' : undefined} rel={link.href.startsWith('http') ? 'noreferrer' : undefined}>{content}</a>;
  return <Link to={link.to}>{content}</Link>;
}

export default function Footer() {
  return (
    <footer className="site-footer" aria-label="Pied de page">
      <section className="site-footer__world" aria-labelledby="footer-world-title">
        <div className="site-footer__world-copy">
          <p className="site-footer__label">UB MINDSET — SANS FRONTIÈRES</p>
          <h2 id="footer-world-title">LE MINDSET<br />N’A PAS DE<br /><em>FRONTIÈRES.</em></h2>
          <p>{FOOTER.cityLine}</p>
        </div>
        <RotatingEarth className="site-footer__globe" />
      </section>

      <section className="site-footer__links">
        <div className="site-footer__signature">
          <Link to="/" aria-label="Retour à l’accueil UB Mindset">UB<span>®</span><br />MINDSET.</Link>
          <p>POUR CEUX QUI TRANSFORMENT<br />L’INTENTION EN MOUVEMENT.</p>
        </div>
        <nav className="site-footer__nav" aria-label="Navigation du pied de page">
          {FOOTER.groups.map((group) => (
            <div key={group.title}>
              <h3>{group.title}</h3>
              <ul>{group.links.map((link) => <li key={link.label}><FooterLink link={link} /></li>)}</ul>
            </div>
          ))}
        </nav>
      </section>

      <section className="site-footer__bottom">
        <p>© {new Date().getFullYear()} UB MINDSET. TOUS DROITS RÉSERVÉS.</p>
        <div>
          <a href={FOOTER.contact.instagram} target="_blank" rel="noreferrer">INSTAGRAM</a>
          <a href={FOOTER.contact.whatsapp} target="_blank" rel="noreferrer">WHATSAPP</a>
          <a href={FOOTER.contact.email}>EMAIL</a>
        </div>
      </section>
    </footer>
  );
}
