import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './NewArrivals.css';

const NEW_DROPS = [
  {
    id: 1,
    name: 'T-SHIRT ESSENTIAL',
    detail: 'Coton pima 220g · Coupe sculptée',
    price: '85 €',
    badge: 'NOUVELLE PIÈCE',
    image: '/demo-collection2.webp',
    className: 'new-arrivals__product--lead',
    position: 'center center',
  },
  {
    id: 2,
    name: 'VESTE WIND BREAKER',
    detail: 'Ripstop imperméable · Zip YKK',
    price: '195 €',
    badge: 'DROP 01',
    image: '/demo-collection.webp',
    className: 'new-arrivals__product--wide',
    position: 'center center',
  },
  {
    id: 6,
    name: 'SHORT TRAINING',
    detail: 'Dry-fit · Poche zippée',
    price: '75 €',
    badge: 'ÉDITION LIMITÉE',
    image: '/frames/frame_045.webp',
    className: 'new-arrivals__product--compact',
    position: 'center center',
  },
];

function Product({ product }) {
  return (
    <article className={`new-arrivals__product ${product.className}`}>
      <Link to={`/product/${product.id}`} className="new-arrivals__image" aria-label={`Découvrir ${product.name}`}>
        <img src={product.image} alt={product.name} loading="lazy" decoding="async" style={{ objectPosition: product.position }} />
        <span className="new-arrivals__badge">{product.badge}</span>
        <span className="new-arrivals__discover">DÉCOUVRIR <b aria-hidden="true">↗</b></span>
      </Link>
      <div className="new-arrivals__info">
        <div><h3>{product.name}</h3><p>{product.detail}</p></div>
        <strong>{product.price}</strong>
      </div>
    </article>
  );
}

export default function NewArrivals() {
  const carouselRef = useRef(null);

  useEffect(() => {
    const carousel = carouselRef.current;
    const mobile = window.matchMedia('(max-width: 720px)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let timer;

    const startAutoplay = () => {
      window.clearInterval(timer);
      if (!mobile.matches || reducedMotion.matches || !carousel) return;

      timer = window.setInterval(() => {
        const card = carousel.querySelector('.new-arrivals__product');
        if (!card) return;
        const step = card.getBoundingClientRect().width + 32;
        const atEnd = carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 4;
        carousel.scrollTo({ left: atEnd ? 0 : carousel.scrollLeft + step, behavior: 'smooth' });
      }, 3600);
    };

    startAutoplay();
    mobile.addEventListener('change', startAutoplay);
    reducedMotion.addEventListener('change', startAutoplay);
    return () => {
      window.clearInterval(timer);
      mobile.removeEventListener('change', startAutoplay);
      reducedMotion.removeEventListener('change', startAutoplay);
    };
  }, []);

  return (
    <section className="new-arrivals" aria-labelledby="new-arrivals-title">
      <header className="new-arrivals__header">
        <p><span /> PREMIER ACCÈS · AH 2026</p>
        <h2 id="new-arrivals-title">LES<br /><em>NOUVEAUTÉS.</em></h2>
        <div className="new-arrivals__intro"><span>01 — 03</span><p>Les premières pièces de la nouvelle saison. Pensées pour l’intensité, dessinées pour sortir du cadre.</p></div>
      </header>

      <div className="new-arrivals__grid" ref={carouselRef} aria-roledescription="carrousel" aria-label="Nouveautés de la collection">
        {NEW_DROPS.map((product) => <Product key={product.id} product={product} />)}
      </div>

      <footer className="new-arrivals__footer">
        <p>PIÈCES EN QUANTITÉS LIMITÉES</p>
        <Link to="/catalog">VOIR LE DROP COMPLET <span aria-hidden="true">→</span></Link>
      </footer>
    </section>
  );
}
