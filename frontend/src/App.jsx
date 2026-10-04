import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Blog from './pages/Blog';
import Lookbook from './pages/Lookbook';
import OurStory from './pages/OurStory';
import Catalog from './pages/Catalog';
import { useCart } from './context/CartContext';

const TryOn = lazy(() => import('./pages/TryOn'));
const Cart = lazy(() => import('./pages/Cart'));
const StudioFallback = () => <main style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', background: '#f2ede4', color: '#171717' }}><p className="ub-label">PRÉPARATION DU STUDIO…</p></main>;

// Admin
import { AdminAuthProvider } from './context/AdminAuthContext';
import AdminRoute from './admin/AdminRoute';
import AdminLayout from './admin/AdminLayout';
import AdminLogin from './admin/pages/AdminLogin';
import AdminDashboard from './admin/pages/AdminDashboard';
import AdminOrders from './admin/pages/AdminOrders';
import AdminProducts from './admin/pages/AdminProducts';
import AdminCategories from './admin/pages/AdminCategories';
import AdminStock from './admin/pages/AdminStock';
import AdminCustomers from './admin/pages/AdminCustomers';
import AdminPromotions from './admin/pages/AdminPromotions';
import AdminShipping from './admin/pages/AdminShipping';
import AdminSettings from './admin/pages/AdminSettings';

const ComingSoon = ({ label }) => (
  <div style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <p className="ub-label" style={{ color: '#3A3A3A', letterSpacing: '0.4em', fontSize: '0.65rem' }}>
      {label} — À VENIR
    </p>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <Routes>
          {/* ── Admin ── */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="stock" element={<AdminStock />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="promotions" element={<AdminPromotions />} />
            <Route path="shipping" element={<AdminShipping />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* ── Storefront ── */}
          <Route path="/*" element={<Storefront />} />
        </Routes>
      </AdminAuthProvider>
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
        <Route path="/blog"      element={<Blog />} />
        <Route path="/catalog"   element={<Catalog />} />
        <Route path="/lookbook"  element={<Lookbook />} />
        <Route path="/notre-histoire" element={<OurStory />} />
        <Route path="/about"     element={<OurStory />} />
        <Route path="/cart"      element={<Suspense fallback={<StudioFallback />}><Cart /></Suspense>} />
        <Route path="/checkout"  element={<ComingSoon label="COMMANDE" />} />
        <Route path="/essayage"  element={<Suspense fallback={<StudioFallback />}><TryOn /></Suspense>} />
      </Routes>
      {!isTryOn && <Footer />}
    </>
  );
}
