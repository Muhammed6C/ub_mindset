import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { OUR_STORY } from '../config/ourStory';
import './OurStory.css';

const splitTitle = (title) => title.split('\n').map((line) => <span key={line}>{line}</span>);

export default function OurStory() {
  const [motionEnabled] = useState(() => (
    typeof window !== 'undefined'
    && 'IntersectionObserver' in window
    && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ));

  useEffect(() => {
    if (!motionEnabled) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: '0px 0px -6% 0px' },
    );

    document.querySelectorAll('[data-story-reveal]').forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [motionEnabled]);

  return (
    <main className={`our-story ${motionEnabled ? 'our-story--enhanced' : ''}`}>
      <section className="our-story__opening" aria-labelledby="story-opening-title">
        <img className="our-story__opening-image" src={OUR_STORY.opening.image} alt={OUR_STORY.opening.imageAlt} />
        <div className="our-story__opening-shade" aria-hidden="true" />
        <div className="our-story__opening-content">
          <p className="our-story__eyebrow">UB MINDSET — NOTRE HISTOIRE</p>
          <h1 id="story-opening-title">{splitTitle(OUR_STORY.opening.title)}</h1>
          <p className="our-story__opening-intro">{OUR_STORY.opening.intro}</p>
          <span className="our-story__scroll-cue" aria-hidden="true">FAIS DÉFILER <i>↓</i></span>
        </div>
      </section>

      <section className="our-story__origin our-story__section" aria-labelledby="origin-title">
        <div className="our-story__section-heading" data-story-reveal>
          <p className="our-story__eyebrow">{OUR_STORY.origin.eyebrow}</p>
          <h2 id="origin-title">{splitTitle(OUR_STORY.origin.title)}</h2>
        </div>
        <div className="our-story__origin-copy" data-story-reveal>
          {OUR_STORY.origin.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
      </section>

      <section className="our-story__timeline our-story__section" aria-label="Les étapes de UB Mindset">
        <ol>
          {OUR_STORY.milestones.map((milestone, index) => (
            <li key={milestone.title} data-story-reveal>
              <span className="our-story__timeline-index">0{index + 1}</span>
              <p className="our-story__timeline-date">{milestone.date}</p>
              <h3>{milestone.title}</h3>
              <p className="our-story__timeline-description">{milestone.description}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="our-story__values our-story__section" aria-labelledby="values-title">
        <div className="our-story__section-heading" data-story-reveal>
          <p className="our-story__eyebrow">LE MINDSET</p>
          <h2 id="values-title">{splitTitle('CE QUI NOUS\nFAIT AVANCER.')}</h2>
        </div>
        <div className="our-story__value-grid">
          {OUR_STORY.values.map((value, index) => (
            <article className="our-story__value-card" data-story-reveal key={value.title}>
              <span>0{index + 1}</span>
              <h3>{value.title}</h3>
              <p>{value.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="our-story__community our-story__section" aria-labelledby="community-title">
        <div className="our-story__community-heading" data-story-reveal>
          <p className="our-story__eyebrow">{OUR_STORY.community.eyebrow}</p>
          <h2 id="community-title">{splitTitle(OUR_STORY.community.title)}</h2>
          <p className="our-story__member-count">{OUR_STORY.community.memberCount}</p>
        </div>
        <div className="our-story__testimonials">
          {OUR_STORY.community.testimonials.map((testimonial) => (
            <figure data-story-reveal key={testimonial.image}>
              <img src={testimonial.image} alt={`Placeholder à remplacer par une photo de ${testimonial.name}`} loading="lazy" />
              <figcaption>
                <strong>{testimonial.name}</strong>
                <blockquote>{testimonial.quote}</blockquote>
              </figcaption>
            </figure>
          ))}
        </div>
        <a className="our-story__community-cta" href={OUR_STORY.community.ctaUrl} target="_blank" rel="noreferrer" data-story-reveal>
          {OUR_STORY.community.ctaLabel}
        </a>
      </section>

      <section className="our-story__closing" aria-labelledby="closing-title">
        <div data-story-reveal>
          <p className="our-story__eyebrow">UB MINDSET</p>
          <h2 id="closing-title">{splitTitle(OUR_STORY.closing.title)}</h2>
          <Link className="our-story__closing-cta" to={OUR_STORY.closing.ctaUrl}>
            {OUR_STORY.closing.ctaLabel}
          </Link>
        </div>
      </section>
    </main>
  );
}
