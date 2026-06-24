/* About — ChickenAndy's real Kick channel description, donate info, contact
   and sponsors (mirrors kick.com/chickenandy/about). ContactCard and
   SponsorsSection are reused on the Home page. */
import React from 'react';
import D from '../data.js';
import { Button, SocialRow, Badge } from '../ds/index.js';
import { Reveal, TiltCard } from '../motion.jsx';

const ASSET = (p) => `${import.meta.env.BASE_URL}${p}`;

export function ContactCard() {
  const c = D.ABOUT.contact;
  return (
    <div className="contact-card">
      <div className="tl-sec__label">Contact</div>
      <ul className="contact-list">
        <li><span className="contact-list__k">Instagram</span><a href="https://instagram.com/chickenandy_" target="_blank" rel="noopener noreferrer">{c.instagram}</a></li>
        <li><span className="contact-list__k">Discord</span><a href={D.LINKS.discord} target="_blank" rel="noopener noreferrer">{c.discord}</a></li>
        <li><span className="contact-list__k">Business</span><a href={`mailto:${c.email}`}>{c.email}</a></li>
        <li><span className="contact-list__k">Mail</span><span>{c.pobox}</span></li>
      </ul>
      <p className="contact-note rvx-meta">{c.poboxNote}</p>
    </div>
  );
}

export function SponsorsSection({ compact = false }) {
  return (
    <div className="sponsors" data-screen-label="Sponsors">
      <div className="roll__head"><span className="roll__title">Sponsors</span></div>
      <div className={`sponsor-grid${compact ? ' sponsor-grid--compact' : ''}`}>
        {D.SPONSORS.map((s) => (
          <a key={s.id} className="sponsor-card" href={s.href} target="_blank" rel="noopener noreferrer">
            <TiltCard max={4} className="sponsor-card__in">
              <span className="sponsor-card__media">
                <img src={ASSET(s.img)} alt={s.name} loading="lazy" />
              </span>
              <span className="sponsor-card__body">
                <span className="sponsor-card__name">{s.tagline}</span>
                <span className="sponsor-card__desc">{s.desc}</span>
                <span className="sponsor-card__cta">Visit {s.name} →</span>
              </span>
            </TiltCard>
          </a>
        ))}
      </div>
    </div>
  );
}

export function About() {
  return (
    <section className="screen screen--about" data-screen-label="About">
      <header className="screen__head">
        <div>
          <div className="rvx-eyebrow">The streamer</div>
          <h2 className="screen__title">About ChickenAndy</h2>
        </div>
      </header>

      <div className="about-grid">
        <Reveal className="about-main">
          <p className="about-lead">{D.ABOUT.bio}</p>
          <div className="about-actions">
            <Button variant="primary" size="lg" href={D.LINKS.kick} target="_blank" rel="noopener noreferrer">Watch on Kick</Button>
            <Button variant="donate" size="lg" href={D.LINKS.powerchat} target="_blank" rel="noopener noreferrer">Donate</Button>
          </div>
          <SocialRow size="lg" links={D.CAST[0].socials.filter((s) => s.platform !== 'powerchat')} />
          <div className="about-donate">
            <Badge variant="accent" size="sm">Donate · TTS &amp; media</Badge>
            <p>{D.ABOUT.donate}</p>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <ContactCard />
        </Reveal>
      </div>

      <Reveal delay={0.05}>
        <SponsorsSection />
      </Reveal>
    </section>
  );
}
