import React from 'react';
import Hero from '../components/Hero';
import Marquee from '../components/Marquee';
import NewArrivals from '../components/NewArrivals';
import Collection from '../components/Collection';

export default function Home() {
  return (
    <main style={{ background: '#F2F1EF', position: 'relative' }}>
      {/* ── HERO SECTION EN POSITION STICKY (TOP: 0, Z-INDEX: 1) ── */}
      <Hero />

      {/* ── BANDE DÉFILANTE ── */}
      <Marquee />

      {/* ── NOUVEAUTÉS ── */}
      <NewArrivals />

      {/* ── COLLECTION ── */}
      <Collection />
    </main>
  );
}
