import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import TryOn from './pages/TryOn';
import Lookbook from './pages/Lookbook';
import { useCart } from './context/CartContext';

// Pages à construire dans les prochaines étapes
const ComingSoon = ({ label }) => (
  <div
    style={{
      minHeight: '100vh',
      background: '#0A0A0A',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <p
      className="ub-label"
      style={{ color: '#3A3A3A', letterSpacing: '0.4em', fontSize: '0.65rem' }}
    >
      {label} — À VENIR
    </p>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Storefront />
    </BrowserRouter>
  );
}

function Storefront() {
  const { cartCount } = useCart();
  const location = useLocation();
  const isTryOn = location.pathname === '/essayage';

  return (
    <>
      {!isTryOn && <Navbar cartCount={cartCount} />}

      <Routes>
        <Route path="/"          element={<Home />} />
        <Route path="/catalog"   element={<ComingSoon label="CATALOGUE" />} />
        <Route path="/lookbook"  element={<Lookbook />} />
        <Route path="/about"     element={<ComingSoon label="NOTRE HISTOIRE" />} />
        <Route path="/cart"      element={<ComingSoon label="PANIER" />} />
        <Route path="/checkout"  element={<ComingSoon label="COMMANDE" />} />
        <Route path="/product/:id" element={<ComingSoon label="PRODUIT" />} />
        <Route path="/essayage" element={<TryOn />} />
      </Routes>
    </>
  );
}
