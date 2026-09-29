import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';

const NAV_LINKS = [
  { label: 'Collection',     to: '/catalog' },
  { label: 'Nouveautés',     to: '/catalog?filter=new' },
  { label: 'Lookbook',       to: '/lookbook' },
  { label: 'Notre Histoire', to: '/notre-histoire' },
];

export default function Navbar({ cartCount = 0 }) {
  const [scrollState, setScrollState] = useState('top'); // 'top' | 'pill' | 'exited'
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [marqueOpen, setMarqueOpen] = useState(false);
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
          zIndex: 130,
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

          {/* ── Séparateur (desktop uniquement) ── */}
          <div
            className="hidden md:block"
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

            {/* ── LIEN LA MARQUE avec dropdown ── */}
            <div
              style={{ position: 'relative' }}
              onMouseEnter={() => setMarqueOpen(true)}
              onMouseLeave={() => setMarqueOpen(false)}
            >
              <button
                onClick={() => setMarqueOpen(!marqueOpen)}
                style={{
                  fontFamily: '"Archivo Narrow", "Archivo", sans-serif',
                  fontWeight: 600,
                  fontSize: isPill ? '0.54rem' : '0.58rem',
                  textTransform: 'uppercase',
                  letterSpacing: isPill ? '0.2em' : '0.22em',
                  color: '#3A3A3A',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'color 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#0A0A0A'}
                onMouseLeave={e => e.currentTarget.style.color = '#3A3A3A'}
              >
                La marque
                <svg
                  width="10"
                  height="6"
                  viewBox="0 0 10 6"
                  fill="none"
                  style={{
                    transform: marqueOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.25s ease',
                  }}
                >
                  <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {/* Dropdown La marque */}
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: '50%',
                  transform: marqueOpen ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(-8px)',
                  opacity: marqueOpen ? 1 : 0,
                  pointerEvents: marqueOpen ? 'all' : 'none',
                  transition: 'opacity 0.25s ease, transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  zIndex: 200,
                  paddingTop: '16px',
                }}
              >
                <div
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '4px',
                    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06)',
                    padding: '24px',
                    display: 'flex',
                    gap: '20px',
                    minWidth: '480px',
                  }}
                >
                  {/* Notre Histoire */}
                  <Link
                    to="/notre-histoire"
                    style={{
                      flex: 1,
                      textDecoration: 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        aspectRatio: '4 / 3',
                        background: 'linear-gradient(145deg, #E8E7E3 0%, #D5D4D0 100%)',
                        borderRadius: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                      }}
                    >
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#8C8C8C" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="16" x2="12" y2="12"/>
                        <line x1="12" y1="8" x2="12.01" y2="8"/>
                      </svg>
                    </div>
                    <span
                      style={{
                        fontFamily: '"Archivo Narrow", "Archivo", sans-serif',
                        fontWeight: 600,
                        fontSize: '0.65rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.2em',
                        color: '#0A0A0A',
                      }}
                    >
                      Notre Histoire
                    </span>
                  </Link>

                  {/* Blog */}
                  <Link
                    to="/blog"
                    style={{
                      flex: 1,
                      textDecoration: 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        aspectRatio: '4 / 3',
                        background: 'linear-gradient(145deg, #E8E7E3 0%, #D5D4D0 100%)',
                        borderRadius: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                      }}
                    >
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#8C8C8C" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                      </svg>
                    </div>
                    <span
                      style={{
                        fontFamily: '"Archivo Narrow", "Archivo", sans-serif',
                        fontWeight: 600,
                        fontSize: '0.65rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.2em',
                        color: '#0A0A0A',
                      }}
                    >
                      Blog
                    </span>
                  </Link>
                </div>
              </div>
            </div>
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

          {/* ── ICÔNES MOBILE (recherche / menu / panier) ── */}
          <div
            className="flex md:hidden"
            style={{
              marginLeft: 'auto',
              alignItems: 'center',
              gap: '20px',
              paddingRight: '8px',
            }}
          >
            {/* Icône recherche */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '6px',
                color: '#0A0A0A',
                display: 'flex',
                alignItems: 'center',
              }}
              aria-label="Rechercher"
            >
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </button>

            {/* Icône hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '6px',
                display: 'flex',
                alignItems: 'center',
              }}
              aria-label="Menu"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {mobileOpen ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </>
                ) : (
                  <>
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <line x1="3" y1="12" x2="21" y2="12"/>
                    <line x1="3" y1="18" x2="21" y2="18"/>
                  </>
                )}
              </svg>
            </button>

            {/* Icône panier */}
            <Link
              to="/cart"
              style={{
                position: 'relative',
                color: '#0A0A0A',
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
              }}
              aria-label="Panier"
            >
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"/>
                <circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              {cartCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-4px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '16px',
                    height: '16px',
                    borderRadius: '9999px',
                    background: '#0A0A0A',
                    color: '#F2F1EF',
                    fontSize: '9px',
                    fontWeight: 700,
                    padding: '0 3px',
                  }}
                >
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════════════════════
          BOTTOM NAVIGATION GLASSMORPHIQUE — style Instagram (≤768px)
          ══════════════════════════════════════════════════════════════ */}
      <nav
        className="flex md:hidden"
        style={{
          position: 'fixed',
          bottom: 'max(10px, env(safe-area-inset-bottom))',
          left: '12px',
          right: '12px',
          zIndex: 100,
          justifyContent: 'space-around',
          minHeight: '68px',
          padding: '7px 10px',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.72), rgba(242,241,239,0.48))',
          backdropFilter: 'blur(28px) saturate(180%)',
          WebkitBackdropFilter: 'blur(28px) saturate(180%)',
          borderRadius: '26px',
          border: '1px solid rgba(255, 255, 255, 0.78)',
          boxShadow: '0 14px 36px rgba(10, 10, 10, 0.18), 0 2px 8px rgba(10, 10, 10, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.92), inset 0 -1px 0 rgba(10, 10, 10, 0.05)',
        }}
      >
        {[
          { label: 'Accueil',    to: '/',        icon: 'home' },
          { label: 'Collection', to: '/catalog', icon: 'grid' },
          { label: 'Lookbook',   to: '/lookbook',icon: 'book' },
          { label: 'Panier',     to: '/cart',    icon: 'cart' },
        ].map(item => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.label}
              to={item.to}
              data-nav-item
              data-active={isActive}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                textDecoration: 'none',
                color: isActive ? '#0A0A0A' : '#8C8C8C',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.52rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                minWidth: '64px',
                minHeight: '52px',
                justifyContent: 'center',
                borderRadius: '18px',
                background: isActive ? 'rgba(255, 255, 255, 0.58)' : 'transparent',
                boxShadow: isActive ? 'inset 0 1px 0 rgba(255,255,255,0.82), 0 2px 8px rgba(10,10,10,0.06)' : 'none',
                transition: 'color 0.3s cubic-bezier(0.22, 1, 0.36, 1), transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), background 0.3s ease, box-shadow 0.3s ease',
                transform: isActive ? 'translateY(-1px)' : 'translateY(0)',
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill={isActive ? '#0A0A0A' : 'none'}
                stroke={isActive ? '#0A0A0A' : '#8C8C8C'}
                strokeWidth={isActive ? 2 : 1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ transition: 'fill 0.3s cubic-bezier(0.22, 1, 0.36, 1), stroke 0.3s cubic-bezier(0.22, 1, 0.36, 1)' }}
              >
                {item.icon === 'home' && <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>}
                {item.icon === 'grid' && <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></>}
                {item.icon === 'book' && <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></>}
                {item.icon === 'cart' && <><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></>}
              </svg>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* ══════════════════════════════════════════════
          BARRE DE RECHERCHE — mobile uniquement
          ════════════════════════════════════════════ */}
      <div
        className="md:hidden"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 110,
          background: 'rgba(242, 241, 239, 0.97)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
          padding: '16px 20px',
          display: 'block',
          alignItems: 'center',
          gap: '12px',
          opacity: searchOpen ? 1 : 0,
          pointerEvents: searchOpen ? 'all' : 'none',
          transform: searchOpen ? 'translateY(0)' : 'translateY(-100%)',
          transition: 'opacity 0.3s ease, transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8C8C8C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Rechercher un vêtement..."
          style={{
            flex: 1,
            border: 'none',
            background: 'none',
            outline: 'none',
            fontFamily: '"Archivo Narrow", sans-serif',
            fontSize: '0.95rem',
            color: '#0A0A0A',
            padding: '8px 0',
          }}
        />
        <button
          onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#8C8C8C',
            fontSize: '0.8rem',
            fontFamily: '"Archivo Narrow", sans-serif',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            padding: '6px',
          }}
        >
          Annuler
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          SIDEBAR MOBILE — style Gmail (≤768px)
          ══════════════════════════════════════════════════════════════ */}
      {/* Overlay assombri */}
      <div
        className="md:hidden"
        onClick={() => setMobileOpen(false)}
        style={{
          position: 'fixed',
          zIndex: 105,
          zIndex: 95,
          background: 'rgba(0, 0, 0, 0.4)',
          opacity: mobileOpen ? 1 : 0,
          pointerEvents: mobileOpen ? 'all' : 'none',
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* Panneau sidebar */}
      <div
        className="md:hidden"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 115,
          zIndex: 96,
          width: '280px',
          maxWidth: '85vw',
          background: '#F2F1EF',
          boxShadow: '4px 0 24px rgba(0, 0, 0, 0.12)',
          display: 'flex',
          flexDirection: 'column',
          transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.32s cubic-bezier(0.16, 1, 0.3, 1)',
          overflowY: 'auto',
        }}
      >
        {/* Header sidebar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
          }}
        >
          <img
            src="/logo.png"
            alt="UB Mindset"
            style={{ height: '32px', width: 'auto', mixBlendMode: 'multiply' }}
          />
          <button
            onClick={() => setMobileOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              color: '#0A0A0A',
              display: 'flex',
              alignItems: 'center',
            }}
            aria-label="Fermer le menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Liens de navigation */}
        <div style={{ flex: 1, padding: '8px 0' }}>
          {[
            { label: 'Collection',     to: '/catalog',          icon: 'grid' },
            { label: 'Nouveautés',     to: '/catalog?filter=new', icon: 'sparkle' },
            { label: 'Lookbook',       to: '/lookbook',         icon: 'book' },
            { label: 'Notre Histoire', to: '/notre-histoire',   icon: 'info' },
            { label: 'Blog',           to: '/blog',             icon: 'blog' },
            { label: 'Panier',         to: '/cart',             icon: 'cart' },
          ].map(item => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.label}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '12px 20px',
                  textDecoration: 'none',
                  fontFamily: '"Archivo Narrow", "Archivo", sans-serif',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: isActive ? '#0A0A0A' : '#3A3A3A',
                  background: isActive ? 'rgba(10, 10, 10, 0.04)' : 'transparent',
                  borderLeft: isActive ? '3px solid #0A0A0A' : '3px solid transparent',
                  transition: 'background 0.2s ease, color 0.2s ease',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={isActive ? '#0A0A0A' : '#3A3A3A'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  {item.icon === 'grid' && <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></>}
                  {item.icon === 'sparkle' && <><path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z"/></>}
                  {item.icon === 'book' && <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></>}
                  {item.icon === 'info' && <><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></>}
                  {item.icon === 'blog' && <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></>}
                  {item.icon === 'cart' && <><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></>}
                </svg>
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Footer sidebar — Connexion/Inscription */}
        <div
          style={{
            padding: '16px 20px',
            borderTop: '1px solid rgba(0, 0, 0, 0.06)',
          }}
        >
          <button
            onClick={() => { setMobileOpen(false); setAuthMode('login'); setAuthOpen(true); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              padding: '12px 16px',
              background: '#0A0A0A',
              color: '#F2F1EF',
              border: 'none',
              borderRadius: '2px',
              cursor: 'pointer',
              fontFamily: '"Archivo Narrow", "Archivo", sans-serif',
              fontWeight: 700,
              fontSize: '0.75rem',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              justifyContent: 'center',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F2F1EF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            Connexion / Inscription
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          MODAL CONNEXION / INSCRIPTION — mobile uniquement
          ══════════════════════════════════════════════════════════════ */}
      <div
        className="md:hidden"
        style={{
          position: 'fixed',
          zIndex: 140,
          zIndex: 120,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          opacity: authOpen ? 1 : 0,
          pointerEvents: authOpen ? 'all' : 'none',
          transition: 'opacity 0.3s ease',
        }}
        onClick={() => setAuthOpen(false)}
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: '400px',
            maxHeight: '90vh',
            overflowY: 'auto',
            background: '#FFFFFF',
            borderRadius: '8px',
            boxShadow: '0 24px 64px rgba(0, 0, 0, 0.2)',
            transform: authOpen ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.96)',
            transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Header modal */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '20px 24px 0',
            }}
          >
            <div style={{ display: 'flex', gap: '4px' }}>
              {['login', 'register'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setAuthMode(mode)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '8px 16px',
                    fontFamily: '"Archivo Narrow", "Archivo", sans-serif',
                    fontWeight: 700,
                    fontSize: '0.72rem',
                    letterSpacing: '0.22em',
                    textTransform: 'uppercase',
                    color: authMode === mode ? '#0A0A0A' : '#8C8C8C',
                    borderBottom: authMode === mode ? '2px solid #0A0A0A' : '2px solid transparent',
                    transition: 'color 0.2s ease, border-color 0.2s ease',
                  }}
                >
                  {mode === 'login' ? 'Connexion' : 'Inscription'}
                </button>
              ))}
            </div>
            <button
              onClick={() => setAuthOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '6px',
                color: '#8C8C8C',
                display: 'flex',
                alignItems: 'center',
              }}
              aria-label="Fermer"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8C8C8C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Corps du formulaire */}
          <div style={{ padding: '24px' }}>
            <h2
              style={{
                fontFamily: '"Archivo", sans-serif',
                fontWeight: 900,
                fontSize: '1.4rem',
                textTransform: 'uppercase',
                letterSpacing: '0.02em',
                color: '#0A0A0A',
                marginBottom: '4px',
              }}
            >
              {authMode === 'login' ? 'Bon retour' : 'Créer un compte'}
            </h2>
            <p
              style={{
                fontFamily: '"Archivo Narrow", sans-serif',
                fontSize: '0.72rem',
                color: '#8C8C8C',
                marginBottom: '24px',
              }}
            >
              {authMode === 'login'
                ? 'Connectez-vous pour accéder à votre compte.'
                : 'Rejoignez UB Mindset en quelques secondes.'}
            </p>

            <form
              onSubmit={e => { e.preventDefault(); setAuthOpen(false); }}
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              {authMode === 'register' && (
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontFamily: '"Archivo Narrow", sans-serif',
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.2em',
                      color: '#3A3A3A',
                      marginBottom: '6px',
                    }}
                  >
                    Nom complet
                  </label>
                  <input
                    type="text"
                    placeholder="Votre nom"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      border: '1px solid #D9D8D5',
                      borderRadius: '2px',
                      fontFamily: '"Archivo Narrow", sans-serif',
                      fontSize: '0.85rem',
                      color: '#0A0A0A',
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.2s ease',
                    }}
                  />
                </div>
              )}

              <div>
                <label
                  style={{
                    display: 'block',
                    fontFamily: '"Archivo Narrow", sans-serif',
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.2em',
                    color: '#3A3A3A',
                    marginBottom: '6px',
                  }}
                >
                  Adresse email
                </label>
                <input
                  type="email"
                  placeholder="vous@exemple.com"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    border: '1px solid #D9D8D5',
                    borderRadius: '2px',
                    fontFamily: '"Archivo Narrow", sans-serif',
                    fontSize: '0.85rem',
                    color: '#0A0A0A',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s ease',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontFamily: '"Archivo Narrow", sans-serif',
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.2em',
                    color: '#3A3A3A',
                    marginBottom: '6px',
                  }}
                >
                  Mot de passe
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    border: '1px solid #D9D8D5',
                    borderRadius: '2px',
                    fontFamily: '"Archivo Narrow", sans-serif',
                    fontSize: '0.85rem',
                    color: '#0A0A0A',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s ease',
                  }}
                />
              </div>

              {authMode === 'login' && (
                <div style={{ textAlign: 'right' }}>
                  <button
                    type="button"
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontFamily: '"Archivo Narrow", sans-serif',
                      fontSize: '0.68rem',
                      color: '#8C8C8C',
                      textDecoration: 'underline',
                    }}
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
              )}

              <button
                type="submit"
                style={{
                  padding: '14px',
                  background: '#0A0A0A',
                  color: '#F2F1EF',
                  border: 'none',
                  borderRadius: '2px',
                  cursor: 'pointer',
                  fontFamily: '"Archivo Narrow", "Archivo", sans-serif',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  letterSpacing: '0.25em',
                  textTransform: 'uppercase',
                  marginTop: '4px',
                  transition: 'background 0.2s ease',
                }}
              >
                {authMode === 'login' ? 'Se connecter' : 'Créer mon compte'}
              </button>
            </form>

            <div
              style={{
                marginTop: '20px',
                textAlign: 'center',
                fontFamily: '"Archivo Narrow", sans-serif',
                fontSize: '0.62rem',
                textTransform: 'uppercase',
                letterSpacing: '0.25em',
                color: '#C4C3C0',
              }}
            >
              SPORTSWEAR · MINDSET · PREMIUM
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
