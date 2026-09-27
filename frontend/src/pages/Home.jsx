import React from 'react';
import Hero from '../components/Hero';

export default function Home() {
  return (
    <main style={{ background: '#F2F1EF', position: 'relative' }}>
      {/* ── HERO SECTION EN POSITION STICKY (TOP: 0, Z-INDEX: 1) ── */}
      <Hero />


    </main>
  );
}
