import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';

const NAV_LINKS = [
  { label: 'Collection',     to: '/catalog' },
  { label: 'Nouveautés',     to: '/catalog?filter=new' },
  { label: 'Lookbook',       to: '/lookbook' },
  { label: 'Notre Histoire', to: '/about' },
];

export default function Navbar({ cartCount = 0 }) {
  const [scrollState, setScrollState] = useState('top'); // 'top' | 'pill' | 'exited'
  const [mobileOpen, setMobileOpen]   = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      const heroHeight = window.innerHeight;

      // Sur la page d'accueil avec hero
      if (isHome) {
        // Seuil où la section recouvrante atteint la zone de la navbar
        const exitThreshold = heroHeight - 80;

        if (y <= 20) {
          setScrollState('top');
        } else if (y > 20 && y < exitThreshold) {
          setScrollState('pill');
        } else {
          // Hors du hero : la section recouvrante a pris le relais
          setScrollState('exited');
        }
      } else {
        // Sur les autres pages sans hero 100vh
        if (y <= 20) {
          setScrollState('top');
        } else {
          setScrollState('pill');
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHome]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const isPill = scrollState === 'pill';
  const isExited = scrollState === 'exited';

  return (
    <>
      {/* ══════════════════════════════════════════════
          NAVBAR FLOTTANTE & INTELLIGENTE AU SCROLL
          ════════════════════════════════════════════ */}
      <nav
        style={{
          position: 'fixed',
          top: isPill || isExited ? '16px' : '0px',
          left: '50%',
          transform: isExited
            ? 'translateX(-50%) translateY(-120%)'
            : 'translateX(-50%) translateY(0)',
          width: isPill || isExited ? 'calc(100% - 32px)' : '100%',
          maxWidth: isPill || isExited ? '760px' : '100%',
          height: isPill ? '52px' : '70px',
          borderRadius: isPill || isExited ? '9999px' : '0px',
          padding: isPill ? '0 22px' : '0 40px',
          background: isPill
            ? 'rgba(242, 241, 239, 0.88)'
            : 'rgba(242, 241, 239, 0.45)',
          backdropFilter: isPill ? 'blur(20px) saturate(180%)' : 'blur(12px)',
          WebkitBackdropFilter: isPill ? 'blur(20px) saturate(180%)' : 'blur(12px)',
          border: isPill
            ? '1px solid rgba(10, 10, 10, 0.08)'
            : 'none',
          borderBottom: !isPill
            ? '1px solid rgba(0, 0, 0, 0.04)'
            : undefined,
          boxShadow: isPill
            ? '0 12px 36px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.03)'
            : 'none',
          opacity: isExited ? 0 : 1,
          pointerEvents: isExited ? 'none' : 'all',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          transition: 'top 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), width 0.4s cubic-bezier(0.16, 1, 0.3, 1), max-width 0.4s cubic-bezier(0.16, 1, 0.3, 1), height 0.35s ease, border-radius 0.4s ease, padding 0.35s ease, background 0.35s ease, box-shadow 0.35s ease, opacity 0.35s ease',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '1400px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: isPill ? '20px' : '36px',
            transition: 'gap 0.35s ease',
          }}
        >
          {/* ── LOGO À GAUCHE (taille réactive) ── */}
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              flexShrink: 0,
              textDecoration: 'none',
              lineHeight: 1,
            }}
          >
            <img
              src="/logo.png"
              alt="UB Mindset"
              style={{
                height: isPill ? '32px' : '44px',
                width: 'auto',
                mixBlendMode: 'multiply',
                display: 'block',
                transition: 'height 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />
          </Link>

          {/* ── Séparateur ── */}
          <div
            style={{
              width: '1px',
              height: isPill ? '14px' : '18px',
              background: '#D9D8D5',
              flexShrink: 0,
              transition: 'height 0.35s ease',
            }}
          />

          {/* ── LIENS DE NAVIGATION (desktop) ── */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: isPill ? '22px' : '28px',
              flex: 1,
              transition: 'gap 0.35s ease',
            }}
            className="hidden md:flex"
          >
            {NAV_LINKS.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                style={{
                  fontFamily: '"Archivo Narrow", "Archivo", sans-serif',
                  fontWeight: 600,
                  fontSize: isPill ? '0.54rem' : '0.58rem',
                  textTransform: 'uppercase',
                  letterSpacing: isPill ? '0.2em' : '0.22em',
                  color: '#3A3A3A',
                  textDecoration: 'none',
                  transition: 'color 0.2s ease, font-size 0.3s ease, letter-spacing 0.3s ease',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#0A0A0A'}
                onMouseLeave={e => e.currentTarget.style.color = '#3A3A3A'}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* ── PANIER (desktop) ── */}
          <div
            className="hidden md:flex"
            style={{ marginLeft: 'auto', flexShrink: 0, alignItems: 'center', gap: '6px' }}
          >
            <Link
              to="/cart"
              style={{
                fontFamily: '"Archivo Narrow", "Archivo", sans-serif',
                fontWeight: 600,
                fontSize: isPill ? '0.54rem' : '0.58rem',
                textTransform: 'uppercase',
                letterSpacing: isPill ? '0.2em' : '0.22em',
                color: '#3A3A3A',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#0A0A0A'}
              onMouseLeave={e => e.currentTarget.style.color = '#3A3A3A'}
            >
              PANIER
              {cartCount > 0 && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '15px',
                    height: '15px',
                    borderRadius: '50%',
                    background: '#0A0A0A',
                    color: '#F2F1EF',
                    fontSize: '8px',
                    fontWeight: 800,
                  }}
                >
                  {cartCount}
                </span>
              )}
            </Link>
          </div>

          {/* ── BURGER mobile ── */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex md:hidden"
            style={{
              marginLeft: 'auto',
              flexDirection: 'column',
              gap: '4px',
              padding: '6px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
            aria-label="Menu"
          >
            {[0, 1, 2].map(i => (
              <span
                key={i}
                style={{
                  display: 'block',
                  width: isPill ? '18px' : '20px',
                  height: '1px',
                  background: '#0A0A0A',
                  transition: 'transform 0.3s ease, opacity 0.3s ease, width 0.3s ease',
                  transform:
                    i === 0 && mobileOpen ? 'rotate(45deg) translate(4px, 4px)' :
                    i === 2 && mobileOpen ? 'rotate(-45deg) translate(4px, -4px)' : 'none',
                  opacity: i === 1 && mobileOpen ? 0 : 1,
                }}
              />
            ))}
          </button>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════
          MENU MOBILE (OVERLAY)
          ════════════════════════════════════════════ */}
      <div
        className="md:hidden"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 90,
          background: 'rgba(242, 241, 239, 0.97)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '32px',
          opacity: mobileOpen ? 1 : 0,
          pointerEvents: mobileOpen ? 'all' : 'none',
          transform: mobileOpen ? 'translateY(0)' : 'translateY(-8px)',
          transition: 'opacity 0.38s ease, transform 0.38s ease',
        }}
      >
        {[...NAV_LINKS, { label: 'Panier', to: '/cart' }].map(item => (
          <Link
            key={item.label}
            to={item.to}
            onClick={() => setMobileOpen(false)}
            style={{
              fontFamily: '"Archivo", sans-serif',
              fontWeight: 900,
              fontSize: '2rem',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: '#0A0A0A',
              textDecoration: 'none',
            }}
          >
            {item.label}
          </Link>
        ))}
        <div style={{ width: '32px', height: '1px', background: '#D9D8D5', margin: '4px 0' }} />
        <p
          style={{
            fontFamily: '"Archivo Narrow", sans-serif',
            fontSize: '0.52rem',
            textTransform: 'uppercase',
            letterSpacing: '0.3em',
            color: '#8C8C8C',
          }}
        >
          SPORTSWEAR · PREMIUM · 2026
        </p>
      </div>
    </>
  );
}
