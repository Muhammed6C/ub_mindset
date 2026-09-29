import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { LOOKBOOK_SCENES } from '../config/lookbook';
import './Lookbook.css';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export default function Lookbook() {
  const sceneRefs = useRef({});
  const frameRef = useRef(null);
  const [revealedScenes, setRevealedScenes] = useState(() => new Set(['01']));
  const [isEnhanced] = useState(() => (
    typeof window !== 'undefined'
    && 'IntersectionObserver' in window
    && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ));
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleIds = entries
          .filter((entry) => entry.isIntersecting)
          .map((entry) => entry.target.dataset.sceneId);

        if (visibleIds.length) {
          setRevealedScenes((current) => new Set([...current, ...visibleIds]));
        }
      },
      { rootMargin: '-32% 0px -32% 0px', threshold: 0.01 },
    );

    Object.values(sceneRefs.current).forEach((scene) => observer.observe(scene));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const updateScrollEffects = () => {
      if (frameRef.current) return;
      frameRef.current = window.requestAnimationFrame(() => {
        const viewportHeight = window.innerHeight;
        const maxScroll = Math.max(document.documentElement.scrollHeight - viewportHeight, 1);
        setProgress(clamp(window.scrollY / maxScroll, 0, 1));

        Object.values(sceneRefs.current).forEach((scene) => {
          const image = scene.querySelector('.lookbook__image');
          const offset = clamp((scene.getBoundingClientRect().top + (scene.offsetHeight / 2) - (viewportHeight / 2)) / viewportHeight, -1, 1);
          image?.style.setProperty('--lookbook-parallax', `${offset * -28}px`);
        });

        frameRef.current = null;
      });
    };

    updateScrollEffects();
    window.addEventListener('scroll', updateScrollEffects, { passive: true });
    window.addEventListener('resize', updateScrollEffects);
    return () => {
      window.cancelAnimationFrame(frameRef.current);
      window.removeEventListener('scroll', updateScrollEffects);
      window.removeEventListener('resize', updateScrollEffects);
    };
  }, []);

  return (
    <main className="lookbook" aria-labelledby="lookbook-title">
      <div className="lookbook__progress" aria-hidden="true">
        <span style={{ transform: `scaleY(${progress})` }} />
      </div>

      <section className="lookbook__intro" aria-labelledby="lookbook-title">
        <p>UB MINDSET — ÉDITORIAL 2026</p>
        <h1 id="lookbook-title">LOOKBOOK</h1>
        <span>COLLECTION AUTOMNE-HIVER 2026</span>
        <a className="lookbook__scroll-cue" href="#scene-01">DÉFILER <i aria-hidden="true">↓</i></a>
      </section>

      {LOOKBOOK_SCENES.map((scene, index) => (
        <article
          className={`lookbook__scene ${isEnhanced ? 'lookbook__scene--enhanced' : ''} ${revealedScenes.has(scene.number) ? 'is-revealed' : ''}`}
          id={`scene-${scene.number}`}
          key={scene.number}
          data-scene-id={scene.number}
          ref={(element) => { sceneRefs.current[scene.number] = element; }}
          aria-labelledby={`scene-${scene.number}-title`}
        >
          <img
            className="lookbook__image"
            src={scene.image}
            alt={`${scene.product} — scène ${scene.number} du lookbook UB Mindset`}
            loading={index === 0 ? 'eager' : 'lazy'}
            fetchPriority={index === 0 ? 'high' : 'auto'}
            decoding="async"
            style={{ objectPosition: scene.imagePosition }}
          />
          <div className="lookbook__overlay" aria-hidden="true" />
          <span className="lookbook__number" aria-hidden="true">{scene.number}</span>
          <div className="lookbook__copy">
            <p>{scene.product}</p>
            <h2 id={`scene-${scene.number}-title`}>{scene.title}</h2>
            <Link to={scene.destination} aria-label={`Voir ${scene.product} dans la collection`}>VOIR LA PIÈCE <span aria-hidden="true">→</span></Link>
          </div>
        </article>
      ))}

      <section className="lookbook__outro" aria-label="Découvrir la collection">
        <p>LE MENTAL EST L’UNIFORME.</p>
        <h2>LA SUITE<br />S’ÉCRIT ICI.</h2>
        <Link to="/#collection">DÉCOUVRIR LA COLLECTION COMPLÈTE <span aria-hidden="true">→</span></Link>
      </section>
    </main>
  );
}
